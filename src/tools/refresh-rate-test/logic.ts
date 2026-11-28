/**
 * Pure frame-timing maths for refresh-rate-test — no DOM, no Preact.
 * The browser supplies requestAnimationFrame timestamps in Tool.tsx; everything that turns
 * those timestamps into a refresh-rate reading lives here so it can be tested exactly.
 */

/** Common display refresh rates, in Hz. Fractional panel timings (59.94, 143.98) are matched to these. */
export const STANDARD_RATES = [24, 30, 50, 60, 75, 90, 100, 120, 144, 165, 180, 240, 360, 480, 500] as const;

/** Intervals longer than this mean the page was not being drawn (hidden tab, sleep, main-thread stall). */
export const STALL_GAP_MS = 500;

/** The first frames after a page settles are often irregular, so their intervals are discarded. */
export const DEFAULT_WARMUP_FRAMES = 10;

/** A frame is counted as dropped when its interval is at least this multiple of the median. */
export const DROPPED_FRAME_FACTOR = 1.5;

/** Intervals within ±10% of the median count towards the stability share. */
export const STABILITY_TOLERANCE = 0.1;

/** Fewer usable intervals than this cannot describe a display rate. */
export const MIN_INTERVALS = 20;

export interface FrameStats {
  /** Intervals used after warm-up and filtering. */
  sampleCount: number;
  /** Frames second-by-second: total intervals observed including warm-up. */
  intervalTotal: number;
  medianIntervalMs: number;
  meanIntervalMs: number;
  /** 1000 ÷ median interval. */
  hz: number;
  minHz: number;
  maxHz: number;
  /** Mean absolute deviation of the intervals from the median, in ms. */
  jitterMs: number;
  stdDevMs: number;
  droppedFrames: number;
  /** Dropped frames ÷ sampleCount, 0–1. */
  droppedShare: number;
  /** Share of intervals within ±10% of the median, 0–1. */
  stabilityShare: number;
  longestGapMs: number;
  /** Time covered by the usable intervals, in ms. */
  measuredMs: number;
  /** True when one gap exceeded STALL_GAP_MS, which makes the reading an interruption, not a rate. */
  stalled: boolean;
}

export interface RateMatch {
  /** The standard rate this reading is closest to. */
  rate: number;
  /** Difference between the reading and the standard rate, in Hz (signed). */
  deltaHz: number;
  /** Absolute difference as a share of the standard rate, 0–1. */
  relative: number;
  /** Whether the reading is inside the tolerance. */
  withinTolerance: boolean;
}

