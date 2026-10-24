import { describe, expect, it } from 'vitest';
import { formatRecordingTime, normalizeBitrate, recordingFilename } from './logic';

describe('voice-recorder logic', () => {
  it('formats empty, long and non-finite recording clocks safely', () => {
    expect(formatRecordingTime(0)).toBe('00:00');
    expect(formatRecordingTime(65.9)).toBe('01:05');
    expect(formatRecordingTime(3_661)).toBe('01:01:01');
    expect(formatRecordingTime(Number.NaN)).toBe('00:00');
    expect(formatRecordingTime(-4)).toBe('00:00');
  });

  it('uses a portable timestamped MP3 filename independent of locale or Unicode input', () => {
    expect(recordingFilename(new Date(2026, 9, 25, 8, 3))).toBe('voice-recording-2026-10-25-0803.mp3');
  });

  it('keeps bitrate choices to supported encoder values at boundaries', () => {
    expect(normalizeBitrate(96)).toBe(96);
    expect(normalizeBitrate(127)).toBe(128);
    expect(normalizeBitrate(999)).toBe(192);
    expect(normalizeBitrate(Number.POSITIVE_INFINITY)).toBe(128);
  });
});
