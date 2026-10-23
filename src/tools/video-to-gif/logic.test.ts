import { describe, expect, it } from 'vitest';
import { MAX_CLIP_SECONDS, MAX_FRAMES, formatTimestamp, gifFilename, planGif } from './logic';

describe('video-to-gif planning', () => {
  it('keeps aspect ratio and counts frames for a normal clip', () => {
    expect(planGif(1920, 1080, 30, { start: 2, end: 5, fps: 10, width: 320 })).toMatchObject({
      start: 2,
      end: 5,
      duration: 3,
      frames: 30,
      width: 320,
      height: 180,
      pixels: 1_728_000,
    });
  });

  it('bounds malformed, reversed and overly long selections', () => {
    const plan = planGif(0, 0, 120, { start: -4, end: 99, fps: 999, width: 999 });
    expect(plan.start).toBe(0);
    expect(plan.end).toBe(MAX_CLIP_SECONDS);
    expect(plan.frames).toBeLessThanOrEqual(MAX_FRAMES);
    expect(plan.fps).toBe(15);
    expect(plan.width).toBe(480);
    expect(plan.height).toBeGreaterThan(0);
  });

  it('handles empty and non-finite timing without NaN output', () => {
    const plan = planGif(Number.NaN, Number.POSITIVE_INFINITY, Number.NaN, {
      start: Number.NaN,
      end: Number.POSITIVE_INFINITY,
      fps: Number.NaN,
      width: Number.NaN,
    });
    expect(plan).toMatchObject({ start: 0, end: 0, duration: 0, frames: 1, fps: 10, width: 320, height: 320 });
  });

  it('uses stable timestamps and Unicode download names', () => {
    expect(formatTimestamp(65.04)).toBe('1:05.0');
    expect(formatTimestamp(-1)).toBe('0:00.0');
    expect(gifFilename('회의 화면 🎬.MP4')).toBe('회의 화면 🎬-gif.gif');
    expect(gifFilename('')).toBe('video-gif.gif');
  });
});
