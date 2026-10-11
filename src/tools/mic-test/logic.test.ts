import { describe, expect, it } from 'vitest';
import {
  MAX_RECORDING_SECONDS,
  analyseSignal,
  deviceLabel,
  formatDbfs,
  formatRecordingTime,
  recordingDuration,
} from './logic';

describe('analyseSignal', () => {
  it('recognises silent, quiet, normal and clipped samples', () => {
    expect(analyseSignal(new Uint8Array()).status).toBe('silent');
    expect(analyseSignal(new Uint8Array([128, 129, 128])).status).toBe('quiet');
    expect(analyseSignal(new Uint8Array([128, 160, 96])).status).toBe('good');
    expect(analyseSignal(new Uint8Array([0, 255])).status).toBe('clipping');
  });

  it('reports full scale as 100% and treats huge browser buffers consistently', () => {
    const reading = analyseSignal(new Uint8Array(32_768).fill(0));
    expect(reading.percent).toBe(100);
    expect(reading.peakDbfs).toBe(0);
  });
});

describe('microphone display helpers', () => {
  it('formats digital silence and rounded dBFS values', () => {
    expect(formatDbfs(-Infinity)).toBe('−∞ dBFS');
    expect(formatDbfs(-12.6)).toBe('-13 dBFS');
  });

  it('caps recording time at ten seconds and handles invalid boundaries', () => {
    expect(recordingDuration(-1)).toBe(0);
    expect(recordingDuration(9.9)).toBe(9);
    expect(recordingDuration(MAX_RECORDING_SECONDS + 99)).toBe(MAX_RECORDING_SECONDS);
    expect(formatRecordingTime(10)).toBe('0:10');
  });

  it('keeps Korean, CJK and emoji device names while giving empty names a safe fallback', () => {
    expect(deviceLabel('  헤드셋 🎙️  ', 0, 'Microphone')).toBe('헤드셋 🎙️');
    expect(deviceLabel('', 2, '마이크')).toBe('마이크 3');
  });
});
