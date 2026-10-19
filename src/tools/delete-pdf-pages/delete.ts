/** Browser-only PDF preview rendering and off-main-thread page copying. */
import { yieldToBrowser } from '../../lib/browser';
import {
  EncryptedPdfError,
  InvalidPdfError,
  pageCountExceedsLimit,
  PdfLimitError,
  PdfOperationCancelledError,
  previewScale,
} from './logic';
import { writeDeletedPdf } from './delete-core';

export { writeDeletedPdf };

export interface PdfPreview {
  url: string;
}

export interface PreviewOptions {
  signal?: AbortSignal;
  onProgress?: (done: number, total: number) => void;
}

type DeleteWorkerResponse = { bytes: ArrayBuffer } | { error: 'encrypted' | 'invalid' | 'failed' };

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new PdfOperationCancelledError();
}

async function openPdf(bytes: Uint8Array, fileName: string, signal?: AbortSignal) {
  throwIfAborted(signal);
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  throwIfAborted(signal);
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();
  const loadingTask = pdfjs.getDocument({ data: bytes });
  const cancelLoading = () => void loadingTask.destroy();
  signal?.addEventListener('abort', cancelLoading, { once: true });
  try {
    const pdf = await loadingTask.promise;
    throwIfAborted(signal);
    return { loadingTask, pdf };
  } catch (caught) {
    await loadingTask.destroy();
    if (signal?.aborted) throw new PdfOperationCancelledError();
    if (caught instanceof Error && caught.name === 'PasswordException') throw new EncryptedPdfError(fileName);
    throw new InvalidPdfError(fileName);
  } finally {
    signal?.removeEventListener('abort', cancelLoading);
  }
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Preview encoding failed'))), 'image/png'),
  );
}

/** Reads one local PDF and builds bounded thumbnails sequentially. */
export async function openPdfPreviews(
  bytes: Uint8Array,
  fileName: string,
  options: PreviewOptions = {},
): Promise<PdfPreview[]> {
  const { signal, onProgress } = options;
  const { pdf, loadingTask } = await openPdf(bytes, fileName, signal);
  const urls: string[] = [];
  try {
    if (pageCountExceedsLimit(pdf.numPages)) throw new PdfLimitError();
    onProgress?.(0, pdf.numPages);
    await yieldToBrowser();

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      throwIfAborted(signal);
      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: previewScale(baseViewport.width, baseViewport.height) });
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.ceil(viewport.width));
      canvas.height = Math.max(1, Math.ceil(viewport.height));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas is unavailable');

      const renderTask = page.render({ canvas, viewport });
      // PDF.js normally advances display renders with requestAnimationFrame, which browsers
      // pause in a background tab. Route every continuation through our MessageChannel yield.
      renderTask.onContinue = (continueRendering: () => void) => {
        void yieldToBrowser().then(() => {
          if (!signal?.aborted) continueRendering();
        });
      };
      const cancelRender = () => renderTask.cancel();
      signal?.addEventListener('abort', cancelRender, { once: true });
      try {
        await renderTask.promise;
      } catch (caught) {
        if (signal?.aborted) throw new PdfOperationCancelledError();
        throw caught;
      } finally {
        signal?.removeEventListener('abort', cancelRender);
      }

      throwIfAborted(signal);
      const blob = await canvasBlob(canvas);
      throwIfAborted(signal);
      urls.push(URL.createObjectURL(blob));
      canvas.width = 0;
      canvas.height = 0;
      page.cleanup();
      onProgress?.(pageNumber, pdf.numPages);
      await yieldToBrowser();
    }
    return urls.map((url) => ({ url }));
  } catch (caught) {
    urls.forEach((url) => URL.revokeObjectURL(url));
    throw caught;
  } finally {
    await loadingTask.destroy();
  }
}

/** Rebuilds the PDF in a worker so copying large embedded resources never blocks the page. */
export async function writeDeletedPdfOffMainThread(
  bytes: Uint8Array,
  fileName: string,
  deletedPages: number[],
  signal?: AbortSignal,
): Promise<Uint8Array> {
  throwIfAborted(signal);
  if (typeof Worker === 'undefined') {
    return writeDeletedPdf(bytes, fileName, deletedPages);
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./delete.worker.ts', import.meta.url), { type: 'module' });
    const cleanUp = () => {
      worker.terminate();
      signal?.removeEventListener('abort', onAbort);
    };
    const onAbort = () => {
      cleanUp();
      reject(new PdfOperationCancelledError());
    };
    worker.onmessage = (event: MessageEvent<DeleteWorkerResponse>) => {
      cleanUp();
      const result = event.data;
      if ('bytes' in result) {
        resolve(new Uint8Array(result.bytes));
      } else if (result.error === 'encrypted') {
        reject(new EncryptedPdfError(fileName));
      } else if (result.error === 'invalid') {
        reject(new InvalidPdfError(fileName));
      } else {
        reject(new Error('PDF page deletion failed.'));
      }
    };
    worker.onerror = () => {
      cleanUp();
      reject(new Error('PDF page deletion failed.'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    worker.postMessage({ bytes: buffer, fileName, deletedPages }, [buffer]);
  });
}
