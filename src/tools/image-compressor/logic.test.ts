import { describe, expect, it } from 'vitest';
import {
  extensionFor,
  isAnimatedGif,
  outputName,
  outputType,
  searchQuality,
  supportsQuality,
  toBytes,
  type EncodeResult,
} from './logic';

describe('toBytes', () => {
  it('converts KB and MB to bytes', () => {
    expect(toBytes(100, 'KB')).toBe(102400);
    expect(toBytes(1, 'MB')).toBe(1048576);
  });

  it('never returns zero or negative for tiny/zero input', () => {
    expect(toBytes(0, 'KB')).toBe(1);
    expect(toBytes(-5, 'KB')).toBe(1);
  });
});

describe('outputType', () => {
  it('keeps encodable types and converts others to PNG', () => {
    expect(outputType('original', 'image/jpeg')).toBe('image/jpeg');
    expect(outputType('original', 'image/gif')).toBe('image/png');
    expect(outputType('original', 'image/bmp')).toBe('image/png');
  });

  it('honours an explicit format choice over the source type', () => {
    expect(outputType('image/webp', 'image/png')).toBe('image/webp');
  });
});

describe('supportsQuality', () => {
  it('jpeg and webp support a quality knob, png does not', () => {
    expect(supportsQuality('image/jpeg')).toBe(true);
    expect(supportsQuality('image/webp')).toBe(true);
    expect(supportsQuality('image/png')).toBe(false);
  });
});

describe('extensionFor / outputName', () => {
  it('maps jpeg to the .jpg extension', () => {
    expect(extensionFor('image/jpeg')).toBe('jpg');
    expect(extensionFor('image/webp')).toBe('webp');
    expect(extensionFor('image/png')).toBe('png');
  });

  it('builds a descriptive name and strips the original extension', () => {
    expect(outputName('holiday photo.HEIC', 'image/jpeg')).toBe('holiday photo-compressed.jpg');
  });

  it('keeps unicode (Korean, emoji) file names intact', () => {
    expect(outputName('가족 사진 🏖️.png', 'image/webp')).toBe('가족 사진 🏖️-compressed.webp');
  });

  it('handles a file name with no extension', () => {
    expect(outputName('image', 'image/jpeg')).toBe('image-compressed.jpg');
  });
});

/** Simulates a monotonically-increasing size/quality curve, like a real JPEG encoder. */
function fakeEncoder(baseSize: number) {
  return async (quality: number): Promise<EncodeResult> => ({ size: Math.round(baseSize * quality) });
}

describe('searchQuality', () => {
  it('returns max quality directly when it already fits the target', async () => {
    const outcome = await searchQuality(900, fakeEncoder(1000), { maxQuality: 0.9 });
    expect(outcome.achieved).toBe(true);
    expect(outcome.quality).toBe(0.9);
    expect(outcome.result.size).toBeLessThanOrEqual(900);
  });

  it('binary-searches to the highest quality that still fits under the target', async () => {
    const outcome = await searchQuality(500, fakeEncoder(1000), { minQuality: 0.05, maxQuality: 0.95, iterations: 10 });
    expect(outcome.achieved).toBe(true);
    expect(outcome.result.size).toBeLessThanOrEqual(500);
    // The curve is size = 1000 * quality, so quality should converge near 0.5.
    expect(outcome.quality).toBeGreaterThan(0.45);
    expect(outcome.quality).toBeLessThanOrEqual(0.5);
  });

  it('reports not achieved when even the minimum quality is too big', async () => {
    const outcome = await searchQuality(10, fakeEncoder(1000), { minQuality: 0.05 });
    expect(outcome.achieved).toBe(false);
    expect(outcome.quality).toBe(0.05);
  });

  it('handles a target of 0 bytes by always failing to achieve it', async () => {
    const outcome = await searchQuality(0, fakeEncoder(100), { minQuality: 0.05 });
    expect(outcome.achieved).toBe(false);
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
