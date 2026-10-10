/**
 * Pure compound-interest projections. The annual rate is nominal and is
 * converted to an equivalent monthly multiplier so monthly deposits can be
 * projected consistently for each available compounding frequency.
 */

export type CompoundFrequency = 'annual' | 'quarterly' | 'monthly' | 'daily';
export type ContributionTiming = 'beginning' | 'end';

export interface CompoundInterestInput {
  principal: number | string;
  monthlyContribution: number | string;
  annualRate: number | string;
  years: number | string;
  frequency: CompoundFrequency;
  contributionTiming: ContributionTiming;
}

export interface YearProjection {
  year: number;
  balance: number;
  contributions: number;
  interest: number;
}

export interface CompoundInterestResult {
  finalBalance: number;
  totalContributions: number;
  totalInterest: number;
  effectiveAnnualRate: number;
  schedule: YearProjection[];
}

export const MAX_YEARS = 100;
export const MAX_AMOUNT = 1_000_000_000_000;
export const MAX_ANNUAL_RATE = 100;

const COMPOUNDS_PER_YEAR: Record<CompoundFrequency, number> = {
  annual: 1,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

/** Parses ordinary and pasted full-width numeric input, including grouped commas. */
export function parseCompoundNumber(value: number | string): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const normalized = value.normalize('NFKC').trim().replaceAll(',', '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Projects a starting balance and monthly deposits. Deposits are added at the
 * selected end or beginning of each month; the rate remains constant and fees,
 * taxes, and account-specific rounding are intentionally excluded.
 */
export function calculateCompoundInterest(input: CompoundInterestInput): CompoundInterestResult | null {
  const principal = parseCompoundNumber(input.principal);
  const monthlyContribution = parseCompoundNumber(input.monthlyContribution);
  const annualRate = parseCompoundNumber(input.annualRate);
  const years = parseCompoundNumber(input.years);

  if (
    principal === null ||
    monthlyContribution === null ||
    annualRate === null ||
    years === null ||
    principal < 0 ||
    principal > MAX_AMOUNT ||
    monthlyContribution < 0 ||
    monthlyContribution > MAX_AMOUNT ||
    annualRate < 0 ||
    annualRate > MAX_ANNUAL_RATE ||
    !Number.isInteger(years) ||
    years < 1 ||
    years > MAX_YEARS ||
    !isCompoundFrequency(input.frequency) ||
    !isContributionTiming(input.contributionTiming)
  ) {
    return null;
  }

  const compoundsPerYear = COMPOUNDS_PER_YEAR[input.frequency];
  const periodicMultiplier = 1 + annualRate / 100 / compoundsPerYear;
  const monthlyMultiplier = periodicMultiplier ** (compoundsPerYear / 12);
  const effectiveAnnualRate = periodicMultiplier ** compoundsPerYear - 1;
  if (![monthlyMultiplier, effectiveAnnualRate].every(Number.isFinite)) return null;

  let balance = principal;
  let contributions = principal;
  const schedule: YearProjection[] = [];
  const months = years * 12;

  for (let month = 1; month <= months; month++) {
    if (input.contributionTiming === 'beginning') {
      balance += monthlyContribution;
      contributions += monthlyContribution;
      balance *= monthlyMultiplier;
    } else {
      balance *= monthlyMultiplier;
      balance += monthlyContribution;
      contributions += monthlyContribution;
    }

    if (!Number.isFinite(balance) || !Number.isFinite(contributions)) return null;
    if (month % 12 === 0) {
      schedule.push({
        year: month / 12,
        balance,
        contributions,
        interest: balance - contributions,
      });
    }
  }

  const totalInterest = balance - contributions;
  if (!Number.isFinite(totalInterest)) return null;

  return {
    finalBalance: balance,
    totalContributions: contributions,
    totalInterest,
    effectiveAnnualRate,
    schedule,
  };
}

function isCompoundFrequency(value: unknown): value is CompoundFrequency {
  return value === 'annual' || value === 'quarterly' || value === 'monthly' || value === 'daily';
}

function isContributionTiming(value: unknown): value is ContributionTiming {
  return value === 'beginning' || value === 'end';
}
