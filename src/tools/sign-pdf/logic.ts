/**
 * Pure decisions for sign-pdf: PDF validation, page/placement math and the
 * freehand-stroke emptiness check. Rendering pages and embedding the
 * signature image are browser-only work in sign.ts.
 */

export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_PAGE_COUNT = 500;

export function isPdfFile(fileName: string, mimeType: string): boolean {
  return mimeType === 'application/pdf' || /\.pdf$/i.test(fileName.trim());
}

export function fileExceedsLimit(bytes: number): boolean {
  return !Number.isFinite(bytes) || bytes < 0 || bytes > MAX_FILE_BYTES;
}

export function pageCountExceedsLimit(pageCount: number): boolean {
  return !Number.isInteger(pageCount) || pageCount < 1 || pageCount > MAX_PAGE_COUNT;
}

export class InvalidPdfError extends Error {
  constructor(fileName: string) {
    super(`"${fileName}" is not a readable PDF file.`);
    this.name = 'InvalidPdfError';
  }
}

export class EncryptedPdfError extends Error {
  constructor(fileName: string) {
    super(`"${fileName}" is password-protected and can't be signed.`);
    this.name = 'EncryptedPdfError';
  }
}

/** Suggested download name, preserving Unicode names and stripping only a final .pdf. */
export function signedFileName(fileName: string): string {
  const base = fileName.trim().replace(/\.pdf$/i, '') || 'document';
  return `${base}_signed.pdf`;
}

/** Clamps a 1-based page number into [1, pageCount], defaulting to the last page when invalid. */
export function clampPageNumber(page: number, pageCount: number): number {
  if (!Number.isInteger(pageCount) || pageCount < 1) return 1;
  if (!Number.isInteger(page)) return pageCount;
  return Math.min(Math.max(page, 1), pageCount);
}

/**
 * Where the signature sits on a page, as ratios of the page's own size so the
 * same placement works regardless of preview zoom or page dimensions. x/y are
 * measured from the page's top-left corner (matching screen coordinates).
 */
export interface Placement {
  xRatio: number;
  yRatio: number;
  widthRatio: number;
}

/** Fixed height:width ratio shared by the drawing pad, the typed-text canvas and every placement. */
export const SIGNATURE_ASPECT = 1 / 3;

export const DEFAULT_PLACEMENT: Placement = { xRatio: 0.55, yRatio: 0.8, widthRatio: 0.32 };
export const MIN_WIDTH_RATIO = 0.12;
export const MAX_WIDTH_RATIO = 0.6;
export const NUDGE_STEP = 0.02;

export const SIZE_PRESETS = { sm: 0.18, md: 0.32, lg: 0.48 } as const;
export type SizePreset = keyof typeof SIZE_PRESETS;

function clampNumber(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  if (min > max) return fallback;
  return Math.min(Math.max(value, min), max);
}

/** Keeps a placement box fully inside the page, given its height ratio (width * SIGNATURE_ASPECT). */
export function clampPlacement(placement: Placement): Placement {
  const widthRatio = clampNumber(placement.widthRatio, MIN_WIDTH_RATIO, MAX_WIDTH_RATIO, DEFAULT_PLACEMENT.widthRatio);
  const heightRatio = widthRatio * SIGNATURE_ASPECT;
  const xRatio = clampNumber(placement.xRatio, 0, Math.max(0, 1 - widthRatio), 0);
  const yRatio = clampNumber(placement.yRatio, 0, Math.max(0, 1 - heightRatio), 0);
  return { xRatio, yRatio, widthRatio };
}

/** Applies a drag of (dxPx, dyPx) over a container of the given pixel size to a placement. */
export function dragPlacement(
  placement: Placement,
  dxPx: number,
  dyPx: number,
  containerWidthPx: number,
  containerHeightPx: number,
): Placement {
  if (containerWidthPx <= 0 || containerHeightPx <= 0) return placement;
  return {
    ...placement,
    xRatio: placement.xRatio + dxPx / containerWidthPx,
    yRatio: placement.yRatio + dyPx / containerHeightPx,
  };
}

/** Moves a placement by whole nudge steps, e.g. from arrow-key presses. */
export function nudgePlacement(placement: Placement, dx: -1 | 0 | 1, dy: -1 | 0 | 1): Placement {
  return {
    ...placement,
    xRatio: placement.xRatio + dx * NUDGE_STEP,
    yRatio: placement.yRatio + dy * NUDGE_STEP,
  };
}

export interface PdfRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Converts a page-ratio placement into a PDF-space rect (pdf-lib's origin is the page's bottom-left). */
export function placementToPdfRect(placement: Placement, pageWidth: number, pageHeight: number): PdfRect {
  if (!Number.isFinite(pageWidth) || !Number.isFinite(pageHeight) || pageWidth <= 0 || pageHeight <= 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  const width = placement.widthRatio * pageWidth;
  const height = width * SIGNATURE_ASPECT;
  const x = placement.xRatio * pageWidth;
  const y = pageHeight - placement.yRatio * pageHeight - height;
  return { x, y, width, height };
}

/* ───────────── Signature strokes ───────────── */

export interface StrokePoint {
  x: number;
  y: number;
}
export type Stroke = StrokePoint[];

/** True when there is no visible ink: no strokes, or every stroke is a single dot. */
export function isSignatureBlank(strokes: Stroke[]): boolean {
  return strokes.every((stroke) => stroke.length < 2);
}

export type SignatureMode = 'draw' | 'type';

/**
 * Signature ink is always dark, regardless of the site's light/dark theme —
 * it lands on a white PDF page, the same way compress-pdf always fills scan
 * backgrounds with white.
 */
export const INK_COLOR = '#182030';

/** CSS font stack for the typed-signature canvas: script fonts first, generic cursive as the final fallback. */
export const TYPED_SIGNATURE_FONT = "'Segoe Script', 'Bradley Hand', 'Apple Chancery', cursive";

/** True once there is a usable signature to place, for either input mode. */
export function hasSignature(mode: SignatureMode, strokes: Stroke[], typedText: string): boolean {
  return mode === 'draw' ? !isSignatureBlank(strokes) : typedText.trim().length > 0;
}
