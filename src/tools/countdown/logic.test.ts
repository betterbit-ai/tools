import { describe, expect, it } from 'vitest';
import {
  calendarDayDifference,
  formatDday,
  isValidDate,
  isValidTime,
  nextAnnualDate,
  normalizeEventName,
  splitRemaining,
  toLocalTimestamp,
} from './logic';

describe('countdown date parsing', () => {
  it('accepts leap day and rejects impossible calendar values', () => {
    expect(isValidDate('2028-02-29')).toBe(true);
    expect(isValidDate('2027-02-29')).toBe(false);
    expect(isValidDate('2026-13-01')).toBe(false);
    expect(isValidDate('')).toBe(false);
  });

  it('uses local midnight for a date with no time', () => {
    const target = toLocalTimestamp('2026-12-25');
    expect(target).not.toBeNull();
    const local = new Date(target!);
    expect([local.getHours(), local.getMinutes(), local.getSeconds()]).toEqual([0, 0, 0]);
    expect(toLocalTimestamp('2026-12-25', '24:00')).toBeNull();
    expect(isValidTime('09:30')).toBe(true);
  });
});

describe('countdown math', () => {
  it('breaks a remaining span into live display parts and stops at zero', () => {
    const now = 1_000_000;
    expect(splitRemaining(now + 86_400_000 + 3_661_000, now)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1 });
    expect(splitRemaining(now - 1, now)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it('uses calendar dates for D-day instead of 24-hour elapsed periods', () => {
    const localNoon = new Date(2026, 2, 8, 12).getTime();
    expect(calendarDayDifference('2026-03-09', localNoon)).toBe(1);
    expect(calendarDayDifference('2026-03-08', localNoon)).toBe(0);
    expect(calendarDayDifference('not-a-date', localNoon)).toBeNull();
    expect(formatDday(2)).toBe('D-2');
    expect(formatDday(0)).toBe('D-Day');
    expect(formatDday(-2)).toBe('D+2');
  });
});

describe('countdown event values', () => {
  it('preserves Unicode names and truncates by characters rather than UTF-16 units', () => {
    expect(normalizeEventName('  수능 🎓  ')).toBe('수능 🎓');
    expect(Array.from(normalizeEventName('🎉'.repeat(100))).length).toBe(80);
  });

  it('moves annual event presets to the next year after their local midnight', () => {
    expect(nextAnnualDate('christmas', new Date(2026, 11, 24, 23, 59).getTime())).toBe('2026-12-25');
    expect(nextAnnualDate('christmas', new Date(2026, 11, 25, 0, 1).getTime())).toBe('2027-12-25');
  });
});
