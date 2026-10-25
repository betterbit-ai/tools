/** Pure, browser-independent decisions for extracting selectable PDF text. */

export const MAX_FILE_BYTES = 100 * 1024 * 1024;
export const MAX_PAGE_COUNT = 500;
export const MAX_TEXT_CHARACTERS = 10_000_000;

export interface PdfTextItem {
  str: string;
  hasEOL?: boolean;
}

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export function isPdfFile(fileName: string, mimeType: string): boolean {
  const mediaType = mimeType.trim().toLowerCase().split(';', 1)[0];
  return mediaType === 'application/pdf' || /\.pdf$/i.test(fileName.trim());
}

export function fileExceedsLimit(bytes: number): boolean {
  return !Number.isFinite(bytes) || bytes < 0 || bytes > MAX_FILE_BYTES;
}

export function pageCountExceedsLimit(pageCount: number): boolean {
  return !Number.isInteger(pageCount) || pageCount < 1 || pageCount > MAX_PAGE_COUNT;
}

/** Counts Unicode code points, so one astral character is not reported as two UTF-16 units. */
export function characterCount(text: string): number {
  return Array.from(text).length;
}

export function textExceedsLimit(text: string): boolean {
  return characterCount(text) > MAX_TEXT_CHARACTERS;
}

/** Rebuilds explicit PDF line endings without inventing layout from positioned glyphs. */
export function textFromPdfItems(items: readonly PdfTextItem[]): string {
  let output = '';
  for (const item of items) {
    if (typeof item.str !== 'string') continue;
    output += item.str;
    if (item.hasEOL && !output.endsWith('\n')) output += '\n';
  }
  return output.replace(/[ \t]+\n/g, '\n').trimEnd();
}

/** Joins pages as plain text; individual page boundaries remain visible in the interface. */
export function joinPageText(pages: readonly ExtractedPage[]): string {
  return pages.map((page) => page.text).join('\n\n');
}

/** Keeps Unicode names but prevents a downloaded TXT filename from containing a path. */
export function extractedTextFileName(fileName: string): string {
  const base =
    fileName
      .trim()
      .replace(/[\\/\0]/g, '_')
      .replace(/\.pdf$/i, '') || 'document';
  return `${base}.txt`;
}

export class InvalidPdfError extends Error {
  constructor(fileName: string) {
    super(`"${fileName}" is not a readable PDF file.`);
    this.name = 'InvalidPdfError';
  }
}

export class EncryptedPdfError extends Error {
  constructor(fileName: string) {
    super(`"${fileName}" is password-protected and cannot be read.`);
    this.name = 'EncryptedPdfError';
  }
}

export class PdfLimitError extends Error {
  constructor(public readonly limit: 'page-count' | 'text-length') {
    super(`PDF exceeds the ${limit} limit.`);
    this.name = 'PdfLimitError';
  }
}
