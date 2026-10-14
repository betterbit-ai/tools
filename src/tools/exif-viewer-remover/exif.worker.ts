import { inspectMetadata, isValidImage, stripMetadata } from './logic';

type WorkerScope = {
  onmessage: ((event: MessageEvent<{ id: number; action: 'inspect' | 'clean'; bytes: ArrayBuffer }>) => void) | null;
  postMessage(message: unknown, transfer?: Transferable[]): void;
};

const workerScope = self as unknown as WorkerScope;

workerScope.onmessage = (event) => {
  const { id, action, bytes } = event.data;
  try {
    const image = new Uint8Array(bytes);
    if (!isValidImage(image)) throw new Error('unsupported or malformed image');
    if (action === 'inspect') {
      workerScope.postMessage({ id, result: inspectMetadata(image) });
      return;
    }
    const cleaned = stripMetadata(image);
    const output = cleaned.buffer.slice(cleaned.byteOffset, cleaned.byteOffset + cleaned.byteLength) as ArrayBuffer;
    workerScope.postMessage({ id, result: output }, [output]);
  } catch {
    workerScope.postMessage({ id, error: 'unsupported or malformed image' });
  }
};
