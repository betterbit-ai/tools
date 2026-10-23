/**
 * Pure age-calculator logic — no DOM, no Preact. Everything here is testable.
 *
 * Dates are plain `YYYY-MM-DD` strings interpreted as local calendar days
 * (never `Date.parse`, which shifts by a day for negative-UTC-offset time zones).
 */

const DATE_PATTERN = /^(\d{4,})-(\d{2})-(\d{2})$/;

/** Change this one value when refreshing every birth-year landing page for a new calendar year. */
export const BIRTH_YEAR_REFERENCE_YEAR = 2026;

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function isValidDate(date: string): boolean {
  const match = DATE_PATTERN.exec(date);
  if (!match) return false;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  return (
    Number.isSafeInteger(year) && year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month)
  );
}

function parts(date: string): [number, number, number] {
  const [, y, m, d] = DATE_PATTERN.exec(date)!;
  return [Number(y), Number(m), Number(d)];
}

/**
 * Days since 0001-01-01 in the proleptic Gregorian calendar.
 *
 * This deliberately avoids `Date` and `Date.UTC`: their numeric constructors map
 * years 0–99 to 1900–1999, which rejects or miscalculates dates such as 0001-01-01.
 */
function toEpochDay(date: string): number {
  const [y, m, d] = parts(date);
  const priorYear = y - 1;
  const daysBeforeYear =
    priorYear * 365 + Math.floor(priorYear / 4) - Math.floor(priorYear / 100) + Math.floor(priorYear / 400);
  const daysBeforeMonth = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334][m - 1];
  return daysBeforeYear + daysBeforeMonth + (m > 2 && isLeapYear(y) ? 1 : 0) + d - 1;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function padYear(year: number): string {
  return String(year).padStart(4, '0');
}

export function todayIso(nowMs: number): string {
  const now = new Date(nowMs);
  return `${padYear(now.getFullYear())}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;
}

export function weekdayIndex(date: string): number {
  // 0001-01-01 was a Monday; JavaScript's Sunday-first convention is 0–6.
  return (toEpochDay(date) + 1) % 7;
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
  return `${padYear(year)}-${pad2(month + 1)}-${pad2(clampedDay)}`;
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

export interface BirthYearAgeRange {
  beforeBirthday: number;
  fromBirthday: number;
  yearAge: number;
}

/** The possible 만 나이 values and fixed 연 나이 for a birth year during one calendar year. */
export function birthYearAgeRange(birthYear: number, referenceYear: number): BirthYearAgeRange {
  const fromBirthday = referenceYear - birthYear;
  return {
    beforeBirthday: fromBirthday - 1,
    fromBirthday,
    yearAge: koreanYearAge(birthYear, referenceYear),
  };
}

export type KoreanSchoolLevel = 'elementary' | 'middle' | 'high';

export interface KoreanSchoolGrade {
  level: KoreanSchoolLevel;
  grade: number;
}

/**
 * Normal Korean grade progression for a school year, excluding early/delayed entry and retention.
 * Under 초·중등교육법 제13조, a child ordinarily enters elementary school on March 1 after the
 * calendar year in which they turn six; 제39·42·46조 set the 6/3/3-year school durations.
 */
export function koreanSchoolGrade(birthYear: number, schoolYear: number): KoreanSchoolGrade | null {
  const yearInSchool = schoolYear - birthYear - 6;
  if (yearInSchool >= 1 && yearInSchool <= 6) return { level: 'elementary', grade: yearInSchool };
  if (yearInSchool >= 7 && yearInSchool <= 9) return { level: 'middle', grade: yearInSchool - 6 };
  if (yearInSchool >= 10 && yearInSchool <= 12) return { level: 'high', grade: yearInSchool - 9 };
  return null;
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
  return `${padYear(year)}-${pad2(month)}-${pad2(clampedDay)}`;
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
