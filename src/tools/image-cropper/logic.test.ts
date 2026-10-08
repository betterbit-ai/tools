import { describe, expect, it } from 'vitest';
import {
  applyAspect,
  aspectRatio,
  centeredCrop,
  clampRect,
  extensionFor,
  initialCrop,
  moveRect,
  outputName,
  outputType,
  resizeRect,
  roundRect,
  supportsQuality,
  type CropRect,
} from './logic';

describe('aspectRatio', () => {
  it('resolves known ids and treats "free" as unconstrained', () => {
    expect(aspectRatio('1:1')).toBe(1);
    expect(aspectRatio('16:9')).toBeCloseTo(16 / 9);
    expect(aspectRatio('free')).toBeNull();
  });
});

describe('centeredCrop', () => {
  it('returns the full image for a null ratio', () => {
    expect(centeredCrop(800, 600, null)).toEqual({ x: 0, y: 0, w: 800, h: 600 });
  });

  it('centers a square crop inside a landscape image', () => {
    const r = centeredCrop(800, 600, 1);
    expect(r.w).toBe(600);
    expect(r.h).toBe(600);
    expect(r.x).toBe(100); // (800 - 600) / 2
    expect(r.y).toBe(0);
  });

  it('centers a square crop inside a portrait image', () => {
    const r = centeredCrop(600, 800, 1);
    expect(r.w).toBe(600);
    expect(r.h).toBe(600);
    expect(r.x).toBe(0);
    expect(r.y).toBe(100);
  });

  it('handles a ratio wider than the image by capping to image width', () => {
    const r = centeredCrop(400, 400, 16 / 9);
    expect(r.w).toBe(400);
    expect(r.h).toBeCloseTo(400 / (16 / 9));
  });
});

describe('initialCrop', () => {
  it('is centered and 80% of the image on each side', () => {
    const r = initialCrop(1000, 500);
    expect(r.w).toBeCloseTo(800);
    expect(r.h).toBeCloseTo(400);
    expect(r.x).toBeCloseTo(100);
    expect(r.y).toBeCloseTo(50);
  });

  it('stays inside a tiny image instead of overflowing', () => {
    const r = initialCrop(10, 10);
    expect(r.x).toBeGreaterThanOrEqual(0);
    expect(r.y).toBeGreaterThanOrEqual(0);
    expect(r.x + r.w).toBeLessThanOrEqual(10);
    expect(r.y + r.h).toBeLessThanOrEqual(10);
  });
});

describe('clampRect', () => {
  it('leaves an in-bounds rect untouched', () => {
    const r: CropRect = { x: 10, y: 10, w: 100, h: 50 };
    expect(clampRect(r, 800, 600)).toEqual(r);
  });

  it('pulls a rect back inside when it overflows the right/bottom edge', () => {
    const r = clampRect({ x: 750, y: 580, w: 100, h: 50 }, 800, 600);
    expect(r.x + r.w).toBeLessThanOrEqual(800);
    expect(r.y + r.h).toBeLessThanOrEqual(600);
    expect(r.w).toBe(100);
    expect(r.h).toBe(50);
  });

  it('shrinks a rect bigger than the image instead of producing negative bounds', () => {
    const r = clampRect({ x: -20, y: -20, w: 2000, h: 2000 }, 800, 600);
    expect(r.x).toBe(0);
    expect(r.y).toBe(0);
    expect(r.w).toBe(800);
    expect(r.h).toBe(600);
  });

  it('never produces a non-positive size, even for a 0×0 image edge case', () => {
    const r = clampRect({ x: 0, y: 0, w: 0, h: 0 }, 1, 1);
    expect(r.w).toBeGreaterThan(0);
    expect(r.h).toBeGreaterThan(0);
  });
});

describe('moveRect', () => {
  it('translates by dx/dy', () => {
    const r = moveRect({ x: 10, y: 10, w: 100, h: 100 }, 5, -5, 800, 600);
    expect(r).toEqual({ x: 15, y: 5, w: 100, h: 100 });
  });

  it('clamps at the edge instead of pushing the box off-image', () => {
    const r = moveRect({ x: 10, y: 10, w: 100, h: 100 }, -9999, -9999, 800, 600);
    expect(r.x).toBe(0);
    expect(r.y).toBe(0);
    expect(r.w).toBe(100);
    expect(r.h).toBe(100);
  });
});

