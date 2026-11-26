import { describe, expect, it } from 'vitest';
import { STYLES, changesText, characterCount, transformText } from './logic';

describe('transformText', () => {
  it('maps Latin letters and digits to mathematical bold characters', () => {
    expect(transformText('Az 09', 'bold')).toBe('𝐀𝐳 𝟎𝟗');
  });

  it('leaves characters unsupported by an alphabet style intact', () => {
    expect(transformText('안녕 😀!', 'script')).toBe('안녕 😀!');
  });

  it('offers decorations that work with Korean, CJK and emoji', () => {
    expect(transformText('안녕 世界😀', 'brackets')).toBe('【안녕 世界😀】');
    expect(transformText('안녕', 'strikethrough')).toBe('안̶녕̶');
  });

  it('does not add combining marks to whitespace', () => {
    expect(transformText('A B\nC', 'strikethrough')).toBe('A̶ B̶\nC̶');
  });

  it('keeps a joined emoji, a flag and an accent whole when spacing out or striking through', () => {
    expect(transformText('🇰🇷 가족 👨‍👩‍👧', 'spaced')).toBe('🇰🇷 가 족 👨‍👩‍👧');
    expect(transformText('🇰🇷 👨‍👩‍👧 é', 'strikethrough')).toBe('🇰🇷̶ 👨‍👩‍👧̶ é̶');
  });

  it('treats an existing space as a separator instead of doubling it', () => {
    expect(transformText('A B', 'spaced')).toBe('A B');
    expect(transformText('가족  사진', 'spaced')).toBe('가 족 사 진');
    expect(transformText('A B\nC', 'spaced')).toBe('A B\nC');
  });

  it('handles empty and very long input', () => {
    const text = 'ab😀'.repeat(10_000);
    expect(transformText('', 'sparkles')).toBe('');
    expect(characterCount(transformText(text, 'bold'))).toBe(characterCount(text));
  });
});

describe('style metadata', () => {
  it('has a unique, transformable result for every defined style', () => {
    expect(new Set(STYLES.map((style) => style.id)).size).toBe(STYLES.length);
    expect(STYLES.every((style) => changesText('Hello 123', style.id))).toBe(true);
  });

  it('reports when a Latin-only style cannot change Korean-only text', () => {
    expect(changesText('한글', 'bold')).toBe(false);
    expect(changesText('한글', 'sparkles')).toBe(true);
  });

  it('counts a flag or a joined family emoji as one character', () => {
    expect(characterCount('A😀')).toBe(2);
    expect(characterCount('🇰🇷 가족 👨‍👩‍👧 1')).toBe(8);
    expect(characterCount('é')).toBe(1);
  });
});
