import { describe, expect, it } from 'vitest';
import {
  ANNUAL_LEAVE_RULES,
  annualDaysForServiceYears,
  calculateAnnualLeave,
  MAX_MONEY,
  parseAnnualLeaveNumber,
} from './logic';

const baseInput = {
  hireDate: '2023-03-02',
  asOfDate: '2026-10-22',
  workplaceAtLeastFive: true,
  weeklyHours: 40,
  attendanceAtLeast80: true,
  fullyAttendedMonths: 12,
  unusedLeaveDays: 5,
  monthlyOrdinaryWage: 3_000_000,
  monthlyOrdinaryHours: ANNUAL_LEAVE_RULES.commonMonthlyOrdinaryHours,
  dailyWorkHours: 8,
  endingEmployment: false,
};

describe('calculateAnnualLeave', () => {
  it('accrues one day per completed month during the first year', () => {
    const result = calculateAnnualLeave({ ...baseInput, hireDate: '2026-01-15', asOfDate: '2026-07-15' });

    expect(result).toMatchObject({
      serviceDays: 182,
      completedServiceYears: 0,
      completedCalendarMonths: 6,
      accrualReason: 'first-year-monthly',
      firstYearMonthlyDays: 6,
      hireDateCurrentDays: 6,
      hireDateCurrentGrantDate: '2026-07-15',
      hireDateCurrentExpiryDate: '2027-01-14',
      nextAccrualDate: '2026-08-15',
      nextAccrualDays: 1,
    });
  });

  it('distinguishes a 365-day contract from employment continuing on the first anniversary', () => {
    const finalDay = calculateAnnualLeave({ ...baseInput, hireDate: '2025-01-01', asOfDate: '2025-12-31' });
    const anniversary = calculateAnnualLeave({ ...baseInput, hireDate: '2025-01-01', asOfDate: '2026-01-01' });

    expect(finalDay).toMatchObject({
      serviceDays: 365,
      completedServiceYears: 0,
      firstYearMonthlyDays: 11,
      hireDateCurrentDays: 11,
    });
    expect(anniversary).toMatchObject({
      serviceDays: 366,
      completedServiceYears: 1,
      hireDateCurrentDays: 15,
      hireDateCumulativeDays: 26,
    });
  });

  it('adds one day every two service years and caps the annual grant at 25 days', () => {
    expect(annualDaysForServiceYears(1)).toBe(15);
    expect(annualDaysForServiceYears(2)).toBe(15);
    expect(annualDaysForServiceYears(3)).toBe(16);
    expect(annualDaysForServiceYears(20)).toBe(24);
    expect(annualDaysForServiceYears(21)).toBe(25);
    expect(annualDaysForServiceYears(99)).toBe(25);
  });

  it('matches the Ministry fiscal-year example and exposes a termination shortfall', () => {
    const result = calculateAnnualLeave({
      ...baseInput,
      hireDate: '2022-05-10',
      asOfDate: '2025-05-10',
      endingEmployment: true,
    });

    expect(result).toMatchObject({
      firstFiscalProratedDays: 9.7,
      hireDateCumulativeDays: 57,
      fiscalCumulativeDays: 50.7,
      fiscalDifferenceDays: 6.3,
      terminationShortfallDays: 6.3,
      payableUnusedDays: 11.3,
    });
  });

  it('uses completed service years at each January 1 fiscal grant', () => {
    const result = calculateAnnualLeave({
      ...baseInput,
      hireDate: '2023-01-01',
      asOfDate: '2026-01-01',
      endingEmployment: true,
    });

    expect(result).toMatchObject({
      hireDateCurrentDays: 16,
      fiscalCurrentDays: 16,
      hireDateCumulativeDays: 57,
      fiscalCumulativeDays: 57,
      fiscalDifferenceDays: 0,
      terminationShortfallDays: 0,
    });
  });

  it('uses 366 calendar days for a leap-year fiscal estimate', () => {
    const result = calculateAnnualLeave({ ...baseInput, hireDate: '2024-07-01', asOfDate: '2025-01-01' });
    expect(result?.firstFiscalProratedDays).toBe(7.54);
  });

  it('returns zero statutory leave with the exact failed eligibility reason', () => {
    expect(calculateAnnualLeave({ ...baseInput, workplaceAtLeastFive: false })).toMatchObject({
      statutoryEligible: false,
      eligibilityReason: 'under-five-employees',
      hireDateCurrentDays: 0,
      estimatedUnusedLeavePay: 0,
      payReason: 'not-statutory-eligible',
    });
    expect(calculateAnnualLeave({ ...baseInput, weeklyHours: 14.99 })).toMatchObject({
      statutoryEligible: false,
      eligibilityReason: 'under-fifteen-hours',
      hireDateCurrentDays: 0,
    });
  });

  it('converts a part-time annual grant to hours and rounds a fraction up to one hour', () => {
    expect(
      calculateAnnualLeave({ ...baseInput, hireDate: '2025-01-01', asOfDate: '2026-01-01', weeklyHours: 20 }),
    ).toMatchObject({
      partTime: true,
      hireDateCurrentDays: 15,
      hireDateCurrentHours: 60,
    });
    expect(
      calculateAnnualLeave({ ...baseInput, hireDate: '2026-01-01', asOfDate: '2026-02-01', weeklyHours: 17 }),
    ).toMatchObject({
      hireDateCurrentDays: 1,
      hireDateCurrentHours: 4,
    });
  });

  it('uses fully attended months below 80% and suppresses an unsafe cumulative comparison', () => {
    expect(calculateAnnualLeave({ ...baseInput, attendanceAtLeast80: false, fullyAttendedMonths: 8 })).toMatchObject({
      accrualReason: 'monthly-below-80-percent',
      hireDateCurrentDays: 8,
      nextAccrualDays: null,
      fiscalCurrentDays: null,
      fiscalCurrentHours: null,
      comparisonAvailable: false,
      hireDateCumulativeDays: null,
      terminationShortfallDays: null,
    });
  });

  it('shows the substituted ordinary-wage estimate and exact zero reasons', () => {
    expect(calculateAnnualLeave(baseInput)).toMatchObject({
      hourlyOrdinaryWage: 3_000_000 / 209,
      dailyOrdinaryWage: (3_000_000 / 209) * 8,
      grossLeaveValue: 574_163,
      estimatedUnusedLeavePay: 574_163,
      payReason: 'calculated',
    });
    expect(calculateAnnualLeave({ ...baseInput, unusedLeaveDays: 0 })).toMatchObject({
      estimatedUnusedLeavePay: 0,
      payReason: 'no-unused-days',
    });
    expect(calculateAnnualLeave({ ...baseInput, monthlyOrdinaryWage: 0 })).toMatchObject({
      estimatedUnusedLeavePay: 0,
      payReason: 'no-wage',
    });
  });

  it('clamps a leap-day anniversary instead of overflowing into March', () => {
    expect(calculateAnnualLeave({ ...baseInput, hireDate: '2024-02-29', asOfDate: '2025-02-28' })).toMatchObject({
      completedServiceYears: 1,
      hireDateCurrentDays: 15,
      hireDateCurrentGrantDate: '2025-02-28',
    });
  });

  it('accepts unicode digits and rejects empty, Korean, emoji, invalid dates, and huge values', () => {
    expect(parseAnnualLeaveNumber('３，０００，０００')).toBe(3_000_000);
    expect(parseAnnualLeaveNumber('연차 15일')).toBeNull();
    expect(parseAnnualLeaveNumber('🏖️15')).toBeNull();
    expect(calculateAnnualLeave({ ...baseInput, hireDate: '' })).toBeNull();
    expect(calculateAnnualLeave({ ...baseInput, asOfDate: '2026-02-29' })).toBeNull();
    expect(calculateAnnualLeave({ ...baseInput, asOfDate: '2022-01-01' })).toBeNull();
    expect(calculateAnnualLeave({ ...baseInput, monthlyOrdinaryWage: MAX_MONEY + 1 })).toBeNull();
    expect(calculateAnnualLeave({ ...baseInput, weeklyHours: '한글' })).toBeNull();
    expect(calculateAnnualLeave({ ...baseInput, hireDate: '1900-01-01', asOfDate: '2026-10-22' })).toBeNull();
  });
});
