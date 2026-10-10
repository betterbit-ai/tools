import { describe, expect, it } from 'vitest';
import { calculateCompoundInterest, MAX_AMOUNT, MAX_ANNUAL_RATE, MAX_YEARS, parseCompoundNumber } from './logic';

const base = {
  principal: 1_000,
  monthlyContribution: 0,
  annualRate: 5,
  years: 2,
  frequency: 'annual' as const,
  contributionTiming: 'end' as const,
};

describe('calculateCompoundInterest', () => {
  it('uses the standard nominal compound-interest formula for a starting balance', () => {
    const result = calculateCompoundInterest(base);
    expect(result?.finalBalance).toBeCloseTo(1_102.5, 10);
    expect(result?.totalContributions).toBe(1_000);
    expect(result?.totalInterest).toBeCloseTo(102.5, 10);
    expect(result?.effectiveAnnualRate).toBeCloseTo(0.05, 10);
    expect(result?.schedule).toHaveLength(2);
    expect(result?.schedule[0]).toMatchObject({ year: 1, contributions: 1_000 });
    expect(result?.schedule[0]?.balance).toBeCloseTo(1_050, 10);
  });

  it('includes every monthly deposit and models beginning deposits for one extra month', () => {
    const end = calculateCompoundInterest({
      ...base,
      principal: 0,
      monthlyContribution: 100,
      annualRate: 12,
      years: 1,
      frequency: 'monthly',
    });
    const beginning = calculateCompoundInterest({
      ...base,
      principal: 0,
      monthlyContribution: 100,
      annualRate: 12,
      years: 1,
      frequency: 'monthly',
      contributionTiming: 'beginning',
    });

    expect(end?.totalContributions).toBe(1_200);
    expect(end?.finalBalance).toBeCloseTo(1_268.2503, 4);
    expect(beginning?.finalBalance).toBeCloseTo(1_280.9328, 4);
    expect(beginning?.finalBalance).toBeCloseTo((end?.finalBalance ?? 0) * 1.01, 8);
  });

  it('keeps a zero-rate recurring saving plan exact', () => {
    const result = calculateCompoundInterest({
      ...base,
      principal: 0,
      monthlyContribution: 75,
      annualRate: 0,
      years: 3,
    });
    expect(result).toMatchObject({
      finalBalance: 2_700,
      totalContributions: 2_700,
      totalInterest: 0,
      effectiveAnnualRate: 0,
    });
    expect(result?.schedule.at(-1)).toMatchObject({ year: 3, balance: 2_700, contributions: 2_700, interest: 0 });
  });

  it('rejects empty, negative, fractional, excessive, non-finite, and unknown option inputs', () => {
    expect(calculateCompoundInterest({ ...base, principal: '' })).toBeNull();
    expect(calculateCompoundInterest({ ...base, principal: -1 })).toBeNull();
    expect(calculateCompoundInterest({ ...base, monthlyContribution: -1 })).toBeNull();
    expect(calculateCompoundInterest({ ...base, annualRate: -0.1 })).toBeNull();
    expect(calculateCompoundInterest({ ...base, annualRate: MAX_ANNUAL_RATE + 0.01 })).toBeNull();
    expect(calculateCompoundInterest({ ...base, years: 1.5 })).toBeNull();
    expect(calculateCompoundInterest({ ...base, years: MAX_YEARS + 1 })).toBeNull();
    expect(calculateCompoundInterest({ ...base, principal: MAX_AMOUNT + 1 })).toBeNull();
    expect(calculateCompoundInterest({ ...base, annualRate: Infinity })).toBeNull();
    expect(calculateCompoundInterest({ ...base, frequency: 'weekly' as never })).toBeNull();
    expect(calculateCompoundInterest({ ...base, contributionTiming: 'later' as never })).toBeNull();
  });
});

describe('parseCompoundNumber', () => {
  it('accepts grouped and full-width Korean Unicode numbers', () => {
    expect(parseCompoundNumber('1,234,567.89')).toBe(1_234_567.89);
    expect(parseCompoundNumber('１２,３４５．６')).toBe(12_345.6);
  });

  it('rejects blank and non-numeric Unicode text', () => {
    expect(parseCompoundNumber('')).toBeNull();
    expect(parseCompoundNumber('복리 💸')).toBeNull();
  });
});
