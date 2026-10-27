/** Pure SVG inspection and output-size decisions. Browser canvas work lives in rasterize.ts. */

export const MAX_OUTPUT_EDGE = 8192;
export const MAX_OUTPUT_PIXELS = 32 * 1024 * 1024;
export const FALLBACK_SIZE = 512;

export type SizeMode = 'scale' | 'width';
export type Scale = 1 | 2 | 3 | 4;

export interface SvgDimensions {
  width: number;
  height: number;
  source: 'attributes' | 'viewBox' | 'fallback';
}

export interface OutputSettings {
  mode: SizeMode;
  scale: Scale;
  width: number | '';
}

/** Check for an SVG root without trying to parse or execute its contents. */
export function isSvgMarkup(value: string): boolean {
  return /<svg\b[^>]*>/iu.test(value);
}

/**
 * Reads intrinsic SVG dimensions from width/height or viewBox. CSS-relative
 * units cannot be made deterministic in a standalone PNG, so they fall back
 * to the viewBox (or a square 512 px canvas when neither is supplied).
 */
export function svgDimensions(markup: string): SvgDimensions | null {
  const root = markup.match(/<svg\b[^>]*>/iu)?.[0];
  if (!root) return null;

  const width = svgLength(attribute(root, 'width'));
  const height = svgLength(attribute(root, 'height'));
  if (width && height) return { width, height, source: 'attributes' };

  const viewBox = attribute(root, 'viewBox')
    ?.trim()
    .split(/[\s,]+/u)
    .map(Number);
  const viewBoxWidth = viewBox?.[2];
  const viewBoxHeight = viewBox?.[3];
  if (isPositive(viewBoxWidth) && isPositive(viewBoxHeight)) {
    if (width)
      return { width, height: Math.max(1, Math.round((width * viewBoxHeight) / viewBoxWidth)), source: 'attributes' };
    if (height)
      return { width: Math.max(1, Math.round((height * viewBoxWidth) / viewBoxHeight)), height, source: 'attributes' };
    return { width: viewBoxWidth, height: viewBoxHeight, source: 'viewBox' };
  }

  return { width: FALLBACK_SIZE, height: FALLBACK_SIZE, source: 'fallback' };
}

/** Produce an exact raster canvas size, preserving the SVG's aspect ratio. */
export function outputDimensions(
  source: SvgDimensions,
  settings: OutputSettings,
): { width: number; height: number } | null {
  const width =
    settings.mode === 'scale'
      ? Math.round(source.width * settings.scale)
      : typeof settings.width === 'number'
        ? Math.round(settings.width)
        : 0;
  if (!Number.isFinite(width) || width < 1) return null;
  const height = Math.max(1, Math.round((width * source.height) / source.width));
  if (width > MAX_OUTPUT_EDGE || height > MAX_OUTPUT_EDGE || width * height > MAX_OUTPUT_PIXELS) return null;
  return { width, height };
}

/** Keep a useful name, including Unicode names, while replacing only the last extension. */
export function pngFilename(fileName: string): string {
  const leaf = fileName.split(/[\\/]/u).at(-1)?.trim() ?? '';
  const base = leaf.replace(/\.[^.]+$/u, '').trim() || 'image';
  return `${base}.png`;
}

function attribute(tag: string, name: string): string | null {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  const match = tag.match(new RegExp(`\\s${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'iu'));
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
}

function svgLength(value: string | null): number | null {
  if (!value) return null;
  const match = value.trim().match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*(px|pt|pc|mm|cm|in)?$/iu);
  if (!match) return null;
  const raw = Number(match[1]);
  if (!isPositive(raw)) return null;
  const unit = match[2]?.toLowerCase() ?? 'px';
  const multiplier: Record<string, number> = { px: 1, pt: 96 / 72, pc: 16, mm: 96 / 25.4, cm: 96 / 2.54, in: 96 };
  return Math.max(1, Math.round(raw * multiplier[unit]));
}

function isPositive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}
