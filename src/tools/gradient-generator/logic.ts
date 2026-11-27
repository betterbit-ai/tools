/**
 * Pure CSS gradient builder — no DOM, no Preact.
 *
 * Interpolating in OKLCH keeps the middle of a gradient alive: red → green mixed in sRGB passes
 * through a dull olive, while the same pair mixed in OKLCH stays bright. Browsers understand
 * `in oklch`, but older ones ignore that declaration, so the tool also emits a pre-blended sRGB
 * fallback sampled from the same OKLCH ramp.
 */

export const GRADIENT_TYPES = ['linear', 'radial', 'conic'] as const;
export type GradientType = (typeof GRADIENT_TYPES)[number];

export const INTERPOLATIONS = ['oklch', 'srgb'] as const;
export type Interpolation = (typeof INTERPOLATIONS)[number];

export const MIN_STOPS = 2;
export const MAX_STOPS = 10;

/** How many blended stops the sRGB fallback line gets. */
export const FALLBACK_SAMPLES = 13;

export interface GradientStop {
  id: string;
  hex: string;
  /** Percent along the gradient, 0–100. */
  position: number;
}

export interface GradientSettings {
  type: GradientType;
  angle: number;
  interpolation: Interpolation;
  stops: GradientStop[];
}

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

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

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
  return (value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055) * 255;
}

export function rgbToOklch({ r, g, b }: Rgb): Oklch {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bAxis = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: L, c: Math.sqrt(a * a + bAxis * bAxis), h: ((Math.atan2(bAxis, a) * 180) / Math.PI + 360) % 360 };
}

