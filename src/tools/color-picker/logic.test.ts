import { describe, expect, it } from 'vitest';
import { extractPalette, isImageFile, normalizePaletteSize, paletteToCss, toHex, toHsl, toRgb } from './logic';

describe('color formatting', () => {
  it('clamps boundaries and formats copy-ready CSS values', () => {
    expect(toHex({ r: -2, g: 15.6, b: 300 })).toBe('#0010FF');
    expect(toRgb({ r: 0, g: 255, b: 16 })).toBe('rgb(0 255 16)');
    expect(toHsl({ r: 255, g: 0, b: 0 })).toBe('hsl(0 100% 50%)');
    expect(toHsl({ r: 128, g: 128, b: 128 })).toBe('hsl(0 0% 50.2%)');
  });
});

describe('palette sizing and image names', () => {
  it('limits palette size to the supported 3–8 range', () => {
    expect(normalizePaletteSize(-1)).toBe(3);
    expect(normalizePaletteSize(5.4)).toBe(5);
    expect(normalizePaletteSize(999)).toBe(8);
    expect(normalizePaletteSize(Number.NaN)).toBe(5);
  });

  it('recognizes image MIME types and Unicode image filenames', () => {
    expect(isImageFile('브랜드 로고 😀.PNG', '')).toBe(true);
    expect(isImageFile('screenshot', 'IMAGE/WEBP')).toBe(true);
    expect(isImageFile('긴 파일명'.repeat(500), 'text/plain')).toBe(false);
    expect(isImageFile('readme.txt', '')).toBe(false);
  });
});

describe('extractPalette', () => {
  it('returns deterministic colors and coverage that adds to 100 percent', () => {
    const pixels = new Uint8ClampedArray([
      255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 255, 0, 255,
    ]);
    const palette = extractPalette(pixels, 3);
    expect(palette.map((color) => color.hex)).toEqual(['#0000FF', '#FF0000', '#00FF00']);
    expect(palette.reduce((sum, color) => sum + color.percent, 0)).toBe(100);
    expect(paletteToCss(palette)).toBe('--color-1: #0000FF;\n--color-2: #FF0000;\n--color-3: #00FF00;');
  });

  it('ignores transparent pixels and safely handles empty or oversized input', () => {
    expect(extractPalette(new Uint8ClampedArray([255, 0, 0, 0]))).toEqual([]);
    expect(extractPalette(new Uint8ClampedArray([]))).toEqual([]);
    const huge = new Uint8ClampedArray(4 * 20_000);
    huge.fill(255);
    expect(extractPalette(huge, 100)).toEqual([expect.objectContaining({ hex: '#FFFFFF', percent: 100 })]);
  });
});
