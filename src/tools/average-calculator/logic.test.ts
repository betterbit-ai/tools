import { describe, expect, it } from 'vitest';
import { calculateStatistics, parseNumbers } from './logic';

describe('parseNumbers', () => {
  it('accepts spreadsheet separators, negatives, decimals, and scientific notation', () => {
    expect(parseNumbers('1, -2; 3.5\n.25\t1e2')).toEqual({ values: [1, -2, 3.5, 0.25, 100], invalid: [] });
  });

  it('keeps zero and ignores empty separators', () => {
    expect(parseNumbers(' , ; 0\n')).toEqual({ values: [0], invalid: [] });
  });

  it('reports malformed, infinite, and Unicode tokens instead of coercing them', () => {
    expect(parseNumbers('12 한글 😀 1,000 Infinity 2..3')).toEqual({
      values: [12, 1, 0],
      invalid: ['한글', '😀', 'Infinity', '2..3'],
    });
  });
});

describe('calculateStatistics', () => {
  it('calculates the mean, median, multiple modes, and spread', () => {
    expect(calculateStatistics([1, 2, 2, 3, 3, 9], 'population')).toMatchObject({
      count: 6,
      sum: 20,
      mean: 20 / 6,
      median: 2.5,
      modes: [2, 3],
      min: 1,
      max: 9,
      range: 8,
    });
  });

  it('uses the requested population or sample denominator', () => {
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    expect(calculateStatistics(values, 'population')?.standardDeviation).toBeCloseTo(2, 12);
    expect(calculateStatistics(values, 'sample')?.standardDeviation).toBeCloseTo(2.138089935, 9);
  });

  it('returns no mode for unique values and no sample deviation for one value', () => {
    expect(calculateStatistics([1, 2, 3], 'population')?.modes).toEqual([]);
    expect(calculateStatistics([42], 'sample')).toMatchObject({ variance: null, standardDeviation: null });
  });

  it('handles an empty list and a large pasted list', () => {
    expect(calculateStatistics([], 'population')).toBeNull();
    const values = Array.from({ length: 10_000 }, (_, index) => index + 1);
    expect(calculateStatistics(values, 'population')).toMatchObject({ count: 10_000, sum: 50_005_000, mean: 5_000.5 });
  });
});
