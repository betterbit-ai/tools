import { describe, expect, it } from 'vitest';
import {
  extensionFor,
  formatLabel,
  isAnimatedGif,
  needsBackground,
  outputName,
  sourceMayHaveAlpha,
  sourceMime,
  supportsQuality,
} from './logic';

describe('sourceMime', () => {
  it('prefers the browser-reported type', () => {
    expect(sourceMime({ type: 'image/png', name: 'a.bin' })).toBe('image/png');
  });

  it('falls back to the extension when the browser reports no type', () => {
    expect(sourceMime({ type: '', name: 'photo.BMP' })).toBe('image/bmp');
    expect(sourceMime({ type: '', name: 'photo.avif' })).toBe('image/avif');
  });

  it('falls back to a generic type for an unknown extension', () => {
    expect(sourceMime({ type: '', name: 'mystery.xyz' })).toBe('application/octet-stream');
  });
});

describe('formatLabel', () => {
  it('labels known image types', () => {
    expect(formatLabel('image/jpeg')).toBe('JPG');
    expect(formatLabel('image/png')).toBe('PNG');
    expect(formatLabel('image/webp')).toBe('WebP');
    expect(formatLabel('image/gif')).toBe('GIF');
    expect(formatLabel('image/bmp')).toBe('BMP');
  });
});

describe('supportsQuality / needsBackground', () => {
  it('jpeg and webp support a quality knob, png does not', () => {
    expect(supportsQuality('image/jpeg')).toBe(true);
    expect(supportsQuality('image/webp')).toBe(true);
    expect(supportsQuality('image/png')).toBe(false);
  });

  it('only jpeg needs a background fill (no alpha channel)', () => {
    expect(needsBackground('image/jpeg')).toBe(true);
    expect(needsBackground('image/png')).toBe(false);
    expect(needsBackground('image/webp')).toBe(false);
  });
});

describe('sourceMayHaveAlpha', () => {
  it('flags formats that can carry transparency', () => {
    expect(sourceMayHaveAlpha('image/png')).toBe(true);
    expect(sourceMayHaveAlpha('image/webp')).toBe(true);
    expect(sourceMayHaveAlpha('image/gif')).toBe(true);
  });

  it('is false for formats without an alpha channel', () => {
    expect(sourceMayHaveAlpha('image/jpeg')).toBe(false);
    expect(sourceMayHaveAlpha('image/bmp')).toBe(false);
  });
});

describe('extensionFor / outputName', () => {
  it('maps jpeg to the .jpg extension', () => {
    expect(extensionFor('image/jpeg')).toBe('jpg');
    expect(extensionFor('image/webp')).toBe('webp');
    expect(extensionFor('image/png')).toBe('png');
  });

  it('builds the output name and strips the original extension', () => {
    expect(outputName('holiday photo.HEIC', 'image/png')).toBe('holiday photo.png');
  });

  it('keeps unicode (Korean, emoji) file names intact', () => {
    expect(outputName('가족 사진 🏖️.png', 'image/webp')).toBe('가족 사진 🏖️.webp');
  });

  it('handles a file name with no extension', () => {
    expect(outputName('image', 'image/jpeg')).toBe('image.jpg');
  });

  it('handles a file name with multiple dots', () => {
    expect(outputName('v1.2.final.png', 'image/jpeg')).toBe('v1.2.final.jpg');
  });
});

/** Builds a minimal, spec-valid GIF (no global colour table) with `frameCount` 1×1 frames. */
function buildGif(frameCount: number): Uint8Array {
  const bytes: number[] = [];
  bytes.push(...'GIF89a'.split('').map((c) => c.charCodeAt(0)));
  bytes.push(1, 0, 1, 0, 0x00, 0, 0); // logical screen descriptor, no GCT
  for (let i = 0; i < frameCount; i++) {
    bytes.push(0x2c, 0, 0, 0, 0, 1, 0, 1, 0, 0x00); // image descriptor, no local colour table
    bytes.push(0x02); // LZW minimum code size
    bytes.push(0x01, 0x4c, 0x00); // one data sub-block, then block terminator
  }
  bytes.push(0x3b); // trailer
  return new Uint8Array(bytes);
}

describe('isAnimatedGif', () => {
  it('is false for a non-GIF buffer', () => {
    expect(isAnimatedGif(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]))).toBe(false);
  });

  it('is false for a short/empty buffer', () => {
    expect(isAnimatedGif(new Uint8Array([]))).toBe(false);
  });

  it('is false for a single-frame GIF', () => {
    expect(isAnimatedGif(buildGif(1))).toBe(false);
  });

  it('is true for a multi-frame GIF', () => {
    expect(isAnimatedGif(buildGif(2))).toBe(true);
    expect(isAnimatedGif(buildGif(5))).toBe(true);
  });
});
