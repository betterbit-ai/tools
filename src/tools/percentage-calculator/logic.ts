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
  // Scaling an already-large finite number can overflow even though the value
  // itself is representable. At this magnitude there are no fractional digits
  // left for this calculator to remove, so preserve the finite value.
  if (!Number.isFinite(factor) || factor === 0 || Math.abs(n) > Number.MAX_VALUE / factor) return n;
  return Math.round((n + Number.EPSILON * Math.sign(n || 1)) * factor) / factor;
}

export type NumberReading = { status: 'empty' } | { status: 'invalid' } | { status: 'valid'; value: number };

/**
 * Reads what a visitor actually types into a field. A decimal point typed mid-number, a value
 * pasted from a spreadsheet with thousands separators, a comma decimal used in many locales and
 * the full-width digits a Korean IME produces must all survive instead of being silently dropped.
 * Text that is not a number is reported so the field can explain itself rather than become 0.
 */
export function readNumberText(text: string): NumberReading {
  const normalized = text.normalize('NFKC').trim();
  if (normalized === '') return { status: 'empty' };
  const compact = normalized.replace(/[\s\u00A0\u202F_']/g, '');
  // A sign or a separator on its own is still being typed, not a wrong number.
  if (/^[+-]?[.,]?$/.test(compact)) return { status: 'empty' };
  // "1250." is the number the visitor is typing; the trailing separator does not invalidate it.
  const trimmed = compact.replace(/[.,]$/, '');

  let numeric = trimmed;
  if (/^[+-]?\d{1,3}(,\d{3})+(\.\d*)?$/.test(trimmed)) numeric = trimmed.replace(/,/g, '');
  else if (/^[+-]?\d+,\d+$/.test(trimmed)) numeric = trimmed.replace(',', '.');
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(numeric)) return { status: 'invalid' };

  const value = Number(numeric);
  return Number.isFinite(value) ? { status: 'valid', value } : { status: 'invalid' };
}

/** A saved field is restored as text so "1,250" comes back exactly as it was typed. */
export function restoreNumberText(value: unknown, fallback: string): string {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value !== 'string') return fallback;
  return value.length <= 40 && readNumberText(value).status !== 'invalid' ? value : fallback;
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
  return round(((to - from) / Math.abs(from)) * 100);
}

/** The absolute change (`to` - `from`) that pairs with {@link percentChange}. */
export function absoluteChange(from: number, to: number): number {
  return round(to - from);
}
