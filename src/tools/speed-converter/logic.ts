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
 * Parses decimal/scientific input with optional correctly grouped commas. NFKC normalization
 * lets Korean users paste full-width digits and punctuation without weakening syntax checks.
 */
export function parseSpeedNumber(value: number | string): number | '' | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const normalized = value.normalize('NFKC').trim();
  if (!normalized) return '';
  const decimal = '(?:\\d+(?:\\.\\d*)?|\\.\\d+)';
  const grouped = '(?:\\d{1,3}(?:,\\d{3})+(?:\\.\\d*)?)';
  const pattern = new RegExp(`^[+-]?(?:${decimal}|${grouped})(?:[eE][+-]?\\d+)?$`);
  if (!pattern.test(normalized)) return null;

  const parsed = Number(normalized.replaceAll(',', ''));
  return Number.isFinite(parsed) ? parsed : null;
}

export function isSpeedInRange(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= MAX_SPEED;
}

/** Converts a non-negative scalar speed. Invalid values yield 0. */
export function convertSpeed(value: number, from: SpeedUnit, to: SpeedUnit): number {
  if (!isSpeedInRange(value) || !isSpeedUnit(from) || !isSpeedUnit(to)) return 0;
  if (from === to) return value;
  return (value * METRES_PER_SECOND_PER_UNIT[from]) / METRES_PER_SECOND_PER_UNIT[to];
}

/** Returns a speed from a running pace written as whole minutes plus seconds per distance unit. */
export function isValidPace(minutes: number, seconds: number): boolean {
  if (!Number.isInteger(minutes) || !Number.isInteger(seconds) || minutes < 0 || seconds < 0 || seconds >= 60) {
    return false;
  }
  const totalSeconds = minutes * 60 + seconds;
  return Number.isFinite(totalSeconds) && totalSeconds > 0;
}

export function speedFromPace(minutes: number, seconds: number, distance: 'km' | 'mi'): number {
  if (!isValidPace(minutes, seconds)) return 0;
  const totalSeconds = minutes * 60 + seconds;
  const metres = distance === 'km' ? 1000 : 1609.344;
  return metres / totalSeconds;
}

/** Returns pace in seconds per kilometre or mile, or null for zero/invalid speeds. */
export function paceSecondsFromSpeed(speed: number, unit: SpeedUnit, distance: 'km' | 'mi'): number | null {
  if (!isSpeedInRange(speed) || speed <= 0 || !isSpeedUnit(unit)) return null;
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

/** Keep tiny nonzero results readable instead of rounding them to a dishonest zero. */
export function usesScientificNotation(value: number): boolean {
  const absolute = Math.abs(value);
  return Number.isFinite(value) && absolute !== 0 && absolute < 0.000001;
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
