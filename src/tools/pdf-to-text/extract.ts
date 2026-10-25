/** Browser-only PDF text extraction, loaded only after a user chooses a PDF. */
import { yieldToBrowser } from '../../lib/browser';
import {
  EncryptedPdfError,
  InvalidPdfError,
  pageCountExceedsLimit,
  PdfLimitError,
  textExceedsLimit,
  textFromPdfItems,
  type ExtractedPage,
  type PdfTextItem,
} from './logic';

export class ExtractionCancelledError extends Error {
  constructor() {
    super('PDF text extraction was cancelled.');
    this.name = 'ExtractionCancelledError';
  }
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

export async function extractPdfText(
  bytes: Uint8Array,
  fileName: string,
  onProgress: (done: number, total: number) => void,
  signal?: AbortSignal,
): Promise<ExtractedPage[]> {
  const { pdf, loadingTask } = await openPdf(bytes, fileName);
  try {
    if (pageCountExceedsLimit(pdf.numPages)) throw new PdfLimitError('page-count');
    const pages: ExtractedPage[] = [];
    let combinedText = '';

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      if (signal?.aborted) throw new ExtractionCancelledError();
      const page = await pdf.getPage(pageNumber);
      try {
        const content = await page.getTextContent();
        const text = textFromPdfItems(content.items as PdfTextItem[]);
        combinedText += text;
        if (textExceedsLimit(combinedText)) throw new PdfLimitError('text-length');
        pages.push({ pageNumber, text });
      } finally {
        page.cleanup();
      }
      onProgress(pageNumber, pdf.numPages);
      await yieldToBrowser();
    }
    return pages;
  } finally {
    await loadingTask.destroy();
  }
}
