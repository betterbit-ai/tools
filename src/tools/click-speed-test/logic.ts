/** Pure click-speed-test logic. Browser input and timing stay in Tool.tsx. */

export const TEST_DURATIONS = [1, 5, 10, 30, 60] as const;
export type TestDuration = (typeof TEST_DURATIONS)[number];
export const DEFAULT_DURATION: TestDuration = 5;

export interface ClickRun {
  durationSeconds: TestDuration;
  clicks: number;
  /** Fixed-size count of accepted clicks for each complete second of the run. */
  buckets: number[];
}

export interface RunSummary {
  clicks: number;
  cps: number;
  cpm: number;
  fastestSecond: number;
  buckets: number[];
}

/** Keeps preset and persisted values inside the supported, comparable durations. */
export function toTestDuration(value: unknown): TestDuration {
  return typeof value === 'number' && TEST_DURATIONS.includes(value as TestDuration)
    ? (value as TestDuration)
    : DEFAULT_DURATION;
}

/** Starts a constant-memory run: a 60-second test retains only 60 pace buckets. */
export function createRun(duration: unknown = DEFAULT_DURATION): ClickRun {
  const durationSeconds = toTestDuration(duration);
  return { durationSeconds, clicks: 0, buckets: Array.from({ length: durationSeconds }, () => 0) };
}

/**
 * Adds one accepted press. The first press is at 0 ms and counts; anything at
 * or after the configured finish time is rejected so every score uses the
 * selected fixed duration as its denominator.
 */
export function addClick(run: ClickRun, elapsedMs: unknown): ClickRun {
  if (!Number.isFinite(elapsedMs) || typeof elapsedMs !== 'number' || elapsedMs < 0) return run;
  const bucket = Math.floor(elapsedMs / 1000);
  if (bucket < 0 || bucket >= run.durationSeconds) return run;

  const buckets = [...run.buckets];
  buckets[bucket] = (Number.isSafeInteger(buckets[bucket]) && buckets[bucket] >= 0 ? buckets[bucket] : 0) + 1;
  return { ...run, clicks: safeClickCount(run.clicks) + 1, buckets };
}

/** Turns a completed or in-progress run into the values shown by the UI. */
export function summariseRun(run: ClickRun): RunSummary {
  const durationSeconds = toTestDuration(run.durationSeconds);
  const buckets = Array.from({ length: durationSeconds }, (_, index) => safeClickCount(run.buckets[index]));
  const clicks = buckets.reduce((total, value) => total + value, 0);
  return {
    clicks,
    cps: clicks / durationSeconds,
    cpm: (clicks / durationSeconds) * 60,
    fastestSecond: Math.max(0, ...buckets),
    buckets,
  };
}

/** Keeps score display stable and explicitly avoids locale-sensitive rounding. */
export function formatScore(value: unknown, fractionDigits = 2): string {
  const safeDigits = Number.isInteger(fractionDigits) ? Math.max(0, Math.min(6, fractionDigits)) : 2;
  return (typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0).toFixed(safeDigits);
}

/** Formats a non-negative countdown in tenths without allowing a negative display. */
export function formatTimeLeft(elapsedMs: unknown, duration: unknown): string {
  const durationMs = toTestDuration(duration) * 1000;
  const elapsed = typeof elapsedMs === 'number' && Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  return (Math.max(0, durationMs - elapsed) / 1000).toFixed(1);
}

export function isBetterScore(candidate: unknown, current: unknown): boolean {
  const next = typeof candidate === 'number' && Number.isFinite(candidate) && candidate >= 0 ? candidate : 0;
  const best = typeof current === 'number' && Number.isFinite(current) && current >= 0 ? current : 0;
  return next > best;
}

function safeClickCount(value: unknown): number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : 0;
}
