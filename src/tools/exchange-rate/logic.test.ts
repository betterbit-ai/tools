import { describe, expect, it } from 'vitest';
import { calculateExchange, invertRate, parseExchangeNumber } from './logic';

describe('parseExchangeNumber', () => {
  it('accepts formatted English, full-width, and Korean won input', () => {
    expect(parseExchangeNumber('$1,234.50')).toBe(1234.5);
    expect(parseExchangeNumber('１，３５０원')).toBe(1350);
    expect(parseExchangeNumber('5만 원')).toBe(50_000);
  });

  it('allows a signed adjustment only when requested', () => {
    expect(parseExchangeNumber('-1.5')).toBeNull();
    expect(parseExchangeNumber('-1.5', { allowNegative: true })).toBe(-1.5);
    expect(parseExchangeNumber('－２', { allowNegative: true })).toBe(-2);
  });

  it('rejects blank, emoji, Korean number words, and infinities', () => {
    expect(parseExchangeNumber('')).toBeNull();
    expect(parseExchangeNumber('💱 100')).toBeNull();
    expect(parseExchangeNumber('오만 원')).toBeNull();
    expect(parseExchangeNumber('Infinity')).toBeNull();
  });
});

describe('calculateExchange', () => {
  it('shows gross amount, percentage charge, fixed fee, and effective rate', () => {
    expect(calculateExchange({ amount: 100, rate: 1350, adjustmentPercent: 1, fixedFee: 500 })).toEqual({
      gross: 135000,
      adjustment: 1350,
      totalCharges: 1850,
      received: 133150,
      effectiveRate: 1331.5,
    });
  });

  it('supports a negative adjustment as a rate discount', () => {
    expect(calculateExchange({ amount: 100, rate: 1.2, adjustmentPercent: -2, fixedFee: 0 })).toEqual({
      gross: 120,
      adjustment: -2.4,
      totalCharges: -2.4,
      received: 122.4,
      effectiveRate: 1.224,
    });
  });

  it('handles zero amount and large values without an undefined effective rate', () => {
    expect(calculateExchange({ amount: 0, rate: 1350, adjustmentPercent: 0, fixedFee: 0 })).toMatchObject({
      gross: 0,
      received: 0,
      effectiveRate: null,
    });
    expect(
      calculateExchange({ amount: 9_999_999_999.99, rate: 1.234567, adjustmentPercent: 0, fixedFee: 0 }),
    ).toMatchObject({ gross: 12_345_669_999.987654, received: 12_345_669_999.987654 });
  });

  it('rejects invalid exchange values and out-of-range adjustments', () => {
    expect(calculateExchange({ amount: -1, rate: 1, adjustmentPercent: 0, fixedFee: 0 })).toBeNull();
    expect(calculateExchange({ amount: 1, rate: 0, adjustmentPercent: 0, fixedFee: 0 })).toBeNull();
    expect(calculateExchange({ amount: 1, rate: 1, adjustmentPercent: 100.01, fixedFee: 0 })).toBeNull();
    expect(calculateExchange({ amount: 1, rate: 1, adjustmentPercent: 0, fixedFee: -1 })).toBeNull();
  });
});

describe('invertRate', () => {
  it('inverts a valid quote and rejects zero, negative, and non-finite rates', () => {
    expect(invertRate(1350)).toBeCloseTo(1 / 1350, 6);
    expect(invertRate(0)).toBeNull();
    expect(invertRate(-1)).toBeNull();
    expect(invertRate(Number.POSITIVE_INFINITY)).toBeNull();
  });
});
