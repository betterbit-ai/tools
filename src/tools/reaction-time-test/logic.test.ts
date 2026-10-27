import { describe, expect, it } from 'vitest';
import {
  MIN_REACTION_MS,
  ROUND_COUNT,
  addReactionTime,
  formatMilliseconds,
  isBetterAverage,
  isValidReactionTime,
  referencePercentile,
  summariseReactionTimes,
} from './logic';

describe('reaction-time validation', () => {
  it('accepts measured boundaries and rejects anticipation or malformed values', () => {
    expect(isValidReactionTime(MIN_REACTION_MS)).toBe(true);
    expect(isValidReactionTime(MIN_REACTION_MS - 0.1)).toBe(false);
    expect(isValidReactionTime(0)).toBe(false);
    expect(isValidReactionTime(Number.POSITIVE_INFINITY)).toBe(false);
  });

  it('does not coerce empty, huge-text, or Unicode lookalike values', () => {
    expect(isValidReactionTime('')).toBe(false);
    expect(isValidReactionTime('231')).toBe(false);
    expect(isValidReactionTime('２３１')).toBe(false);
    expect(isValidReactionTime('반응속도 231ms 🖱️')).toBe(false);
  });
});

describe('reaction-time sessions', () => {
  it('keeps valid round order, rounds recorded milliseconds, and caps a session at five rounds', () => {
    let results: number[] = [];
    for (const value of [201.4, 299.6, 180, 320, 250, 199]) results = addReactionTime(results, value);

    expect(results).toEqual([201, 300, 180, 320, 250]);
    expect(results).toHaveLength(ROUND_COUNT);
  });

  it('ignores an invalid response without discarding completed rounds', () => {
    const original = [210, 240];
    expect(addReactionTime(original, 55)).toEqual(original);
    expect(addReactionTime(original, Number.NaN)).toEqual(original);
  });

  it('summarises an odd session without changing round order', () => {
    const results = [240, 200, 260, 220, 280];
    expect(summariseReactionTimes(results)).toMatchObject({
      count: 5,
      average: 240,
      median: 240,
      fastest: 200,
      slowest: 280,
      spread: 80,
    });
    expect(results).toEqual([240, 200, 260, 220, 280]);
  });

  it('uses the midpoint for an even-session median and returns empty values for no results', () => {
    expect(summariseReactionTimes([200, 260])).toMatchObject({ average: 230, median: 230, spread: 60 });
    expect(summariseReactionTimes([])).toMatchObject({ count: 0, average: null, referencePercentile: null });
  });
});

describe('reference context and local bests', () => {
  it('maps the research mean close to the 50th reference percentile and clamps extremes', () => {
    expect(referencePercentile(231)).toBe(50);
    expect(referencePercentile(150)).toBe(99);
    expect(referencePercentile(600)).toBe(1);
    expect(referencePercentile('231')).toBeNull();
  });

  it('formats only valid results and updates a local best only when lower', () => {
    expect(formatMilliseconds(212.6)).toBe('213');
    expect(formatMilliseconds('212')).toBe('—');
    expect(isBetterAverage(210, 220)).toBe(true);
    expect(isBetterAverage(220, 220)).toBe(false);
    expect(isBetterAverage(220, '210')).toBe(true);
  });
});
