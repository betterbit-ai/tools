import { describe, expect, it } from 'vitest';
import { absoluteChange, findWhole, percentChange, percentOf, round, whatPercent } from './logic';

describe('round', () => {
  it('removes binary floating-point noise', () => {
    expect(round(0.1 + 0.2)).toBe(0.3);
    expect(round(29.999999999999996)).toBe(30);
  });

  it('keeps a reasonable number of decimals for irrational-looking results', () => {
    expect(round(100 / 3)).toBeCloseTo(33.333333, 5);
  });

  it('passes through non-finite values unchanged', () => {
    expect(round(NaN)).toBeNaN();
    expect(round(Infinity)).toBe(Infinity);
  });

  it('handles zero and negative numbers', () => {
    expect(round(0)).toBe(0);
    expect(round(-0.1 - 0.2)).toBe(-0.3);
  });
});

describe('percentOf (type 1: P% of base)', () => {
  it('computes the common case', () => {
    expect(percentOf(20, 50)).toBe(10);
    expect(percentOf(50, 200)).toBe(100);
  });

  it('handles 0%, 100% and over 100%', () => {
    expect(percentOf(0, 999)).toBe(0);
    expect(percentOf(100, 42)).toBe(42);
    expect(percentOf(150, 10)).toBe(15);
  });

  it('handles negative percent and negative base', () => {
    expect(percentOf(-10, 100)).toBe(-10);
    expect(percentOf(10, -100)).toBe(-10);
  });

  it('handles decimals without floating-point drift', () => {
    expect(percentOf(12.5, 80)).toBe(10);
  });

  it('handles very large numbers', () => {
    expect(percentOf(1, 1_000_000_000)).toBe(10_000_000);
  });
});

describe('whatPercent (type 2: part is what % of whole)', () => {
  it('computes the common case', () => {
    expect(whatPercent(10, 50)).toBe(20);
    expect(whatPercent(25, 200)).toBe(12.5);
  });

  it('allows part greater than whole (over 100%)', () => {
    expect(whatPercent(150, 100)).toBe(150);
  });

  it('is NaN when whole is 0 (undefined ratio)', () => {
    expect(whatPercent(10, 0)).toBeNaN();
  });

  it('is 0 when part is 0', () => {
    expect(whatPercent(0, 50)).toBe(0);
  });

  it('handles negative values', () => {
    expect(whatPercent(-10, 50)).toBe(-20);
  });
});

describe('findWhole (type 3: part is P% of what)', () => {
  it('computes the common case', () => {
    expect(findWhole(10, 25)).toBe(40);
    expect(findWhole(42, 100)).toBe(42);
  });

  it('is NaN when percent is 0 (undefined base)', () => {
    expect(findWhole(10, 0)).toBeNaN();
  });

  it('handles negative percent', () => {
    expect(findWhole(10, -50)).toBe(-20);
  });

  it('handles decimals without floating-point drift', () => {
    expect(findWhole(1, 50)).toBe(2);
  });
});

describe('percentChange and absoluteChange (type 4: change from X to Y)', () => {
  it('reports a positive percent for an increase', () => {
    expect(percentChange(50, 75)).toBe(50);
    expect(absoluteChange(50, 75)).toBe(25);
  });

  it('reports a negative percent for a decrease', () => {
    expect(percentChange(100, 80)).toBe(-20);
    expect(absoluteChange(100, 80)).toBe(-20);
  });

  it('is 0 when the value does not change', () => {
    expect(percentChange(30, 30)).toBe(0);
  });

  it('is NaN when starting from 0 (undefined ratio)', () => {
    expect(percentChange(0, 10)).toBeNaN();
  });

  it('handles negative starting values', () => {
    // (to - from) / from: moving from -50 to -25 is a -50% change by this ratio,
    // even though -25 is numerically larger than -50.
    expect(percentChange(-50, -25)).toBe(-50);
  });
});
