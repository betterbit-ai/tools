/** Browser-only Real-ESRGAN inference. Never import this module from server code. */
import { yieldToBrowser } from '../../lib/browser';
import {
  MODEL_SCALE,
  TILE_SIZE,
  imageDimensionsFromHeader,
  makeTileGrid,
  stitchRect,
  workDimensions,
  type Scale,
  type Tile,
} from './logic';

// Same weights as upstream realesr-general-x4v3, re-exported with dynamic height/width.
const MODEL_URL = '/models/realesr-general-x4v3-dyn.onnx';
const MAX_HEADER_BYTES = 256 * 1024;

export interface UpscaleProgress {
  phase: 'model' | 'tiles';
  completed: number;
  total: number;
  /** Which engine runs the model; set once tiles start. */
  engine?: 'gpu' | 'cpu';
  /** Milliseconds spent on tiles so far. */
  elapsedMs?: number;
}

export interface UpscaleOptions {
  scale: Scale;
  mime: string;
  signal?: AbortSignal;
  onProgress?: (progress: UpscaleProgress) => void;
}

function cancelled(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
}

/** Reads only a small file header so oversized decoded images can be rejected before decoding. */
export async function readImageDimensions(file: File) {
  const header = new Uint8Array(await file.slice(0, MAX_HEADER_BYTES).arrayBuffer());
  const dimensions = imageDimensionsFromHeader(header);
  if (!dimensions) throw new Error('Unsupported or invalid image header.');
  return dimensions;
}

async function fetchModel(signal: AbortSignal | undefined, onProgress?: UpscaleOptions['onProgress']) {
  const response = await fetch(MODEL_URL, { signal });
  if (!response.ok || !response.body) throw new Error('Could not load the local AI model.');
  const total = Number(response.headers.get('content-length')) || 0;
  const reader = response.body.getReader();
  const parts: Uint8Array[] = [];
  let completed = 0;
  while (true) {
    cancelled(signal);
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      parts.push(value);
      completed += value.length;
      onProgress?.({ phase: 'model', completed, total });
    }
  }
  const model = new Uint8Array(completed);
  let offset = 0;
  for (const part of parts) {
    model.set(part, offset);
    offset += part.length;
  }
  return model;
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function readTile(source: CanvasRenderingContext2D, tile: Tile) {
  return source.getImageData(tile.inputX, tile.inputY, tile.inputWidth, tile.inputHeight);
}

function pixelsToTensor(pixels: ImageData) {
  const area = pixels.width * pixels.height;
  const data = new Float32Array(area * 3);
  for (let pixel = 0; pixel < area; pixel++) {
    const source = pixel * 4;
    data[pixel] = pixels.data[source] / 255;
    data[area + pixel] = pixels.data[source + 1] / 255;
    data[area * 2 + pixel] = pixels.data[source + 2] / 255;
  }
  return data;
}

function tensorToImageData(data: Float32Array, width: number, height: number) {
  const area = width * height;
  const pixels = new ImageData(width, height);
  for (let pixel = 0; pixel < area; pixel++) {
    const destination = pixel * 4;
    pixels.data[destination] = Math.round(Math.min(1, Math.max(0, data[pixel])) * 255);
    pixels.data[destination + 1] = Math.round(Math.min(1, Math.max(0, data[area + pixel])) * 255);
    pixels.data[destination + 2] = Math.round(Math.min(1, Math.max(0, data[area * 2 + pixel])) * 255);
    pixels.data[destination + 3] = 255;
  }
  return pixels;
}

async function toBlob(canvas: HTMLCanvasElement, mime: string) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the image.'))), mime, 0.92),
  );
}

