/** Pure random-picker logic. Browser randomness and UI timing stay in Tool.tsx. */

export const MAX_ENTRIES = 1_000;
export const MAX_ENTRY_LENGTH = 200;
const UINT32_RANGE = 0x1_0000_0000;

export type RandomSource = () => number;
export type PickerError = 'not-enough-entries' | 'too-many-entries' | 'entry-too-long';

export interface Pick {
  index: number;
  value: string;
}

/**
 * Turns a pasted, one-entry-per-line list into entries. Empty lines are ignored
 * and duplicates intentionally remain: repeating a name represents extra tickets.
 */
export function parseEntries(input: string): string[] {
  return input
    .replace(/^\uFEFF/, '')
    .split(/\r\n?|\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function validateEntries(entries: string[]): PickerError | null {
  if (entries.length < 2) return 'not-enough-entries';
  if (entries.length > MAX_ENTRIES) return 'too-many-entries';
  if (entries.some((entry) => entry.length > MAX_ENTRY_LENGTH)) return 'entry-too-long';
  return null;
}

/**
 * Selects an index with rejection sampling, avoiding modulo bias. `source`
 * must return an unsigned 32-bit integer, as Web Crypto does.
 */
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

export function pickEntry(entries: string[], source: RandomSource): Pick | null {
  if (!entries.length) return null;
  const index = randomIndex(entries.length, source);
  return { index, value: entries[index] ?? '' };
}

/** Returns a fresh list with exactly the selected ticket removed. */
export function removeEntryAt(entries: string[], index: number): string[] {
  if (!Number.isSafeInteger(index) || index < 0 || index >= entries.length) return [...entries];
  return [...entries.slice(0, index), ...entries.slice(index + 1)];
}
