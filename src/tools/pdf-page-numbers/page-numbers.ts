/** Browser-only PDF reading and writing. Loaded only after the user chooses a PDF. */
import { yieldToBrowser } from '../../lib/browser';
import {
  EncryptedPdfError,
  InvalidPdfError,
  pageCountExceedsLimit,
  pageNumberPlacement,
  PdfLimitError,
  renderPageLabel,
  templateForFormat,
  type PageNumberSettings,
} from './logic';

async function loadPdfLib() {
  return import('pdf-lib');
}

/** Reads page count before enabling page-range controls. */
export async function readPdfPageCount(bytes: Uint8Array, fileName: string): Promise<number> {
  const { PDFDocument, EncryptedPDFError } = await loadPdfLib();
  try {
    const document = await PDFDocument.load(bytes);
    const pageCount = document.getPageCount();
    if (pageCountExceedsLimit(pageCount)) throw new PdfLimitError('page-count');
    return pageCount;
  } catch (caught) {
    if (caught instanceof PdfLimitError) throw caught;
    if (caught instanceof EncryptedPDFError) throw new EncryptedPdfError(fileName);
    throw new InvalidPdfError(fileName);
  }
}

/** Adds labels to selected one-based pages without rasterizing their existing content. */
export async function addPageNumbers(
  bytes: Uint8Array,
  fileName: string,
  selectedPages: number[],
  settings: PageNumberSettings,
  onProgress: (done: number, total: number) => void,
): Promise<Uint8Array> {
  const { PDFDocument, EncryptedPDFError, StandardFonts } = await loadPdfLib();
  try {
    const document = await PDFDocument.load(bytes);
    const pages = document.getPages();
    if (pageCountExceedsLimit(pages.length)) throw new PdfLimitError('page-count');
    const validSelection =
      selectedPages.length > 0 &&
      new Set(selectedPages).size === selectedPages.length &&
      selectedPages.every((page) => Number.isInteger(page) && page >= 1 && page <= pages.length);
    if (!validSelection) throw new InvalidPdfError(fileName);

    const font = await document.embedFont(StandardFonts.Helvetica);
    const total = settings.firstNumber + selectedPages.length - 1;
    const template = templateForFormat(settings.format);
    for (const [index, pageNumber] of selectedPages.entries()) {
      const page = pages[pageNumber - 1];
      const text = renderPageLabel(template, settings.firstNumber + index, total);
      const placement = pageNumberPlacement(
        settings.position,
        page.getWidth(),
        page.getHeight(),
        font.widthOfTextAtSize(text, settings.fontSize),
        settings.fontSize,
        settings.margin,
      );
      page.drawText(text, { ...placement, font, size: settings.fontSize });
      onProgress(index + 1, selectedPages.length);
      await yieldToBrowser();
    }
    return document.save();
  } catch (caught) {
    if (caught instanceof PdfLimitError || caught instanceof InvalidPdfError) throw caught;
    if (caught instanceof EncryptedPDFError) throw new EncryptedPdfError(fileName);
    throw new InvalidPdfError(fileName);
  }
}
