import { describe, expect, it } from 'vitest';
import {
  AREA_UNITS,
  MAX_AREA,
  SQUARE_METERS_PER_PYEONG,
  convertArea,
  isAreaUnit,
  parseAreaNumber,
  quickTable,
} from './logic';

describe('convertArea', () => {
  it('converts square feet to square metres with the exact international-foot factor', () => {
    expect(convertArea(1, 'squareFoot', 'squareMeter')).toBeCloseTo(0.09290304, 10);
    expect(convertArea(1000, 'squareFoot', 'squareMeter')).toBeCloseTo(92.90304, 10);
  });

  it('converts between pyeong and square metres using the exact 400/121 factor', () => {
    expect(convertArea(84, 'squareMeter', 'pyeong')).toBeCloseTo(25.41, 10);
    expect(convertArea(34, 'pyeong', 'squareMeter')).toBeCloseTo(34 * SQUARE_METERS_PER_PYEONG, 10);
  });

  it('converts land units through square metres', () => {
    expect(convertArea(1, 'acre', 'squareMeter')).toBeCloseTo(4046.8564224, 10);
    expect(convertArea(1, 'hectare', 'acre')).toBeCloseTo(2.4710538147, 8);
  });

  it('returns an input unchanged when the units match, including zero', () => {
    expect(convertArea(42, 'squareYard', 'squareYard')).toBe(42);
    expect(convertArea(0, 'pyeong', 'squareMeter')).toBe(0);
  });

  it('handles every supported pair without non-finite results', () => {
    for (const from of AREA_UNITS) {
      for (const to of AREA_UNITS) expect(Number.isFinite(convertArea(1, from, to))).toBe(true);
    }
  });

  it('rejects negative, non-finite, and oversized physical areas', () => {
    expect(convertArea(-1, 'squareMeter', 'pyeong')).toBe(0);
    expect(convertArea(NaN, 'squareMeter', 'pyeong')).toBe(0);
    expect(convertArea(Infinity, 'squareMeter', 'pyeong')).toBe(0);
    expect(convertArea(MAX_AREA + 1, 'squareMeter', 'pyeong')).toBe(0);
  });
});

describe('parseAreaNumber', () => {
  it('parses ordinary grouped values', () => {
    expect(parseAreaNumber('1,234.5')).toBe(1234.5);
    expect(parseAreaNumber(84)).toBe(84);
  });

  it('normalizes full-width digits and punctuation from Korean keyboards', () => {
    expect(parseAreaNumber('１２，３４５．６')).toBe(12345.6);
  });

  it('rejects empty values, unit-bearing prose, and non-finite values', () => {
    expect(parseAreaNumber('')).toBeNull();
    expect(parseAreaNumber('84㎡')).toBeNull();
    expect(parseAreaNumber('이십 평')).toBeNull();
    expect(parseAreaNumber(Infinity)).toBeNull();
  });
});

describe('isAreaUnit and quickTable', () => {
  it('accepts only supported area units', () => {
    expect(isAreaUnit('pyeong')).toBe(true);
    expect(isAreaUnit('squareFoot')).toBe(true);
    expect(isAreaUnit('squareMile')).toBe(false);
    expect(isAreaUnit(undefined)).toBe(false);
  });

  it('uses the source unit’s common values for every quick reference table', () => {
    for (const unit of AREA_UNITS) {
      const rows = quickTable(unit, 'squareMeter');
      expect(rows.length).toBeGreaterThan(0);
      expect(rows[0]?.result).toBeCloseTo(convertArea(rows[0]!.value, unit, 'squareMeter'), 10);
    }
  });
});
