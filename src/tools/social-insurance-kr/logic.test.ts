import { describe, expect, it } from 'vitest';
import { SOCIAL_INSURANCE_RULES_2026, calculateSocialInsurance, parseWon } from './logic';

const standardInput = {
  pay: 3_000_000,
  payPeriod: 'monthly' as const,
  monthlyNonTaxable: 0,
  pensionPeriod: 'second-half' as const,
  workplaceSize: 'under150' as const,
  industrialAccidentRatePercent: 0,
  coverage: { pension: true, health: true, employment: true },
};

describe('social-insurance-kr', () => {
  it('splits a realistic monthly salary into employee and employer contributions', () => {
    expect(calculateSocialInsurance(standardInput)).toMatchObject({
      monthlyGross: 3_000_000,
      remunerationBase: 3_000_000,
      pensionBase: 3_000_000,
      employee: {
        pension: 142_500,
        health: 107_850,
        longTermCare: 14_170,
        employment: 27_000,
        total: 291_520,
      },
      employer: {
        pension: 142_500,
        health: 107_850,
        longTermCare: 14_170,
        employment: 27_000,
        employmentStability: 7_500,
        industrialAccident: 0,
        total: 299_020,
      },
      combinedTotal: 590_540,
      employerLaborCost: 3_299_020,
    });
  });

  it('converts annual pay, excludes monthly non-taxable pay, and adds a custom accident rate', () => {
    const result = calculateSocialInsurance({
      ...standardInput,
      pay: 38_400_000,
      payPeriod: 'annual',
      monthlyNonTaxable: 200_000,
      industrialAccidentRatePercent: 1.47,
    });

    expect(result).toMatchObject({
      monthlyGross: 3_200_000,
      remunerationBase: 3_000_000,
      employee: { total: 291_520 },
      employer: { industrialAccident: 44_100, total: 343_120 },
      employerLaborCost: 3_543_120,
    });
    expect(result?.reasons).toContain('annual-converted');
    expect(result?.reasons).toContain('non-taxable-excluded');
    expect(result?.reasons).toContain('industrial-rate-entered');
  });

  it('applies the correct pension limits on both sides of the July 2026 boundary', () => {
    const firstHalf = calculateSocialInsurance({ ...standardInput, pay: 10_000_000, pensionPeriod: 'first-half' });
    const secondHalf = calculateSocialInsurance({ ...standardInput, pay: 10_000_000, pensionPeriod: 'second-half' });
    const lowSecondHalf = calculateSocialInsurance({ ...standardInput, pay: 200_000 });

    expect(firstHalf?.pensionBase).toBe(6_370_000);
    expect(firstHalf?.employee.pension).toBe(302_570);
    expect(secondHalf?.pensionBase).toBe(6_590_000);
    expect(secondHalf?.employee.pension).toBe(313_020);
    expect(lowSecondHalf?.pensionBase).toBe(410_000);
    expect(lowSecondHalf?.employee.pension).toBe(19_470);
    expect(secondHalf?.reasons).toContain('pension-maximum');
    expect(lowSecondHalf?.reasons).toContain('pension-minimum');
  });

  it('rounds the pension base down to a thousand and every premium down to ten won', () => {
    const result = calculateSocialInsurance({ ...standardInput, pay: 3_000_999 });
    expect(result?.pensionBase).toBe(3_000_000);
    expect(result?.employee.pension).toBe(142_500);
    expect(result?.employee.health).toBe(107_880);
    expect(result?.reasons).toContain('pension-thousand-floor');
  });

  it('applies the 2026 workplace health premium minimum and maximum before long-term care', () => {
    const low = calculateSocialInsurance({ ...standardInput, pay: 100_000 });
    const high = calculateSocialInsurance({ ...standardInput, pay: 1_000_000_000 });

    expect(low?.employee.health).toBe(SOCIAL_INSURANCE_RULES_2026.health.totalPremiumMinimum / 2);
    expect(low?.employee.longTermCare).toBe(1_320);
    expect(high?.employee.health).toBe(SOCIAL_INSURANCE_RULES_2026.health.totalPremiumMaximum / 2);
    expect(low?.reasons).toContain('health-minimum');
    expect(high?.reasons).toContain('health-maximum');
  });

  it('does not hide a negative remainder when minimum premiums exceed very low pay', () => {
    const result = calculateSocialInsurance({ ...standardInput, pay: 1 });
    expect(result?.employee.total).toBe(30_870);
    expect(result?.payAfterEmployeeInsurance).toBe(-30_869);
  });

  it('uses each employer workplace-size rate', () => {
    expect(
      calculateSocialInsurance({ ...standardInput, workplaceSize: 'under150' })?.employer.employmentStability,
    ).toBe(7_500);
    expect(
      calculateSocialInsurance({ ...standardInput, workplaceSize: 'priority150Plus' })?.employer.employmentStability,
    ).toBe(13_500);
    expect(
      calculateSocialInsurance({ ...standardInput, workplaceSize: 'from150To999' })?.employer.employmentStability,
    ).toBe(19_500);
    expect(
      calculateSocialInsurance({ ...standardInput, workplaceSize: 'atLeast1000' })?.employer.employmentStability,
    ).toBe(25_500);
  });

  it('lets users exclude insurance lines when their actual enrollment differs', () => {
    const result = calculateSocialInsurance({
      ...standardInput,
      coverage: { pension: false, health: false, employment: false },
    });
    expect(result?.employee.total).toBe(0);
    expect(result?.employer.total).toBe(0);
    expect(result?.reasons).toEqual(
      expect.arrayContaining(['pension-excluded', 'health-excluded', 'employment-excluded']),
    );
  });

  it('parses Korean money conventions and full-width Unicode safely', () => {
    expect(parseWon('300만원')).toBe(3_000_000);
    expect(parseWon('₩３，２００，０００원')).toBe(3_200_000);
    expect(parseWon('삼백만원')).toBeNull();
    expect(parseWon('💸')).toBeNull();
  });

  it('rejects empty, negative, excessive, and inconsistent input', () => {
    expect(calculateSocialInsurance({ ...standardInput, pay: '' })).toBeNull();
    expect(calculateSocialInsurance({ ...standardInput, pay: -1 })).toBeNull();
    expect(calculateSocialInsurance({ ...standardInput, monthlyNonTaxable: 3_000_001 })).toBeNull();
    expect(calculateSocialInsurance({ ...standardInput, industrialAccidentRatePercent: 101 })).toBeNull();
    expect(calculateSocialInsurance({ ...standardInput, pay: 1_000_000_001 })).toBeNull();
  });
});
