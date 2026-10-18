import { describe, expect, it } from 'vitest';
import {
  analyseGuidedSample,
  analysePresses,
  CLICK_SCREENING_THRESHOLD_MS,
  GUIDED_SAMPLE_SIZE,
  mouseButtonFromCode,
  type MousePress,
} from './logic';

describe('mouseButtonFromCode', () => {
  it('maps every standard browser mouse-button code', () => {
    expect([0, 1, 2, 3, 4].map(mouseButtonFromCode)).toEqual(['left', 'middle', 'right', 'back', 'forward']);
  });

  it('rejects touch, pen, negative and unknown button codes', () => {
    expect(mouseButtonFromCode(-1)).toBeNull();
    expect(mouseButtonFromCode(5)).toBeNull();
    expect(mouseButtonFromCode(Number.NaN)).toBeNull();
  });
});

describe('analysePresses', () => {
  it('counts buttons independently and compares intervals only within a button', () => {
    const result = analysePresses([
      { button: 'left', time: 100 },
      { button: 'right', time: 105 },
      { button: 'left', time: 170 },
      { button: 'right', time: 500 },
    ]);
    expect(result.counts).toMatchObject({ left: 2, right: 2, middle: 0, back: 0, forward: 0 });
    expect(result.intervals).toEqual([
      { button: 'left', milliseconds: 70 },
      { button: 'right', milliseconds: 395 },
    ]);
    expect(result.suspects).toEqual([{ button: 'left', milliseconds: 70 }]);
    expect(result.shortestInterval).toBe(70);
  });

  it('keeps the screening boundary inclusive: 80 ms is not flagged, 79 ms is', () => {
    expect(
      analysePresses([
        { button: 'left', time: 0 },
        { button: 'left', time: CLICK_SCREENING_THRESHOLD_MS },
      ]).suspects,
    ).toEqual([]);
    expect(
      analysePresses([
        { button: 'left', time: 0 },
        { button: 'left', time: CLICK_SCREENING_THRESHOLD_MS - 1 },
      ]).suspects,
    ).toEqual([{ button: 'left', milliseconds: CLICK_SCREENING_THRESHOLD_MS - 1 }]);
  });

  it('handles an empty or very large sequence without a false interval', () => {
    expect(analysePresses([])).toMatchObject({ shortestInterval: null, suspects: [] });
    const presses: MousePress[] = Array.from({ length: 10_000 }, (_, index) => ({
      button: 'left',
      time: index * 100,
    }));
    const result = analysePresses(presses);
    expect(result.counts.left).toBe(10_000);
    expect(result.suspects).toHaveLength(0);
    expect(result.shortestInterval).toBe(100);
  });

  it('ignores malformed button names, non-finite times and backwards timestamps for intervals', () => {
    const malformed = [
      { button: 'left', time: 100 },
      { button: 'left', time: 80 },
      { button: 'left', time: Number.POSITIVE_INFINITY },
      { button: '한글', time: 120 },
      { button: '🖱️', time: 130 },
      { button: 'left', time: 200 },
    ] as unknown as MousePress[];
    const result = analysePresses(malformed);
    expect(result.counts.left).toBe(3);
    expect(result.intervals).toEqual([{ button: 'left', milliseconds: 100 }]);
    expect(result.suspects).toEqual([]);
  });

  it('clamps an invalid threshold to a safe default or zero', () => {
    const presses: MousePress[] = [
      { button: 'left', time: 0 },
      { button: 'left', time: 10 },
    ];
    expect(analysePresses(presses, Number.NaN).suspects).toHaveLength(1);
    expect(analysePresses(presses, -1).suspects).toHaveLength(0);
  });
});

describe('analyseGuidedSample', () => {
  it('limits a clean sample to its target and completes it at exactly 20 presses', () => {
    const presses: MousePress[] = Array.from({ length: GUIDED_SAMPLE_SIZE + 2 }, (_, index) => ({
      button: 'left',
      time: index * 100,
    }));
    expect(analyseGuidedSample(presses, 'left')).toMatchObject({
      presses: GUIDED_SAMPLE_SIZE,
      target: GUIDED_SAMPLE_SIZE,
      suspects: 0,
      complete: true,
      status: 'clean',
    });
  });

  it('reports a candidate immediately but continues collecting until the sample is complete', () => {
    const early = analyseGuidedSample(
      [
        { button: 'middle', time: 0 },
        { button: 'middle', time: 20 },
      ],
      'middle',
      3,
    );
    expect(early).toMatchObject({ presses: 2, suspects: 1, complete: false, status: 'suspect' });
  });

  it('starts ready and only considers the selected button', () => {
    expect(analyseGuidedSample([{ button: 'right', time: 0 }], 'left')).toMatchObject({
      presses: 0,
      shortestInterval: null,
      status: 'ready',
    });
  });
});
