import { describe, expect, it } from 'vitest';
import {
  COMPRESSION_PRESETS,
  compressedFileName,
  fileExceedsLimit,
  isPdfFile,
  MAX_FILE_BYTES,
  MAX_PAGE_COUNT,
  MAX_RASTER_PIXELS,
  MAX_TOTAL_RASTER_PIXELS,
  pageCountExceedsLimit,
  pageExceedsRasterLimit,
  sizeChange,
  totalRasterExceedsLimit,
} from './logic';

describe('compression presets', () => {
  it('keeps each quality in the encoder range and makes levels progressively stronger', () => {
    const levels = [COMPRESSION_PRESETS.balanced, COMPRESSION_PRESETS.smaller, COMPRESSION_PRESETS.smallest];
    for (const preset of levels) {
      expect(preset.dpi).toBeGreaterThanOrEqual(72);
      expect(preset.quality).toBeGreaterThan(0);
      expect(preset.quality).toBeLessThanOrEqual(1);
    }
    expect(levels[0].dpi).toBeGreaterThan(levels[1].dpi);
    expect(levels[1].dpi).toBeGreaterThan(levels[2].dpi);
    expect(levels[0].quality).toBeGreaterThan(levels[1].quality);
    expect(levels[1].quality).toBeGreaterThan(levels[2].quality);
  });
});

describe('isPdfFile', () => {
  it('accepts the standard MIME type and case-insensitive extension', () => {
    expect(isPdfFile('report', 'application/pdf')).toBe(true);
    expect(isPdfFile('보고서.PDF', '')).toBe(true);
  });

  it('rejects empty, image, and lookalike names', () => {
    expect(isPdfFile('', '')).toBe(false);
    expect(isPdfFile('scan.pdf.exe', 'application/octet-stream')).toBe(false);
    expect(isPdfFile('scan.jpg', 'image/jpeg')).toBe(false);
  });
});

describe('compressedFileName', () => {
  it('replaces only the final PDF extension', () => {
    expect(compressedFileName('financial.pdf.backup.pdf')).toBe('financial.pdf.backup_compressed.pdf');
  });

  it('preserves Korean, accented text, emoji, and an uppercase extension', () => {
    expect(compressedFileName('  계약서 résumé 📄.PDF ')).toBe('계약서 résumé 📄_compressed.pdf');
  });

  it('uses a safe fallback for an empty file name', () => {
    expect(compressedFileName('   ')).toBe('document_compressed.pdf');
  });
});

describe('sizeChange', () => {
  it('reports smaller and larger output rounded to whole percentages', () => {
    expect(sizeChange(10_000, 7_450)).toEqual({ kind: 'smaller', percent: 26 });
    expect(sizeChange(10_000, 12_500)).toEqual({ kind: 'larger', percent: 25 });
  });

  it('reports same size at the equality and zero boundaries without NaN', () => {
    expect(sizeChange(1, 1)).toEqual({ kind: 'same', percent: 0 });
    expect(sizeChange(0, 0)).toEqual({ kind: 'same', percent: 0 });
    expect(sizeChange(Number.NaN, 1)).toEqual({ kind: 'same', percent: 0 });
    expect(sizeChange(Number.POSITIVE_INFINITY, 1)).toEqual({ kind: 'same', percent: 0 });
    expect(sizeChange(-1, 1)).toEqual({ kind: 'same', percent: 0 });
  });
});

describe('browser safety limits', () => {
  it('accepts the largest supported file and rejects a byte beyond it', () => {
    expect(fileExceedsLimit(MAX_FILE_BYTES)).toBe(false);
    expect(fileExceedsLimit(MAX_FILE_BYTES + 1)).toBe(true);
    expect(fileExceedsLimit(Number.POSITIVE_INFINITY)).toBe(true);
    expect(fileExceedsLimit(-1)).toBe(true);
  });

  it('accepts 1 through the page-count limit only', () => {
    expect(pageCountExceedsLimit(1)).toBe(false);
    expect(pageCountExceedsLimit(MAX_PAGE_COUNT)).toBe(false);
    expect(pageCountExceedsLimit(MAX_PAGE_COUNT + 1)).toBe(true);
    expect(pageCountExceedsLimit(0)).toBe(true);
    expect(pageCountExceedsLimit(1.5)).toBe(true);
  });

  it('rejects raster canvases beyond the pixel allocation limit and invalid dimensions', () => {
    expect(pageExceedsRasterLimit(5_000, 4_000)).toBe(false);
    expect(pageExceedsRasterLimit(5_001, 4_000)).toBe(true);
    expect(pageExceedsRasterLimit(Math.sqrt(MAX_RASTER_PIXELS), Math.sqrt(MAX_RASTER_PIXELS))).toBe(true);
    expect(pageExceedsRasterLimit(0, 100)).toBe(true);
    expect(pageExceedsRasterLimit(Number.POSITIVE_INFINITY, 100)).toBe(true);
  });

  it('enforces a document-wide raster budget as well as a per-page budget', () => {
    expect(totalRasterExceedsLimit(MAX_TOTAL_RASTER_PIXELS)).toBe(false);
    expect(totalRasterExceedsLimit(MAX_TOTAL_RASTER_PIXELS + 1)).toBe(true);
    expect(totalRasterExceedsLimit(0)).toBe(true);
  });
});
