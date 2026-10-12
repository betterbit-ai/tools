import { describe, expect, it } from 'vitest';
import {
  fileExceedsLimit,
  initialPageOrder,
  isOriginalOrder,
  isPdfFile,
  MAX_FILE_BYTES,
  MAX_PAGE_COUNT,
  movePage,
  movePageBy,
  pageCountExceedsLimit,
  previewScale,
  reorderedPdfFileName,
  reversePageOrder,
} from './logic';
import { writeReorderedPdf } from './reorder';

describe('reorder-pdf', () => {
  it('makes and moves a one-based page order without mutating the previous order', () => {
    const order = initialPageOrder(4);
    expect(order).toEqual([1, 2, 3, 4]);
    expect(movePage(order, 3, 0)).toEqual([4, 1, 2, 3]);
    expect(movePageBy(order, 2, 1)).toEqual([1, 3, 2, 4]);
    expect(movePageBy(order, 1, -1)).toBe(order);
    expect(movePage(order, -1, 1)).toBe(order);
    expect(movePage(order, 1, 9)).toBe(order);
    expect(order).toEqual([1, 2, 3, 4]);
  });

  it('reverses and recognises an unchanged order at the document boundaries', () => {
    expect(reversePageOrder([1, 2, 3])).toEqual([3, 2, 1]);
    expect(isOriginalOrder([1, 2, 3])).toBe(true);
    expect(isOriginalOrder([1, 3, 2])).toBe(false);
    expect(initialPageOrder(1)).toEqual([1]);
    expect(initialPageOrder(MAX_PAGE_COUNT)).toHaveLength(MAX_PAGE_COUNT);
    expect(initialPageOrder(0)).toEqual([]);
    expect(initialPageOrder(MAX_PAGE_COUNT + 1)).toEqual([]);
  });

  it('recognises PDFs and enforces finite browser-safety limits', () => {
    expect(isPdfFile('보고서 📄.PDF', '')).toBe(true);
    expect(isPdfFile('scan', 'application/pdf')).toBe(true);
    expect(isPdfFile('scan.pdf.exe', '')).toBe(false);
    expect(fileExceedsLimit(MAX_FILE_BYTES)).toBe(false);
    expect(fileExceedsLimit(MAX_FILE_BYTES + 1)).toBe(true);
    expect(fileExceedsLimit(Number.POSITIVE_INFINITY)).toBe(true);
    expect(pageCountExceedsLimit(1)).toBe(false);
    expect(pageCountExceedsLimit(MAX_PAGE_COUNT + 1)).toBe(true);
    expect(previewScale(612, 792)).toBe(0.25);
    expect(previewScale(100_000, 100_000)).toBeLessThan(0.25);
    expect(previewScale(0, 792)).toBe(0);
  });

  it('preserves Unicode file names and copies pages in the requested order', async () => {
    expect(reorderedPdfFileName(' 계약서.résumé 📄.PDF ')).toBe('계약서.résumé 📄_reordered.pdf');
    expect(reorderedPdfFileName('')).toBe('document_reordered.pdf');

    const { PDFDocument } = await import('pdf-lib');
    const source = await PDFDocument.create();
    source.addPage([100, 200]);
    source.addPage([200, 300]);
    source.addPage([300, 400]);
    const output = await writeReorderedPdf(await source.save(), '제출용.pdf', [3, 1, 2]);
    const reordered = await PDFDocument.load(output);
    expect(reordered.getPageCount()).toBe(3);
    expect(reordered.getPage(0).getSize()).toEqual({ width: 300, height: 400 });
    expect(reordered.getPage(1).getSize()).toEqual({ width: 100, height: 200 });
    expect(reordered.getPage(2).getSize()).toEqual({ width: 200, height: 300 });
  });
});
