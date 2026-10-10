import { describe, expect, it } from 'vitest';
import {
  addBusinessDays,
  addCalendarDelta,
  calendarSpan,
  countBusinessDays,
  daysBetween,
  holidaysInYear,
  isHolidayCountrySupportedForYear,
  isValidDate,
  todayIso,
  weekdayIndex,
} from './logic';

describe('isValidDate', () => {
  it('accepts a real leap day and rejects a non-leap-year Feb 29', () => {
    expect(isValidDate('2028-02-29')).toBe(true);
    expect(isValidDate('2027-02-29')).toBe(false);
  });

  it('rejects malformed, empty, and impossible values', () => {
    expect(isValidDate('')).toBe(false);
    expect(isValidDate('2026-13-01')).toBe(false);
    expect(isValidDate('2026-02-30')).toBe(false);
    expect(isValidDate('2026/01/01')).toBe(false);
    expect(isValidDate('26-01-01')).toBe(false);
  });

  it('rejects year zero', () => {
    expect(isValidDate('0000-01-01')).toBe(false);
  });
});

describe('todayIso / weekdayIndex', () => {
  it('formats the local calendar date for a given timestamp', () => {
    const noon = new Date(2026, 2, 8, 12).getTime();
    expect(todayIso(noon)).toBe('2026-03-08');
  });

  it('returns 0 for Sunday and 6 for Saturday', () => {
    expect(weekdayIndex('2026-10-11')).toBe(0); // Sunday
    expect(weekdayIndex('2026-10-10')).toBe(6); // Saturday
    expect(weekdayIndex('2026-10-12')).toBe(1); // Monday
  });
});

describe('daysBetween', () => {
  it('counts exact signed day differences across a leap day', () => {
    expect(daysBetween('2024-02-28', '2024-03-01')).toBe(2); // 2024 is a leap year
    expect(daysBetween('2023-02-28', '2023-03-01')).toBe(1);
    expect(daysBetween('2026-01-01', '2026-01-01')).toBe(0);
    expect(daysBetween('2026-01-10', '2026-01-01')).toBe(-9);
  });
});

describe('calendarSpan', () => {
  it('borrows days from the previous month instead of going negative', () => {
    expect(calendarSpan('2024-01-31', '2024-03-01')).toEqual({ years: 0, months: 1, days: 1 });
  });

  it('is symmetric regardless of argument order and zero for equal dates', () => {
    expect(calendarSpan('2020-05-01', '2026-10-11')).toEqual(calendarSpan('2026-10-11', '2020-05-01'));
    expect(calendarSpan('2026-10-11', '2026-10-11')).toEqual({ years: 0, months: 0, days: 0 });
  });

  it('handles a full-year span with a leap day in between', () => {
    expect(calendarSpan('2023-06-15', '2025-06-15')).toEqual({ years: 2, months: 0, days: 0 });
  });
});

describe('US federal holidays (computed from the official rules)', () => {
  it('matches OPM-published 2026 dates, including weekend "in lieu" shifts', () => {
    const holidays = holidaysInYear(2026, 'us');
    expect(holidays.has('2026-01-01')).toBe(true); // New Year's Day (Thursday)
    expect(holidays.has('2026-01-19')).toBe(true); // MLK Day, 3rd Monday
    expect(holidays.has('2026-02-16')).toBe(true); // Washington's Birthday, 3rd Monday
    expect(holidays.has('2026-05-25')).toBe(true); // Memorial Day, last Monday
    expect(holidays.has('2026-06-19')).toBe(true); // Juneteenth (Friday, no shift)
    expect(holidays.has('2026-07-03')).toBe(true); // Independence Day shifted from Sat Jul 4
    expect(holidays.has('2026-09-07')).toBe(true); // Labor Day
    expect(holidays.has('2026-10-12')).toBe(true); // Columbus Day
    expect(holidays.has('2026-11-11')).toBe(true); // Veterans Day (Wednesday)
    expect(holidays.has('2026-11-26')).toBe(true); // Thanksgiving, 4th Thursday
    expect(holidays.has('2026-12-25')).toBe(true); // Christmas (Friday, no shift)
    expect(holidays.size).toBe(11);
  });

  it('matches 2027 dates, including the Sunday-to-Monday shift', () => {
    const holidays = holidaysInYear(2027, 'us');
    expect(holidays.has('2027-01-01')).toBe(true);
    expect(holidays.has('2027-01-18')).toBe(true); // MLK Day
    expect(holidays.has('2027-02-15')).toBe(true); // Washington's Birthday
    expect(holidays.has('2027-05-31')).toBe(true); // Memorial Day
    expect(holidays.has('2027-07-05')).toBe(true); // Independence Day shifted from Sun Jul 4
  });

  it('is always supported, unlike the Korean table', () => {
    expect(isHolidayCountrySupportedForYear(1999, 'us')).toBe(true);
    expect(isHolidayCountrySupportedForYear(2099, 'us')).toBe(true);
  });
});