function oklchToRgb(color: Oklch): Rgb {
  const hue = (color.h * Math.PI) / 180;
  const a = Math.cos(hue) * color.c;
  const bAxis = Math.sin(hue) * color.c;
  const l_ = color.l + 0.3963377774 * a + 0.2158037573 * bAxis;
  const m_ = color.l - 0.1055613458 * a - 0.0638541728 * bAxis;
  const s_ = color.l - 0.0894841775 * a - 1.291485548 * bAxis;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return {
    r: fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

/** Mixes two colors in OKLCH, taking the shorter way around the hue wheel. */
export function mixOklch(from: Rgb, to: Rgb, t: number): string {
  const a = rgbToOklch(from);
  const b = rgbToOklch(to);
  const ratio = clamp(t, 0, 1);
  let deltaHue = b.h - a.h;
  if (deltaHue > 180) deltaHue -= 360;
  if (deltaHue < -180) deltaHue += 360;
  return toHex(
    oklchToRgb({
      l: a.l + (b.l - a.l) * ratio,
      c: a.c + (b.c - a.c) * ratio,
      h: (a.h + deltaHue * ratio + 360) % 360,
    }),
  );
}

export function sortStops(stops: GradientStop[]): GradientStop[] {
  return [...stops].sort((a, b) => a.position - b.position);
}

/** Normalizes the angle into 0–359 so the CSS stays readable. */
export function normalizeAngle(angle: number): number {
  if (!Number.isFinite(angle)) return 0;
  return ((Math.round(angle) % 360) + 360) % 360;
}

/** The colour to show before the gradient paints (and in browsers without gradients at all). */
export function firstColor(stops: GradientStop[]): string {
  const sorted = sortStops(stops);
  return (sorted[0] && (normalizeHex(sorted[0].hex) ?? '#000000')) || '#000000';
}

/** The stop list as CSS: `#ff0000 0%, #00ff00 100%`. */
export function stopList(stops: GradientStop[], interpolate = false): string {
  const sorted = sortStops(stops);
  return sorted
    .map((stop) => {
      const hex = normalizeHex(stop.hex) ?? '#000000';
      const position = interpolate ? (sorted.length === 1 ? 0 : stop.position) : stop.position;
      return `${hex} ${Number(position.toFixed(2))}%`;
    })
    .join(', ');
}

/**
 * Samples a stop list into evenly spaced colors along the same OKLCH ramp, so a browser without
 * `in oklch` gets an approximation with the same brightness — not the duller sRGB blend.
 */
export function fallbackStops(stops: GradientStop[], samples = FALLBACK_SAMPLES): string {
  const sorted = sortStops(stops);
  if (sorted.length < 2) return stopList(sorted);
  const parts: string[] = [];
  for (let index = 0; index < samples; index++) {
    const percent = (index / (samples - 1)) * 100;
    const color = colorAt(sorted, percent);
    parts.push(`${color} ${Number(percent.toFixed(2))}%`);
  }
  return parts.join(', ');
}

/** Color at a percentage of the sorted stop list, by linear position between neighbours. */
export function colorAt(sorted: GradientStop[], percent: number): string {
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (percent <= first.position) return normalizeHex(first.hex) ?? '#000000';
  if (percent >= last.position) return normalizeHex(last.hex) ?? '#000000';
  for (let index = 0; index < sorted.length - 1; index++) {
    const left = sorted[index];
    const right = sorted[index + 1];
    if (percent >= left.position && percent <= right.position) {
      const span = right.position - left.position;
      const t = span === 0 ? 0 : (percent - left.position) / span;
      const from = parseHex(left.hex);
      const to = parseHex(right.hex);
      if (!from || !to) return normalizeHex(left.hex) ?? '#000000';
      return mixOklch(from, to, t);
    }
  }
  return normalizeHex(last.hex) ?? '#000000';
}

/** One gradient declaration, e.g. `linear-gradient(135deg in oklch, #f00 0%, #00f 100%)`. */
export function gradientFunction(settings: GradientSettings, interpolate = settings.interpolation === 'oklch'): string {
  const stops = stopList(settings.stops);
  const method = interpolate ? ' in oklch' : '';
  const angle = normalizeAngle(settings.angle);
  if (settings.type === 'radial') return `radial-gradient(circle at 50% 50%${method}, ${stops})`;
  if (settings.type === 'conic') return `conic-gradient(from ${angle}deg at 50% 50%${method}, ${stops})`;
  return `linear-gradient(${angle}deg${method}, ${stops})`;
}

export interface GradientCss {
  /** `background-color`, the solid fallback. */
  solid: string;
  /** sRGB declaration for browsers without `in oklch` (empty when interpolating in sRGB). */
  fallback: string;
  /** The declaration to use in modern browsers. */
  modern: string;
  /** Everything above as a paste-ready rule body. */
  block: string;
}

export function gradientCss(settings: GradientSettings): GradientCss {
  const solid = `background-color: ${firstColor(settings.stops)};`;
  const modern = `background-image: ${gradientFunction(settings)};`;
  if (settings.interpolation !== 'oklch') {
    return { solid, fallback: '', modern, block: `${solid}\n${modern}` };
  }
  const fallbackStopsList = fallbackStops(settings.stops);
  const angle = normalizeAngle(settings.angle);
  const fallback =
    settings.type === 'radial'
      ? `background-image: radial-gradient(circle at 50% 50%, ${fallbackStopsList});`
      : settings.type === 'conic'
        ? `background-image: conic-gradient(from ${angle}deg at 50% 50%, ${fallbackStopsList});`
        : `background-image: linear-gradient(${angle}deg, ${fallbackStopsList});`;
  return { solid, fallback, modern, block: `${solid}\n${fallback}\n${modern}` };
}

/** A gradient made only of the sRGB blend, for the side-by-side comparison in the UI. */
export function srgbPreview(settings: GradientSettings): string {
  return gradientFunction(settings, false);
}

/** Adds a stop between the two neighbours of the widest gap, so a new stop is always visible. */
export function addStop(stops: GradientStop[], nextId: string): GradientStop[] {
  if (stops.length >= MAX_STOPS) return stops;
  const sorted = sortStops(stops);
  let bestIndex = 0;
  let bestGap = -1;
  for (let index = 0; index < sorted.length - 1; index++) {
    const gap = sorted[index + 1].position - sorted[index].position;
    if (gap > bestGap) {
      bestGap = gap;
      bestIndex = index;
    }
  }
  const left = sorted[bestIndex];
  const right = sorted[bestIndex + 1];
  const position = Number(((left.position + right.position) / 2).toFixed(1));
  return [...stops, { id: nextId, position, hex: colorAt(sorted, position) }];
}

export function removeStop(stops: GradientStop[], id: string): GradientStop[] {
  if (stops.length <= MIN_STOPS) return stops;
  return stops.filter((stop) => stop.id !== id);
}

export const PRESETS: { id: string; type: GradientType; angle: number; stops: [string, number][] }[] = [
  {
    id: 'sunset',
    type: 'linear',
    angle: 135,
    stops: [
      ['#ff2d87', 0],
      ['#ffb800', 100],
    ],
  },
  {
    id: 'ocean',
    type: 'linear',
    angle: 120,
    stops: [
      ['#0f766e', 0],
      ['#0ea5e9', 100],
    ],
  },
  {
    id: 'aurora',
    type: 'linear',
    angle: 160,
    stops: [
      ['#22d3ee', 0],
      ['#a855f7', 50],
      ['#f472b6', 100],
    ],
  },
  {
    id: 'sunrise',
    type: 'radial',
    angle: 0,
    stops: [
      ['#fff1c9', 0],
      ['#f97316', 100],
    ],
  },
  {
    id: 'color-wheel',
    type: 'conic',
    angle: 0,
    stops: [
      ['#ef4444', 0],
      ['#eab308', 25],
      ['#22c55e', 50],
      ['#3b82f6', 75],
      ['#ef4444', 100],
    ],
  },
  {
    id: 'mono',
    type: 'linear',
    angle: 180,
    stops: [
      ['#f8fafc', 0],
      ['#0f172a', 100],
    ],
  },
];
