import { describe, expect, it } from 'vitest';
import {
  analyzeFrames,
  DEFAULT_WARMUP_FRAMES,
  frameBudgetMs,
  frameIntervals,
  intervalToHz,
  matchStandardRate,
  median,
  MIN_INTERVALS,
  percentile,
  rateReport,
  roundMs,
  roundRate,
  standardIntervalMs,
  STANDARD_RATES,
  type FrameStats,
  type ReportLabels,
} from './logic';

/** Builds timestamps whose consecutive intervals repeat the given pattern, starting at 100 ms. */
function timestampsFor(intervals: number[], start = 100): number[] {
  const out = [start];
  for (const interval of intervals) out.push(out[out.length - 1] + interval);
  return out;
}

/** A steady run of `count` intervals at `ms`, with the warm-up frames the analyser discards. */
function steady(ms: number, count = 120, warmup = DEFAULT_WARMUP_FRAMES): number[] {
  return timestampsFor([...Array(warmup).fill(ms * 1.7), ...Array(count).fill(ms)]);
}

const LABELS: ReportLabels = {
  rate: 'Refresh rate',
  standard: 'Nearest standard rate',
  none: 'none',
  frameTime: 'Frame time (median)',
  averageFrameTime: 'Average frame time',
  jitter: 'Jitter',
  dropped: 'Dropped frames',
  frames: 'frames',
  stability: 'Stable intervals',
  sample: 'Sample',
  duration: 'Duration',
  range: 'Range',
  interrupted: 'Interrupted',
  seconds: 's',
  milliseconds: 'ms',
  hertz: 'Hz',
};

describe('frameIntervals', () => {
  it('takes consecutive differences', () => {
    expect(frameIntervals([0, 16, 32, 50])).toEqual([16, 16, 18]);
  });

  it('returns nothing for a single frame or an empty run', () => {
    expect(frameIntervals([])).toEqual([]);
    expect(frameIntervals([16])).toEqual([]);
  });

  it('drops repeated and out-of-order timestamps instead of producing zero or negative intervals', () => {
    expect(frameIntervals([0, 16, 16, 12, 30])).toEqual([16, 18]);
  });

  it('ignores non-finite timestamps', () => {
    expect(frameIntervals([0, Number.NaN, 16, Number.POSITIVE_INFINITY, 32])).toEqual([]);
  });
});

describe('median and percentile', () => {
  it('averages the two middle values of an even list', () => {
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });

  it('handles an odd list and returns 0 for an empty one', () => {
    expect(median([5, 1, 3])).toBe(3);
    expect(median([])).toBe(0);
  });

  it('reads nearest-rank percentiles', () => {
    const values = [...Array(100).keys()].map((n) => n + 1);
    expect(percentile(values, 0.5)).toBe(50);
    expect(percentile(values, 0.95)).toBe(95);
    expect(percentile(values, 0)).toBe(1);
    expect(percentile(values, 1)).toBe(100);
  });

  it('clamps percentiles outside 0–1 and returns 0 for an empty list', () => {
    expect(percentile([1, 2, 3], -1)).toBe(1);
    expect(percentile([1, 2, 3], 4)).toBe(3);
    expect(percentile([], 0.5)).toBe(0);
  });
});

describe('intervalToHz', () => {
  it('converts the frame times of common displays', () => {
    expect(intervalToHz(1000 / 60)).toBeCloseTo(60, 6);
    expect(intervalToHz(8.333)).toBeCloseTo(120.0, 1);
    expect(intervalToHz(6.944)).toBeCloseTo(144.0, 1);
  });

  it('returns 0 rather than Infinity for a zero or invalid interval', () => {
    expect(intervalToHz(0)).toBe(0);
    expect(intervalToHz(-5)).toBe(0);
    expect(intervalToHz(Number.NaN)).toBe(0);
  });
});

