/** Browser-only U²-NetP inference. Never import this module from server code. */
import { MODEL_INPUT_SIZE, normaliseMask } from './logic';

const MODEL_URL = '/models/u2netp.onnx';

export interface RemovalProgress {
  phase: 'model' | 'processing';
  completed: number;
  total: number;
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
export async function removeBackground(file: File, options: RemovalOptions = {}): Promise<Blob> {
  const { signal, onProgress } = options;
  cancelled(signal);
  const bitmap = await createImageBitmap(file);
  try {
    const input = makeCanvas(MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
    const inputContext = input.getContext('2d', { willReadFrequently: true })!;
    inputContext.drawImage(bitmap, 0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
    const tensorData = pixelsToTensor(inputContext.getImageData(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE));

    const model = await fetchModel(signal, onProgress);
    cancelled(signal);
    onProgress?.({ phase: 'processing', completed: 0, total: 1 });

    // Code split: ONNX Runtime itself is fetched only after a user starts a job.
    const ort = await import('onnxruntime-web');
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
      cancelled(signal);
      const inputName = session.inputNames[0];
      const outputName = session.outputNames[0];
      const output = await session.run({
        [inputName]: new ort.Tensor('float32', tensorData, [1, 3, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]),
      });
      cancelled(signal);
      const maskData = output[outputName].data as Float32Array;
      if (maskData.length !== MODEL_INPUT_SIZE * MODEL_INPUT_SIZE) throw new Error('Unexpected AI mask shape.');
      const mask = maskCanvas(normaliseMask(maskData));
      const result = makeCanvas(bitmap.width, bitmap.height);
      const context = result.getContext('2d')!;
      context.drawImage(bitmap, 0, 0);
      context.globalCompositeOperation = 'destination-in';
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(mask, 0, 0, bitmap.width, bitmap.height);
      context.globalCompositeOperation = 'source-over';
      onProgress?.({ phase: 'processing', completed: 1, total: 1 });
      return await toPng(result);
    } finally {
      await session.release();
    }
  } finally {
    bitmap.close();
  }
}
