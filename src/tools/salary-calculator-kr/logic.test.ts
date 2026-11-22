import { describe, expect, it } from 'vitest';
import {
  HEALTH_INSURANCE_MIN_EMPLOYEE_PREMIUM,
  NATIONAL_PENSION_MAX_BASE,
  RATES_2026,
  calculateSalary,
  childWithholdingReduction,
  explainSalaryInput,
  parseWon,
} from './logic';

describe('salary-calculator-kr', () => {
  it('calculates a 2026 monthly take-home using each statutory deduction', () => {
    expect(
      calculateSalary({
        annualSalary: 42_000_000,
        monthlyNonTaxable: 0,
        dependents: 1,
        childrenAge8To20: 0,
        withholdingRate: 100,
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
      withholdingRate: 100,
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
      withholdingRate: 100,
    });
    expect(result?.nationalPension).toBe(
      Math.floor((NATIONAL_PENSION_MAX_BASE * RATES_2026.nationalPension) / 10) * 10,
    );
  });

  it('applies the statutory workplace health-insurance minimum to low monthly pay', () => {
    const result = calculateSalary({
      annualSalary: 1_200_000,
      monthlyNonTaxable: 0,
      dependents: 1,
      childrenAge8To20: 0,
      withholdingRate: 100,
    });
    expect(result?.healthInsurance).toBe(HEALTH_INSURANCE_MIN_EMPLOYEE_PREMIUM);
    expect(result?.longTermCareInsurance).toBe(1_320);
  });

  it('applies the elected 80%, 100%, or 120% rate after the child reduction', () => {
    const input = {
      annualSalary: 42_000_000,
      monthlyNonTaxable: 0,
      dependents: 4,
      childrenAge8To20: 2,
    };
    expect(calculateSalary({ ...input, withholdingRate: 80 })?.incomeTax).toBe(2_808);
    expect(calculateSalary({ ...input, withholdingRate: 100 })?.incomeTax).toBe(3_510);
    expect(calculateSalary({ ...input, withholdingRate: 120 })?.incomeTax).toBe(4_212);
  });

  it('parses ordinary, Korean-unit, and full-width Unicode money input', () => {
    expect(parseWon('5,000만원')).toBe(50_000_000);
    expect(parseWon('₩５，０００만원')).toBe(50_000_000);
    expect(parseWon('오천만원')).toBeNull();
  });

  it('reads the units people type instead of nine digits', () => {
    // What a Korean searcher types into a salary field.
    expect(parseWon('5000만')).toBe(50_000_000);
    expect(parseWon('5,000만')).toBe(50_000_000);
    expect(parseWon('3천만')).toBe(30_000_000);
    expect(parseWon('3천만원')).toBe(30_000_000);
    expect(parseWon('1억')).toBe(100_000_000);
    expect(parseWon('1억 5천만')).toBe(150_000_000);
    expect(parseWon('1억2천')).toBe(100_002_000);
    expect(parseWon('1.5억')).toBe(150_000_000);
    expect(parseWon('2백만')).toBe(2_000_000);
    expect(parseWon('만원')).toBe(10_000);
    expect(parseWon('50,000,000')).toBe(50_000_000);
    expect(parseWon('50000000원')).toBe(50_000_000);
    expect(parseWon('0')).toBe(0);
    // Text it cannot read stays unreadable instead of being read as a smaller number.
    expect(parseWon('5,000원만')).toBeNull();
    expect(parseWon('오천만')).toBeNull();
    expect(parseWon('abc')).toBeNull();
    expect(parseWon('')).toBeNull();
    expect(parseWon(' ')).toBeNull();
  });

  it('names the field that blocks the calculation', () => {
    const base = {
      annualSalary: 42_000_000,
      monthlyNonTaxable: 0,
      dependents: 1,
      childrenAge8To20: 0,
      withholdingRate: 100 as const,
    };
    expect(explainSalaryInput(base)).toBeNull();
    expect(explainSalaryInput({ ...base, annualSalary: '' })).toBe('annual-salary');
    expect(explainSalaryInput({ ...base, annualSalary: '5,000원만' })).toBe('annual-salary');
    expect(explainSalaryInput({ ...base, annualSalary: 2_000_000_000 })).toBe('annual-salary-too-large');
    expect(explainSalaryInput({ ...base, monthlyNonTaxable: '' })).toBe('non-taxable');
    expect(explainSalaryInput({ ...base, monthlyNonTaxable: 4_000_000 })).toBe('non-taxable-over-pay');
    expect(explainSalaryInput({ ...base, dependents: 0 })).toBe('dependents');
    expect(explainSalaryInput({ ...base, childrenAge8To20: 2 })).toBe('children-over-dependents');
    expect(explainSalaryInput({ ...base, childrenAge8To20: 1.5 })).toBe('children');
    expect(calculateSalary(base)).not.toBeNull();
  });

  it('takes a unit entry exactly as the digits it stands for', () => {
    const digits = calculateSalary({
      annualSalary: 50_000_000,
      monthlyNonTaxable: 0,
      dependents: 1,
      childrenAge8To20: 0,
      withholdingRate: 100,
    });
    for (const annualSalary of ['5,000만', '5000만', '50,000,000', '₩50,000,000']) {
      expect(
        calculateSalary({
          annualSalary,
          monthlyNonTaxable: 0,
          dependents: 1,
          childrenAge8To20: 0,
          withholdingRate: 100,
        }),
      ).toEqual(digits);
    }
  });

  it('rejects empty, impossible, and non-whole family input', () => {
    expect(
      calculateSalary({
        annualSalary: '',
        monthlyNonTaxable: 0,
        dependents: 1,
        childrenAge8To20: 0,
        withholdingRate: 100,
      }),
    ).toBeNull();
    expect(
      calculateSalary({
        annualSalary: 12_000_000,
        monthlyNonTaxable: 1_000_001,
        dependents: 1,
        childrenAge8To20: 0,
        withholdingRate: 100,
      }),
    ).toBeNull();
    expect(
      calculateSalary({
        annualSalary: 12_000_000,
        monthlyNonTaxable: 0,
        dependents: 1.5,
        childrenAge8To20: 0,
        withholdingRate: 100,
      }),
    ).toBeNull();
    expect(
      calculateSalary({
        annualSalary: 12_000_000,
        monthlyNonTaxable: 0,
        dependents: 1,
        childrenAge8To20: 0,
        withholdingRate: 90 as 80,
      }),
    ).toBeNull();
  });
});
