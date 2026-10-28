import { describe, expect, it } from 'vitest';
import { DEFAULT_OPTIONS, findAndReplace } from './logic';

describe('findAndReplace', () => {
  it('replaces every literal occurrence and reports the live count', () => {
    expect(findAndReplace('red fish, red fish', 'red', 'blue')).toEqual({
      text: 'blue fish, blue fish',
      matchCount: 2,
      error: null,
    });
  });

  it('treats regex characters and dollar signs literally in plain-text mode', () => {
    expect(findAndReplace('a.b axb a.b', 'a.b', '$5')).toMatchObject({ text: '$5 axb $5', matchCount: 2 });
  });

  it('respects the case-sensitive option', () => {
    expect(findAndReplace('Word word WORD', 'word', 'term')).toMatchObject({
      text: 'term term term',
      matchCount: 3,
    });
    expect(findAndReplace('Word word WORD', 'word', 'term', { ...DEFAULT_OPTIONS, caseSensitive: true })).toMatchObject(
      {
        text: 'Word term WORD',
        matchCount: 1,
      },
    );
  });

  it('uses Unicode-aware whole-word boundaries without splitting Korean or accented text', () => {
    const result = findAndReplace('cat catalog cat! café cat', 'cat', 'dog', {
      ...DEFAULT_OPTIONS,
      wholeWord: true,
    });
    expect(result).toMatchObject({ text: 'dog catalog dog! café dog', matchCount: 3 });
    expect(findAndReplace('가나다 가', '가', '나', { ...DEFAULT_OPTIONS, wholeWord: true })).toMatchObject({
      text: '가나다 나',
      matchCount: 1,
    });
    expect(findAndReplace('a ba b', 'a|b', 'x', { ...DEFAULT_OPTIONS, regex: true, wholeWord: true })).toMatchObject({
      text: 'x ba x',
      matchCount: 2,
    });
  });

  it('supports regex capture groups and JavaScript replacement tokens', () => {
    expect(
      findAndReplace('2026-10-28\n2025-01-02', '(\\d{4})-(\\d{2})-(\\d{2})', '$3/$2/$1', {
        ...DEFAULT_OPTIONS,
        regex: true,
      }),
    ).toMatchObject({ text: '28/10/2026\n02/01/2025', matchCount: 2 });
  });

  it('returns the original input and an error for an invalid regex', () => {
    const result = findAndReplace('hello', '(', 'x', { ...DEFAULT_OPTIONS, regex: true });
    expect(result).toMatchObject({ text: 'hello', matchCount: 0 });
    expect(result.error).toBeTruthy();
  });

  it('does nothing for an empty search, including empty input', () => {
    expect(findAndReplace('', '', 'x')).toEqual({ text: '', matchCount: 0, error: null });
    expect(findAndReplace('emoji 👍🏽 and 한글', '', 'x')).toMatchObject({
      text: 'emoji 👍🏽 and 한글',
      matchCount: 0,
    });
  });

  it('handles a large input while preserving Unicode text', () => {
    const input = Array.from({ length: 20_000 }, (_, index) => `item-${index % 10}-한글👍🏽`).join('\n');
    const result = findAndReplace(input, 'item-3', 'entry-3');
    expect(result.matchCount).toBe(2_000);
    expect(result.text.includes('entry-3-한글👍🏽')).toBe(true);
  });
});
