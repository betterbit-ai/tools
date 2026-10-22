/**
 * Pure weekly-holiday-pay logic. The statutory values and update-sensitive limits are kept here
 * so the 2027 review has one source of truth.
 */

export const WEEKLY_HOLIDAY_PAY_RULES_2026 = {
  year: 2026,
  effectiveFrom: '2026-01-01',
  effectiveTo: '2026-12-31',
  minimumWageAnnouncementDate: '2025-08-05',
  verifiedOn: '2026-10-22',
  laborStandardsActEffectiveFrom: '2026-10-08',
  nextDayWorkInterpretationEffectiveFrom: '2021-08-04',
  minimumWageNotice: '고용노동부고시 제2025-47호',
  minimumHourlyWage: 10_320,
  previousYearMinimumHourlyWage: 10_030,
  minimumWageIncrease: 290,
  minimumWageIncreasePercent: 2.9,
  minimumAverageWeeklyHours: 15,
  maximumHolidayHours: 8,
  standardMonthlyPaidHours: 209,
  standardMonthlyMinimumPay: 2_156_880,
  standardWeeklyScheduledHours: 40,
  defaultOrdinaryWorkerDaysPerWeek: 5,
  maximumReviewWeeks: 4,
  maximumDailyInputHours: 8,
  maximumWeeklyInputHours: 40,
  maximumHourlyWageInput: 1_000_000,
  weeksPerMonth: 365 / 7 / 12,
} as const;

export type NumericInput = number | string;
export type EligibilityReason = 'under-15-hours' | 'absence' | 'employment-ended-before-week-end';
export type MinimumWageStatus = 'below' | 'equal' | 'above';
export type HolidayHoursMethod = 'part-time' | 'regular';

export interface WeeklyHolidayPayInput {
  hourlyWage: NumericInput;
  /** Monday through Sunday contractual hours for the week being paid. */
  dailyHours: readonly NumericInput[];
  /** Earlier weekly contractual-hour totals, newest first. */
  previousWeeklyHours: readonly NumericInput[];
  /** Four weeks, or the actual period when employed for fewer than four weeks. */
  weeksInAverage: number;
  holidayHoursMethod: HolidayHoursMethod;
  ordinaryWorkerDaysPerWeek: NumericInput;
  normalWorkdayHours: NumericInput;
  attendedAllScheduledDays: boolean;
  employedThroughWeekEnd: boolean;
}

export interface WeeklyHolidayPayResult {
  eligible: boolean;
  reasons: EligibilityReason[];
  currentWeeklyHours: number;
  averageWeeklyHours: number;
  potentialHolidayHours: number;
  holidayHours: number;
  weeklyBasePay: number;
  weeklyHolidayPay: number;
  weeklyTotalPay: number;
  monthlyBasePay: number;
  monthlyHolidayPay: number;
  monthlyTotalPay: number;
  minimumWageStatus: MinimumWageStatus;
  minimumWageDifference: number;
  weeksUsed: number;
  ordinaryWorkerDaysPerWeek: number;
  normalWorkdayHours: number;
  holidayHoursMethod: HolidayHoursMethod;
}

/** Parses numbers pasted with grouping, full-width digits, and common Korean/English unit suffixes. */
export function parseNumericInput(value: NumericInput): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const normalized = value
    .normalize('NFKC')
    .trim()
    .replaceAll(',', '')
    .replaceAll(' ', '')
    .replace(/(?:원|시간|hours?|hrs?|h)$/i, '');

  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Calculates a standard adult worker's weekly holiday pay under the 2026 rules.
 *
 * Part-time paid hours follow Labor Standards Act Enforcement Decree Article 9 and attached Table 2:
 * review-period contractual hours ÷ the ordinary worker's workdays in that same period. An ordinary
 * worker instead receives the contractual hours of a normal workday, capped at eight hours here.
 */
