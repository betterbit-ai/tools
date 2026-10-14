import { describe, expect, it } from 'vitest';
import {
  ADULT_SIZE_CHART,
  convertShoeSize,
  formatSizeSummary,
  isShoeSystem,
  parseShoeSize,
  supportedRange,
} from './logic';

describe('convertShoeSize', () => {
  it('converts a Korean 260 mm baseline to all adult systems', () => {
    expect(convertShoeSize(260, 'kr')).toMatchObject({
      footMm: 260,
      jp: 26,
      usMen: 8,
      usWomen: 9.5,
      uk: 7.5,
      eu: 40.5,
    });
  });

  it('accepts any supported system as the starting point', () => {
    expect(convertShoeSize(9, 'usMen')).toMatchObject({ footMm: 270, eu: 42 });
    expect(convertShoeSize(42, 'eu')).toMatchObject({ footMm: 270, usWomen: 10.5 });
    expect(convertShoeSize(27, 'jp')).toMatchObject({ footMm: 270, uk: 8.5 });
  });

  it('uses the nearest listed row for between-size values', () => {
    expect(convertShoeSize(262, 'kr')).toMatchObject({ footMm: 260 });
    expect(convertShoeSize(8.8, 'usMen')).toMatchObject({ footMm: 270 });
  });

  it('returns null for zero, out-of-range, and non-finite values', () => {
    expect(convertShoeSize(0, 'kr')).toBeNull();
    expect(convertShoeSize(205, 'kr')).toBeNull();
    expect(convertShoeSize(315, 'kr')).toBeNull();
    expect(convertShoeSize(Number.NaN, 'eu')).toBeNull();
    expect(convertShoeSize(Infinity, 'uk')).toBeNull();
  });
});

describe('size-input helpers', () => {
  it('recognises systems and rejects unknown or localized labels', () => {
    expect(isShoeSystem('usWomen')).toBe(true);
    expect(isShoeSystem('kr')).toBe(true);
    expect(isShoeSystem('한국')).toBe(false);
    expect(isShoeSystem('')).toBe(false);
  });

  it('parses ordinary, unit-suffixed, and Unicode half-size values', () => {
    expect(parseShoeSize('260 mm')).toBe(260);
    expect(parseShoeSize('260㎜')).toBe(260);
    expect(parseShoeSize('US 8½')).toBe(8.5);
    expect(parseShoeSize('EU 42.5')).toBe(42.5);
    expect(parseShoeSize('사이즈')).toBeNull();
    expect(parseShoeSize('')).toBeNull();
  });

  it('exposes ranges based on the actual published rows', () => {
    expect(supportedRange('kr')).toEqual({ min: 210, max: 310 });
    expect(supportedRange('usMen')).toEqual({ min: 3, max: 13 });
    expect(ADULT_SIZE_CHART).toHaveLength(21);
  });

  it('formats every result consistently for copying', () => {
    const row = convertShoeSize(260, 'kr')!;
    const summary = formatSizeSummary(row, {
      kr: 'KR',
      jp: 'JP',
      usMen: 'US Men',
      usWomen: 'US Women',
      uk: 'UK',
      eu: 'EU',
    });
    expect(summary).toContain('KR: 260');
    expect(summary).toContain('US Women: 9.5');
    expect(summary.split('\n')).toHaveLength(6);
  });
});
