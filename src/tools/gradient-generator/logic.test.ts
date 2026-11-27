import { describe, expect, it } from 'vitest';
import {
  addStop,
  colorAt,
  fallbackStops,
  gradientCss,
  gradientFunction,
  mixOklch,
  normalizeAngle,
  normalizeHex,
  parseHex,
  PRESETS,
  removeStop,
  rgbToOklch,
  sortStops,
  stopList,
  MAX_STOPS,
  type GradientSettings,
  type GradientStop,
} from './logic';

const stop = (id: string, hex: string, position: number): GradientStop => ({ id, hex, position });
const settings = (patch: Partial<GradientSettings> = {}): GradientSettings => ({
  type: 'linear',
  angle: 135,
  interpolation: 'oklch',
  stops: [stop('a', '#ff2d87', 0), stop('b', '#ffb800', 100)],
  ...patch,
});

describe('color parsing', () => {
  it('accepts 3- and 6-digit hex and rejects the rest', () => {
    expect(parseHex('#abc')).toEqual({ r: 170, g: 187, b: 204 });
    expect(normalizeHex('FFB800')).toBe('#ffb800');
    expect(parseHex('#12345')).toBeNull();
    expect(normalizeHex('pink')).toBeNull();
  });
});

describe('OKLCH mixing', () => {
  it('keeps red → green bright, where sRGB turns it olive', () => {
    const mixed = mixOklch({ r: 255, g: 0, b: 0 }, { r: 0, g: 255, b: 0 }, 0.5);
    const rgb = parseHex(mixed)!;
    const lch = rgbToOklch(rgb);
    // sRGB's own midpoint is #808000 with L ≈ 0.54; the OKLCH midpoint stays lighter.
    expect(lch.l).toBeGreaterThan(0.6);
    expect(lch.c).toBeGreaterThan(0.12);
  });

  it('takes the short way around the hue wheel', () => {
    // Red (29°) and magenta (328°) are 61° apart through 0°, not 299° through cyan.
    const mixed = mixOklch(parseHex('#ff0000')!, parseHex('#ff00ff')!, 0.5);
    const hue = rgbToOklch(parseHex(mixed)!).h;
    expect(hue > 340 || hue < 20).toBe(true);
  });

  it('returns the endpoints exactly at t = 0 and t = 1', () => {
    expect(mixOklch(parseHex('#123456')!, parseHex('#abcdef')!, 0)).toBe('#123456');
    expect(mixOklch(parseHex('#123456')!, parseHex('#abcdef')!, 1)).toBe('#abcdef');
  });
});

describe('stop handling', () => {
  it('sorts by position without mutating the input', () => {
    const stops = [stop('b', '#00ff00', 100), stop('a', '#ff0000', 0)];
    const sorted = sortStops(stops);
    expect(sorted.map((s) => s.id)).toEqual(['a', 'b']);
    expect(stops[0].id).toBe('b');
  });

  it('formats the stop list with two decimals at most', () => {
    expect(stopList([stop('a', '#FF0000', 0), stop('b', '#00ff00', 33.333)])).toBe('#ff0000 0%, #00ff00 33.33%');
  });

  it('finds the color between two stops', () => {
    expect(colorAt([stop('a', '#ff0000', 0), stop('b', '#0000ff', 100)], 0)).toBe('#ff0000');
    expect(colorAt([stop('a', '#ff0000', 0), stop('b', '#0000ff', 100)], 100)).toBe('#0000ff');
    const middle = colorAt([stop('a', '#ff0000', 0), stop('b', '#0000ff', 100)], 50);
    expect(middle).toMatch(/^#[0-9a-f]{6}$/);
    expect(middle).not.toBe('#ff0000');
  });

  it('inserts a stop in the widest gap and refuses past the maximum', () => {
    const wide = addStop([stop('a', '#ff0000', 0), stop('b', '#0000ff', 100)], 'c');
    expect(wide).toHaveLength(3);
    expect(wide.find((s) => s.id === 'c')?.position).toBe(50);

    const many = Array.from({ length: MAX_STOPS }, (_, index) => stop(String(index), '#ff0000', index * 10));
    expect(addStop(many, 'extra')).toHaveLength(MAX_STOPS);
  });

  it('never removes the last two stops', () => {
    const two = [stop('a', '#ff0000', 0), stop('b', '#0000ff', 100)];
    expect(removeStop(two, 'a')).toHaveLength(2);
    expect(removeStop([...two, stop('c', '#00ff00', 50)], 'c')).toHaveLength(2);
  });
});

describe('CSS output', () => {
  it('normalizes the angle into 0–359', () => {
    expect(normalizeAngle(135)).toBe(135);
    expect(normalizeAngle(-45)).toBe(315);
    expect(normalizeAngle(360)).toBe(0);
    expect(normalizeAngle(725)).toBe(5);
    expect(normalizeAngle(Number.NaN)).toBe(0);
  });

  it('writes a linear gradient with the OKLCH interpolation method', () => {
    expect(gradientFunction(settings())).toBe('linear-gradient(135deg in oklch, #ff2d87 0%, #ffb800 100%)');
    expect(gradientFunction(settings({ interpolation: 'srgb' }))).toBe(
      'linear-gradient(135deg, #ff2d87 0%, #ffb800 100%)',
    );
  });

  it('writes radial and conic gradients in the right grammar', () => {
    expect(gradientFunction(settings({ type: 'radial' }))).toBe(
      'radial-gradient(circle at 50% 50% in oklch, #ff2d87 0%, #ffb800 100%)',
    );
    expect(gradientFunction(settings({ type: 'conic', angle: 90 }))).toBe(
      'conic-gradient(from 90deg at 50% 50% in oklch, #ff2d87 0%, #ffb800 100%)',
    );
  });

  it('emits a solid fallback, a pre-blended sRGB line, and the modern line', () => {
    const css = gradientCss(settings());
    expect(css.solid).toBe('background-color: #ff2d87;');
    expect(css.fallback.startsWith('background-image: linear-gradient(135deg, ')).toBe(true);
    expect(css.fallback.split(',').length).toBeGreaterThan(10);
    expect(css.modern).toBe('background-image: linear-gradient(135deg in oklch, #ff2d87 0%, #ffb800 100%);');
    expect(css.block.split('\n')).toHaveLength(3);
  });

  it('skips the fallback line when the gradient is already sRGB', () => {
    const css = gradientCss(settings({ interpolation: 'srgb' }));
    expect(css.fallback).toBe('');
    expect(css.block.split('\n')).toHaveLength(2);
  });

  it('samples the fallback from the OKLCH ramp, not the sRGB blend', () => {
    const ramp = fallbackStops([stop('a', '#ff0000', 0), stop('b', '#00ff00', 100)]);
    const middle = ramp.split(', ')[6].split(' ')[0];
    const lch = rgbToOklch(parseHex(middle)!);
    expect(lch.l).toBeGreaterThan(0.6);
  });
});

describe('presets', () => {
  it('are all valid, ordered and inside the stop limits', () => {
    for (const preset of PRESETS) {
      expect(preset.stops.length).toBeGreaterThanOrEqual(2);
      expect(preset.stops.length).toBeLessThanOrEqual(MAX_STOPS);
      const positions = preset.stops.map(([, position]) => position);
      expect([...positions].sort((a, b) => a - b)).toEqual(positions);
      for (const [hex] of preset.stops) expect(normalizeHex(hex)).toBe(hex);
    }
  });
});
