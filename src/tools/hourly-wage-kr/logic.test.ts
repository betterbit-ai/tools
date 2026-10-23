import { describe, expect, it } from 'vitest';
import { HOURLY_WAGE_RULES_2026, calculateHourlyWage, parseNumericInput, type HourlyWageInput } from './logic';

const baseInput: HourlyWageInput = {
  hourlyWage: 10_320,
  hoursPerDay: 8,
  daysPerWeek: 5,
  attendedAllScheduledDays: true,
  employedThroughWeekEnd: true,
  deductionMode: 'none',
};

describe('calculateHourlyWage', () => {
  it('matches every official 2026 full-time minimum-wage figure', () => {
    const result = calculateHourlyWage(baseInput)!;

    expect(result.dailyPay).toBe(HOURLY_WAGE_RULES_2026.officialEightHourDailyPay);
    expect(result.weeklyHours).toBe(40);
    expect(result.weeklyBasePay).toBe(412_800);
    expect(result.holidayHours).toBe(8);
    expect(result.weeklyHolidayPay).toBe(82_560);
    expect(result.weeklyPayWithHoliday).toBe(495_360);
    expect(result.monthlyBaseHours).toBe(174);
    expect(result.monthlyPaidHours).toBe(HOURLY_WAGE_RULES_2026.officialMonthlyPaidHours);
    expect(result.monthlyPayWithoutHoliday).toBe(1_795_680);
    expect(result.monthlyPayWithHoliday).toBe(HOURLY_WAGE_RULES_2026.officialMonthlyMinimumPay);
    expect(result.monthlyHolidayPay).toBe(361_200);
    expect(result.annualPayWithHoliday).toBe(25_882_560);
    expect(result.minimumWageStatus).toBe('equal');
  });

  it('includes exactly 15 weekly hours and excludes anything below the boundary', () => {
    const atBoundary = calculateHourlyWage({ ...baseInput, hoursPerDay: 3, daysPerWeek: 5 })!;
    const belowBoundary = calculateHourlyWage({ ...baseInput, hoursPerDay: 2.99, daysPerWeek: 5 })!;

    expect(atBoundary.holidayPayEligible).toBe(true);
    expect(atBoundary.holidayHours).toBe(3);
    expect(atBoundary.weeklyHolidayPay).toBe(30_960);
    expect(atBoundary.monthlyPaidHours).toBe(78);
    expect(belowBoundary.holidayPayEligible).toBe(false);
    expect(belowBoundary.holidayPayReasons).toEqual(['under-15-hours']);
    expect(belowBoundary.holidayHours).toBe(0);
    expect(belowBoundary.weeklyHolidayPay).toBe(0);
  });

  it('explains every failed weekly-holiday condition without hiding formula hours', () => {
    const result = calculateHourlyWage({
      ...baseInput,
      hoursPerDay: 2,
      daysPerWeek: 5,
      attendedAllScheduledDays: false,
      employedThroughWeekEnd: false,
    })!;

    expect(result.holidayPayEligible).toBe(false);
    expect(result.holidayPayReasons).toEqual(['under-15-hours', 'absence', 'employment-ended-before-week-end']);
    expect(result.potentialHolidayHours).toBe(2);
    expect(result.holidayHours).toBe(0);
    expect(result.monthlyPayWithHoliday).toBe(result.monthlyPayWithoutHoliday);
  });

  it('calculates a realistic part-time wage with whole monthly conversion hours', () => {
    const result = calculateHourlyWage({ ...baseInput, hourlyWage: 12_000, hoursPerDay: 4, daysPerWeek: 5 })!;

    expect(result.weeklyHours).toBe(20);
    expect(result.dailyPay).toBe(48_000);
    expect(result.weeklyHolidayPay).toBe(48_000);
    expect(result.monthlyBaseHours).toBe(87);
    expect(result.monthlyPaidHours).toBe(104);
    expect(result.monthlyPayWithoutHoliday).toBe(1_044_000);
    expect(result.monthlyPayWithHoliday).toBe(1_248_000);
    expect(result.minimumWageStatus).toBe('above');
  });

  it('shows the optional 2026 business-income 3.3% estimate separately', () => {
    const result = calculateHourlyWage({ ...baseInput, deductionMode: 'business-3.3' })!;

    expect(result.estimatedBusinessIncomeTax).toBe(64_700);
    expect(result.estimatedLocalIncomeTax).toBe(6_470);
    expect(result.estimatedBusinessWithholding).toBe(71_170);
    expect(result.estimatedAfterDeduction).toBe(2_085_710);
    expect(result.estimatedBusinessIncomeTax % HOURLY_WAGE_RULES_2026.taxTruncationUnit).toBe(0);
    expect(result.estimatedLocalIncomeTax % HOURLY_WAGE_RULES_2026.taxTruncationUnit).toBe(0);
    expect(HOURLY_WAGE_RULES_2026.businessIncomeTaxRate + HOURLY_WAGE_RULES_2026.localIncomeTaxRate).toBe(
      HOURLY_WAGE_RULES_2026.businessWithholdingRate,
    );
  });

  it('compares one-won minimum-wage boundaries', () => {
    expect(calculateHourlyWage({ ...baseInput, hourlyWage: 10_319 })!.minimumWageStatus).toBe('below');
    expect(calculateHourlyWage({ ...baseInput, hourlyWage: 10_320 })!.minimumWageStatus).toBe('equal');
    expect(calculateHourlyWage({ ...baseInput, hourlyWage: 10_321 })!.minimumWageStatus).toBe('above');
    expect(calculateHourlyWage({ ...baseInput, hourlyWage: 10_319 })!.minimumWageDifference).toBe(-1);
  });

  it('rejects empty, zero, fractional-day, overtime, and huge inputs', () => {
    expect(calculateHourlyWage({ ...baseInput, hourlyWage: '' })).toBeNull();
    expect(calculateHourlyWage({ ...baseInput, hourlyWage: 0 })).toBeNull();
    expect(calculateHourlyWage({ ...baseInput, hourlyWage: 1_000_001 })).toBeNull();
    expect(calculateHourlyWage({ ...baseInput, hoursPerDay: 0 })).toBeNull();
    expect(calculateHourlyWage({ ...baseInput, hoursPerDay: 8.01 })).toBeNull();
    expect(calculateHourlyWage({ ...baseInput, daysPerWeek: 5.5 })).toBeNull();
    expect(calculateHourlyWage({ ...baseInput, daysPerWeek: 8 })).toBeNull();
    expect(calculateHourlyWage({ ...baseInput, hoursPerDay: 7, daysPerWeek: 6 })).toBeNull();
  });
});

describe('parseNumericInput', () => {
  it('normalizes Korean units, commas, and full-width Unicode digits', () => {
    expect(parseNumericInput('１０，３２０원')).toBe(10_320);
    expect(parseNumericInput(' ４.５ 시간 ')).toBe(4.5);
    expect(parseNumericInput('５ days')).toBe(5);
  });

  it('rejects empty text, Korean number words, emoji, negatives, and infinity', () => {
    expect(parseNumericInput('')).toBeNull();
    expect(parseNumericInput('만원')).toBeNull();
    expect(parseNumericInput('8시간🙂')).toBeNull();
    expect(parseNumericInput('-1')).toBeNull();
    expect(parseNumericInput(Number.POSITIVE_INFINITY)).toBeNull();
  });
});
