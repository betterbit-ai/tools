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

/** Safe browser limits; pages are rasterized one at a time, then retained as compressed JPEGs. */
export const MAX_FILE_BYTES = 100 * 1024 * 1024;
export const MAX_PAGE_COUNT = 500;
export const MAX_RASTER_PIXELS = 20_000_000;
export const MAX_RASTER_DIMENSION = 16_384;

export type CompressionLimit = 'page-count';

export function fileExceedsLimit(bytes: number): boolean {
  return !Number.isFinite(bytes) || bytes < 0 || bytes > MAX_FILE_BYTES;
}

export function pageCountExceedsLimit(pageCount: number): boolean {
  return !Number.isInteger(pageCount) || pageCount < 1 || pageCount > MAX_PAGE_COUNT;
}

/**
 * Returns a page render scale that honors the chosen DPI where possible and
 * safely reduces unusually large page sizes instead of rejecting the PDF.
 */
export function rasterScaleForPage(widthPoints: number, heightPoints: number, dpi: number): number {
  if (
    !Number.isFinite(widthPoints) ||
    !Number.isFinite(heightPoints) ||
    !Number.isFinite(dpi) ||
    widthPoints <= 0 ||
    heightPoints <= 0 ||
    dpi <= 0
  ) {
    return 0;
  }

  const requestedScale = dpi / 72;
  const requestedWidth = Math.ceil(widthPoints * requestedScale);
  const requestedHeight = Math.ceil(heightPoints * requestedScale);
  if (
    requestedWidth <= MAX_RASTER_DIMENSION &&
    requestedHeight <= MAX_RASTER_DIMENSION &&
    requestedWidth * requestedHeight <= MAX_RASTER_PIXELS
  ) {
    return requestedScale;
  }

  const boundedScale = Math.min(
    MAX_RASTER_DIMENSION / widthPoints,
    MAX_RASTER_DIMENSION / heightPoints,
    Math.sqrt(MAX_RASTER_PIXELS / (widthPoints * heightPoints)),
  );
  const pixelWidth = Math.max(1, Math.floor(widthPoints * boundedScale));
  const pixelHeight = Math.max(1, Math.floor(heightPoints * boundedScale));
  return Math.min((pixelWidth - 0.01) / widthPoints, (pixelHeight - 0.01) / heightPoints);
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

/** Work was intentionally stopped because the user selected another file or cleared this one. */
export class CompressionCancelledError extends Error {
  constructor() {
    super('PDF compression was cancelled.');
    this.name = 'CompressionCancelledError';
  }
}
