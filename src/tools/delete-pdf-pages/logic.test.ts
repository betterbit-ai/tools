import { describe, expect, it } from 'vitest';
import {
  deletedPdfFileName,
  fileExceedsLimit,
  formatPageSelection,
  isPdfFile,
  MAX_FILE_BYTES,
  MAX_PAGE_COUNT,
  pageCountExceedsLimit,
  PageRangeOutOfBoundsError,
  PageRangeSyntaxError,
  parsePageSelection,
  previewScale,
  remainingPageCount,
  toggleDeletedPage,
} from './logic';
import { writeDeletedPdf } from './delete';

describe('delete-pdf-pages', () => {
  it('parses familiar page notation into sorted, deduplicated page numbers', () => {
    expect(parsePageSelection('5, 2-4, 3, 1', 6)).toEqual([1, 2, 3, 4, 5]);
    expect(parsePageSelection('', 6)).toEqual([]);
    expect(() => parsePageSelection('2,,4', 6)).toThrow(PageRangeSyntaxError);
    expect(() => parsePageSelection('4-2', 6)).toThrow(PageRangeSyntaxError);
    expect(() => parsePageSelection('7', 6)).toThrow(PageRangeOutOfBoundsError);
  });

  it('formats thumbnail selections compactly and never permits every page to be removed', () => {
    expect(formatPageSelection([1, 2, 3, 5, 7, 8, 8])).toBe('1-3, 5, 7-8');
    expect(toggleDeletedPage([], 2, 3)).toEqual([2]);
    expect(toggleDeletedPage([2], 3, 3)).toEqual([2, 3]);
    expect(toggleDeletedPage([2, 3], 1, 3)).toEqual([2, 3]);
    expect(toggleDeletedPage([2, 3], 2, 3)).toEqual([3]);
    expect(remainingPageCount([1, 1, 9], 3)).toBe(2);
  });

  it('recognizes PDFs and enforces finite browser-safety boundaries', () => {
    expect(isPdfFile('제출용 📄.PDF', '')).toBe(true);
    expect(isPdfFile('scan', 'application/pdf')).toBe(true);
    expect(isPdfFile('scan.pdf.exe', '')).toBe(false);
    expect(fileExceedsLimit(MAX_FILE_BYTES)).toBe(false);
    expect(fileExceedsLimit(MAX_FILE_BYTES + 1)).toBe(true);
    expect(fileExceedsLimit(Number.POSITIVE_INFINITY)).toBe(true);
    expect(pageCountExceedsLimit(1)).toBe(false);
    expect(pageCountExceedsLimit(MAX_PAGE_COUNT + 1)).toBe(true);
    expect(previewScale(612, 792)).toBe(0.25);
    expect(previewScale(100_000, 100_000)).toBeLessThan(0.25);
  });

  it('preserves Unicode file names and copies only the pages that remain', async () => {
    expect(deletedPdfFileName(' 계약서.résumé 📄.PDF ')).toBe('계약서.résumé 📄_pages-deleted.pdf');
    expect(deletedPdfFileName('')).toBe('document_pages-deleted.pdf');

    const { PDFDocument } = await import('pdf-lib');
    const source = await PDFDocument.create();
    source.addPage([100, 200]);
    source.addPage([200, 300]);
    source.addPage([300, 400]);
    const output = await writeDeletedPdf(await source.save(), '제출용.pdf', [2]);
    const deleted = await PDFDocument.load(output);
    expect(deleted.getPageCount()).toBe(2);
    expect(deleted.getPage(0).getSize()).toEqual({ width: 100, height: 200 });
    expect(deleted.getPage(1).getSize()).toEqual({ width: 300, height: 400 });
  });
});
