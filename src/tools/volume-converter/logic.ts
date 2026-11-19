/** Pure volume conversions. This module deliberately has no browser or UI dependencies. */

import type { Locale } from '../../i18n/locales';

export type VolumeUnit =
  | 'milliliter'
  | 'liter'
  | 'koreanCup'
  | 'usCup'
  | 'usLegalCup'
  | 'metricCup'
  | 'imperialCup'
  | 'usFluidOunce'
  | 'usTablespoon'
  | 'usTeaspoon';

export const VOLUME_UNITS: VolumeUnit[] = [
  'milliliter',
  'liter',
  'koreanCup',
  'usCup',
  'usLegalCup',
  'metricCup',
  'imperialCup',
  'usFluidOunce',
  'usTablespoon',
  'usTeaspoon',
];

/** One US customary cup is eight US fluid ounces. */
export const MILLILITERS_PER_US_CUP = 236.5882365;
/** The common Korean cooking measuring cup. */
export const MILLILITERS_PER_KOREAN_CUP = 200;
/** The metric cup used in, for example, Australian and New Zealand recipes. */
export const MILLILITERS_PER_METRIC_CUP = 250;
/** The US nutrition-label cup. */
export const MILLILITERS_PER_US_LEGAL_CUP = 240;
/** The historical UK imperial cup, one half of an imperial pint. */
export const MILLILITERS_PER_IMPERIAL_CUP = 284.130625;
/** A display guardrail, rather than a measurement-standard limit. */
export const MAX_VOLUME = 1_000_000_000_000;

/** Factors to millilitres. US customary values use the exact US gallon definition. */
export const MILLILITERS_PER_UNIT: Record<VolumeUnit, number> = {
  milliliter: 1,
  liter: 1000,
  koreanCup: MILLILITERS_PER_KOREAN_CUP,
  usCup: MILLILITERS_PER_US_CUP,
  usLegalCup: MILLILITERS_PER_US_LEGAL_CUP,
  metricCup: MILLILITERS_PER_METRIC_CUP,
  imperialCup: MILLILITERS_PER_IMPERIAL_CUP,
  usFluidOunce: MILLILITERS_PER_US_CUP / 8,
  usTablespoon: MILLILITERS_PER_US_CUP / 16,
  usTeaspoon: MILLILITERS_PER_US_CUP / 48,
};

export function isVolumeUnit(value: unknown): value is VolumeUnit {
  return typeof value === 'string' && (VOLUME_UNITS as string[]).includes(value);
}

/**
 * Accepts ordinary grouped numbers and full-width digits pasted from Korean
 * keyboards. Unit-bearing text and non-finite values are deliberately rejected.
 */
export function parseVolumeNumber(value: number | string): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const normalized = value.normalize('NFKC').trim().replaceAll(',', '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export type VolumeInput =
  | { status: 'empty' }
  | { status: 'invalid' }
  | { status: 'out-of-range'; value: number }
  | { status: 'valid'; value: number };

/**
 * Reads what people actually type into a volume field: a plain number, a decimal still being
 * typed ("0."), a decimal point typed as a comma ("0,5"), thousands separators copied from a
 * document or a recipe ("1,000"), and full-width digits from a Korean IME. Anything else is
 * reported instead of silently becoming 0, and a value outside the supported range says so.
 */
export function parseVolumeInput(text: string): VolumeInput {
  const normalized = text.normalize('NFKC').trim();
  if (normalized === '') return { status: 'empty' };
  const compact = normalized.replace(/[\s\u00A0\u202F_']/g, '');
  if (/^[+-]?[.,]?$/.test(compact)) return { status: 'empty' };

  let numeric = compact;
  if (/^[+-]?\d{1,3}(,\d{3})+(\.\d*)?$/.test(compact)) numeric = compact.replace(/,/g, '');
  else if (/^[+-]?\d+,\d+$/.test(compact)) numeric = compact.replace(',', '.');
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(numeric)) return { status: 'invalid' };

  const value = Number(numeric);
  if (!Number.isFinite(value)) return { status: 'invalid' };
  if (value < 0 || value > MAX_VOLUME) return { status: 'out-of-range', value };
  return { status: 'valid', value };
}

function isValidVolume(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= MAX_VOLUME;
}

/** Converts a non-negative liquid volume between supported units. Invalid input yields 0. */
export function convertVolume(value: number, from: VolumeUnit, to: VolumeUnit): number {
  if (!isValidVolume(value) || !isVolumeUnit(from) || !isVolumeUnit(to)) return 0;
  if (from === to) return value;
  return (value * MILLILITERS_PER_UNIT[from]) / MILLILITERS_PER_UNIT[to];
}

/** Recipe fractions are written as fractions, not as 0.333333 — the value people actually see in a recipe. */
interface CommonValue {
  value: number;
  label?: string;
}

const COMMON_VALUES: Record<VolumeUnit, CommonValue[]> = {
  milliliter: [5, 15, 60, 100, 200, 500, 1000].map((value) => ({ value })),
  liter: [0.25, 0.5, 0.75, 1, 1.5, 2].map((value) => ({ value })),
  koreanCup: [0.25, 0.5, 0.75, 1, 1.5, 2].map((value) => ({ value })),
  usCup: [
    { value: 0.25, label: '¼' },
    { value: 1 / 3, label: '⅓' },
    { value: 0.5, label: '½' },
    { value: 2 / 3, label: '⅔' },
    { value: 0.75, label: '¾' },
    { value: 1 },
    { value: 2 },
  ],
  usLegalCup: [0.25, 0.5, 0.75, 1, 2].map((value) => ({ value })),
  metricCup: [
    { value: 0.25, label: '¼' },
    { value: 1 / 3, label: '⅓' },
    { value: 0.5, label: '½' },
    { value: 0.75, label: '¾' },
    { value: 1 },
    { value: 2 },
  ],
  imperialCup: [0.25, 0.5, 0.75, 1, 2].map((value) => ({ value })),
  usFluidOunce: [1, 2, 4, 6, 8, 16].map((value) => ({ value })),
  usTablespoon: [1, 2, 3, 4, 8, 16].map((value) => ({ value })),
  usTeaspoon: [0.25, 0.5, 1, 2, 3, 6, 12].map((value) => ({ value })),
};

export interface QuickTableRow {
  value: number;
  /** Fraction shown in place of the decimal for recipe-sized values (⅓, ⅔). */
  label?: string;
  result: number;
}

/** Common recipe-size values for the selected source unit. */
export function quickTable(from: VolumeUnit, to: VolumeUnit): QuickTableRow[] {
  return COMMON_VALUES[from].map((entry) => ({
    value: entry.value,
    label: entry.label,
    result: convertVolume(entry.value, from, to),
  }));
}

/** More decimals for tiny results, fewer for large ones. */
export function resultDecimals(value: number): number {
  const absolute = Math.abs(value);
  if (absolute === 0) return 0;
  if (absolute < 0.001) return 8;
  if (absolute < 1) return 6;
  if (absolute < 100) return 4;
  return 2;
}

/**
 * Formats a converted volume. A real value is never displayed as "0": below the precision of
 * the fixed-decimal rule the result switches to scientific notation.
 */
export function formatVolume(value: number, locale: Locale): string {
  if (!Number.isFinite(value)) return '—';
  const absolute = Math.abs(value);
  if (absolute !== 0 && (absolute < 5e-9 || absolute >= 1e15)) {
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
