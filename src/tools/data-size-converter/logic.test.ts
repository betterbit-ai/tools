import { describe, expect, it } from 'vitest';
import {
  BINARY_UNITS,
  DATA_UNITS,
  DECIMAL_UNITS,
  MAX_BYTES,
  convertDataSize,
  dataSizeResults,
  isDataUnit,
  parseDataSizeNumber,
} from './logic';

describe('convertDataSize', () => {
  it('uses the SI definitions for MB and GB', () => {
    expect(convertDataSize(1000, 'MB', 'GB')).toBe(1);
    expect(convertDataSize(1024, 'MB', 'GB')).toBe(1.024);
    expect(convertDataSize(1, 'GB', 'MB')).toBe(1000);
  });

  it('uses the IEC definitions for MiB and GiB', () => {
    expect(convertDataSize(1024, 'MiB', 'GiB')).toBe(1);
    expect(convertDataSize(1, 'GiB', 'MiB')).toBe(1024);
    expect(convertDataSize(1, 'GiB', 'GB')).toBeCloseTo(1.073741824, 12);
  });

  it('keeps bits and bytes distinct', () => {
    expect(convertDataSize(8, 'bit', 'B')).toBe(1);
    expect(convertDataSize(1, 'B', 'bit')).toBe(8);
  });

  it('returns zero for invalid, negative, non-finite, or oversized values', () => {
    expect(convertDataSize(0, 'MB', 'GB')).toBe(0);
    expect(convertDataSize(-1, 'MB', 'GB')).toBe(0);
    expect(convertDataSize(NaN, 'MB', 'GB')).toBe(0);
    expect(convertDataSize(Infinity, 'MB', 'GB')).toBe(0);
    expect(convertDataSize(MAX_BYTES + 1, 'B', 'GB')).toBe(0);
    expect(convertDataSize(10, 'PB', 'B')).toBe(0);
  });

  it('converts every supported pair without producing a non-finite result', () => {
    for (const from of DATA_UNITS) {
      for (const to of DATA_UNITS) expect(Number.isFinite(convertDataSize(1, from, to))).toBe(true);
    }
  });
});

describe('parseDataSizeNumber', () => {
  it('parses ordinary grouped values', () => {
    expect(parseDataSizeNumber('1,024.5')).toBe(1024.5);
    expect(parseDataSizeNumber(1000)).toBe(1000);
  });

  it('normalizes full-width digits and punctuation from Korean keyboards', () => {
    expect(parseDataSizeNumber('１，０２４．５')).toBe(1024.5);
  });

  it('rejects empty values, unit-bearing prose, and non-finite values', () => {
    expect(parseDataSizeNumber('')).toBeNull();
    expect(parseDataSizeNumber('1 GB')).toBeNull();
    expect(parseDataSizeNumber('용량 1기가')).toBeNull();
    expect(parseDataSizeNumber(Infinity)).toBeNull();
  });
});

describe('dataSizeResults', () => {
  it('shows decimal and binary systems from the same byte quantity', () => {
    const results = dataSizeResults(1, 'TB');
    expect(results.bytes).toBe(1_000_000_000_000);
    expect(results.decimal.find((item) => item.unit === 'GB')?.value).toBe(1000);
    expect(results.binary.find((item) => item.unit === 'GiB')?.value).toBeCloseTo(931.3225746155, 10);
  });

  it('returns every named SI and IEC unit and preserves the zero boundary', () => {
    const results = dataSizeResults(0, 'B');
    expect(results.decimal.map((item) => item.unit)).toEqual(DECIMAL_UNITS);
    expect(results.binary.map((item) => item.unit)).toEqual(BINARY_UNITS);
    expect(results.bits).toBe(0);
    expect(results.bytes).toBe(0);
  });
});

describe('isDataUnit', () => {
  it('accepts only the exact, case-sensitive unit symbols', () => {
    expect(isDataUnit('MB')).toBe(true);
    expect(isDataUnit('MiB')).toBe(true);
    expect(isDataUnit('mb')).toBe(false);
    expect(isDataUnit('메가바이트')).toBe(false);
    expect(isDataUnit(undefined)).toBe(false);
  });
});