export function calculateWeeklyHolidayPay(input: WeeklyHolidayPayInput): WeeklyHolidayPayResult | null {
  const rules = WEEKLY_HOLIDAY_PAY_RULES_2026;
  const hourlyWage = parseNumericInput(input.hourlyWage);
  const ordinaryWorkerDaysPerWeek = parseNumericInput(input.ordinaryWorkerDaysPerWeek);
  const normalWorkdayHours = parseNumericInput(input.normalWorkdayHours);
  const validPartTimeMethod =
    input.holidayHoursMethod === 'part-time' &&
    ordinaryWorkerDaysPerWeek !== null &&
    Number.isInteger(ordinaryWorkerDaysPerWeek) &&
    ordinaryWorkerDaysPerWeek >= 1 &&
    ordinaryWorkerDaysPerWeek <= 7;
  const validRegularMethod =
    input.holidayHoursMethod === 'regular' &&
    normalWorkdayHours !== null &&
    normalWorkdayHours > 0 &&
    normalWorkdayHours <= rules.maximumHolidayHours;

  if (
    hourlyWage === null ||
    hourlyWage <= 0 ||
    hourlyWage > rules.maximumHourlyWageInput ||
    (!validPartTimeMethod && !validRegularMethod) ||
    !Number.isInteger(input.weeksInAverage) ||
    input.weeksInAverage < 1 ||
    input.weeksInAverage > rules.maximumReviewWeeks ||
    input.dailyHours.length !== 7 ||
    input.previousWeeklyHours.length < input.weeksInAverage - 1
  ) {
    return null;
  }

  const dailyHours = input.dailyHours.map(parseNumericInput);
  if (dailyHours.some((hours) => hours === null || hours < 0 || hours > rules.maximumDailyInputHours)) {
    return null;
  }

  const currentWeeklyHours = (dailyHours as number[]).reduce((sum, hours) => sum + hours, 0);
  if (currentWeeklyHours > rules.maximumWeeklyInputHours) return null;

  const previousWeeklyHours = input.previousWeeklyHours.slice(0, input.weeksInAverage - 1).map(parseNumericInput);
  if (previousWeeklyHours.some((hours) => hours === null || hours < 0 || hours > rules.maximumWeeklyInputHours)) {
    return null;
  }

  const hoursInReviewPeriod =
    currentWeeklyHours + (previousWeeklyHours as number[]).reduce((sum, hours) => sum + hours, 0);
  const averageWeeklyHours = hoursInReviewPeriod / input.weeksInAverage;
  const reasons: EligibilityReason[] = [];

  if (averageWeeklyHours < rules.minimumAverageWeeklyHours) reasons.push('under-15-hours');
  if (!input.attendedAllScheduledDays) reasons.push('absence');
  if (!input.employedThroughWeekEnd) reasons.push('employment-ended-before-week-end');

  const eligible = reasons.length === 0;
  const potentialHolidayHours = Math.min(
    input.holidayHoursMethod === 'part-time'
      ? averageWeeklyHours / (ordinaryWorkerDaysPerWeek as number)
      : (normalWorkdayHours as number),
    rules.maximumHolidayHours,
  );
  const holidayHours = eligible ? potentialHolidayHours : 0;
  const weeklyBasePay = currentWeeklyHours * hourlyWage;
  const weeklyHolidayPay = holidayHours * hourlyWage;
  const monthlyBasePay = averageWeeklyHours * rules.weeksPerMonth * hourlyWage;
  const monthlyHolidayPay = holidayHours * rules.weeksPerMonth * hourlyWage;
  const minimumWageDifference = hourlyWage - rules.minimumHourlyWage;
  const minimumWageStatus: MinimumWageStatus =
    minimumWageDifference < 0 ? 'below' : minimumWageDifference > 0 ? 'above' : 'equal';

  return {
    eligible,
    reasons,
    currentWeeklyHours,
    averageWeeklyHours,
    potentialHolidayHours,
    holidayHours,
    weeklyBasePay,
    weeklyHolidayPay,
    weeklyTotalPay: weeklyBasePay + weeklyHolidayPay,
    monthlyBasePay,
    monthlyHolidayPay,
    monthlyTotalPay: monthlyBasePay + monthlyHolidayPay,
    minimumWageStatus,
    minimumWageDifference,
    weeksUsed: input.weeksInAverage,
    ordinaryWorkerDaysPerWeek: ordinaryWorkerDaysPerWeek ?? 0,
    normalWorkdayHours: normalWorkdayHours ?? 0,
    holidayHoursMethod: input.holidayHoursMethod,
  };
}
