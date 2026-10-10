/** Browser-only PDF rendering. This module is dynamically imported after a PDF is chosen. */
import {
  EncryptedPdfError,
  InvalidPdfError,
  pageCountExceedsLimit,
  pageExceedsRasterLimit,
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
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('JPEG encoding failed'))), 'image/jpeg', 0.92),
  );
}

async function openPdf(bytes: Uint8Array, fileName: string) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();
  const loadingTask = pdfjs.getDocument({ data: bytes });
  try {
    return { pdf: await loadingTask.promise, loadingTask };
  } catch (error) {
    await loadingTask.destroy();
    if (error instanceof Error && error.name === 'PasswordException') throw new EncryptedPdfError(fileName);
    throw new InvalidPdfError(fileName);
  }
}

/** Reads only the document metadata needed to show a page-count and page field. */
export async function readPdfPageCount(bytes: Uint8Array, fileName: string): Promise<number> {
  const { pdf, loadingTask } = await openPdf(bytes, fileName);
  try {
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
): Promise<ConvertedPage[]> {
  const { pdf, loadingTask } = await openPdf(bytes, fileName);
  try {
    if (pageCountExceedsLimit(pdf.numPages)) throw new PdfLimitError('page-count');
    const scale = renderScale(resolution);
    let totalPixels = 0;
    const output: ConvertedPage[] = [];

    for (let index = 0; index < pages.length; index++) {
      const pageNumber = pages[index];
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      if (pageExceedsRasterLimit(viewport.width, viewport.height)) throw new PdfLimitError('page-pixels');
      totalPixels += Math.ceil(viewport.width) * Math.ceil(viewport.height);
      if (totalRasterExceedsLimit(totalPixels)) throw new PdfLimitError('total-pixels');

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.ceil(viewport.width));
      canvas.height = Math.max(1, Math.ceil(viewport.height));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas is unavailable');
      // JPEG has no alpha channel; paper white is the expected PDF page background.
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, viewport }).promise;
      output.push({
        pageNumber,
        blob: await jpegBlob(canvas),
      });
      page.cleanup();
      onProgress(index + 1, pages.length);
    }
    return output;
  } finally {
    await loadingTask.destroy();
  }
}
