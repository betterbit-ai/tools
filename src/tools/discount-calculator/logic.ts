/**
 * Pure logic for discount-calculator — no DOM, no Preact.
 *
 * Rates are applied successively: a second coupon is applied to the price left
 * after the first one, never added to the first rate.
 */

export interface DiscountResult {
  prices: number[];
  finalPrice: number;
  saved: number;
  effectivePercent: number;
}

/** Removes ordinary money formatting, including full-width digits used in pasted prices. */
export function parsePrice(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = Array.from(trimmed)
    .map((character) => {
      const code = character.charCodeAt(0);
      if (code >= 0xff10 && code <= 0xff19) return String(code - 0xff10);
      if (character === '．') return '.';
      if (character === '，') return ',';
      return character;
    })
    .join('')
    .replace(/[\s,_$€£¥₩원]/g, '');

  const match = normalized.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(만)?$/);
  if (!match) return null;

  const amount = Number(match[1]) * (match[2] ? 10_000 : 1);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

/** Applies up to three rates in order and returns every intermediate price. */
export function applyDiscounts(originalPrice: number, discounts: number[]): DiscountResult | null {
  if (!isValidPrice(originalPrice) || discounts.length === 0 || discounts.length > 3) return null;
  if (!discounts.every(isValidRate)) return null;

  const prices: number[] = [];
  let current = originalPrice;
  for (const discount of discounts) {
    current = round(current * (1 - discount / 100));
    prices.push(current);
  }

  return {
    prices,
    finalPrice: current,
    saved: round(originalPrice - current),
    effectivePercent: originalPrice === 0 ? 0 : round((1 - current / originalPrice) * 100),
  };
}

/** Finds a discount rate from the original and final prices. */
export function findDiscountRate(originalPrice: number, finalPrice: number): number | null {
  if (!isValidPrice(originalPrice) || originalPrice === 0 || !isValidPrice(finalPrice)) return null;
  if (finalPrice > originalPrice) return null;
  return round(((originalPrice - finalPrice) / originalPrice) * 100);
}

/** Reverses one to three successive discount rates to find the original price. */
export function findOriginalPrice(finalPrice: number, discounts: number[]): number | null {
  if (!isValidPrice(finalPrice) || discounts.length === 0 || discounts.length > 3) return null;
  if (!discounts.every(isValidRate)) return null;

  const remainingFraction = discounts.reduce((product, rate) => product * (1 - rate / 100), 1);
  if (remainingFraction === 0) return null;
  return round(finalPrice / remainingFraction);
}

export function isValidRate(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

function isValidPrice(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

function round(value: number): number {
  return Math.round((value + Number.EPSILON * Math.sign(value || 1)) * 1_000_000) / 1_000_000;
}
