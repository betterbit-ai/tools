/** Browser-only PDF preview rendering and page copying. Loaded after a file is chosen. */
import { EncryptedPdfError, InvalidPdfError, pageCountExceedsLimit, PdfLimitError, previewScale } from './logic';

export interface PdfPreview {
  url: string;
}

async function openPdf(bytes: Uint8Array, fileName: string) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();
  const loadingTask = pdfjs.getDocument({ data: bytes });
  try {
    return { loadingTask, pdf: await loadingTask.promise };
  } catch (caught) {
    await loadingTask.destroy();
    if (caught instanceof Error && caught.name === 'PasswordException') throw new EncryptedPdfError(fileName);
    throw new InvalidPdfError(fileName);
  }
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Preview encoding failed'))), 'image/png'),
  );
}

/** Reads one local PDF and builds thumbnail URLs for direct page selection. */
export async function openPdfPreviews(bytes: Uint8Array, fileName: string): Promise<PdfPreview[]> {
  const { pdf, loadingTask } = await openPdf(bytes, fileName);
  const urls: string[] = [];
  try {
    if (pageCountExceedsLimit(pdf.numPages)) throw new PdfLimitError();
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: previewScale(baseViewport.width, baseViewport.height) });
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.ceil(viewport.width));
      canvas.height = Math.max(1, Math.ceil(viewport.height));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas is unavailable');
      await page.render({ canvas, viewport }).promise;
      urls.push(URL.createObjectURL(await canvasBlob(canvas)));
      page.cleanup();
    }
    return urls.map((url) => ({ url }));
  } catch (caught) {
    urls.forEach((url) => URL.revokeObjectURL(url));
    throw caught;
  } finally {
    await loadingTask.destroy();
  }
}

/** Creates a new PDF from the source pages that were not marked for deletion. */
export async function writeDeletedPdf(
  bytes: Uint8Array,
  fileName: string,
  deletedPages: number[],
): Promise<Uint8Array> {
  const { PDFDocument, EncryptedPDFError } = await import('pdf-lib');
  try {
    const source = await PDFDocument.load(bytes);
    const pageCount = source.getPageCount();
    const deleted = new Set(deletedPages.filter((page) => Number.isInteger(page) && page >= 1 && page <= pageCount));
    const sourceIndexes = Array.from({ length: pageCount }, (_, index) => index).filter(
      (index) => !deleted.has(index + 1),
    );
    if (sourceIndexes.length === 0) throw new InvalidPdfError(fileName);
    const output = await PDFDocument.create();
    const copiedPages = await output.copyPages(source, sourceIndexes);
    copiedPages.forEach((page) => output.addPage(page));
    return output.save();
  } catch (caught) {
    if (caught instanceof EncryptedPDFError) throw new EncryptedPdfError(fileName);
    if (caught instanceof InvalidPdfError) throw caught;
    throw new InvalidPdfError(fileName);
  }
}
