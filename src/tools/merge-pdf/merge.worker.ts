import { mergePdfs, type MergeInput } from './logic';

interface MergeWorkerScope {
  onmessage: ((event: MessageEvent<{ files: MergeInput[] }>) => void) | null;
  postMessage(message: { bytes: ArrayBuffer } | { error: string }, transfer?: Transferable[]): void;
}

const workerScope = self as unknown as MergeWorkerScope;

workerScope.onmessage = async (event: MessageEvent<{ files: MergeInput[] }>) => {
  try {
    const bytes = await mergePdfs(event.data.files);
    const buffer = bytes.buffer as ArrayBuffer;
    workerScope.postMessage({ bytes: buffer }, [buffer]);
  } catch {
    workerScope.postMessage({ error: 'PDF merge failed.' });
  }
};
