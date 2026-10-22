/** Pure Korean annual-leave calculations. This module has no DOM or Preact dependencies. */

/**
 * Current rules used by the calculator, centralized for the next annual review.
 * Source: Korean Labor Standards Act arts. 18, 60 and 61, effective 2026-10-08.
 */
export const ANNUAL_LEAVE_RULES = Object.freeze({
  effectiveDate: '2026-10-08',
  minimumEmployees: 5,
  minimumWeeklyHours: 15,
  annualAttendancePercent: 80,
  firstYearMonthlyDays: 11,
  baseAnnualDays: 15,
  extraDayStartServiceYears: 3,
  extraDayIntervalYears: 2,
  maximumAnnualDays: 25,
  standardWeeklyHours: 40,
  standardDayHours: 8,
  commonMonthlyOrdinaryHours: 209,
});

/** Ministry of Employment and Labor 1350 fiscal-year example, answered 2026-02-10. */
export const FISCAL_YEAR_GUIDANCE = Object.freeze({
  checkedDate: '2026-02-10',
  startMonth: 1,
  startDay: 1,
});

export const MAX_MONEY = 1_000_000_000_000_000;
export const MAX_SERVICE_YEARS = 100;
export const MAX_WEEKLY_HOURS = 168;

export type EligibilityReason = 'eligible' | 'under-five-employees' | 'under-fifteen-hours';
export type AccrualReason = 'first-year-monthly' | 'annual-80-percent' | 'monthly-below-80-percent';
export type PayReason = 'calculated' | 'not-statutory-eligible' | 'no-unused-days' | 'no-wage';

export interface AnnualLeaveInput {
  /** First day of employment, YYYY-MM-DD. */
  hireDate: string;
  /** Date through which the employment relationship exists, YYYY-MM-DD. */
  asOfDate: string;
  workplaceAtLeastFive: boolean;
  weeklyHours: number | string;
  /** Whether the latest completed annual attendance period reached 80%. */
  attendanceAtLeast80: boolean;
  /** Fully attended months in the relevant period when annual attendance is below 80%. */
  fullyAttendedMonths: number | string;
  /** Unused days confirmed from the employer's leave ledger. */
  unusedLeaveDays: number | string;
  monthlyOrdinaryWage: number | string;
  monthlyOrdinaryHours: number | string;
  dailyWorkHours: number | string;
  endingEmployment: boolean;
}

export interface AnnualLeaveResult {
  serviceDays: number;
  completedServiceYears: number;
  completedCalendarMonths: number;
  eligibilityReason: EligibilityReason;
  accrualReason: AccrualReason;
  statutoryEligible: boolean;
  firstYearMonthlyDays: number;
  hireDateCurrentDays: number;
  hireDateCurrentHours: number;
  hireDateCurrentGrantDate: string | null;
  hireDateCurrentExpiryDate: string;
  nextAccrualDate: string;
  nextAccrualDays: number | null;
  fiscalCurrentDays: number | null;
  fiscalCurrentHours: number | null;
  fiscalCurrentGrantDate: string | null;
  firstFiscalProratedDays: number;
  hireDateCumulativeDays: number | null;
  fiscalCumulativeDays: number | null;
  fiscalDifferenceDays: number | null;
  terminationShortfallDays: number | null;
  comparisonAvailable: boolean;
  partTime: boolean;
  unusedLeaveDays: number;
  payableUnusedDays: number;
  hourlyOrdinaryWage: number;
  dailyOrdinaryWage: number;
  grossLeaveValue: number;
  estimatedUnusedLeavePay: number;
  payReason: PayReason;
}

