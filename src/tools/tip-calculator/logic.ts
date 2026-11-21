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

/** Currency names that follow an amount on a receipt ("50,000원", "50 USD"). */
const CURRENCY_NAME = /(?:krw|jpy|usd|cad|gbp|eur|원|엔|달러|유로|파운드)$/iu;
/** Words for the number of diners ("3명", "3 people"). */
const PEOPLE_NAME = /(?:명|분|people|persons?|ppl)$/iu;

function compact(value: string): string {
  return value
    .trim()
    .replaceAll(/[\s,\u00a0]/gu, '')
    .replaceAll(/[$£€¥₩]/gu, '');
}

function readNumber(text: string): number | null {
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/u.test(text)) return null;
  const amount = Number(text);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

/**
 * Parses a typed amount without silently accepting words, emoji, or malformed
 * punctuation. Commas, spaces, currency symbols, and a trailing currency name are
 * safe to paste — "₩50,000" and "50,000원" both mean the same bill.
 */
export function parseAmount(value: string): number | null {
  return readNumber(compact(value).replace(CURRENCY_NAME, ''));
}

/** Parses a rate: a percent sign is accepted because that is how receipts print it ("18%"). */
export function parsePercent(value: string): number | null {
  const withoutSign = value.trim().replace(/[%％]\s*$/u, '');
  return readNumber(compact(withoutSign).replace(CURRENCY_NAME, ''));
}

/** Parses how many people share the bill, accepting a trailing "명" or "people". */
export function parsePeople(value: string): number | null {
  return readNumber(compact(value.trim().replace(PEOPLE_NAME, '')));
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
