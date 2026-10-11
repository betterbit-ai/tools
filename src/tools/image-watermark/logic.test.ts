import { describe, expect, it } from 'vitest';
import {
  MAX_TILE_COUNT,
  anchorPoint,
  normalizeOptions,
  normalizeText,
  outputMime,
  outputName,
  tileOrigins,
} from './logic';

describe('image-watermark logic', () => {
  it('normalizes settings at documented control boundaries', () => {
    expect(normalizeOptions({ size: 0, opacity: 200, rotation: -200, gap: -1 })).toMatchObject({
      size: 4,
      opacity: 100,
      rotation: -90,
      gap: 0,
    });
  });

  it('keeps Unicode graphemes intact while limiting an extremely long label', () => {
    const emoji = '👩🏽‍💻';
    const result = normalizeText(`${'가'.repeat(159)}${emoji}${emoji}`);
    expect(result).toBe(`${'가'.repeat(159)}${emoji}`);
    expect(result).not.toContain('\uFFFD');
  });

  it('finds every single-mark anchor with the requested inset', () => {
    expect(anchorPoint(1000, 500, 200, 50, 'bottom-right', 20)).toEqual({ x: 780, y: 430 });
    expect(anchorPoint(1000, 500, 200, 50, 'center', 20)).toEqual({ x: 400, y: 225 });
    expect(anchorPoint(1000, 500, 200, 50, 'top-left', 20)).toEqual({ x: 20, y: 20 });
  });

  it('extends tiled marks beyond all edges, including a zero-gap pattern', () => {
    const origins = tileOrigins(100, 80, 30, 10, 0);
    expect(origins.some((point) => point.x < 0 && point.y < 0)).toBe(true);
    expect(origins.some((point) => point.x >= 100)).toBe(true);
    expect(origins.some((point) => point.y >= 80)).toBe(true);
  });

  it('caps a repeat pattern for a very wide, one-pixel-high logo', () => {
    expect(tileOrigins(12000, 8000, 9000, 1, 0).length).toBeLessThanOrEqual(MAX_TILE_COUNT);
  });

  it('keeps compatible originals and falls back to PNG for canvas-only inputs', () => {
    expect(outputMime('original', 'image/webp')).toBe('image/webp');
    expect(outputMime('original', 'image/gif')).toBe('image/png');
    expect(outputName('상표 사진.final.png', 'image/jpeg')).toBe('상표 사진.final-watermarked.jpg');
  });
});
