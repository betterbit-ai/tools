import { describe, expect, it } from 'vitest';
import { calculateTip, parseAmount, splitExactly } from './logic';

describe('parseAmount', () => {
  it('accepts plain amounts and common pasted currency formatting', () => {
    expect(parseAmount('64.50')).toBe(64.5);
    expect(parseAmount('$1,234.50')).toBe(1234.5);
    expect(parseAmount('₩ 50,000')).toBe(50_000);
  });

  it('rejects empty, negative, malformed, and unicode text input', () => {
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('-12')).toBeNull();
    expect(parseAmount('12..5')).toBeNull();
    expect(parseAmount('오만원')).toBeNull();
    expect(parseAmount('50😀')).toBeNull();
  });
});

describe('splitExactly', () => {
  it('keeps every minor unit when the total has a remainder', () => {
    expect(splitExactly(1_001, 3)).toEqual({
      lowerShareMinor: 333,
      higherShareMinor: 334,
      lowerShareCount: 1,
      higherShareCount: 2,
    });
  });

  it('gives every person the same amount for an even split', () => {
    expect(splitExactly(1_200, 4)).toEqual({
      lowerShareMinor: 300,
      higherShareMinor: 300,
      lowerShareCount: 4,
      higherShareCount: 0,
    });
  });
});

describe('calculateTip', () => {
  it('calculates tip, service charge, total, and per-person split in cents', () => {
    expect(calculateTip({ bill: 64, tipPercent: 18, serviceChargePercent: 0, people: 2, fractionDigits: 2 })).toEqual({
      billMinor: 6400,
      serviceChargeMinor: 0,
      tipMinor: 1152,
      totalMinor: 7552,
      split: { lowerShareMinor: 3776, higherShareMinor: 3776, lowerShareCount: 2, higherShareCount: 0 },
    });
  });

  it('rounds to whole won before splitting and accounts for the remainder', () => {
    const result = calculateTip({
      bill: 50_000,
      tipPercent: 0,
      serviceChargePercent: 10,
      people: 3,
      fractionDigits: 0,
    });
    expect(result?.totalMinor).toBe(55_000);
    expect(result?.split).toEqual({
      lowerShareMinor: 18_333,
      higherShareMinor: 18_334,
      lowerShareCount: 2,
      higherShareCount: 1,
    });
  });

  it('handles zero tip and a large but safe bill', () => {
    const result = calculateTip({
      bill: 1_000_000_000,
      tipPercent: 0,
      serviceChargePercent: 0,
      people: 1,
      fractionDigits: 2,
    });
    expect(result?.totalMinor).toBe(100_000_000_000);
  });

  it('rejects invalid boundaries instead of returning misleading totals', () => {
    expect(
      calculateTip({ bill: -1, tipPercent: 20, serviceChargePercent: 0, people: 1, fractionDigits: 2 }),
    ).toBeNull();
    expect(
      calculateTip({ bill: 50, tipPercent: 20, serviceChargePercent: 0, people: 0, fractionDigits: 2 }),
    ).toBeNull();
    expect(
      calculateTip({ bill: 50, tipPercent: 20, serviceChargePercent: 101, people: 1, fractionDigits: 2 }),
    ).toBeNull();
  });
});