describe('analyzeFrames', () => {
  it('reads a steady 60 Hz run as 60 Hz', () => {
    const stats = analyzeFrames(steady(1000 / 60));
    expect(stats).not.toBeNull();
    expect(stats!.hz).toBeCloseTo(60, 6);
    expect(stats!.medianIntervalMs).toBeCloseTo(16.667, 3);
    expect(stats!.droppedFrames).toBe(0);
    expect(stats!.stabilityShare).toBe(1);
    expect(stats!.stalled).toBe(false);
  });

  it('reads 120 Hz and 144 Hz runs', () => {
    expect(analyzeFrames(steady(1000 / 120))!.hz).toBeCloseTo(120, 6);
    expect(analyzeFrames(steady(1000 / 144))!.hz).toBeCloseTo(144, 6);
  });

  it('discards the warm-up frames instead of letting page-load stutter drag the median', () => {
    const withWarmup = timestampsFor([...Array(10).fill(120), ...Array(120).fill(16.667)]);
    expect(analyzeFrames(withWarmup)!.hz).toBeCloseTo(60, 2);
    expect(analyzeFrames(withWarmup)!.sampleCount).toBe(120);
  });

  it('needs enough intervals to report anything', () => {
    expect(analyzeFrames(timestampsFor(Array(MIN_INTERVALS - 1).fill(16.667)))).toBeNull();
    expect(analyzeFrames([])).toBeNull();
    expect(analyzeFrames([0])).toBeNull();
  });

  it('counts a frame at 1.5× the median as dropped and keeps the reading at 60 Hz', () => {
    const intervals = [...Array(120).fill(16.667)];
    intervals[60] = 26;
    const stats = analyzeFrames(timestampsFor([...Array(10).fill(60), ...intervals]))!;
    expect(stats.hz).toBeCloseTo(60, 2);
    expect(stats.droppedFrames).toBe(1);
    expect(stats.droppedShare).toBeCloseTo(1 / 120, 5);
    expect(stats.stabilityShare).toBeCloseTo(119 / 120, 5);
  });

  it('marks a hidden-tab gap as a stall and keeps the longest gap for the message', () => {
    const intervals = [...Array(60).fill(16.667), 3000, ...Array(60).fill(16.667)];
    const stats = analyzeFrames(timestampsFor([...Array(10).fill(16.667), ...intervals]))!;
    expect(stats.stalled).toBe(true);
    expect(stats.longestGapMs).toBeCloseTo(3000, 6);
    expect(stats.hz).toBeCloseTo(60, 2);
  });

  it('reports the fastest and slowest frame as a rate range', () => {
    const intervals = [...Array(119).fill(16.667)];
    intervals.push(33.333);
    const stats = analyzeFrames(timestampsFor([...Array(10).fill(16.667), ...intervals]))!;
    expect(stats.minHz).toBeCloseTo(30, 0);
    expect(stats.maxHz).toBeCloseTo(60, 0);
  });

  it('measures jitter and spread on an irregular run', () => {
    const intervals = [16.6, 17.2, 16.1, 16.8, 16.4, ...Array(100).fill(16.6)];
    const stats = analyzeFrames(timestampsFor([...Array(10).fill(16.6), ...intervals]))!;
    expect(stats.jitterMs).toBeGreaterThan(0);
    expect(stats.stdDevMs).toBeGreaterThan(0);
    expect(stats.hz).toBeCloseTo(60, 0);
  });

  it('handles a fractional 59.94 Hz signal without inventing 60', () => {
    const stats = analyzeFrames(steady(1000 / 59.94))!;
    expect(stats.hz).toBeCloseTo(59.94, 4);
    expect(matchStandardRate(stats.hz)!.withinTolerance).toBe(true);
  });

  it('survives a long run without spreading a huge array into Math.max', () => {
    const stats = analyzeFrames(steady(16.667, 40000, 10))!;
    expect(stats.sampleCount).toBe(40000);
    expect(stats.hz).toBeCloseTo(60, 2);
  });
});

