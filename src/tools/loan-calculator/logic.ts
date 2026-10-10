/**
 * Pure calculations for loan-calculator. The schedule assumes monthly payments
 * and a nominal annual rate divided by 12; lenders can differ in daily interest
 * accrual and currency rounding, so this is an estimate rather than a quote.
 */

export type RepaymentMethod = 'amortized' | 'equalPrincipal' | 'bullet';

export interface LoanInput {
  principal: number | string;
  annualRate: number | string;
  termMonths: number | string;
  method: RepaymentMethod;
}

export interface Payment {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanResult {
  schedule: Payment[];
  totalPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  firstPayment: number;
  lastPayment: number;
}

export const MAX_TERM_MONTHS = 600;
const EPSILON = 1e-7;

/** Parses ordinary and pasted full-width numeric input, including grouped commas. */
export function parseLoanNumber(value: number | string): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const normalized = value.normalize('NFKC').trim().replaceAll(',', '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Returns a full amortization schedule, or null when an input is outside the supported range. */
export function calculateLoan(input: LoanInput): LoanResult | null {
  const principal = parseLoanNumber(input.principal);
  const annualRate = parseLoanNumber(input.annualRate);
  const termMonths = parseLoanNumber(input.termMonths);

  if (
    principal === null ||
    annualRate === null ||
    termMonths === null ||
    principal <= 0 ||
    principal > Number.MAX_SAFE_INTEGER ||
    annualRate < 0 ||
    annualRate > 100 ||
    !Number.isInteger(termMonths) ||
    termMonths < 1 ||
    termMonths > MAX_TERM_MONTHS
  ) {
    return null;
  }

  const monthlyRate = annualRate / 100 / 12;
  const schedule = buildSchedule(principal, monthlyRate, termMonths, input.method);
  if (!schedule || schedule.some((payment) => !isFinitePayment(payment))) return null;

  const totalPayment = sum(schedule, 'payment');
  const totalPrincipal = sum(schedule, 'principal');
  const totalInterest = sum(schedule, 'interest');
  if (![totalPayment, totalPrincipal, totalInterest].every(Number.isFinite)) return null;

  return {
    schedule,
    totalPayment,
    totalPrincipal,
    totalInterest,
    firstPayment: schedule[0].payment,
    lastPayment: schedule.at(-1)?.payment ?? 0,
  };
}

function buildSchedule(
  principal: number,
  monthlyRate: number,
  termMonths: number,
  method: RepaymentMethod,
): Payment[] | null {
  switch (method) {
    case 'amortized':
      return amortizedSchedule(principal, monthlyRate, termMonths);
    case 'equalPrincipal':
      return equalPrincipalSchedule(principal, monthlyRate, termMonths);
    case 'bullet':
      return bulletSchedule(principal, monthlyRate, termMonths);
    default:
      return null;
  }
}

function amortizedSchedule(principal: number, monthlyRate: number, termMonths: number): Payment[] {
  const standardPayment =
    monthlyRate === 0 ? principal / termMonths : (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -termMonths);
  const schedule: Payment[] = [];
  let balance = principal;

  for (let month = 1; month <= termMonths; month++) {
    const interest = balance * monthlyRate;
    const isLast = month === termMonths;
    const principalPaid = isLast ? balance : Math.min(balance, standardPayment - interest);
    const payment = principalPaid + interest;
    balance = closeToZero(balance - principalPaid);
    schedule.push({ month, payment, principal: principalPaid, interest, balance });
  }
  return schedule;
}

function equalPrincipalSchedule(principal: number, monthlyRate: number, termMonths: number): Payment[] {
  const regularPrincipal = principal / termMonths;
  const schedule: Payment[] = [];
  let balance = principal;

  for (let month = 1; month <= termMonths; month++) {
    const interest = balance * monthlyRate;
    const principalPaid = month === termMonths ? balance : regularPrincipal;
    const payment = principalPaid + interest;
    balance = closeToZero(balance - principalPaid);
    schedule.push({ month, payment, principal: principalPaid, interest, balance });
  }
  return schedule;
}

function bulletSchedule(principal: number, monthlyRate: number, termMonths: number): Payment[] {
  const schedule: Payment[] = [];
  for (let month = 1; month <= termMonths; month++) {
    const interest = principal * monthlyRate;
    const principalPaid = month === termMonths ? principal : 0;
    schedule.push({
      month,
      payment: principalPaid + interest,
      principal: principalPaid,
      interest,
      balance: month === termMonths ? 0 : principal,
    });
  }
  return schedule;
}

function sum(payments: Payment[], key: keyof Pick<Payment, 'payment' | 'principal' | 'interest'>): number {
  return payments.reduce((total, payment) => total + payment[key], 0);
}

function closeToZero(value: number): number {
  return Math.abs(value) < EPSILON ? 0 : value;
}

function isFinitePayment(payment: Payment): boolean {
  return Object.values(payment).every(Number.isFinite) && payment.payment >= 0 && payment.balance >= 0;
}
