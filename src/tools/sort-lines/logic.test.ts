import { describe, expect, it } from 'vitest';
import { DEFAULT_OPTIONS, sortTextLines, splitLines } from './logic';

describe('sort-lines', () => {
  it('sorts text naturally by default while retaining the original spelling', () => {
    expect(sortTextLines('item 10\nItem 2\nitem 1').text).toBe('item 1\nItem 2\nitem 10');
  });

  it('can use strict character order and reverse alphabetical order', () => {
    expect(sortTextLines('item 10\nitem 2', { ...DEFAULT_OPTIONS, naturalOrder: false }).text).toBe('item 10\nitem 2');
    expect(sortTextLines('apple\nbanana\ncherry', { ...DEFAULT_OPTIONS, mode: 'reverse-alphabetical' }).text).toBe(
      'cherry\nbanana\napple',
    );
  });

  it('uses the requested locale for Korean 가나다순 and keeps equal comparisons stable', () => {
    expect(sortTextLines('하늘\n가나\n다람쥐', DEFAULT_OPTIONS, 'ko').text).toBe('가나\n다람쥐\n하늘');
    expect(sortTextLines('Apple\napple\nAPPLE', DEFAULT_OPTIONS, 'en').text).toBe('Apple\napple\nAPPLE');
  });

  it('reverses original order without comparing and shuffles with Fisher–Yates', () => {
    expect(sortTextLines('third\nfirst\nsecond', { ...DEFAULT_OPTIONS, mode: 'reverse' }).text).toBe(
      'second\nfirst\nthird',
    );
    expect(sortTextLines('a\nb\nc', { ...DEFAULT_OPTIONS, mode: 'shuffle' }, 'en', () => 0).text).toBe('b\nc\na');
  });

  it('trims, drops empty lines, and de-duplicates using Unicode-normalized matching', () => {
    const decomposed = '\u1100\u1161';
    expect(
      sortTextLines(`  Apple  \napple\n \n가\n${decomposed}`, {
        ...DEFAULT_OPTIONS,
        trimWhitespace: true,
        removeEmptyLines: true,
        removeDuplicates: true,
      }).text,
    ).toBe('Apple\n가');
  });

  it('handles all common line separators, emoji, empty input, and a large list', () => {
    expect(splitLines('👍🏽\r\n世界\r👍🏽\u2028\u2029')).toEqual(['👍🏽', '世界', '👍🏽', '', '']);
    expect(sortTextLines('')).toMatchObject({ text: '', inputLines: 0, outputLines: 0, removedLines: 0 });

    const input = Array.from({ length: 20_000 }, (_, index) => `line ${index}`)
      .reverse()
      .join('\n');
    const result = sortTextLines(input);
    expect(result).toMatchObject({ inputLines: 20_000, outputLines: 20_000, removedLines: 0 });
    expect(result.text.startsWith('line 0\nline 1')).toBe(true);
    expect(result.text.endsWith('line 19999')).toBe(true);
  });
});
