/**
 * Pure palette generation — no DOM, no Preact.
 *
 * Colors are generated in OKLCH (CSS Color 4) instead of HSL. In HSL a "12% lighter" step is
 * not a perceptually equal step: yellow and blue move by very different amounts. OKLCH's L is
 * perceptual, so the steps in a palette look evenly spaced, and the lightness shown for each
 * swatch is the value the browser would use for `oklch()`.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface Oklch {
  l: number;
  c: number;
  h: number;
}

export const HARMONIES = ['analogous', 'monochrome', 'complementary', 'split', 'triadic', 'tetradic'] as const;
export type Harmony = (typeof HARMONIES)[number];

/** Hue offsets from the base color, in degrees. */
export const HARMONY_OFFSETS: Record<Harmony, number[]> = {
  analogous: [-30, -15, 0, 15, 30],
  monochrome: [0],
  complementary: [0, 180],
  split: [0, 150, 210],
  triadic: [0, 120, 240],
  tetradic: [0, 90, 180, 270],
};

/** Lightness step between neighbours in the ladder, in OKLCH L units. */
export const LIGHTNESS_STEP = 0.12;

const MIN_LIGHTNESS = 0.18;
const MAX_LIGHTNESS = 0.97;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Accepts #RGB and #RRGGBB (with or without #, any case). Returns null for anything else. */
export function parseHex(input: string): Rgb | null {
  const value = input.trim().replace(/^#/, '');
  if (!/^[0-9a-f]{3}$/i.test(value) && !/^[0-9a-f]{6}$/i.test(value)) return null;
  const full =
    value.length === 3
      ? value
          .split('')
          .map((character) => character + character)
          .join('')
      : value;
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
}

export function toHex({ r, g, b }: Rgb): string {
  const channel = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

export function normalizeHex(input: string): string | null {
  const rgb = parseHex(input);
  return rgb ? toHex(rgb) : null;
}

function toLinear(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function fromLinear(value: number): number {
  const encoded = value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;
  return encoded * 255;
}

/** sRGB → OKLab (Björn Ottosson's matrices, as used by CSS Color 4). */
export function rgbToOklab({ r, g, b }: Rgb): { L: number; a: number; b: number } {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

export function oklabToRgb({ L, a, b }: { L: number; a: number; b: number }): Rgb {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return {
    r: fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

export function rgbToOklch(rgb: Rgb): Oklch {
  const { L, a, b } = rgbToOklab(rgb);
  const c = Math.sqrt(a * a + b * b);
  const h = (Math.atan2(b, a) * 180) / Math.PI;
  return { l: L, c, h: (h + 360) % 360 };
}

function inGamut(rgb: Rgb): boolean {
  return [rgb.r, rgb.g, rgb.b].every((channel) => channel >= -0.5 && channel <= 255.5);
}

/**
 * OKLCH → sRGB, reducing chroma (not lightness or hue) until the color fits in sRGB.
 * Returns the gamut-mapped color and whether anything had to be reduced.
 */
export function oklchToRgb(color: Oklch): { rgb: Rgb; clamped: boolean } {
  const hue = (color.h * Math.PI) / 180;
  const attempt = (chroma: number) => oklabToRgb({ L: color.l, a: Math.cos(hue) * chroma, b: Math.sin(hue) * chroma });
  const direct = attempt(color.c);
  if (inGamut(direct)) return { rgb: direct, clamped: false };

  let low = 0;
  let high = color.c;
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    if (inGamut(attempt(mid))) low = mid;
    else high = mid;
  }
  return { rgb: attempt(low), clamped: true };
}

export function oklchToHex(color: Oklch): string {
  return toHex(oklchToRgb(color).rgb);
}

/** WCAG 2.x relative luminance from sRGB. */
export function relativeLuminance(rgb: Rgb): number {
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
}

/** WCAG contrast ratio, from 1 (identical) to 21 (black on white). */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const lighter = Math.max(relativeLuminance(a), relativeLuminance(b));
  const darker = Math.min(relativeLuminance(a), relativeLuminance(b));
  return (lighter + 0.05) / (darker + 0.05);
}

export type ContrastLevel = 'AAA' | 'AA' | 'AA-large' | 'fail';

/** WCAG 2.2 thresholds for normal text (4.5:1 AA, 7:1 AAA) and large text (3:1 AA). */
export function contrastLevel(ratio: number): ContrastLevel {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA-large';
  return 'fail';
}

export interface PaletteColor {
  hex: string;
  rgb: Rgb;
  oklch: Oklch;
  /** Whether the exact OKLCH value had to lose chroma to fit in sRGB. */
  clamped: boolean;
  /** Contrast against white and black, and the text color that reads better on this swatch. */
  onWhite: number;
  onBlack: number;
  textColor: string;
}

export interface PaletteOptions {
  base: string;
  harmony: Harmony;
  count: number;
}

/** Lightness ladder around the base color: 0, +1 step, −1 step, +2, −2 … */
export function lightnessLadder(baseLightness: number, count: number): number[] {
  const steps: number[] = [];
  for (let i = 0; i < count; i++) {
    const magnitude = Math.ceil(i / 2);
    const direction = i % 2 === 1 ? 1 : -1;
    steps.push(clamp(baseLightness + direction * magnitude * LIGHTNESS_STEP, MIN_LIGHTNESS, MAX_LIGHTNESS));
  }
  return steps;
}

/**
 * Builds `count` colors: the base color first, then hue-rotated neighbours that step evenly in
 * OKLCH lightness. Chroma dips slightly at the extremes so highlights do not look neon.
 */
export function generatePalette({ base, harmony, count }: PaletteOptions): PaletteColor[] {
  const rgb = parseHex(base);
  if (!rgb) return [];
  const baseLch = rgbToOklch(rgb);
  const offsets = HARMONY_OFFSETS[harmony];
  const ladder = lightnessLadder(baseLch.l, Math.max(1, Math.min(10, Math.round(count))));
  const colors: PaletteColor[] = [];

  ladder.forEach((lightness, index) => {
    const offset = offsets[index % offsets.length];
    const lch: Oklch =
      index === 0
        ? baseLch
        : {
            l: lightness,
            c: baseLch.c * Math.max(0.45, 1 - Math.abs(lightness - baseLch.l) * 1.4),
            h: (baseLch.h + offset + 360) % 360,
          };
    const mapped = oklchToRgb(lch);
    const hex = toHex(mapped.rgb);
    const finalRgb = parseHex(hex) as Rgb;
    const onWhite = contrastRatio(finalRgb, { r: 255, g: 255, b: 255 });
    const onBlack = contrastRatio(finalRgb, { r: 0, g: 0, b: 0 });
    colors.push({
      hex,
      rgb: finalRgb,
      oklch: index === 0 ? baseLch : rgbToOklch(finalRgb),
      clamped: mapped.clamped,
      onWhite,
      onBlack,
      textColor: onBlack >= onWhite ? '#000000' : '#ffffff',
    });
  });

  return colors;
}

/** One-line summary of how many colors can carry normal-size text. */
export function accessibilitySummary(colors: PaletteColor[]): { onWhite: number; onBlack: number; total: number } {
  return {
    onWhite: colors.filter((color) => color.onWhite >= 4.5).length,
    onBlack: colors.filter((color) => color.onBlack >= 4.5).length,
    total: colors.length,
  };
}

export function formatCss(colors: PaletteColor[]): string {
  const lines = colors.map((color, index) => `  --color-${index + 1}: ${color.hex};`);
  return `:root {\n${lines.join('\n')}\n}`;
}

export function formatTailwind(colors: PaletteColor[]): string {
  const entries = colors.map((color, index) => `        ${index + 1}: '${color.hex}',`);
  return `// tailwind.config.js\ntheme: {\n  extend: {\n    colors: {\n      palette: {\n${entries.join('\n')}\n      },\n    },\n  },\n}`;
}

export function formatJson(colors: PaletteColor[], base: string, harmony: Harmony): string {
  return JSON.stringify(
    {
      base: normalizeHex(base) ?? base,
      harmony,
      colors: colors.map((color) => color.hex),
    },
    null,
    2,
  );
}

/** Compact hex list, e.g. for a design ticket. */
export function formatHexList(colors: PaletteColor[]): string {
  return colors.map((color) => color.hex).join(', ');
}
