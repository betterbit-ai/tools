/** Pure pyeong-area calculations. This module deliberately has no browser or UI dependencies. */

export type AreaUnit = 'squareMeters' | 'pyeong';

/** One pyeong is exactly 400/121 square metres. */
export const SQUARE_METERS_PER_PYEONG = 400 / 121;
export const PYEONG_PER_SQUARE_METER = 121 / 400;

/** A display guardrail, not a limit imposed by a measurement standard. */
export const MAX_AREA = 1_000_000_000_000;

export interface AreaResult {
  squareMeters: number;
  pyeong: number;
}

export interface AreaComparison {
  exclusive: AreaResult;
  supply: AreaResult;
  exclusiveRatio: number;
}

export function isAreaUnit(value: unknown): value is AreaUnit {
  return value === 'squareMeters' || value === 'pyeong';
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

function isValidArea(value: number | null): value is number {
  return value !== null && value >= 0 && value <= MAX_AREA;
}

/** Converts an area from either supported unit and returns both representations. */
export function calculateArea(value: number | string, unit: AreaUnit): AreaResult | null {
  const parsed = parseAreaNumber(value);
  if (!isValidArea(parsed) || !isAreaUnit(unit)) return null;

  const squareMeters = unit === 'squareMeters' ? parsed : parsed * SQUARE_METERS_PER_PYEONG;
  const pyeong = unit === 'pyeong' ? parsed : parsed * PYEONG_PER_SQUARE_METER;

  if (!Number.isFinite(squareMeters) || !Number.isFinite(pyeong)) return null;
  return { squareMeters: roundArea(squareMeters), pyeong: roundArea(pyeong) };
}

/** Avoids binary floating-point tails without reducing useful area precision. */
function roundArea(value: number): number {
  const factor = 10 ** 10;
  return Math.round((value + Number.EPSILON * Math.sign(value || 1)) * factor) / factor;
}

/**
 * Compares values already stated as square metres. Supply area includes the
 * exclusive area, so a smaller supply value is an invalid comparison.
 */
export function compareAreas(
  exclusiveSquareMeters: number | string,
  supplySquareMeters: number | string,
): AreaComparison | null {
  const exclusive = calculateArea(exclusiveSquareMeters, 'squareMeters');
  const supply = calculateArea(supplySquareMeters, 'squareMeters');
  if (!exclusive || !supply || supply.squareMeters < exclusive.squareMeters || supply.squareMeters === 0) return null;

  return {
    exclusive,
    supply,
    exclusiveRatio: (exclusive.squareMeters / supply.squareMeters) * 100,
  };
}
