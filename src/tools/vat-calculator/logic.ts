/** Pure VAT calculations. This module deliberately has no browser or UI dependencies. */

export type VatMode = 'add' | 'remove';

export interface VatInput {
  /** Net amount when adding tax; tax-inclusive total when removing it. */
  amount: number | string;
  /** Percentage rate, such as 10 for 10%. */
  rate: number | string;
  mode: VatMode;
}

export interface VatResult {
  net: number;
  tax: number;
  gross: number;
}

/** Guardrail against unsafe, misleading display values rather than a tax-law limit. */
export const MAX_AMOUNT = 1_000_000_000_000_000;
export const MAX_RATE = 100;

/**
 * Parses values pasted from ordinary spreadsheets and Korean full-width number
 * keyboards. Currency symbols and words are deliberately rejected: this tool
 * accepts a number in whatever currency the visitor is already using.
 */
export function parseVatNumber(value: number | string): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const normalized = value.normalize('NFKC').trim().replaceAll(',', '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Calculates a consistent net, VAT, and gross breakdown. A tax-inclusive total
 * is divided by (1 + rate / 100); subtracting the percentage from the total is
 * not the inverse operation.
 */
export function calculateVat(input: VatInput): VatResult | null {
  const amount = parseVatNumber(input.amount);
  const rate = parseVatNumber(input.rate);

  if (
    amount === null ||
    rate === null ||
    amount < 0 ||
    amount > MAX_AMOUNT ||
    rate < 0 ||
    rate > MAX_RATE ||
    (input.mode !== 'add' && input.mode !== 'remove')
  ) {
    return null;
  }

  const multiplier = 1 + rate / 100;
  const net = input.mode === 'add' ? amount : amount / multiplier;
  const gross = input.mode === 'add' ? amount * multiplier : amount;
  const tax = gross - net;

  if (![net, tax, gross].every(Number.isFinite)) return null;

  return {
    net: roundVatNumber(net),
    tax: roundVatNumber(tax),
    gross: roundVatNumber(gross),
  };
}

/** Keeps display values stable while preserving more precision than currency rounding. */
function roundVatNumber(value: number): number {
  const factor = 10 ** 10;
  return Math.round((value + Number.EPSILON * Math.sign(value || 1)) * factor) / factor;
}
