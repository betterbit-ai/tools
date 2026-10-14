/** Browser-only Real-ESRGAN inference. Never import this module from server code. */
import {
  MODEL_INPUT_SIZE,
  MODEL_SCALE,
  imageDimensionsFromHeader,
  makeTileGrid,
  outputDimensions,
  stitchRect,
  type Scale,
  type Tile,
} from './logic';

const MODEL_URL = '/models/realesr-general-x4v3.onnx';
const MAX_HEADER_BYTES = 256 * 1024;

export interface UpscaleProgress {
  phase: 'model' | 'tiles';
  completed: number;
  total: number;
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

/** Let cancellation and progress paint before processing the next tile. */
function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
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

function drawPaddedTile(source: HTMLCanvasElement, tile: Tile) {
  const canvas = makeCanvas(MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(
    source,
    tile.inputX,
    tile.inputY,
    tile.inputWidth,
    tile.inputHeight,
    0,
    0,
    tile.inputWidth,
    tile.inputHeight,
  );
  // Real-ESRGAN was exported with a fixed 128×128 input. Repeat edge pixels
  // rather than stretching the image when an edge tile is smaller.
  if (tile.inputWidth < MODEL_INPUT_SIZE) {
    ctx.drawImage(
      canvas,
      tile.inputWidth - 1,
      0,
      1,
      tile.inputHeight,
      tile.inputWidth,
      0,
      MODEL_INPUT_SIZE - tile.inputWidth,
      tile.inputHeight,
    );
  }
  if (tile.inputHeight < MODEL_INPUT_SIZE) {
    ctx.drawImage(
      canvas,
      0,
      tile.inputHeight - 1,
      MODEL_INPUT_SIZE,
      1,
      0,
      tile.inputHeight,
      MODEL_INPUT_SIZE,
      MODEL_INPUT_SIZE - tile.inputHeight,
    );
  }
  return ctx.getImageData(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
}

function pixelsToTensor(pixels: ImageData) {
  const area = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE;
  const data = new Float32Array(area * 3);
  for (let pixel = 0; pixel < area; pixel++) {
    const source = pixel * 4;
    data[pixel] = pixels.data[source] / 255;
    data[area + pixel] = pixels.data[source + 1] / 255;
    data[area * 2 + pixel] = pixels.data[source + 2] / 255;
  }
  return data;
}

function tensorToImageData(data: Float32Array) {
  const size = MODEL_INPUT_SIZE * MODEL_SCALE;
  const area = size * size;
  const pixels = new ImageData(size, size);
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
    const source = makeCanvas(bitmap.width, bitmap.height);
    source.getContext('2d')!.drawImage(bitmap, 0, 0);
    const tiles = makeTileGrid(bitmap.width, bitmap.height);
    const model = await fetchModel(signal, onProgress);
    cancelled(signal);

    // This code split keeps the normal page bundle small. The runtime's WebGPU
    // execution provider is preferred; ONNX Runtime falls back to WebAssembly.
    const ort = await import('onnxruntime-web/webgpu');
    ort.env.wasm.wasmPaths = {
      mjs: '/ort/ort-wasm-simd-threaded.jsep.mjs',
      wasm: '/ort/ort-wasm-simd-threaded.jsep.wasm',
    };
    const session = await (async () => {
      try {
        return await ort.InferenceSession.create(model, { executionProviders: ['webgpu', 'wasm'] });
      } catch {
        return ort.InferenceSession.create(model, { executionProviders: ['wasm'] });
      }
    })();

    try {
      const modelOutput = outputDimensions(bitmap.width, bitmap.height, MODEL_SCALE);
      const enlarged = makeCanvas(modelOutput.width, modelOutput.height);
      const enlargedCtx = enlarged.getContext('2d')!;
      const tileCanvas = makeCanvas(MODEL_INPUT_SIZE * MODEL_SCALE, MODEL_INPUT_SIZE * MODEL_SCALE);
      const tileCtx = tileCanvas.getContext('2d')!;

      for (let index = 0; index < tiles.length; index++) {
        cancelled(signal);
        const tensor = new ort.Tensor(
          'float32',
          pixelsToTensor(drawPaddedTile(source, tiles[index])),
          [1, 3, 128, 128],
        );
        const outputs = await session.run({ image: tensor });
        const output = outputs.upscaled_image.data as Float32Array;
        tileCtx.putImageData(tensorToImageData(output), 0, 0);
        const rect = stitchRect(tiles[index]);
        enlargedCtx.drawImage(
          tileCanvas,
          rect.sourceX,
          rect.sourceY,
          rect.sourceWidth,
          rect.sourceHeight,
          rect.destinationX,
          rect.destinationY,
          rect.destinationWidth,
          rect.destinationHeight,
        );
        onProgress?.({ phase: 'tiles', completed: index + 1, total: tiles.length });
        await yieldToBrowser();
      }
      cancelled(signal);

      // The model is RGB. Apply separately-resampled alpha after inference so
      // transparent PNG/WebP pixels stay transparent instead of being flattened.
      enlargedCtx.globalCompositeOperation = 'destination-in';
      enlargedCtx.drawImage(source, 0, 0, modelOutput.width, modelOutput.height);
      enlargedCtx.globalCompositeOperation = 'source-over';

      const output = scale === MODEL_SCALE ? enlarged : makeCanvas(bitmap.width * scale, bitmap.height * scale);
      if (scale !== MODEL_SCALE) {
        const ctx = output.getContext('2d')!;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(enlarged, 0, 0, output.width, output.height);
      }
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
