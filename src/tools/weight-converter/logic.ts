/**
 * Pure logic for weight-converter — no DOM, no Preact. Everything testable lives here.
 */

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
