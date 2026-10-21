/** Browser-only PDF inspection and merging. */
import { yieldToBrowser } from '../../lib/browser';
import {
  EncryptedPdfError,
  hasPdfEncryptionDictionary,
  InvalidPdfError,
  mergePdfSequence,
  readPdfPageCount,
  type MergeInput,
  type MergeProgress,
} from './logic';

type MergeWorkerResult =
  | { type: 'inspected'; pageCount: number }
  | { type: 'progress'; progress: MergeProgress }
  | { type: 'complete'; bytes: ArrayBuffer }
  | { type: 'error'; error: 'encrypted' | 'invalid' | 'failed'; fileName?: string };

export class PdfMergeCancelledError extends Error {
  constructor() {
    super('PDF merge cancelled.');
    this.name = 'PdfMergeCancelledError';
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new PdfMergeCancelledError();
}

function workerError(result: Extract<MergeWorkerResult, { type: 'error' }>, fallbackName: string): Error {
  const fileName = result.fileName ?? fallbackName;
  if (result.error === 'encrypted') return new EncryptedPdfError(fileName);
  if (result.error === 'invalid') return new InvalidPdfError(fileName);
  return new Error('PDF merge failed.');
}

/** Reads a PDF's page count in a worker so image-heavy documents cannot freeze the page. */
export async function inspectPdfFile(file: File, signal?: AbortSignal): Promise<number> {
  throwIfAborted(signal);
  const bytes = await file.arrayBuffer();
  throwIfAborted(signal);
  if (hasPdfEncryptionDictionary(new Uint8Array(bytes))) throw new EncryptedPdfError(file.name);
  if (typeof Worker === 'undefined') {
    const pageCount = await readPdfPageCount(new Uint8Array(bytes), file.name);
    await yieldToBrowser();
    throwIfAborted(signal);
    return pageCount;
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./merge.worker.ts', import.meta.url), { type: 'module' });
    const cleanUp = () => {
      worker.terminate();
      signal?.removeEventListener('abort', onAbort);
    };
    const onAbort = () => {
      cleanUp();
      reject(new PdfMergeCancelledError());
    };
    worker.onmessage = (event: MessageEvent<MergeWorkerResult>) => {
      const result = event.data;
      if (result.type === 'inspected') {
        cleanUp();
        resolve(result.pageCount);
      } else if (result.type === 'error') {
        cleanUp();
        reject(workerError(result, file.name));
      }
    };
    worker.onerror = () => {
      cleanUp();
      reject(new Error('PDF inspection failed.'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    worker.postMessage({ type: 'inspect', bytes, fileName: file.name }, [bytes]);
  });
}

export interface MergeOptions {
  signal?: AbortSignal;
  onProgress?: (progress: MergeProgress) => void;
}

/**
 * Merges local files outside the interaction thread. Files are structured-cloned as Blob
 * handles, then read one at a time in the worker rather than cloning every source byte array.
 */
export async function mergePdfFiles(files: File[], options: MergeOptions = {}): Promise<Uint8Array> {
  const { signal, onProgress } = options;
  throwIfAborted(signal);

  if (typeof Worker === 'undefined') {
    async function* inputs(): AsyncGenerator<MergeInput> {
      for (const file of files) {
        throwIfAborted(signal);
        const bytes = new Uint8Array(await file.arrayBuffer());
        throwIfAborted(signal);
        yield { bytes, fileName: file.name };
        await yieldToBrowser();
      }
    }
    const output = await mergePdfSequence(inputs(), {
      total: files.length,
      onProgress: (progress) => {
        throwIfAborted(signal);
        onProgress?.(progress);
      },
    });
    throwIfAborted(signal);
    return output;
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./merge.worker.ts', import.meta.url), { type: 'module' });
    const cleanUp = () => {
      worker.terminate();
      signal?.removeEventListener('abort', onAbort);
    };
    const onAbort = () => {
      cleanUp();
      reject(new PdfMergeCancelledError());
    };
    worker.onmessage = (event: MessageEvent<MergeWorkerResult>) => {
      const result = event.data;
      if (result.type === 'progress') {
        onProgress?.(result.progress);
      } else if (result.type === 'complete') {
        cleanUp();
        resolve(new Uint8Array(result.bytes));
      } else if (result.type === 'error') {
        cleanUp();
        reject(workerError(result, result.fileName ?? 'PDF'));
      }
    };
    worker.onerror = () => {
      cleanUp();
      reject(new Error('PDF merge failed.'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    worker.postMessage({ type: 'merge', files });
  });
}
