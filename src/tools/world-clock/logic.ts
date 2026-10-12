/** Pure helpers for live city clocks and working-hours overlap. */

import type { Locale } from '../../i18n/locales';
import { formatDateInput, resolveLocalTime, zonedParts } from '../time-zone-converter/logic';

export const DEFAULT_ZONES = ['Asia/Seoul', 'America/New_York', 'Europe/London', 'Australia/Sydney'] as const;

export interface ClockParts {
  date: string;
  time: string;
  weekday: string;
  offsetMinutes: number;
}

export interface OverlapHour {
  hour: number;
  available: number;
  total: number;
}

function formatter(locale: Locale, timeZone: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale, { timeZone, ...options });
}

/** Local date, time, weekday, and UTC offset for one instant. */
export function clockParts(instant: number, timeZone: string, locale: Locale, hourCycle: '12' | '24'): ClockParts {
  const date = formatter(locale, timeZone, { dateStyle: 'medium' }).format(new Date(instant));
  const time = formatter(locale, timeZone, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: hourCycle === '24' ? 'h23' : 'h12',
  }).format(new Date(instant));
  const weekday = formatter(locale, timeZone, { weekday: 'long' }).format(new Date(instant));
  const parts = zonedParts(instant, timeZone);
  const wallAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return { date, time, weekday, offsetMinutes: Math.round((wallAsUtc - instant) / 60_000) };
}

/** A local work day includes its start but not its end: 09:00 is in, 17:00 is out. */
export function isWorkingHour(instant: number, timeZone: string, start = 9, end = 17): boolean {
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end > 24 || start >= end) return false;
  const { hour } = zonedParts(instant, timeZone);
  return hour >= start && hour < end;
}

/** Uses the reference zone's date to assess the 24 possible meeting start hours. */
export function overlapHours(
  date: string,
  referenceZone: string,
  zones: readonly string[],
  start = 9,
  end = 17,
): OverlapHour[] {
  if (!zones.length || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  return Array.from({ length: 24 }, (_, hour) => {
    const resolved = resolveLocalTime(date, `${String(hour).padStart(2, '0')}:00`, referenceZone);
    const available =
      resolved.instant === undefined
        ? 0
        : zones.filter((zone) => isWorkingHour(resolved.instant!, zone, start, end)).length;
    return { hour, available, total: zones.length };
  });
}

/** Consecutive source-zone hours where every selected city is inside the given workday. */
export function fullOverlapRanges(hours: readonly OverlapHour[]): { start: number; end: number }[] {
  const ranges: { start: number; end: number }[] = [];
  let start: number | undefined;
  for (const entry of hours) {
    if (entry.available === entry.total && entry.total > 0) start ??= entry.hour;
    else if (start !== undefined) {
      ranges.push({ start, end: entry.hour });
      start = undefined;
    }
  }
  if (start !== undefined) ranges.push({ start, end: 24 });
  return ranges;
}

export function formatHour(hour: number, hourCycle: '12' | '24', locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    hour: 'numeric',
    hourCycle: hourCycle === '24' ? 'h23' : 'h12',
  }).format(new Date(Date.UTC(2026, 0, 1, hour)));
}

export function currentDateInZone(instant: number, timeZone: string): string {
  return formatDateInput(zonedParts(instant, timeZone));
}
