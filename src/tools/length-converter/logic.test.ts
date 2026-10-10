import { describe, expect, it } from 'vitest';
import { cmToFeetInches, convertLength, feetInchesToCm, isLengthUnit, LENGTH_UNITS, quickTable } from './logic';

describe('convertLength', () => {
  it('converts cm to inches using the exact 2.54 factor', () => {
    expect(convertLength(2.54, 'cm', 'in')).toBeCloseTo(1, 10);
    expect(convertLength(100, 'cm', 'in')).toBeCloseTo(39.3700787, 5);
  });

  it('converts feet to meters', () => {
    expect(convertLength(1, 'ft', 'm')).toBeCloseTo(0.3048, 10);
    expect(convertLength(10, 'ft', 'm')).toBeCloseTo(3.048, 10);
  });

  it('converts miles to km', () => {
    expect(convertLength(1, 'mi', 'km')).toBeCloseTo(1.609344, 10);
  });

  it('round-trips through the base unit without drift', () => {
    expect(convertLength(123.456, 'mm', 'mi')).toBeCloseTo(123.456 / 1_000_000 / 1.609344, 10);
  });

  it('returns the input unchanged when from and to are the same unit', () => {
    expect(convertLength(42, 'cm', 'cm')).toBe(42);
  });

  it('handles zero', () => {
    expect(convertLength(0, 'km', 'mi')).toBe(0);
  });

  it('handles negative values (mathematical conversion, no clamping)', () => {
    expect(convertLength(-10, 'cm', 'in')).toBeCloseTo(-3.937007874, 5);
  });

  it('handles very large values without overflow', () => {
    expect(convertLength(1e9, 'mm', 'km')).toBeCloseTo(1000, 5);
  });

  it('returns 0 for non-finite input', () => {
    expect(convertLength(NaN, 'cm', 'in')).toBe(0);
    expect(convertLength(Infinity, 'cm', 'in')).toBe(0);
  });

  it('converts every unit to every other unit without throwing', () => {
    for (const from of LENGTH_UNITS) {
      for (const to of LENGTH_UNITS) {
        expect(Number.isFinite(convertLength(1, from, to))).toBe(true);
      }
    }
  });
});

describe('isLengthUnit', () => {
  it('accepts known units and rejects everything else', () => {
    expect(isLengthUnit('cm')).toBe(true);
    expect(isLengthUnit('mi')).toBe(true);
    expect(isLengthUnit('parsec')).toBe(false);
    expect(isLengthUnit('')).toBe(false);
    expect(isLengthUnit(undefined)).toBe(false);
    expect(isLengthUnit(42)).toBe(false);
  });
});

describe('quickTable', () => {
  it('produces one row per common value for the from-unit', () => {
    const rows = quickTable('cm', 'in');
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.result).toBeCloseTo(convertLength(row.value, 'cm', 'in'), 10);
    }
  });

  it('is defined for every supported unit as the source', () => {
    for (const unit of LENGTH_UNITS) {
      expect(quickTable(unit, 'm').length).toBeGreaterThan(0);
    }
  });
});

describe('feetInchesToCm / cmToFeetInches (height)', () => {
  it('converts a typical height both ways consistently', () => {
    const cm = feetInchesToCm(5, 7);
    expect(cm).toBeCloseTo(170.18, 1);
    const back = cmToFeetInches(cm);
    expect(back.feet).toBe(5);
    expect(back.inches).toBeCloseTo(7, 5);
  });

  it('handles an exact 6 feet with no inches', () => {
    expect(feetInchesToCm(6, 0)).toBeCloseTo(182.88, 2);
    expect(cmToFeetInches(182.88)).toEqual({ feet: 6, inches: 0 });
  });

  it('carries inches into feet at the 12" boundary', () => {
    // 71.96" rounds to 72.0" exactly -> 6'0", not 5'12"
    const result = cmToFeetInches(71.96 * 2.54);
    expect(result).toEqual({ feet: 6, inches: 0 });
  });

  it('treats 0 and negative cm as empty', () => {
    expect(cmToFeetInches(0)).toEqual({ feet: 0, inches: 0 });
    expect(cmToFeetInches(-5)).toEqual({ feet: 0, inches: 0 });
  });

  it('ignores negative feet in feetInchesToCm (clamped to 0)', () => {
    expect(feetInchesToCm(-1, 6)).toBeCloseTo(6 * 2.54, 5);
  });

  it('returns 0 for non-finite inputs', () => {
    expect(feetInchesToCm(NaN, 0)).toBe(0);
    expect(cmToFeetInches(NaN)).toEqual({ feet: 0, inches: 0 });
  });
});
