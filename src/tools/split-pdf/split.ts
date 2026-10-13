import { EncryptedPdfError, InvalidPdfError, readPdfPageCount, splitPdf, type SplitFile } from './logic';

type WorkerRequest =
  | { action: 'count'; bytes: Uint8Array; fileName: string }
  | { action: 'split'; bytes: Uint8Array; fileName: string; groups: number[][] }
  | { action: 'zip'; files: SplitFile[] };

type WorkerResponse =
  | { action: 'count'; pageCount: number }
  | { action: 'split'; files: { name: string; bytes: ArrayBuffer }[] }
  | { action: 'zip'; bytes: ArrayBuffer }
  | { error: 'encrypted' | 'invalid' | 'failed' };

function abortError(): DOMException {
  return new DOMException('The operation was aborted.', 'AbortError');
}

function runInWorker(request: WorkerRequest, signal?: AbortSignal): Promise<WorkerResponse> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const worker = new Worker(new URL('./split.worker.ts', import.meta.url), { type: 'module' });
    const cleanUp = () => {
      worker.terminate();
      signal?.removeEventListener('abort', onAbort);
    };
    const onAbort = () => {
      cleanUp();
      reject(abortError());
    };

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      cleanUp();
      resolve(event.data);
    };
    worker.onerror = () => {
      cleanUp();
      reject(new Error('PDF processing failed.'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    worker.postMessage(request);
  });
}

/** Read a PDF in a worker so large documents do not block the page while opening. */
export async function readPdfPageCountOffMainThread(
  bytes: Uint8Array,
  fileName: string,
  signal?: AbortSignal,
): Promise<number> {
  if (typeof Worker === 'undefined') return readPdfPageCount(bytes, fileName);
  const result = await runInWorker({ action: 'count', bytes, fileName }, signal);
  if ('pageCount' in result) return result.pageCount;
  if ('error' in result && result.error === 'encrypted') throw new EncryptedPdfError(fileName);
  throw new InvalidPdfError(fileName);
}

/** Split a PDF in a worker and transfer the finished parts back to the page. */
export async function splitPdfOffMainThread(
  bytes: Uint8Array,
  fileName: string,
  groups: number[][],
  signal?: AbortSignal,
): Promise<SplitFile[]> {
  if (typeof Worker === 'undefined') return splitPdf(bytes, fileName, groups);
  const result = await runInWorker({ action: 'split', bytes, fileName, groups }, signal);
  if ('files' in result) return result.files.map((file) => ({ name: file.name, bytes: new Uint8Array(file.bytes) }));
  if ('error' in result && result.error === 'encrypted') throw new EncryptedPdfError(fileName);
  if ('error' in result && result.error === 'invalid') throw new InvalidPdfError(fileName);
  throw new Error('PDF splitting failed.');
}

/** Package split files in a worker; ZIP creation can be expensive for large batches. */
export async function zipSplitFilesOffMainThread(files: SplitFile[], signal?: AbortSignal): Promise<Uint8Array> {
  if (typeof Worker === 'undefined') {
    const { zipSync } = await import('fflate');
    return zipSync(Object.fromEntries(files.map((file) => [file.name, file.bytes])), { level: 0 });
  }
  const result = await runInWorker({ action: 'zip', files }, signal);
  if ('bytes' in result) return new Uint8Array(result.bytes);
  throw new Error('ZIP creation failed.');
}
