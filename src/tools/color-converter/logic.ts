/** Pure color conversion logic for color-converter — no DOM, no Preact. */

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export interface OklchColor {
  l: number;
  c: number;
  h: number;
}

export interface ColorConversion {
  color: RgbColor;
  hex: string;
  rgb: string;
  hsl: string;
  oklch: string;
  hslValues: HslColor;
  oklchValues: OklchColor;
  luminance: number;
}

export type ColorParseResult =
  { ok: true; conversion: ColorConversion } | { ok: false; code: 'empty' | 'invalidHex' | 'invalidRgb' };

function isChannel(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 255;
}

function round(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function formatDecimal(value: number, places: number): string {
  return String(round(value, places));
}

function srgbToLinear(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

/** Returns WCAG relative luminance for an opaque sRGB color. */
export function relativeLuminance(color: RgbColor): number {
  const r = srgbToLinear(color.r);
  const g = srgbToLinear(color.g);
  const b = srgbToLinear(color.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Returns the WCAG contrast ratio (1–21) for two opaque sRGB colors. */
export function contrastRatio(first: RgbColor, second: RgbColor): number {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

/** Converts an opaque sRGB triplet to HSL values with degrees and percentages. */
export function rgbToHsl(color: RgbColor): HslColor {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) return { h: 0, s: 0, l: lightness * 100 };

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue: number;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;

  return { h: (hue * 60 + 360) % 360, s: saturation * 100, l: lightness * 100 };
}

/** Converts an opaque sRGB triplet to CSS Color 4 Oklch values. */
export function rgbToOklch(color: RgbColor): OklchColor {
  const r = srgbToLinear(color.r);
  const g = srgbToLinear(color.g);
  const b = srgbToLinear(color.b);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const blueYellow = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const chroma = Math.hypot(a, blueYellow);
  const hue = chroma < 0.00000001 ? 0 : (Math.atan2(blueYellow, a) * 180) / Math.PI;
  return { l: lightness * 100, c: chroma, h: (hue + 360) % 360 };
}

/** Produces normalized, copy-ready representations for a valid opaque RGB color. */
export function convertRgb(color: RgbColor): ColorParseResult {
  if (!isChannel(color.r) || !isChannel(color.g) || !isChannel(color.b)) return { ok: false, code: 'invalidRgb' };

  const hex = `#${[color.r, color.g, color.b]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
  const hslValues = rgbToHsl(color);
  const oklchValues = rgbToOklch(color);
  return {
    ok: true,
    conversion: {
      color,
      hex,
      rgb: `rgb(${color.r} ${color.g} ${color.b})`,
      hsl: `hsl(${formatDecimal(hslValues.h, 1)} ${formatDecimal(hslValues.s, 1)}% ${formatDecimal(hslValues.l, 1)}%)`,
      oklch: `oklch(${formatDecimal(oklchValues.l, 1)}% ${formatDecimal(oklchValues.c, 4)} ${formatDecimal(oklchValues.h, 1)})`,
      hslValues,
      oklchValues,
      luminance: relativeLuminance(color),
    },
  };
}

/** Parses CSS-style opaque #RGB or #RRGGBB hexadecimal color notation. */
export function convertHex(input: string): ColorParseResult {
  const value = input.trim();
  if (!value) return { ok: false, code: 'empty' };
  const hex = value.startsWith('#') ? value.slice(1) : value;
  if (!/^(?:[\da-fA-F]{3}|[\da-fA-F]{6})$/.test(hex)) return { ok: false, code: 'invalidHex' };
  const expanded = hex.length === 3 ? [...hex].map((digit) => `${digit}${digit}`).join('') : hex;
  return convertRgb({
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16),
  });
}
