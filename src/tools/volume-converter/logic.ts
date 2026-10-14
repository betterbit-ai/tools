/** Pure volume conversions. This module deliberately has no browser or UI dependencies. */

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

function isValidVolume(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= MAX_VOLUME;
}

/** Converts a non-negative liquid volume between supported units. Invalid input yields 0. */
export function convertVolume(value: number, from: VolumeUnit, to: VolumeUnit): number {
  if (!isValidVolume(value) || !isVolumeUnit(from) || !isVolumeUnit(to)) return 0;
  if (from === to) return value;
  return (value * MILLILITERS_PER_UNIT[from]) / MILLILITERS_PER_UNIT[to];
}

const COMMON_VALUES: Record<VolumeUnit, number[]> = {
  milliliter: [5, 15, 60, 100, 200, 500, 1000],
  liter: [0.25, 0.5, 0.75, 1, 1.5, 2],
  koreanCup: [0.25, 0.5, 0.75, 1, 1.5, 2],
  usCup: [0.25, 1 / 3, 0.5, 2 / 3, 0.75, 1, 2],
  usLegalCup: [0.25, 0.5, 0.75, 1, 2],
  metricCup: [0.25, 1 / 3, 0.5, 0.75, 1, 2],
  imperialCup: [0.25, 0.5, 0.75, 1, 2],
  usFluidOunce: [1, 2, 4, 6, 8, 16],
  usTablespoon: [1, 2, 3, 4, 8, 16],
  usTeaspoon: [0.25, 0.5, 1, 2, 3, 6, 12],
};

export interface QuickTableRow {
  value: number;
  result: number;
}

/** Common recipe-size values for the selected source unit. */
export function quickTable(from: VolumeUnit, to: VolumeUnit): QuickTableRow[] {
  return COMMON_VALUES[from].map((value) => ({ value, result: convertVolume(value, from, to) }));
}
