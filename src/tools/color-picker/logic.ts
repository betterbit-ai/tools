/** Pure color and palette logic for color-picker — no DOM, no Preact. */

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface PaletteColor extends RgbColor {
  hex: string;
  /** Estimated share of visible sampled pixels. All returned shares add to 100. */
  percent: number;
}

const MIN_COLORS = 3;
const MAX_COLORS = 8;
const MIN_DISTANCE = 36;

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/** Formats an sRGB triplet as a normalized upper-case CSS HEX value. */
export function toHex(color: RgbColor): string {
  return `#${[color.r, color.g, color.b]
    .map((channel) => clampChannel(channel).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

/** Formats an sRGB triplet as a copy-ready CSS rgb() value. */
export function toRgb(color: RgbColor): string {
  return `rgb(${clampChannel(color.r)} ${clampChannel(color.g)} ${clampChannel(color.b)})`;
}

/** Converts an sRGB triplet to CSS HSL notation. */
export function toHsl(color: RgbColor): string {
  const r = clampChannel(color.r) / 255;
  const g = clampChannel(color.g) / 255;
  const b = clampChannel(color.b) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;
  if (delta === 0) return `hsl(0 0% ${formatNumber(lightness * 100)}%)`;

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  hue = (hue * 60 + 360) % 360;
  return `hsl(${formatNumber(hue)} ${formatNumber(saturation * 100)}% ${formatNumber(lightness * 100)}%)`;
}

function formatNumber(value: number): string {
  return String(Math.round(value * 10) / 10);
}

/** Keeps palette choices within the useful 3–8-color range. */
export function normalizePaletteSize(value: number): number {
  if (!Number.isFinite(value)) return 5;
  return Math.max(MIN_COLORS, Math.min(MAX_COLORS, Math.round(value)));
}

/** Accepts browser-decodable image MIME types or familiar image filename extensions. */
export function isImageFile(name: string, type: string): boolean {
  if (type.toLowerCase().startsWith('image/')) return true;
  return /\.(?:avif|bmp|gif|jpe?g|png|svg|webp)$/iu.test(name.trim());
}

interface Bin {
  key: number;
  count: number;
  r: number;
  g: number;
  b: number;
}

function squaredDistance(first: RgbColor, second: RgbColor): number {
  return (first.r - second.r) ** 2 + (first.g - second.g) ** 2 + (first.b - second.b) ** 2;
}

/**
 * Builds a deterministic representative palette from RGBA pixels. Fully or almost
 * transparent pixels are excluded, then 4-bit RGB bins are merged into the
 * nearest selected representative so returned coverage adds to 100%.
 */
export function extractPalette(pixels: ArrayLike<number>, requestedSize = 5): PaletteColor[] {
  const bins = new Map<number, Bin>();
  const length = pixels.length - (pixels.length % 4);
  for (let index = 0; index < length; index += 4) {
    const alpha = Number(pixels[index + 3]);
    if (!Number.isFinite(alpha) || alpha < 128) continue;
    const r = clampChannel(Number(pixels[index]));
    const g = clampChannel(Number(pixels[index + 1]));
    const b = clampChannel(Number(pixels[index + 2]));
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const bin = bins.get(key) ?? { key, count: 0, r: 0, g: 0, b: 0 };
    bin.count += 1;
    bin.r += r;
    bin.g += g;
    bin.b += b;
    bins.set(key, bin);
  }

  const candidates = [...bins.values()]
    .map((bin) => ({ ...bin, r: bin.r / bin.count, g: bin.g / bin.count, b: bin.b / bin.count }))
    .sort((first, second) => second.count - first.count || first.key - second.key);
  if (!candidates.length) return [];

  const size = Math.min(normalizePaletteSize(requestedSize), candidates.length);
  const selected: RgbColor[] = [];
  for (const candidate of candidates) {
    if (selected.every((color) => squaredDistance(color, candidate) >= MIN_DISTANCE ** 2)) {
      selected.push(candidate);
      if (selected.length === size) break;
    }
  }
  for (const candidate of candidates) {
    if (selected.length === size) break;
    if (!selected.includes(candidate)) selected.push(candidate);
  }

  const coverage = selected.map(() => 0);
  for (const candidate of candidates) {
    let nearest = 0;
    for (let index = 1; index < selected.length; index += 1) {
      if (squaredDistance(candidate, selected[index]) < squaredDistance(candidate, selected[nearest])) nearest = index;
    }
    coverage[nearest] += candidate.count;
  }
  const total = coverage.reduce((sum, count) => sum + count, 0);
  return selected.map((color, index) => ({
    r: clampChannel(color.r),
    g: clampChannel(color.g),
    b: clampChannel(color.b),
    hex: toHex(color),
    percent: total ? Math.round((coverage[index] / total) * 1000) / 10 : 0,
  }));
}

/** Creates named CSS custom properties for a palette, ready to paste into :root. */
export function paletteToCss(palette: readonly PaletteColor[]): string {
  return palette.map((color, index) => `--color-${index + 1}: ${color.hex};`).join('\n');
}
