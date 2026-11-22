import { describe, expect, it } from 'vitest';
import {
  ADULT_SIZE_CHART,
  convertShoeSize,
  formatShoeSizeInput,
  formatSizeSummary,
  isShoeSystem,
  parseShoeSize,
  readShoeSize,
  shoeUnitOf,
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

describe('readShoeSize', () => {
  it('reads a bare number in the system the shopper picked', () => {
    expect(readShoeSize('260', 'kr')).toBe(260);
    expect(readShoeSize('8', 'usMen')).toBe(8);
    expect(readShoeSize(26.5, 'jp')).toBe(26.5);
  });

  it('reads sizes written with a unit, a country prefix, or a Unicode half size', () => {
    expect(readShoeSize('260 mm', 'kr')).toBe(260);
    expect(readShoeSize('260㎜', 'kr')).toBe(260);
    expect(readShoeSize('26.5 cm', 'jp')).toBe(26.5);
    expect(readShoeSize('US 8½', 'usMen')).toBe(8.5);
    expect(readShoeSize('EU 42.5', 'eu')).toBe(42.5);
    expect(readShoeSize('８．５', 'usWomen')).toBe(8.5);
  });

  it('converts a typed unit into the unit the chosen system uses', () => {
    // 26.5 cm is 265 mm, not an out-of-range 26.5 — and 260 mm is 26 cm in Japan.
    expect(readShoeSize('26.5cm', 'kr')).toBe(265);
    expect(convertShoeSize(readShoeSize('26.5cm', 'kr')!, 'kr')).toMatchObject({ footMm: 265 });
    expect(readShoeSize('260mm', 'jp')).toBe(26);
    expect(convertShoeSize(readShoeSize('260mm', 'jp')!, 'jp')).toMatchObject({ footMm: 260 });
    expect(readShoeSize('260밀리', 'kr')).toBe(260);
    expect(readShoeSize('26.5센티', 'jp')).toBe(26.5);
  });

  it('leaves an unreadable value null so the page can say so', () => {
    expect(readShoeSize('', 'kr')).toBeNull();
    expect(readShoeSize('large', 'kr')).toBeNull();
    expect(readShoeSize('사이즈', 'kr')).toBeNull();
  });

  it('recognises the unit tokens only when they are really there', () => {
    expect(shoeUnitOf('260 mm')).toBe('mm');
    expect(shoeUnitOf('26.5CM')).toBe('cm');
    expect(shoeUnitOf('US 8½')).toBeNull();
  });

  it('shows a read value back as a plain number', () => {
    expect(formatShoeSizeInput(260)).toBe('260');
    expect(formatShoeSizeInput(26.5)).toBe('26.5');
    expect(formatShoeSizeInput(42.5000001)).toBe('42.5');
  });
});
