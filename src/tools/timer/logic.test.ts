import { describe, expect, it } from 'vitest';
import { addTime, formatClock, idle, pause, remaining, settle, start, toMs } from './logic';

describe('formatClock', () => {
  it('formats minutes and seconds', () => {
    expect(formatClock(5 * 60_000)).toBe('05:00');
    expect(formatClock(61_000)).toBe('01:01');
  });
  it('shows hours when needed', () => {
    expect(formatClock(toMs(1, 2, 3))).toBe('1:02:03');
  });
  it('rounds partial seconds up', () => {
    expect(formatClock(100)).toBe('00:01');
    expect(formatClock(0)).toBe('00:00');
  });
});

describe('timer state machine', () => {
  const five = toMs(0, 5, 0);

  it('runs against an absolute end time', () => {
    const s = start(idle(five), 1_000);
    expect(remaining(s, 1_000 + 60_000)).toBe(toMs(0, 4, 0));
  });

  it('pauses and resumes without losing time', () => {
    let s = start(idle(five), 0);
    s = pause(s, 10_000);
    expect(remaining(s, 999_999)).toBe(five - 10_000);
    s = start(s, 100_000);
    expect(remaining(s, 100_000)).toBe(five - 10_000);
  });

  it('settles to done after expiry', () => {
    const s = settle(start(idle(1_000), 0), 1_000);
    expect(s.status).toBe('done');
    expect(remaining(s, 2_000)).toBe(0);
  });

  it('adds time while running and restarts from done', () => {
    const running = addTime(start(idle(five), 0), 60_000, 0);
    expect(remaining(running, 0)).toBe(five + 60_000);
    const restarted = addTime({ ...idle(five), status: 'done' }, 60_000, 50);
    expect(restarted.status).toBe('running');
    expect(remaining(restarted, 50)).toBe(60_000);
  });

  it('does not start a zero-length timer', () => {
    expect(start(idle(0), 0).status).toBe('idle');
  });
});
