import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  fileExceedsLimit,
  formatPageSelection,
  isPdfFile,
  MAX_FILE_BYTES,
  MAX_PAGE_SELECTION_CHARS,
  normalizeSettings,
  numberedPdfFileName,
  pageNumberPlacement,
  PageRangeOutOfBoundsError,
  PageRangeSyntaxError,
  PageRangeTooLongError,
  parsePageSelection,
  renderPageLabel,
  templateForFormat,
} from './logic';

describe('pdf-page-numbers', () => {
  it('recognizes PDF MIME types and filenames', () => {
    expect(isPdfFile('report.PDF', '')).toBe(true);
    expect(isPdfFile('report', 'application/pdf; charset=binary')).toBe(true);
    expect(isPdfFile('report.pdf.exe', 'application/octet-stream')).toBe(false);
  });

  it('keeps browser file limits finite and inclusive', () => {
    expect(fileExceedsLimit(MAX_FILE_BYTES)).toBe(false);
    expect(fileExceedsLimit(MAX_FILE_BYTES + 1)).toBe(true);
    expect(fileExceedsLimit(-1)).toBe(true);
    expect(fileExceedsLimit(Number.NaN)).toBe(true);
  });

  it('parses and compacts unique ascending page ranges', () => {
    expect(parsePageSelection('5, 1-3, 3-4', 6)).toEqual([1, 2, 3, 4, 5]);
    expect(parsePageSelection('all', 3)).toEqual([1, 2, 3]);
    expect(formatPageSelection([5, 1, 2, 3, 5, 7, 9, 10])).toBe('1-3, 5, 7, 9-10');
  });

  it('rejects invalid, oversized, and out-of-bounds page ranges', () => {
    expect(() => parsePageSelection('0', 3)).toThrow(PageRangeSyntaxError);
    expect(() => parsePageSelection('4', 3)).toThrow(PageRangeOutOfBoundsError);
    expect(() => parsePageSelection('3-2', 3)).toThrow(PageRangeSyntaxError);
    expect(() => parsePageSelection('1'.repeat(MAX_PAGE_SELECTION_CHARS + 1), 3)).toThrow(PageRangeTooLongError);
  });

  it('normalizes persisted settings to safe PDF point values', () => {
    expect(normalizeSettings({ fontSize: 0, margin: 999, firstNumber: -4 })).toEqual({
      ...DEFAULT_SETTINGS,
      fontSize: 6,
      margin: 144,
      firstNumber: 0,
    });
    expect(normalizeSettings({ position: 'top-right', format: 'fraction', fontSize: 10.6 })).toMatchObject({
      position: 'top-right',
      format: 'fraction',
      fontSize: 11,
    });
  });

  it('renders formatting tokens and preserves Unicode text', () => {
    expect(templateForFormat('page-of-total')).toBe('Page {n} of {total}');
    expect(renderPageLabel('쪽 {n} / 전체 {total}', 3, 12)).toBe('쪽 3 / 전체 12');
  });

  it('places text relative to each PDF page dimensions', () => {
    expect(pageNumberPlacement('bottom-right', 612, 792, 30, 10, 28)).toEqual({ x: 554, y: 28 });
    expect(pageNumberPlacement('top-center', 600, 800, 80, 12, 24)).toEqual({ x: 260, y: 764 });
  });

  it('keeps Unicode names and removes unsafe path separators from downloads', () => {
    expect(numberedPdfFileName('논문 📄.PDF')).toBe('논문 📄_numbered.pdf');
    expect(numberedPdfFileName('folder/보고서.pdf')).toBe('folder_보고서_numbered.pdf');
    expect(numberedPdfFileName('   ')).toBe('document_numbered.pdf');
  });
});
