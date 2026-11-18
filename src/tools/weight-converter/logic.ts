/**
 * Pure logic for weight-converter — no DOM, no Preact. Everything testable lives here.
 */

import type { Locale } from '../../i18n/locales';

export type WeightUnit =
  'mg' | 'g' | 'kg' | 't' | 'oz' | 'lb' | 'st' | 'don' | 'nyang' | 'geunMeat' | 'geunProduce' | 'gwan';

export const WEIGHT_UNITS: WeightUnit[] = [
  'mg',
  'g',
  'kg',
  't',
  'oz',
  'lb',
  'st',
  'don',
  'nyang',
  'geunMeat',
  'geunProduce',
  'gwan',
];

/**
 * Exact conversion factors to grams (SI base).
 * oz/lb/st use the 1959 international avoirdupois definition (1 lb = 0.45359237 kg exactly).
 * don/nyang/geunMeat/gwan are the modern Korean 척관법 values still used at markets and
 * jewelers (1 don = 3.75 g, legally fixed). geunProduce is the separate 10-nyang 근 used for
 * produce and herbal medicine, distinct from the 16-nyang 근 (geunMeat) used for meat.
 */
const GRAMS_PER_UNIT: Record<WeightUnit, number> = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  t: 1_000_000,
  oz: 28.349523125,
  lb: 453.59237,
  st: 6350.29318,
  don: 3.75,
  nyang: 37.5,
  geunMeat: 600,
  geunProduce: 375,
  gwan: 3750,
};

export function isWeightUnit(value: unknown): value is WeightUnit {
  return typeof value === 'string' && (WEIGHT_UNITS as string[]).includes(value);
}

/** Converts a weight between any two supported units. Non-finite input yields 0. */
export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (!Number.isFinite(value)) return 0;
  if (from === to) return value;
  return (value * GRAMS_PER_UNIT[from]) / GRAMS_PER_UNIT[to];
}

export type WeightInput = { status: 'empty' } | { status: 'invalid' } | { status: 'valid'; value: number };

/**
 * Reads what people actually type into a value field: a plain number, a decimal still being
 * typed ("70."), thousands separators copied from a document ("1,000"), a comma decimal
 * ("70,5"), and full-width digits from a Korean IME. Anything else is reported as invalid
 * rather than silently becoming 0.
 */
export function parseWeightInput(text: string): WeightInput {
  const normalized = text
    .replace(/[\uFF10-\uFF19\uFF0E]/g, (character) => String.fromCharCode(character.charCodeAt(0) - 0xfee0))
    .trim();
  if (normalized === '') return { status: 'empty' };
  const compact = normalized.replace(/[\s\u00A0\u202F_']/g, '');
  if (/^[+-]?[.,]?$/.test(compact)) return { status: 'empty' };

  let numeric = compact;
  if (/^[+-]?\d{1,3}(,\d{3})+(\.\d*)?$/.test(compact)) numeric = compact.replace(/,/g, '');
  else if (/^[+-]?\d+,\d+$/.test(compact)) numeric = compact.replace(',', '.');
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(numeric)) return { status: 'invalid' };

  const value = Number(numeric);
  return Number.isFinite(value) ? { status: 'valid', value } : { status: 'invalid' };
}

/** More decimals for tiny results (e.g. mg -> t), fewer for large ones. */
export function resultDecimals(value: number): number {
  const abs = Math.abs(value);
  if (abs === 0) return 0;
  if (abs < 0.001) return 8;
  if (abs < 1) return 6;
  if (abs < 100) return 4;
  return 2;
}

/**
 * Formats a converted weight. A real value is never displayed as "0": below the precision of
 * the fixed-decimal rule the result switches to scientific notation, so 1 mg = 0.000000001 t
 * reads as "1E-9" instead of "0".
 */
export function formatWeight(value: number, locale: Locale): string {
  if (!Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs !== 0 && (abs < 5e-9 || abs >= 1e15)) {
    return new Intl.NumberFormat(locale, { notation: 'scientific', maximumSignificantDigits: 4 }).format(value);
  }
  return new Intl.NumberFormat(locale, { maximumFractionDigits: resultDecimals(value) }).format(value);
}

/**
 * The value written back into the field after a swap: precise enough that unit pairs survive a
 * round trip, short enough to stay readable.
 */
export function formatInputValue(value: number): string {
  if (!Number.isFinite(value)) return '';
  if (value === 0) return '0';
  return String(Number(value.toPrecision(12)));
}

/** Common, realistically-searched values per unit, used to build a quick reference table. */
const COMMON_VALUES: Record<WeightUnit, number[]> = {
  mg: [1, 50, 100, 500, 1000],
  g: [1, 10, 50, 100, 500, 1000],
  kg: [1, 5, 10, 50, 70, 100],
  t: [1, 2, 5, 10],
  oz: [1, 4, 8, 16, 32],
  lb: [1, 5, 10, 50, 100, 150, 200],
  st: [1, 5, 10, 15, 20],
  don: [1, 3, 5, 10, 100],
  nyang: [1, 5, 10, 16],
  geunMeat: [1, 2, 3, 5, 10],
  geunProduce: [1, 2, 3, 5, 10],
  gwan: [1, 2, 5, 10],
};

export interface QuickTableRow {
  value: number;
  result: number;
}

export function quickTable(from: WeightUnit, to: WeightUnit): QuickTableRow[] {
  return COMMON_VALUES[from].map((value) => ({ value, result: convertWeight(value, from, to) }));
}
