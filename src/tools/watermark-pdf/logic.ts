/** Pure, browser-independent rules for the PDF watermark tool. */

export type WatermarkMode = 'text' | 'image';
export type WatermarkLayout = 'single' | 'tile';
export type WatermarkPosition =
  'top-left' | 'top' | 'top-right' | 'left' | 'center' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right';
export type PageMode = 'all' | 'odd' | 'even' | 'custom';

export interface WatermarkOptions {
  mode: WatermarkMode;
  text: string;
  layout: WatermarkLayout;
  position: WatermarkPosition;
  size: number;
  opacity: number;
  rotation: number;
  pageMode: PageMode;
  pageRanges: string;
}

export const MAX_FILE_BYTES = 100 * 1024 * 1024;
export const MAX_TEXT_LENGTH = 120;

export class PdfWatermarkCancelledError extends Error {
  constructor() {
    super('PDF watermarking was cancelled.');
    this.name = 'PdfWatermarkCancelledError';
  }
}

export class EncryptedPdfError extends Error {
  constructor() {
    super('This PDF is password-protected.');
    this.name = 'EncryptedPdfError';
  }
}

export class InvalidPdfError extends Error {
  constructor() {
    super('This PDF cannot be read.');
    this.name = 'InvalidPdfError';
  }
}

export const DEFAULT_OPTIONS: WatermarkOptions = {
  mode: 'text',
  text: 'CONFIDENTIAL',
  layout: 'single',
  position: 'center',
  size: 38,
  opacity: 28,
  rotation: -35,
  pageMode: 'all',
  pageRanges: '',
};

const POSITIONS: WatermarkPosition[] = [
  'top-left',
  'top',
  'top-right',
  'left',
  'center',
  'right',
  'bottom-left',
  'bottom',
  'bottom-right',
];

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Trims by grapheme so a Korean syllable or emoji sequence is never split. */
export function normalizeText(value: string): string {
  const trimmed = value.trim();
  if ('Segmenter' in Intl) {
    return Array.from(new Intl.Segmenter().segment(trimmed), ({ segment }) => segment)
      .slice(0, MAX_TEXT_LENGTH)
      .join('');
  }
  return Array.from(trimmed).slice(0, MAX_TEXT_LENGTH).join('');
}

export function normalizeOptions(value: Partial<WatermarkOptions>): WatermarkOptions {
  const position = POSITIONS.includes(value.position as WatermarkPosition)
    ? (value.position as WatermarkPosition)
    : DEFAULT_OPTIONS.position;
  return {
    mode: value.mode === 'image' ? 'image' : 'text',
    text: normalizeText(value.text ?? DEFAULT_OPTIONS.text),
    layout: value.layout === 'tile' ? 'tile' : 'single',
    position,
    size: clamp(value.size ?? DEFAULT_OPTIONS.size, 5, 80),
    opacity: clamp(value.opacity ?? DEFAULT_OPTIONS.opacity, 0, 100),
    rotation: clamp(value.rotation ?? DEFAULT_OPTIONS.rotation, -90, 90),
    pageMode:
      value.pageMode === 'odd' || value.pageMode === 'even' || value.pageMode === 'custom' ? value.pageMode : 'all',
    pageRanges: (value.pageRanges ?? '').trim().slice(0, 500),
  };
}

export function isPdfFile(fileName: string, mimeType: string): boolean {
  return mimeType === 'application/pdf' || /\.pdf$/i.test(fileName.trim());
}

export function fileExceedsLimit(bytes: number): boolean {
  return !Number.isFinite(bytes) || bytes <= 0 || bytes > MAX_FILE_BYTES;
}

export function watermarkedPdfFileName(fileName: string): string {
  const base = fileName.trim().replace(/\.pdf$/i, '') || 'document';
  return `${base}_watermarked.pdf`;
}

/**
 * Parses familiar PDF page syntax such as "1-3, 5, 8-10". Page numbers are
 * one-based in the UI and become zero-based indexes for pdf-lib.
 */
export function parsePageRanges(
  value: string,
  pageCount: number,
): { indexes: number[]; error?: 'empty' | 'syntax' | 'range' } {
  if (!Number.isInteger(pageCount) || pageCount < 1) return { indexes: [], error: 'range' };
  const source = value.trim();
  if (!source) return { indexes: [], error: 'empty' };
  const pages = new Set<number>();
  for (const part of source.split(',')) {
    const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) return { indexes: [], error: 'syntax' };
    const first = Number(match[1]);
    const last = Number(match[2] ?? match[1]);
    if (!Number.isSafeInteger(first) || !Number.isSafeInteger(last) || first < 1 || last < first || last > pageCount) {
      return { indexes: [], error: 'range' };
    }
    for (let page = first; page <= last; page++) pages.add(page - 1);
  }
  return { indexes: [...pages].sort((a, b) => a - b) };
}

export function selectedPageIndexes(
  options: WatermarkOptions,
  pageCount: number,
): { indexes: number[]; error?: 'empty' | 'syntax' | 'range' } {
  if (!Number.isInteger(pageCount) || pageCount < 1) return { indexes: [], error: 'range' };
  if (options.pageMode === 'custom') return parsePageRanges(options.pageRanges, pageCount);
  const indexes = Array.from({ length: pageCount }, (_, index) => index).filter((index) => {
    const page = index + 1;
    return options.pageMode === 'all' || (options.pageMode === 'odd' ? page % 2 === 1 : page % 2 === 0);
  });
  return { indexes };
}

export interface Point {
  x: number;
  y: number;
}

/** Returns an unrotated lower-left drawing origin with a 5% page margin. */
export function watermarkPosition(
  pageWidth: number,
  pageHeight: number,
  markWidth: number,
  markHeight: number,
  position: WatermarkPosition,
): Point {
  const margin = Math.min(pageWidth, pageHeight) * 0.05;
  const centeredX = (pageWidth - markWidth) / 2;
  const centeredY = (pageHeight - markHeight) / 2;
  const x = position.includes('left')
    ? margin
    : position.includes('right')
      ? pageWidth - markWidth - margin
      : centeredX;
  const y = position.startsWith('top')
    ? pageHeight - markHeight - margin
    : position.startsWith('bottom')
      ? margin
      : centeredY;
  return { x: Math.max(0, x), y: Math.max(0, y) };
}
