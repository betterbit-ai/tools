import { EncryptedPdfError, InvalidPdfError } from './logic';

/** Copies complete PDF pages into the requested order without rasterizing them. */
export async function writeReorderedPdf(bytes: Uint8Array, fileName: string, pageOrder: number[]): Promise<Uint8Array> {
  const { PDFDocument, EncryptedPDFError } = await import('pdf-lib');
  try {
    const source = await PDFDocument.load(bytes);
    const pageCount = source.getPageCount();
    const validOrder =
      pageOrder.length === pageCount &&
      new Set(pageOrder).size === pageCount &&
      pageOrder.every((page) => Number.isInteger(page) && page >= 1 && page <= pageCount);
    if (!validOrder) throw new InvalidPdfError(fileName);
    const output = await PDFDocument.create();
    const copiedPages = await output.copyPages(
      source,
      pageOrder.map((page) => page - 1),
    );
    copiedPages.forEach((page) => output.addPage(page));
    return output.save();
  } catch (caught) {
    if (caught instanceof EncryptedPDFError) throw new EncryptedPdfError(fileName);
    if (caught instanceof InvalidPdfError) throw caught;
    throw new InvalidPdfError(fileName);
  }
}
