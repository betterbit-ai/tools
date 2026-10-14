/** Pure data-size conversions. This module deliberately has no browser or UI dependencies. */

export type DataUnit = 'bit' | 'B' | 'kB' | 'MB' | 'GB' | 'TB' | 'PB' | 'KiB' | 'MiB' | 'GiB' | 'TiB' | 'PiB';

export const DATA_UNITS: DataUnit[] = ['bit', 'B', 'kB', 'MB', 'GB', 'TB', 'PB', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];

/** SI prefixes use powers of 1,000; IEC prefixes use powers of 1,024. */
export const BYTES_PER_UNIT: Record<DataUnit, number> = {
  bit: 1 / 8,
  B: 1,
  kB: 1_000,
  MB: 1_000_000,
  GB: 1_000_000_000,
  TB: 1_000_000_000_000,
  PB: 1_000_000_000_000_000,
  KiB: 1_024,
  MiB: 1_048_576,
  GiB: 1_073_741_824,
  TiB: 1_099_511_627_776,
  PiB: 1_125_899_906_842_624,
};

export const DECIMAL_UNITS: DataUnit[] = ['kB', 'MB', 'GB', 'TB', 'PB'];
export const BINARY_UNITS: DataUnit[] = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB'];

/** A display guardrail that keeps byte calculations within JavaScript's safe integer range. */
export const MAX_BYTES = Number.MAX_SAFE_INTEGER;

export function isDataUnit(value: unknown): value is DataUnit {
  return typeof value === 'string' && (DATA_UNITS as string[]).includes(value);
}

/**
 * Accepts ordinary grouped values and full-width digits pasted from Korean keyboards.
 * Unit symbols and other prose are intentionally rejected so the unit selector stays authoritative.
 */
export function parseDataSizeNumber(value: number | string): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const normalized = value.normalize('NFKC').trim().replaceAll(',', '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function bytesFrom(value: number, unit: DataUnit): number | null {
  if (!Number.isFinite(value) || value < 0 || !isDataUnit(unit)) return null;
  const bytes = value * BYTES_PER_UNIT[unit];
  return Number.isSafeInteger(bytes) || (bytes >= 0 && bytes <= MAX_BYTES) ? bytes : null;
}

/** Converts a non-negative data size between supported, explicitly labelled units. Invalid input yields 0. */
export function convertDataSize(value: number, from: DataUnit, to: DataUnit): number {
  const bytes = bytesFrom(value, from);
  if (bytes === null || !isDataUnit(to)) return 0;
  return bytes / BYTES_PER_UNIT[to];
}

export interface DataSizeResults {
  bits: number;
  bytes: number;
  decimal: { unit: DataUnit; value: number }[];
  binary: { unit: DataUnit; value: number }[];
}

/** Returns both formal systems from a shared byte value, so no unit labels are silently repurposed. */
export function dataSizeResults(value: number, from: DataUnit): DataSizeResults {
  const bytes = bytesFrom(value, from) ?? 0;
  return {
    bits: bytes * 8,
    bytes,
    decimal: DECIMAL_UNITS.map((unit) => ({ unit, value: bytes / BYTES_PER_UNIT[unit] })),
    binary: BINARY_UNITS.map((unit) => ({ unit, value: bytes / BYTES_PER_UNIT[unit] })),
  };
}
