import { describe, expect, it } from 'vitest';
import {
  MAX_INPUT_PIXELS,
  MODEL_INPUT_SIZE,
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
  });
});