describe('Korean public holidays (verified table)', () => {
  it('includes the 2026 substitute holidays and the reinstated Constitution Day', () => {
    const holidays = holidaysInYear(2026, 'kr');
    expect(holidays.has('2026-03-02')).toBe(true); // substitute for 삼일절 (Sun Mar 1)
    expect(holidays.has('2026-07-17')).toBe(true); // 제헌절, reinstated from 2026
    expect(holidays.has('2026-08-17')).toBe(true); // substitute for 광복절 (Sat Aug 15)
  });

  it('is only marked supported for years with a verified table', () => {
    expect(isHolidayCountrySupportedForYear(2026, 'kr')).toBe(true);
    expect(isHolidayCountrySupportedForYear(2030, 'kr')).toBe(false);
    expect(holidaysInYear(2030, 'kr').size).toBe(0);
  });

  it('has no holidays for "none"', () => {
    expect(holidaysInYear(2026, 'none').size).toBe(0);
  });
});

describe('countBusinessDays', () => {
  it('excludes only weekends when no country is selected', () => {
    // 2026-10-12 Mon .. 2026-10-18 Sun, inclusive: 5 weekdays + 2 weekend days
    const result = countBusinessDays('2026-10-12', '2026-10-18', 'none', true);
    expect(result).toEqual({ businessDays: 5, weekendDays: 2, holidayDays: 0 });
  });

  it('also excludes US federal holidays when selected', () => {
    // Includes Christmas 2026-12-25 (Friday) and the following weekend.
    const result = countBusinessDays('2026-12-21', '2026-12-27', 'us', true);
    expect(result).toEqual({ businessDays: 4, weekendDays: 2, holidayDays: 1 });
  });

  it('also excludes Korean public holidays when selected', () => {
    // 2026-10-03 (Sat, 개천절) .. 2026-10-09 (Fri, 한글날), inclusive.
    const result = countBusinessDays('2026-10-03', '2026-10-09', 'kr', true);
    expect(result.holidayDays).toBeGreaterThanOrEqual(2); // 한글날 + substitute for 개천절 on Mon 10-05
    expect(result.businessDays + result.weekendDays + result.holidayDays).toBe(7);
  });

  it('matches the plain day difference when exclusive of the start date', () => {
    const totalDays = daysBetween('2026-10-12', '2026-10-19');
    const r = countBusinessDays('2026-10-12', '2026-10-19', 'none', false);
    expect(r.businessDays + r.weekendDays + r.holidayDays).toBe(totalDays);
  });

  it('is order-independent (same result swapping start/end)', () => {
    const a = countBusinessDays('2026-10-12', '2026-10-18', 'none', true);
    const b = countBusinessDays('2026-10-18', '2026-10-12', 'none', true);
    expect(a).toEqual(b);
  });
});

describe('addBusinessDays', () => {
  it('skips the weekend when adding across it', () => {
    // 2026-10-16 is a Friday.
    expect(addBusinessDays('2026-10-16', 1, 'none')).toBe('2026-10-19'); // Monday
  });

  it('also skips a US federal holiday', () => {
    // 2026-12-24 Thu -> +1 business day skips Christmas (Fri) and the weekend -> Mon 12-28
    expect(addBusinessDays('2026-12-24', 1, 'us')).toBe('2026-12-28');
  });

  it('subtracts business days backward', () => {
    // 2026-10-19 Mon -1 business day -> Friday 2026-10-16
    expect(addBusinessDays('2026-10-19', -1, 'none')).toBe('2026-10-16');
  });

  it('returns the same date for zero', () => {
    expect(addBusinessDays('2026-10-12', 0, 'none')).toBe('2026-10-12');
  });
});

describe('addCalendarDelta', () => {
  it('clamps an overflowing day to the end of the target month', () => {
    expect(addCalendarDelta('2026-01-31', { years: 0, months: 1, weeks: 0, days: 0 }, 1)).toBe('2026-02-28');
  });

  it('lands on Feb 29 across a leap year', () => {
    expect(addCalendarDelta('2027-02-28', { years: 1, months: 0, weeks: 0, days: 0 }, 1)).toBe('2028-02-28');
    expect(addCalendarDelta('2028-02-29', { years: 0, months: 0, weeks: 0, days: 1 }, 1)).toBe('2028-03-01');
  });

  it('subtracts when sign is -1', () => {
    expect(addCalendarDelta('2026-03-01', { years: 0, months: 1, weeks: 0, days: 0 }, -1)).toBe('2026-02-01');
  });

  it('combines years, months, weeks and days in one call', () => {
    expect(addCalendarDelta('2026-01-01', { years: 1, months: 2, weeks: 1, days: 3 }, 1)).toBe('2027-03-11');
  });
});
