import { describe, expect, it } from 'vitest';
import { analyze, topKeywords } from './logic';

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

describe('topKeywords', () => {
  it('ignores stopwords and single occurrences', () => {
    expect(topKeywords('The cat and the cat and a dog')).toEqual([{ word: 'cat', count: 2 }]);
  });
});
