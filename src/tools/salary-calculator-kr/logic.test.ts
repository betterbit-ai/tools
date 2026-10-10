import { describe, expect, it } from 'vitest';
import { NATIONAL_PENSION_MAX_BASE, RATES_2026, calculateSalary, childWithholdingReduction, parseWon } from './logic';

describe('salary-calculator-kr', () => {
  it('calculates a 2026 monthly take-home using each statutory deduction', () => {
    expect(
      calculateSalary({
        annualSalary: 42_000_000,
        monthlyNonTaxable: 0,
        dependents: 1,
        childrenAge8To20: 0,
      }),
    ).toMatchObject({
      monthlyGross: 3_500_000,
      nationalPension: 166_250,
      healthInsurance: 125_820,
      longTermCareInsurance: 16_530,
      employmentInsurance: 31_500,
      incomeTax: 127_220,
      localIncomeTax: 12_720,
      totalDeductions: 480_040,
      monthlyTakeHome: 3_019_960,
    });
  });

  it('uses the official 2026 child reduction after looking up the family column', () => {
    const result = calculateSalary({
      annualSalary: 42_000_000,
      monthlyNonTaxable: 0,
      dependents: 4,
      childrenAge8To20: 2,
    });
    expect(childWithholdingReduction(2)).toBe(45_830);
    expect(result?.incomeTax).toBe(3_510);
    expect(result?.localIncomeTax).toBe(350);
  });

  it('caps pension contributions at the July 2026 standard-income ceiling', () => {
    const result = calculateSalary({
      annualSalary: 120_000_000,
      monthlyNonTaxable: 0,
      dependents: 1,
      childrenAge8To20: 0,
    });
    expect(result?.nationalPension).toBe(
      Math.floor((NATIONAL_PENSION_MAX_BASE * RATES_2026.nationalPension) / 10) * 10,
    );
  });

  it('parses ordinary, Korean-unit, and full-width Unicode money input', () => {
    expect(parseWon('5,000만원')).toBe(50_000_000);
    expect(parseWon('₩５，０００만원')).toBe(50_000_000);
    expect(parseWon('오천만원')).toBeNull();
  });

  it('rejects empty, impossible, and non-whole family input', () => {
    expect(
      calculateSalary({
        annualSalary: '',
        monthlyNonTaxable: 0,
        dependents: 1,
        childrenAge8To20: 0,
      }),
    ).toBeNull();
    expect(
      calculateSalary({
        annualSalary: 12_000_000,
        monthlyNonTaxable: 1_000_001,
        dependents: 1,
        childrenAge8To20: 0,
      }),
    ).toBeNull();
    expect(
      calculateSalary({
        annualSalary: 12_000_000,
        monthlyNonTaxable: 0,
        dependents: 1.5,
        childrenAge8To20: 0,
      }),
    ).toBeNull();
  });
});
