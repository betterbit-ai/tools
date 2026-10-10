import { lookupBaseWithholding } from './withholding-table';

/** Employee-side rates for a workplace-insured employee, current from July 2026. */
export const RATES_2026 = {
  nationalPension: 0.0475,
  healthInsurance: 0.03595,
  longTermCareOfHealth: 0.1314,
  employmentInsurance: 0.009,
} as const;

export const NATIONAL_PENSION_MIN_BASE = 410_000;
export const NATIONAL_PENSION_MAX_BASE = 6_590_000;
export const MAX_ANNUAL_SALARY = 1_000_000_000;

export interface SalaryInput {
  annualSalary: number | string;
  monthlyNonTaxable: number | string;
  dependents: number | string;
  childrenAge8To20: number | string;
}

export interface SalaryResult {
  monthlyGross: number;
  monthlyTaxable: number;
  nationalPension: number;
  healthInsurance: number;
  longTermCareInsurance: number;
  employmentInsurance: number;
  incomeTax: number;
  localIncomeTax: number;
  totalDeductions: number;
  monthlyTakeHome: number;
  annualTakeHome: number;
}

/** Parses numbers pasted with comma grouping, full-width digits, ₩, 원, or 만원. */
export function parseWon(value: number | string): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const normalized = value.normalize('NFKC').trim().replaceAll(',', '').replaceAll(' ', '').replace(/^₩/, '');
  const match = normalized.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(만)?원?$/);
  if (!match) return null;

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed * (match[2] ? 10_000 : 1) : null;
}

/**
 * Calculates monthly withholding for a standard workplace-insured employee.
 * It assumes 12 equal monthly payments and 100% withholding; bonuses, year-end
 * settlement deductions, and employer-paid industrial-accident insurance differ.
 */
export function calculateSalary(input: SalaryInput): SalaryResult | null {
  const annualSalary = parseWon(input.annualSalary);
  const monthlyNonTaxable = parseWon(input.monthlyNonTaxable);
  const dependents = parseWholeNumber(input.dependents);
  const childrenAge8To20 = parseWholeNumber(input.childrenAge8To20);

  if (
    annualSalary === null ||
    monthlyNonTaxable === null ||
    dependents === null ||
    childrenAge8To20 === null ||
    annualSalary <= 0 ||
    annualSalary > MAX_ANNUAL_SALARY ||
    monthlyNonTaxable < 0 ||
    dependents < 1 ||
    dependents > 50 ||
    childrenAge8To20 < 0 ||
    childrenAge8To20 > dependents
  ) {
    return null;
  }

  const monthlyGross = annualSalary / 12;
  if (monthlyNonTaxable > monthlyGross) return null;

  const monthlyTaxable = monthlyGross - monthlyNonTaxable;
  const insuranceBase = Math.max(NATIONAL_PENSION_MIN_BASE, Math.min(monthlyTaxable, NATIONAL_PENSION_MAX_BASE));
  const nationalPension = roundDownToTen(insuranceBase * RATES_2026.nationalPension);
  const healthInsurance = roundDownToTen(monthlyTaxable * RATES_2026.healthInsurance);
  const longTermCareInsurance = roundDownToTen(healthInsurance * RATES_2026.longTermCareOfHealth);
  const employmentInsurance = roundDownToTen(monthlyTaxable * RATES_2026.employmentInsurance);
  const incomeTax = Math.max(
    0,
    lookupBaseWithholding(monthlyTaxable, dependents) - childWithholdingReduction(childrenAge8To20),
  );
  const localIncomeTax = roundDownToTen(incomeTax * 0.1);
  const totalDeductions =
    nationalPension + healthInsurance + longTermCareInsurance + employmentInsurance + incomeTax + localIncomeTax;
  const monthlyTakeHome = Math.max(0, Math.floor(monthlyGross - totalDeductions));

  return {
    monthlyGross: Math.floor(monthlyGross),
    monthlyTaxable: Math.floor(monthlyTaxable),
    nationalPension,
    healthInsurance,
    longTermCareInsurance,
    employmentInsurance,
    incomeTax,
    localIncomeTax,
    totalDeductions,
    monthlyTakeHome,
    annualTakeHome: monthlyTakeHome * 12,
  };
}

/** The higher child reduction applies to withholding from 1 March 2026. */
export function childWithholdingReduction(childrenAge8To20: number): number {
  if (childrenAge8To20 <= 0) return 0;
  if (childrenAge8To20 === 1) return 20_830;
  if (childrenAge8To20 === 2) return 45_830;
  return 45_830 + (childrenAge8To20 - 2) * 33_330;
}

function parseWholeNumber(value: number | string): number | null {
  const parsed = parseWon(value);
  return parsed === null || !Number.isInteger(parsed) ? null : parsed;
}

function roundDownToTen(value: number): number {
  return Math.floor((value + 1e-7) / 10) * 10;
}
