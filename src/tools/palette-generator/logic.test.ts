import { describe, expect, it } from 'vitest';
import {
  accessibilitySummary,
  contrastLevel,
  contrastRatio,
  formatCss,
  formatHexList,
  formatJson,
  formatTailwind,
  generatePalette,
  lightnessLadder,
  normalizeHex,
  oklchToHex,
  parseHex,
  rgbToOklch,
  toHex,
  HARMONY_OFFSETS,
} from './logic';

describe('hex parsing', () => {
  it('accepts 3- and 6-digit hex with or without #', () => {
    expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHex('0a0')).toEqual({ r: 0, g: 170, b: 0 });
    expect(parseHex('3B82F6')).toEqual({ r: 59, g: 130, b: 246 });
    expect(normalizeHex('#ABC')).toBe('#aabbcc');
  });

  it('rejects everything else', () => {
    expect(parseHex('')).toBeNull();
    expect(parseHex('#12345')).toBeNull();
    expect(parseHex('#gggggg')).toBeNull();
    expect(parseHex('rgb(0,0,0)')).toBeNull();
    expect(normalizeHex('한글')).toBeNull();
  });

  it('round-trips every channel value', () => {
    expect(toHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
    expect(toHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff');
    expect(toHex({ r: 300, g: -5, b: 12.6 })).toBe('#ff000d');
  });
});

describe('OKLCH conversion', () => {
  it('matches the CSS Color 4 reference values', () => {
    // oklch(62.796% 0.25768 29.234) is the published conversion of #ff0000.
    const red = rgbToOklch({ r: 255, g: 0, b: 0 });
    expect(red.l).toBeCloseTo(0.6279, 3);
    expect(red.c).toBeCloseTo(0.2577, 3);
    expect(red.h).toBeCloseTo(29.23, 1);

    const white = rgbToOklch({ r: 255, g: 255, b: 255 });
    expect(white.l).toBeCloseTo(1, 3);
    expect(white.c).toBeCloseTo(0, 3);
  });

  it('round-trips sRGB colors through OKLCH', () => {
    for (const hex of ['#000000', '#ffffff', '#3b82f6', '#7f7f7f', '#00ff00', '#123456']) {
      expect(oklchToHex(rgbToOklch(parseHex(hex)!))).toBe(hex);
    }
  });

  it('reduces chroma instead of producing out-of-gamut colors', () => {
    // A very saturated green that sRGB cannot hold: the result must still be a real color.
    const hex = oklchToHex({ l: 0.7, c: 0.4, h: 145 });
    expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    expect(parseHex(hex)).not.toBeNull();
    const back = rgbToOklch(parseHex(hex)!);
    expect(back.c).toBeLessThan(0.4);
    expect(back.l).toBeCloseTo(0.7, 1);
  });
});

describe('WCAG contrast', () => {
  it('gives 21:1 for black on white and 1:1 for a color on itself', () => {
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21, 5);
    expect(contrastRatio({ r: 18, g: 52, b: 86 }, { r: 18, g: 52, b: 86 })).toBeCloseTo(1, 5);
  });

  it('applies the WCAG 2.2 thresholds', () => {
    expect(contrastLevel(21)).toBe('AAA');
    expect(contrastLevel(7)).toBe('AAA');
    expect(contrastLevel(4.5)).toBe('AA');
    expect(contrastLevel(3)).toBe('AA-large');
    expect(contrastLevel(2.9)).toBe('fail');
  });
});

