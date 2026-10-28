import { describe, expect, it } from 'vitest';
import { DELAY_OPTIONS, MAX_FRAMES, WIDTH_OPTIONS, framePlacement, gifFilename, planGif } from './logic';

describe('planGif', () => {
  it('keeps the first frame ratio and produces a bounded plan', () => {
    expect(planGif({ width: 4032, height: 3024 }, 4, { width: 480, delay: 500, fit: 'contain', loop: true })).toEqual({
      width: 480,
      height: 360,
      delay: 500,
      fit: 'contain',
      loop: true,
      frames: 4,
      pixels: 691_200,
    });
  });

  it('normalizes invalid settings, empty input, and oversized frame lists', () => {
    const empty = planGif({ width: 0, height: Number.NaN }, -4, {
      width: Number.POSITIVE_INFINITY,
      delay: -10,
      fit: 'unexpected' as 'contain',
      loop: false,
    });
    expect(empty).toMatchObject({ width: 480, height: 480, delay: 500, fit: 'contain', loop: false, frames: 0 });
    expect(
      planGif({ width: 10, height: 10 }, MAX_FRAMES + 8, { width: 320, delay: 100, fit: 'cover', loop: true }).frames,
    ).toBe(MAX_FRAMES);
  });

  it('uses only the documented width and delay choices', () => {
    const plan = planGif({ width: 10, height: 10 }, 2, { width: 501, delay: 211, fit: 'contain', loop: true });
    expect(WIDTH_OPTIONS).toContain(plan.width);
    expect(DELAY_OPTIONS).toContain(plan.delay);
    expect(plan.width).toBe(480);
    expect(plan.delay).toBe(250);
  });
});

describe('framePlacement', () => {
  it('letterboxes contain frames and crops cover frames symmetrically', () => {
    expect(framePlacement({ width: 1600, height: 900 }, { width: 400, height: 400, fit: 'contain' })).toEqual({
      x: 0,
      y: 88,
      width: 400,
      height: 225,
    });
    expect(framePlacement({ width: 1600, height: 900 }, { width: 400, height: 400, fit: 'cover' })).toEqual({
      x: -155,
      y: 0,
      width: 711,
      height: 400,
    });
  });
});

describe('gifFilename', () => {
  it('preserves Korean, CJK, and emoji names', () => {
    expect(gifFilename('여름 여행 📷.png')).toBe('여름 여행 📷-animation.gif');
    expect(gifFilename('动画.webp')).toBe('动画-animation.gif');
    expect(gifFilename('')).toBe('animation-animation.gif');
  });
});
