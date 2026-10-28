import { describe, expect, it } from 'vitest';
import {
  reverseCharacters,
  reverseEachWord,
  reverseLines,
  reverseText,
  reverseWords,
  splitGraphemes,
  textStats,
  upsideDown,
} from './logic';

describe('reverse-text', () => {
  it('reverses visible characters and empty text', () => {
    expect(reverseCharacters('Hello, world!')).toBe('!dlrow ,olleH');
    expect(reverseCharacters('')).toBe('');
  });

  it('keeps grapheme clusters, flags, and Hangul syllables whole', () => {
    expect(splitGraphemes('e\u0301👋🏽👨‍👩‍👧‍👦🇰🇷')).toEqual(['e\u0301', '👋🏽', '👨‍👩‍👧‍👦', '🇰🇷']);
    expect(reverseCharacters('안녕 👋🏽 e\u0301')).toBe('e\u0301 👋🏽 녕안');
  });

  it('reverses word order per line without normalizing whitespace', () => {
    expect(reverseWords('one  two\nthree four')).toBe('two  one\nfour three');
    expect(reverseEachWord('one  two\n안녕')).toBe('eno  owt\n녕안');
  });

  it('reverses lines and preserves a final line ending', () => {
    expect(reverseLines('first\r\nsecond\r\nthird\r\n')).toBe('third\r\nsecond\r\nfirst\r\n');
    expect(reverseLines('')).toBe('');
  });

  it('creates approximate upside-down Latin text while preserving unsupported scripts', () => {
    expect(upsideDown('Hello!')).toBe('¡ollǝH');
    expect(upsideDown('안녕 A')).toBe('∀ 녕안');
  });

  it('dispatches every mode and reports input statistics', () => {
    expect(reverseText('one two', 'characters')).toBe('owt eno');
    expect(reverseText('one two', 'words')).toBe('two one');
    expect(reverseText('one two', 'each-word')).toBe('eno owt');
    expect(reverseText('one\ntwo', 'lines')).toBe('two\none');
    expect(reverseText('abc', 'upside-down')).toBe('ɔqɐ');
    expect(textStats('안녕 👋🏽\n')).toEqual({ graphemes: 5, words: 2, lines: 2 });
  });

  it('handles a large input without truncation', () => {
    const input = '가'.repeat(100_000);
    expect(reverseCharacters(input)).toBe(input);
    expect(textStats(input).graphemes).toBe(100_000);
  });
});
