import { describe, expect, it } from 'vitest';
import { formatRecordingTime, preferredVideoMimeType, recordingExtension, recordingFilename } from './logic';

describe('screen-recorder logic', () => {
  it('formats empty, long and non-finite capture clocks safely', () => {
    expect(formatRecordingTime(0)).toBe('00:00');
    expect(formatRecordingTime(65.9)).toBe('01:05');
    expect(formatRecordingTime(3_661)).toBe('01:01:01');
    expect(formatRecordingTime(-1)).toBe('00:00');
    expect(formatRecordingTime(Number.NaN)).toBe('00:00');
  });

  it('uses portable local filenames and only known video filename extensions', () => {
    const date = new Date(2026, 9, 25, 8, 3);
    expect(recordingFilename(date, 'video/webm;codecs=vp9,opus')).toBe('screen-recording-2026-10-25-0803.webm');
    expect(recordingFilename(date, 'VIDEO/MP4')).toBe('screen-recording-2026-10-25-0803.mp4');
    expect(recordingExtension('video/웹엠')).toBe('webm');
  });

  it('prefers WebM and falls back safely when browser support is limited', () => {
    expect(preferredVideoMimeType((mime) => mime === 'video/webm;codecs=vp8,opus')).toBe('video/webm;codecs=vp8,opus');
    expect(preferredVideoMimeType((mime) => mime === 'video/mp4')).toBe('video/mp4');
    expect(preferredVideoMimeType(() => false)).toBeUndefined();
  });
});
