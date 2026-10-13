import { buildPdf, type PdfPageInput } from './logic';

interface PdfWorkerScope {
  onmessage: ((event: MessageEvent<{ pages: PdfPageInput[] }>) => void) | null;
  postMessage(message: { bytes: ArrayBuffer } | { error: string }, transfer?: Transferable[]): void;
}

const workerScope = self as unknown as PdfWorkerScope;

workerScope.onmessage = (event: MessageEvent<{ pages: PdfPageInput[] }>) => {
  try {
    const bytes = buildPdf(event.data.pages);
    const buffer = bytes.buffer as ArrayBuffer;
    workerScope.postMessage({ bytes: buffer }, [buffer]);
  } catch {
    workerScope.postMessage({ error: 'PDF assembly failed.' });
  }
};
