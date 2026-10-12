import { describe, expect, it } from 'vitest';
import { MAX_PIXELS, outputName, outputType, planResize, type ResizeOptions } from './logic';

const base: ResizeOptions = { mode: 'size', percent: 100, width: '', height: '', fit: 'contain', noUpscale: false };

describe('planResize', () => {
  it('scales by percentage', () => {
    expect(planResize(4000, 3000, { ...base, mode: 'percent', percent: 25 })).toMatchObject({
      width: 1000,
      height: 750,
    });
  });

  it('derives the missing side from aspect ratio', () => {
    expect(planResize(4000, 3000, { ...base, width: 800 })).toMatchObject({ width: 800, height: 600 });
    expect(planResize(4000, 3000, { ...base, height: 300 })).toMatchObject({ width: 400, height: 300 });
  });

  it('contain fits inside the box', () => {
    expect(planResize(4000, 3000, { ...base, width: 1000, height: 1000 })).toMatchObject({ width: 1000, height: 750 });
  });

  it('cover outputs the exact box and crops the centre', () => {
    const p = planResize(4000, 3000, { ...base, width: 1000, height: 1000, fit: 'cover' });
    expect(p).toEqual({ width: 1000, height: 1000, sx: 500, sy: 0, sw: 3000, sh: 3000 });
  });

  it('stretch ignores aspect ratio', () => {
    expect(planResize(4000, 3000, { ...base, width: 500, height: 500, fit: 'stretch' })).toMatchObject({
      width: 500,
      height: 500,
      sw: 4000,
    });
  });

  it('noUpscale keeps small images at original size', () => {
    expect(planResize(400, 300, { ...base, width: 1600, noUpscale: true })).toMatchObject({ width: 400, height: 300 });
  });

  it('clamps outputs to the browser-safe canvas area', () => {
    const plan = planResize(1000, 500, { ...base, mode: 'percent', percent: 2000 });
    expect(plan.width * plan.height).toBeLessThanOrEqual(MAX_PIXELS);
  });

  it('treats invalid dimensions as empty instead of producing an enormous image', () => {
    expect(planResize(4000, 3000, { ...base, width: -100, height: Number.NaN })).toMatchObject({
      width: 4000,
      height: 3000,
    });
  });
});

describe('output naming', () => {
  it('keeps encodable types and converts others to PNG', () => {
    expect(outputType('original', 'image/jpeg')).toBe('image/jpeg');
    expect(outputType('original', 'image/gif')).toBe('image/png');
    expect(outputType('original', '', '여행 사진.JPEG')).toBe('image/jpeg');
    expect(outputType('image/webp', 'image/png')).toBe('image/webp');
  });

  it('builds a descriptive file name', () => {
    expect(outputName('holiday photo.HEIC', 'image/jpeg', 800, 600)).toBe('holiday photo-800x600.jpg');
  });
});
