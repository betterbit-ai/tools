/** Browser-only PDF rendering and rebuilding. */
import type { CompressionPreset } from './logic';
import {
  EncryptedPdfError,
  InvalidPdfError,
  pageCountExceedsLimit,
  pageExceedsRasterLimit,
  PdfLimitError,
  totalRasterExceedsLimit,
} from './logic';

async function canvasJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Uint8Array> {
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) => (value ? resolve(value) : reject(new Error('JPEG encoding failed'))),
      'image/jpeg',
      quality,
    ),
  );
  return new Uint8Array(await blob.arrayBuffer());
}

/**
 * Renders every page to a JPEG and creates a new PDF with the original page
 * dimensions. This is effective for scans and image-heavy PDFs; selectable
 * DPI and JPEG quality make the irreversible quality/size trade-off clear.
 */
export async function compressPdf(
  bytes: Uint8Array,
  fileName: string,
  preset: CompressionPreset,
  onProgress: (completedPages: number, totalPages: number) => void,
): Promise<{ bytes: Uint8Array; pageCount: number }> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { PDFDocument } = await import('pdf-lib');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();

  const loadingTask = pdfjs.getDocument({ data: bytes });
  let source;
  try {
    source = await loadingTask.promise;
  } catch (error) {
    if (error instanceof Error && error.name === 'PasswordException') throw new EncryptedPdfError(fileName);
    throw new InvalidPdfError(fileName);
  }

  try {
    const output = await PDFDocument.create();
    const totalPages = source.numPages;
    if (pageCountExceedsLimit(totalPages)) throw new PdfLimitError('page-count');
    let totalRasterPixels = 0;
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      const page = await source.getPage(pageNumber);
      const displayViewport = page.getViewport({ scale: 1 });
      const renderViewport = page.getViewport({ scale: preset.dpi / 72 });
      if (pageExceedsRasterLimit(renderViewport.width, renderViewport.height)) {
        throw new PdfLimitError('page-pixels');
      }
      totalRasterPixels += Math.ceil(renderViewport.width) * Math.ceil(renderViewport.height);
      if (totalRasterExceedsLimit(totalRasterPixels)) throw new PdfLimitError('total-pixels');
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.ceil(renderViewport.width));
      canvas.height = Math.max(1, Math.ceil(renderViewport.height));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas is unavailable');
      // JPEG cannot represent transparency; PDF pages conventionally render on white paper.
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, viewport: renderViewport }).promise;

      const image = await output.embedJpg(await canvasJpeg(canvas, preset.quality));
      const outputPage = output.addPage([displayViewport.width, displayViewport.height]);
      outputPage.drawImage(image, {
        x: 0,
        y: 0,
        width: displayViewport.width,
        height: displayViewport.height,
      });
      onProgress(pageNumber, totalPages);
      page.cleanup();
    }
    return { bytes: await output.save(), pageCount: totalPages };
  } finally {
    await loadingTask.destroy();
  }
}
