/**
 * Pure age-calculator logic — no DOM, no Preact. Everything here is testable.
 *
 * Dates are plain `YYYY-MM-DD` strings interpreted as local calendar days
 * (never `Date.parse`, which shifts by a day for negative-UTC-offset time zones).
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

function parts(date: string): [number, number, number] {
  const [, y, m, d] = DATE_PATTERN.exec(date)!;
  return [Number(y), Number(m), Number(d)];
}

/** Days since a fixed epoch, computed in UTC so DST transitions never shift the count. */
function toEpochDay(date: string): number {
  const [y, m, d] = parts(date);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function todayIso(nowMs: number): string {
  const now = new Date(nowMs);
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function weekdayIndex(date: string): number {
  return new Date(toEpochDay(date) * 86_400_000).getUTCDay();
}

/** Exact signed day count from `start` to `end` (end - start). */
export function daysBetween(start: string, end: string): number {
  return toEpochDay(end) - toEpochDay(start);
}

/** Days alive counting the birth date itself as day 1 (the Korean 백일/돌 convention). */
export function daysLived(birth: string, reference: string): number {
  return daysBetween(birth, reference) + 1;
}

export interface AgeBreakdown {
  years: number;
  months: number;
  days: number;
}

/**
 * Calendar-aware years/months/days from `birth` to `reference` (the "만 나이" breakdown).
 * Walks whole months forward from `birth`, borrowing like people count age, so e.g.
 * a Jan 31 birth measured on Mar 1 is 0y 1m 1d, not "0y 0m 29d".
 */
export function ageBreakdown(birth: string, reference: string): AgeBreakdown {
  const [by, bm] = parts(birth);
  const [ry, rm] = parts(reference);

  let totalMonths = (ry - by) * 12 + (rm - bm);
  let anchor = addMonthsClamped(birth, totalMonths);
  if (toEpochDay(anchor) > toEpochDay(reference)) {
    totalMonths -= 1;
    anchor = addMonthsClamped(birth, totalMonths);
  }
  const days = toEpochDay(reference) - toEpochDay(anchor);
  return { years: Math.floor(totalMonths / 12), months: totalMonths % 12, days };
}

/** Adds whole months to `date`, clamping an overflowing day to the end of the target month. */
function addMonthsClamped(date: string, months: number): string {
  const [year0, month0, day] = parts(date);
  let month = month0 - 1 + months;
  let year = year0 + Math.floor(month / 12);
  month = ((month % 12) + 12) % 12;
  const clampedDay = Math.min(day, daysInMonth(year, month + 1));
  return `${year}-${pad2(month + 1)}-${pad2(clampedDay)}`;
}

/** 만 나이: international/legal age in whole years as of `reference` (Korea's 2023 "만 나이 통일법"). */
export function internationalAge(birth: string, reference: string): number {
  return ageBreakdown(birth, reference).years;
}

/** 세는 나이: birth year counts as age 1, +1 on every January 1st (not on the birthday). */
export function koreanCountingAge(birthYear: number, referenceYear: number): number {
  return referenceYear - birthYear + 1;
}

/** 연 나이: used by 병역법/청소년보호법 — current year minus birth year, changes every January 1st. */
export function koreanYearAge(birthYear: number, referenceYear: number): number {
  return referenceYear - birthYear;
}

/**
 * Next birthday on or after `reference`. A Feb 29 birth observes Feb 28 in a non-leap
 * year (addMonthsClamped's standard overflow rule), matching common calendar-app behavior.
 */
export function nextBirthday(birth: string, reference: string): { date: string; daysUntil: number } {
  const [, bm, bd] = parts(birth);
  const [ry] = parts(reference);
  const candidateThisYear = clampedBirthdayInYear(ry, bm, bd);
  const date =
    toEpochDay(candidateThisYear) >= toEpochDay(reference) ? candidateThisYear : clampedBirthdayInYear(ry + 1, bm, bd);
  return { date, daysUntil: daysBetween(reference, date) };
}

function clampedBirthdayInYear(year: number, month: number, day: number): string {
  const clampedDay = Math.min(day, daysInMonth(year, month));
  return `${year}-${pad2(month)}-${pad2(clampedDay)}`;
}

export const ZODIAC_ANIMALS = [
  'rat',
  'ox',
  'tiger',
  'rabbit',
  'dragon',
  'snake',
  'horse',
  'goat',
  'monkey',
  'rooster',
  'dog',
  'pig',
] as const;
export type ZodiacAnimal = (typeof ZODIAC_ANIMALS)[number];

/**
 * Chinese zodiac animal for a birth year, by the plain solar calendar year (2020 = Rat, a
 * verified anchor: 2024 = Dragon, 2025 = Snake, 2026 = Horse). This is the common everyday
 * convention; it does not shift for births before Lunar New Year or 입춘 — see the FAQ note.
 */
export function zodiacAnimal(birthYear: number): ZodiacAnimal {
  const index = (((birthYear - 2020) % 12) + 12) % 12;
  return ZODIAC_ANIMALS[index];
}

/** True for births in the Jan 1 – Feb 5 window where the plain-calendar zodiac year may be off by one. */
export function isZodiacBoundaryBirth(month: number, day: number): boolean {
  return month === 1 || (month === 2 && day <= 5);
}

/** English ordinal suffix (1st, 2nd, 3rd, 4th, 11th, 21st, ...). Not used for Korean, which has no ordinal suffix. */
export function ordinalSuffix(n: number): string {
  const abs = Math.abs(Math.trunc(n));
  const rem100 = abs % 100;
  if (rem100 >= 11 && rem100 <= 13) return 'th';
  switch (abs % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export const STAR_SIGNS = [
  'capricorn',
  'aquarius',
  'pisces',
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
] as const;
export type StarSign = (typeof STAR_SIGNS)[number];

/** Western (tropical) star sign from birth month/day, using the standard date-range boundaries. */
export function starSign(month: number, day: number): StarSign {
  const ranges: { sign: StarSign; from: [number, number]; to: [number, number] }[] = [
    { sign: 'aquarius', from: [1, 20], to: [2, 18] },
    { sign: 'pisces', from: [2, 19], to: [3, 20] },
    { sign: 'aries', from: [3, 21], to: [4, 19] },
    { sign: 'taurus', from: [4, 20], to: [5, 20] },
    { sign: 'gemini', from: [5, 21], to: [6, 20] },
    { sign: 'cancer', from: [6, 21], to: [7, 22] },
    { sign: 'leo', from: [7, 23], to: [8, 22] },
    { sign: 'virgo', from: [8, 23], to: [9, 22] },
    { sign: 'libra', from: [9, 23], to: [10, 22] },
    { sign: 'scorpio', from: [10, 23], to: [11, 21] },
    { sign: 'sagittarius', from: [11, 22], to: [12, 21] },
    { sign: 'capricorn', from: [12, 22], to: [1, 19] },
  ];
  for (const r of ranges) {
    const [fm, fd] = r.from;
    const [tm, td] = r.to;
    if (fm <= tm) {
      if ((month === fm && day >= fd) || (month === tm && day <= td) || (month > fm && month < tm)) return r.sign;
    } else {
      // Capricorn wraps across the new year (Dec 22 – Jan 19).
      if ((month === fm && day >= fd) || (month === tm && day <= td)) return r.sign;
    }
  }
  return 'capricorn';
}
