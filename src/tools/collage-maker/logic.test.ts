import { describe, expect, it } from 'vitest';
import {
  MAX_EXPORT_LONG_SIDE,
  MAX_IMAGES,
  extensionFor,
  layoutCells,
  outputDimensions,
  outputName,
  safeGap,
  suggestedLayout,
} from './logic';

describe('collage layout planning', () => {
  it('returns no cells for empty input and caps very large input', () => {
    expect(layoutCells('auto', 0)).toEqual([]);
    expect(layoutCells('grid', -3)).toEqual([]);
    expect(layoutCells('grid', 999)).toHaveLength(MAX_IMAGES);
  });

  it('uses a featured lead image for useful odd-numbered sets', () => {
    expect(suggestedLayout(2)).toBe('row');
    expect(suggestedLayout(3)).toBe('featured');
    expect(suggestedLayout(12)).toBe('grid');
    expect(layoutCells('featured', 3)).toEqual([
      { x: 0, y: 0, width: 0.6, height: 1 },
      { x: 0.6, y: 0, width: 0.4, height: 0.5 },
      { x: 0.6, y: 0.5, width: 0.4, height: 0.5 },
    ]);
  });

  it('keeps all layout cells inside the canvas for every supported photo count', () => {
    for (const layout of ['auto', 'grid', 'featured', 'row', 'column'] as const) {
      for (let count = 1; count <= MAX_IMAGES; count++) {
        const cells = layoutCells(layout, count);
        expect(cells).toHaveLength(count);
        for (const cell of cells) {
          expect(cell.x).toBeGreaterThanOrEqual(0);
          expect(cell.y).toBeGreaterThanOrEqual(0);
          expect(cell.width).toBeGreaterThan(0);
          expect(cell.height).toBeGreaterThan(0);
          expect(cell.x + cell.width).toBeLessThanOrEqual(1);
          expect(cell.y + cell.height).toBeLessThanOrEqual(1);
        }
      }
    }
  });
});

describe('collage export settings', () => {
  it('keeps aspect ratio and clamps a huge requested export safely', () => {
    expect(outputDimensions('square', 3000)).toEqual({ width: 3000, height: 3000 });
    expect(outputDimensions('portrait', 3000)).toEqual({ width: 2400, height: 3000 });
    expect(outputDimensions('story', 10000)).toEqual({ width: 2304, height: MAX_EXPORT_LONG_SIDE });
  });

  it('normalises zero, fractional and oversized spacing', () => {
    expect(safeGap(0, 100, 100)).toBe(0);
    expect(safeGap(2.6, 100, 100)).toBe(3);
    expect(safeGap(999, 100, 100)).toBe(12);
  });

  it('uses web-safe output names without relying on source filenames, including Unicode names', () => {
    const unicodeSourceName = '여행 사진 📷.jpeg';
    expect(extensionFor('image/jpeg')).toBe('jpg');
    expect(outputName('image/webp', 1080, 1350)).toBe('photo-collage-1080x1350.webp');
    expect(outputName('image/png', 3000, 3000)).toBe('photo-collage-3000x3000.png');
    expect(outputName('image/png', 3000, 3000)).not.toContain(unicodeSourceName);
  });
});
