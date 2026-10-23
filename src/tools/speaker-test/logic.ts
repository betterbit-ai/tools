/** Pure settings and sweep maths. Web Audio playback belongs in speaker.ts. */

export const MIN_FREQUENCY = 20;
export const MAX_FREQUENCY = 20_000;
export const MIN_VOLUME = 1;
export const MAX_VOLUME = 50;
export const MIN_SWEEP_SECONDS = 5;
export const MAX_SWEEP_SECONDS = 60;

export const SWEEP_DURATIONS = [10, 20, 40] as const;

export interface SpeakerSettings {
  volume: number;
  sweepSeconds: number;
}

export const DEFAULT_SETTINGS: SpeakerSettings = {
  volume: 20,
  sweepSeconds: 20,
};

export type Channel = 'left' | 'center' | 'right';

/** Keep an intentionally conservative test level even when storage is malformed. */
export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SETTINGS.volume;
  return Math.min(MAX_VOLUME, Math.max(MIN_VOLUME, Math.round(value)));
}

export function clampSweepSeconds(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SETTINGS.sweepSeconds;
  const rounded = Math.round(value);
  return SWEEP_DURATIONS.includes(rounded as (typeof SWEEP_DURATIONS)[number])
    ? rounded
    : DEFAULT_SETTINGS.sweepSeconds;
}

/** Restore only valid settings from local storage. */
export function settingsFromUnknown(value: unknown): SpeakerSettings {
  if (!value || typeof value !== 'object') return DEFAULT_SETTINGS;
  const candidate = value as Partial<SpeakerSettings>;
  return {
    volume: clampVolume(candidate.volume ?? DEFAULT_SETTINGS.volume),
    sweepSeconds: clampSweepSeconds(candidate.sweepSeconds ?? DEFAULT_SETTINGS.sweepSeconds),
  };
}

/**
 * Frequency during an exponential 20 Hz–20 kHz sweep.
 * Equal progress steps cover equal musical octaves instead of crowding treble.
 */
export function sweepFrequencyAt(elapsedSeconds: number, durationSeconds: number): number {
  const duration = clampSweepSeconds(durationSeconds);
  const progress = Math.min(1, Math.max(0, Number.isFinite(elapsedSeconds) ? elapsedSeconds / duration : 0));
  return MIN_FREQUENCY * (MAX_FREQUENCY / MIN_FREQUENCY) ** progress;
}

/** Format a generated frequency without relying on a browser locale or DOM APIs. */
export function formatFrequency(frequency: number, hertz: string, kilohertz: string): string {
  const rounded = Math.round(Math.min(MAX_FREQUENCY, Math.max(MIN_FREQUENCY, frequency)));
  return rounded >= 1_000 ? `${(rounded / 1_000).toFixed(1)} ${kilohertz}` : `${rounded} ${hertz}`;
}

/** Numeric fields never treat Korean text, emoji, or exponent notation as a setting. */
export function volumeFromText(value: string): number | null {
  if (!/^\d+(?:\.\d+)?$/.test(value.trim())) return null;
  return clampVolume(Number(value));
}
