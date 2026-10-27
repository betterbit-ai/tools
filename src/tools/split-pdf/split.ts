import { EncryptedPdfError, InvalidPdfError, type SplitProgress } from './logic';

type WorkerRequest = { action: 'count'; file: File } | { action: 'split'; file: File; groups: number[][] };

type WorkerResponse =
  | { action: 'count'; pageCount: number }
  | { action: 'progress'; progress: SplitProgress }
  | { action: 'complete'; blob: Blob; files: SplitFileInfo[]; downloadName: string }
  | { action: 'error'; error: 'encrypted' | 'invalid' | 'failed' };

export interface SplitFileInfo {
  name: string;
  size: number;
}

export interface PreparedSplit {
  blob: Blob;
  files: SplitFileInfo[];
  downloadName: string;
}

export interface PrepareSplitOptions {
  signal?: AbortSignal;
  onProgress?: (progress: SplitProgress) => void;
}

export class PdfSplitCancelledError extends Error {
  constructor() {
    super('PDF split cancelled.');
    this.name = 'PdfSplitCancelledError';
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new PdfSplitCancelledError();
}

function runInWorker(
  request: WorkerRequest,
  signal?: AbortSignal,
  onProgress?: (progress: SplitProgress) => void,
): Promise<WorkerResponse> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new PdfSplitCancelledError());
      return;
    }
    if (typeof Worker === 'undefined') {
      reject(new Error('A background PDF worker is unavailable.'));
      return;
    }

    const worker = new Worker(new URL('./split.worker.ts', import.meta.url), { type: 'module' });
    const cleanUp = () => {
      worker.terminate();
      signal?.removeEventListener('abort', onAbort);
    };
    const onAbort = () => {
      cleanUp();
      reject(new PdfSplitCancelledError());
    };

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const result = event.data;
      if (result.action === 'progress') {
        onProgress?.(result.progress);
        return;
      }
      cleanUp();
      resolve(result);
    };
    worker.onerror = () => {
      cleanUp();
      reject(new Error('PDF processing failed.'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    worker.postMessage(request);
  });
}

function resultError(result: Extract<WorkerResponse, { action: 'error' }>, fileName: string): Error {
  if (result.error === 'encrypted') return new EncryptedPdfError(fileName);
  if (result.error === 'invalid') return new InvalidPdfError(fileName);
  return new Error('PDF processing failed.');
}

/** Read a PDF in a worker so large documents do not block the page while opening. */
export async function readPdfPageCountOffMainThread(file: File, signal?: AbortSignal): Promise<number> {
  throwIfAborted(signal);
  const result = await runInWorker({ action: 'count', file }, signal);
  if (result.action === 'count') return result.pageCount;
  if (result.action === 'error') throw resultError(result, file.name);
  throw new Error('PDF page counting returned an unexpected result.');
}

/** Split and package a PDF in a worker, emitting progress after each finished part. */
export async function prepareSplitOffMainThread(
  file: File,
  groups: number[][],
  options: PrepareSplitOptions = {},
): Promise<PreparedSplit> {
  const { signal, onProgress } = options;
  throwIfAborted(signal);
  const result = await runInWorker({ action: 'split', file, groups }, signal, onProgress);
  if (result.action === 'complete') {
    return { blob: result.blob, files: result.files, downloadName: result.downloadName };
  }
  if (result.action === 'error') throw resultError(result, file.name);
  throw new Error('PDF splitting returned an unexpected result.');
}
