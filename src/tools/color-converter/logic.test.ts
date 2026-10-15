import { describe, expect, it } from 'vitest';
import { contrastRatio, convertHex, convertRgb, relativeLuminance, rgbToHsl, rgbToOklch } from './logic';

describe('convertHex', () => {
  it('expands shorthand hex and emits modern CSS output', () => {
    const result = convertHex('#3bf');
    expect(result).toMatchObject({
      ok: true,
      conversion: { hex: '#33BBFF', rgb: 'rgb(51 187 255)', hsl: 'hsl(200 100% 60%)' },
    });
  });

  it('accepts an optional hash and normalizes upper case', () => {
    expect(convertHex('3b82f6')).toMatchObject({ ok: true, conversion: { hex: '#3B82F6' } });
  });

  it('rejects empty, malformed, huge, and Unicode input without guessing', () => {
    expect(convertHex('')).toEqual({ ok: false, code: 'empty' });
    expect(convertHex('#12')).toEqual({ ok: false, code: 'invalidHex' });
    expect(convertHex('#abcdef'.repeat(2))).toEqual({ ok: false, code: 'invalidHex' });
    expect(convertHex('#한글😀')).toEqual({ ok: false, code: 'invalidHex' });
  });
});

describe('convertRgb', () => {
  it('round-trips channel boundaries exactly', () => {
    expect(convertRgb({ r: 0, g: 255, b: 16 })).toMatchObject({
      ok: true,
      conversion: { hex: '#00FF10', rgb: 'rgb(0 255 16)' },
    });
  });

  it('rejects fractions, NaN, and channels outside the eight-bit range', () => {
    expect(convertRgb({ r: -1, g: 0, b: 0 })).toEqual({ ok: false, code: 'invalidRgb' });
    expect(convertRgb({ r: 256, g: 0, b: 0 })).toEqual({ ok: false, code: 'invalidRgb' });
    expect(convertRgb({ r: 12.5, g: 0, b: 0 })).toEqual({ ok: false, code: 'invalidRgb' });
    expect(convertRgb({ r: Number.NaN, g: 0, b: 0 })).toEqual({ ok: false, code: 'invalidRgb' });
  });
});

describe('color spaces and contrast', () => {
  it('uses known HSL values for primary colors', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
    expect(rgbToHsl({ r: 128, g: 128, b: 128 })).toEqual({ h: 0, s: 0, l: 50.19607843137255 });
  });

  it('returns Oklch values close to the CSS Color 4 conversion examples', () => {
    const color = rgbToOklch({ r: 255, g: 0, b: 0 });
    expect(color.l).toBeCloseTo(62.8, 1);
    expect(color.c).toBeCloseTo(0.2577, 3);
    expect(color.h).toBeCloseTo(29.2, 1);
  });

  it('calculates WCAG relative luminance and contrast boundaries', () => {
    const black = { r: 0, g: 0, b: 0 };
    const white = { r: 255, g: 255, b: 255 };
    expect(relativeLuminance(black)).toBe(0);
    expect(relativeLuminance(white)).toBeCloseTo(1, 10);
    expect(contrastRatio(black, white)).toBe(21);
    expect(contrastRatio({ r: 119, g: 119, b: 119 }, white)).toBeCloseTo(4.48, 2);
  });
});
