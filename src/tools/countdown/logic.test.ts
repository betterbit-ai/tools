import { describe, expect, it } from 'vitest';
import {
  calendarDayDifference,
  formatDday,
  isValidDate,
  isValidTime,
  nextAnnualDate,
  normalizeEventName,
  splitElapsed,
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

  it('uses local midnight for a date with no time and supports early valid years', () => {
    const target = toLocalTimestamp('2026-12-25');
    expect(target).not.toBeNull();
    const local = new Date(target!);
    expect([local.getHours(), local.getMinutes(), local.getSeconds()]).toEqual([0, 0, 0]);
    expect(toLocalTimestamp('2026-12-25', '24:00')).toBeNull();
    expect(isValidTime('09:30')).toBe(true);
    expect(isValidDate('0001-01-01')).toBe(true);
    expect(new Date(toLocalTimestamp('0001-01-01')!).getFullYear()).toBe(1);
  });

  it('rejects a local time skipped by daylight saving', () => {
    const timeZone = process.env.TZ;
    process.env.TZ = 'America/New_York';
    try {
      expect(toLocalTimestamp('2026-03-08', '02:30')).toBeNull();
      expect(toLocalTimestamp('2026-03-08', '03:30')).not.toBeNull();
      expect(toLocalTimestamp('2026-03-08')).not.toBeNull();
    } finally {
      if (timeZone === undefined) delete process.env.TZ;
      else process.env.TZ = timeZone;
    }
  });
});

describe('countdown math', () => {
  it('breaks a remaining span into live display parts and stops at zero', () => {
    const now = 1_000_000;
    expect(splitRemaining(now + 86_400_000 + 3_661_000, now)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1 });
    expect(splitRemaining(now - 1, now)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    expect(splitElapsed(now, now + 86_400_000 + 3_661_000)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1 });
  });

  it('uses calendar dates for D-day instead of 24-hour elapsed periods', () => {
    const localNoon = new Date(2026, 2, 8, 12).getTime();
    const firstYear = new Date(0);
    firstYear.setFullYear(1, 0, 1);
    expect(calendarDayDifference('2026-03-09', localNoon)).toBe(1);
    expect(calendarDayDifference('2026-03-08', localNoon)).toBe(0);
    expect(calendarDayDifference('0001-01-02', firstYear.getTime())).toBe(1);
    expect(calendarDayDifference('not-a-date', localNoon)).toBeNull();
    expect(formatDday(2)).toBe('D-2');
    expect(formatDday(0)).toBe('D-Day');
    expect(formatDday(-2)).toBe('D+2');
  });
});

describe('countdown event values', () => {
  it('preserves Unicode names and truncates by grapheme clusters rather than UTF-16 units', () => {
    expect(normalizeEventName('  수능 🎓  ')).toBe('수능 🎓');
    expect(Array.from(normalizeEventName('🎉'.repeat(100))).length).toBe(80);
    expect(normalizeEventName('👨‍👩‍👧‍👦'.repeat(81))).toBe('👨‍👩‍👧‍👦'.repeat(80));
  });

  it('moves annual event presets to the next year after their local midnight', () => {
    expect(nextAnnualDate('christmas', new Date(2026, 11, 24, 23, 59).getTime())).toBe('2026-12-25');
    expect(nextAnnualDate('christmas', new Date(2026, 11, 25, 0, 1).getTime())).toBe('2027-12-25');
    expect(nextAnnualDate('christmas', new Date(2026, 11, 25).getTime())).toBe('2027-12-25');
  });
});
