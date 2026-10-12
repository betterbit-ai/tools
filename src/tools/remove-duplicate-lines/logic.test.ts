import { describe, expect, it } from 'vitest';
import { DEFAULT_OPTIONS, removeDuplicateLines, splitLines } from './logic';

describe('remove-duplicate-lines', () => {
  it('keeps the first exact occurrence and preserves its original text', () => {
    expect(removeDuplicateLines('apple\nbanana\napple\nbanana\ncherry')).toMatchObject({
      text: 'apple\nbanana\ncherry',
      inputLines: 5,
      outputLines: 3,
      duplicatesRemoved: 2,
      emptyLinesRemoved: 0,
    });
  });

  it('keeps the last occurrence at its original position', () => {
    expect(removeDuplicateLines('first\nkeep\nfirst\nlast', { ...DEFAULT_OPTIONS, keepOccurrence: 'last' }).text).toBe(
      'keep\nfirst\nlast',
    );
  });

  it('applies matching options without rewriting the retained line', () => {
    const result = removeDuplicateLines('  Apple  \napple\nAPPLE\n pear ', {
      ...DEFAULT_OPTIONS,
      caseSensitive: false,
      trimWhitespace: true,
    });
    expect(result).toMatchObject({ text: '  Apple  \n pear ', duplicatesRemoved: 2 });
  });

  it('normalizes Unicode NFC, including decomposed Korean, but can leave it exact', () => {
    const composed = '가';
    const decomposed = '\u1100\u1161';
    expect(removeDuplicateLines(`${composed}\n${decomposed}`).text).toBe(composed);
    expect(
      removeDuplicateLines(`${composed}\n${decomposed}`, { ...DEFAULT_OPTIONS, normalizeUnicode: false }).text,
    ).toBe(`${composed}\n${decomposed}`);
  });

  it('accepts platform and Unicode line separators, emoji, and empty-line removal', () => {
    expect(splitLines('👍🏽\r\n世界\r👍🏽\u2028\u2029')).toEqual(['👍🏽', '世界', '👍🏽', '', '']);
    expect(removeDuplicateLines('a\n \n\na\n', { ...DEFAULT_OPTIONS, removeEmptyLines: true })).toMatchObject({
      text: 'a',
      inputLines: 5,
      outputLines: 1,
      duplicatesRemoved: 1,
      emptyLinesRemoved: 3,
    });
  });

  it('sorts retained lines naturally when requested', () => {
    expect(
      removeDuplicateLines('item 10\nitem 2\nitem 1\nitem 2', {
        ...DEFAULT_OPTIONS,
        sortOrder: 'ascending',
      }).text,
    ).toBe('item 1\nitem 2\nitem 10');
  });

  it('handles empty and large input with linear de-duplication', () => {
    expect(removeDuplicateLines('')).toMatchObject({ text: '', inputLines: 0, outputLines: 0, duplicatesRemoved: 0 });

    const input = Array.from({ length: 20_000 }, (_, index) => `line ${index % 500}`).join('\n');
    const result = removeDuplicateLines(input);
    expect(result).toMatchObject({ inputLines: 20_000, outputLines: 500, duplicatesRemoved: 19_500 });
    expect(result.text.endsWith('line 499')).toBe(true);
  });
});
