import { describe, expect, it } from 'vitest';
import {
  estimatedMp3Bytes,
  formatTimestamp,
  mp3Filename,
  normalizeBitrate,
  normalizeTimeRange,
  selectionSampleRange,
} from './logic';

describe('video-to-mp3 logic', () => {
  it('keeps a selection within the decoded video and in order', () => {
    expect(normalizeTimeRange(12.5, { start: -1, end: 99 })).toEqual({ start: 0, end: 12.5 });
    expect(normalizeTimeRange(12.5, { start: 9, end: 4 })).toEqual({ start: 9, end: 9 });
    expect(normalizeTimeRange(Number.NaN, { start: 2, end: 3 })).toEqual({ start: 0, end: 0 });
  });

  it('plans sample-accurate slices at boundaries without dropping a partial final sample', () => {
    expect(selectionSampleRange(48_000, 10, { start: 1.25, end: 2.50001 })).toEqual({
      start: 60_000,
      end: 120_001,
      length: 60_001,
    });
    expect(selectionSampleRange(44_100, 3, { start: 3, end: 3 })).toEqual({
      start: 132_300,
      end: 132_300,
      length: 0,
    });
  });

  it('uses the CBR size formula and safe bitrate defaults', () => {
    expect(estimatedMp3Bytes(60, 128)).toBe(960_000);
    expect(estimatedMp3Bytes(-1, 192)).toBe(0);
    expect(normalizeBitrate(320)).toBe(320);
    expect(normalizeBitrate(999)).toBe(192);
  });

  it('formats durations and preserves Unicode source names in downloads', () => {
    expect(formatTimestamp(0)).toBe('00:00');
    expect(formatTimestamp(3_661.8)).toBe('1:01:01');
    expect(mp3Filename('강의 🎧.MP4')).toBe('강의 🎧-audio.mp3');
    expect(mp3Filename('C:\\clips\\')).toBe('video-audio.mp3');
  });
});
