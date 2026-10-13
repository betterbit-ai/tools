/**
 * Pure logic for tip-calculator — no DOM, no Preact. Amounts are converted to
 * integer minor units before arithmetic so a split never loses a cent or won.
 */

export interface TipInput {
  bill: number;
  tipPercent: number;
  serviceChargePercent: number;
  people: number;
  fractionDigits: number;
}

export interface TipResult {
  billMinor: number;
  serviceChargeMinor: number;
  tipMinor: number;
  totalMinor: number;
  split: {
    lowerShareMinor: number;
    higherShareMinor: number;
    lowerShareCount: number;
    higherShareCount: number;
  };
}

/**
 * Parses a typed amount without silently accepting words, emoji, or malformed
 * punctuation. Commas, spaces, and common currency symbols are safe to paste.
 */
export function parseAmount(value: string): number | null {
  const compact = value
    .trim()
    .replaceAll(/[\s,\u00a0]/gu, '')
    .replaceAll(/[$£€¥₩]/gu, '');
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/u.test(compact)) return null;
  const amount = Number(compact);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

/** Divide integer currency units while preserving every unit in the result. */
export function splitExactly(totalMinor: number, people: number): TipResult['split'] {
  const lowerShareMinor = Math.floor(totalMinor / people);
  const higherShareCount = totalMinor % people;
  return {
    lowerShareMinor,
    higherShareMinor: higherShareCount === 0 ? lowerShareMinor : lowerShareMinor + 1,
    lowerShareCount: people - higherShareCount,
    higherShareCount,
  };
}

/** Returns null for incomplete, negative, or impractically large inputs. */
export function calculateTip(input: TipInput): TipResult | null {
  const { bill, tipPercent, serviceChargePercent, people, fractionDigits } = input;
  if (
    !Number.isFinite(bill) ||
    !Number.isFinite(tipPercent) ||
    !Number.isFinite(serviceChargePercent) ||
    !Number.isInteger(people) ||
    !Number.isInteger(fractionDigits) ||
    bill < 0 ||
    tipPercent < 0 ||
    tipPercent > 1000 ||
    serviceChargePercent < 0 ||
    serviceChargePercent > 100 ||
    people < 1 ||
    people > 100 ||
    fractionDigits < 0 ||
    fractionDigits > 3
  ) {
    return null;
  }

  const factor = 10 ** fractionDigits;
  const billMinor = Math.round(bill * factor);
  if (!Number.isSafeInteger(billMinor)) return null;

  const serviceChargeMinor = Math.round((billMinor * serviceChargePercent) / 100);
  const tipMinor = Math.round((billMinor * tipPercent) / 100);
  const totalMinor = billMinor + serviceChargeMinor + tipMinor;
  if (
    !Number.isSafeInteger(serviceChargeMinor) ||
    !Number.isSafeInteger(tipMinor) ||
    !Number.isSafeInteger(totalMinor)
  ) {
    return null;
  }

  return {
    billMinor,
    serviceChargeMinor,
    tipMinor,
    totalMinor,
    split: splitExactly(totalMinor, people),
  };
}
