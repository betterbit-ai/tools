import { describe, expect, it } from 'vitest';
import {
  MAX_COUNT,
  MAX_VALUE,
  MIN_VALUE,
  formatNumbers,
  generateNumbers,
  randomInteger,
  validateSettings,
  type RandomSource,
} from './logic';

function sourceFrom(values: number[]): RandomSource {
  let index = 0;
  return () => values[index++] ?? 0;
}

const defaults = { min: 1, max: 100, count: 1, unique: false, sort: 'draw' as const };

describe('random-number', () => {
  it('includes both bounds and rejects the modulo-bias tail', () => {
    expect(randomInteger(1, 10, sourceFrom([0]))).toBe(1);
    expect(randomInteger(1, 10, sourceFrom([9]))).toBe(10);
    expect(randomInteger(1, 10, sourceFrom([0xffff_ffff, 19]))).toBe(10);
  });

  it('draws repeated values when replacement is allowed and sorts when requested', () => {
    const result = generateNumbers({ ...defaults, min: -2, max: 2, count: 3, sort: 'asc' }, sourceFrom([4, 0, 4]));
    expect(result).toEqual({ ok: true, values: [-2, 2, 2] });
  });

  it('generates unique values without allocating or repeating the selected range', () => {
    const result = generateNumbers(
      { ...defaults, min: 1, max: 5, count: 5, unique: true },
      sourceFrom([0, 0, 0, 0, 0]),
    );
    expect(result).toEqual({ ok: true, values: [1, 5, 4, 3, 2] });
    if (result.ok) expect(new Set(result.values).size).toBe(5);
  });

  it('reports invalid settings instead of producing a partial result', () => {
    expect(validateSettings({ ...defaults, min: Number.NaN })).toBe('invalid-bounds');
    expect(validateSettings({ ...defaults, min: MIN_VALUE - 1 })).toBe('invalid-bounds');
    expect(validateSettings({ ...defaults, max: MAX_VALUE + 1 })).toBe('invalid-bounds');
    expect(validateSettings({ ...defaults, min: 4, max: 3 })).toBe('range-order');
    expect(validateSettings({ ...defaults, count: 0 })).toBe('invalid-count');
    expect(validateSettings({ ...defaults, count: MAX_COUNT + 1 })).toBe('invalid-count');
    expect(validateSettings({ ...defaults, min: 1, max: 2, count: 3, unique: true })).toBe('too-many-unique');
  });

  it('keeps large valid boundaries exact', () => {
    const result = generateNumbers(
      { ...defaults, min: MIN_VALUE, max: MAX_VALUE, count: 2 },
      sourceFrom([0, 2_000_000_000]),
    );
    expect(result).toEqual({ ok: true, values: [MIN_VALUE, MAX_VALUE] });
  });

  it('preserves Unicode separators when formatting output for copying', () => {
    expect(formatNumbers([7, 42], ' · 한글 · 😀 ')).toBe('7 · 한글 · 😀 42');
  });
});
