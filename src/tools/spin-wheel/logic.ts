/** Pure spin-wheel logic. Browser randomness and animation stay in Tool.tsx. */

export const MAX_ENTRIES = 100;
export const MAX_ENTRY_LENGTH = 80;
const UINT32_RANGE = 0x1_0000_0000;

export type RandomSource = () => number;
export type WheelError = 'not-enough-entries' | 'too-many-entries' | 'entry-too-long';

export interface WheelPick {
  index: number;
  value: string;
}

/** Parses a one-item-per-line list. Duplicate lines deliberately remain tickets. */
export function parseEntries(input: string): string[] {
  return input
    .replace(/^\uFEFF/, '')
    .split(/\r\n?|\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function validateEntries(entries: string[]): WheelError | null {
  if (entries.length < 2) return 'not-enough-entries';
  if (entries.length > MAX_ENTRIES) return 'too-many-entries';
  if (entries.some((entry) => entry.length > MAX_ENTRY_LENGTH)) return 'entry-too-long';
  return null;
}

/** Uses rejection sampling, so every wheel segment gets the same probability. */
export function randomIndex(length: number, source: RandomSource): number {
  if (!Number.isSafeInteger(length) || length < 1 || length > UINT32_RANGE) {
    throw new RangeError('Expected a list length from 1 through 2³².');
  }
  const limit = Math.floor(UINT32_RANGE / length) * length;
  let value: number;
  do {
    value = source();
    if (!Number.isInteger(value) || value < 0 || value >= UINT32_RANGE) {
      throw new RangeError('Random source must return an unsigned 32-bit integer.');
    }
  } while (value >= limit);
  return value % length;
}

export function pickEntry(entries: string[], source: RandomSource): WheelPick | null {
  if (!entries.length) return null;
  const index = randomIndex(entries.length, source);
  return { index, value: entries[index] ?? '' };
}

/** Removes exactly one ticket without changing the caller's list. */
export function removeEntryAt(entries: string[], index: number): string[] {
  if (!Number.isSafeInteger(index) || index < 0 || index >= entries.length) return [...entries];
  return [...entries.slice(0, index), ...entries.slice(index + 1)];
}

/**
 * Rotation in degrees that brings the selected segment's centre to the pointer
 * at 12 o'clock. Extra full turns preserve forward motion for the animation.
 */
export function targetRotation(current: number, index: number, length: number, turns = 5): number {
  if (!Number.isInteger(index) || index < 0 || index >= length || !Number.isInteger(length) || length < 1) {
    throw new RangeError('Expected a valid segment index and wheel length.');
  }
  const segment = 360 / length;
  const desired = -((index + 0.5) * segment);
  const normalizedCurrent = ((current % 360) + 360) % 360;
  const normalizedDesired = ((desired % 360) + 360) % 360;
  return current + turns * 360 + ((normalizedDesired - normalizedCurrent + 360) % 360);
}
