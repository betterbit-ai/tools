/** Browser-only PDF rendering. This module is dynamically imported after a PDF is chosen. */
import { yieldToBrowser } from '../../lib/browser';
import {
  EncryptedPdfError,
  InvalidPdfError,
  pageCountExceedsLimit,
  pageExceedsRasterLimit,
  PdfConversionCancelledError,
  PdfLimitError,
  renderScale,
  totalRasterExceedsLimit,
  type Resolution,
} from './logic';

export interface ConvertedPage {
  pageNumber: number;
  blob: Blob;
}

async function jpegBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('JPEG encoding failed'))), 'image/jpeg', 0.92),
  );
  const signature = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  if (blob.type !== 'image/jpeg' || signature[0] !== 0xff || signature[1] !== 0xd8) {
    throw new Error('The browser did not encode a JPEG image.');
  }
  return blob;
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new PdfConversionCancelledError();
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
    return { pdf, loadingTask };
  } catch (error) {
    await loadingTask.destroy();
    throwIfAborted(signal);
    if (error instanceof Error && error.name === 'PasswordException') throw new EncryptedPdfError(fileName);
    throw new InvalidPdfError(fileName);
  } finally {
    signal?.removeEventListener('abort', cancelLoading);
  }
}

/** Reads only the document metadata needed to show a page-count and page field. */
export async function readPdfPageCount(bytes: Uint8Array, fileName: string, signal?: AbortSignal): Promise<number> {
  const { pdf, loadingTask } = await openPdf(bytes, fileName, signal);
  try {
    throwIfAborted(signal);
    if (pageCountExceedsLimit(pdf.numPages)) throw new PdfLimitError('page-count');
    return pdf.numPages;
  } finally {
    await loadingTask.destroy();
  }
}

export async function convertPdfToJpg(
  bytes: Uint8Array,
  fileName: string,
  pages: number[],
  resolution: Resolution,
  onProgress: (done: number, total: number) => void,
  signal?: AbortSignal,
): Promise<ConvertedPage[]> {
  const { pdf, loadingTask } = await openPdf(bytes, fileName, signal);
  try {
    throwIfAborted(signal);
    if (pageCountExceedsLimit(pdf.numPages)) throw new PdfLimitError('page-count');
    const scale = renderScale(resolution);
    let totalPixels = 0;
    const output: ConvertedPage[] = [];

    for (let index = 0; index < pages.length; index++) {
      throwIfAborted(signal);
      const pageNumber = pages[index];
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      if (pageExceedsRasterLimit(viewport.width, viewport.height)) throw new PdfLimitError('page-pixels');
      totalPixels += Math.ceil(viewport.width) * Math.ceil(viewport.height);
      if (totalRasterExceedsLimit(totalPixels)) throw new PdfLimitError('total-pixels');

      const canvas = document.createElement('canvas');
      try {
        canvas.width = Math.max(1, Math.ceil(viewport.width));
        canvas.height = Math.max(1, Math.ceil(viewport.height));
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas is unavailable');
        // JPEG has no alpha channel; paper white is the expected PDF page background.
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        const renderTask = page.render({ canvas, viewport });
        // PDF.js normally schedules display work with animation frames, which pause in a
        // background tab. MessageChannel-backed yields keep long conversions progressing.
        renderTask.onContinue = (continueRendering: () => void) => {
          void yieldToBrowser().then(() => {
            if (signal?.aborted) renderTask.cancel();
            else continueRendering();
          });
        };
        const cancelRender = () => renderTask.cancel();
        signal?.addEventListener('abort', cancelRender, { once: true });
        try {
          await renderTask.promise;
        } catch (caught) {
          throwIfAborted(signal);
          throw caught;
        } finally {
          signal?.removeEventListener('abort', cancelRender);
        }
        throwIfAborted(signal);
        output.push({
          pageNumber,
          blob: await jpegBlob(canvas),
        });
        throwIfAborted(signal);
      } finally {
        page.cleanup();
        // Release the large canvas backing store before rendering the next page.
        canvas.width = 0;
        canvas.height = 0;
      }
      onProgress(index + 1, pages.length);
      // Yield between pages so progress can paint and input stays responsive.
      await yieldToBrowser();
    }
    return output;
  } finally {
    await loadingTask.destroy();
  }
}
