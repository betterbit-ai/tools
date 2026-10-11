import { describe, expect, it } from 'vitest';
import {
  aspectRatioLabel,
  deviceLabel,
  frameRateFromSamples,
  frameRateLabel,
  isCurrentCameraRequest,
  resolutionLabel,
  snapshotFilename,
} from './logic';

describe('camera display helpers', () => {
  it('formats negotiated dimensions and reduces common camera aspect ratios', () => {
    expect(resolutionLabel(1920, 1080, '—')).toBe('1920 × 1080');
    expect(aspectRatioLabel(1920, 1080, '—')).toBe('16:9');
    expect(aspectRatioLabel(640, 480, '—')).toBe('4:3');
  });

  it('keeps unavailable dimensions safe at zero, negative, fractional and non-finite boundaries', () => {
    expect(resolutionLabel(0, 1080, 'Unavailable')).toBe('Unavailable');
    expect(aspectRatioLabel(-1, 720, 'Unavailable')).toBe('Unavailable');
    expect(resolutionLabel(1280.9, 720.4, '—')).toBe('1280 × 720');
    expect(aspectRatioLabel(Infinity, 720, '—')).toBe('—');
  });

  it('calculates and formats frame rates from actual compositor samples', () => {
    expect(frameRateFromSamples(30, 1000)).toBe(30);
    expect(frameRateFromSamples(45, 1500)).toBe(30);
    expect(frameRateFromSamples(1, 33.333)).toBeCloseTo(30, 1);
    expect(frameRateLabel(29.96, 'FPS', '—')).toBe('30 FPS');
    expect(frameRateLabel(29.4, 'FPS', '—')).toBe('29.4 FPS');
  });

  it('does not produce misleading FPS for invalid samples', () => {
    expect(frameRateFromSamples(0, 1000)).toBe(0);
    expect(frameRateFromSamples(-1, 1000)).toBe(0);
    expect(frameRateFromSamples(30, 0)).toBe(0);
    expect(frameRateLabel(NaN, 'fps', 'Unavailable')).toBe('Unavailable');
  });
});

describe('camera labels and local snapshot names', () => {
  it('preserves Korean, CJK and emoji device labels while providing a fallback', () => {
    expect(deviceLabel('  내장 카메라 📷  ', 0, 'Camera')).toBe('내장 카메라 📷');
    expect(deviceLabel('', 2, '카메라')).toBe('카메라 3');
  });

  it('uses a predictable, privacy-preserving PNG snapshot filename', () => {
    expect(snapshotFilename(new Date(2026, 9, 11, 8, 5, 9))).toBe('webcam-snapshot-2026-10-11_08-05-09.png');
    expect(snapshotFilename(new Date('invalid'))).toBe('webcam-snapshot.png');
  });
});

describe('camera request lifecycle', () => {
  it('accepts only the latest camera start request after a stop or device switch', () => {
    expect(isCurrentCameraRequest(4, 4)).toBe(true);
    expect(isCurrentCameraRequest(4, 5)).toBe(false);
    expect(isCurrentCameraRequest(Infinity, Infinity)).toBe(false);
  });
});
