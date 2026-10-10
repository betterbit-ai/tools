import { describe, expect, it } from 'vitest';
import {
  MAX_STOPWATCH_MS,
  addLap,
  elapsed,
  formatStopwatch,
  idle,
  isStopwatchState,
  lapsToCsv,
  pause,
  reset,
  settle,
  start,
} from './logic';

describe('stopwatch state machine', () => {
  it('uses a timestamp instead of render ticks', () => {
    const running = start(idle(), 1_000);
    expect(elapsed(running, 3_601_234)).toBe(3_600_234);
  });

  it('pauses and resumes without including the paused interval', () => {
    const paused = pause(start(idle(), 100), 1_100);
    const resumed = start(paused, 10_000);
    expect(elapsed(resumed, 10_250)).toBe(1_250);
  });

  it('records each lap and its split while still running', () => {
    let state = start(idle(), 0);
    state = addLap(state, 1_250);
    state = addLap(state, 3_000);
    expect(state.laps).toEqual([
      { totalMs: 1_250, lapMs: 1_250 },
      { totalMs: 3_000, lapMs: 1_750 },
    ]);
    expect(elapsed(state, 3_500)).toBe(3_500);
  });

  it('does not add a lap when stopped and reset clears every value', () => {
    const stopped = pause(start(idle(), 0), 500);
    expect(addLap(stopped, 600)).toEqual(stopped);
    expect(reset()).toEqual(idle());
  });

  it('stops at the largest representable display time', () => {
    const state = settle(start(idle(), 0), MAX_STOPWATCH_MS + 1);
    expect(state.status).toBe('paused');
    expect(state.elapsedMs).toBe(MAX_STOPWATCH_MS);
  });
});

describe('formatStopwatch', () => {
  it('formats zero, milliseconds and hours', () => {
    expect(formatStopwatch(0)).toBe('00:00:00.000');
    expect(formatStopwatch(61_002)).toBe('00:01:01.002');
    expect(formatStopwatch(3_661_999)).toBe('01:01:01.999');
  });

  it('clamps negative and oversized values', () => {
    expect(formatStopwatch(-1)).toBe('00:00:00.000');
    expect(formatStopwatch(MAX_STOPWATCH_MS + 1)).toBe('999:59:59.999');
  });
});

describe('lapsToCsv', () => {
  it('exports lap numbers, split times and totals', () => {
    expect(lapsToCsv([{ lapMs: 1_250, totalMs: 1_250 }], ['Lap', 'Lap time', 'Total time'])).toBe(
      'Lap,Lap time,Total time\r\n1,00:00:01.250,00:00:01.250\r\n',
    );
  });

  it('preserves Korean and emoji headers while escaping CSV punctuation', () => {
    expect(lapsToCsv([], ['랩, 번호', '구간 "기록"', '전체 ⏱\n시간'])).toBe(
      '"랩, 번호","구간 ""기록""","전체 ⏱\n시간"\r\n',
    );
  });
});

describe('isStopwatchState', () => {
  it('accepts a serializable valid state and rejects malformed storage data', () => {
    expect(isStopwatchState(start(idle(), 123))).toBe(true);
    expect(isStopwatchState({ status: 'running', elapsedMs: 0, startedAt: null, laps: [] })).toBe(false);
    expect(isStopwatchState({ status: 'paused', elapsedMs: -1, startedAt: null, laps: [] })).toBe(false);
  });
});
