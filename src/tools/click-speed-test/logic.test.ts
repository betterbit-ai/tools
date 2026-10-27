import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DURATION,
  TEST_DURATIONS,
  addClick,
  createRun,
  formatScore,
  formatTimeLeft,
  isBetterScore,
  summariseRun,
  toTestDuration,
} from './logic';

describe('test durations', () => {
  it('accepts only the published duration choices', () => {
    expect(TEST_DURATIONS).toEqual([1, 5, 10, 30, 60]);
    expect(toTestDuration(10)).toBe(10);
    expect(toTestDuration(0)).toBe(DEFAULT_DURATION);
    expect(toTestDuration(2.5)).toBe(DEFAULT_DURATION);
  });

  it('rejects empty, huge and Unicode-lookalike persisted values', () => {
    expect(toTestDuration(undefined)).toBe(DEFAULT_DURATION);
    expect(toTestDuration(1_000_000)).toBe(DEFAULT_DURATION);
    expect(toTestDuration('５')).toBe(DEFAULT_DURATION);
    expect(toTestDuration('5초')).toBe(DEFAULT_DURATION);
    expect(toTestDuration('🖱️')).toBe(DEFAULT_DURATION);
  });
});

describe('click run', () => {
  it('counts the first press and assigns accepted presses to one-second buckets', () => {
    let run = createRun(5);
    run = addClick(run, 0);
    run = addClick(run, 999.9);
    run = addClick(run, 1_000);
    run = addClick(run, 4_999.99);

    expect(run).toMatchObject({ clicks: 4, buckets: [2, 1, 0, 0, 1] });
    expect(summariseRun(run)).toMatchObject({ cps: 0.8, cpm: 48, fastestSecond: 2 });
  });

  it('rejects a press exactly at the finish line and malformed clock values', () => {
    const empty = createRun(1);
    expect(addClick(empty, 1_000)).toBe(empty);
    expect(addClick(empty, -1)).toBe(empty);
    expect(addClick(empty, Number.NaN)).toBe(empty);
    expect(addClick(empty, Number.POSITIVE_INFINITY)).toBe(empty);
  });

  it('uses fixed-size pace storage even for a very high click count', () => {
    let run = createRun(60);
    for (let index = 0; index < 10_000; index++) run = addClick(run, (index % 60_000) + 0.5);

    const summary = summariseRun(run);
    expect(summary.clicks).toBe(10_000);
    expect(summary.buckets).toHaveLength(60);
    expect(summary.fastestSecond).toBeGreaterThan(0);
  });
});

describe('score display', () => {
  it('formats stable scores and countdown boundaries', () => {
    expect(formatScore(7.2)).toBe('7.20');
    expect(formatScore(-1)).toBe('0.00');
    expect(formatScore(Number.NaN, 10)).toBe('0.000000');
    expect(formatTimeLeft(0, 5)).toBe('5.0');
    expect(formatTimeLeft(4_999, 5)).toBe('0.0');
    expect(formatTimeLeft(9_000, 5)).toBe('0.0');
  });

  it('updates a personal best only for a strictly higher valid score', () => {
    expect(isBetterScore(7.2, 7.1)).toBe(true);
    expect(isBetterScore(7.2, 7.2)).toBe(false);
    expect(isBetterScore('8', 7.2)).toBe(false);
  });
});
