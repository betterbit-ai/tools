/**
 * Crop-rect math — pure, no DOM. All coordinates are in natural image pixels
 * (0..srcW, 0..srcH). The browser-only pixel work (canvas draw + circle mask)
 * lives in crop.ts; the pointer-drag wiring lives in Tool.tsx.
 */

export interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type ShapeKind = 'rect' | 'circle';
export type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
export type FormatChoice = 'original' | 'image/jpeg' | 'image/png' | 'image/webp';

/** Smallest crop side, in natural pixels, a drag can produce (before clamping to a tiny image). */
export const MIN_CROP = 8;

/**
 * Keep export canvases within a size that browsers can encode reliably without
 * exhausting memory. A crop can always be made smaller before downloading.
 */
export const MAX_OUTPUT_PIXELS = 16_000_000;

export const ASPECTS = [
  { id: 'free', ratio: null },
  { id: '1:1', ratio: 1 },
  { id: '4:3', ratio: 4 / 3 },
  { id: '3:4', ratio: 3 / 4 },
  { id: '16:9', ratio: 16 / 9 },
  { id: '9:16', ratio: 9 / 16 },
  { id: '3:2', ratio: 3 / 2 },
  { id: '2:3', ratio: 2 / 3 },
] as const;
export type AspectId = (typeof ASPECTS)[number]['id'];

export function aspectRatio(id: AspectId): number | null {
  return ASPECTS.find((a) => a.id === id)?.ratio ?? null;
}

/** Keep a rect fully inside the image, shrinking before translating if it doesn't fit. */
export function clampRect(rect: CropRect, srcW: number, srcH: number): CropRect {
  const w = Math.min(Math.max(1, rect.w), Math.max(1, srcW));
  const h = Math.min(Math.max(1, rect.h), Math.max(1, srcH));
  const x = Math.min(Math.max(0, rect.x), Math.max(0, srcW - w));
  const y = Math.min(Math.max(0, rect.y), Math.max(0, srcH - h));
  return { x, y, w, h };
}

/** The largest centered rect matching `ratio` that fits inside srcW×srcH. `null` = whole image. */
export function centeredCrop(srcW: number, srcH: number, ratio: number | null): CropRect {
  if (!ratio) return { x: 0, y: 0, w: srcW, h: srcH };
  const srcRatio = srcW / srcH;
  const w = ratio > srcRatio ? srcW : srcH * ratio;
  const h = ratio > srcRatio ? srcW / ratio : srcH;
  return clampRect({ x: (srcW - w) / 2, y: (srcH - h) / 2, w, h }, srcW, srcH);
}

/** Sensible default crop on load: centered, 80% of the image, keeping its own aspect ratio. */
export function initialCrop(srcW: number, srcH: number): CropRect {
  const w = srcW * 0.8;
  const h = srcH * 0.8;
  return clampRect({ x: (srcW - w) / 2, y: (srcH - h) / 2, w, h }, srcW, srcH);
}

/** Refit a rect to a new aspect ratio, keeping its center and shrinking to stay inside the image. */
export function applyAspect(rect: CropRect, ratio: number | null, srcW: number, srcH: number): CropRect {
  if (!ratio) return rect;
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  let w = rect.w;
  let h = rect.h;
  if (w / h > ratio) w = h * ratio;
  else h = w / ratio;
  return clampRect({ x: cx - w / 2, y: cy - h / 2, w, h }, srcW, srcH);
}

/** Translate a rect by (dx, dy) natural pixels, clamped to the image bounds. */
export function moveRect(rect: CropRect, dx: number, dy: number, srcW: number, srcH: number): CropRect {
  return clampRect({ ...rect, x: rect.x + dx, y: rect.y + dy }, srcW, srcH);
}

/**
 * Drag handle `handle` by (dx, dy) natural pixels. When `ratio` is set, the
 * non-dragged axis is derived from it so the box keeps that aspect ratio.
 */
