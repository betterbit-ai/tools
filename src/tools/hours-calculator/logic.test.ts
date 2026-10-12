import { describe, expect, it } from 'vitest';
import { calculateShift, calculateWeek, formatDecimalHours, formatMinutes, parseTime } from './logic';

describe('parseTime', () => {
  it('parses strict 24-hour input at both daily boundaries', () => {
    expect(parseTime('00:00')).toBe(0);
    expect(parseTime('23:59')).toBe(1439);
  });

  it('rejects blank, malformed, out-of-range, and Unicode lookalike values', () => {
    expect(parseTime('')).toBeNull();
    expect(parseTime('9:00')).toBeNull();
    expect(parseTime('24:00')).toBeNull();
    expect(parseTime('09:60')).toBeNull();
    expect(parseTime('９:００')).toBeNull();
    expect(parseTime('09:00🕘')).toBeNull();
  });
});

describe('calculateShift', () => {
  it('subtracts an unpaid break from a same-day shift', () => {
    expect(calculateShift({ start: '09:00', end: '18:00', breakMinutes: 60 })).toEqual({
      grossMinutes: 540,
      breakMinutes: 60,
      netMinutes: 480,
      overnight: false,
    });
  });

  it('handles overnight shifts automatically', () => {
    expect(calculateShift({ start: '22:00', end: '06:00', breakMinutes: 30 })).toEqual({
      grossMinutes: 480,
      breakMinutes: 30,
      netMinutes: 450,
      overnight: true,
    });
  });

  it('treats equal times as zero and rejects impossible breaks', () => {
    expect(calculateShift({ start: '12:00', end: '12:00', breakMinutes: 0 })).toMatchObject({ netMinutes: 0 });
    expect(calculateShift({ start: '09:00', end: '10:00', breakMinutes: 61 })).toBeNull();
    expect(calculateShift({ start: '09:00', end: '10:00', breakMinutes: -1 })).toBeNull();
    expect(calculateShift({ start: '09:00', end: '10:00', breakMinutes: 0.5 })).toBeNull();
  });
});

describe('calculateWeek', () => {
  it('totals daily results before converting to decimal hours', () => {
    const week = calculateWeek([
      { start: '09:00', end: '18:00', breakMinutes: 60 },
      { start: '22:00', end: '06:00', breakMinutes: 30 },
      { start: '', end: '', breakMinutes: 0 },
    ]);
    expect(week).toEqual({ grossMinutes: 1020, breakMinutes: 90, netMinutes: 930, workedDays: 2, invalidDays: 0 });
    expect(formatDecimalHours(week.netMinutes)).toBe('15.50');
  });

  it('keeps invalid or partially entered rows out of totals', () => {
    expect(calculateWeek([{ start: '09:00', end: '', breakMinutes: 0 }])).toMatchObject({
      netMinutes: 0,
      workedDays: 0,
      invalidDays: 1,
    });
  });
});

describe('formatters', () => {
  it('formats boundaries and non-finite values safely', () => {
    expect(formatMinutes(0)).toBe('0h 00m');
    expect(formatMinutes(1505)).toBe('25h 05m');
    expect(formatMinutes(Number.NaN)).toBe('0h 00m');
    expect(formatDecimalHours(465)).toBe('7.75');
  });
});
