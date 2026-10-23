import { describe, expect, it } from 'vitest';
import {
  WCAG_THRESHOLDS,
  apcaContrast,
  calculateContrast,
  contrastRatio,
  parseHexColor,
  passes,
  relativeLuminance,
  resultSummary,
  toHex,
} from './logic';

describe('contrast-checker colour parsing', () => {
  it('accepts 3- and 6-digit HEX in either case', () => {
    expect(parseHexColor('#abc')).toEqual({ r: 170, g: 187, b: 204 });
    expect(parseHexColor('767676')).toEqual({ r: 118, g: 118, b: 118 });
    expect(toHex({ r: 118, g: 118, b: 118 })).toBe('#767676');
  });

  it('rejects empty, malformed, oversized, and Unicode input', () => {
    expect(parseHexColor('')).toBeNull();
    expect(parseHexColor('#12')).toBeNull();
    expect(parseHexColor('#FFFFFFFF')).toBeNull();
    expect(parseHexColor('#한글')).toBeNull();
    expect(parseHexColor('#🎨🎨🎨')).toBeNull();
    expect(parseHexColor('#１２３')).toBeNull();
  });
});

describe('contrast-checker WCAG 2 calculations', () => {
  it('uses the specified 1:1 to 21:1 range', () => {
    const black = { r: 0, g: 0, b: 0 };
    const white = { r: 255, g: 255, b: 255 };
    expect(relativeLuminance(black)).toBe(0);
    expect(relativeLuminance(white)).toBe(1);
    expect(contrastRatio(black, black)).toBe(1);
    expect(contrastRatio(black, white)).toBe(21);
  });

  it('does not round before testing WCAG boundaries', () => {
    const pass = calculateContrast('#767676', '#FFFFFF');
    const fail = calculateContrast('#777777', '#FFFFFF');
    expect(pass?.ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.aaNormal);
    expect(fail?.ratio).toBeLessThan(WCAG_THRESHOLDS.aaNormal);
    expect(passes(4.499999, 4.5)).toBe(false);
    expect(passes(4.5, 4.5)).toBe(true);
  });
});

describe('contrast-checker APCA calculations', () => {
  it('is polarity-aware and clips near-identical colours', () => {
    const black = { r: 0, g: 0, b: 0 };
    const white = { r: 255, g: 255, b: 255 };
    expect(apcaContrast(black, white)).toBeCloseTo(106.0, 0);
    expect(apcaContrast(white, black)).toBeCloseTo(-107.9, 0);
    expect(apcaContrast(black, black)).toBe(0);
  });

  it('builds a plain-text summary that includes all formal checks', () => {
    const result = calculateContrast('#000', '#FFF');
    expect(result && resultSummary(result)).toContain('WCAG 2 contrast: 21.00:1');
    expect(result && resultSummary(result)).toContain('AAA normal text (7:1): Pass');
  });
});
