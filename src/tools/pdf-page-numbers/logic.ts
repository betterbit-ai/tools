/** Pure, browser-independent decisions for adding page numbers to a PDF. */

export const MAX_FILE_BYTES = 100 * 1024 * 1024;
export const MAX_PAGE_COUNT = 500;
export const MAX_PAGE_SELECTION_CHARS = 500;

export type PageNumberPosition =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export type PageNumberFormat = 'number' | 'page' | 'page-of-total' | 'fraction';

export interface PageNumberSettings {
  position: PageNumberPosition;
  format: PageNumberFormat;
  fontSize: number;
  margin: number;
  firstNumber: number;
}

export const DEFAULT_SETTINGS: PageNumberSettings = {
  position: 'bottom-center',
  format: 'page-of-total',
  fontSize: 10,
  margin: 28,
  firstNumber: 1,
};

const POSITIONS: readonly PageNumberPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

const FORMATS: readonly PageNumberFormat[] = ['number', 'page', 'page-of-total', 'fraction'];

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

/** Keeps persisted settings usable even if storage was written by an older version. */
export function normalizeSettings(value: Partial<PageNumberSettings>): PageNumberSettings {
  const position = POSITIONS.includes(value.position as PageNumberPosition)
    ? (value.position as PageNumberPosition)
    : DEFAULT_SETTINGS.position;
  const format = FORMATS.includes(value.format as PageNumberFormat)
    ? (value.format as PageNumberFormat)
    : DEFAULT_SETTINGS.format;
  const fontSize = clampInteger(value.fontSize, 6, 72, DEFAULT_SETTINGS.fontSize);
  const margin = clampInteger(value.margin, 0, 144, DEFAULT_SETTINGS.margin);
  const firstNumber = clampInteger(value.firstNumber, 0, 999_999, DEFAULT_SETTINGS.firstNumber);
  return { position, format, fontSize, margin, firstNumber };
}

function clampInteger(value: number | undefined, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value!)));
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

export class PageRangeTooLongError extends Error {
  constructor() {
    super(`Page selection must be ${MAX_PAGE_SELECTION_CHARS} characters or fewer.`);
    this.name = 'PageRangeTooLongError';
  }
}

/** Parses familiar range notation such as "1, 3-5, 8" into ascending unique pages. */
export function parsePageSelection(input: string, pageCount: number): number[] {
  if (!Number.isInteger(pageCount) || pageCount < 1) throw new PageRangeOutOfBoundsError(1, pageCount);
  if (input.length > MAX_PAGE_SELECTION_CHARS) throw new PageRangeTooLongError();
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

export function formatPageSelection(pages: number[]): string {
  if (!pages.length) return '';
  const sorted = [...new Set(pages)].filter(Number.isSafeInteger).sort((a, b) => a - b);
  const parts: string[] = [];
  for (let index = 0; index < sorted.length;) {
    const start = sorted[index];
    let end = start;
    while (sorted[index + 1] === end + 1) end = sorted[++index];
    parts.push(start === end ? String(start) : `${start}-${end}`);
    index++;
  }
  return parts.join(', ');
}

export function templateForFormat(format: PageNumberFormat): string {
  switch (format) {
    case 'number':
      return '{n}';
    case 'page':
      return 'Page {n}';
    case 'fraction':
      return '{n}/{total}';
    case 'page-of-total':
      return 'Page {n} of {total}';
  }
}

/** Replaces every placeholder without treating user-visible Unicode text specially. */
export function renderPageLabel(template: string, number: number, total: number): string {
  return template.replaceAll('{n}', String(number)).replaceAll('{total}', String(total));
}

export interface PageNumberPlacement {
  x: number;
  y: number;
}

/** Calculates the pdf-lib drawText baseline for any physical page size. */
export function pageNumberPlacement(
  position: PageNumberPosition,
  pageWidth: number,
  pageHeight: number,
  textWidth: number,
  fontSize: number,
  margin: number,
): PageNumberPlacement {
  const horizontal = position.endsWith('left')
    ? margin
    : position.endsWith('right')
      ? pageWidth - margin - textWidth
      : (pageWidth - textWidth) / 2;
  const vertical = position.startsWith('top') ? pageHeight - margin - fontSize : margin;
  return { x: horizontal, y: vertical };
}

/** Preserves meaningful Unicode while preventing a downloaded filename from containing a path. */
export function numberedPdfFileName(fileName: string): string {
  const base =
    fileName
      .trim()
      .replace(/[\\/\0]/g, '_')
      .replace(/\.pdf$/i, '') || 'document';
  return `${base}_numbered.pdf`;
}

export class InvalidPdfError extends Error {
  constructor(fileName: string) {
    super(`"${fileName}" is not a readable PDF file.`);
    this.name = 'InvalidPdfError';
  }
}

export class EncryptedPdfError extends Error {
  constructor(fileName: string) {
    super(`"${fileName}" is password-protected and cannot be numbered.`);
    this.name = 'EncryptedPdfError';
  }
}

export class PdfLimitError extends Error {
  constructor(public readonly limit: 'page-count') {
    super(`PDF exceeds the ${limit} limit.`);
    this.name = 'PdfLimitError';
  }
}
