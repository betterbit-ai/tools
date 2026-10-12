import { describe, expect, it } from 'vitest';
import { PDF_CLEANUP_OPTIONS, normalizeLineBreaks, removeLineBreaks } from './logic';

describe('remove-line-breaks', () => {
  it('cleans PDF-style wrapped text while preserving paragraphs', () => {
    const result = removeLineBreaks('A copied paragraph\ncontinues here.\n\nA second paragraph.', PDF_CLEANUP_OPTIONS);
    expect(result).toMatchObject({
      text: 'A copied paragraph continues here.\n\nA second paragraph.',
      inputLineBreaks: 3,
      outputLineBreaks: 2,
      removedLineBreaks: 1,
    });
  });

  it('normalizes Windows, classic Mac and Unicode line separators', () => {
    expect(normalizeLineBreaks('a\r\nb\rc\u2028d\u2029e\u0085f')).toBe('a\nb\nc\nd\ne\nf');
    expect(removeLineBreaks('a\r\nb\rc\u2028d', PDF_CLEANUP_OPTIONS).text).toBe('a b c d');
  });

  it('joins hyphenated Latin words but leaves Korean and uppercase continuations alone', () => {
    expect(removeLineBreaks('infor-\nmation', PDF_CLEANUP_OPTIONS).text).toBe('information');
    expect(removeLineBreaks('well-\nKnown', PDF_CLEANUP_OPTIONS).text).toBe('well- Known');
    expect(removeLineBreaks('한국어-\n문장', PDF_CLEANUP_OPTIONS).text).toBe('한국어- 문장');
  });

  it('keeps recognised list items on separate lines', () => {
    const input = 'Intro line\n- first item\n1. second item\n• third item';
    expect(removeLineBreaks(input, PDF_CLEANUP_OPTIONS).text).toBe(
      'Intro line\n- first item\n1. second item\n• third item',
    );
  });

  it('supports removal and a custom separator', () => {
    expect(removeLineBreaks('01012\n345678', { ...PDF_CLEANUP_OPTIONS, mode: 'remove' }).text).toBe('01012345678');
    expect(
      removeLineBreaks('apple\nbanana\n귤', {
        ...PDF_CLEANUP_OPTIONS,
        mode: 'custom',
        customSeparator: ', ',
        preserveParagraphs: false,
        preserveListItems: false,
      }).text,
    ).toBe('apple, banana, 귤');
  });

  it('handles empty input, emoji and large text without changing user characters', () => {
    expect(removeLineBreaks('', PDF_CLEANUP_OPTIONS)).toMatchObject({ text: '', removedLineBreaks: 0 });
    expect(removeLineBreaks('👍🏽\n안녕하세요\n世界', PDF_CLEANUP_OPTIONS).text).toBe('👍🏽 안녕하세요 世界');

    const input = Array.from({ length: 10_000 }, (_, index) => `line ${index}`).join('\n');
    const result = removeLineBreaks(input, PDF_CLEANUP_OPTIONS);
    expect(result.removedLineBreaks).toBe(9_999);
    expect(result.text.startsWith('line 0 line 1')).toBe(true);
  });
});
