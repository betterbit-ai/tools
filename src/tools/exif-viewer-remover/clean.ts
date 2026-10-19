/** Browser-only I/O. Metadata parsing and rewriting run in a worker. */
import { zip } from 'fflate';
import type { ExifSummary } from './logic';
import type { ImageFormat } from './logic';

export async function inspectFile(file: File): Promise<ExifSummary> {
  return runWorker('inspect', await file.arrayBuffer()) as Promise<ExifSummary>;
}

export async function cleanFile(file: File, format: ImageFormat, signal?: AbortSignal): Promise<Blob> {
  const bytes = await abortable(file.arrayBuffer(), signal);
  const output = (await runWorker('clean', bytes, signal)) as ArrayBuffer;
  return new Blob([output], { type: mimeForFormat(format) });
}

/** Store already-compressed images in an asynchronous, cancellable ZIP worker. */
export function makeZip(files: Record<string, Uint8Array>, signal?: AbortSignal): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    let settled = false;
    const finish = (action: () => void) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', onAbort);
      action();
    };
    const terminate = zip(files, { level: 0 }, (error, archive) => {
      if (error) finish(() => reject(error));
      else finish(() => resolve(archive));
    });
    const onAbort = () =>
      finish(() => {
        terminate();
        reject(abortError());
      });
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

let worker: Worker | undefined;
let nextRequestId = 1;
const pending = new Map<number, { resolve: (value: unknown) => void; reject: (reason: Error) => void }>();

function runWorker(action: 'inspect' | 'clean', bytes: ArrayBuffer, signal?: AbortSignal): Promise<unknown> {
  worker ??= createWorker();
  const id = nextRequestId++;
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    const onAbort = () => {
      pending.delete(id);
      reject(abortError());
    };
    pending.set(id, {
      resolve: (value) => {
        signal?.removeEventListener('abort', onAbort);
        resolve(value);
      },
      reject: (reason) => {
        signal?.removeEventListener('abort', onAbort);
        reject(reason);
      },
    });
    signal?.addEventListener('abort', onAbort, { once: true });
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

function mimeForFormat(format: ImageFormat): string {
  if (format === 'jpeg') return 'image/jpeg';
  if (format === 'png') return 'image/png';
  if (format === 'webp') return 'image/webp';
  return 'application/octet-stream';
}

function abortable<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(abortError());
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(abortError());
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      },
    );
  });
}

function abortError(): DOMException {
  return new DOMException('Image cleanup was cancelled.', 'AbortError');
}
