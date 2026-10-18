/**
 * Pure logic for length-converter — no DOM, no Preact. Everything testable lives here.
 */

export type LengthUnit = 'mm' | 'cm' | 'm' | 'km' | 'in' | 'ft' | 'yd' | 'mi';

export const LENGTH_UNITS: LengthUnit[] = ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'];

/** Exact conversion factors to metres (SI base). in/ft/yd/mi are international-yard definitions. */
const METERS_PER_UNIT: Record<LengthUnit, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

export function isLengthUnit(value: unknown): value is LengthUnit {
  return typeof value === 'string' && (LENGTH_UNITS as string[]).includes(value);
}

/** Parses decimal/scientific input with optional correctly grouped thousands separators. */
export function parseLengthInput(input: string): number | '' | null {
  const trimmed = input.trim();
  if (trimmed === '') return '';

  const decimal = '(?:\\d+(?:\\.\\d*)?|\\.\\d+)';
  const grouped = '(?:\\d{1,3}(?:,\\d{3})+(?:\\.\\d*)?)';
  const pattern = new RegExp(`^[+-]?(?:${decimal}|${grouped})(?:[eE][+-]?\\d+)?$`);
  if (!pattern.test(trimmed)) return null;

  const value = Number(trimmed.replaceAll(',', ''));
  return Number.isFinite(value) ? value : null;
}

/** Converts a length between any two supported units. Non-finite input yields 0. */
export function convertLength(value: number, from: LengthUnit, to: LengthUnit): number {
  if (!Number.isFinite(value)) return 0;
  if (from === to) return value;
  // Calculate the ratio first. Multiplying by the source factor first can overflow
  // for values near Number.MAX_VALUE even when the converted result is representable.
  return value * (METERS_PER_UNIT[from] / METERS_PER_UNIT[to]);
}

export interface SwappedLength {
  value: number;
  from: LengthUnit;
  to: LengthUnit;
}

/** Flips a conversion without rounding the value shown in the result. */
export function swapLength(value: number, from: LengthUnit, to: LengthUnit): SwappedLength {
  return { value: convertLength(value, from, to), from: to, to: from };
}

/** Keep extremely small or large, finite results readable without displaying them as zero or a 300-digit integer. */
export function usesScientificNotation(value: number): boolean {
  const abs = Math.abs(value);
  return Number.isFinite(value) && abs !== 0 && (abs < 0.000001 || abs >= 1e15);
}

/** Common, realistically-searched values per unit, used to build a quick reference table. */
const COMMON_VALUES: Record<LengthUnit, number[]> = {
  mm: [1, 5, 10, 25, 50, 100],
  cm: [1, 5, 10, 30, 50, 100, 150, 180],
  m: [1, 2, 5, 10, 50, 100],
  km: [1, 5, 10, 50, 100],
  in: [1, 2, 3, 6, 12, 24, 36],
  ft: [1, 2, 3, 5, 6, 10, 50],
  yd: [1, 5, 10, 50, 100],
  mi: [1, 3, 5, 10, 50, 100],
};

export interface QuickTableRow {
  value: number;
  result: number;
}

export function quickTable(from: LengthUnit, to: LengthUnit): QuickTableRow[] {
  return COMMON_VALUES[from].map((value) => ({ value, result: convertLength(value, from, to) }));
}

export interface FeetInches {
  feet: number;
  inches: number;
}

/** Height input: feet + inches -> centimetres. Negative parts are treated as zero. */
export function feetInchesToCm(feet: number, inches: number): number {
  if (!Number.isFinite(feet) || !Number.isFinite(inches)) return 0;
  const totalInches = Math.max(0, feet) * 12 + Math.max(0, inches);
  return totalInches * METERS_PER_UNIT.in * 100;
}

/** Height result: centimetres -> whole feet + inches (rounded to 0.1", carrying into feet at 12"). */
export function cmToFeetInches(cm: number): FeetInches {
  if (!Number.isFinite(cm) || cm <= 0) return { feet: 0, inches: 0 };
  const totalInches = Math.round((cm / 100 / METERS_PER_UNIT.in) * 10) / 10;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round((totalInches - feet * 12) * 10) / 10;
  if (inches >= 12) {
    feet += 1;
    inches -= 12;
  }
  return { feet, inches };
}
