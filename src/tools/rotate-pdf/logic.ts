/** Pure, browser-independent decisions used by the PDF preview and writer. */

export const MAX_FILE_BYTES = 250 * 1024 * 1024;
export const MAX_PAGE_COUNT = 500;
export const PREVIEW_SCALE = 0.2;
export const MAX_PREVIEW_PIXELS = 120_000;

export type Rotation = 0 | 90 | 180 | 270;

export function isPdfFile(fileName: string, mimeType: string): boolean {
  return mimeType === 'application/pdf' || /\.pdf$/i.test(fileName.trim());
}

export function fileExceedsLimit(bytes: number): boolean {
  return !Number.isFinite(bytes) || bytes < 0 || bytes > MAX_FILE_BYTES;
}

export function pageCountExceedsLimit(pageCount: number): boolean {
  return !Number.isInteger(pageCount) || pageCount < 1 || pageCount > MAX_PAGE_COUNT;
}

/** Converts any complete number of degrees to one of the four PDF rotation values. */
export function normalizeRotation(degrees: number): Rotation {
  if (!Number.isFinite(degrees) || !Number.isInteger(degrees) || degrees % 90 !== 0) return 0;
  return (((degrees % 360) + 360) % 360) as Rotation;
}

/** Adds a clockwise turn without ever producing an invalid PDF rotation value. */
export function rotateBy(current: number, degrees: number): Rotation {
  return normalizeRotation(normalizeRotation(current) + normalizeRotation(degrees));
}

export function initialRotations(pageCount: number): Rotation[] {
  if (pageCountExceedsLimit(pageCount)) return [];
  return Array.from({ length: pageCount }, () => 0 as Rotation);
}

/** Returns a new array: page state is never mutated while a thumbnail is rendering. */
export function rotatePage(rotations: Rotation[], pageIndex: number, degrees: number): Rotation[] {
  if (!Number.isInteger(pageIndex) || pageIndex < 0 || pageIndex >= rotations.length) return rotations;
  return rotations.map((rotation, index) => (index === pageIndex ? rotateBy(rotation, degrees) : rotation));
}

export function rotateAll(rotations: Rotation[], degrees: number): Rotation[] {
  return rotations.map((rotation) => rotateBy(rotation, degrees));
}

export function resetRotations(pageCount: number): Rotation[] {
  return initialRotations(pageCount);
}

/** The preview already contains the source PDF's rotation, so only show the new turn. */
export function previewRotation(current: number, source: number): Rotation {
  return normalizeRotation(normalizeRotation(current) - normalizeRotation(source));
}

/** Keeps preview canvases bounded even for a PDF with an unusually large page box. */
export function previewScale(width: number, height: number): number {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return 0;
  return Math.min(PREVIEW_SCALE, Math.sqrt(MAX_PREVIEW_PIXELS / (width * height)));
}

/** Retains Unicode names and makes it clear that the source file was untouched. */
export function rotatedPdfFileName(fileName: string): string {
  const base = fileName.trim().replace(/\.pdf$/i, '') || 'document';
  return `${base}_rotated.pdf`;
}

export class InvalidPdfError extends Error {
  constructor(fileName: string) {
    super(`"${fileName}" is not a readable PDF file.`);
  }
}

export class EncryptedPdfError extends Error {
  constructor(fileName: string) {
    super(`"${fileName}" is password-protected and cannot be rotated.`);
  }
}

export class PdfLimitError extends Error {
  constructor() {
    super(`PDF has more than ${MAX_PAGE_COUNT} pages.`);
  }
}

export class PdfOperationCancelledError extends Error {
  constructor() {
    super('PDF rotation was cancelled.');
    this.name = 'PdfOperationCancelledError';
  }
}
