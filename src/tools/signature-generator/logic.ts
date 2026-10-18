/**
 * Pure signature-generator decisions. Canvas drawing and PNG encoding live in
 * render.ts so this module can be tested without a browser.
 */

export const MAX_SIGNATURE_TEXT_LENGTH = 80;
export const SIGNATURE_WIDTH = 1200;
export const SIGNATURE_HEIGHT = 400;
export const EXPORT_PADDING = 36;

export type SignatureMode = 'type' | 'draw';
export type SignatureStyle = 'script' | 'formal' | 'simple';
export type Ink = 'accent' | 'fg';
export type PenWidth = 'thin' | 'medium' | 'bold';

export interface StrokePoint {
  /** Position as a fraction of the canvas, so strokes scale cleanly for export. */
  x: number;
  y: number;
}

export type Stroke = StrokePoint[];

export interface PixelRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Keeps pasted names on one line and caps by Unicode code points, not UTF-16 units. */
export function normalizeSignatureText(value: string): string {
  return Array.from(value.replace(/[\r\n\t]+/g, ' '))
    .slice(0, MAX_SIGNATURE_TEXT_LENGTH)
    .join('');
}

export function isSignatureBlank(strokes: Stroke[]): boolean {
  return strokes.every((stroke) => stroke.length < 2);
}

export function hasSignature(mode: SignatureMode, text: string, strokes: Stroke[]): boolean {
  return mode === 'type' ? text.trim().length > 0 : !isSignatureBlank(strokes);
}

/** Converts an event coordinate to a safe normalized drawing point. */
export function normalizePoint(x: number, y: number, width: number, height: number): StrokePoint {
  if (!Number.isFinite(x) || !Number.isFinite(y) || width <= 0 || height <= 0) return { x: 0, y: 0 };
  return {
    x: Math.min(1, Math.max(0, x / width)),
    y: Math.min(1, Math.max(0, y / height)),
  };
}

/** Finds the visible alpha bounds of an RGBA canvas buffer, or null when it is transparent. */
export function findInkBounds(pixels: Uint8ClampedArray, width: number, height: number): PixelRect | null {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) return null;
  if (pixels.length < width * height * 4) return null;

  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] === 0) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  return right < 0 ? null : { left, top, right, bottom };
}

/** Adds transparent breathing room while keeping a crop rectangle inside the source canvas. */
export function paddedBounds(bounds: PixelRect, padding: number, width: number, height: number): PixelRect {
  const safePadding = Number.isFinite(padding) ? Math.max(0, Math.floor(padding)) : 0;
  return {
    left: Math.max(0, Math.floor(bounds.left) - safePadding),
    top: Math.max(0, Math.floor(bounds.top) - safePadding),
    right: Math.min(width - 1, Math.ceil(bounds.right) + safePadding),
    bottom: Math.min(height - 1, Math.ceil(bounds.bottom) + safePadding),
  };
}

export function isSignatureMode(value: unknown): value is SignatureMode {
  return value === 'type' || value === 'draw';
}

export function isSignatureStyle(value: unknown): value is SignatureStyle {
  return value === 'script' || value === 'formal' || value === 'simple';
}

export function isInk(value: unknown): value is Ink {
  return value === 'accent' || value === 'fg';
}

export function isPenWidth(value: unknown): value is PenWidth {
  return value === 'thin' || value === 'medium' || value === 'bold';
}
