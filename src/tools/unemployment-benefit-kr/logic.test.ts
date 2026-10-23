import { describe, expect, it } from 'vitest';
import { RULES_2026, benefitDaysFor, calculateUnemploymentBenefit, parseKrw } from './logic';

const baseInput = {
  averageDailyWage: 100_000,
  ordinaryDailyWage: 0,
  scheduledHoursPerDay: 8,
  insuranceMonths: 48,
  ageGroup: 'under-50' as const,
  insuredUnitDays: 180,
  eligibleSeparation: true,
  seekingWork: true,
};

describe('unemployment-benefit-kr', () => {
  it('applies the 2026 60% rate, 8-hour floor, cap, and prescribed days', () => {
    expect(calculateUnemploymentBenefit(baseInput)).toMatchObject({
      dailyWageBenefit: 60_000,
      applicableDailyBase: 100_000,
      minimumDailyBenefit: 66_048,
      maximumDailyBenefit: 68_100,
      dailyBenefit: 66_048,
      appliedDailyRule: 'floor',
      benefitDays: 180,
      estimatedTotal: 11_888_640,
      eligibility: { likelyEligible: true },
    });
  });

  it('uses the exact 2026 cap when 60% of daily wage is higher', () => {
    const result = calculateUnemploymentBenefit({ ...baseInput, averageDailyWage: 200_000 });
    expect(result).toMatchObject({
      applicableDailyBase: RULES_2026.maximumDailyBase,
      dailyWageBenefit: RULES_2026.maximumDailyBenefit,
      dailyBenefit: RULES_2026.maximumDailyBenefit,
      appliedDailyRule: 'cap',
    });
  });

  it('uses a known higher ordinary daily wage as the statutory base', () => {
    const result = calculateUnemploymentBenefit({ ...baseInput, ordinaryDailyWage: 112_000 });
    expect(result).toMatchObject({
      applicableDailyBase: 112_000,
      dailyWageBenefit: 67_200,
      dailyBenefit: 67_200,
      appliedDailyRule: 'wage',
    });
  });

  it('uses a proportionate daily floor for part-time work', () => {
    const result = calculateUnemploymentBenefit({ ...baseInput, averageDailyWage: 20_000, scheduledHoursPerDay: 4 });
    expect(result).toMatchObject({ minimumDailyBenefit: 33_024, dailyBenefit: 33_024, appliedDailyRule: 'floor' });
  });

  it('keeps the wage-based amount in the narrow band between floor and cap', () => {
    const result = calculateUnemploymentBenefit({ ...baseInput, averageDailyWage: 112_000 });
    expect(result).toMatchObject({ dailyBenefit: 67_200, appliedDailyRule: 'wage' });
  });

  it('uses every age and coverage boundary in the statutory day table', () => {
    expect(benefitDaysFor(11, 'under-50')).toBe(120);
    expect(benefitDaysFor(12, 'under-50')).toBe(150);
    expect(benefitDaysFor(35, '50-or-disabled')).toBe(180);
    expect(benefitDaysFor(36, 'under-50')).toBe(180);
    expect(benefitDaysFor(60, '50-or-disabled')).toBe(240);
    expect(benefitDaysFor(120, 'under-50')).toBe(240);
    expect(benefitDaysFor(120, '50-or-disabled')).toBe(270);
  });

  it('marks the high-level statutory checks independently', () => {
    const result = calculateUnemploymentBenefit({
      ...baseInput,
      insuredUnitDays: 179,
      eligibleSeparation: false,
      seekingWork: false,
    });
    expect(result?.eligibility).toEqual({
      insuredDays: false,
      separation: false,
      seekingWork: false,
      likelyEligible: false,
    });
  });

  it('parses grouped, Korean-unit, and full-width Unicode KRW amounts', () => {
    expect(parseKrw('5,000만원')).toBe(50_000_000);
    expect(parseKrw('₩６６，０４８원')).toBe(66_048);
    expect(parseKrw('실업급여 6만원')).toBeNull();
  });

  it('rejects empty, impossible, fractional, and excessively large input', () => {
    expect(calculateUnemploymentBenefit({ ...baseInput, averageDailyWage: '' })).toBeNull();
    expect(calculateUnemploymentBenefit({ ...baseInput, ordinaryDailyWage: -1 })).toBeNull();
    expect(calculateUnemploymentBenefit({ ...baseInput, scheduledHoursPerDay: 0 })).toBeNull();
    expect(calculateUnemploymentBenefit({ ...baseInput, scheduledHoursPerDay: 4.5 })).toBeNull();
    expect(calculateUnemploymentBenefit({ ...baseInput, insuranceMonths: 1_201 })).toBeNull();
  });
});
