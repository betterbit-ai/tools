import { describe, expect, it } from 'vitest';
import { calculateLoan, MAX_TERM_MONTHS, parseLoanNumber, type RepaymentMethod } from './logic';

const base = { principal: 10_000, annualRate: 6, termMonths: 12 };

function loan(method: RepaymentMethod) {
  const result = calculateLoan({ ...base, method });
  if (!result) throw new Error('expected a valid calculation');
  return result;
}

describe('calculateLoan', () => {
  it('calculates the monthly-payment amortization formula and settles the balance exactly', () => {
    const result = loan('amortized');
    expect(result.firstPayment).toBeCloseTo(860.6643, 4);
    expect(result.totalInterest).toBeCloseTo(327.9716, 4);
    expect(result.totalPayment).toBeCloseTo(10_327.9716, 4);
    expect(result.schedule).toHaveLength(12);
    expect(result.schedule.at(-1)?.balance).toBe(0);
    expect(result.totalPrincipal).toBeCloseTo(10_000, 8);
  });

  it('uses a fixed principal payment and declining payment for equal-principal repayment', () => {
    const result = loan('equalPrincipal');
    expect(result.firstPayment).toBeCloseTo(883.3333, 4);
    expect(result.lastPayment).toBeCloseTo(837.5, 4);
    expect(result.totalInterest).toBeCloseTo(325, 6);
    expect(result.totalPrincipal).toBeCloseTo(10_000, 8);
  });

  it('charges interest only until the final principal payment for bullet repayment', () => {
    const result = loan('bullet');
    expect(result.firstPayment).toBe(50);
    expect(result.lastPayment).toBe(10_050);
    expect(result.totalInterest).toBe(600);
    expect(result.schedule[0]).toMatchObject({ principal: 0, interest: 50, balance: 10_000 });
  });

  it('handles a zero interest rate across every repayment method', () => {
    for (const method of ['amortized', 'equalPrincipal', 'bullet'] as const) {
      const result = calculateLoan({ principal: 1200, annualRate: 0, termMonths: 12, method });
      expect(result?.totalInterest).toBe(0);
      expect(result?.totalPayment).toBe(1200);
      expect(result?.schedule.at(-1)?.balance).toBe(0);
    }
  });

  it('rejects empty, zero, negative, non-finite, oversized, and fractional-month inputs', () => {
    expect(calculateLoan({ ...base, principal: '', method: 'amortized' })).toBeNull();
    expect(calculateLoan({ ...base, principal: 0, method: 'amortized' })).toBeNull();
    expect(calculateLoan({ ...base, annualRate: -0.1, method: 'amortized' })).toBeNull();
    expect(calculateLoan({ ...base, annualRate: 100.1, method: 'amortized' })).toBeNull();
    expect(calculateLoan({ ...base, principal: Infinity, method: 'amortized' })).toBeNull();
    expect(calculateLoan({ ...base, principal: 1e308, method: 'amortized' })).toBeNull();
    expect(calculateLoan({ ...base, termMonths: 1.5, method: 'amortized' })).toBeNull();
    expect(calculateLoan({ ...base, termMonths: MAX_TERM_MONTHS + 1, method: 'amortized' })).toBeNull();
  });
});

describe('parseLoanNumber', () => {
  it('accepts grouped and full-width Korean Unicode number input', () => {
    expect(parseLoanNumber('1,234,567.89')).toBe(1_234_567.89);
    expect(parseLoanNumber('１２,３４５．６')).toBe(12_345.6);
  });

  it('rejects blank and non-numeric Unicode text', () => {
    expect(parseLoanNumber('')).toBeNull();
    expect(parseLoanNumber('대출 💸')).toBeNull();
  });
});
