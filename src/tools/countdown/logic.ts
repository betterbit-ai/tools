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

/** Keeps user-facing event names intact without splitting emoji or Hangul. */
export function normalizeEventName(value: string): string {
  return Array.from(value.trim()).slice(0, 80).join('');
}

export function isValidDate(date: string): boolean {
  const match = DATE_PATTERN.exec(date);
  if (!match) return false;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const parsed = new Date(year, month - 1, day);
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
  return new Date(
    Number(yearText),
    Number(monthText) - 1,
    Number(dayText),
    Number(hourText),
    Number(minuteText),
    0,
    0,
  ).getTime();
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

/** Calendar-day difference, immune to a local daylight-saving hour change. */
export function calendarDayDifference(targetDate: string, nowMs: number): number | null {
  if (!isValidDate(targetDate)) return null;
  const [, yearText, monthText, dayText] = DATE_PATTERN.exec(targetDate)!;
  const now = new Date(nowMs);
  const targetDay = Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText));
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
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
  if (new Date(year, month - 1, day).getTime() < nowMs) year += 1;
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}`;
}
