/**
 * Resize planning — pure math, no DOM. The browser-side pixel work lives in resize.ts.
 */

export type ResizeMode = 'size' | 'percent';
/** How to map the source into a W×H box when both are given. */
export type FitMode = 'contain' | 'cover' | 'stretch';
export type FormatChoice = 'original' | 'image/jpeg' | 'image/png' | 'image/webp';

export interface ResizeOptions {
  mode: ResizeMode;
  percent: number;
  /** Empty = derive from the other side, keeping proportions. */
  width: number | '';
  height: number | '';
  fit: FitMode;
  /** Never make an image larger than the original. */
  noUpscale: boolean;
}

export interface ResizePlan {
  /** Output canvas size. */
  width: number;
  height: number;
  /** Source rectangle to draw (crop for `cover`). */
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/** Browsers reject a canvas side above this in some environments. */
export const MAX_SIDE = 8192;
/** Safari limits a canvas to roughly 16.7 million pixels, regardless of side length. */
export const MAX_PIXELS = 16_777_216;

export function planResize(srcW: number, srcH: number, o: ResizeOptions): ResizePlan {
  if (!isPositive(srcW) || !isPositive(srcH)) throw new RangeError('Image dimensions must be positive finite numbers.');

  const full = { sx: 0, sy: 0, sw: srcW, sh: srcH };
  let w: number;
  let h: number;

  if (o.mode === 'percent') {
    const p = Math.max(1, Number.isFinite(o.percent) ? o.percent : 100) / 100;
    w = srcW * p;
    h = srcH * p;
  } else {
    // `min` on a number input is advisory: pasted or scripted values can still
    // be negative or NaN. Treat those just like an empty dimension.
    const W = isPositive(o.width) ? o.width : 0;
    const H = isPositive(o.height) ? o.height : 0;
    if (W && H) {
      if (o.fit === 'stretch') {
        w = W;
        h = H;
      } else if (o.fit === 'cover') {
        // Output exactly W×H; crop the source centre to the target aspect ratio.
        const target = W / H;
        const src = srcW / srcH;
        const crop =
          src > target
            ? { sw: srcH * target, sh: srcH, sx: (srcW - srcH * target) / 2, sy: 0 }
            : { sw: srcW, sh: srcW / target, sx: 0, sy: (srcH - srcW / target) / 2 };
        const scaled = clampPlan(W, H, o.noUpscale ? crop.sw : Infinity, o.noUpscale ? crop.sh : Infinity);
        return { ...scaled, ...roundCrop(crop) };
      } else {
        const scale = Math.min(W / srcW, H / srcH);
        w = srcW * scale;
        h = srcH * scale;
      }
    } else if (W) {
      w = W;
      h = (srcH * W) / srcW;
    } else if (H) {
      h = H;
      w = (srcW * H) / srcH;
    } else {
      w = srcW;
      h = srcH;
    }
  }

  if (o.noUpscale && (w > srcW || h > srcH)) {
    const scale = Math.min(srcW / w, srcH / h);
    w *= scale;
    h *= scale;
  }
  return { ...clampPlan(w, h, Infinity, Infinity), ...full };
}

function clampPlan(w: number, h: number, maxW: number, maxH: number): { width: number; height: number } {
  const scale = Math.min(1, maxW / w, maxH / h, MAX_SIDE / w, MAX_SIDE / h, Math.sqrt(MAX_PIXELS / (w * h)));
  // Floor after scaling so rounding cannot put the result one pixel over the
  // browser's total-pixel ceiling.
  return { width: Math.max(1, Math.floor(w * scale)), height: Math.max(1, Math.floor(h * scale)) };
}

function isPositive(value: number | ''): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function roundCrop(c: { sx: number; sy: number; sw: number; sh: number }) {
  return { sx: Math.round(c.sx), sy: Math.round(c.sy), sw: Math.round(c.sw), sh: Math.round(c.sh) };
}

const ENCODABLE = ['image/jpeg', 'image/png', 'image/webp'];

/** Output MIME. "original" keeps JPEG/PNG/WebP; anything else (GIF, BMP, HEIC…) becomes PNG. */
export function outputType(choice: FormatChoice, srcType: string, srcName = ''): string {
  if (choice !== 'original') return choice;
  const type = srcType.toLowerCase() || mimeFromName(srcName);
  return ENCODABLE.includes(type) ? type : 'image/png';
}

function mimeFromName(name: string): string {
  const extension = name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  return '';
}

export function extensionFor(mime: string): string {
  return mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1];
}

/** "holiday photo.HEIC" + webp 800×600 -> "holiday photo-800x600.webp" */
export function outputName(name: string, mime: string, w: number, h: number): string {
  const base = name.replace(/\.[^.]+$/, '');
  return `${base}-${w}x${h}.${extensionFor(mime)}`;
}

export function supportsQuality(mime: string): boolean {
  return mime === 'image/jpeg' || mime === 'image/webp';
}

/** Common target sizes. `fit: cover` so the output is exactly this size. */
export const PRESETS = [
  { id: 'ig-square', width: 1080, height: 1080 },
  { id: 'ig-portrait', width: 1080, height: 1350 },
  { id: 'story', width: 1080, height: 1920 },
  { id: 'yt-thumb', width: 1280, height: 720 },
  { id: 'x-post', width: 1600, height: 900 },
  { id: 'linkedin-banner', width: 1584, height: 396 },
  { id: 'full-hd', width: 1920, height: 1080 },
  { id: 'passport', width: 600, height: 600 },
] as const;
export type PresetId = (typeof PRESETS)[number]['id'];
