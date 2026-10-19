import { describe, expect, it } from 'vitest';
import {
  COMPRESSION_PRESETS,
  CompressionCancelledError,
  compressedFileName,
  fileExceedsLimit,
  isPdfFile,
  MAX_FILE_BYTES,
  MAX_PAGE_COUNT,
  MAX_RASTER_DIMENSION,
  MAX_RASTER_PIXELS,
  pageCountExceedsLimit,
  rasterScaleForPage,
  sizeChange,
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

  it('keeps the requested DPI for an ordinary page', () => {
    expect(rasterScaleForPage(595, 842, 150)).toBe(150 / 72);
  });

  it('reduces an oversized page to bounded canvas dimensions instead of rejecting it', () => {
    const scale = rasterScaleForPage(20_000, 10_000, 150);
    const width = Math.ceil(20_000 * scale);
    const height = Math.ceil(10_000 * scale);

    expect(width).toBeLessThanOrEqual(MAX_RASTER_DIMENSION);
    expect(height).toBeLessThanOrEqual(MAX_RASTER_DIMENSION);
    expect(width * height).toBeLessThanOrEqual(MAX_RASTER_PIXELS);
    expect(scale).toBeGreaterThan(0);
  });

  it('rejects invalid page dimensions before canvas allocation', () => {
    expect(rasterScaleForPage(0, 100, 150)).toBe(0);
    expect(rasterScaleForPage(Number.POSITIVE_INFINITY, 100, 150)).toBe(0);
    expect(rasterScaleForPage(100, 100, Number.NaN)).toBe(0);
  });
});

describe('cancellation', () => {
  it('uses a distinct error so a user-initiated cancellation is never presented as a failed PDF', () => {
    const error = new CompressionCancelledError();

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('CompressionCancelledError');
  });
});
