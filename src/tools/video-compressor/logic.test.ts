import { describe, expect, it } from 'vitest';
import { compressedFilename, estimateOutputBytes, planCompression, savedPercent } from './logic';

describe('video-compressor planning', () => {
  it('keeps aspect ratio, uses an even size and never upscales', () => {
    expect(planCompression(1920, 1080, { quality: 'balanced', resolution: '720' })).toMatchObject({
      width: 1280,
      height: 720,
      videoBitsPerSecond: 1_200_000,
    });
    expect(planCompression(853, 479, { quality: 'high', resolution: '1080' })).toMatchObject({
      width: 854,
      height: 480,
    });
  });

  it('handles malformed, zero and huge dimensions without NaN or invalid encoder sizes', () => {
    const plan = planCompression(Number.NaN, Number.POSITIVE_INFINITY, {
      quality: 'not-a-quality' as 'balanced',
      resolution: 'source',
    });
    expect(plan.width).toBe(2);
    expect(plan.height).toBe(2);
    expect(plan.videoBitsPerSecond).toBeGreaterThan(0);
    expect(planCompression(7680, 4320, { quality: 'small', resolution: '480' })).toMatchObject({
      width: 854,
      height: 480,
    });
  });

  it('estimates from combined audio and video bitrate with safe timing bounds', () => {
    const plan = planCompression(1280, 720, { quality: 'small', resolution: 'source' });
    expect(estimateOutputBytes(10, plan)).toBe(767_500);
    expect(estimateOutputBytes(Number.NaN, plan)).toBe(0);
    expect(estimateOutputBytes(-3, plan)).toBe(0);
  });

  it('creates stable Unicode names and reports gains and losses honestly', () => {
    expect(compressedFilename('회의 화면 🎬.MP4')).toBe('회의 화면 🎬-compressed.webm');
    expect(compressedFilename('')).toBe('video-compressed.webm');
    expect(savedPercent(1_000, 650)).toBe(35);
    expect(savedPercent(1_000, 1_200)).toBe(-20);
    expect(savedPercent(0, 10)).toBeNull();
  });
});
