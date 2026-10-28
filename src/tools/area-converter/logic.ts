/** Pure area conversions. This module deliberately has no browser or UI dependencies. */

export type AreaUnit = 'squareMeter' | 'squareFoot' | 'squareYard' | 'acre' | 'hectare' | 'pyeong';

export const AREA_UNITS: AreaUnit[] = ['squareMeter', 'squareFoot', 'squareYard', 'acre', 'hectare', 'pyeong'];

/** One pyeong is exactly 400/121 square metres. */
export const SQUARE_METERS_PER_PYEONG = 400 / 121;
/** A display guardrail, not a limit imposed by a measurement standard. */
export const MAX_AREA = 1_000_000_000_000;

/**
 * Exact factors to square metres. Imperial values use the international foot
 * (0.3048 m exactly), rather than the distinct U.S. survey foot.
 */
export const SQUARE_METERS_PER_UNIT: Record<AreaUnit, number> = {
  squareMeter: 1,
  squareFoot: 0.09290304,
  squareYard: 0.83612736,
  acre: 4046.8564224,
  hectare: 10_000,
  pyeong: SQUARE_METERS_PER_PYEONG,
};

export function isAreaUnit(value: unknown): value is AreaUnit {
  return typeof value === 'string' && (AREA_UNITS as string[]).includes(value);
}

/**
 * Accepts ordinary grouped values and full-width digits pasted from Korean
 * keyboards. Unit symbols and other prose are intentionally rejected.
 */
export function parseAreaNumber(value: number | string): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const normalized = value.normalize('NFKC').trim().replaceAll(',', '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Whether a parsed area can be converted and displayed without exceeding the UI guardrail. */
export function isValidArea(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= MAX_AREA;
}

/** Converts a non-negative area between any supported units. Invalid input yields 0. */
export function convertArea(value: number, from: AreaUnit, to: AreaUnit): number {
  if (!isValidArea(value) || !isAreaUnit(from) || !isAreaUnit(to)) return 0;
  if (from === to) return value;
  return (value * SQUARE_METERS_PER_UNIT[from]) / SQUARE_METERS_PER_UNIT[to];
}

/** Common, realistically-searched values per source unit for the quick reference table. */
const COMMON_VALUES: Record<AreaUnit, number[]> = {
  squareMeter: [1, 25, 59, 84, 100, 112],
  squareFoot: [1, 100, 500, 1000, 1500, 2000],
  squareYard: [1, 10, 100, 500, 1000],
  acre: [0.1, 0.25, 0.5, 1, 5, 10],
  hectare: [0.1, 0.5, 1, 5, 10],
  pyeong: [1, 10, 18, 25, 32, 34],
};

export interface QuickTableRow {
  value: number;
  result: number;
}

export function quickTable(from: AreaUnit, to: AreaUnit): QuickTableRow[] {
  return COMMON_VALUES[from].map((value) => ({ value, result: convertArea(value, from, to) }));
}
