import { EncryptedPdfError, InvalidPdfError } from './logic';

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
