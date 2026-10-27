import { Mp3Encoder } from '@breezystack/lamejs';

interface EncodeRequest {
  channels: number;
  sampleRate: number;
  bitrate: number;
  left: ArrayBuffer;
  right?: ArrayBuffer;
}

interface WorkerScope {
  onmessage: (event: MessageEvent<EncodeRequest>) => void;
  postMessage: (message: { bytes: ArrayBuffer } | { error: string }, transfer?: Transferable[]) => void;
}

const scope: WorkerScope = self as unknown as WorkerScope;

function toInt16(samples: Float32Array): Int16Array {
  const output = new Int16Array(samples.length);
  for (let index = 0; index < samples.length; index++) {
    const value = Math.max(-1, Math.min(1, samples[index]));
    output[index] = value < 0 ? value * 0x8000 : value * 0x7fff;
  }
  return output;
}

scope.onmessage = ({ data }) => {
  try {
    const left = toInt16(new Float32Array(data.left));
    const right = data.channels === 2 && data.right ? toInt16(new Float32Array(data.right)) : undefined;
    const encoder = new Mp3Encoder(right ? 2 : 1, data.sampleRate, data.bitrate);
    const chunks: Uint8Array[] = [];
    for (let offset = 0; offset < left.length; offset += 1152) {
      const encoded = encoder.encodeBuffer(
        left.subarray(offset, offset + 1152),
        right?.subarray(offset, offset + 1152),
      );
      if (encoded.length) chunks.push(encoded);
    }
    const tail = encoder.flush();
    if (tail.length) chunks.push(tail);
    const size = chunks.reduce((total, chunk) => total + chunk.length, 0);
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    scope.postMessage({ bytes: bytes.buffer }, [bytes.buffer]);
  } catch {
    scope.postMessage({ error: 'encode-failed' });
  }
};