export function resizeRect(
  rect: CropRect,
  handle: Handle,
  dx: number,
  dy: number,
  srcW: number,
  srcH: number,
  ratio: number | null,
): CropRect {
  const left = rect.x;
  const top = rect.y;
  const right = rect.x + rect.w;
  const bottom = rect.y + rect.h;

  let nx = left;
  let ny = top;
  let nw = rect.w;
  let nh = rect.h;

  if (handle.includes('w')) {
    nx = left + dx;
    nw = right - nx;
  }
  if (handle.includes('e')) {
    nw = rect.w + dx;
  }
  if (handle.includes('n')) {
    ny = top + dy;
    nh = bottom - ny;
  }
  if (handle.includes('s')) {
    nh = rect.h + dy;
  }

  if (!ratio) {
    nw = Math.max(MIN_CROP, nw);
    nh = Math.max(MIN_CROP, nh);
    if (handle.includes('w')) nx = right - nw;
    if (handle.includes('n')) ny = bottom - nh;
    return clampRect({ x: nx, y: ny, w: nw, h: nh }, srcW, srcH);
  }

  // A locked crop has a fixed opposite edge (or a fixed center for side
  // handles). Limit its size against that anchor before positioning it. Using
  // clampRect after resizing can otherwise slide the supposedly fixed edge
  // when the crop reaches an image boundary.
  let desiredW: number;
  let maxW: number;
  let maxH: number;

  if (handle === 'n' || handle === 's') {
    desiredW = nh * ratio;
    const cx = left + rect.w / 2;
    maxW = 2 * Math.min(cx, srcW - cx);
    maxH = handle === 'n' ? bottom : srcH - top;
    const { w, h } = fitRatio(desiredW, ratio, maxW, maxH);
    return clampRect({ x: cx - w / 2, y: handle === 'n' ? bottom - h : top, w, h }, srcW, srcH);
  }

  if (handle === 'e' || handle === 'w') {
    desiredW = nw;
    const cy = top + rect.h / 2;
    maxW = handle === 'e' ? srcW - left : right;
    maxH = 2 * Math.min(cy, srcH - cy);
    const { w, h } = fitRatio(desiredW, ratio, maxW, maxH);
    return clampRect({ x: handle === 'w' ? right - w : left, y: cy - h / 2, w, h }, srcW, srcH);
  }

  // For corners, choose the axis whose movement changed the locked width
  // more. This lets a purely vertical drag resize a square and avoids the old
  // behaviour where a small horizontal inward drag could be ignored.
  const widthFromX = nw;
  const widthFromY = nh * ratio;
  desiredW = Math.abs(widthFromX - rect.w) >= Math.abs(widthFromY - rect.w) ? widthFromX : widthFromY;
  maxW = handle.includes('w') ? right : srcW - left;
  maxH = handle.includes('n') ? bottom : srcH - top;
  const { w, h } = fitRatio(desiredW, ratio, maxW, maxH);
  return clampRect(
    { x: handle.includes('w') ? right - w : left, y: handle.includes('n') ? bottom - h : top, w, h },
    srcW,
    srcH,
  );
}

/** Fit a ratio-locked width within the available area while respecting the crop minimum where possible. */
function fitRatio(desiredW: number, ratio: number, maxW: number, maxH: number): Pick<CropRect, 'w' | 'h'> {
  const limitW = Math.max(1, Math.min(maxW, maxH * ratio));
  const minW = Math.min(MIN_CROP, limitW);
  const w = Math.min(limitW, Math.max(minW, desiredW));
  return { w, h: w / ratio };
}

/** Round a rect to integer pixels without pushing it outside the image. */
export function roundRect(rect: CropRect, srcW: number, srcH: number): CropRect {
  return clampRect(
    { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.w), h: Math.round(rect.h) },
    srcW,
    srcH,
  );
}

const ENCODABLE = ['image/jpeg', 'image/png', 'image/webp'];

/** Output MIME. Circle crops need alpha, so "original"/non-alpha choices fall back to PNG. */
export function outputType(shape: ShapeKind, choice: FormatChoice, srcType: string): string {
  if (shape === 'circle') {
    if (choice === 'image/jpeg') return 'image/jpeg';
    return choice === 'image/webp' ? 'image/webp' : 'image/png';
  }
  if (choice !== 'original') return choice;
  return ENCODABLE.includes(srcType) ? srcType : 'image/png';
}

export function extensionFor(mime: string): string {
  return mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1];
}

/** "profile photo.png" + jpeg 400×400 -> "profile photo-crop-400x400.jpg" */
export function outputName(name: string, mime: string, w: number, h: number): string {
  const base = name.replace(/\.[^.]+$/, '');
  return `${base}-crop-${w}x${h}.${extensionFor(mime)}`;
}

export function supportsQuality(mime: string): boolean {
  return mime === 'image/jpeg' || mime === 'image/webp';
}

export function exceedsOutputLimit(rect: CropRect): boolean {
  return Math.round(rect.w) * Math.round(rect.h) > MAX_OUTPUT_PIXELS;
}
