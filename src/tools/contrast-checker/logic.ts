/** Pure contrast calculations. Inputs are sRGB HEX; no DOM or browser APIs. */

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface ContrastResult {
  foreground: RgbColor;
  background: RgbColor;
  ratio: number;
  apca: number;
  foregroundHex: string;
  backgroundHex: string;
}

export const WCAG_THRESHOLDS = {
  aaNormal: 4.5,
  aaLarge: 3,
  aaaNormal: 7,
  aaaLarge: 4.5,
  nonText: 3,
} as const;

/** Parses #RGB and #RRGGBB values. Invalid and non-ASCII values return null. */
export function parseHexColor(value: string): RgbColor | null {
  const text = value.trim();
  const match = /^#?([\da-f]{3}|[\da-f]{6})$/iu.exec(text);
  if (!match) return null;
  const digits = match[1].length === 3 ? [...match[1]].map((channel) => channel + channel).join('') : match[1];
  return {
    r: Number.parseInt(digits.slice(0, 2), 16),
    g: Number.parseInt(digits.slice(2, 4), 16),
    b: Number.parseInt(digits.slice(4, 6), 16),
  };
}

export function toHex(color: RgbColor): string {
  const channel = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();
  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`;
}

function linearize(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2 relative luminance for an opaque sRGB colour. */
export function relativeLuminance(color: RgbColor): number {
  return 0.2126 * linearize(color.r) + 0.7152 * linearize(color.g) + 0.0722 * linearize(color.b);
}

/** WCAG 2 contrast ratio. The returned value is unrounded; compare it directly to thresholds. */
export function contrastRatio(foreground: RgbColor, background: RgbColor): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
}

// APCA 0.1.9 constants. The signed result conveys polarity: positive is dark text on light.
const APCA = {
  r: 0.2126729,
  g: 0.7151522,
  b: 0.072175,
  trc: 2.4,
  blackThreshold: 0.022,
  blackClamp: 1.414,
  deltaYMin: 0.0005,
  normBackground: 0.56,
  normText: 0.57,
  revText: 0.62,
  revBackground: 0.65,
  scale: 1.14,
  offset: 0.027,
  lowClip: 0.1,
} as const;

function apcaLuminance(color: RgbColor): number {
  const value =
    APCA.r * (color.r / 255) ** APCA.trc + APCA.g * (color.g / 255) ** APCA.trc + APCA.b * (color.b / 255) ** APCA.trc;
  return value < APCA.blackThreshold ? value + (APCA.blackThreshold - value) ** APCA.blackClamp : value;
}

/**
 * APCA lightness contrast (Lc), using the 0.1.9 reference constants.
 * It is advisory: WCAG 2 conformance uses `contrastRatio`, not this value.
 */
export function apcaContrast(foreground: RgbColor, background: RgbColor): number {
  const text = apcaLuminance(foreground);
  const backdrop = apcaLuminance(background);
  if (Math.abs(backdrop - text) < APCA.deltaYMin) return 0;

  if (backdrop > text) {
    const sapc = (backdrop ** APCA.normBackground - text ** APCA.normText) * APCA.scale;
    return sapc < APCA.lowClip ? 0 : (sapc - APCA.offset) * 100;
  }

  const sapc = (backdrop ** APCA.revBackground - text ** APCA.revText) * APCA.scale;
  return sapc > -APCA.lowClip ? 0 : (sapc + APCA.offset) * 100;
}

export function calculateContrast(foregroundValue: string, backgroundValue: string): ContrastResult | null {
  const foreground = parseHexColor(foregroundValue);
  const background = parseHexColor(backgroundValue);
  if (!foreground || !background) return null;
  return {
    foreground,
    background,
    ratio: contrastRatio(foreground, background),
    apca: apcaContrast(foreground, background),
    foregroundHex: toHex(foreground),
    backgroundHex: toHex(background),
  };
}

export function passes(value: number, threshold: number): boolean {
  return value >= threshold;
}

export function resultSummary(result: ContrastResult): string {
  return [
    `Foreground: ${result.foregroundHex}`,
    `Background: ${result.backgroundHex}`,
    `WCAG 2 contrast: ${result.ratio.toFixed(2)}:1`,
    `APCA Lc: ${result.apca.toFixed(1)}`,
    `AA normal text (4.5:1): ${passes(result.ratio, WCAG_THRESHOLDS.aaNormal) ? 'Pass' : 'Fail'}`,
    `AA large text / UI (3:1): ${passes(result.ratio, WCAG_THRESHOLDS.aaLarge) ? 'Pass' : 'Fail'}`,
    `AAA normal text (7:1): ${passes(result.ratio, WCAG_THRESHOLDS.aaaNormal) ? 'Pass' : 'Fail'}`,
    `AAA large text (4.5:1): ${passes(result.ratio, WCAG_THRESHOLDS.aaaLarge) ? 'Pass' : 'Fail'}`,
  ].join('\n');
}
