/**
 * Pure random-number logic. The caller supplies 32-bit random values so this
 * module stays independent of the browser's Web Crypto API and easy to test.
 */

export const MIN_VALUE = -1_000_000_000;
export const MAX_VALUE = 1_000_000_000;
export const MAX_COUNT = 10_000;
const UINT32_RANGE = 0x1_0000_0000;

export type SortOrder = 'draw' | 'asc' | 'desc';
export type RandomSource = () => number;

export interface RandomSettings {
  min: number;
  max: number;
  count: number;
  unique: boolean;
  sort: SortOrder;
}

export type ValidationError = 'invalid-bounds' | 'invalid-count' | 'range-order' | 'too-many-unique';

export type GenerationResult = { ok: true; values: number[] } | { ok: false; error: ValidationError };

export function validateSettings(settings: RandomSettings): ValidationError | null {
  const { min, max, count, unique } = settings;
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min < MIN_VALUE || max > MAX_VALUE) {
    return 'invalid-bounds';
  }
  if (min > max) return 'range-order';
  if (!Number.isSafeInteger(count) || count < 1 || count > MAX_COUNT) return 'invalid-count';
  if (unique && count > max - min + 1) return 'too-many-unique';
  return null;
}

/**
 * Selects one integer in the inclusive range without modulo bias. `source`
 * must return an unsigned 32-bit integer, as supplied by crypto.getRandomValues.
 */
export function randomInteger(min: number, max: number, source: RandomSource): number {
  const span = max - min + 1;
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min > max || span > UINT32_RANGE) {
    throw new RangeError('Expected an inclusive safe-integer range no wider than 2³² values.');
  }

  const limit = Math.floor(UINT32_RANGE / span) * span;
  let value: number;
  do {
    value = source();
    if (!Number.isInteger(value) || value < 0 || value >= UINT32_RANGE) {
      throw new RangeError('Random source must return an unsigned 32-bit integer.');
    }
  } while (value >= limit);
  return min + (value % span);
}

export function generateNumbers(settings: RandomSettings, source: RandomSource): GenerationResult {
  const error = validateSettings(settings);
  if (error) return { ok: false, error };

  const values = settings.unique
    ? sampleWithoutReplacement(settings.min, settings.max, settings.count, source)
    : Array.from({ length: settings.count }, () => randomInteger(settings.min, settings.max, source));

  if (settings.sort === 'asc') values.sort((a, b) => a - b);
  if (settings.sort === 'desc') values.sort((a, b) => b - a);
  return { ok: true, values };
}

/**
 * Partial Fisher–Yates shuffle: returns `count` distinct values while using
 * O(count) memory, rather than allocating the full selected range.
 */
function sampleWithoutReplacement(min: number, max: number, count: number, source: RandomSource): number[] {
  const span = max - min + 1;
  const swaps = new Map<number, number>();
  const values: number[] = [];

  for (let index = 0; index < count; index++) {
    const remaining = span - index;
    const selectedIndex = randomInteger(0, remaining - 1, source);
    const selected = swaps.get(selectedIndex) ?? selectedIndex;
    const lastIndex = remaining - 1;
    swaps.set(selectedIndex, swaps.get(lastIndex) ?? lastIndex);
    values.push(min + selected);
  }
  return values;
}

export function formatNumbers(values: readonly number[], separator = '\n'): string {
  return values.join(separator);
}
