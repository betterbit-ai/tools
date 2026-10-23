/** Pure metronome settings and tempo math. Browser audio belongs in Tool.tsx. */

export const MIN_BPM = 20;
export const MAX_BPM = 300;
export const SUPPORTED_BEATS_PER_BAR = [2, 3, 4, 6] as const;
export const DEFAULT_VOLUME = 70;

export interface MetronomeSettings {
  bpm: number;
  beatsPerBar: number;
  volume: number;
}

export const DEFAULT_SETTINGS: MetronomeSettings = {
  bpm: 120,
  beatsPerBar: 4,
  volume: DEFAULT_VOLUME,
};

/** Clamp a user-entered BPM to the range the click scheduler supports. */
export function clampBpm(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SETTINGS.bpm;
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(value)));
}

export function clampBeatsPerBar(value: number): number {
  const rounded = Math.round(value);
  return SUPPORTED_BEATS_PER_BAR.includes(rounded as (typeof SUPPORTED_BEATS_PER_BAR)[number])
    ? rounded
    : DEFAULT_SETTINGS.beatsPerBar;
}

export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_VOLUME;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/** One quarter-note pulse in seconds; at 60 BPM this is exactly one second. */
export function secondsPerBeat(bpm: number): number {
  return 60 / clampBpm(bpm);
}

/** Duration of one bounded audio loop containing a complete bar. */
export function barDurationSeconds(bpm: number, beatsPerBar: number): number {
  return secondsPerBeat(bpm) * clampBeatsPerBar(beatsPerBar);
}

/** Derive the visual beat from the audio clock, including after a throttled background tab returns. */
export function beatAtElapsedTime(elapsedSeconds: number, bpm: number, beatsPerBar: number): number {
  const safeBeatsPerBar = clampBeatsPerBar(beatsPerBar);
  const elapsedBeats = Math.floor(Math.max(0, elapsedSeconds) / secondsPerBeat(bpm));
  return (elapsedBeats % safeBeatsPerBar) + 1;
}

/**
 * Calculate BPM from recent tap timestamps. The interval average, not just the
 * last tap, makes a single slightly early/late tap less disruptive.
 */
export function tapTempo(timestamps: readonly number[], maxIntervals = 7): number | null {
  const valid = timestamps.filter((timestamp) => Number.isFinite(timestamp));
  if (valid.length < 2) return null;

  const intervals: number[] = [];
  for (let index = Math.max(1, valid.length - maxIntervals); index < valid.length; index++) {
    const interval = valid[index] - valid[index - 1];
    if (interval > 0) intervals.push(interval);
  }
  if (intervals.length === 0) return null;

  const averageMs = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  return clampBpm(60_000 / averageMs);
}

/** Make a stored settings value safe before restoring it from localStorage. */
export function settingsFromUnknown(value: unknown): MetronomeSettings {
  if (!value || typeof value !== 'object') return DEFAULT_SETTINGS;
  const candidate = value as Partial<MetronomeSettings>;
  return {
    bpm: clampBpm(candidate.bpm ?? DEFAULT_SETTINGS.bpm),
    beatsPerBar: clampBeatsPerBar(candidate.beatsPerBar ?? DEFAULT_SETTINGS.beatsPerBar),
    volume: clampVolume(candidate.volume ?? DEFAULT_SETTINGS.volume),
  };
}

/** A numeric text field accepts decimal digits only; labels and other Unicode never become a tempo. */
export function bpmFromText(value: string): number | null {
  if (!/^\d+(?:\.\d+)?$/.test(value.trim())) return null;
  return clampBpm(Number(value));
}
