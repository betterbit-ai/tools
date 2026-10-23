/**
 * Pure hourly-wage conversion logic. Keep every update-sensitive 2026 figure here so the
 * annual review has one source of truth.
 */

export const HOURLY_WAGE_RULES_2026 = {
  year: 2026,
  effectiveFrom: '2026-01-01',
  effectiveTo: '2026-12-31',
  minimumWageDecisionDate: '2025-08-05',
  minimumWageNotice: '고용노동부고시 제2025-47호',
  verifiedOn: '2026-10-23',
  minimumHourlyWage: 10_320,
  officialEightHourDailyPay: 82_560,
  officialMonthlyPaidHours: 209,
  officialMonthlyMinimumPay: 2_156_880,
  minimumHolidayEligibilityHours: 15,
  standardWeeklyHours: 40,
  maximumHolidayHours: 8,
  weeksPerMonth: 365 / 7 / 12,
  businessIncomeTaxRate: 0.03,
  localIncomeTaxShareOfIncomeTax: 0.1,
  localIncomeTaxRate: 0.003,
  businessWithholdingRate: 0.033,
  taxTruncationUnit: 10,
  treasuryRoundingEffectiveFrom: '2026-01-02',
  maximumHourlyWageInput: 1_000_000,
  maximumDailyHours: 8,
  maximumDaysPerWeek: 7,
} as const;

export type NumericInput = number | string;
export type DeductionMode = 'none' | 'business-3.3';
export type HolidayPayReason = 'under-15-hours' | 'absence' | 'employment-ended-before-week-end';
export type MinimumWageStatus = 'below' | 'equal' | 'above';

export interface HourlyWageInput {
  hourlyWage: NumericInput;
  hoursPerDay: NumericInput;
  daysPerWeek: NumericInput;
  attendedAllScheduledDays: boolean;
  employedThroughWeekEnd: boolean;
  deductionMode: DeductionMode;
}

export interface HourlyWageResult {
  hourlyWage: number;
  hoursPerDay: number;
  daysPerWeek: number;
  weeklyHours: number;
  dailyPay: number;
  weeklyBasePay: number;
  potentialHolidayHours: number;
  holidayHours: number;
  weeklyHolidayPay: number;
  weeklyPayWithHoliday: number;
  monthlyBaseHours: number;
  monthlyPaidHours: number;
  monthlyPayWithoutHoliday: number;
  monthlyHolidayPay: number;
  monthlyPayWithHoliday: number;
  annualPayWithHoliday: number;
  holidayPayEligible: boolean;
  holidayPayReasons: HolidayPayReason[];
  minimumWageStatus: MinimumWageStatus;
  minimumWageDifference: number;
  deductionMode: DeductionMode;
  estimatedBusinessIncomeTax: number;
  estimatedLocalIncomeTax: number;
  estimatedBusinessWithholding: number;
  estimatedAfterDeduction: number;
}

function truncateTax(amount: number, unit: number): number {
  return Math.floor(amount / unit) * unit;
}

/** Parses grouping, full-width digits, and common Korean/English unit suffixes. */
export function parseNumericInput(value: NumericInput): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const normalized = value
    .normalize('NFKC')
    .trim()
    .replaceAll(',', '')
    .replaceAll(' ', '')
    .replace(/(?:원|일|시간|days?|hours?|hrs?|h)$/i, '');

  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Converts an hourly wage under the standard Korean 40-hour comparison schedule.
 * Monthly paid hours are rounded to whole hours, which reproduces the official 209-hour
 * full-time conversion instead of presenting 208.57 hours as the statutory monthly figure.
 */
