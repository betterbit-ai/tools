import { describe, expect, it } from 'vitest';
import {
  characterCount,
  extractedTextFileName,
  fileExceedsLimit,
  isPdfFile,
  joinPageText,
  MAX_FILE_BYTES,
  MAX_PAGE_COUNT,
  MAX_TEXT_CHARACTERS,
  pageCountExceedsLimit,
  textExceedsLimit,
  textFromPdfItems,
} from './logic';

describe('pdf-to-text logic', () => {
  it('recognizes PDF MIME types and filename extensions', () => {
    expect(isPdfFile('report.pdf', '')).toBe(true);
    expect(isPdfFile('REPORT.PDF', 'text/plain')).toBe(true);
    expect(isPdfFile('scan', 'Application/PDF; charset=binary')).toBe(true);
    expect(isPdfFile('report.txt', 'text/plain')).toBe(false);
  });

  it('enforces browser-safety file and page boundaries', () => {
    expect(fileExceedsLimit(MAX_FILE_BYTES)).toBe(false);
    expect(fileExceedsLimit(MAX_FILE_BYTES + 1)).toBe(true);
    expect(fileExceedsLimit(-1)).toBe(true);
    expect(fileExceedsLimit(Number.NaN)).toBe(true);
    expect(pageCountExceedsLimit(1)).toBe(false);
    expect(pageCountExceedsLimit(MAX_PAGE_COUNT)).toBe(false);
    expect(pageCountExceedsLimit(MAX_PAGE_COUNT + 1)).toBe(true);
    expect(pageCountExceedsLimit(0)).toBe(true);
  });

  it('preserves Unicode and explicit PDF line endings', () => {
    const text = textFromPdfItems([
      { str: '한글 ' },
      { str: 'PDF', hasEOL: true },
      { str: '😀 CJK 漢字', hasEOL: true },
    ]);
    expect(text).toBe('한글 PDF\n😀 CJK 漢字');
    expect(characterCount('가😀漢')).toBe(3);
  });

  it('does not create duplicate newlines after an item that already ends a line', () => {
    expect(textFromPdfItems([{ str: 'First\n', hasEOL: true }, { str: 'Second' }])).toBe('First\nSecond');
  });

  it('joins pages as readable plain text and applies the output boundary', () => {
    expect(
      joinPageText([
        { pageNumber: 1, text: '첫 페이지' },
        { pageNumber: 2, text: 'Second page' },
      ]),
    ).toBe('첫 페이지\n\nSecond page');
    expect(textExceedsLimit('a'.repeat(MAX_TEXT_CHARACTERS))).toBe(false);
    expect(textExceedsLimit('a'.repeat(MAX_TEXT_CHARACTERS + 1))).toBe(true);
  });

  it('creates safe downloaded TXT filenames without losing Unicode', () => {
    expect(extractedTextFileName('보고서.pdf')).toBe('보고서.txt');
    expect(extractedTextFileName('../report.PDF')).toBe('.._report.txt');
    expect(extractedTextFileName('   ')).toBe('document.txt');
  });
});
