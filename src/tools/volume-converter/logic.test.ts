import { describe, expect, it } from 'vitest';
import {
  MAX_VOLUME,
  MILLILITERS_PER_IMPERIAL_CUP,
  MILLILITERS_PER_US_CUP,
  VOLUME_UNITS,
  convertVolume,
  isVolumeUnit,
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
