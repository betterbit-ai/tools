import { describe, expect, it } from 'vitest';
import {
  formatAlarmTime,
  isAlarm,
  isDueBetween,
  isValidAlarmTime,
  nextAlarmAt,
  normalizeAlarmLabel,
  timeFromNow,
} from './logic';

describe('alarm time validation and display', () => {
  it('accepts only complete 24-hour times', () => {
    expect(isValidAlarmTime('00:00')).toBe(true);
    expect(isValidAlarmTime('23:59')).toBe(true);
    expect(isValidAlarmTime('24:00')).toBe(false);
    expect(isValidAlarmTime('7:30')).toBe(false);
    expect(isValidAlarmTime('')).toBe(false);
  });

  it('formats English and Korean alarm times', () => {
    expect(formatAlarmTime('00:05', 'en')).toBe('12:05 AM');
    expect(formatAlarmTime('12:05', 'en')).toBe('12:05 PM');
    expect(formatAlarmTime('19:05', 'ko')).toBe('19:05');
  });
});

describe('alarm schedules', () => {
  it('uses the next local occurrence and rolls an elapsed time into tomorrow', () => {
    const before = new Date(2026, 0, 5, 7, 29, 59).getTime();
    const atTime = new Date(2026, 0, 5, 7, 30, 0).getTime();
    const tomorrow = new Date(2026, 0, 6, 7, 30, 0).getTime();
    expect(nextAlarmAt('07:30', before)).toBe(atTime);
    expect(nextAlarmAt('07:30', atTime)).toBe(tomorrow);
  });

  it('detects a due alarm across a delayed background-tab interval only once', () => {
    const before = new Date(2026, 0, 5, 7, 29, 59).getTime();
    const after = new Date(2026, 0, 5, 7, 35, 0).getTime();
    expect(isDueBetween('07:30', before, after)).toBe(true);
    const atTime = new Date(2026, 0, 5, 7, 30, 0).getTime();
    expect(isDueBetween('07:30', atTime, atTime)).toBe(true);
    expect(isDueBetween('07:30', after, after + 500)).toBe(false);
  });

  it('builds quick times across a day boundary', () => {
    const late = new Date(2026, 0, 5, 23, 58, 0).getTime();
    expect(timeFromNow(late, 5)).toBe('00:03');
    const lateSecond = new Date(2026, 0, 5, 23, 58, 55).getTime();
    expect(timeFromNow(lateSecond, 5)).toBe('00:04');
  });

  it('keeps invalid or huge quick-preset input from producing an invalid time', () => {
    expect(isValidAlarmTime(timeFromNow(Number.NaN, Number.POSITIVE_INFINITY))).toBe(true);
    expect(isValidAlarmTime(timeFromNow(0, Number.MAX_VALUE))).toBe(true);
  });
});

describe('saved alarms and labels', () => {
  it('keeps Unicode labels intact and caps them by Unicode characters', () => {
    expect(normalizeAlarmLabel('  회의 ⏰  ')).toBe('회의 ⏰');
    expect(normalizeAlarmLabel('😀'.repeat(61))).toBe('😀'.repeat(60));
    expect(normalizeAlarmLabel('👨‍👩‍👧‍👦'.repeat(61))).toBe('👨‍👩‍👧‍👦'.repeat(60));
  });

  it('validates persisted alarm shape', () => {
    expect(isAlarm({ id: 'a', time: '09:00', label: '회의', enabled: true })).toBe(true);
    expect(isAlarm({ id: 'a', time: '25:00', label: 'alarm', enabled: true })).toBe(false);
    expect(isAlarm({ id: '', time: '09:00', label: 'alarm', enabled: true })).toBe(false);
    expect(isAlarm({ id: 'a', time: '09:00', label: 'x'.repeat(61), enabled: true })).toBe(false);
  });
});