export function calculateHourlyWage(input: HourlyWageInput): HourlyWageResult | null {
  const rules = HOURLY_WAGE_RULES_2026;
  const hourlyWage = parseNumericInput(input.hourlyWage);
  const hoursPerDay = parseNumericInput(input.hoursPerDay);
  const daysPerWeek = parseNumericInput(input.daysPerWeek);

  if (
    hourlyWage === null ||
    hourlyWage <= 0 ||
    hourlyWage > rules.maximumHourlyWageInput ||
    hoursPerDay === null ||
    hoursPerDay <= 0 ||
    hoursPerDay > rules.maximumDailyHours ||
    daysPerWeek === null ||
    !Number.isInteger(daysPerWeek) ||
    daysPerWeek < 1 ||
    daysPerWeek > rules.maximumDaysPerWeek ||
    (input.deductionMode !== 'none' && input.deductionMode !== 'business-3.3')
  ) {
    return null;
  }

  const weeklyHours = hoursPerDay * daysPerWeek;
  if (weeklyHours > rules.standardWeeklyHours) return null;

  const holidayPayReasons: HolidayPayReason[] = [];
  if (weeklyHours < rules.minimumHolidayEligibilityHours) holidayPayReasons.push('under-15-hours');
  if (!input.attendedAllScheduledDays) holidayPayReasons.push('absence');
  if (!input.employedThroughWeekEnd) holidayPayReasons.push('employment-ended-before-week-end');

  const holidayPayEligible = holidayPayReasons.length === 0;
  const potentialHolidayHours = Math.min(
    (weeklyHours / rules.standardWeeklyHours) * rules.maximumHolidayHours,
    rules.maximumHolidayHours,
  );
  const holidayHours = holidayPayEligible ? potentialHolidayHours : 0;
  const weeklyBasePay = hourlyWage * weeklyHours;
  const weeklyHolidayPay = hourlyWage * holidayHours;
  const monthlyBaseHours = Math.round(weeklyHours * rules.weeksPerMonth);
  const monthlyPaidHours = Math.round((weeklyHours + holidayHours) * rules.weeksPerMonth);
  const monthlyPayWithoutHoliday = hourlyWage * monthlyBaseHours;
  const monthlyPayWithHoliday = hourlyWage * monthlyPaidHours;
  const minimumWageDifference = hourlyWage - rules.minimumHourlyWage;
  const minimumWageStatus: MinimumWageStatus =
    minimumWageDifference < 0 ? 'below' : minimumWageDifference > 0 ? 'above' : 'equal';
  const estimatedBusinessIncomeTax =
    input.deductionMode === 'business-3.3'
      ? truncateTax(monthlyPayWithHoliday * rules.businessIncomeTaxRate, rules.taxTruncationUnit)
      : 0;
  const estimatedLocalIncomeTax =
    input.deductionMode === 'business-3.3'
      ? truncateTax(estimatedBusinessIncomeTax * rules.localIncomeTaxShareOfIncomeTax, rules.taxTruncationUnit)
      : 0;
  const estimatedBusinessWithholding = estimatedBusinessIncomeTax + estimatedLocalIncomeTax;

  return {
    hourlyWage,
    hoursPerDay,
    daysPerWeek,
    weeklyHours,
    dailyPay: hourlyWage * hoursPerDay,
    weeklyBasePay,
    potentialHolidayHours,
    holidayHours,
    weeklyHolidayPay,
    weeklyPayWithHoliday: weeklyBasePay + weeklyHolidayPay,
    monthlyBaseHours,
    monthlyPaidHours,
    monthlyPayWithoutHoliday,
    monthlyHolidayPay: monthlyPayWithHoliday - monthlyPayWithoutHoliday,
    monthlyPayWithHoliday,
    annualPayWithHoliday: monthlyPayWithHoliday * 12,
    holidayPayEligible,
    holidayPayReasons,
    minimumWageStatus,
    minimumWageDifference,
    deductionMode: input.deductionMode,
    estimatedBusinessIncomeTax,
    estimatedLocalIncomeTax,
    estimatedBusinessWithholding,
    estimatedAfterDeduction: monthlyPayWithHoliday - estimatedBusinessWithholding,
  };
}
