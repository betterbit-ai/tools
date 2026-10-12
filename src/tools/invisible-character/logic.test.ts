import { describe, expect, it } from 'vitest';
import {
  INVISIBLE_CHARACTERS,
  MAX_COUNT,
  getInvisibleCharacter,
  inspectText,
  makeInvisibleText,
  normalizeCount,
} from './logic';

describe('invisible-character generation', () => {
  it('uses the intended Unicode code points', () => {
    expect(INVISIBLE_CHARACTERS.map((item) => [item.id, item.codePoint, item.character])).toEqual([
      ['hangul-filler', 'U+3164', '\u3164'],
      ['braille-blank', 'U+2800', '\u2800'],
      ['zero-width-space', 'U+200B', '\u200B'],
      ['word-joiner', 'U+2060', '\u2060'],
    ]);
  });

  it('generates an exact repeated sequence', () => {
    expect(makeInvisibleText('zero-width-space', 3)).toBe('\u200B\u200B\u200B');
    expect(getInvisibleCharacter('braille-blank').character).toBe('\u2800');
  });

  it('clamps empty, fractional, non-finite and huge counts safely', () => {
    expect(normalizeCount(0)).toBe(1);
    expect(normalizeCount(-4)).toBe(1);
    expect(normalizeCount(2.9)).toBe(2);
    expect(normalizeCount(Number.NaN)).toBe(1);
    expect(normalizeCount(Infinity)).toBe(1);
    expect(normalizeCount(MAX_COUNT + 1)).toBe(MAX_COUNT);
    expect([...makeInvisibleText('hangul-filler', MAX_COUNT + 1)]).toHaveLength(MAX_COUNT);
  });
});

describe('invisible-character inspection', () => {
  it('detects each supported character and groups repeated values', () => {
    expect(inspectText('\u3164\u200B\u200B').entries).toEqual([
      { character: '\u200B', codePoint: 'U+200B', count: 2, id: 'zero-width-space' },
      { character: '\u3164', codePoint: 'U+3164', count: 1, id: 'hangul-filler' },
    ]);
    expect(inspectText('\u3164\u200B\u200B').recognized).toBe(3);
  });

  it('handles empty text, Korean and astral Unicode scalars correctly', () => {
    expect(inspectText('')).toEqual({ characters: 0, recognized: 0, entries: [] });
    expect(inspectText('한😀\u2060')).toEqual({
      characters: 3,
      recognized: 1,
      entries: [
        { character: '\u2060', codePoint: 'U+2060', count: 1, id: 'word-joiner' },
        { character: '한', codePoint: 'U+D55C', count: 1, id: undefined },
        { character: '😀', codePoint: 'U+1F600', count: 1, id: undefined },
      ],
    });
  });
});
