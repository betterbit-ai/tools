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
/** Employee half of the KRW 20,160 monthly workplace health-insurance minimum. */
export const HEALTH_INSURANCE_MIN_EMPLOYEE_PREMIUM = 10_080;
export const MAX_ANNUAL_SALARY = 1_000_000_000;

export const WITHHOLDING_RATES = [80, 100, 120] as const;
export type WithholdingRate = (typeof WITHHOLDING_RATES)[number];

export interface SalaryInput {
  annualSalary: number | string;
  monthlyNonTaxable: number | string;
  dependents: number | string;
  childrenAge8To20: number | string;
  withholdingRate: WithholdingRate;
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

/** Korean money units people type instead of nine digits: 만, 천만, 억, and so on. */
const KOREAN_UNITS: Record<string, number> = {
  억: 100_000_000,
  천만: 10_000_000,
  백만: 1_000_000,
  만: 10_000,
  천: 1_000,
  백: 100,
  십: 10,
};
const UNIT_AT_START = /^(\d+(?:\.\d*)?)?(천만|백만|억|만|천|백|십)/;

/**
 * Parses the ways Korean payslips and search results write an amount: plain digits,
 * comma grouping, full-width digits, ₩/원, and units such as 5,000만, 3천만, 1억 5천만.
 * A unit with no number in front of it (만원) means one of that unit.
 */
export function parseWon(value: number | string): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const normalized = value
    .normalize('NFKC')
    .trim()
    .replaceAll(',', '')
    .replaceAll(' ', '')
    .replace(/^[₩￦]/, '')
    .replace(/원$/, '');
  if (!normalized) return null;

  const plain = normalized.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))$/);
  if (plain) {
    const parsed = Number(plain[1]);
    return Number.isFinite(parsed) ? parsed : null;
  }

  // Unit expressions are read left to right and summed, so "1억 5천만" is 150,000,000.
  // Anything the loop cannot consume (letters, stray symbols) makes the whole input unreadable
  // rather than silently dropping part of it.
  let rest = normalized;
  let total = 0;
  while (rest) {
    const part = rest.match(UNIT_AT_START);
    if (!part) return null;
    const amount = part[1] === undefined ? 1 : Number(part[1]);
    if (!Number.isFinite(amount)) return null;
    total += amount * KOREAN_UNITS[part[2]];
    rest = rest.slice(part[0].length);
  }
  return total;
}

/**
 * Calculates monthly withholding for a standard workplace-insured employee.
 * It assumes 12 equal monthly payments and 100% withholding; bonuses, year-end
 * settlement deductions, and employer-paid industrial-accident insurance differ.
 */
export function calculateSalary(input: SalaryInput): SalaryResult | null {
  if (explainSalaryInput(input) !== null) return null;

  const annualSalary = parseWon(input.annualSalary)!;
  const monthlyNonTaxable = parseWon(input.monthlyNonTaxable)!;
  const dependents = parseWholeNumber(input.dependents)!;
  const childrenAge8To20 = parseWholeNumber(input.childrenAge8To20)!;

  const monthlyGross = annualSalary / 12;
  const monthlyTaxable = monthlyGross - monthlyNonTaxable;
  const insuranceBase = Math.max(NATIONAL_PENSION_MIN_BASE, Math.min(monthlyTaxable, NATIONAL_PENSION_MAX_BASE));
  const nationalPension = roundDownToTen(insuranceBase * RATES_2026.nationalPension);
  const healthInsurance = Math.max(
    HEALTH_INSURANCE_MIN_EMPLOYEE_PREMIUM,
    roundDownToTen(monthlyTaxable * RATES_2026.healthInsurance),
  );
  const longTermCareInsurance = roundDownToTen(healthInsurance * RATES_2026.longTermCareOfHealth);
  const employmentInsurance = roundDownToTen(monthlyTaxable * RATES_2026.employmentInsurance);
  const incomeTax = Math.max(
    0,
    Math.floor(
      (lookupBaseWithholding(monthlyTaxable, dependents) - childWithholdingReduction(childrenAge8To20)) *
        (input.withholdingRate / 100),
    ),
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

/** Which field blocks the calculation, so the page can name it instead of a generic error. */
export type SalaryIssue =
  | 'annual-salary'
  | 'annual-salary-too-large'
  | 'non-taxable'
  | 'non-taxable-over-pay'
  | 'dependents'
  | 'children'
  | 'children-over-dependents'
  | 'withholding-rate';

export function explainSalaryInput(input: SalaryInput): SalaryIssue | null {
  const annualSalary = parseWon(input.annualSalary);
  const monthlyNonTaxable = parseWon(input.monthlyNonTaxable);
  const dependents = parseWholeNumber(input.dependents);
  const childrenAge8To20 = parseWholeNumber(input.childrenAge8To20);

  if (annualSalary === null || annualSalary <= 0) return 'annual-salary';
  if (annualSalary > MAX_ANNUAL_SALARY) return 'annual-salary-too-large';
  if (monthlyNonTaxable === null || monthlyNonTaxable < 0) return 'non-taxable';
  if (monthlyNonTaxable > annualSalary / 12) return 'non-taxable-over-pay';
  if (dependents === null || dependents < 1 || dependents > 50) return 'dependents';
  if (childrenAge8To20 === null || childrenAge8To20 < 0) return 'children';
  if (childrenAge8To20 > dependents) return 'children-over-dependents';
  if (!WITHHOLDING_RATES.includes(input.withholdingRate)) return 'withholding-rate';
  return null;
}

function parseWholeNumber(value: number | string): number | null {
  const parsed = parseWon(value);
  return parsed === null || !Number.isInteger(parsed) ? null : parsed;
}

function roundDownToTen(value: number): number {
  return Math.floor((value + 1e-7) / 10) * 10;
}
