/** Pure local-time alarm calculations. This module deliberately has no DOM access. */

export const MAX_ALARMS = 12;
export const MAX_LABEL_LENGTH = 60;

export interface Alarm {
  id: string;
  /** 24-hour local time in HH:MM form. */
  time: string;
  label: string;
  enabled: boolean;
}

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const MAX_DATE_MS = 8_640_000_000_000_000;
const MAX_QUICK_MINUTES = 100 * 366 * 24 * 60;

function graphemes(value: string): string[] {
  if (typeof Intl.Segmenter === 'function') {
    return Array.from(
      new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value),
      ({ segment }) => segment,
    );
  }
  return Array.from(value);
}

export function isValidAlarmTime(value: string): boolean {
  return TIME_PATTERN.test(value);
}

/** Keeps grapheme clusters (including combined emoji and Hangul) whole while limiting a label. */
export function normalizeAlarmLabel(value: string): string {
  return graphemes(value.trim()).slice(0, MAX_LABEL_LENGTH).join('');
}

export function isAlarm(value: unknown): value is Alarm {
  if (!value || typeof value !== 'object') return false;
  const alarm = value as Alarm;
  return (
    typeof alarm.id === 'string' &&
    alarm.id.length > 0 &&
    typeof alarm.label === 'string' &&
    graphemes(alarm.label).length <= MAX_LABEL_LENGTH &&
    typeof alarm.enabled === 'boolean' &&
    isValidAlarmTime(alarm.time)
  );
}

/** Returns the next local occurrence strictly after `afterMs`. */
export function nextAlarmAt(time: string, afterMs: number): number | null {
  if (!isValidAlarmTime(time) || !Number.isFinite(afterMs)) return null;
  const [hours, minutes] = time.split(':').map(Number);
  const after = new Date(afterMs);
  const target = new Date(after);
  target.setHours(hours, minutes, 0, 0);
  if (target.getTime() <= afterMs) target.setDate(target.getDate() + 1);
  return target.getTime();
}

/**
 * Checks an interval instead of relying on a one-second counter. A throttled
 * background tab therefore still detects an alarm once it receives CPU time.
 */
export function isDueBetween(time: string, lastCheckMs: number, nowMs: number): boolean {
  if (!Number.isFinite(lastCheckMs) || !Number.isFinite(nowMs) || nowMs < lastCheckMs) return false;
  // Include an alarm exactly at the previous check, then move the check point
  // forward so it cannot fire again on the following tick.
  const next = nextAlarmAt(time, lastCheckMs - 1);
  return next !== null && next <= nowMs;
}

export function timeFromNow(nowMs: number, minutesFromNow: number): string {
  const safeNow = Number.isFinite(nowMs) ? Math.min(MAX_DATE_MS, Math.max(-MAX_DATE_MS, nowMs)) : 0;
  const safeMinutes = Number.isFinite(minutesFromNow)
    ? Math.min(MAX_QUICK_MINUTES, Math.max(0, Math.round(minutesFromNow)))
    : 0;
  const target = Math.min(MAX_DATE_MS, safeNow + safeMinutes * 60_000);
  // Alarm controls have minute precision. Round up so “in 5 min” never starts
  // almost a minute early when the current second is non-zero.
  const date = new Date(Math.ceil(target / 60_000) * 60_000);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatAlarmTime(time: string, locale: 'en' | 'ko'): string {
  if (!isValidAlarmTime(time)) return time;
  const [hour, minute] = time.split(':').map(Number);
  if (locale === 'ko') return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const suffix = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`;
}