describe('matchStandardRate', () => {
  it('names the closest common rate', () => {
    expect(matchStandardRate(59.94)!.rate).toBe(60);
    expect(matchStandardRate(143.9)!.rate).toBe(144);
    expect(matchStandardRate(239.7)!.rate).toBe(240);
    expect(matchStandardRate(24.2)!.rate).toBe(24);
  });

  it('keeps a reading outside 2% from being called that standard rate', () => {
    const irregular = matchStandardRate(133)!;
    expect(irregular.rate).toBe(144);
    expect(irregular.withinTolerance).toBe(false);
    expect(irregular.relative).toBeCloseTo(11 / 144, 6);
  });

  it('reports the size and direction of the gap', () => {
    const low = matchStandardRate(118.5)!;
    expect(low.deltaHz).toBeCloseTo(-1.5, 6);
    expect(low.withinTolerance).toBe(true);
    const high = matchStandardRate(61)!;
    expect(high.deltaHz).toBeCloseTo(1, 6);
    expect(high.withinTolerance).toBe(true);
  });

  it('returns null when there is no reading to match', () => {
    expect(matchStandardRate(0)).toBeNull();
    expect(matchStandardRate(-60)).toBeNull();
    expect(matchStandardRate(Number.NaN)).toBeNull();
  });

  it('covers the display rates the page lists', () => {
    for (const rate of STANDARD_RATES) {
      expect(matchStandardRate(rate)!.rate).toBe(rate);
      expect(matchStandardRate(rate)!.withinTolerance).toBe(true);
    }
  });
});

describe('frame budgets', () => {
  it('turns a rate into the time one frame may take', () => {
    expect(frameBudgetMs(60)).toBeCloseTo(16.667, 3);
    expect(frameBudgetMs(120)).toBeCloseTo(8.333, 3);
    expect(frameBudgetMs(144)).toBeCloseTo(6.944, 3);
    expect(frameBudgetMs(0)).toBe(0);
    expect(standardIntervalMs(60)).toBeCloseTo(16.667, 3);
  });
});

describe('rounding and reports', () => {
  it('rounds rates the way the page shows them', () => {
    expect(roundRate(143.94)).toBe(144);
    expect(roundRate(59.94)).toBe(59.9);
    expect(roundRate(0)).toBe(0);
    expect(roundMs(16.6666)).toBe(16.67);
    expect(roundMs(-1)).toBe(0);
  });

  it('writes a copyable report with the measured values', () => {
    const stats = analyzeFrames(steady(1000 / 60))!;
    const report = rateReport(stats, LABELS);
    expect(report).toContain('Refresh rate: 60 Hz');
    expect(report).toContain('Nearest standard rate: 60 Hz');
    expect(report).toContain('Frame time (median): 16.67 ms');
    expect(report).toContain('Dropped frames: 0 / 120 frames');
    expect(report).toContain('Stable intervals: 100%');
    expect(report).not.toContain('Interrupted');
  });

  it('says no standard rate matched and adds the interruption when there was a gap', () => {
    const stalled = analyzeFrames(
      timestampsFor([...Array(10).fill(16.6), ...Array(60).fill(7.5), 900, ...Array(60).fill(7.5)]),
    )!;
    const report = rateReport(stalled, LABELS);
    expect(report).toContain('Nearest standard rate: none');
    expect(report).toContain('Interrupted: 900 ms');
  });

  it('turns Korean labels into a report a Korean user can paste', () => {
    const stats: FrameStats = analyzeFrames(steady(1000 / 120))!;
    const report = rateReport(stats, {
      ...LABELS,
      rate: '주사율',
      standard: '가까운 표준 주사율',
      none: '없음',
      frameTime: '프레임 간격(중앙값)',
      jitter: '지터',
      dropped: '끊긴 프레임',
      frames: '프레임',
      stability: '안정 구간',
      sample: '샘플',
    });
    expect(report).toContain('주사율: 120 Hz');
    expect(report).toContain('가까운 표준 주사율: 120 Hz');
    expect(report).toContain('끊긴 프레임: 0 / 120 프레임');
  });
});
