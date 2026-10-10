/**
 * Pure logic for percentage-calculator — no DOM, no Preact. Everything testable lives here.
 *
 * Four calculation types, each returning both the numeric result and the plugged-in
 * formula (as tokens) so Tool.tsx can render "계산식" without re-deriving it.
 */

/** Rounds away binary floating-point noise (e.g. 29.999999999999996) while keeping precision. */
export function round(n: number, decimals = 6): number {
  if (!Number.isFinite(n)) return n;
  const factor = 10 ** decimals;
  return Math.round((n + Number.EPSILON * Math.sign(n || 1)) * factor) / factor;
}

/** Type 1: P% of base. e.g. 20% of 50 = 10. */
export function percentOf(percent: number, base: number): number {
  return round((percent / 100) * base);
}

/** Type 2: what percent `part` is of `whole`. e.g. 10 is 20% of 50. Undefined (NaN) when whole is 0. */
export function whatPercent(part: number, whole: number): number {
  if (whole === 0) return NaN;
  return round((part / whole) * 100);
}

/** Type 3: the whole, given that `part` is `percent`% of it. Undefined (NaN) when percent is 0. */
export function findWhole(part: number, percent: number): number {
  if (percent === 0) return NaN;
  return round(part / (percent / 100));
}

/** Type 4: percent change from `from` to `to` (positive = increase, negative = decrease). NaN when from is 0. */
export function percentChange(from: number, to: number): number {
  if (from === 0) return NaN;
  return round(((to - from) / from) * 100);
}

/** The absolute change (`to` - `from`) that pairs with {@link percentChange}. */
export function absoluteChange(from: number, to: number): number {
  return round(to - from);
}
