import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  advance,
  formatClock,
  idle,
  isIntervalTimerState,
  pause,
  remainingMs,
  sanitizeSettings,
  settle,
  start,
  totalSeconds,
} from './logic';

describe('interval timer logic', () => {
  it('uses the classic Tabata total of 20/10 for eight rounds', () => {
    expect(totalSeconds({ prepSeconds: 0, workSeconds: 20, restSeconds: 10, rounds: 8 })).toBe(240);
  });

  it('moves through prep, work, rest and all rounds at absolute clock boundaries', () => {
    const settings = { prepSeconds: 5, workSeconds: 20, restSeconds: 10, rounds: 2 };
    const running = start(idle(settings), 1_000);
    expect(running).toMatchObject({ phase: 'ready', round: 0, endAt: 6_000 });
    expect(settle(running, 6_000)).toMatchObject({ phase: 'work', round: 1, endAt: 26_000 });
    expect(settle(running, 26_000)).toMatchObject({ phase: 'rest', round: 1, endAt: 36_000 });
    expect(settle(running, 66_000)).toMatchObject({ status: 'done', phase: 'done', round: 2 });
  });

  it('does not count paused time and resumes from the remaining phase time', () => {
    const running = start(idle({ prepSeconds: 0, workSeconds: 20, restSeconds: 10, rounds: 1 }), 1_000);
    const paused = pause(running, 6_500);
    expect(remainingMs(paused, 999_999)).toBe(14_500);
    expect(start(paused, 100_000)).toMatchObject({ status: 'running', endAt: 114_500, pausedRemainingMs: null });
  });

  it('handles a zero-second rest without getting stuck', () => {
    const running = start(idle({ prepSeconds: 0, workSeconds: 1, restSeconds: 0, rounds: 2 }), 0);
    expect(settle(running, 1_000)).toMatchObject({ phase: 'work', round: 2, endAt: 2_000 });
    expect(settle(running, 2_000)).toMatchObject({ status: 'done', phase: 'done' });
  });

  it('clamps empty, huge and invalid settings to safe bounds', () => {
    expect(
      sanitizeSettings({ prepSeconds: -1, workSeconds: 0, restSeconds: Number.POSITIVE_INFINITY, rounds: 999 }),
    ).toEqual({
      prepSeconds: 0,
      workSeconds: 1,
      restSeconds: 0,
      rounds: 99,
    });
    expect(sanitizeSettings({})).toEqual(DEFAULT_SETTINGS);
  });

  it('formats boundaries and rejects malformed Unicode strings in restored data', () => {
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(3_599_001)).toBe('1:00:00');
    expect(isIntervalTimerState({ ...idle(DEFAULT_SETTINGS), settings: { ...DEFAULT_SETTINGS, rounds: '８' } })).toBe(
      false,
    );
  });

  it('advances one known phase directly', () => {
    const running = start(idle({ prepSeconds: 0, workSeconds: 10, restSeconds: 5, rounds: 1 }), 0);
    expect(advance(running, 10_000)).toMatchObject({ phase: 'rest', round: 1, endAt: 15_000 });
  });
});
