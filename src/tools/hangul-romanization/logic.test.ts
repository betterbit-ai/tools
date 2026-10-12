import { describe, expect, it } from 'vitest';
import { hasHangul, romanize } from './logic';

describe('hangul-romanization', () => {
  it('maps the official Revised Romanization consonant and vowel tables', () => {
    expect(romanize('가나다라마바사아자차카타파하')).toBe('Ganadaramabasaajachakatapaha');
    expect(romanize('서울 부산 경복궁')).toBe('Seoul Busan Gyeongbokgung');
  });

  it('applies liaison, nasalisation, lateralisation and palatalisation at syllable boundaries', () => {
    expect(romanize('한국어')).toBe('Hangugeo');
    expect(romanize('종로 신라 독립문')).toBe('Jongno Silla Dongnimmun');
    expect(romanize('같이 밭이')).toBe('Gachi Bachi');
  });

  it('keeps non-Hangul text and Unicode intact', () => {
    expect(romanize('안녕, world! 😀 2026')).toBe('Annyeong, world! 😀 2026');
    expect(romanize('\u1100\u1161')).toBe('Ga');
  });

  it('offers a passport-friendly name format without sound changes between given-name syllables', () => {
    expect(romanize('김민수', 'name')).toBe('Kim Minsu');
    expect(romanize('박복남', 'name')).toBe('Park Boknam');
  });

  it('handles empty and large input without losing characters', () => {
    expect(romanize('')).toBe('');
    const input = '한글 abc 😀 '.repeat(10_000);
    const output = romanize(input);
    expect(output).toContain('Hangeul abc 😀');
    expect(output.length).toBeGreaterThan(input.length);
  });

  it('recognises only modern Hangul syllables', () => {
    expect(hasHangul('한글')).toBe(true);
    expect(hasHangul('abc 😀')).toBe(false);
  });
});
