import { EncryptedPdfError, InvalidPdfError, type Rotation } from './logic';

/** Writes only page rotation metadata; page content is not rasterized or recompressed. */
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
