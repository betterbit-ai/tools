import { describe, expect, it } from 'vitest';
import { normalizeRotation, outputName, outputType, supportsQuality, transformedDimensions } from './logic';

describe('normalizeRotation', () => {
  it('normalizes negative and oversized quarter turns', () => {
    expect(normalizeRotation(-90)).toBe(270);
    expect(normalizeRotation(450)).toBe(90);
    expect(normalizeRotation(720)).toBe(0);
  });

  it('rounds a non-quarter value and safely handles non-finite input', () => {
    expect(normalizeRotation(136)).toBe(180);
    expect(normalizeRotation(Number.NaN)).toBe(0);
    expect(normalizeRotation(Infinity)).toBe(0);
  });
});

describe('transformedDimensions', () => {
  it('swaps dimensions only for quarter turns', () => {
    expect(transformedDimensions(4032, 3024, 90)).toEqual({ width: 3024, height: 4032 });
    expect(transformedDimensions(4032, 3024, 270)).toEqual({ width: 3024, height: 4032 });
    expect(transformedDimensions(4032, 3024, 180)).toEqual({ width: 4032, height: 3024 });
  });

  it('keeps dimensions safe at the zero boundary', () => {
    expect(transformedDimensions(-3, Number.NaN, 0)).toEqual({ width: 0, height: 0 });
  });
});

describe('output details', () => {
  it('preserves supported originals and falls back to PNG for unsupported input', () => {
    expect(outputType('original', 'image/jpeg')).toBe('image/jpeg');
    expect(outputType('original', 'image/heic')).toBe('image/png');
    expect(outputType('image/webp', 'image/png')).toBe('image/webp');
    expect(supportsQuality('image/jpeg')).toBe(true);
    expect(supportsQuality('image/png')).toBe(false);
  });

  it('builds safe names for empty, Korean, CJK, and emoji file names', () => {
    expect(outputName('', 'image/png')).toBe('image-rotated.png');
    expect(outputName('여행 사진 東京 📷.JPG', 'image/jpeg')).toBe('여행 사진 東京 📷-rotated.jpg');
    expect(outputName('archive.tar.png', 'image/webp')).toBe('archive.tar-rotated.webp');
  });
});
