/** Pure, browser-independent decisions for local PDF page deletion. */

export const MAX_FILE_BYTES = 250 * 1024 * 1024;
export const MAX_PAGE_COUNT = 500;
export const PREVIEW_SCALE = 0.2;
export const MAX_PREVIEW_PIXELS = 120_000;

export function isPdfFile(fileName: string, mimeType: string): boolean {
  return mimeType === 'application/pdf' || /\.pdf$/i.test(fileName.trim());
}

export function fileExceedsLimit(bytes: number): boolean {
  return !Number.isFinite(bytes) || bytes < 0 || bytes > MAX_FILE_BYTES;
}

export function pageCountExceedsLimit(pageCount: number): boolean {
  return !Number.isInteger(pageCount) || pageCount < 1 || pageCount > MAX_PAGE_COUNT;
}

/** Keeps thumbnail canvases bounded for unusually large PDF page boxes. */
export function previewScale(width: number, height: number): number {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return 0;
  return Math.min(PREVIEW_SCALE, Math.sqrt(MAX_PREVIEW_PIXELS / (width * height)));
}

export class PageRangeSyntaxError extends Error {
  constructor(public readonly part: string) {
    super(`\"${part}\" is not a valid page range.`);
    this.name = 'PageRangeSyntaxError';
  }
}

export class PageRangeOutOfBoundsError extends Error {
  constructor(
    public readonly page: number,
    public readonly pageCount: number,
  ) {
    super(`Page ${page} is outside 1–${pageCount}.`);
    this.name = 'PageRangeOutOfBoundsError';
  }
}

/**
 * Parses page numbers such as "1, 3-5, 8". The result is ascending and
 * deduplicated so a preview click and a range entry always resolve alike.
 */
export function parsePageSelection(input: string, pageCount: number): number[] {
  if (!Number.isInteger(pageCount) || pageCount < 1) throw new PageRangeOutOfBoundsError(1, pageCount);
  if (!input.trim()) return [];

  const pages = new Set<number>();
  for (const rawPart of input.split(',')) {
    const part = rawPart.trim();
    if (!part) throw new PageRangeSyntaxError(rawPart);
    const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(part);
    if (!match) throw new PageRangeSyntaxError(part);
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 1 || end < start) {
      throw new PageRangeSyntaxError(part);
    }
    if (start > pageCount) throw new PageRangeOutOfBoundsError(start, pageCount);
    if (end > pageCount) throw new PageRangeOutOfBoundsError(end, pageCount);
    for (let page = start; page <= end; page++) pages.add(page);
  }
  return [...pages].sort((a, b) => a - b);
}

/** Writes a compact, human-editable range string back after thumbnail clicks. */
export function formatPageSelection(pages: number[]): string {
  const unique = [...new Set(pages.filter((page) => Number.isSafeInteger(page) && page > 0))].sort((a, b) => a - b);
  const ranges: string[] = [];
  for (let start = 0; start < unique.length;) {
    let end = start;
    while (unique[end + 1] === unique[end] + 1) end++;
    ranges.push(unique[start] === unique[end] ? String(unique[start]) : `${unique[start]}-${unique[end]}`);
    start = end + 1;
  }
  return ranges.join(', ');
}

/** Adds or removes one page without allowing an empty output PDF. */
export function toggleDeletedPage(deletedPages: number[], page: number, pageCount: number): number[] {
  if (!Number.isInteger(page) || page < 1 || page > pageCount || !Number.isInteger(pageCount) || pageCount < 1) {
    return deletedPages;
  }
  const current = new Set(deletedPages.filter((value) => Number.isInteger(value) && value >= 1 && value <= pageCount));
  if (current.has(page)) {
    current.delete(page);
  } else {
    if (current.size >= pageCount - 1) return [...current].sort((a, b) => a - b);
    current.add(page);
  }
  return [...current].sort((a, b) => a - b);
}

export function remainingPageCount(deletedPages: number[], pageCount: number): number {
  const valid = new Set(deletedPages.filter((page) => Number.isInteger(page) && page >= 1 && page <= pageCount));
  return Math.max(0, pageCount - valid.size);
}

/** Retains Unicode names and ensures the source file is never overwritten. */
export function deletedPdfFileName(fileName: string): string {
  const base = fileName.trim().replace(/\.pdf$/i, '') || 'document';
  return `${base}_pages-deleted.pdf`;
}

export class InvalidPdfError extends Error {
  constructor(fileName: string) {
    super(`\"${fileName}\" is not a readable PDF file.`);
  }
}

export class EncryptedPdfError extends Error {
  constructor(fileName: string) {
    super(`\"${fileName}\" is password-protected and cannot be edited.`);
  }
}

export class PdfLimitError extends Error {
  constructor() {
    super(`PDF has more than ${MAX_PAGE_COUNT} pages.`);
  }
}

export class PdfOperationCancelledError extends Error {
  constructor() {
    super('PDF processing was cancelled.');
    this.name = 'PdfOperationCancelledError';
  }
}
