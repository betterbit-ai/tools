import { describe, expect, it } from 'vitest';
import { calculateSeverance, MAX_AMOUNT, parseSeveranceNumber } from './logic';

const baseInput = {
  startDate: '2023-01-01',
  lastWorkingDate: '2023-12-31',
  wages: [3_000_000, 3_000_000, 3_000_000],
  annualBonus: 0,
  annualLeavePay: 0,
  dailyOrdinaryWage: 0,
  weeklyHours: 40,
};

describe('calculateSeverance', () => {
  it('uses the day after the final working day and the preceding three calendar months', () => {
    const result = calculateSeverance(baseInput);

    expect(result).toMatchObject({
      retirementDate: '2024-01-01',
      averageWageStartDate: '2023-10-01',
      averageWageEndDate: '2023-12-31',
      serviceDays: 365,
      averageWageDays: 92,
      averageDailyWage: 9_000_000 / 92,
      eligible: true,
      severancePay: 2_934_783,
    });
  });

  it('adds one quarter of eligible annual bonus and annual-leave pay', () => {
    const result = calculateSeverance({
      ...baseInput,
      startDate: '2014-10-02',
      lastWorkingDate: '2017-09-15',
      wages: [2_000_000, 2_000_000, 3_080_000],
      annualBonus: 4_000_000,
      annualLeavePay: 300_000,
    });

    expect(result).toMatchObject({
      serviceDays: 1_080,
      averageWageDays: 92,
      includedBonus: 1_000_000,
      includedAnnualLeavePay: 75_000,
      averageWageTotal: 8_155_000,
      severancePay: 7_868_434,
    });
  });

  it('uses a higher known daily ordinary wage as the statutory floor', () => {
    const result = calculateSeverance({ ...baseInput, dailyOrdinaryWage: 100_000 });

    expect(result).toMatchObject({ applicableDailyWage: 100_000, severancePay: 3_000_000 });
  });

  it('returns a zero reference result when either statutory eligibility threshold is not met', () => {
    expect(calculateSeverance({ ...baseInput, startDate: '2023-01-02' })).toMatchObject({
      serviceDays: 364,
      eligible: false,
      severancePay: 0,
    });
    expect(calculateSeverance({ ...baseInput, weeklyHours: 14.99 })).toMatchObject({
      eligible: false,
      severancePay: 0,
    });
  });

  it('handles a leap-year month end without JavaScript date overflow', () => {
    const result = calculateSeverance({
      ...baseInput,
      startDate: '2023-01-01',
      lastWorkingDate: '2024-05-30',
    });

    expect(result).toMatchObject({
      retirementDate: '2024-05-31',
      averageWageStartDate: '2024-02-29',
      averageWageDays: 92,
    });
  });

  it('accepts pasted full-width digits but rejects empty, Korean text, emoji, invalid dates, and unsafe values', () => {
    expect(parseSeveranceNumber('３，０００，０００')).toBe(3_000_000);
    expect(parseSeveranceNumber('퇴직금 300만원')).toBeNull();
    expect(parseSeveranceNumber('💰3000000')).toBeNull();
    expect(calculateSeverance({ ...baseInput, startDate: '' })).toBeNull();
    expect(calculateSeverance({ ...baseInput, lastWorkingDate: '2023-02-29' })).toBeNull();
    expect(calculateSeverance({ ...baseInput, wages: [] })).toBeNull();
    expect(calculateSeverance({ ...baseInput, wages: [MAX_AMOUNT + 1, 0, 0] })).toBeNull();
    expect(
      calculateSeverance({
        ...baseInput,
        startDate: '1900-01-01',
        lastWorkingDate: '9999-12-30',
        wages: [MAX_AMOUNT, MAX_AMOUNT, MAX_AMOUNT],
        annualBonus: MAX_AMOUNT,
        annualLeavePay: MAX_AMOUNT,
      }),
    ).toBeNull();
  });
});
