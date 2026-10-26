import { PDFDocument, EncryptedPDFError } from 'pdf-lib';
import { EncryptedPdfError, InvalidPdfError, type PdfRect } from './logic';

export interface PdfInfo {
  pageCount: number;
  pageSizes: { width: number; height: number }[];
}

function loadPdf(bytes: Uint8Array, fileName: string): Promise<PDFDocument> {
  return PDFDocument.load(bytes).catch((caught: unknown) => {
    const message = caught instanceof Error ? `${caught.name} ${caught.message}` : String(caught);
    if (caught instanceof EncryptedPDFError || /encrypt|password/i.test(message)) throw new EncryptedPdfError(fileName);
    throw new InvalidPdfError(fileName);
  });
}

/** Reads document metadata in a worker so large PDFs do not block the interaction thread. */
export async function readPdfInfoCore(bytes: Uint8Array, fileName: string): Promise<PdfInfo> {
  const document = await loadPdf(bytes, fileName);
  return {
    pageCount: document.getPageCount(),
    pageSizes: document.getPages().map((page) => ({ width: page.getWidth(), height: page.getHeight() })),
  };
}

/** Adds one PNG signature layer without rasterizing or recompressing the original PDF pages. */
export async function signPdfCore(
  bytes: Uint8Array,
  fileName: string,
  pngBytes: Uint8Array,
  pageIndex: number,
  rect: PdfRect,
): Promise<Uint8Array> {
  const document = await loadPdf(bytes, fileName);
  const page = document.getPages()[pageIndex];
  if (!page) throw new InvalidPdfError(fileName);
  const image = await document.embedPng(pngBytes);
  page.drawImage(image, rect);
  return document.save();
}