function isFiniteNumber(value: number): boolean {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Consecutive timestamp differences, dropping non-finite or non-positive pairs. */
export function frameIntervals(timestamps: readonly number[]): number[] {
  const intervals: number[] = [];
  for (let i = 1; i < timestamps.length; i += 1) {
    const previous = timestamps[i - 1];
    const current = timestamps[i];
    if (!isFiniteNumber(previous) || !isFiniteNumber(current)) continue;
    const interval = current - previous;
    if (interval > 0) intervals.push(interval);
  }
  return intervals;
}

/** Median of a numeric list. Returns 0 for an empty list rather than NaN. */
export function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

/** Nearest-rank percentile, p between 0 and 1. */
export function percentile(values: readonly number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const clamped = Math.min(1, Math.max(0, p));
  const rank = Math.ceil(clamped * sorted.length) - 1;
  return sorted[Math.min(sorted.length - 1, Math.max(0, rank))];
}

/** Converts a frame interval in milliseconds to a rate in Hz. */
export function intervalToHz(intervalMs: number): number {
  return isFiniteNumber(intervalMs) && intervalMs > 0 ? 1000 / intervalMs : 0;
}

/**
 * Summarises requestAnimationFrame timestamps.
 * Returns null when there are too few usable intervals to say anything about the display.
 * A stall (hidden tab, sleep) does not throw the reading away, but marks it so the UI can
 * ask for a fresh run instead of presenting an interrupted sample as a rate.
 */
export function analyzeFrames(timestamps: readonly number[], warmupFrames = DEFAULT_WARMUP_FRAMES): FrameStats | null {
  const all = frameIntervals(timestamps);
  const usable = all.slice(Math.max(0, Math.floor(warmupFrames)));
  if (usable.length < MIN_INTERVALS) return null;

  const medianIntervalMs = median(usable);
  const meanIntervalMs = usable.reduce((sum, value) => sum + value, 0) / usable.length;
  const deviations = usable.map((value) => Math.abs(value - medianIntervalMs));
  const meanDeviation = deviations.reduce((sum, value) => sum + value, 0) / deviations.length;
  const variance = usable.reduce((sum, value) => sum + (value - meanIntervalMs) ** 2, 0) / usable.length;
  const dropped = usable.filter((value) => value >= medianIntervalMs * DROPPED_FRAME_FACTOR).length;
  const stable = usable.filter(
    (value) => Math.abs(value - medianIntervalMs) <= medianIntervalMs * STABILITY_TOLERANCE,
  ).length;
  const shortest = usable.reduce((low, value) => (value < low ? value : low), Infinity);
  const longest = usable.reduce((high, value) => (value > high ? value : high), 0);

  return {
    sampleCount: usable.length,
    intervalTotal: all.length,
    medianIntervalMs,
    meanIntervalMs,
    hz: intervalToHz(medianIntervalMs),
    minHz: intervalToHz(longest),
    maxHz: intervalToHz(shortest),
    jitterMs: meanDeviation,
    stdDevMs: Math.sqrt(variance),
    droppedFrames: dropped,
    droppedShare: dropped / usable.length,
    stabilityShare: stable / usable.length,
    longestGapMs: longest,
    measuredMs: usable.reduce((sum, value) => sum + value, 0),
    stalled: longest > STALL_GAP_MS,
  };
}

/** Picks the closest common rate (60, 120, 144 …) and says how far the reading sits from it. */
export function matchStandardRate(hz: number, tolerance = 0.02): RateMatch | null {
  if (!isFiniteNumber(hz) || hz <= 0) return null;
  let best = STANDARD_RATES[0] as number;
  for (const rate of STANDARD_RATES) {
    if (Math.abs(rate - hz) < Math.abs(best - hz)) best = rate;
  }
  const deltaHz = hz - best;
  const relative = Math.abs(deltaHz) / best;
  return { rate: best, deltaHz, relative, withinTolerance: relative <= tolerance };
}

/** Milliseconds one frame lasts at a given rate — the budget every frame has to fit into. */
export function frameBudgetMs(hz: number): number {
  return isFiniteNumber(hz) && hz > 0 ? 1000 / hz : 0;
}

/** Frame interval that a standard rate should produce, for the reference table. */
export function standardIntervalMs(rate: number): number {
  return frameBudgetMs(rate);
}

/** Rounds a rate for display: whole numbers above 100 Hz, one decimal below. */
export function roundRate(hz: number): number {
  if (!isFiniteNumber(hz) || hz <= 0) return 0;
  return hz >= 100 ? Math.round(hz) : Math.round(hz * 10) / 10;
}

/** Rounds a millisecond value to two decimals for a stable display. */
export function roundMs(ms: number): number {
  if (!isFiniteNumber(ms) || ms < 0) return 0;
  return Math.round(ms * 100) / 100;
}

export interface ReportLabels {
  rate: string;
  standard: string;
  none: string;
  frameTime: string;
  averageFrameTime: string;
  jitter: string;
  dropped: string;
  frames: string;
  stability: string;
  sample: string;
  duration: string;
  range: string;
  interrupted: string;
  seconds: string;
  milliseconds: string;
  hertz: string;
}

/**
 * Plain-text report for a support note or a comparison between two runs. Labels come from the
 * locale so the copied text is ready to paste; the numbers are the measured values, not claims
 * about the panel's specification.
 */
export function rateReport(stats: FrameStats, labels: ReportLabels): string {
  const match = matchStandardRate(stats.hz);
  const standard = match && match.withinTolerance ? `${match.rate} ${labels.hertz}` : labels.none;
  return [
    `${labels.rate}: ${roundRate(stats.hz)} ${labels.hertz}`,
    `${labels.standard}: ${standard}`,
    `${labels.frameTime}: ${roundMs(stats.medianIntervalMs)} ${labels.milliseconds}`,
    `${labels.averageFrameTime}: ${roundMs(stats.meanIntervalMs)} ${labels.milliseconds}`,
    `${labels.jitter}: ${roundMs(stats.jitterMs)} ${labels.milliseconds}`,
    `${labels.dropped}: ${stats.droppedFrames} / ${stats.sampleCount} ${labels.frames}`,
    `${labels.stability}: ${Math.round(stats.stabilityShare * 100)}%`,
    `${labels.range}: ${roundRate(stats.minHz)}–${roundRate(stats.maxHz)} ${labels.hertz}`,
    `${labels.sample}: ${stats.sampleCount} ${labels.frames} · ${labels.duration}: ${roundMs(stats.measuredMs / 1000)} ${labels.seconds}`,
    ...(stats.stalled ? [`${labels.interrupted}: ${roundMs(stats.longestGapMs)} ${labels.milliseconds}`] : []),
  ].join('\n');
}
