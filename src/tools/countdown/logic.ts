/** Pure date-countdown calculations. This module deliberately has no DOM access. */

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export type PresetEvent = 'new-year' | 'valentine' | 'christmas';

export const EVENT_DATES: Record<PresetEvent, { month: number; day: number }> = {
  'new-year': { month: 1, day: 1 },
  valentine: { month: 2, day: 14 },
  christmas: { month: 12, day: 25 },
};

const DATE_PATTERN = /^(\d{4,})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^(\d{2}):(\d{2})$/;

function localDate(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  // Numeric Date constructors interpret years 0–99 as 1900–1999. setFullYear
  // preserves the year users entered, including valid early HTML date values.
  const value = new Date(0);
  value.setHours(hour, minute, 0, 0);
  value.setFullYear(year, month - 1, day);
  return value;
}

function utcDayTimestamp(year: number, month: number, day: number): number {
  const value = new Date(0);
  value.setUTCHours(0, 0, 0, 0);
  value.setUTCFullYear(year, month - 1, day);
  return value.getTime();
}

/** Keeps user-facing event names intact without splitting grapheme clusters. */
export function normalizeEventName(value: string): string {
  const trimmed = value.trim();
  if (typeof Intl.Segmenter === 'function') {
    const segments = new Intl.Segmenter().segment(trimmed);
    return Array.from(segments, ({ segment }) => segment)
      .slice(0, 80)
      .join('');
  }
  return Array.from(trimmed).slice(0, 80).join('');
}

export function isValidDate(date: string): boolean {
  const match = DATE_PATTERN.exec(date);
  if (!match) return false;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const parsed = localDate(year, month, day);
  return (
    Number.isInteger(year) &&
    year >= 1 &&
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

export function isValidTime(time: string): boolean {
  if (time === '') return true;
  const match = TIME_PATTERN.exec(time);
  if (!match) return false;
  const [, hourText, minuteText] = match;
  return Number(hourText) <= 23 && Number(minuteText) <= 59;
}

/**
 * Creates a local-time timestamp explicitly. Date.parse('YYYY-MM-DD') is UTC,
 * which would make a date-only D-day shift for some time zones.
 */
export function toLocalTimestamp(date: string, time = ''): number | null {
  if (!isValidDate(date) || !isValidTime(time)) return null;
  const [, yearText, monthText, dayText] = DATE_PATTERN.exec(date)!;
  const [, hourText = '00', minuteText = '00'] = TIME_PATTERN.exec(time) ?? [];
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const target = localDate(year, month, day, hour, minute);

  // Local Date normalizes a skipped daylight-saving time (for example 02:30
  // during a spring-forward change) to another clock time. Reject an explicit
  // time instead; a date-only target remains the first available local moment.
  if (
    target.getFullYear() !== year ||
    target.getMonth() !== month - 1 ||
    target.getDate() !== day ||
    (time !== '' && (target.getHours() !== hour || target.getMinutes() !== minute))
  )
    return null;
  return target.getTime();
}

export function splitRemaining(targetMs: number, nowMs: number): CountdownParts {
  let seconds = Math.max(0, Math.ceil((targetMs - nowMs) / 1000));
  const days = Math.floor(seconds / 86_400);
  seconds -= days * 86_400;
  const hours = Math.floor(seconds / 3_600);
  seconds -= hours * 3_600;
  const minutes = Math.floor(seconds / 60);
  return { days, hours, minutes, seconds: seconds - minutes * 60 };
}

/** Splits elapsed time after a target without allowing a negative result. */
export function splitElapsed(targetMs: number, nowMs: number): CountdownParts {
  return splitRemaining(nowMs, targetMs);
}

/** Calendar-day difference, immune to a local daylight-saving hour change. */
export function calendarDayDifference(targetDate: string, nowMs: number): number | null {
  if (!isValidDate(targetDate)) return null;
  const [, yearText, monthText, dayText] = DATE_PATTERN.exec(targetDate)!;
  const now = new Date(nowMs);
  const targetDay = utcDayTimestamp(Number(yearText), Number(monthText), Number(dayText));
  const today = utcDayTimestamp(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return Math.round((targetDay - today) / 86_400_000);
}

export function formatDday(dayDifference: number): string {
  if (dayDifference === 0) return 'D-Day';
  return dayDifference > 0 ? `D-${dayDifference}` : `D+${Math.abs(dayDifference)}`;
}

export function todayIso(nowMs: number): string {
  const now = new Date(nowMs);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Returns the next annual occurrence at local midnight, including today before it begins. */
export function nextAnnualDate(event: PresetEvent, nowMs: number): string {
  const now = new Date(nowMs);
  const { month, day } = EVENT_DATES[event];
  let year = now.getFullYear();
  if (localDate(year, month, day).getTime() <= nowMs) year += 1;
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}`;
}
