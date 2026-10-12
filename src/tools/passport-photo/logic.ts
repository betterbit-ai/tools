/** Passport-photo dimensions and layout math; canvas rendering lives in photo.ts. */

export const DPI = 300;
export const MM_PER_INCH = 25.4;
export const PRINT_4X6 = { width: 1200, height: 1800 };

export const PHOTO_SPECS = [
  { id: 'korea-passport', widthMm: 35, heightMm: 45 },
  { id: 'us-passport', widthMm: 51, heightMm: 51 },
  { id: 'japan-passport', widthMm: 35, heightMm: 45 },
  { id: 'resume', widthMm: 30, heightMm: 40 },
] as const;

export type PhotoSpecId = (typeof PHOTO_SPECS)[number]['id'];
export type PhotoSpec = (typeof PHOTO_SPECS)[number];

export interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PrintLayout {
  cols: number;
  rows: number;
  count: number;
  x: number;
  y: number;
  gap: number;
}

export function getPhotoSpec(id: PhotoSpecId): PhotoSpec {
  return PHOTO_SPECS.find((spec) => spec.id === id) ?? PHOTO_SPECS[0];
}

/** Converts a physical measurement to output pixels at 300 pixels per inch. */
export function mmToPixels(mm: number, dpi = DPI): number {
  return Math.max(1, Math.round((mm / MM_PER_INCH) * dpi));
}

export function outputDimensions(spec: Pick<PhotoSpec, 'widthMm' | 'heightMm'>, dpi = DPI) {
  return { width: mmToPixels(spec.widthMm, dpi), height: mmToPixels(spec.heightMm, dpi) };
}

/** Largest crop at the needed aspect ratio, positioned by 0–100 focus controls. */
export function cropForPhoto(
  sourceWidth: number,
  sourceHeight: number,
  spec: Pick<PhotoSpec, 'widthMm' | 'heightMm'>,
  zoom = 100,
  focusX = 50,
  focusY = 50,
): Crop {
  if (!Number.isFinite(sourceWidth) || !Number.isFinite(sourceHeight) || sourceWidth <= 0 || sourceHeight <= 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  const ratio = spec.widthMm / spec.heightMm;
  const sourceRatio = sourceWidth / sourceHeight;
  const baseWidth = sourceRatio > ratio ? sourceHeight * ratio : sourceWidth;
  const baseHeight = sourceRatio > ratio ? sourceHeight : sourceWidth / ratio;
  const safeZoom = clamp(Number.isFinite(zoom) ? zoom : 100, 100, 400) / 100;
  const width = baseWidth / safeZoom;
  const height = baseHeight / safeZoom;
  const x = clamp((sourceWidth - width) * (clamp(focusX, 0, 100) / 100), 0, sourceWidth - width);
  const y = clamp((sourceHeight - height) * (clamp(focusY, 0, 100) / 100), 0, sourceHeight - height);
  return { x, y, width, height };
}

/** Fits as many photos as possible on a 4×6-inch canvas with safe cut gaps. */
export function printLayout(photoWidth: number, photoHeight: number): PrintLayout | null {
  if (!Number.isFinite(photoWidth) || !Number.isFinite(photoHeight) || photoWidth <= 0 || photoHeight <= 0) return null;
  const margin = 36;
  const gap = 24;
  const availableWidth = PRINT_4X6.width - margin * 2;
  const availableHeight = PRINT_4X6.height - margin * 2;
  const cols = Math.floor((availableWidth + gap) / (photoWidth + gap));
  const rows = Math.floor((availableHeight + gap) / (photoHeight + gap));
  if (cols < 1 || rows < 1) return null;
  const usedWidth = cols * photoWidth + (cols - 1) * gap;
  const usedHeight = rows * photoHeight + (rows - 1) * gap;
  return {
    cols,
    rows,
    count: cols * rows,
    x: Math.round((PRINT_4X6.width - usedWidth) / 2),
    y: Math.round((PRINT_4X6.height - usedHeight) / 2),
    gap,
  };
}

/** Keeps a Unicode filename intact while replacing only its final extension. */
export function outputName(originalName: string, specId: PhotoSpecId, suffix: 'photo' | 'print-sheet'): string {
  const base = originalName.trim().replace(/\.[^.]+$/, '') || 'passport-photo';
  return `${base}-${specId}-${suffix}.jpg`;
}

/**
 * Adds (or updates) a JFIF APP0 segment so JPEG readers know its pixel density.
 * Canvas encoders commonly omit it or label pixels as 96 DPI, which would make
 * a 4×6 sheet print at the wrong physical size when “Actual Size” is selected.
 */
export function withJfifDensity(jpeg: Uint8Array, dpi = DPI): Uint8Array {
  if (jpeg.length < 2 || jpeg[0] !== 0xff || jpeg[1] !== 0xd8) return jpeg;
  const safeDpi = Math.min(65_535, Math.max(1, Math.round(dpi)));
  const density = [safeDpi >> 8, safeDpi & 0xff];
  const jfif = new Uint8Array([
    0xff,
    0xe0,
    0x00,
    0x10,
    0x4a,
    0x46,
    0x49,
    0x46,
    0x00,
    0x01,
    0x01,
    0x01,
    density[0],
    density[1],
    density[0],
    density[1],
    0x00,
    0x00,
  ]);
  if (jpeg.length >= 20 && jpeg[2] === 0xff && jpeg[3] === 0xe0 && jpeg[6] === 0x4a && jpeg[7] === 0x46) {
    const copy = jpeg.slice();
    copy[13] = 0x01;
    copy[14] = density[0];
    copy[15] = density[1];
    copy[16] = density[0];
    copy[17] = density[1];
    return copy;
  }
  const result = new Uint8Array(jpeg.length + jfif.length);
  result.set(jpeg.slice(0, 2));
  result.set(jfif, 2);
  result.set(jpeg.slice(2), jfif.length + 2);
  return result;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
