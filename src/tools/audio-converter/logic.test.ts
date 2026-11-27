import { describe, expect, it } from 'vitest';
import {
  buildWav,
  describeAudio,
  estimateMp3Bytes,
  estimateWavBytes,
  floatToInt16,
  formatDuration,
  outputFilename,
  readWavHeader,
  sizeSavings,
  validateInput,
  MAX_INPUT_BYTES,
} from './logic';

/** A sine wave: exactly what a decoded tone looks like to the converter. */
function sine(frames: number, cycles: number, amplitude = 0.5): Float32Array {
  const samples = new Float32Array(frames);
  for (let i = 0; i < frames; i++) samples[i] = amplitude * Math.sin((2 * Math.PI * cycles * i) / frames);
  return samples;
}

describe('buildWav', () => {
  it('writes a 44-byte RIFF/WAVE header that describes the data', () => {
    const frames = 4410;
    const wav = buildWav([sine(frames, 10)], 44_100);
    expect(wav.length).toBe(44 + frames * 2);
    const info = readWavHeader(wav);
    expect(info).toEqual({ format: 1, channels: 1, sampleRate: 44_100, bitsPerSample: 16, dataBytes: frames * 2 });
    expect(String.fromCharCode(...wav.subarray(0, 4))).toBe('RIFF');
    expect(String.fromCharCode(...wav.subarray(8, 12))).toBe('WAVE');
    expect(String.fromCharCode(...wav.subarray(36, 40))).toBe('data');
  });

  it('writes the RIFF size as file length minus eight', () => {
    const wav = buildWav([sine(100, 1)], 44_100);
    const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);
    expect(view.getUint32(4, true)).toBe(wav.length - 8);
  });

  it('interleaves stereo samples frame by frame', () => {
    const left = Float32Array.from([0.5, -0.5]);
    const right = Float32Array.from([0.25, -0.25]);
    const wav = buildWav([left, right], 48_000);
    const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);
    expect(view.getUint16(22, true)).toBe(2);
    expect(view.getUint32(28, true)).toBe(48_000 * 4); // byte rate
    expect(view.getUint16(32, true)).toBe(4); // block align
    expect(view.getInt16(44, true)).toBe(Math.round(0.5 * 0x7fff));
    expect(view.getInt16(46, true)).toBe(Math.round(0.25 * 0x7fff));
    expect(view.getInt16(48, true)).toBe(Math.round(-0.5 * 0x8000));
    expect(view.getInt16(50, true)).toBe(Math.round(-0.25 * 0x8000));
  });

  it('clamps samples outside [-1, 1] instead of wrapping them', () => {
    expect(floatToInt16(1.5)).toBe(32767);
    expect(floatToInt16(-1.5)).toBe(-32768);
    expect(floatToInt16(Number.NaN)).toBe(0);
    const wav = buildWav([Float32Array.from([2, -2])], 44_100);
    const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);
    expect(view.getInt16(44, true)).toBe(32767);
    expect(view.getInt16(46, true)).toBe(-32768);
  });

  it('handles an empty channel list as an error rather than a broken file', () => {
    expect(() => buildWav([], 44_100)).toThrow();
  });
});

describe('size estimates', () => {
  it('matches the bitrate for MP3', () => {
    // 3:00 at 192 kbps = 192,000 bits/s × 180 s ÷ 8 = 4,320,000 bytes.
    expect(estimateMp3Bytes(180, 192)).toBe(4_320_000);
    expect(estimateMp3Bytes(0, 320)).toBe(0);
    expect(estimateMp3Bytes(Number.NaN, 128)).toBe(0);
  });

  it('matches a real WAV length', () => {
    expect(estimateWavBytes(1, 44_100, 1)).toBe(44 + 44_100 * 2);
    expect(estimateWavBytes(2, 48_000, 2)).toBe(44 + 96_000 * 4);
  });

  it('reports savings, including when the output is larger', () => {
    expect(sizeSavings(10_000_000, 2_500_000)).toBe(75);
    expect(sizeSavings(1_000_000, 1_500_000)).toBe(-50);
    expect(sizeSavings(0, 100)).toBe(0);
  });
});

describe('names and labels', () => {
  it('keeps Unicode names and replaces the extension', () => {
    expect(outputFilename('회의 녹음 🎙️.m4a', 'mp3')).toBe('회의 녹음 🎙️.mp3');
    expect(outputFilename('song.final.wav', 'wav')).toBe('song.final.wav');
    expect(outputFilename('no-extension', 'mp3')).toBe('no-extension.mp3');
    // A name that is only an extension has no base, so it falls back to "audio".
    expect(outputFilename('.hidden', 'mp3')).toBe('audio.mp3');
    expect(outputFilename('   ', 'mp3')).toBe('audio.mp3');
  });

  it('formats durations with tenths and only adds hours when needed', () => {
    expect(formatDuration(0)).toBe('0:00.0');
    expect(formatDuration(65.4321)).toBe('1:05.4');
    expect(formatDuration(3725.5)).toBe('1:02:05.5');
    expect(formatDuration(-5)).toBe('0:00.0');
    expect(formatDuration(Number.NaN)).toBe('0:00.0');
  });

  it('describes mono, stereo and multichannel audio', () => {
    expect(describeAudio(1, 44_100, 60)).toBe('mono · 44.1 kHz · 1:00.0');
    expect(describeAudio(2, 48_000, 5)).toBe('stereo · 48.0 kHz · 0:05.0');
    expect(describeAudio(6, 48_000, 5)).toBe('6 ch · 48.0 kHz · 0:05.0');
  });
});

describe('validateInput', () => {
  it('rejects empty and oversized files before decoding', () => {
    expect(validateInput(0)).toBe('empty-file');
    expect(validateInput(MAX_INPUT_BYTES + 1)).toBe('too-large');
    expect(validateInput(MAX_INPUT_BYTES)).toBeNull();
    expect(validateInput(1024)).toBeNull();
  });
});
