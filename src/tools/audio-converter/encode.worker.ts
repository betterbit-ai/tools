import { Mp3Encoder } from '@breezystack/lamejs';
import { FRAME_SAMPLES, floatToInt16 } from './logic';

interface EncodeRequest {
  channels: number;
  sampleRate: number;
  bitrate: number;
  buffers: ArrayBuffer[];
}

type EncodeMessage =
  { type: 'progress'; ratio: number } | { type: 'done'; bytes: ArrayBuffer } | { type: 'error'; error: string };

interface WorkerScope {
  onmessage: (event: MessageEvent<EncodeRequest>) => void;
  postMessage: (message: EncodeMessage, transfer?: Transferable[]) => void;
}

const scope: WorkerScope = self as unknown as WorkerScope;

scope.onmessage = ({ data }) => {
  try {
    const left = floatToInt16All(new Float32Array(data.buffers[0]));
    const right = data.channels > 1 && data.buffers[1] ? floatToInt16All(new Float32Array(data.buffers[1])) : undefined;
    const encoder = new Mp3Encoder(right ? 2 : 1, data.sampleRate, data.bitrate);
    const chunks: Uint8Array[] = [];
    let lastReport = 0;

    for (let offset = 0; offset < left.length; offset += FRAME_SAMPLES) {
      const encoded = encoder.encodeBuffer(
        left.subarray(offset, offset + FRAME_SAMPLES),
        right?.subarray(offset, offset + FRAME_SAMPLES),
      );
      if (encoded.length) chunks.push(encoded);
      // About four reports per second of audio keeps the bar moving without flooding the page.
      if (offset - lastReport >= data.sampleRate) {
        lastReport = offset;
        scope.postMessage({ type: 'progress', ratio: Math.min(1, offset / left.length) });
      }
    }

    const tail = encoder.flush();
    if (tail.length) chunks.push(tail);

    const size = chunks.reduce((total, chunk) => total + chunk.length, 0);
    const bytes = new Uint8Array(size);
    let writeOffset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, writeOffset);
      writeOffset += chunk.length;
    }
    scope.postMessage({ type: 'done', bytes: bytes.buffer }, [bytes.buffer]);
  } catch {
    scope.postMessage({ type: 'error', error: 'encode-failed' });
  }
};

function floatToInt16All(samples: Float32Array): Int16Array {
  const output = new Int16Array(samples.length);
  for (let index = 0; index < samples.length; index++) output[index] = floatToInt16(samples[index]);
  return output;
}
