/** Pure rotation/flip decisions. Canvas and File work lives in rotate.ts. */

export const ROTATIONS = [0, 90, 180, 270] as const;
export type Rotation = (typeof ROTATIONS)[number];
export type FormatChoice = 'original' | 'image/jpeg' | 'image/png' | 'image/webp';

export interface TransformOptions {
  rotation: Rotation;
  flipHorizontal: boolean;
  flipVertical: boolean;
}

const ENCODABLE = ['image/jpeg', 'image/png', 'image/webp'];

/** Converts arbitrary quarter-turn input to one of the four canvas rotations. */
export function normalizeRotation(degrees: number): Rotation {
  if (!Number.isFinite(degrees)) return 0;
  const normalized = (((Math.round(degrees / 90) * 90) % 360) + 360) % 360;
  return normalized as Rotation;
}

/** A 90° or 270° turn exchanges the raster's width and height. */
export function transformedDimensions(
  width: number,
  height: number,
  rotation: Rotation,
): { width: number; height: number } {
  const safe = (value: number) => (Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0);
  const w = safe(width);
  const h = safe(height);
  return rotation === 90 || rotation === 270 ? { width: h, height: w } : { width: w, height: h };
}

/** Canvas can encode these three formats; unknown originals safely become PNG. */
export function outputType(choice: FormatChoice, sourceType: string): string {
  if (choice !== 'original') return choice;
  return ENCODABLE.includes(sourceType) ? sourceType : 'image/png';
}

export function extensionFor(mime: string): string {
  return mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1] || 'png';
}

/** Keeps Unicode filenames intact while replacing only their final extension. */
export function outputName(name: string, mime: string): string {
  const base = name.replace(/\.[^.]+$/, '') || 'image';
  return `${base}-rotated.${extensionFor(mime)}`;
}

export function supportsQuality(mime: string): boolean {
  return mime === 'image/jpeg' || mime === 'image/webp';
}