/** Loads ONNX Runtime only after an image has been chosen and processing begins. */
export async function upscaleImage(
  file: File,
  options: UpscaleOptions,
): Promise<{ blob: Blob; width: number; height: number }> {
  const { scale, mime, signal, onProgress } = options;
  cancelled(signal);
  const bitmap = await createImageBitmap(file);
  try {
    // Large photos are reduced first so the AI runs on at most MAX_WORK_PIXELS.
    const work = workDimensions(bitmap.width, bitmap.height, scale);
    const source = makeCanvas(work.width, work.height);
    const sourceCtx = source.getContext('2d', { willReadFrequently: true })!;
    sourceCtx.imageSmoothingQuality = 'high';
    sourceCtx.drawImage(bitmap, 0, 0, work.width, work.height);
    const tiles = makeTileGrid(work.width, work.height);
    const model = await fetchModel(signal, onProgress);
    cancelled(signal);

    // This code split keeps the normal page bundle small. Use the default (JSEP) build: it
    // matches the self-hosted public/ort/*.jsep files. 'onnxruntime-web/webgpu' needs the
    // asyncify build (27 MB, over Cloudflare's 25 MiB asset limit) and silently fell back to CPU.
    const ort = await import('onnxruntime-web');
    ort.env.wasm.wasmPaths = {
      mjs: '/ort/ort-wasm-simd-threaded.jsep.mjs',
      wasm: '/ort/ort-wasm-simd-threaded.jsep.wasm',
    };
    let engine: 'gpu' | 'cpu' = 'gpu';
    const session = await (async () => {
      try {
        if (!('gpu' in navigator)) throw new Error('WebGPU unavailable');
        return await ort.InferenceSession.create(model, { executionProviders: ['webgpu'] });
      } catch {
        engine = 'cpu';
        return ort.InferenceSession.create(model, { executionProviders: ['wasm'] });
      }
    })();

    try {
      // Each tile comes out at 4×; for 2× it is drawn at half size straight into the output, so a
      // full 4× canvas (4× the memory) is never allocated.
      const output = makeCanvas(work.width * scale, work.height * scale);
      const outputCtx = output.getContext('2d')!;
      outputCtx.imageSmoothingQuality = 'high';
      const ratio = scale / MODEL_SCALE;
      const tileCanvas = makeCanvas(TILE_SIZE * MODEL_SCALE, TILE_SIZE * MODEL_SCALE);
      const tileCtx = tileCanvas.getContext('2d')!;
      const tilesStarted = performance.now();
      onProgress?.({ phase: 'tiles', completed: 0, total: tiles.length, engine, elapsedMs: 0 });

      for (let index = 0; index < tiles.length; index++) {
        cancelled(signal);
        const tile = tiles[index];
        const tensor = new ort.Tensor('float32', pixelsToTensor(readTile(sourceCtx, tile)), [
          1,
          3,
          tile.inputHeight,
          tile.inputWidth,
        ]);
        const outputs = await session.run({ image: tensor });
        const output = outputs.upscaled_image.data as Float32Array;
        tileCtx.putImageData(
          tensorToImageData(output, tile.inputWidth * MODEL_SCALE, tile.inputHeight * MODEL_SCALE),
          0,
          0,
        );
        const rect = stitchRect(tile);
        outputCtx.drawImage(
          tileCanvas,
          rect.sourceX,
          rect.sourceY,
          rect.sourceWidth,
          rect.sourceHeight,
          rect.destinationX * ratio,
          rect.destinationY * ratio,
          rect.destinationWidth * ratio,
          rect.destinationHeight * ratio,
        );
        onProgress?.({
          phase: 'tiles',
          completed: index + 1,
          total: tiles.length,
          engine,
          elapsedMs: performance.now() - tilesStarted,
        });
        await yieldToBrowser();
      }
      cancelled(signal);

      // The model is RGB. Apply separately-resampled alpha after inference so
      // transparent PNG/WebP pixels stay transparent instead of being flattened.
      outputCtx.globalCompositeOperation = 'destination-in';
      outputCtx.drawImage(source, 0, 0, output.width, output.height);
      outputCtx.globalCompositeOperation = 'source-over';
      if (mime === 'image/jpeg') {
        const opaque = makeCanvas(output.width, output.height);
        const ctx = opaque.getContext('2d')!;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, opaque.width, opaque.height);
        ctx.drawImage(output, 0, 0);
        return { blob: await toBlob(opaque, mime), width: opaque.width, height: opaque.height };
      }
      return { blob: await toBlob(output, mime), width: output.width, height: output.height };
    } finally {
      await session.release();
    }
  } finally {
    bitmap.close();
  }
}
