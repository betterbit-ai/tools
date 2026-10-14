/** Browser-only I/O. Metadata parsing and rewriting run in a worker. */
import type { ExifSummary } from './logic';

export async function inspectFile(file: File): Promise<ExifSummary> {
  return runWorker('inspect', await file.arrayBuffer()) as Promise<ExifSummary>;
}

export async function cleanFile(file: File): Promise<Blob> {
  const output = (await runWorker('clean', await file.arrayBuffer())) as ArrayBuffer;
  return new Blob([output], { type: file.type || 'application/octet-stream' });
}

let worker: Worker | undefined;
let nextRequestId = 1;
const pending = new Map<number, { resolve: (value: unknown) => void; reject: (reason: Error) => void }>();

function runWorker(action: 'inspect' | 'clean', bytes: ArrayBuffer): Promise<unknown> {
  worker ??= createWorker();
  const id = nextRequestId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    worker!.postMessage({ id, action, bytes }, [bytes]);
  });
}

function createWorker(): Worker {
  const instance = new Worker(new URL('./exif.worker.ts', import.meta.url), { type: 'module' });
  instance.onmessage = (event: MessageEvent<{ id: number; result?: unknown; error?: string }>) => {
    const request = pending.get(event.data.id);
    if (!request) return;
    pending.delete(event.data.id);
    if (event.data.error) request.reject(new Error(event.data.error));
    else request.resolve(event.data.result);
  };
  instance.onerror = () => {
    for (const request of pending.values()) request.reject(new Error('worker failed'));
    pending.clear();
    worker = undefined;
  };
  return instance;
}
