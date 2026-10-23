import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  MAX_FREQUENCY,
  MAX_VOLUME,
  MIN_FREQUENCY,
  MIN_VOLUME,
  clampSweepSeconds,
  clampVolume,
  formatFrequency,
  settingsFromUnknown,
  sweepFrequencyAt,
  volumeFromText,
} from './logic';

describe('speaker test settings', () => {
  it('keeps volume within the conservative playback range', () => {
    expect(clampVolume(0)).toBe(MIN_VOLUME);
    expect(clampVolume(50.4)).toBe(MAX_VOLUME);
    expect(clampVolume(Number.NaN)).toBe(DEFAULT_SETTINGS.volume);
    expect(clampVolume(Number.POSITIVE_INFINITY)).toBe(DEFAULT_SETTINGS.volume);
  });

  it('accepts only the three documented sweep durations', () => {
    expect(clampSweepSeconds(10)).toBe(10);
    expect(clampSweepSeconds(20.1)).toBe(20);
    expect(clampSweepSeconds(5)).toBe(DEFAULT_SETTINGS.sweepSeconds);
    expect(clampSweepSeconds(60)).toBe(DEFAULT_SETTINGS.sweepSeconds);
  });

  it('calculates a bounded logarithmic sweep across the full stated range', () => {
    expect(sweepFrequencyAt(-1, 20)).toBe(MIN_FREQUENCY);
    expect(sweepFrequencyAt(0, 20)).toBe(MIN_FREQUENCY);
    expect(sweepFrequencyAt(20, 20)).toBe(MAX_FREQUENCY);
    expect(sweepFrequencyAt(999, 20)).toBe(MAX_FREQUENCY);
    expect(sweepFrequencyAt(10, 20)).toBeCloseTo(Math.sqrt(MIN_FREQUENCY * MAX_FREQUENCY));
  });

  it('formats the generated range without exposing out-of-range readings', () => {
    expect(formatFrequency(440.4, 'Hz', 'kHz')).toBe('440 Hz');
    expect(formatFrequency(1_000, 'Hz', 'kHz')).toBe('1.0 kHz');
    expect(formatFrequency(999_999, 'Hz', 'kHz')).toBe('20.0 kHz');
  });

  it('sanitizes persisted settings and rejects unicode from a numeric field', () => {
    expect(settingsFromUnknown({ volume: 99, sweepSeconds: 40 })).toEqual({ volume: MAX_VOLUME, sweepSeconds: 40 });
    expect(settingsFromUnknown({ volume: '20', sweepSeconds: '10' })).toEqual(DEFAULT_SETTINGS);
    expect(volumeFromText('20.4')).toBe(20);
    expect(volumeFromText('스피커')).toBeNull();
    expect(volumeFromText('20🔊')).toBeNull();
    expect(volumeFromText('')).toBeNull();
  });
});
