/** Browser-only PDF reading, thumbnail rendering, and file writing. */
import {
  EncryptedPdfError,
  InvalidPdfError,
  pageCountExceedsLimit,
  PdfLimitError,
  previewScale,
  type Rotation,
} from './logic';

export interface PdfPreview {
  url: string;
}

export interface OpenedPdf {
  previews: PdfPreview[];
  pageCount: number;
  sourceRotations: Rotation[];
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

/** Opens a PDF once and creates small local image URLs for its visible page thumbnails. */
export async function openPdfPreviews(bytes: Uint8Array, fileName: string): Promise<OpenedPdf> {
  const { pdf, loadingTask } = await openPdf(bytes, fileName);
  const urls: string[] = [];
  try {
    if (pageCountExceedsLimit(pdf.numPages)) throw new PdfLimitError();
    const sourceRotations: Rotation[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      sourceRotations.push(page.rotate as Rotation);
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
    return { pageCount: pdf.numPages, previews: urls.map((url) => ({ url })), sourceRotations };
  } catch (caught) {
    urls.forEach((url) => URL.revokeObjectURL(url));
    throw caught;
  } finally {
    await loadingTask.destroy();
  }
}

/** Writes only each page's rotation metadata; text, vectors, images, and links are not rerendered. */
export async function writeRotatedPdf(bytes: Uint8Array, fileName: string, rotations: Rotation[]): Promise<Uint8Array> {
  const { PDFDocument, degrees, EncryptedPDFError } = await import('pdf-lib');
  try {
    const document = await PDFDocument.load(bytes);
    if (document.getPageCount() !== rotations.length) throw new InvalidPdfError(fileName);
    document.getPages().forEach((page, index) => {
      page.setRotation(degrees(rotations[index]));
    });
    return document.save();
  } catch (caught) {
    if (caught instanceof EncryptedPDFError) throw new EncryptedPdfError(fileName);
    if (caught instanceof InvalidPdfError) throw caught;
    throw new InvalidPdfError(fileName);
  }
}
