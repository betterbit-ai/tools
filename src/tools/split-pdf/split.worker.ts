import { zipSync } from 'fflate';
import { EncryptedPdfError, InvalidPdfError, readPdfPageCount, splitPdf, type SplitFile } from './logic';

type WorkerRequest =
  | { action: 'count'; bytes: Uint8Array; fileName: string }
  | { action: 'split'; bytes: Uint8Array; fileName: string; groups: number[][] }
  | { action: 'zip'; files: SplitFile[] };

interface WorkerScope {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: unknown, transfer?: Transferable[]): void;
}

const workerScope = self as unknown as WorkerScope;

workerScope.onmessage = async (event) => {
  try {
    const request = event.data;
    if (request.action === 'count') {
      workerScope.postMessage({ action: 'count', pageCount: await readPdfPageCount(request.bytes, request.fileName) });
      return;
    }
    if (request.action === 'split') {
      const files = await splitPdf(request.bytes, request.fileName, request.groups);
      const output = files.map((file) => ({ name: file.name, bytes: file.bytes.buffer as ArrayBuffer }));
      workerScope.postMessage(
        { action: 'split', files: output },
        output.map((file) => file.bytes),
      );
      return;
    }

    const bytes = zipSync(Object.fromEntries(request.files.map((file) => [file.name, file.bytes])), { level: 0 });
    const buffer = bytes.buffer as ArrayBuffer;
    workerScope.postMessage({ action: 'zip', bytes: buffer }, [buffer]);
  } catch (error) {
    const kind =
      error instanceof EncryptedPdfError ? 'encrypted' : error instanceof InvalidPdfError ? 'invalid' : 'failed';
    workerScope.postMessage({ error: kind });
  }
};
