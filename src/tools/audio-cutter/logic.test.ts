import { describe, expect, it } from 'vitest';
import {
  clipFilename,
  formatTimestamp,
  id3v2Length,
  normalizeClipRange,
  parseMp3Frames,
  planMp3Clip,
  sampleWaveform,
} from './logic';

function mp3Frame(padding = 0): Uint8Array {
  // MPEG-1 Layer III, 128 kbps, 44.1 kHz. Its frame is 417 bytes without padding.
  const frame = new Uint8Array(417 + padding);
  frame.set([0xff, 0xfb, 0x90 | (padding ? 0x02 : 0), 0x00]);
  return frame;
}

function testMp3(): Uint8Array {
  const id3 = new Uint8Array([0x49, 0x44, 0x33, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 1, 2, 3, 4]);
  const frames = [mp3Frame(), mp3Frame(1), mp3Frame()];
  const bytes = new Uint8Array(id3.length + frames.reduce((size, frame) => size + frame.length, 0));
  bytes.set(id3);
  let offset = id3.length;
  for (const frame of frames) {
    bytes.set(frame, offset);
    offset += frame.length;
  }
  return bytes;
}

describe('audio-cutter logic', () => {
  it('bounds empty, reversed and non-finite selections to the source duration', () => {
    expect(normalizeClipRange(12.5, { start: -2, end: 99 })).toEqual({ start: 0, end: 12.5 });
    expect(normalizeClipRange(12.5, { start: 9, end: 2 })).toEqual({ start: 9, end: 9 });
    expect(normalizeClipRange(Number.NaN, { start: Number.POSITIVE_INFINITY, end: Number.NaN })).toEqual({
      start: 0,
      end: 0,
    });
  });

  it('formats timestamps and preserves Korean and emoji file names', () => {
    expect(formatTimestamp(65.04)).toBe('1:05.04');
    expect(formatTimestamp(-1)).toBe('0:00.00');
    expect(clipFilename('회의 🎵.MP3')).toBe('회의 🎵-clip.mp3');
    expect(clipFilename('')).toBe('audio-clip.mp3');
  });

  it('finds an ID3v2 header and MP3 frame boundaries including padded frames', () => {
    const bytes = testMp3();
    expect(id3v2Length(bytes)).toBe(14);
    expect(parseMp3Frames(bytes)).toMatchObject([
      { offset: 14, length: 417 },
      { offset: 431, length: 418 },
      { offset: 849, length: 417 },
    ]);
  });

  it('copies complete frames that touch the requested clip and rejects empty or invalid audio', () => {
    const bytes = testMp3();
    const plan = planMp3Clip(bytes, { start: 0.02, end: 0.04 });
    expect(plan).toMatchObject({ id3Length: 14, startOffset: 14, endOffset: 849, start: 0, end: expect.any(Number) });
    expect(plan!.end).toBeCloseTo((1152 / 44100) * 2, 8);
    expect(planMp3Clip(bytes, { start: 1, end: 1 })).toBeNull();
    expect(planMp3Clip(new Uint8Array([0, 1, 2, 3]), { start: 0, end: 1 })).toBeNull();
  });

  it('creates predictable waveform peaks for empty, quiet and oversized bucket requests', () => {
    expect(sampleWaveform(new Float32Array([]), 3)).toEqual([0, 0, 0]);
    const [quiet, loud] = sampleWaveform(new Float32Array([0, -0.2, 0.9, -1.5]), 2);
    expect(quiet).toBeCloseTo(0.2, 6);
    expect(loud).toBe(1);
    expect(sampleWaveform(new Float32Array([0.5]), 0)).toEqual([0.5]);
  });
});
