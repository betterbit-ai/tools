import { describe, expect, it } from 'vitest';
import {
  MAX_STRENGTH,
  MIN_REGION_SIZE,
  clampStrength,
  isMeaningfulRegion,
  normalizeRegion,
  outputName,
  regionFromPoints,
} from './logic';

describe('regionFromPoints', () => {
  it('normalizes a reverse drag into an in-bounds region', () => {
    expect(regionFromPoints(7, 0.8, 0.75, 0.2, 0.25)).toEqual({
      id: 7,
      x: 0.2,
      y: 0.25,
      width: 0.6000000000000001,
      height: 0.5,
    });
  });

  it('clamps drags that start or end outside the image', () => {
    expect(regionFromPoints(1, -2, 0.5, 2, 3)).toEqual({ id: 1, x: 0, y: 0.5, width: 1, height: 0.5 });
  });

  it('rejects clicks and accepts regions at the minimum size', () => {
    expect(isMeaningfulRegion(regionFromPoints(1, 0.5, 0.5, 0.5, 0.5))).toBe(false);
    expect(isMeaningfulRegion({ id: 1, x: 0, y: 0, width: MIN_REGION_SIZE, height: MIN_REGION_SIZE })).toBe(true);
  });
});

describe('edit settings', () => {
  it('keeps field-edited regions inside the image', () => {
    expect(normalizeRegion({ id: 1, x: 0.9, y: -2, width: 5, height: 0.2 })).toEqual({
      id: 1,
      x: 0.9,
      y: 0,
      width: 0.09999999999999998,
      height: 0.2,
    });
  });

  it('bounds strength, including invalid input', () => {
    expect(clampStrength(-1)).toBe(1);
    expect(clampStrength(12.6)).toBe(13);
    expect(clampStrength(Infinity)).toBe(1);
    expect(clampStrength(100)).toBe(MAX_STRENGTH);
  });
});

describe('output naming', () => {
  it('uses the selected type and retains Korean, CJK, and emoji file names', () => {
    expect(outputName('개인정보 東京 🛡️.PNG', 'image/webp')).toBe('개인정보 東京 🛡️-redacted.webp');
    expect(outputName('', 'image/jpeg')).toBe('image-redacted.jpg');
  });
});
