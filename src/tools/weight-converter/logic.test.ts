import { describe, expect, it } from 'vitest';
import {
  convertWeight,
  formatInputValue,
  formatWeight,
  isWeightUnit,
  parseWeightInput,
  quickTable,
  WEIGHT_UNITS,
} from './logic';

describe('convertWeight', () => {
  it('converts kg to lbs using the exact international pound factor', () => {
    expect(convertWeight(1, 'kg', 'lb')).toBeCloseTo(2.2046226218, 5);
    expect(convertWeight(70, 'kg', 'lb')).toBeCloseTo(154.323583, 4);
  });

  it('converts lbs to kg', () => {
    expect(convertWeight(1, 'lb', 'kg')).toBeCloseTo(0.45359237, 8);
  });

  it('converts stone to kg (1 stone = 14 lb exactly)', () => {
    expect(convertWeight(1, 'st', 'kg')).toBeCloseTo(6.35029318, 8);
    expect(convertWeight(1, 'st', 'lb')).toBeCloseTo(14, 8);
  });

  it('converts Korean 돈 and 냥 (1 냥 = 10 돈 = 37.5 g)', () => {
    expect(convertWeight(1, 'don', 'g')).toBeCloseTo(3.75, 10);
    expect(convertWeight(1, 'nyang', 'don')).toBeCloseTo(10, 10);
    expect(convertWeight(1, 'nyang', 'g')).toBeCloseTo(37.5, 10);
  });

  it('distinguishes the meat 근 (600 g) from the produce/herbal 근 (375 g)', () => {
    expect(convertWeight(1, 'geunMeat', 'g')).toBeCloseTo(600, 10);
    expect(convertWeight(1, 'geunProduce', 'g')).toBeCloseTo(375, 10);
    expect(convertWeight(1, 'geunMeat', 'geunProduce')).toBeCloseTo(600 / 375, 10);
  });

  it('converts 관 (1 관 = 1000 돈 = 3.75 kg)', () => {
    expect(convertWeight(1, 'gwan', 'don')).toBeCloseTo(1000, 8);
    expect(convertWeight(1, 'gwan', 'kg')).toBeCloseTo(3.75, 10);
  });

  it('round-trips through the base unit without drift', () => {
    expect(convertWeight(123.456, 'mg', 't')).toBeCloseTo(1.23456e-7, 10);
  });

  it('returns the input unchanged when from and to are the same unit', () => {
    expect(convertWeight(42, 'kg', 'kg')).toBe(42);
  });

  it('handles zero', () => {
    expect(convertWeight(0, 'kg', 'lb')).toBe(0);
  });

  it('handles negative values (mathematical conversion, no clamping)', () => {
    expect(convertWeight(-10, 'kg', 'lb')).toBeCloseTo(-22.046226218, 5);
  });

  it('handles very large values without overflow', () => {
    expect(convertWeight(1e9, 'mg', 't')).toBeCloseTo(1, 10);
  });

  it('returns 0 for non-finite input', () => {
    expect(convertWeight(NaN, 'kg', 'lb')).toBe(0);
    expect(convertWeight(Infinity, 'kg', 'lb')).toBe(0);
  });

  it('converts every unit to every other unit without throwing', () => {
    for (const from of WEIGHT_UNITS) {
      for (const to of WEIGHT_UNITS) {
        expect(Number.isFinite(convertWeight(1, from, to))).toBe(true);
      }
    }
  });
});

describe('isWeightUnit', () => {
  it('accepts known units and rejects everything else', () => {
    expect(isWeightUnit('kg')).toBe(true);
    expect(isWeightUnit('geunMeat')).toBe(true);
    expect(isWeightUnit('근')).toBe(false);
    expect(isWeightUnit('')).toBe(false);
    expect(isWeightUnit(undefined)).toBe(false);
    expect(isWeightUnit(42)).toBe(false);
  });
});

describe('quickTable', () => {
  it('produces one row per common value for the from-unit', () => {
    const rows = quickTable('kg', 'lb');
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.result).toBeCloseTo(convertWeight(row.value, 'kg', 'lb'), 10);
    }
  });

  it('is defined for every supported unit as the source', () => {
    for (const unit of WEIGHT_UNITS) {
      expect(quickTable(unit, 'g').length).toBeGreaterThan(0);
    }
  });
});

describe('parseWeightInput', () => {
  it('reads the numbers people type, including decimals and grouped thousands', () => {
    expect(parseWeightInput('70')).toEqual({ status: 'valid', value: 70 });
    expect(parseWeightInput('70.5')).toEqual({ status: 'valid', value: 70.5 });
    expect(parseWeightInput('70.')).toEqual({ status: 'valid', value: 70 });
    expect(parseWeightInput('1,000')).toEqual({ status: 'valid', value: 1000 });
    expect(parseWeightInput('1,000.5')).toEqual({ status: 'valid', value: 1000.5 });
    expect(parseWeightInput('70,5')).toEqual({ status: 'valid', value: 70.5 });
    expect(parseWeightInput(' 70 ')).toEqual({ status: 'valid', value: 70 });
    expect(parseWeightInput('７０')).toEqual({ status: 'valid', value: 70 });
    expect(parseWeightInput('1e-9')).toEqual({ status: 'valid', value: 1e-9 });
    expect(parseWeightInput('-2.5')).toEqual({ status: 'valid', value: -2.5 });
  });

  it('separates an empty field from an entry that is not a number', () => {
    expect(parseWeightInput('')).toEqual({ status: 'empty' });
    expect(parseWeightInput('-')).toEqual({ status: 'empty' });
    expect(parseWeightInput('.')).toEqual({ status: 'empty' });
    expect(parseWeightInput('abc')).toEqual({ status: 'invalid' });
    expect(parseWeightInput('70 lb')).toEqual({ status: 'invalid' });
    expect(parseWeightInput('1,2,3')).toEqual({ status: 'invalid' });
  });
});

describe('formatWeight', () => {
  it('never shows a real weight as 0', () => {
    expect(formatWeight(1e-9, 'en')).toBe('1E-9');
    expect(formatWeight(5e-10, 'ko')).toBe('5E-10');
    expect(formatWeight(0, 'en')).toBe('0');
  });

  it('keeps the everyday precision of each magnitude', () => {
    expect(formatWeight(154.323583, 'en')).toBe('154.32');
    expect(formatWeight(1.1023113, 'en')).toBe('1.1023');
    expect(formatWeight(0.45359237, 'en')).toBe('0.453592');
    expect(formatWeight(5e-8, 'en')).toBe('0.00000005');
    expect(formatWeight(1_000_000, 'ko')).toBe('1,000,000');
  });
});

describe('formatInputValue', () => {
  it('writes a precise, readable value back into the field after a swap', () => {
    expect(formatInputValue(convertWeight(70, 'kg', 'lb'))).toBe('154.323583529');
    expect(formatInputValue(1e-9)).toBe('1e-9');
    expect(formatInputValue(0)).toBe('0');
    expect(parseWeightInput(formatInputValue(convertWeight(100, 'lb', 'kg')))).toEqual({
      status: 'valid',
      value: 45.359237,
    });
  });
});
