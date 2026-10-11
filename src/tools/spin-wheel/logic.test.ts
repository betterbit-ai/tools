import { describe, expect, it } from 'vitest';
import {
  MAX_ENTRIES,
  MAX_ENTRY_LENGTH,
  parseEntries,
  pickEntry,
  randomIndex,
  removeEntryAt,
  targetRotation,
  validateEntries,
  type RandomSource,
} from './logic';

function sourceFrom(values: number[]): RandomSource {
  let index = 0;
  return () => values[index++] ?? 0;
}

describe('spin-wheel', () => {
  it('parses pasted Unicode lines, trims whitespace, and retains duplicate tickets', () => {
    expect(parseEntries('\uFEFF Alex \r\n\n김민지\n😀 Prize\nAlex ')).toEqual(['Alex', '김민지', '😀 Prize', 'Alex']);
  });

  it('rejects empty, oversized, and overly long wheels', () => {
    expect(validateEntries([])).toBe('not-enough-entries');
    expect(validateEntries(['only one'])).toBe('not-enough-entries');
    expect(validateEntries(Array.from({ length: MAX_ENTRIES + 1 }, () => 'ticket'))).toBe('too-many-entries');
    expect(validateEntries(['A', 'x'.repeat(MAX_ENTRY_LENGTH + 1)])).toBe('entry-too-long');
    expect(validateEntries(['A', 'B'])).toBeNull();
  });

  it('selects boundary segments and rejects the modulo-bias tail', () => {
    expect(randomIndex(3, sourceFrom([0]))).toBe(0);
    expect(randomIndex(3, sourceFrom([2]))).toBe(2);
    expect(randomIndex(3, sourceFrom([0xffff_ffff, 5]))).toBe(2);
  });

  it('picks and removes one Unicode duplicate without mutating the list', () => {
    const entries = ['가나다', '😀', '가나다'];
    expect(pickEntry(entries, sourceFrom([2]))).toEqual({ index: 2, value: '가나다' });
    expect(removeEntryAt(entries, 0)).toEqual(['😀', '가나다']);
    expect(removeEntryAt(entries, 9)).toEqual(entries);
    expect(entries).toEqual(['가나다', '😀', '가나다']);
  });

  it('lands the selected segment at the pointer after forward rotations', () => {
    expect(targetRotation(0, 0, 4)).toBe(2115);
    expect(targetRotation(90, 3, 4)).toBe(2205);
    expect(() => targetRotation(0, 2, 2)).toThrow(RangeError);
  });

  it('rejects invalid random sources and list dimensions', () => {
    expect(() => randomIndex(0, sourceFrom([0]))).toThrow(RangeError);
    expect(() => randomIndex(2, sourceFrom([-1]))).toThrow(RangeError);
    expect(() => randomIndex(2, sourceFrom([1.5]))).toThrow(RangeError);
  });
});
