/** Browser-only Real-ESRGAN inference. Never import this module from server code. */
import { yieldToBrowser } from '../../lib/browser';
import {
  MODEL_SCALE,
  TILE_SIZE,
  encodedMimeMatches,
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

export class UpscaleError extends Error {
  constructor(
    public readonly code: 'model' | 'format' | 'runtime',
    message: string,
  ) {
    super(message);
    this.name = 'UpscaleError';
  }
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
  try {
    const response = await fetch(MODEL_URL, { signal });
    if (!response.ok || !response.body) throw new Error(`Model request returned ${response.status}.`);
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
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new UpscaleError('model', 'Could not load the local AI model.');
  }
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

type WorkerResponse =
  | { type: 'ready'; engine: 'gpu' | 'cpu' }
  | { type: 'result'; pixels: ArrayBuffer; width: number; height: number }
  | { type: 'error'; stage: 'runtime' | 'process'; message: string };

interface InferenceWorker {
  engine: 'gpu' | 'cpu';
  run(pixels: ImageData): Promise<ImageData>;
  dispose(): void;
}

function abortError() {
  return new DOMException('Cancelled', 'AbortError');
}

/** Starts the model in a disposable worker so CPU fallback never freezes the page. */
async function createInferenceWorker(model: Uint8Array, signal?: AbortSignal): Promise<InferenceWorker> {
  const worker = new Worker(new URL('./upscale.worker.ts', import.meta.url), { type: 'module' });
  let ready = false;
  let readyResolve: ((engine: 'gpu' | 'cpu') => void) | null = null;
  let readyReject: ((cause: unknown) => void) | null = null;
  let active: { resolve: (pixels: ImageData) => void; reject: (cause: unknown) => void } | null = null;
  let disposed = false;

  const terminate = (cause?: unknown) => {
    if (disposed) return;
    disposed = true;
    signal?.removeEventListener('abort', onAbort);
    worker.terminate();
    if (!ready) readyReject?.(cause ?? new UpscaleError('runtime', 'AI runtime stopped.'));
    active?.reject(cause ?? new UpscaleError('runtime', 'AI runtime stopped.'));
    active = null;
  };
  const onAbort = () => terminate(abortError());
  signal?.addEventListener('abort', onAbort, { once: true });

  const readyPromise = new Promise<'gpu' | 'cpu'>((resolve, reject) => {
    readyResolve = resolve;
    readyReject = reject;
  });
  worker.addEventListener('message', ({ data }: MessageEvent<WorkerResponse>) => {
    if (data.type === 'ready') {
      ready = true;
      readyResolve?.(data.engine);
      return;
    }
    if (data.type === 'result') {
      const pending = active;
      active = null;
      pending?.resolve(new ImageData(new Uint8ClampedArray(data.pixels), data.width, data.height));
      return;
    }
    const error = new UpscaleError('runtime', data.message);
    if (!ready) terminate(error);
    else {
      active?.reject(error);
      active = null;
    }
  });
  worker.addEventListener('error', () => terminate(new UpscaleError('runtime', 'AI worker failed.')));

  if (signal?.aborted) {
    terminate(abortError());
  } else {
    const bytes = model.buffer as ArrayBuffer;
    worker.postMessage({ type: 'init', model: bytes }, [bytes]);
  }

  const engine = await readyPromise;
  return {
    engine,
    run(pixels) {
      if (disposed || signal?.aborted) return Promise.reject(abortError());
      if (active) return Promise.reject(new UpscaleError('runtime', 'AI worker is already busy.'));
      return new Promise<ImageData>((resolve, reject) => {
        active = { resolve, reject };
        const bytes = pixels.data.buffer as ArrayBuffer;
        worker.postMessage({ type: 'run', pixels: bytes, width: pixels.width, height: pixels.height }, [bytes]);
      });
    },
    dispose: () => terminate(),
  };
}

async function toBlob(canvas: HTMLCanvasElement, mime: string) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => {
        if (!blob || !encodedMimeMatches(mime, blob.type)) {
          reject(
            new UpscaleError(
              'format',
              `The browser returned ${blob?.type || 'no image'} instead of the requested ${mime}.`,
            ),
          );
          return;
        }
        resolve(blob);
      },
      mime,
      0.92,
    ),
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

    // The worker is loaded only after Start, keeping ONNX Runtime out of the normal page bundle.
    // Its default JSEP build matches the self-hosted public/ort/*.jsep files; the dedicated
    // WebGPU build needs a 27 MB asyncify asset that exceeds Cloudflare's 25 MiB asset limit.
    const inference = await createInferenceWorker(model, signal);
    const engine = inference.engine;

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
        const upscaled = await inference.run(readTile(sourceCtx, tile));
        cancelled(signal);
        tileCtx.putImageData(upscaled, 0, 0);
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
      inference.dispose();
    }
  } finally {
    bitmap.close();
  }
}