describe('palette generation', () => {
  it('starts with the base color unchanged', () => {
    const palette = generatePalette({ base: '#3b82f6', harmony: 'analogous', count: 5 });
    expect(palette[0].hex).toBe('#3b82f6');
    expect(palette[0].oklch.l).toBeCloseTo(rgbToOklch({ r: 59, g: 130, b: 246 }).l, 5);
  });

  it('returns the requested number of valid colors', () => {
    for (const count of [1, 3, 5, 8, 10]) {
      for (const harmony of Object.keys(HARMONY_OFFSETS)) {
        const palette = generatePalette({ base: '#e0457b', harmony: harmony as keyof typeof HARMONY_OFFSETS, count });
        expect(palette, `${harmony}/${count}`).toHaveLength(count);
        for (const color of palette) expect(color.hex).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  it('steps lightness evenly from the base color', () => {
    const palette = generatePalette({ base: '#3b82f6', harmony: 'analogous', count: 5 });
    const ladder = lightnessLadder(palette[0].oklch.l, 5);
    palette.forEach((color, index) => {
      // Measured lightness of the output hex, not the requested value: rounding to 8-bit sRGB
      // moves L by at most ~0.002, so an even ladder stays even in the palette.
      expect(color.oklch.l).toBeCloseTo(ladder[index], 2);
    });
    expect(Math.abs(ladder[1] - ladder[0])).toBeCloseTo(0.12, 5);
  });

  it('keeps hue offsets of the chosen harmony', () => {
    const base = rgbToOklch(parseHex('#c026d3')!).h;
    const triadic = generatePalette({ base: '#c026d3', harmony: 'triadic', count: 3 });
    expect(triadic[1].oklch.h).toBeCloseTo((base + 120) % 360, 0);
    expect(triadic[2].oklch.h).toBeCloseTo((base + 240) % 360, 0);
  });

  it('never goes outside sRGB, even for a vivid base at extreme lightness', () => {
    const palette = generatePalette({ base: '#00ff00', harmony: 'complementary', count: 8 });
    const baseChroma = rgbToOklch(parseHex('#00ff00')!).c;
    for (const color of palette) {
      expect(Number.isFinite(color.oklch.l)).toBe(true);
      expect(color.hex).toMatch(/^#[0-9a-f]{6}$/);
      // Gamut mapping may only take chroma away, never add it.
      expect(color.oklch.c).toBeLessThanOrEqual(baseChroma + 1e-6);
    }
  });

  it('reports contrast on white and black and picks the readable text color', () => {
    const palette = generatePalette({ base: '#111827', harmony: 'monochrome', count: 4 });
    for (const color of palette) {
      expect(color.textColor).toBe(color.onBlack >= color.onWhite ? '#000000' : '#ffffff');
    }
    // A near-black swatch needs white text; a near-white one needs black.
    expect(palette[0].textColor).toBe('#ffffff');
    const light = generatePalette({ base: '#fde68a', harmony: 'analogous', count: 3 });
    expect(light[0].textColor).toBe('#000000');
    expect(accessibilitySummary(palette).total).toBe(4);
  });

  it('returns nothing for an invalid base color', () => {
    expect(generatePalette({ base: 'not-a-color', harmony: 'analogous', count: 5 })).toEqual([]);
  });
});

describe('lightnessLadder', () => {
  it('alternates above and below the base and clamps at the ends', () => {
    expect(lightnessLadder(0.5, 5)).toEqual([0.5, 0.62, 0.38, 0.74, 0.26]);
    expect(lightnessLadder(0.95, 3)).toEqual([0.95, 0.97, 0.83]);
    expect(lightnessLadder(0.2, 3)).toEqual([0.2, 0.32, 0.18]);
  });
});

describe('exports', () => {
  const palette = generatePalette({ base: '#3b82f6', harmony: 'analogous', count: 3 });

  it('writes CSS custom properties in order', () => {
    const css = formatCss(palette);
    expect(css.startsWith(':root {')).toBe(true);
    expect(css).toContain(`--color-1: ${palette[0].hex};`);
    expect(css).toContain(`--color-3: ${palette[2].hex};`);
  });

  it('writes a Tailwind color block and a JSON object', () => {
    const tailwind = formatTailwind(palette);
    expect(tailwind).toContain(`1: '${palette[0].hex}',`);
    const json = JSON.parse(formatJson(palette, '#3B82F6', 'analogous'));
    expect(json.base).toBe('#3b82f6');
    expect(json.harmony).toBe('analogous');
    expect(json.colors).toEqual(palette.map((color) => color.hex));
  });

  it('writes a plain hex list', () => {
    expect(formatHexList(palette)).toBe(palette.map((color) => color.hex).join(', '));
  });
});
