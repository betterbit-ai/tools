/**
 * Pure logic for exchange-rate — no DOM, no Preact.
 *
 * Rates are entered as target-currency units for one source-currency unit. This
 * calculator intentionally does not fetch a market rate: it evaluates the quote
 * a bank, card network, or exchange counter has actually shown the visitor.
 */

export interface ExchangeInput {
  amount: number;
  rate: number;
  /** Positive values are a provider fee/markup; negative values are a discount. */
  adjustmentPercent: number;
  /** A separately stated fixed fee, denominated in the target currency. */
  fixedFee: number;
}

export interface ExchangeResult {
  gross: number;
  adjustment: number;
  totalCharges: number;
  received: number;
  effectiveRate: number | null;
}

/**
 * Reads a pasted monetary or rate value. Full-width digits/punctuation and
 * Korean won notation are accepted; words, emoji, and non-finite values are not.
 */
export function parseExchangeNumber(value: string, options: { allowNegative?: boolean } = {}): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = Array.from(trimmed)
    .map((character) => {
      const code = character.charCodeAt(0);
      if (code >= 0xff10 && code <= 0xff19) return String(code - 0xff10);
      if (character === '．') return '.';
      if (character === '，') return ',';
      if (character === '－') return '-';
      return character;
    })
    .join('')
    .replace(/[\s,_$€£¥₩원]/g, '');

  const match = normalized.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(만)?$/);
  if (!match) return null;

  const result = Number(match[1]) * (match[2] ? 10_000 : 1);
  if (!Number.isFinite(result) || (!options.allowNegative && result < 0)) return null;
  return result;
}

/** Returns the quotation needed after reversing source and target currencies. */
export function invertRate(rate: number): number | null {
  return Number.isFinite(rate) && rate > 0 ? round(1 / rate) : null;
}

/** Calculates the actual target amount after a percentage adjustment and fixed fee. */
export function calculateExchange(input: ExchangeInput): ExchangeResult | null {
  const { amount, rate, adjustmentPercent, fixedFee } = input;
  if (
    !Number.isFinite(amount) ||
    amount < 0 ||
    !Number.isFinite(rate) ||
    rate <= 0 ||
    !Number.isFinite(adjustmentPercent) ||
    adjustmentPercent < -100 ||
    adjustmentPercent > 100 ||
    !Number.isFinite(fixedFee) ||
    fixedFee < 0
  ) {
    return null;
  }

  const gross = round(amount * rate);
  const adjustment = round((gross * adjustmentPercent) / 100);
  const totalCharges = round(adjustment + fixedFee);
  const received = round(gross - totalCharges);

  return {
    gross,
    adjustment,
    totalCharges,
    received,
    effectiveRate: amount === 0 ? null : round(received / amount),
  };
}

function round(value: number): number {
  return Math.round((value + Number.EPSILON * Math.sign(value || 1)) * 1_000_000) / 1_000_000;
}
