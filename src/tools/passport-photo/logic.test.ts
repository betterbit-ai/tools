import { describe, expect, it } from 'vitest';
import {
  DPI,
  PHOTO_SPECS,
  cropForPhoto,
  cropNeedsUpscaling,
  getPhotoSpec,
  mmToPixels,
  outputDimensions,
  outputName,
  printLayout,
  withJfifDensity,
} from './logic';

describe('passport specifications', () => {
  it('converts the Korean 35 × 45 mm passport size to 413 × 531 px at 300 DPI', () => {
    expect(DPI).toBe(300);
    expect(outputDimensions(getPhotoSpec('korea-passport'))).toEqual({ width: 413, height: 531 });
  });

  it('converts the US 2 × 2 inch (51 mm) size to 602 px at 300 DPI', () => {
    expect(outputDimensions(getPhotoSpec('us-passport'))).toEqual({ width: 602, height: 602 });
    expect(mmToPixels(0)).toBe(1);
  });

  it('keeps every supplied specification positive and locates a known preset', () => {
    for (const spec of PHOTO_SPECS) {
      expect(spec.widthMm).toBeGreaterThan(0);
      expect(spec.heightMm).toBeGreaterThan(0);
    }
    expect(getPhotoSpec('japan-passport').widthMm).toBe(35);
  });
});

describe('cropForPhoto', () => {
  it('centres the largest portrait crop at the required aspect ratio', () => {
    const crop = cropForPhoto(1200, 800, getPhotoSpec('korea-passport'));
    expect(crop.x).toBeCloseTo((1200 - (800 * 35) / 45) / 2);
    expect(crop.y).toBe(0);
    expect(crop.width).toBeCloseTo((800 * 35) / 45);
    expect(crop.height).toBe(800);
  });

  it('uses focus controls and zoom without moving outside the source image', () => {
    const crop = cropForPhoto(1200, 800, getPhotoSpec('korea-passport'), 200, 100, 0);
    expect(crop.x + crop.width).toBeCloseTo(1200);
    expect(crop.y).toBe(0);
    expect(crop.width / crop.height).toBeCloseTo(35 / 45);
  });

  it('handles an empty or gigantic image safely', () => {
    expect(cropForPhoto(0, 500, getPhotoSpec('us-passport'))).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    const crop = cropForPhoto(100_000_000, 80_000_000, getPhotoSpec('us-passport'), 999, -50, 200);
    expect(crop.x).toBe(0);
    expect(crop.y + crop.height).toBeLessThanOrEqual(80_000_000);
  });
});

describe('cropNeedsUpscaling', () => {
  it('warns when a tiny or heavily zoomed crop must be enlarged', () => {
    expect(cropNeedsUpscaling(cropForPhoto(64, 64, getPhotoSpec('us-passport')), 602, 602)).toBe(true);
    expect(cropNeedsUpscaling(cropForPhoto(6000, 800, getPhotoSpec('us-passport'), 400), 602, 602)).toBe(true);
  });

  it('does not warn when the selected crop contains enough source pixels', () => {
    expect(cropNeedsUpscaling(cropForPhoto(4032, 3024, getPhotoSpec('us-passport')), 602, 602)).toBe(false);
  });
});

describe('printLayout', () => {
  it('places six Korean passport photos on a 4 × 6 inch sheet', () => {
    expect(printLayout(413, 531)).toMatchObject({ cols: 2, rows: 3, count: 6 });
  });

  it('rejects empty and too-large output sizes instead of producing invalid placements', () => {
    expect(printLayout(0, 531)).toBeNull();
    expect(printLayout(2000, 2000)).toBeNull();
  });
});

describe('outputName', () => {
  it('preserves Korean, CJK and emoji characters in the download filename', () => {
    expect(outputName('여권 사진 東京 📷.png', 'korea-passport', 'photo')).toBe(
      '여권 사진 東京 📷-korea-passport-photo.jpg',
    );
  });

  it('falls back to a clear filename for an empty name', () => {
    expect(outputName('', 'us-passport', 'print-sheet')).toBe('passport-photo-us-passport-print-sheet.jpg');
  });
});

describe('withJfifDensity', () => {
  it('adds a 300-DPI JFIF density marker when the encoder did not provide one', () => {
    const jpeg = withJfifDensity(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]));
    expect([...jpeg.slice(0, 18)]).toEqual([
      0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 1, 1, 44, 1, 44,
    ]);
  });

  it('updates an existing JFIF density marker without changing the rest of the JPEG', () => {
    const source = new Uint8Array([
      0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 96, 0, 96, 0, 0, 0xff, 0xd9,
    ]);
    const jpeg = withJfifDensity(source, 600);
    expect([...jpeg.slice(13, 18)]).toEqual([1, 2, 88, 2, 88]);
    expect([...jpeg.slice(18)]).toEqual([...source.slice(18)]);
  });
});
