import { mergePdfs, type MergeInput } from './logic';

interface MergeWorkerResult {
  bytes?: ArrayBuffer;
  error?: string;
}

/**
 * Assemble PDFs outside the interaction thread. Source bytes are deliberately
 * cloned rather than transferred so users can reorder and download again.
 */
export function mergePdfsOffMainThread(files: MergeInput[]): Promise<Uint8Array> {
  if (typeof Worker === 'undefined') return mergePdfs(files);

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./merge.worker.ts', import.meta.url), { type: 'module' });
    const cleanUp = () => worker.terminate();

    worker.onmessage = (event: MessageEvent<MergeWorkerResult>) => {
      cleanUp();
      if (event.data.bytes) resolve(new Uint8Array(event.data.bytes));
      else reject(new Error(event.data.error ?? 'PDF merge failed.'));
    };
    worker.onerror = () => {
      cleanUp();
      reject(new Error('PDF merge failed.'));
    };
    worker.postMessage({ files });
  });
}
