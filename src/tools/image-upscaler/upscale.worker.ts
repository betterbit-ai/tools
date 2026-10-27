/** Dedicated-worker Real-ESRGAN runtime. Keeping ONNX off the main thread makes cancel responsive. */
import * as ort from 'onnxruntime-web';
import { MODEL_SCALE } from './logic';

interface InitRequest {
  type: 'init';
  model: ArrayBuffer;
}

interface RunRequest {
  type: 'run';
  pixels: ArrayBuffer;
  width: number;
  height: number;
}

type Request = InitRequest | RunRequest;
type Response =
  | { type: 'ready'; engine: 'gpu' | 'cpu' }
  | { type: 'result'; pixels: ArrayBuffer; width: number; height: number }
  | { type: 'error'; stage: 'runtime' | 'process'; message: string };

interface WorkerScope {
  onmessage: ((event: MessageEvent<Request>) => void) | null;
  postMessage(message: Response, transfer?: Transferable[]): void;
}

const scope = self as unknown as WorkerScope;
let session: ort.InferenceSession | null = null;

ort.env.wasm.wasmPaths = {
  mjs: '/ort/ort-wasm-simd-threaded.jsep.mjs',
  wasm: '/ort/ort-wasm-simd-threaded.jsep.wasm',
};

function pixelsToTensor(pixels: Uint8ClampedArray, width: number, height: number) {
  const area = width * height;
  const data = new Float32Array(area * 3);
  for (let pixel = 0; pixel < area; pixel++) {
    const source = pixel * 4;
    data[pixel] = pixels[source] / 255;
    data[area + pixel] = pixels[source + 1] / 255;
    data[area * 2 + pixel] = pixels[source + 2] / 255;
  }
  return data;
}

function tensorToPixels(data: Float32Array, width: number, height: number) {
  const area = width * height;
  const pixels = new Uint8ClampedArray(area * 4);
  for (let pixel = 0; pixel < area; pixel++) {
    const destination = pixel * 4;
    pixels[destination] = Math.round(Math.min(1, Math.max(0, data[pixel])) * 255);
    pixels[destination + 1] = Math.round(Math.min(1, Math.max(0, data[area + pixel])) * 255);
    pixels[destination + 2] = Math.round(Math.min(1, Math.max(0, data[area * 2 + pixel])) * 255);
    pixels[destination + 3] = 255;
  }
  return pixels;
}

async function initialize(model: ArrayBuffer): Promise<'gpu' | 'cpu'> {
  try {
    if (!('gpu' in navigator)) throw new Error('WebGPU unavailable');
    session = await ort.InferenceSession.create(new Uint8Array(model), { executionProviders: ['webgpu'] });
    return 'gpu';
  } catch {
    session = await ort.InferenceSession.create(new Uint8Array(model), { executionProviders: ['wasm'] });
    return 'cpu';
  }
}

async function runTile(request: RunRequest) {
  if (!session) throw new Error('AI runtime is not ready.');
  const input = new ort.Tensor(
    'float32',
    pixelsToTensor(new Uint8ClampedArray(request.pixels), request.width, request.height),
    [1, 3, request.height, request.width],
  );
  try {
    const outputs = await session.run({ image: input });
    const output = outputs.upscaled_image;
    if (!output) throw new Error('AI model returned no image.');
    try {
      const data = (await output.getData(true)) as Float32Array;
      const width = request.width * MODEL_SCALE;
      const height = request.height * MODEL_SCALE;
      const pixels = tensorToPixels(data, width, height);
      scope.postMessage({ type: 'result', pixels: pixels.buffer, width, height }, [pixels.buffer]);
    } finally {
      output.dispose();
    }
  } finally {
    input.dispose();
  }
}

scope.onmessage = async ({ data }) => {
  try {
    if (data.type === 'init') {
      const engine = await initialize(data.model);
      scope.postMessage({ type: 'ready', engine });
    } else {
      await runTile(data);
    }
  } catch (cause) {
    scope.postMessage({
      type: 'error',
      stage: session ? 'process' : 'runtime',
      message: cause instanceof Error ? cause.message : 'AI inference failed.',
    });
  }
};
