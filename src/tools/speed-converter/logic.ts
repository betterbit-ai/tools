/** Pure speed and running-pace conversions. This module has no browser or UI dependencies. */

export type SpeedUnit = 'kmh' | 'mph' | 'ms' | 'knot';

export const SPEED_UNITS: SpeedUnit[] = ['kmh', 'mph', 'ms', 'knot'];
export const MAX_SPEED = 1_000_000_000_000;

/** Exact factors to metres per second. A knot is exactly 1,852 metres per hour. */
export const METRES_PER_SECOND_PER_UNIT: Record<SpeedUnit, number> = {
  kmh: 1 / 3.6,
  mph: 0.44704,
  ms: 1,
  knot: 1852 / 3600,
};

export function isSpeedUnit(value: unknown): value is SpeedUnit {
  return typeof value === 'string' && (SPEED_UNITS as string[]).includes(value);
}

/**
 * Parses ordinary grouped numbers and full-width digits pasted from a Korean keyboard.
 * Unit-bearing strings are deliberately rejected so callers do not guess a unit.
 */
export function parseSpeedNumber(value: number | string): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const normalized = value.normalize('NFKC').trim().replaceAll(',', '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidSpeed(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= MAX_SPEED;
}

/** Converts a non-negative scalar speed. Invalid values yield 0. */
export function convertSpeed(value: number, from: SpeedUnit, to: SpeedUnit): number {
  if (!isValidSpeed(value) || !isSpeedUnit(from) || !isSpeedUnit(to)) return 0;
  if (from === to) return value;
  return (value * METRES_PER_SECOND_PER_UNIT[from]) / METRES_PER_SECOND_PER_UNIT[to];
}

/** Returns a speed from a running pace written as whole minutes plus seconds per distance unit. */
export function speedFromPace(minutes: number, seconds: number, distance: 'km' | 'mi'): number {
  if (!Number.isInteger(minutes) || !Number.isInteger(seconds) || minutes < 0 || seconds < 0 || seconds >= 60) {
    return 0;
  }

  const totalSeconds = minutes * 60 + seconds;
  if (totalSeconds <= 0) return 0;
  const metres = distance === 'km' ? 1000 : 1609.344;
  return metres / totalSeconds;
}

/** Returns pace in seconds per kilometre or mile, or null for zero/invalid speeds. */
export function paceSecondsFromSpeed(speed: number, unit: SpeedUnit, distance: 'km' | 'mi'): number | null {
  if (!isValidSpeed(speed) || speed <= 0 || !isSpeedUnit(unit)) return null;
  const metresPerSecond = convertSpeed(speed, unit, 'ms');
  const metres = distance === 'km' ? 1000 : 1609.344;
  return metres / metresPerSecond;
}

/** Formats a positive pace as m:ss, rounding to the nearest second and carrying 60 seconds. */
export function formatPace(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds) || seconds <= 0) return '—';
  const rounded = Math.round(seconds);
  const minutes = Math.floor(rounded / 60);
  const remainingSeconds = rounded % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

export interface QuickTableRow {
  value: number;
  result: number;
}

const COMMON_SPEEDS: Record<SpeedUnit, number[]> = {
  kmh: [5, 20, 50, 80, 100, 120],
  mph: [5, 25, 40, 55, 60, 70],
  ms: [1, 5, 10, 20, 30],
  knot: [5, 10, 20, 30, 40],
};

export function quickTable(from: SpeedUnit, to: SpeedUnit): QuickTableRow[] {
  return COMMON_SPEEDS[from].map((value) => ({ value, result: convertSpeed(value, from, to) }));
}
