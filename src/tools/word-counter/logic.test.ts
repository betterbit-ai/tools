import { describe, expect, it } from 'vitest';
import { analyze, countXWeightedLength, fitRepeatedText, topKeywords } from './logic';

describe('analyze', () => {
  it('handles empty text', () => {
    expect(analyze('')).toMatchObject({ characters: 0, words: 0, sentences: 0, paragraphs: 0, bytesUtf8: 0 });
  });

  it('counts English words, characters and sentences', () => {
    const s = analyze('Hello world. This is a test!');
    expect(s.words).toBe(6);
    expect(s.characters).toBe(28);
    expect(s.charactersNoSpaces).toBe(23);
    expect(s.sentences).toBe(2);
  });

  it('counts Korean characters and legacy bytes (Hangul = 2 bytes, newline = 2 bytes)', () => {
    const s = analyze('안녕 하세요\n반가워요');
    expect(s.characters).toBe(11);
    expect(s.charactersNoSpaces).toBe(9);
    expect(s.charactersNoLineBreaks).toBe(10);
    expect(s.words).toBe(3);
    expect(s.paragraphs).toBe(2);
    expect(s.bytesLegacy).toBe(9 * 2 + 1 + 2);
    expect(s.bytesUtf8).toBe(9 * 3 + 1 + 1);
  });

  it('treats CR and Unicode line separators as line breaks', () => {
    const s = analyze('first\rsecond\u2028third');
    expect(s).toMatchObject({
      characters: 18,
      charactersNoLineBreaks: 16,
      paragraphs: 3,
      bytesLegacy: 20,
    });
  });

  it('segments Japanese without spaces into multiple words', () => {
    expect(analyze('私は学生です').words).toBeGreaterThan(1);
  });

  it('counts emoji as one character', () => {
    expect(analyze('👍🏽').characters).toBe(1);
  });

  it('estimates reading time from 238 wpm', () => {
    const text = Array.from({ length: 238 }, () => 'word').join(' ');
    expect(analyze(text).readingSeconds).toBe(60);
  });
});

describe('countXWeightedLength', () => {
  it('uses the official v3 weights for Latin and Hangul', () => {
    expect(countXWeightedLength('a'.repeat(280))).toBe(280);
    expect(countXWeightedLength('가'.repeat(140))).toBe(280);
    expect(countXWeightedLength('Hello 한글')).toBe(10);
  });

  it('counts a URL as 23 and an emoji cluster as 2', () => {
    expect(countXWeightedLength('see https://example.com/a/very/long/path')).toBe(27);
    expect(countXWeightedLength('👨‍👩‍👧‍👦')).toBe(2);
  });

  it('normalizes combining sequences before applying weights', () => {
    expect(countXWeightedLength('e\u0301')).toBe(1);
  });
});

describe('fitRepeatedText', () => {
  it('computes snippet capacities with the live metrics', () => {
    expect(fitRepeatedText(80, '가', 'bytesLegacy')).toEqual({ characters: 40, used: 80, remaining: 0 });
    expect(fitRepeatedText(280, '가', 'xWeightedLength')).toEqual({ characters: 140, used: 280, remaining: 0 });
    expect(fitRepeatedText(5000, '가', 'bytesUtf8')).toEqual({ characters: 1666, used: 4998, remaining: 2 });
  });
});

describe('topKeywords', () => {
  it('ignores stopwords and single occurrences', () => {
    expect(topKeywords('The cat and the cat and a dog')).toEqual([{ word: 'cat', count: 2 }]);
  });
});
