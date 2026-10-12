import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  MAX_BPM,
  MIN_BPM,
  bpmFromText,
  clampBpm,
  secondsPerBeat,
  settingsFromUnknown,
  tapTempo,
} from './logic';

describe('metronome tempo logic', () => {
  it('clamps BPM at both supported boundaries and rejects non-finite values', () => {
    expect(clampBpm(0)).toBe(MIN_BPM);
    expect(clampBpm(20.4)).toBe(MIN_BPM);
    expect(clampBpm(300.8)).toBe(MAX_BPM);
    expect(clampBpm(Number.NaN)).toBe(DEFAULT_SETTINGS.bpm);
    expect(clampBpm(Number.POSITIVE_INFINITY)).toBe(DEFAULT_SETTINGS.bpm);
  });

  it('uses the BPM definition of 60 beats per minute = one second per beat', () => {
    expect(secondsPerBeat(60)).toBe(1);
    expect(secondsPerBeat(120)).toBe(0.5);
    expect(secondsPerBeat(20)).toBe(3);
  });

  it('averages recent tap intervals and ignores invalid or reversed timestamps', () => {
    expect(tapTempo([0, 500, 1_010, 1_500, 2_000])).toBe(120);
    expect(tapTempo([0, 500, 1_000, 1_500, 2_010, 2_510, 3_010, 3_510, 4_010])).toBe(120);
    expect(tapTempo([1_000, 500])).toBeNull();
    expect(tapTempo([500])).toBeNull();
  });

  it('sanitizes malformed stored settings and never reads Unicode labels as BPM', () => {
    expect(settingsFromUnknown({ bpm: 9999, beatsPerBar: 5, volume: -20 })).toEqual({
      bpm: MAX_BPM,
      beatsPerBar: DEFAULT_SETTINGS.beatsPerBar,
      volume: 0,
    });
    expect(settingsFromUnknown({ bpm: '120', beatsPerBar: '4', volume: '70' })).toEqual(DEFAULT_SETTINGS);
    expect(bpmFromText('120.4')).toBe(120);
    expect(bpmFromText('메트로놈')).toBeNull();
    expect(bpmFromText('120🥁')).toBeNull();
    expect(bpmFromText('')).toBeNull();
  });
});
