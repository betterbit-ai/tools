/** Pure Korean statutory severance-pay calculations. This module has no DOM or Preact dependencies. */

/** A guardrail for a browser calculator, not a statutory maximum. */
export const MAX_AMOUNT = 1_000_000_000_000_000;
export const MAX_WEEKLY_HOURS = 168;

export interface SeveranceInput {
  /** First day of continuous employment, in YYYY-MM-DD. */
  startDate: string;
  /** Final day worked. The retirement date is the following calendar day. */
  lastWorkingDate: string;
  /** Gross wage totals from the three months immediately before retirement. */
  wages: readonly (number | string)[];
  /** Eligible regular bonus total from the preceding 12 months. */
  annualBonus: number | string;
  /** Eligible annual-leave allowance total from the preceding 12 months. */
  annualLeavePay: number | string;
  /** Known daily ordinary wage, used only when it exceeds the average daily wage. */
  dailyOrdinaryWage: number | string;
  /** Average prescribed weekly hours for the final four weeks. */
  weeklyHours: number | string;
}

export interface SeveranceResult {
  retirementDate: string;
  averageWageStartDate: string;
  averageWageEndDate: string;
  serviceDays: number;
  averageWageDays: number;
  threeMonthWages: number;
  includedBonus: number;
  includedAnnualLeavePay: number;
  averageWageTotal: number;
  averageDailyWage: number;
  applicableDailyWage: number;
  eligible: boolean;
  severancePay: number;
}

/**
 * Accepts ordinary pasted number formats, including full-width digits from a
 * Korean keyboard. Currency words and other text are intentionally rejected.
 */
export function parseSeveranceNumber(value: number | string): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const normalized = value.normalize('NFKC').trim().replaceAll(',', '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Calculates the statutory reference amount before retirement-income tax.
 * The retirement date is the day after the final working day. Average wages
 * use the three calendar months before that date, including weekends.
 */
export function calculateSeverance(input: SeveranceInput): SeveranceResult | null {
  const start = parseIsoDate(input.startDate);
  const lastWorking = parseIsoDate(input.lastWorkingDate);
  if (!start || !lastWorking) return null;

  const retirement = addUtcDays(lastWorking, 1);
  if (retirement.getTime() <= start.getTime()) return null;

  if (input.wages.length !== 3) return null;
  const wages = input.wages.map(parseOptionalAmount);
  const annualBonus = parseOptionalAmount(input.annualBonus);
  const annualLeavePay = parseOptionalAmount(input.annualLeavePay);
  const dailyOrdinaryWage = parseOptionalAmount(input.dailyOrdinaryWage);
  const weeklyHours = parseSeveranceNumber(input.weeklyHours);

  if (
    !wages.every((value): value is number => value !== null) ||
    annualBonus === null ||
    annualLeavePay === null ||
    dailyOrdinaryWage === null ||
    weeklyHours === null ||
    weeklyHours < 0 ||
    weeklyHours > MAX_WEEKLY_HOURS
  ) {
    return null;
  }

  const averageWageStart = subtractCalendarMonths(retirement, 3);
  const serviceDays = daysBetween(start, retirement);
  const averageWageDays = daysBetween(averageWageStart, retirement);
  const threeMonthWages = wages.reduce((total, wage) => total + (wage ?? 0), 0);
  const includedBonus = annualBonus * 0.25;
  const includedAnnualLeavePay = annualLeavePay * 0.25;
  const averageWageTotal = threeMonthWages + includedBonus + includedAnnualLeavePay;
  const averageDailyWage = averageWageTotal / averageWageDays;
  const applicableDailyWage = Math.max(averageDailyWage, dailyOrdinaryWage);
  const eligible = serviceDays >= 365 && weeklyHours >= 15;
  const severancePay = Math.round(applicableDailyWage * 30 * (serviceDays / 365));

  if (
    ![threeMonthWages, averageWageTotal, averageDailyWage, applicableDailyWage].every(Number.isFinite) ||
    !Number.isSafeInteger(severancePay)
  ) {
    return null;
  }

  return {
    retirementDate: formatIsoDate(retirement),
    averageWageStartDate: formatIsoDate(averageWageStart),
    averageWageEndDate: formatIsoDate(lastWorking),
    serviceDays,
    averageWageDays,
    threeMonthWages,
    includedBonus,
    includedAnnualLeavePay,
    averageWageTotal,
    averageDailyWage,
    applicableDailyWage,
    eligible,
    severancePay: eligible ? severancePay : 0,
  };
}

function parseOptionalAmount(value: number | string): number | null {
  if (typeof value === 'string' && !value.trim()) return 0;
  const parsed = parseSeveranceNumber(value);
  return parsed === null || parsed < 0 || parsed > MAX_AMOUNT ? null : parsed;
}

function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

function addUtcDays(date: Date, days: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
}

/** Subtracts calendar months while keeping a month-end date at that month end. */
function subtractCalendarMonths(date: Date, months: number): Date {
  const targetMonthIndex = date.getUTCMonth() - months;
  const targetYear = date.getUTCFullYear() + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const targetMonthLastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  return new Date(Date.UTC(targetYear, targetMonth, Math.min(date.getUTCDate(), targetMonthLastDay)));
}

function daysBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
