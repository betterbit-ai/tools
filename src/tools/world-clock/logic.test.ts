import { describe, expect, it } from 'vitest';
import { clockParts, formatHour, fullOverlapRanges, isWorkingHour, overlapHours } from './logic';

describe('world-clock', () => {
  const instant = Date.UTC(2026, 0, 15, 0, 0, 0);

  it('shows exact local time, date, weekday and fractional UTC offsets', () => {
    expect(clockParts(instant, 'Asia/Seoul', 'ko', '24')).toMatchObject({ offsetMinutes: 540 });
    expect(clockParts(instant, 'Asia/Kathmandu', 'en', '24')).toMatchObject({ offsetMinutes: 345 });
    expect(clockParts(instant, 'America/New_York', 'en', '24').date).toContain('Jan');
  });

  it('uses an inclusive workday start and exclusive end', () => {
    const nine = Date.UTC(2026, 0, 15, 0, 0, 0);
    const seventeen = Date.UTC(2026, 0, 15, 8, 0, 0);
    expect(isWorkingHour(nine, 'Asia/Seoul')).toBe(true);
    expect(isWorkingHour(seventeen, 'Asia/Seoul')).toBe(false);
    expect(isWorkingHour(nine, 'Asia/Seoul', 17, 9)).toBe(false);
  });

  it('finds full working-hour overlap in the reference zone and handles DST', () => {
    const hours = overlapHours('2026-01-15', 'Europe/London', ['Europe/London', 'Europe/Paris']);
    expect(fullOverlapRanges(hours)).toEqual([{ start: 9, end: 16 }]);
    const dstHours = overlapHours('2026-07-15', 'America/New_York', ['America/New_York', 'Europe/London']);
    expect(fullOverlapRanges(dstHours)).toEqual([{ start: 9, end: 12 }]);
  });

  it('returns no overlap for empty zones or invalid dates and formats 12/24-hour labels', () => {
    expect(overlapHours('2026-01-15', 'Asia/Seoul', [])).toEqual([]);
    expect(overlapHours('not-a-date', 'Asia/Seoul', ['Asia/Seoul'])).toEqual([]);
    expect(formatHour(13, '24', 'en')).toContain('13');
    expect(formatHour(13, '12', 'en')).toMatch(/1.*PM/i);
  });
});