describe('resizeRect', () => {
  const base: CropRect = { x: 100, y: 100, w: 200, h: 200 };

  it('grows from the "e" handle without moving the left edge', () => {
    const r = resizeRect(base, 'e', 50, 0, 800, 600, null);
    expect(r.x).toBe(100);
    expect(r.w).toBe(250);
    expect(r.h).toBe(200);
  });

  it('grows from the "w" handle, moving the left edge and keeping the right edge fixed', () => {
    const r = resizeRect(base, 'w', -50, 0, 800, 600, null);
    expect(r.x).toBe(50);
    expect(r.w).toBe(250);
    expect(r.x + r.w).toBe(300);
  });

  it('refuses to shrink below MIN_CROP', () => {
    const r = resizeRect(base, 'e', -1000, 0, 800, 600, null);
    expect(r.w).toBeGreaterThanOrEqual(8);
  });

  it('derives height from width when a ratio is locked on a side handle', () => {
    const r = resizeRect(base, 'e', 100, 0, 800, 600, 1);
    expect(r.w).toBe(300);
    expect(r.h).toBe(300);
  });

  it('keeps the dragged corner fixed when a ratio is locked', () => {
    // Dragging "se" only moves the bottom-right corner; top-left (100,100) must stay put.
    const r = resizeRect(base, 'se', 100, 100, 800, 600, 1);
    expect(r.x).toBe(100);
    expect(r.y).toBe(100);
    expect(r.w).toBeCloseTo(r.h);
  });

  it('clamps the result to the image bounds', () => {
    const r = resizeRect({ x: 700, y: 500, w: 50, h: 50 }, 'se', 1000, 1000, 800, 600, null);
    expect(r.x + r.w).toBeLessThanOrEqual(800);
    expect(r.y + r.h).toBeLessThanOrEqual(600);
  });

  it('resizes a locked-ratio corner from a purely vertical drag, not just horizontal', () => {
    // "se" with dx=0 must still grow the box — a naive implementation that always
    // derives height from width would leave it unchanged for a vertical-only drag.
    const r = resizeRect(base, 'se', 0, 100, 800, 600, 1);
    expect(r.w).toBeGreaterThan(base.w);
    expect(r.h).toBeGreaterThan(base.h);
    expect(r.w).toBeCloseTo(r.h);
  });

  it('keeps a ratio-locked (e.g. circle) crop square even on a non-square image', () => {
    // On an 800×1200 image, growing a 1:1 box past the smaller side (800) must
    // shrink both axes together instead of letting w/h clamp independently.
    const r = resizeRect({ x: 0, y: 200, w: 800, h: 800 }, 'se', 1000, 1000, 800, 1200, 1);
    expect(r.w).toBeCloseTo(r.h);
    expect(r.w).toBeLessThanOrEqual(800);
  });
});

describe('applyAspect', () => {
  it('is a no-op for a null ratio', () => {
    const r: CropRect = { x: 10, y: 10, w: 100, h: 50 };
    expect(applyAspect(r, null, 800, 600)).toEqual(r);
  });

  it('refits a wide box to 1:1 by shrinking width, keeping the center', () => {
    const r = applyAspect({ x: 0, y: 0, w: 400, h: 200 }, 1, 800, 600);
    expect(r.w).toBeCloseTo(r.h);
    expect(r.x + r.w / 2).toBeCloseTo(200);
    expect(r.y + r.h / 2).toBeCloseTo(100);
  });

  it('refits a tall box to 1:1 by shrinking height', () => {
    const r = applyAspect({ x: 0, y: 0, w: 200, h: 400 }, 1, 800, 600);
    expect(r.w).toBeCloseTo(r.h);
  });
});

describe('roundRect', () => {
  it('rounds fractional coordinates to integers', () => {
    const r = roundRect({ x: 10.4, y: 10.6, w: 99.5, h: 50.2 }, 800, 600);
    expect(r).toEqual({ x: 10, y: 11, w: 100, h: 50 });
  });

  it('keeps the rounded rect inside the image', () => {
    const r = roundRect({ x: 799.6, y: 599.6, w: 10, h: 10 }, 800, 600);
    expect(r.x + r.w).toBeLessThanOrEqual(800);
    expect(r.y + r.h).toBeLessThanOrEqual(600);
  });
});

describe('outputType', () => {
  it('keeps an encodable source type when "original" is chosen for a rect crop', () => {
    expect(outputType('rect', 'original', 'image/webp')).toBe('image/webp');
  });

  it('falls back to PNG for non-encodable source types (e.g. GIF, HEIC)', () => {
    expect(outputType('rect', 'original', 'image/heic')).toBe('image/png');
  });

  it('forces an alpha-capable format for circle crops, even when "original" is JPEG', () => {
    expect(outputType('circle', 'original', 'image/jpeg')).toBe('image/png');
  });

  it('lets a circle crop be exported as JPEG explicitly (with a filled background)', () => {
    expect(outputType('circle', 'image/jpeg', 'image/png')).toBe('image/jpeg');
  });

  it('keeps WebP for a circle crop since it supports alpha too', () => {
    expect(outputType('circle', 'image/webp', 'image/png')).toBe('image/webp');
  });
});

describe('extensionFor / outputName / supportsQuality', () => {
  it('maps image/jpeg to the "jpg" extension', () => {
    expect(extensionFor('image/jpeg')).toBe('jpg');
    expect(extensionFor('image/png')).toBe('png');
    expect(extensionFor('image/webp')).toBe('webp');
  });

  it('builds a name with crop dimensions and strips the original extension', () => {
    expect(outputName('holiday photo.HEIC', 'image/png', 400, 300)).toBe('holiday photo-crop-400x300.png');
  });

  it('handles unicode filenames (Korean, emoji) without mangling them', () => {
    expect(outputName('프로필 사진 🙂.png', 'image/jpeg', 512, 512)).toBe('프로필 사진 🙂-crop-512x512.jpg');
  });

  it('handles filenames with no extension', () => {
    expect(outputName('noext', 'image/png', 10, 10)).toBe('noext-crop-10x10.png');
  });

  it('quality only applies to JPEG and WebP', () => {
    expect(supportsQuality('image/jpeg')).toBe(true);
    expect(supportsQuality('image/webp')).toBe(true);
    expect(supportsQuality('image/png')).toBe(false);
  });
});
