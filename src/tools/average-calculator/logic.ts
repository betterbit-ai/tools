/** Pure calculation and parsing helpers for the average calculator. */

export type DeviationKind = 'population' | 'sample';

export interface ParsedNumbers {
  values: number[];
  /** Tokens that were not finite decimal or scientific-notation numbers. */
  invalid: string[];
}

export interface Statistics {
  count: number;
  sum: number;
  mean: number;
  median: number;
  /** One or more most-frequent values, or an empty array when every value is unique. */
  modes: number[];
  min: number;
  max: number;
  range: number;
  variance: number | null;
  standardDeviation: number | null;
}

const NUMBER_TOKEN = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;

/**
 * Parses values pasted from a spreadsheet or typed as comma, semicolon, tab,
 * space, or line-break separated values. Thousands separators are deliberately
 * not accepted: in a list such as `1,000, 2`, commas unambiguously separate values.
 */
export function parseNumbers(input: string): ParsedNumbers {
  const values: number[] = [];
  const invalid: string[] = [];
  for (const token of input.trim().split(/[\s,;]+/u)) {
    if (!token) continue;
    const number = NUMBER_TOKEN.test(token) ? Number(token) : Number.NaN;
    if (Number.isFinite(number)) values.push(number);
    else invalid.push(token);
  }
  return { values, invalid };
}

/** Kahan summation avoids needless precision loss for long lists. */
function sum(values: number[]): number {
  let total = 0;
  let compensation = 0;
  for (const value of values) {
    const adjusted = value - compensation;
    const next = total + adjusted;
    compensation = next - total - adjusted;
    total = next;
  }
  return total;
}

/**
 * Calculates descriptive statistics. Population variance divides by n; sample
 * variance divides by n - 1 and therefore is undefined for fewer than two values.
 */
export function calculateStatistics(values: number[], deviation: DeviationKind): Statistics | null {
  if (!values.length) return null;

  const total = sum(values);
  const mean = total / values.length;
  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[midpoint] : (sorted[midpoint - 1] + sorted[midpoint]) / 2;

  const frequencies = new Map<number, number>();
  let highestFrequency = 0;
  for (const value of values) {
    const frequency = (frequencies.get(value) ?? 0) + 1;
    frequencies.set(value, frequency);
    highestFrequency = Math.max(highestFrequency, frequency);
  }
  const modes =
    highestFrequency > 1
      ? [...frequencies.entries()]
          .filter(([, frequency]) => frequency === highestFrequency)
          .map(([value]) => value)
          .sort((a, b) => a - b)
      : [];

  // Welford's one-pass algorithm is stable even when values are large.
  let runningMean = 0;
  let sumOfSquaredDifferences = 0;
  values.forEach((value, index) => {
    const count = index + 1;
    const difference = value - runningMean;
    runningMean += difference / count;
    sumOfSquaredDifferences += difference * (value - runningMean);
  });
  const divisor = deviation === 'population' ? values.length : values.length - 1;
  const variance = divisor > 0 ? sumOfSquaredDifferences / divisor : null;

  return {
    count: values.length,
    sum: total,
    mean,
    median,
    modes,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    range: sorted[sorted.length - 1] - sorted[0],
    variance,
    standardDeviation: variance === null ? null : Math.sqrt(variance),
  };
}
