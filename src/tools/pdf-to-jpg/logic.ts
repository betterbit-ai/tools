/**
 * Pure decisions for PDF-to-JPG conversion. Canvas rendering lives in
 * convert.ts, keeping selection, naming, and browser safety rules testable.
 */

export type Resolution = 'screen' | 'standard' | 'print';

export interface ResolutionPreset {
  dpi: number;
}

/** PDF user space uses 72 points per inch. */
export const RESOLUTION_PRESETS: Record<Resolution, ResolutionPreset> = {
  screen: { dpi: 96 },
  standard: { dpi: 150 },
  print: { dpi: 300 },
};

/** Conservative limits keep a local conversion from exhausting browser memory. */
export const MAX_FILE_BYTES = 100 * 1024 * 1024;
export const MAX_PAGE_COUNT = 100;
export const MAX_RASTER_PIXELS = 20_000_000;
export const MAX_TOTAL_RASTER_PIXELS = 100_000_000;

export type PdfToJpgLimit = 'file-size' | 'page-count' | 'page-pixels' | 'total-pixels';

export function fileExceedsLimit(bytes: number): boolean {
  return !Number.isFinite(bytes) || bytes < 0 || bytes > MAX_FILE_BYTES;
}

export function pageCountExceedsLimit(pageCount: number): boolean {
  return !Number.isInteger(pageCount) || pageCount < 1 || pageCount > MAX_PAGE_COUNT;
}

export function pageExceedsRasterLimit(width: number, height: number): boolean {
  return (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0 ||
    Math.ceil(width) * Math.ceil(height) > MAX_RASTER_PIXELS
  );
}

export function totalRasterExceedsLimit(pixels: number): boolean {
  return !Number.isFinite(pixels) || pixels < 1 || pixels > MAX_TOTAL_RASTER_PIXELS;
}

export function isPdfFile(fileName: string, mimeType: string): boolean {
  return mimeType === 'application/pdf' || /\.pdf$/i.test(fileName.trim());
}

export class PageRangeSyntaxError extends Error {
  constructor(public readonly part: string) {
    super(`"${part}" is not a valid page range.`);
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
 * Parses familiar page selection notation such as "1, 3-5, 8". Empty and
 * "all" select every page. Output is ascending and deduplicated so a page
 * can never be rendered and downloaded twice by accident.
 */
export function parsePageSelection(input: string, pageCount: number): number[] {
  if (!Number.isInteger(pageCount) || pageCount < 1) throw new PageRangeOutOfBoundsError(1, pageCount);
  const normalized = input.trim().toLowerCase();
  if (!normalized || normalized === 'all') return Array.from({ length: pageCount }, (_, index) => index + 1);

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

export function renderScale(resolution: Resolution): number {
  return RESOLUTION_PRESETS[resolution].dpi / 72;
}

/** Preserves Unicode file names and pads page numbers to the document's width. */
export function jpgFileName(fileName: string, pageNumber: number, pageCount: number): string {
  const base = fileName.trim().replace(/\.pdf$/i, '') || 'document';
  const width = Math.max(1, String(Math.max(1, pageCount)).length);
  return `${base}_page-${String(pageNumber).padStart(width, '0')}.jpg`;
}

export function zipFileName(fileName: string): string {
  const base = fileName.trim().replace(/\.pdf$/i, '') || 'document';
  return `${base}_jpg.zip`;
}

export class InvalidPdfError extends Error {
  constructor(fileName: string) {
    super(`"${fileName}" is not a readable PDF file.`);
    this.name = 'InvalidPdfError';
  }
}

export class EncryptedPdfError extends Error {
  constructor(fileName: string) {
    super(`"${fileName}" is password-protected and cannot be converted.`);
    this.name = 'EncryptedPdfError';
  }
}

export class PdfLimitError extends Error {
  constructor(public readonly limit: PdfToJpgLimit) {
    super(`PDF exceeds the ${limit} limit.`);
    this.name = 'PdfLimitError';
  }
}
