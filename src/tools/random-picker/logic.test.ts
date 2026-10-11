import { describe, expect, it } from 'vitest';
import {
  MAX_ENTRIES,
  MAX_ENTRY_LENGTH,
  parseEntries,
  pickEntry,
  randomIndex,
  removeEntryAt,
  validateEntries,
  type RandomSource,
} from './logic';

function sourceFrom(values: number[]): RandomSource {
  let index = 0;
  return () => values[index++] ?? 0;
}

describe('random-picker', () => {
  it('parses pasted lines, trims surrounding whitespace, and keeps duplicate tickets', () => {
    expect(parseEntries('\uFEFF Alice \r\n\n김민지\n😀 Prize\nAlice ')).toEqual([
      'Alice',
      '김민지',
      '😀 Prize',
      'Alice',
    ]);
  });

  it('validates empty, oversized, and very long lists before a draw', () => {
    expect(validateEntries([])).toBe('not-enough-entries');
    expect(validateEntries(['only one'])).toBe('not-enough-entries');
    expect(validateEntries(Array.from({ length: MAX_ENTRIES + 1 }, () => 'name'))).toBe('too-many-entries');
    expect(validateEntries(['A', 'x'.repeat(MAX_ENTRY_LENGTH + 1)])).toBe('entry-too-long');
    expect(validateEntries(['A', 'B'])).toBeNull();
  });

  it('selects every boundary and rejects the modulo-bias tail', () => {
    expect(randomIndex(3, sourceFrom([0]))).toBe(0);
    expect(randomIndex(3, sourceFrom([2]))).toBe(2);
    expect(randomIndex(3, sourceFrom([0xffff_ffff, 5]))).toBe(2);
  });

  it('picks Unicode entries and removes one selected duplicate without mutating the list', () => {
    const entries = ['가나다', '😀', '가나다'];
    expect(pickEntry(entries, sourceFrom([2]))).toEqual({ index: 2, value: '가나다' });
    expect(removeEntryAt(entries, 0)).toEqual(['😀', '가나다']);
    expect(removeEntryAt(entries, 9)).toEqual(entries);
    expect(entries).toEqual(['가나다', '😀', '가나다']);
  });

  it('rejects invalid random sources and invalid dimensions', () => {
    expect(() => randomIndex(0, sourceFrom([0]))).toThrow(RangeError);
    expect(() => randomIndex(2, sourceFrom([-1]))).toThrow(RangeError);
    expect(() => randomIndex(2, sourceFrom([1.5]))).toThrow(RangeError);
  });
});