/** Accepts pasted commas and full-width digits; rejects currency words and other text. */
export function parseAnnualLeaveNumber(value: number | string): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const normalized = value.normalize('NFKC').trim().replaceAll(',', '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Statutory annual grant after the stated number of completed service years. */
export function annualDaysForServiceYears(serviceYears: number): number {
  if (!Number.isInteger(serviceYears) || serviceYears < 1) return 0;
  const extraDays = Math.floor((serviceYears - 1) / ANNUAL_LEAVE_RULES.extraDayIntervalYears);
  return Math.min(ANNUAL_LEAVE_RULES.maximumAnnualDays, ANNUAL_LEAVE_RULES.baseAnnualDays + extraDays);
}

/**
 * Calculates statutory reference entitlements and a before-tax unused-leave-pay estimate.
 * Fiscal-year figures assume a January 1 year and retain two decimal places because company
 * rules decide whether fractions are kept, rounded or raised.
 */
export function calculateAnnualLeave(input: AnnualLeaveInput): AnnualLeaveResult | null {
  const hire = parseIsoDate(input.hireDate);
  const asOf = parseIsoDate(input.asOfDate);
  if (!hire || !asOf || asOf.getTime() < hire.getTime()) return null;

  const weeklyHours = parseBounded(input.weeklyHours, 0, MAX_WEEKLY_HOURS);
  const fullyAttendedMonths = parseWhole(input.fullyAttendedMonths, 0, 12);
  const unusedLeaveDays = parseBounded(input.unusedLeaveDays, 0, 10_000);
  const monthlyOrdinaryWage = parseBounded(input.monthlyOrdinaryWage, 0, MAX_MONEY);
  const monthlyOrdinaryHours = parseBounded(input.monthlyOrdinaryHours, 0.01, 744);
  const dailyWorkHours = parseBounded(input.dailyWorkHours, 0.01, 24);
  if (
    weeklyHours === null ||
    fullyAttendedMonths === null ||
    unusedLeaveDays === null ||
    monthlyOrdinaryWage === null ||
    monthlyOrdinaryHours === null ||
    dailyWorkHours === null
  ) {
    return null;
  }

  const completedYears = completedUnits(hire, asOf, 'years');
  const completedMonths = completedUnits(hire, asOf, 'months');
  if (completedYears > MAX_SERVICE_YEARS) return null;

  const serviceDays = daysBetween(hire, asOf) + 1;
  const eligibilityReason: EligibilityReason = !input.workplaceAtLeastFive
    ? 'under-five-employees'
    : weeklyHours < ANNUAL_LEAVE_RULES.minimumWeeklyHours
      ? 'under-fifteen-hours'
      : 'eligible';
  const statutoryEligible = eligibilityReason === 'eligible';
  const partTime = weeklyHours < ANNUAL_LEAVE_RULES.standardWeeklyHours;
  const firstAnniversary = addCalendarYears(hire, 1);
  const firstYearMonthlyDays = Math.min(
    ANNUAL_LEAVE_RULES.firstYearMonthlyDays,
    completedYears === 0 && !input.attendanceAtLeast80
      ? Math.min(completedMonths, fullyAttendedMonths)
      : completedMonths,
  );

  let accrualReason: AccrualReason;
  let hireDateCurrentDays: number;
  let hireDateCurrentGrantDate: Date | null;
  let hireDateCurrentExpiryDate: Date;
  let nextAccrualDate: Date;
  let nextAccrualDays: number;

  if (completedYears === 0) {
    accrualReason = 'first-year-monthly';
    hireDateCurrentDays = firstYearMonthlyDays;
    hireDateCurrentGrantDate = completedMonths > 0 ? addCalendarMonths(hire, Math.min(completedMonths, 11)) : null;
    hireDateCurrentExpiryDate = addUtcDays(firstAnniversary, -1);
    if (completedMonths < ANNUAL_LEAVE_RULES.firstYearMonthlyDays) {
      nextAccrualDate = addCalendarMonths(hire, completedMonths + 1);
      nextAccrualDays = 1;
    } else {
      nextAccrualDate = firstAnniversary;
      nextAccrualDays = ANNUAL_LEAVE_RULES.baseAnnualDays;
    }
  } else {
    accrualReason = input.attendanceAtLeast80 ? 'annual-80-percent' : 'monthly-below-80-percent';
    hireDateCurrentDays = input.attendanceAtLeast80 ? annualDaysForServiceYears(completedYears) : fullyAttendedMonths;
    hireDateCurrentGrantDate = addCalendarYears(hire, completedYears);
    hireDateCurrentExpiryDate = addUtcDays(addCalendarYears(hire, completedYears + 1), -1);
    nextAccrualDate = addCalendarYears(hire, completedYears + 1);
    nextAccrualDays = annualDaysForServiceYears(completedYears + 1);
  }

  const firstFiscalGrantDate = new Date(Date.UTC(hire.getUTCFullYear() + 1, 0, 1));
  const hireYearEnd = new Date(Date.UTC(hire.getUTCFullYear(), 11, 31));
  const firstFiscalProratedDays = roundTo(
    (ANNUAL_LEAVE_RULES.baseAnnualDays * (daysBetween(hire, hireYearEnd) + 1)) / daysInYear(hire.getUTCFullYear()),
    2,
  );

  let fiscalCurrentDays: number | null;
  let fiscalCurrentGrantDate: Date | null;
  if (asOf.getTime() < firstFiscalGrantDate.getTime()) {
    fiscalCurrentDays = firstYearMonthlyDays;
    fiscalCurrentGrantDate = hireDateCurrentGrantDate;
  } else {
    const fiscalGrantYear = asOf.getUTCFullYear();
    fiscalCurrentGrantDate = new Date(Date.UTC(fiscalGrantYear, 0, 1));
    fiscalCurrentDays = !input.attendanceAtLeast80
      ? null
      : fiscalGrantYear === hire.getUTCFullYear() + 1
        ? firstFiscalProratedDays
        : annualDaysForServiceYears(completedUnits(hire, fiscalCurrentGrantDate, 'years'));
  }

  const comparisonAvailable = statutoryEligible && input.attendanceAtLeast80;
  let hireDateCumulativeDays: number | null = null;
  let fiscalCumulativeDays: number | null = null;
  let fiscalDifferenceDays: number | null = null;
  let terminationShortfallDays: number | null = null;

  if (comparisonAvailable) {
    hireDateCumulativeDays = Math.min(ANNUAL_LEAVE_RULES.firstYearMonthlyDays, completedMonths);
    for (let serviceYear = 1; serviceYear <= completedYears; serviceYear++) {
      hireDateCumulativeDays += annualDaysForServiceYears(serviceYear);
    }

    fiscalCumulativeDays = Math.min(ANNUAL_LEAVE_RULES.firstYearMonthlyDays, completedMonths);
    if (asOf.getTime() >= firstFiscalGrantDate.getTime()) {
      fiscalCumulativeDays += firstFiscalProratedDays;
      for (let year = hire.getUTCFullYear() + 2; year <= asOf.getUTCFullYear(); year++) {
        const grantDate = new Date(Date.UTC(year, 0, 1));
        fiscalCumulativeDays += annualDaysForServiceYears(completedUnits(hire, grantDate, 'years'));
      }
    }
    hireDateCumulativeDays = roundTo(hireDateCumulativeDays, 2);
    fiscalCumulativeDays = roundTo(fiscalCumulativeDays, 2);
    fiscalDifferenceDays = roundTo(hireDateCumulativeDays - fiscalCumulativeDays, 2);
    terminationShortfallDays = input.endingEmployment ? Math.max(0, fiscalDifferenceDays) : 0;
  }

  if (!statutoryEligible) {
    hireDateCurrentDays = 0;
    fiscalCurrentDays = 0;
  }

  const hireDateCurrentHours = leaveHours(hireDateCurrentDays, weeklyHours);
  const fiscalCurrentHours = fiscalCurrentDays === null ? null : leaveHours(fiscalCurrentDays, weeklyHours);
  const payableUnusedDays = roundTo(unusedLeaveDays + (terminationShortfallDays ?? 0), 2);
  const hourlyOrdinaryWage = monthlyOrdinaryWage / monthlyOrdinaryHours;
  const dailyOrdinaryWage = hourlyOrdinaryWage * dailyWorkHours;
  const grossLeaveValue = Math.round(dailyOrdinaryWage * payableUnusedDays);

  let payReason: PayReason = 'calculated';
  if (!statutoryEligible) payReason = 'not-statutory-eligible';
  else if (payableUnusedDays === 0) payReason = 'no-unused-days';
  else if (monthlyOrdinaryWage === 0) payReason = 'no-wage';

  return {
    serviceDays,
    completedServiceYears: completedYears,
    completedCalendarMonths: completedMonths,
    eligibilityReason,
    accrualReason,
    statutoryEligible,
    firstYearMonthlyDays: statutoryEligible ? firstYearMonthlyDays : 0,
    hireDateCurrentDays: roundTo(hireDateCurrentDays, 2),
    hireDateCurrentHours,
    hireDateCurrentGrantDate: hireDateCurrentGrantDate ? formatIsoDate(hireDateCurrentGrantDate) : null,
    hireDateCurrentExpiryDate: formatIsoDate(hireDateCurrentExpiryDate),
    nextAccrualDate: formatIsoDate(nextAccrualDate),
    nextAccrualDays: input.attendanceAtLeast80 ? nextAccrualDays : null,
    fiscalCurrentDays: fiscalCurrentDays === null ? null : roundTo(fiscalCurrentDays, 2),
    fiscalCurrentHours,
    fiscalCurrentGrantDate: fiscalCurrentGrantDate ? formatIsoDate(fiscalCurrentGrantDate) : null,
    firstFiscalProratedDays,
    hireDateCumulativeDays,
    fiscalCumulativeDays,
    fiscalDifferenceDays,
    terminationShortfallDays,
    comparisonAvailable,
    partTime,
    unusedLeaveDays,
    payableUnusedDays,
    hourlyOrdinaryWage,
    dailyOrdinaryWage,
    grossLeaveValue,
    estimatedUnusedLeavePay: payReason === 'calculated' ? grossLeaveValue : 0,
    payReason,
  };
}

function leaveHours(days: number, weeklyHours: number): number {
  if (days <= 0) return 0;
  const hours =
    days *
    (Math.min(weeklyHours, ANNUAL_LEAVE_RULES.standardWeeklyHours) / ANNUAL_LEAVE_RULES.standardWeeklyHours) *
    ANNUAL_LEAVE_RULES.standardDayHours;
  return Math.ceil(hours - Number.EPSILON);
}

function parseBounded(value: number | string, minimum: number, maximum: number): number | null {
  if (typeof value === 'string' && !value.trim()) return 0 < minimum ? null : 0;
  const parsed = parseAnnualLeaveNumber(value);
  return parsed === null || parsed < minimum || parsed > maximum ? null : parsed;
}

function parseWhole(value: number | string, minimum: number, maximum: number): number | null {
  const parsed = parseBounded(value, minimum, maximum);
  return parsed === null || !Number.isInteger(parsed) ? null : parsed;
}

function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

function completedUnits(start: Date, end: Date, unit: 'months' | 'years'): number {
  let units =
    unit === 'years'
      ? end.getUTCFullYear() - start.getUTCFullYear()
      : (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth();
  const candidate = unit === 'years' ? addCalendarYears(start, units) : addCalendarMonths(start, units);
  if (candidate.getTime() > end.getTime()) units--;
  return Math.max(0, units);
}

function addCalendarYears(date: Date, years: number): Date {
  const year = date.getUTCFullYear() + years;
  const month = date.getUTCMonth();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDay)));
}

function addCalendarMonths(date: Date, months: number): Date {
  const monthIndex = date.getUTCMonth() + months;
  const year = date.getUTCFullYear() + Math.floor(monthIndex / 12);
  const month = ((monthIndex % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDay)));
}

function addUtcDays(date: Date, days: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
}

function daysBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

function daysInYear(year: number): number {
  return new Date(Date.UTC(year, 1, 29)).getUTCMonth() === 1 ? 366 : 365;
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
