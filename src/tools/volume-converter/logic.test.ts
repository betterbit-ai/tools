import { describe, expect, it } from 'vitest';
import {
  MAX_VOLUME,
  MILLILITERS_PER_IMPERIAL_CUP,
  MILLILITERS_PER_US_CUP,
  VOLUME_UNITS,
  convertVolume,
  formatInputValue,
  formatVolume,
  isVolumeUnit,
  parseVolumeInput,
  parseVolumeNumber,
  quickTable,
} from './logic';

describe('convertVolume', () => {
  it('uses the exact US customary cup factor', () => {
    expect(convertVolume(1, 'usCup', 'milliliter')).toBeCloseTo(MILLILITERS_PER_US_CUP, 10);
    expect(convertVolume(2, 'usCup', 'usFluidOunce')).toBe(16);
    expect(convertVolume(1, 'usCup', 'usTablespoon')).toBe(16);
    expect(convertVolume(1, 'usCup', 'usTeaspoon')).toBe(48);
  });

  it('keeps Korean, US legal, metric, and imperial cups distinct', () => {
    expect(convertVolume(1, 'koreanCup', 'milliliter')).toBe(200);
    expect(convertVolume(1, 'usLegalCup', 'milliliter')).toBe(240);
    expect(convertVolume(1, 'metricCup', 'milliliter')).toBe(250);
    expect(convertVolume(1, 'imperialCup', 'milliliter')).toBeCloseTo(MILLILITERS_PER_IMPERIAL_CUP, 10);
    expect(convertVolume(1, 'metricCup', 'usCup')).toBeCloseTo(1.0566882094, 10);
  });

  it('converts through millilitres for every supported pair without non-finite results', () => {
    for (const from of VOLUME_UNITS) {
      for (const to of VOLUME_UNITS) expect(Number.isFinite(convertVolume(1, from, to))).toBe(true);
    }
  });

  it('preserves zero and matching units', () => {
    expect(convertVolume(0, 'liter', 'usCup')).toBe(0);
    expect(convertVolume(42, 'milliliter', 'milliliter')).toBe(42);
  });

  it('rejects negative, non-finite, and oversized volumes', () => {
    expect(convertVolume(-1, 'liter', 'milliliter')).toBe(0);
    expect(convertVolume(NaN, 'liter', 'milliliter')).toBe(0);
    expect(convertVolume(Infinity, 'liter', 'milliliter')).toBe(0);
    expect(convertVolume(MAX_VOLUME + 1, 'milliliter', 'liter')).toBe(0);
  });
});

describe('parseVolumeNumber', () => {
  it('parses grouped numeric input', () => {
    expect(parseVolumeNumber('1,234.5')).toBe(1234.5);
    expect(parseVolumeNumber(250)).toBe(250);
  });

  it('normalizes full-width digits and punctuation from Korean keyboards', () => {
    expect(parseVolumeNumber('２５０．５')).toBe(250.5);
  });

  it('rejects empty, unit-bearing, and non-finite input', () => {
    expect(parseVolumeNumber('')).toBeNull();
    expect(parseVolumeNumber('1컵')).toBeNull();
    expect(parseVolumeNumber('🥛 250')).toBeNull();
    expect(parseVolumeNumber(Infinity)).toBeNull();
  });
});

describe('isVolumeUnit and quickTable', () => {
  it('accepts only supported volume units', () => {
    expect(isVolumeUnit('koreanCup')).toBe(true);
    expect(isVolumeUnit('usCup')).toBe(true);
    expect(isVolumeUnit('gallon')).toBe(false);
    expect(isVolumeUnit(undefined)).toBe(false);
  });

  it('uses common source-unit values in each quick reference table', () => {
    for (const unit of VOLUME_UNITS) {
      const rows = quickTable(unit, 'milliliter');
      expect(rows.length).toBeGreaterThan(0);
      expect(rows[0]?.result).toBeCloseTo(convertVolume(rows[0]!.value, unit, 'milliliter'), 10);
    }
  });
});

describe('parseVolumeInput', () => {
  it('keeps decimals and separators people actually type', () => {
    expect(parseVolumeInput('0.5')).toEqual({ status: 'valid', value: 0.5 });
    expect(parseVolumeInput('0,5')).toEqual({ status: 'valid', value: 0.5 });
    expect(parseVolumeInput('1,000')).toEqual({ status: 'valid', value: 1000 });
    expect(parseVolumeInput('1,234.5')).toEqual({ status: 'valid', value: 1234.5 });
    expect(parseVolumeInput('２５０．５')).toEqual({ status: 'valid', value: 250.5 });
    expect(parseVolumeInput(' 2.5 ')).toEqual({ status: 'valid', value: 2.5 });
  });

  it('treats a half-typed decimal as empty rather than invalid', () => {
    expect(parseVolumeInput('')).toEqual({ status: 'empty' });
    expect(parseVolumeInput('0.')).toEqual({ status: 'valid', value: 0 });
    expect(parseVolumeInput('.')).toEqual({ status: 'empty' });
  });

  it('reports text that is not a number instead of silently returning 0', () => {
    expect(parseVolumeInput('1 cup')).toEqual({ status: 'invalid' });
    expect(parseVolumeInput('250ml')).toEqual({ status: 'invalid' });
    expect(parseVolumeInput('1.2.3')).toEqual({ status: 'invalid' });
    expect(parseVolumeInput('-')).toEqual({ status: 'empty' });
  });

  it('reports a real volume outside the supported range', () => {
    expect(parseVolumeInput('-5')).toEqual({ status: 'out-of-range', value: -5 });
    expect(parseVolumeInput(String(MAX_VOLUME + 1))).toEqual({ status: 'out-of-range', value: MAX_VOLUME + 1 });
    expect(parseVolumeInput(String(MAX_VOLUME)).status).toBe('valid');
  });
});

describe('formatVolume', () => {
  it('never shows a real conversion as 0', () => {
    expect(formatVolume(0, 'en')).toBe('0');
    expect(formatVolume(0.0000005, 'en')).toBe('0.0000005');
    expect(formatVolume(1e-10, 'en')).toBe('1E-10');
  });

  it('keeps the exact cup factor readable', () => {
    expect(formatVolume(convertVolume(1, 'usCup', 'milliliter'), 'en')).toBe('236.59');
    expect(formatVolume(convertVolume(2, 'metricCup', 'milliliter'), 'en')).toBe('500');
  });
});

describe('formatInputValue', () => {
  it('round-trips a converted value through a swap without drift', () => {
    const converted = convertVolume(1, 'usCup', 'milliliter');
    const swapped = convertVolume(Number(formatInputValue(converted)), 'milliliter', 'usCup');
    expect(swapped).toBeCloseTo(1, 10);
  });
});

describe('quickTable fractions', () => {
  it('labels recipe fractions as fractions instead of 0.333333', () => {
    const rows = quickTable('usCup', 'milliliter');
    const third = rows.find((row) => row.label === '⅓');
    expect(third?.value).toBeCloseTo(1 / 3, 10);
    expect(rows.some((row) => row.label === '⅔')).toBe(true);
    expect(rows.filter((row) => row.label).length).toBeGreaterThan(0);
  });
});
