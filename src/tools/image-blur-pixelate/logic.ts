/** Pure edit planning for image-blur-pixelate. Browser pixel work lives in render.ts. */

export type Effect = 'blur' | 'pixelate';
export type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';

/** A rectangular region expressed as fractions of the source image (0–1). */
export interface Region {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const MIN_REGION_SIZE = 0.005;
export const MIN_STRENGTH = 1;
export const MAX_STRENGTH = 50;

export function clamp(value: number, min = 0, max = 1): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Make a bounded region from two normalized drag points, regardless of drag direction. */
export function regionFromPoints(id: number, startX: number, startY: number, endX: number, endY: number): Region {
  const x1 = clamp(startX);
  const y1 = clamp(startY);
  const x2 = clamp(endX);
  const y2 = clamp(endY);
  return { x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1), id };
}

/** Keep a region in the image when it is edited with the coordinate fields. */
export function normalizeRegion(region: Region): Region {
  const x = clamp(region.x);
  const y = clamp(region.y);
  return {
    ...region,
    x,
    y,
    width: clamp(region.width, 0, 1 - x),
    height: clamp(region.height, 0, 1 - y),
  };
}

export function isMeaningfulRegion(region: Region): boolean {
  return region.width >= MIN_REGION_SIZE && region.height >= MIN_REGION_SIZE;
}

export function clampStrength(value: number): number {
  return Math.round(clamp(value, MIN_STRENGTH, MAX_STRENGTH));
}

export function outputExtension(format: OutputFormat): string {
  return format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
}

/** Preserves Unicode in the base name while making the downloaded edit easy to identify. */
export function outputName(inputName: string, format: OutputFormat): string {
  const base = inputName.replace(/\.[^.]+$/, '') || 'image';
  return `${base}-redacted.${outputExtension(format)}`;
}
