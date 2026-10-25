import { describe, expect, it } from 'vitest';
import {
  DEFAULT_OPTIONS,
  MAX_TEXT_LENGTH,
  fileExceedsLimit,
  isPdfFile,
  normalizeOptions,
  normalizeText,
  parsePageRanges,
  selectedPageIndexes,
  watermarkedPdfFileName,
  watermarkPosition,
} from './logic';

describe('watermark PDF options', () => {
  it('keeps Unicode text intact and clamps numeric controls', () => {
    const options = normalizeOptions({ text: '  대외비 🔒 样本  ', opacity: 120, size: 0, rotation: -200 });
    expect(options.text).toBe('대외비 🔒 样本');
    expect(options.opacity).toBe(100);
    expect(options.size).toBe(5);
    expect(options.rotation).toBe(-90);
  });

  it('limits text by grapheme clusters without splitting emoji', () => {
    const text = '👩🏽‍💻'.repeat(MAX_TEXT_LENGTH + 2);
    expect(Array.from(new Intl.Segmenter().segment(normalizeText(text))).length).toBe(MAX_TEXT_LENGTH);
  });

  it('uses safe defaults for invalid options', () => {
    expect(normalizeOptions({ mode: 'logo' as 'text', position: 'nowhere' as 'center' })).toEqual(DEFAULT_OPTIONS);
  });
});

describe('page selection', () => {
  it('parses, deduplicates, and sorts page ranges', () => {
    expect(parsePageRanges('5, 1-3, 2, 7-8', 8)).toEqual({ indexes: [0, 1, 2, 4, 6, 7] });
  });

  it('reports empty, malformed, reversed, and out-of-range custom selections', () => {
    expect(parsePageRanges('', 3).error).toBe('empty');
    expect(parsePageRanges('1;2', 3).error).toBe('syntax');
    expect(parsePageRanges('3-1', 3).error).toBe('range');
    expect(parsePageRanges('4', 3).error).toBe('range');
  });

  it('selects all, odd, even, and custom pages with one-based user numbering', () => {
    expect(selectedPageIndexes({ ...DEFAULT_OPTIONS, pageMode: 'all' }, 5).indexes).toEqual([0, 1, 2, 3, 4]);
    expect(selectedPageIndexes({ ...DEFAULT_OPTIONS, pageMode: 'odd' }, 5).indexes).toEqual([0, 2, 4]);
    expect(selectedPageIndexes({ ...DEFAULT_OPTIONS, pageMode: 'even' }, 5).indexes).toEqual([1, 3]);
    expect(selectedPageIndexes({ ...DEFAULT_OPTIONS, pageMode: 'custom', pageRanges: '2-3' }, 5).indexes).toEqual([
      1, 2,
    ]);
  });
});

describe('input and output details', () => {
  it('recognizes PDF extensions and MIME types and rejects impossible file sizes', () => {
    expect(isPdfFile('제출본.PDF', '')).toBe(true);
    expect(isPdfFile('upload', 'application/pdf')).toBe(true);
    expect(isPdfFile('notes.txt', 'text/plain')).toBe(false);
    expect(fileExceedsLimit(0)).toBe(true);
    expect(fileExceedsLimit(Number.NaN)).toBe(true);
    expect(fileExceedsLimit(100 * 1024 * 1024)).toBe(false);
  });

  it('keeps Unicode source names and makes downloaded copies clear', () => {
    expect(watermarkedPdfFileName(' 계약서 최종본.PDF ')).toBe('계약서 최종본_watermarked.pdf');
    expect(watermarkedPdfFileName('')).toBe('document_watermarked.pdf');
  });

  it('places a lower-right mark inside the page margin and centers a central mark', () => {
    expect(watermarkPosition(600, 800, 120, 40, 'bottom-right')).toEqual({ x: 450, y: 30 });
    expect(watermarkPosition(600, 800, 120, 40, 'center')).toEqual({ x: 240, y: 380 });
  });
});
