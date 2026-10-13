import { describe, expect, it } from 'vitest';
import { applyDiscounts, findDiscountRate, findOriginalPrice, parsePrice } from './logic';

describe('parsePrice', () => {
  it('accepts formatted English and Korean price input', () => {
    expect(parsePrice('$1,234.50')).toBe(1234.5);
    expect(parsePrice('１２,５００원')).toBe(12500);
    expect(parsePrice('5만 원')).toBe(50000);
  });

  it('rejects empty, negative, emoji, and non-numeric input', () => {
    expect(parsePrice('')).toBeNull();
    expect(parsePrice('-20')).toBeNull();
    expect(parsePrice('💸 20')).toBeNull();
    expect(parsePrice('오만원')).toBeNull();
  });

  it('keeps a large price precisely enough for calculation', () => {
    expect(parsePrice('9,999,999,999.99')).toBe(9_999_999_999.99);
  });
});

describe('applyDiscounts', () => {
  it('calculates a single discount and its savings', () => {
    expect(applyDiscounts(100, [25])).toEqual({
      prices: [75],
      finalPrice: 75,
      saved: 25,
      effectivePercent: 25,
    });
  });

  it('compounds stacked discounts instead of adding their rates', () => {
    expect(applyDiscounts(100, [20, 10])).toEqual({
      prices: [80, 72],
      finalPrice: 72,
      saved: 28,
      effectivePercent: 28,
    });
  });

  it('supports three decimal rates without floating-point drift', () => {
    expect(applyDiscounts(59.99, [15, 7.5, 2.5])).toEqual({
      prices: [50.9915, 47.167138, 45.98796],
      finalPrice: 45.98796,
      saved: 14.00204,
      effectivePercent: 23.340623,
    });
  });

  it('handles 0% and 100% boundaries', () => {
    expect(applyDiscounts(80, [0])).toMatchObject({ finalPrice: 80, effectivePercent: 0 });
    expect(applyDiscounts(80, [100])).toMatchObject({ finalPrice: 0, effectivePercent: 100 });
  });

  it('rejects invalid prices, rates, and more than three discount stages', () => {
    expect(applyDiscounts(-1, [10])).toBeNull();
    expect(applyDiscounts(100, [-1])).toBeNull();
    expect(applyDiscounts(100, [101])).toBeNull();
    expect(applyDiscounts(100, [1, 2, 3, 4])).toBeNull();
  });
});

describe('reverse discount calculations', () => {
  it('finds a discount rate from two prices', () => {
    expect(findDiscountRate(80, 60)).toBe(25);
    expect(findDiscountRate(100, 0)).toBe(100);
  });

  it('rejects an undefined or price-increase rate', () => {
    expect(findDiscountRate(0, 0)).toBeNull();
    expect(findDiscountRate(50, 60)).toBeNull();
  });

  it('reverses stacked discounts to find the original price', () => {
    expect(findOriginalPrice(72, [20, 10])).toBe(100);
    expect(findOriginalPrice(31_500, [30, 10])).toBe(50_000);
  });

  it('cannot reverse a 100% discount and rejects invalid stages', () => {
    expect(findOriginalPrice(0, [100])).toBeNull();
    expect(findOriginalPrice(50, [])).toBeNull();
    expect(findOriginalPrice(50, [10, 20, 30, 40])).toBeNull();
  });
});
