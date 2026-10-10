import { describe, expect, it } from 'vitest';
import {
  fileExceedsLimit,
  isPdfFile,
  jpgFileName,
  MAX_FILE_BYTES,
  MAX_PAGE_COUNT,
  MAX_RASTER_PIXELS,
  MAX_TOTAL_RASTER_PIXELS,
  pageCountExceedsLimit,
  pageExceedsRasterLimit,
  PageRangeOutOfBoundsError,
  PageRangeSyntaxError,
  parsePageSelection,
  renderScale,
  RESOLUTION_PRESETS,
  totalRasterExceedsLimit,
  zipFileName,
} from './logic';

describe('page selection', () => {
  it('accepts all pages for blank and explicit all input', () => {
    expect(parsePageSelection('', 4)).toEqual([1, 2, 3, 4]);
    expect(parsePageSelection(' ALL ', 3)).toEqual([1, 2, 3]);
  });

  it('expands, orders, and deduplicates individual pages and ranges', () => {
    expect(parsePageSelection('5, 2-4, 3, 1', 6)).toEqual([1, 2, 3, 4, 5]);
  });

  it('rejects malformed, descending, empty, zero, and unicode range parts', () => {
    for (const value of ['1-', '4-2', '1,,2', '0', '첫째', '１-２']) {
      expect(() => parsePageSelection(value, 5)).toThrow(PageRangeSyntaxError);
    }
  });

  it('reports the first out-of-bounds page', () => {
    expect(() => parsePageSelection('2-7', 6)).toThrow(PageRangeOutOfBoundsError);
    expect(() => parsePageSelection('1', 0)).toThrow(PageRangeOutOfBoundsError);
  });
});

describe('resolution presets', () => {
  it('uses an increasing, positive DPI scale based on PDF 72-point user space', () => {
    expect(renderScale('screen')).toBe(96 / 72);
    expect(renderScale('standard')).toBe(150 / 72);
    expect(renderScale('print')).toBe(300 / 72);
    expect(RESOLUTION_PRESETS.print.dpi).toBeGreaterThan(RESOLUTION_PRESETS.standard.dpi);
    expect(RESOLUTION_PRESETS.standard.dpi).toBeGreaterThan(RESOLUTION_PRESETS.screen.dpi);
  });
});

describe('file names', () => {
  it('uses a padded page number based on the document length', () => {
    expect(jpgFileName('report.pdf', 7, 120)).toBe('report_page-007.jpg');
  });

  it('preserves Korean, accents, emoji, and strips only the last extension', () => {
    expect(jpgFileName('  계약서.résumé 📄.PDF ', 2, 12)).toBe('계약서.résumé 📄_page-02.jpg');
    expect(zipFileName('  계약서.résumé 📄.PDF ')).toBe('계약서.résumé 📄_jpg.zip');
  });

  it('uses a safe fallback for an empty name', () => {
    expect(jpgFileName('   ', 1, 1)).toBe('document_page-1.jpg');
    expect(zipFileName('')).toBe('document_jpg.zip');
  });
});

describe('file and browser safety checks', () => {
  it('accepts only PDF MIME types or final extensions', () => {
    expect(isPdfFile('document', 'application/pdf')).toBe(true);
    expect(isPdfFile('보고서.PDF', '')).toBe(true);
    expect(isPdfFile('report.pdf.exe', '')).toBe(false);
    expect(isPdfFile('image.jpg', 'image/jpeg')).toBe(false);
  });

  it('enforces the exact file and page boundaries', () => {
    expect(fileExceedsLimit(MAX_FILE_BYTES)).toBe(false);
    expect(fileExceedsLimit(MAX_FILE_BYTES + 1)).toBe(true);
    expect(fileExceedsLimit(Number.NaN)).toBe(true);
    expect(pageCountExceedsLimit(1)).toBe(false);
    expect(pageCountExceedsLimit(MAX_PAGE_COUNT)).toBe(false);
    expect(pageCountExceedsLimit(MAX_PAGE_COUNT + 1)).toBe(true);
    expect(pageCountExceedsLimit(0)).toBe(true);
  });

  it('prevents invalid and excessive per-page or total canvas allocations', () => {
    expect(pageExceedsRasterLimit(5_000, 4_000)).toBe(false);
    expect(pageExceedsRasterLimit(5_001, 4_000)).toBe(true);
    expect(pageExceedsRasterLimit(Math.sqrt(MAX_RASTER_PIXELS), Math.sqrt(MAX_RASTER_PIXELS))).toBe(true);
    expect(pageExceedsRasterLimit(0, 100)).toBe(true);
    expect(totalRasterExceedsLimit(MAX_TOTAL_RASTER_PIXELS)).toBe(false);
    expect(totalRasterExceedsLimit(MAX_TOTAL_RASTER_PIXELS + 1)).toBe(true);
    expect(totalRasterExceedsLimit(0)).toBe(true);
  });
});
