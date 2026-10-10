/**
 * Pure date-calculator logic — no DOM, no Preact. Everything here is testable.
 *
 * All dates are plain `YYYY-MM-DD` strings interpreted as local calendar days
 * (never as UTC `Date.parse`, which shifts by a day for negative-UTC-offset time zones).
 */

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidDate(date: string): boolean {
  const match = DATE_PATTERN.exec(date);
  if (!match) return false;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const parsed = new Date(year, month - 1, day);
  return year >= 1 && parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
}

/** Days since a fixed epoch, computed in UTC so DST transitions never shift the count. */
function toEpochDay(date: string): number {
  const [, yearText, monthText, dayText] = DATE_PATTERN.exec(date)!;
  return Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText)) / 86_400_000;
}

function fromEpochDay(epochDay: number): string {
  const d = new Date(epochDay * 86_400_000);
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function todayIso(nowMs: number): string {
  const now = new Date(nowMs);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function weekdayIndex(date: string): number {
  return new Date(toEpochDay(date) * 86_400_000).getUTCDay();
}

/** Exact signed day count from `start` to `end` (end - start). Not calendar-aware (no Y/M/D breakdown). */
export function daysBetween(start: string, end: string): number {
  return toEpochDay(end) - toEpochDay(start);
}

export interface CalendarSpan {
  years: number;
  months: number;
  days: number;
}

/**
 * Calendar-aware Y/M/D span from the earlier date to the later date (always non-negative).
 * Borrows from months/years the way people count age or duration, so e.g. Jan 31 -> Mar 1 is
 * 1 month 1 day, not "1 month 29 days".
 */
export function calendarSpan(a: string, b: string): CalendarSpan {
  const [start, end] = toEpochDay(a) <= toEpochDay(b) ? [a, b] : [b, a];
  const [sy, sm] = DATE_PATTERN.exec(start)!.slice(1).map(Number);
  const [ey, em] = DATE_PATTERN.exec(end)!.slice(1).map(Number);

  // Walk whole months forward from `start`; back off one if that overshoots `end`
  // (e.g. Jan 31 -> Mar 1 is 1 month 1 day, not 2 months minus a fraction).
  let totalMonths = (ey - sy) * 12 + (em - sm);
  let anchor = addMonthsClamped(start, totalMonths);
  if (toEpochDay(anchor) > toEpochDay(end)) {
    totalMonths -= 1;
    anchor = addMonthsClamped(start, totalMonths);
  }
  const days = toEpochDay(end) - toEpochDay(anchor);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return { years, months, days };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Adds whole months to `date`, clamping an overflowing day to the end of the target month. */
function addMonthsClamped(date: string, months: number): string {
  const [year0, month0, day] = DATE_PATTERN.exec(date)!.slice(1).map(Number);
  let month = month0 - 1 + months;
  let year = year0 + Math.floor(month / 12);
  month = ((month % 12) + 12) % 12;
  const clampedDay = Math.min(day, daysInMonth(year, month + 1));
  return `${year}-${pad2(month + 1)}-${pad2(clampedDay)}`;
}

export type HolidayCountry = 'none' | 'us' | 'kr';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** nth weekday (0=Sunday..6=Saturday) of a month, e.g. 3rd Monday of January. */
function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): string {
  const first = new Date(year, month - 1, 1);
  const firstWeekday = first.getDay();
  const day = 1 + ((weekday - firstWeekday + 7) % 7) + (n - 1) * 7;
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** Last weekday (0=Sunday..6=Saturday) of a month, e.g. last Monday of May. */
function lastWeekdayOfMonth(year: number, month: number, weekday: number): string {
  const lastDay = daysInMonth(year, month);
  const last = new Date(year, month - 1, lastDay);
  const lastWeekday = last.getDay();
  const day = lastDay - ((lastWeekday - weekday + 7) % 7);
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** US federal "in lieu" rule: Saturday observed the Friday before, Sunday observed the Monday after. */
function observedFixedDate(year: number, month: number, day: number): string {
  const d = new Date(year, month - 1, day);
  const weekday = d.getDay();
  if (weekday === 6) d.setDate(d.getDate() - 1);
  else if (weekday === 0) d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** US federal holidays, computed from the official rules (fixed dates + "in lieu" weekend shift). */
function usFederalHolidays(year: number): string[] {
  return [
    observedFixedDate(year, 1, 1), // New Year's Day
    nthWeekdayOfMonth(year, 1, 1, 3), // Birthday of Martin Luther King, Jr.
    nthWeekdayOfMonth(year, 2, 1, 3), // Washington's Birthday
    lastWeekdayOfMonth(year, 5, 1), // Memorial Day
    observedFixedDate(year, 6, 19), // Juneteenth
    observedFixedDate(year, 7, 4), // Independence Day
    nthWeekdayOfMonth(year, 9, 1, 1), // Labor Day
    nthWeekdayOfMonth(year, 10, 1, 2), // Columbus Day
    observedFixedDate(year, 11, 11), // Veterans Day
    nthWeekdayOfMonth(year, 11, 4, 4), // Thanksgiving Day
    observedFixedDate(year, 12, 25), // Christmas Day
  ];
}

/**
 * South Korean public holidays (관공서 공휴일), including substitute holidays (대체공휴일)
 * and one-off election-day holidays. Seollal/Chuseok follow the lunar calendar and 대체공휴일
 * decisions are set year by year, so this is a verified table rather than a formula.
 * Covers 2024–2026; see docs/CATALOG.md note for extending it.
 */
const KR_HOLIDAYS: Record<number, string[]> = {
  2024: [
    '2024-01-01',
    '2024-02-09',
    '2024-02-10',
    '2024-02-11',
    '2024-02-12',
    '2024-03-01',
    '2024-04-10',
    '2024-05-05',
    '2024-05-06',
    '2024-05-15',
    '2024-06-06',
    '2024-08-15',
    '2024-09-16',
    '2024-09-17',
    '2024-09-18',
    '2024-10-03',
    '2024-10-09',
    '2024-12-25',
  ],
  2025: [
    '2025-01-01',
    '2025-01-27',
    '2025-01-28',
    '2025-01-29',
    '2025-01-30',
    '2025-03-01',
    '2025-03-03',
    '2025-05-05',
    '2025-05-06',
    '2025-06-03',
    '2025-06-06',
    '2025-08-15',
    '2025-10-03',
    '2025-10-05',
    '2025-10-06',
    '2025-10-07',
    '2025-10-08',
    '2025-10-09',
    '2025-12-25',
  ],
  2026: [
    '2026-01-01',
    '2026-02-16',
    '2026-02-17',
    '2026-02-18',
    '2026-03-02',
    '2026-05-05',
    '2026-05-25',
    '2026-06-03',
    '2026-06-06',
    '2026-07-17',
    '2026-08-15',
    '2026-08-17',
    '2026-09-24',
    '2026-09-25',
    '2026-09-26',
    '2026-10-05',
    '2026-10-09',
    '2026-12-25',
  ],
};

export function holidaysInYear(year: number, country: HolidayCountry): Set<string> {
  if (country === 'us') return new Set(usFederalHolidays(year));
  if (country === 'kr') return new Set(KR_HOLIDAYS[year] ?? []);
  return new Set();
}

export function isHolidayCountrySupportedForYear(year: number, country: HolidayCountry): boolean {
  return country !== 'kr' || year in KR_HOLIDAYS;
}

function holidaySetForRange(startYear: number, endYear: number, country: HolidayCountry): Set<string> {
  const set = new Set<string>();
  if (country === 'none') return set;
  for (let y = startYear; y <= endYear; y++) for (const d of holidaysInYear(y, country)) set.add(d);
  return set;
}

export function isBusinessDay(date: string, country: HolidayCountry, holidays: Set<string>): boolean {
  const weekday = weekdayIndex(date);
  if (weekday === 0 || weekday === 6) return false;
  return country === 'none' || !holidays.has(date);
}

export interface BusinessDayCount {
  businessDays: number;
  weekendDays: number;
  holidayDays: number;
}

/**
 * Counts business days in the range, inclusive of both endpoints when `inclusive` is true,
 * otherwise inclusive of `end` only (matches the plain calendar-day difference convention).
 */
export function countBusinessDays(
  start: string,
  end: string,
  country: HolidayCountry,
  inclusive: boolean,
): BusinessDayCount {
  const [from, to] = toEpochDay(start) <= toEpochDay(end) ? [start, end] : [end, start];
  const fromEpoch = toEpochDay(from) + (inclusive ? 0 : 1);
  const toEpochValue = toEpochDay(to);
  const startYear = Number(from.slice(0, 4));
  const endYear = Number(to.slice(0, 4));
  const holidays = holidaySetForRange(startYear, endYear, country);

  let businessDays = 0;
  let weekendDays = 0;
  let holidayDays = 0;
  for (let e = fromEpoch; e <= toEpochValue; e++) {
    const day = fromEpochDay(e);
    const weekday = weekdayIndex(day);
    if (weekday === 0 || weekday === 6) {
      weekendDays++;
      continue;
    }
    if (country !== 'none' && holidays.has(day)) {
      holidayDays++;
      continue;
    }
    businessDays++;
  }
  return { businessDays, weekendDays, holidayDays };
}

/** Adds (or subtracts, for a negative count) `amount` business days to `date`, skipping weekends/holidays. */
export function addBusinessDays(date: string, amount: number, country: HolidayCountry): string {
  const step = amount >= 0 ? 1 : -1;
  let remaining = Math.abs(Math.round(amount));
  let epoch = toEpochDay(date);
  let rangeStart = Number(date.slice(0, 4)) - 1;
  let rangeEnd = Number(date.slice(0, 4)) + 1;
  let holidays = holidaySetForRange(rangeStart, rangeEnd, country);
  while (remaining > 0) {
    epoch += step;
    const day = fromEpochDay(epoch);
    const year = Number(day.slice(0, 4));
    if (year < rangeStart || year > rangeEnd) {
      rangeStart = year - 1;
      rangeEnd = year + 1;
      holidays = holidaySetForRange(rangeStart, rangeEnd, country);
    }
    if (isBusinessDay(day, country, holidays)) remaining--;
  }
  return fromEpochDay(epoch);
}

export interface CalendarDelta {
  years: number;
  months: number;
  weeks: number;
  days: number;
}

/** Adds a calendar delta to `date`. Clamps an overflowing day (e.g. Jan 31 + 1 month) to the last day of that month. */
export function addCalendarDelta(date: string, delta: CalendarDelta, sign: 1 | -1): string {
  const totalMonths = sign * (delta.years * 12 + delta.months);
  const totalDays = sign * (delta.weeks * 7 + delta.days);
  const withMonths = addMonthsClamped(date, totalMonths);
  return fromEpochDay(toEpochDay(withMonths) + totalDays);
}
