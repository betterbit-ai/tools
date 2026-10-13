/**
 * Pure pregnancy-calculator logic. Dates are plain calendar dates, never parsed
 * as ISO instants, so a visitor's result cannot move by one day across time zones.
 */

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

export type DatingMethod = 'lmp' | 'conception' | 'ivf';
export type EmbryoAge = 3 | 5;

export interface PregnancyInput {
  method: DatingMethod;
  date: string;
  cycleLength?: number | string;
  embryoAge?: EmbryoAge;
  /** A supplied local calendar date makes the calculation deterministic and testable. */
  asOf: string;
}

export interface GestationalAge {
  days: number;
  weeks: number;
  remainingDays: number;
  /** Week numbers follow clinical dating: day 0 is 0 weeks 0 days and falls in week 1. */
  currentWeek: number;
  trimester: 1 | 2 | 3;
}

export interface PregnancyResult {
  dueDate: string;
  gestationalStartDate: string;
  estimatedConceptionDate: string;
  gestationalAge: GestationalAge | null;
  daysUntilDue: number;
  milestones: {
    firstTrimesterEnds: string;
    secondTrimesterStarts: string;
    thirdTrimesterStarts: string;
    earlyTermStarts: string;
    fullTermStarts: string;
    dueDate: string;
  };
}

/** Converts pasted full-width numbers and hyphens to an ISO calendar-date shape. */
export function normalizeDateInput(value: string): string {
  return value.normalize('NFKC').trim();
}

export function isValidDate(value: string): boolean {
  const match = DATE_PATTERN.exec(normalizeDateInput(value));
  if (!match) return false;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    year >= 1900 &&
    year <= 2100 &&
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function toEpochDay(date: string): number {
  const [, year, month, day] = DATE_PATTERN.exec(date)!;
  return Date.UTC(Number(year), Number(month) - 1, Number(day)) / MS_PER_DAY;
}

function fromEpochDay(epochDay: number): string {
  const date = new Date(epochDay * MS_PER_DAY);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function addDays(date: string, days: number): string {
  return fromEpochDay(toEpochDay(date) + days);
}

export function daysBetween(start: string, end: string): number {
  return toEpochDay(end) - toEpochDay(start);
}

export function todayIso(nowMs: number): string {
  const now = new Date(nowMs);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function parseCycleLength(value: number | string | undefined): number | null {
  if (typeof value === 'number') return Number.isInteger(value) && value >= 20 && value <= 45 ? value : null;
  if (typeof value !== 'string') return 28;
  const normalized = value.normalize('NFKC').trim();
  if (!/^\d{1,2}$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return parsed >= 20 && parsed <= 45 ? parsed : null;
}

/**
 * Estimates a due date using the convention of 280 days (40 weeks) from LMP,
 * 266 days from conception, or 263/261 days from day-3/day-5 IVF transfer.
 * This is planning information, not a substitute for clinician-established dating.
 */
export function calculatePregnancy(input: PregnancyInput): PregnancyResult | null {
  const date = normalizeDateInput(input.date);
  const asOf = normalizeDateInput(input.asOf);
  if (!isValidDate(date) || !isValidDate(asOf)) return null;

  let dueDate: string;
  let gestationalStartDate: string;
  let estimatedConceptionDate: string;

  if (input.method === 'lmp') {
    const cycleLength = parseCycleLength(input.cycleLength);
    if (cycleLength === null) return null;
    // When cycle length adjusts the EDD, the whole gestational timeline moves by
    // the same offset so 40 weeks still lands on that adjusted EDD.
    gestationalStartDate = addDays(date, cycleLength - 28);
    estimatedConceptionDate = addDays(date, cycleLength - 14);
    dueDate = addDays(date, 280 + (cycleLength - 28));
  } else if (input.method === 'conception') {
    estimatedConceptionDate = date;
    dueDate = addDays(date, 266);
    gestationalStartDate = addDays(dueDate, -280);
  } else {
    const embryoAge = input.embryoAge ?? 5;
    if (embryoAge !== 3 && embryoAge !== 5) return null;
    estimatedConceptionDate = addDays(date, -embryoAge);
    dueDate = addDays(date, embryoAge === 3 ? 263 : 261);
    gestationalStartDate = addDays(dueDate, -280);
  }

  const daysGestation = daysBetween(gestationalStartDate, asOf);
  const gestationalAge = daysGestation < 0 ? null : gestationalAgeForDays(daysGestation);

  return {
    dueDate,
    gestationalStartDate,
    estimatedConceptionDate,
    gestationalAge,
    daysUntilDue: daysBetween(asOf, dueDate),
    milestones: {
      firstTrimesterEnds: addDays(gestationalStartDate, 97), // 13 weeks 6 days
      secondTrimesterStarts: addDays(gestationalStartDate, 98), // 14 weeks 0 days
      thirdTrimesterStarts: addDays(gestationalStartDate, 196), // 28 weeks 0 days
      earlyTermStarts: addDays(gestationalStartDate, 259), // 37 weeks 0 days
      fullTermStarts: addDays(gestationalStartDate, 273), // 39 weeks 0 days
      dueDate,
    },
  };
}

export function gestationalAgeForDays(days: number): GestationalAge {
  const weeks = Math.floor(days / 7);
  return {
    days,
    weeks,
    remainingDays: days % 7,
    currentWeek: weeks + 1,
    trimester: days < 98 ? 1 : days < 196 ? 2 : 3,
  };
}
