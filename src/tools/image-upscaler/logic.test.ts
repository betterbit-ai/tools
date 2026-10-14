import { describe, expect, it } from 'vitest';
import {
  MAX_INPUT_PIXELS,
  MODEL_INPUT_SIZE,
  imageDimensionsFromHeader,
  makeTileGrid,
  outputDimensions,
  outputName,
  stitchRect,
  validateInput,
} from './logic';

describe('image-upscaler planning', () => {
  it('calculates 2× and 4× dimensions exactly', () => {
    expect(outputDimensions(320, 180, 2)).toEqual({ width: 640, height: 360 });
    expect(outputDimensions(320, 180, 4)).toEqual({ width: 1280, height: 720 });
  });

  it('covers every source pixel exactly once with tile cores and provides overlap context', () => {
    const tiles = makeTileGrid(200, 130);
    expect(tiles).toHaveLength(6);
    expect(tiles[0]).toMatchObject({ inputX: 0, inputY: 0, inputWidth: 112, inputHeight: 112, coreWidth: 96 });
    expect(tiles.at(-1)).toMatchObject({ coreX: 192, coreY: 96, coreWidth: 8, coreHeight: 34 });

    const covered = new Uint8Array(200 * 130);
    for (const tile of tiles) {
      for (let y = tile.coreY; y < tile.coreY + tile.coreHeight; y++) {
        for (let x = tile.coreX; x < tile.coreX + tile.coreWidth; x++) covered[y * 200 + x]++;
      }
    }
    expect([...covered].every((count) => count === 1)).toBe(true);
    expect(makeTileGrid(289, 3457)).toHaveLength(148);
  });

  it('maps edge tile cores to correct 4× stitch coordinates', () => {
    const last = makeTileGrid(200, 130).at(-1)!;
    expect(stitchRect(last)).toEqual({
      sourceX: 64,
      sourceY: 64,
      sourceWidth: 32,
      sourceHeight: 136,
      destinationX: 768,
      destinationY: 384,
      destinationWidth: 32,
      destinationHeight: 136,
    });
  });

  it('handles a small image in one padded model tile and rejects invalid bounds', () => {
    expect(makeTileGrid(1, 1)).toEqual([
      { inputX: 0, inputY: 0, inputWidth: 1, inputHeight: 1, coreX: 0, coreY: 0, coreWidth: 1, coreHeight: 1 },
    ]);
    expect(makeTileGrid(0, 10)).toEqual([]);
    expect(() => makeTileGrid(10, 10, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE / 2)).toThrow(RangeError);
    expect(validateInput(1000, 1000)).toEqual({ ok: true });
    expect(validateInput(1001, 1000)).toEqual({ ok: false, reason: 'pixels' });
    expect(validateInput(0, 1)).toEqual({ ok: false, reason: 'invalid' });
    expect(validateInput(1, MAX_INPUT_PIXELS + 1)).toEqual({ ok: false, reason: 'dimension' });
  });

  it('keeps Unicode and emoji filenames readable', () => {
    expect(outputName('가족 사진 📷.PNG', 4, 'image/png')).toBe('가족 사진 📷-4x-upscaled.png');
    expect(outputName('.hidden', 2, 'image/jpeg')).toBe('.hidden-2x-upscaled.jpg');
    expect(outputName('photo.', 2, 'image/webp')).toBe('photo-2x-upscaled.webp');
  });

  it('reads supported image dimensions from a small header before full decoding', () => {
    const png = new Uint8Array(24);
    png.set([137, 80, 78, 71, 13, 10, 26, 10]);
    png.set([0, 0, 0, 13, 73, 72, 68, 82], 8);
    png.set([0, 0, 15, 160, 0, 0, 7, 208], 16);

    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xc0, 0, 8, 8, 0, 32, 0, 48, 3, 1, 17, 0, 0xff, 0xd9]);

    const webp = new Uint8Array(30);
    webp.set([82, 73, 70, 70, 22, 0, 0, 0, 87, 69, 66, 80, 86, 80, 56, 88, 10, 0, 0, 0]);
    webp.set([0, 0, 0, 0, 127, 2, 0, 63, 1, 0], 20);

    const webpVp8 = new Uint8Array(30);
    webpVp8.set([82, 73, 70, 70, 22, 0, 0, 0, 87, 69, 66, 80, 86, 80, 56, 32, 10, 0, 0, 0]);
    webpVp8.set([0, 0, 0, 157, 1, 42, 128, 2, 64, 1], 20);

    expect(imageDimensionsFromHeader(png)).toEqual({ width: 4000, height: 2000 });
    expect(imageDimensionsFromHeader(jpeg)).toEqual({ width: 48, height: 32 });
    expect(imageDimensionsFromHeader(webp)).toEqual({ width: 640, height: 320 });
    expect(imageDimensionsFromHeader(webpVp8)).toEqual({ width: 640, height: 320 });
    expect(imageDimensionsFromHeader(new Uint8Array([1, 2, 3]))).toBeNull();
  });
});
