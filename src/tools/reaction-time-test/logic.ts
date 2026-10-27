/** Pure calculations for the five-round reaction-time test. */

export const ROUND_COUNT = 5;
export const MIN_REACTION_MS = 100;

/**
 * Woods et al. (2015), Experiment 1: 1,469 adults aged 18–65, measured
 * simple visual reaction-time mean 231 ms and SD 27 ms before correction for
 * that study's hardware latency. These constants are a context reference,
 * not a diagnostic norm or a browser-device correction.
 */
export const REFERENCE_MEAN_MS = 231;
export const REFERENCE_SD_MS = 27;

export interface ReactionSummary {
  count: number;
  average: number | null;
  median: number | null;
  fastest: number | null;
  slowest: number | null;
  spread: number | null;
  /** Estimated percentage of the laboratory reference distribution that is slower. */
  referencePercentile: number | null;
}

/** A response below 100 ms is likely anticipation, not a visual response. */
export function isValidReactionTime(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= MIN_REACTION_MS;
}

/** Retains at most the published five rounds and ignores malformed values. */
export function addReactionTime(results: readonly number[], value: unknown): number[] {
  const validResults = results.filter(isValidReactionTime).slice(0, ROUND_COUNT);
  return validResults.length < ROUND_COUNT && isValidReactionTime(value)
    ? [...validResults, Math.round(value)]
    : validResults;
}

/** Calculates a session summary without mutating the recorded round order. */
export function summariseReactionTimes(results: readonly number[]): ReactionSummary {
  const valid = results.filter(isValidReactionTime).slice(0, ROUND_COUNT);
  if (valid.length === 0) {
    return {
      count: 0,
      average: null,
      median: null,
      fastest: null,
      slowest: null,
      spread: null,
      referencePercentile: null,
    };
  }

  const ordered = [...valid].sort((a, b) => a - b);
  const total = valid.reduce((sum, value) => sum + value, 0);
  const average = roundMs(total / valid.length);
  const middle = Math.floor(ordered.length / 2);
  const median = roundMs(ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2);
  const fastest = ordered[0];
  const slowest = ordered[ordered.length - 1];

  return {
    count: valid.length,
    average,
    median,
    fastest,
    slowest,
    spread: slowest - fastest,
    referencePercentile: referencePercentile(average),
  };
}

/**
 * Approximates the share of the Woods et al. lab distribution that recorded a
 * slower result. A normal distribution is used only to make the reference
 * transparent and repeatable; it must not be treated as a clinical percentile.
 */
export function referencePercentile(value: unknown): number | null {
  if (!isValidReactionTime(value)) return null;
  const z = (REFERENCE_MEAN_MS - value) / REFERENCE_SD_MS;
  return Math.max(1, Math.min(99, Math.round(normalCdf(z) * 100)));
}

/** Returns a stable display value for measured milliseconds. */
export function formatMilliseconds(value: unknown): string {
  return isValidReactionTime(value) ? `${Math.round(value)}` : '—';
}

/** A lower non-null average is a personal best. */
export function isBetterAverage(candidate: unknown, current: unknown): boolean {
  return (
    isValidReactionTime(candidate) && (!isValidReactionTime(current) || Math.round(candidate) < Math.round(current))
  );
}

function roundMs(value: number): number {
  return Math.round(value);
}

/** Abramowitz–Stegun approximation, accurate enough for an integer display percentile. */
function normalCdf(value: number): number {
  const x = Math.abs(value);
  const t = 1 / (1 + 0.2316419 * x);
  const density = 0.3989422804014327 * Math.exp((-x * x) / 2);
  const probability =
    1 -
    density *
      (0.31938153 * t - 0.356563782 * t ** 2 + 1.781477937 * t ** 3 - 1.821255978 * t ** 4 + 1.330274429 * t ** 5);
  return value >= 0 ? probability : 1 - probability;
}
