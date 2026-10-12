import { describe, expect, it } from 'vitest';
import { MAX_COUNT, generateIpsum } from './logic';

const latin = (overrides = {}) =>
  generateIpsum(
    { language: 'latin', unit: 'words', count: 12, startWithClassic: false, format: 'plain', ...overrides },
    42,
  );

describe('generateIpsum', () => {
  it('generates exactly the requested number of Latin words', () => {
    const result = latin();
    expect(result.words).toBe(12);
    expect(result.text).toBe(result.plainText);
  });

  it('uses the classic opening when requested', () => {
    const result = latin({ unit: 'sentences', count: 2, startWithClassic: true });
    expect(result.plainText.startsWith('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')).toBe(true);
  });

  it('generates the requested number of paragraphs and wraps each one as HTML', () => {
    const result = latin({ unit: 'paragraphs', count: 3, format: 'html' });
    expect(result.paragraphs).toBe(3);
    expect(result.text.match(/<p>/g)).toHaveLength(3);
    expect(result.text).toContain('</p>\n<p>');
  });

  it('returns an exact Unicode character count for Korean text', () => {
    const result = latin({ language: 'korean', unit: 'characters', count: 57 });
    expect(Array.from(result.plainText)).toHaveLength(57);
    expect(result.characters).toBe(57);
  });

  it('makes Korean sentence output from natural Korean sentence endings', () => {
    const result = latin({ language: 'korean', unit: 'sentences', count: 4 });
    expect(result.plainText).toMatch(/습니다\.$/u);
    expect(result.plainText).toMatch(/가|는|을/u);
  });

  it('clamps empty, fractional, negative and huge counts to the supported range', () => {
    expect(latin({ count: 0 }).words).toBe(1);
    expect(latin({ count: -4 }).words).toBe(1);
    expect(latin({ count: 3.8 }).words).toBe(3);
    expect(latin({ count: Number.POSITIVE_INFINITY }).words).toBe(1);
    expect(latin({ count: MAX_COUNT + 50 }).words).toBe(MAX_COUNT);
  });
});
