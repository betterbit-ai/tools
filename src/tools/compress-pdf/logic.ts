/**
 * Pure decisions for PDF compression. Rendering pages and writing the PDF are
 * browser-only work in compress.ts; keeping these values here makes the
 * quality trade-offs explicit and testable.
 */

export type CompressionLevel = 'balanced' | 'smaller' | 'smallest';

export interface CompressionPreset {
  /** Page rasterization resolution. PDF user space is 72 points per inch. */
  dpi: number;
  /** JPEG encoder quality from 0 to 1. */
  quality: number;
}

/**
 * Three deliberately distinct scan/image presets. The lowest option remains
 * above the common 72 dpi screen baseline so ordinary text stays readable.
 */
export const COMPRESSION_PRESETS: Record<CompressionLevel, CompressionPreset> = {
  balanced: { dpi: 150, quality: 0.78 },
  smaller: { dpi: 110, quality: 0.65 },
  smallest: { dpi: 80, quality: 0.5 },
};

/** Safe browser limits; pages are rasterized one at a time, then retained in the output PDF. */
export const MAX_FILE_BYTES = 100 * 1024 * 1024;
export const MAX_PAGE_COUNT = 100;
export const MAX_RASTER_PIXELS = 20_000_000;
export const MAX_TOTAL_RASTER_PIXELS = 60_000_000;

export type CompressionLimit = 'file-size' | 'page-count' | 'page-pixels' | 'total-pixels';

export function fileExceedsLimit(bytes: number): boolean {
  return !Number.isFinite(bytes) || bytes < 0 || bytes > MAX_FILE_BYTES;
}

export function pageCountExceedsLimit(pageCount: number): boolean {
  return !Number.isInteger(pageCount) || pageCount < 1 || pageCount > MAX_PAGE_COUNT;
}

/** Checks the actual canvas allocation after PDF points have been scaled to the selected DPI. */
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

/** Suggested download name, retaining Unicode names and stripping only a final .pdf. */
export function compressedFileName(fileName: string): string {
  const base = fileName.trim().replace(/\.pdf$/i, '') || 'document';
  return `${base}_compressed.pdf`;
}

export type SizeChange =
  { kind: 'smaller'; percent: number } | { kind: 'larger'; percent: number } | { kind: 'same'; percent: 0 };

/**
 * Describes the output size relative to the source. Zero and malformed sizes
 * deliberately yield "same" instead of NaN/Infinity in a live UI.
 */
export function sizeChange(before: number, after: number): SizeChange {
  if (!Number.isFinite(before) || !Number.isFinite(after) || before <= 0 || after < 0) {
    return { kind: 'same', percent: 0 };
  }
  if (after === before) return { kind: 'same', percent: 0 };
  const percent = Math.round((Math.abs(before - after) / before) * 100);
  return after < before ? { kind: 'smaller', percent } : { kind: 'larger', percent };
}

export class InvalidPdfError extends Error {
  constructor(fileName: string) {
    super(`"${fileName}" is not a readable PDF file.`);
    this.name = 'InvalidPdfError';
  }
}

export class EncryptedPdfError extends Error {
  constructor(fileName: string) {
    super(`"${fileName}" is password-protected and cannot be compressed.`);
    this.name = 'EncryptedPdfError';
  }
}

export class PdfLimitError extends Error {
  constructor(public readonly limit: CompressionLimit) {
    super(`PDF exceeds the ${limit} limit.`);
    this.name = 'PdfLimitError';
  }
}
