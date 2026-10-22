import { describe, expect, it } from 'vitest';
import {
  WEEKLY_HOLIDAY_PAY_RULES_2026,
  calculateWeeklyHolidayPay,
  parseNumericInput,
  type WeeklyHolidayPayInput,
} from './logic';

const baseInput: WeeklyHolidayPayInput = {
  hourlyWage: 10_320,
  dailyHours: [4, 4, 4, 4, 4, 0, 0],
  previousWeeklyHours: [20, 20, 20],
  weeksInAverage: 4,
  holidayHoursMethod: 'part-time',
  ordinaryWorkerDaysPerWeek: 5,
  normalWorkdayHours: 8,
  attendedAllScheduledDays: true,
  employedThroughWeekEnd: true,
};

describe('calculateWeeklyHolidayPay', () => {
  it('calculates a regular 20-hour week at the 2026 minimum wage', () => {
    const result = calculateWeeklyHolidayPay(baseInput)!;

    expect(result.eligible).toBe(true);
    expect(result.currentWeeklyHours).toBe(20);
    expect(result.averageWeeklyHours).toBe(20);
    expect(result.potentialHolidayHours).toBe(4);
    expect(result.holidayHours).toBe(4);
    expect(result.weeklyBasePay).toBe(206_400);
    expect(result.weeklyHolidayPay).toBe(41_280);
    expect(result.weeklyTotalPay).toBe(247_680);
    expect(result.monthlyTotalPay).toBeCloseTo(1_076_228.57, 2);
    expect(result.minimumWageStatus).toBe('equal');
  });

  it('includes exactly 15 average weekly hours but excludes anything below it', () => {
    const atBoundary = calculateWeeklyHolidayPay({
      ...baseInput,
      dailyHours: [3, 3, 3, 3, 3, 0, 0],
      previousWeeklyHours: [15, 15, 15],
    })!;
    const belowBoundary = calculateWeeklyHolidayPay({
      ...baseInput,
      dailyHours: [2.999, 3, 3, 3, 3, 0, 0],
      previousWeeklyHours: [14.999, 14.999, 14.999],
    })!;

    expect(atBoundary.eligible).toBe(true);
    expect(atBoundary.holidayHours).toBe(3);
    expect(atBoundary.weeklyHolidayPay).toBe(30_960);
    expect(belowBoundary.eligible).toBe(false);
    expect(belowBoundary.reasons).toEqual(['under-15-hours']);
    expect(belowBoundary.weeklyHolidayPay).toBe(0);
  });

  it('uses the actual one-to-four-week period for an irregular schedule', () => {
    const result = calculateWeeklyHolidayPay({
      ...baseInput,
      dailyHours: [2, 2, 2, 2, 2, 0, 0],
      previousWeeklyHours: [20, 20, 10],
    })!;

    expect(result.averageWeeklyHours).toBe(15);
    expect(result.eligible).toBe(true);
    expect(result.holidayHours).toBe(3);

    const newWorker = calculateWeeklyHolidayPay({
      ...baseInput,
      dailyHours: [4, 4, 4, 4, 0, 0, 0],
      previousWeeklyHours: [],
      weeksInAverage: 1,
    })!;
    expect(newWorker.averageWeeklyHours).toBe(16);
    expect(newWorker.weeksUsed).toBe(1);
  });

  it('reports every reason that the current week does not qualify', () => {
    const result = calculateWeeklyHolidayPay({
      ...baseInput,
      dailyHours: [2, 2, 2, 2, 2, 0, 0],
      previousWeeklyHours: [10, 10, 10],
      attendedAllScheduledDays: false,
      employedThroughWeekEnd: false,
    })!;

    expect(result.eligible).toBe(false);
    expect(result.reasons).toEqual(['under-15-hours', 'absence', 'employment-ended-before-week-end']);
    expect(result.holidayHours).toBe(0);
    expect(result.potentialHolidayHours).toBe(2);
    expect(result.weeklyHolidayPay).toBe(0);
  });

  it('uses the ordinary worker schedule and caps paid holiday time at eight hours', () => {
    const sixDayWorkplace = calculateWeeklyHolidayPay({
      ...baseInput,
      ordinaryWorkerDaysPerWeek: 6,
    })!;
    expect(sixDayWorkplace.holidayHours).toBeCloseTo(20 / 6);

    const capped = calculateWeeklyHolidayPay({
      ...baseInput,
      dailyHours: [8, 8, 8, 8, 8, 0, 0],
      previousWeeklyHours: [40, 40, 40],
      ordinaryWorkerDaysPerWeek: 4,
    })!;
    expect(capped.holidayHours).toBe(8);
  });

  it('uses normal workday hours for a regular six-day schedule', () => {
    const result = calculateWeeklyHolidayPay({
      ...baseInput,
      dailyHours: [7, 7, 7, 7, 7, 5, 0],
      previousWeeklyHours: [40, 40, 40],
      holidayHoursMethod: 'regular',
      normalWorkdayHours: 7,
    })!;

    expect(result.averageWeeklyHours).toBe(40);
    expect(result.potentialHolidayHours).toBe(7);
    expect(result.holidayHours).toBe(7);
    expect(result.weeklyHolidayPay).toBe(72_240);
  });

  it('preserves formula hours while making pay zero after an absence', () => {
    const result = calculateWeeklyHolidayPay({
      ...baseInput,
      attendedAllScheduledDays: false,
    })!;

    expect(result.potentialHolidayHours).toBe(4);
    expect(result.holidayHours).toBe(0);
    expect(result.weeklyHolidayPay).toBe(0);
  });

  it('uses current hours for this week and the average for the monthly estimate', () => {
    const result = calculateWeeklyHolidayPay({
      ...baseInput,
      dailyHours: [3, 3, 3, 3, 0, 0, 0],
      previousWeeklyHours: [20, 20, 20],
    })!;

    expect(result.currentWeeklyHours).toBe(12);
    expect(result.averageWeeklyHours).toBe(18);
    expect(result.weeklyBasePay).toBe(123_840);
    expect(result.monthlyBasePay).toBeCloseTo(18 * WEEKLY_HOLIDAY_PAY_RULES_2026.weeksPerMonth * 10_320);
  });

  it('compares the contractual hourly rate with the 2026 minimum', () => {
    expect(calculateWeeklyHolidayPay({ ...baseInput, hourlyWage: 10_319 })!.minimumWageStatus).toBe('below');
    expect(calculateWeeklyHolidayPay({ ...baseInput, hourlyWage: 10_320 })!.minimumWageStatus).toBe('equal');
    expect(calculateWeeklyHolidayPay({ ...baseInput, hourlyWage: 12_000 })!.minimumWageStatus).toBe('above');
    expect(calculateWeeklyHolidayPay({ ...baseInput, hourlyWage: 10_319 })!.minimumWageDifference).toBe(-1);
  });

  it('returns a valid ineligible result for an empty schedule', () => {
    const result = calculateWeeklyHolidayPay({
      ...baseInput,
      dailyHours: [0, 0, 0, 0, 0, 0, 0],
      previousWeeklyHours: [0, 0, 0],
    })!;
    expect(result.eligible).toBe(false);
    expect(result.reasons).toEqual(['under-15-hours']);
    expect(result.weeklyTotalPay).toBe(0);
  });

  it('rejects invalid or out-of-range input', () => {
    expect(calculateWeeklyHolidayPay({ ...baseInput, hourlyWage: '' })).toBeNull();
    expect(calculateWeeklyHolidayPay({ ...baseInput, hourlyWage: 1_000_001 })).toBeNull();
    expect(calculateWeeklyHolidayPay({ ...baseInput, dailyHours: [9, 0, 0, 0, 0, 0, 0] })).toBeNull();
    expect(calculateWeeklyHolidayPay({ ...baseInput, dailyHours: [8, 8, 8, 8, 8, 1, 0] })).toBeNull();
    expect(calculateWeeklyHolidayPay({ ...baseInput, dailyHours: [-1, 0, 0, 0, 0, 0, 0] })).toBeNull();
    expect(calculateWeeklyHolidayPay({ ...baseInput, dailyHours: [1, 2] })).toBeNull();
    expect(calculateWeeklyHolidayPay({ ...baseInput, weeksInAverage: 0 })).toBeNull();
    expect(calculateWeeklyHolidayPay({ ...baseInput, weeksInAverage: 4, previousWeeklyHours: [20] })).toBeNull();
    expect(calculateWeeklyHolidayPay({ ...baseInput, ordinaryWorkerDaysPerWeek: 5.5 })).toBeNull();
    expect(
      calculateWeeklyHolidayPay({ ...baseInput, holidayHoursMethod: 'regular', normalWorkdayHours: 8.5 }),
    ).toBeNull();
  });
});

describe('parseNumericInput', () => {
  it('normalizes Korean units, commas, and full-width Unicode digits', () => {
    expect(parseNumericInput('１０，３２０원')).toBe(10_320);
    expect(parseNumericInput(' ４.５ 시간 ')).toBe(4.5);
    expect(parseNumericInput('20 hours')).toBe(20);
  });

  it('rejects empty text, Korean number words, emoji, negatives, and infinity', () => {
    expect(parseNumericInput('')).toBeNull();
    expect(parseNumericInput('십오')).toBeNull();
    expect(parseNumericInput('15시간🙂')).toBeNull();
    expect(parseNumericInput('-1')).toBeNull();
    expect(parseNumericInput(Number.POSITIVE_INFINITY)).toBeNull();
  });
});
