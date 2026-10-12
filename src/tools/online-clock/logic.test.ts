import { describe, expect, it } from 'vitest';
import { DEFAULT_CLOCK_SETTINGS, formatTime, formatUtcOffset, isClockSettings, makeClockDisplay } from './logic';

describe('online-clock formatting', () => {
  it('pads the midnight boundary in 24-hour time', () => {
    const date = new Date(2026, 0, 1, 0, 0, 0);
    expect(formatTime(date, '24h', true)).toEqual({ time: '00:00:00', period: null });
  });

  it('uses 12 instead of zero at midnight and noon', () => {
    expect(formatTime(new Date(2026, 0, 1, 0, 5, 9), '12h', true)).toEqual({ time: '12:05:09', period: 'AM' });
    expect(formatTime(new Date(2026, 0, 1, 12, 0, 0), '12h', false)).toEqual({ time: '12:00', period: 'PM' });
  });

  it('can omit seconds without changing hours or minutes', () => {
    expect(formatTime(new Date(2026, 0, 1, 23, 59, 59), '24h', false)).toEqual({ time: '23:59', period: null });
  });

  it('formats offset boundaries, including fractional-hour zones', () => {
    expect(formatUtcOffset(0)).toBe('UTC+00:00');
    expect(formatUtcOffset(-480)).toBe('UTC-08:00');
    expect(formatUtcOffset(345)).toBe('UTC+05:45');
    expect(formatUtcOffset(Number.POSITIVE_INFINITY)).toBe('UTC');
  });

  it('uses Korean Unicode date conventions when requested', () => {
    const display = makeClockDisplay(new Date(2026, 0, 2, 3, 4, 5), 'ko-KR', DEFAULT_CLOCK_SETTINGS);
    expect(display.date).toContain('년');
    expect(display.date).toContain('월');
    expect(display.date).toContain('일');
  });

  it('rejects empty, incomplete and malformed stored settings', () => {
    expect(isClockSettings(null)).toBe(false);
    expect(isClockSettings({})).toBe(false);
    expect(isClockSettings({ format: '24h', showSeconds: true, showDate: 'yes' })).toBe(false);
    expect(isClockSettings({ format: '25h', showSeconds: true, showDate: true })).toBe(false);
    expect(isClockSettings(DEFAULT_CLOCK_SETTINGS)).toBe(true);
  });
});
