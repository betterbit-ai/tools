/** Browser-only U²-NetP inference. Never import this module from server code. */
import { yieldToBrowser } from '../../lib/browser';
import { MODEL_INPUT_SIZE, normaliseMask } from './logic';

const MODEL_URL = '/models/u2netp.onnx';

export interface RemovalProgress {
  phase: 'reading' | 'model' | 'runtime' | 'processing' | 'rendering' | 'encoding';
  completed: number;
  total: number;
  engine?: RemovalEngine;
}

export type RemovalEngine = 'webgpu' | 'wasm';

export interface RemovalResult {
  blob: Blob;
  engine: RemovalEngine;
}

export interface RemovalOptions {
  signal?: AbortSignal;
  onProgress?: (progress: RemovalProgress) => void;
}

function cancelled(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

async function fetchModel(signal: AbortSignal | undefined, onProgress?: RemovalOptions['onProgress']) {
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

function pixelsToTensor(pixels: ImageData) {
  const area = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE;
  const data = new Float32Array(area * 3);
  for (let pixel = 0; pixel < area; pixel++) {
    const source = pixel * 4;
    data[pixel] = (pixels.data[source] / 255 - 0.485) / 0.229;
    data[area + pixel] = (pixels.data[source + 1] / 255 - 0.456) / 0.224;
    data[area * 2 + pixel] = (pixels.data[source + 2] / 255 - 0.406) / 0.225;
  }
  return data;
}

function maskCanvas(mask: Uint8ClampedArray) {
  const canvas = makeCanvas(MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  const pixels = new ImageData(MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  for (let pixel = 0; pixel < mask.length; pixel++) {
    const index = pixel * 4;
    pixels.data[index] = 255;
    pixels.data[index + 1] = 255;
    pixels.data[index + 2] = 255;
    pixels.data[index + 3] = mask[pixel];
  }
  canvas.getContext('2d')!.putImageData(pixels, 0, 0);
  return canvas;
}

function toPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the PNG.'))), 'image/png'),
  );
}

/**
 * Loads the self-hosted model only when a removal starts. The model sees a
 * 320×320 copy for efficient segmentation; its mask is then smoothly scaled
 * over the untouched source pixels, so the PNG keeps the original dimensions.
 */
export async function removeBackground(file: File, options: RemovalOptions = {}): Promise<RemovalResult> {
  const { signal, onProgress } = options;
  cancelled(signal);
  onProgress?.({ phase: 'reading', completed: 0, total: 1 });
  await yieldToBrowser();
  cancelled(signal);
  const bitmap = await createImageBitmap(file);
  try {
    cancelled(signal);
    const input = makeCanvas(MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
    const inputContext = input.getContext('2d', { willReadFrequently: true })!;
    inputContext.drawImage(bitmap, 0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
    const tensorData = pixelsToTensor(inputContext.getImageData(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE));

    const model = await fetchModel(signal, onProgress);
    cancelled(signal);
    onProgress?.({ phase: 'runtime', completed: 0, total: 1 });
    await yieldToBrowser();
    cancelled(signal);

    // Code split: ONNX Runtime itself is fetched only after a user starts a job. The default
    // JSEP build matches the self-hosted runtime files and supports both explicit providers.
    const ort = await import('onnxruntime-web');
    ort.env.wasm.wasmPaths = {
      mjs: '/ort/ort-wasm-simd-threaded.jsep.mjs',
      wasm: '/ort/ort-wasm-simd-threaded.jsep.wasm',
    };

    const tensor = new ort.Tensor('float32', tensorData, [1, 3, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]);
    const run = async (engine: RemovalEngine) => {
      const session = await ort.InferenceSession.create(model, { executionProviders: [engine] });
      try {
        cancelled(signal);
        onProgress?.({ phase: 'processing', completed: 0, total: 1, engine });
        const output = await session.run({ [session.inputNames[0]]: tensor });
        cancelled(signal);
        return { data: output[session.outputNames[0]].data as Float32Array, engine };
      } finally {
        await session.release();
      }
    };

    let inference: { data: Float32Array; engine: RemovalEngine };
    try {
      if (!('gpu' in navigator)) throw new Error('WebGPU unavailable');
      inference = await run('webgpu');
    } catch (cause) {
      if (signal?.aborted) throw cause;
      onProgress?.({ phase: 'runtime', completed: 0, total: 1, engine: 'wasm' });
      await yieldToBrowser();
      cancelled(signal);
      inference = await run('wasm');
    }

    if (inference.data.length !== MODEL_INPUT_SIZE * MODEL_INPUT_SIZE) {
      throw new Error('Unexpected AI mask shape.');
    }
    const mask = maskCanvas(normaliseMask(inference.data));
    onProgress?.({ phase: 'rendering', completed: 0, total: 1, engine: inference.engine });
    await yieldToBrowser();
    cancelled(signal);
    const result = makeCanvas(bitmap.width, bitmap.height);
    const context = result.getContext('2d')!;
    context.drawImage(bitmap, 0, 0);
    context.globalCompositeOperation = 'destination-in';
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(mask, 0, 0, bitmap.width, bitmap.height);
    context.globalCompositeOperation = 'source-over';
    onProgress?.({ phase: 'encoding', completed: 0, total: 1, engine: inference.engine });
    await yieldToBrowser();
    cancelled(signal);
    const blob = await toPng(result);
    cancelled(signal);
    return { blob, engine: inference.engine };
  } finally {
    bitmap.close();
  }
}
