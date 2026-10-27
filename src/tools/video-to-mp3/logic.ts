/** Pure range, bitrate and filename helpers for video-to-mp3 — no DOM or Preact. */

export const MP3_BITRATES = [128, 192, 320] as const;
export type Mp3Bitrate = (typeof MP3_BITRATES)[number];

export interface TimeRange {
  start: number;
  end: number;
}

function finite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

/** Clamp a selection to a decoded file's actual duration and keep it ordered. */
export function normalizeTimeRange(duration: number, input: TimeRange): TimeRange {
  const total = Math.max(0, finite(duration));
  const start = Math.min(total, Math.max(0, finite(input.start)));
  const end = Math.min(total, Math.max(start, finite(input.end, start)));
  return { start, end };
}

/** A safe sample range: starts on the first selected sample and includes its final partial sample. */
export function selectionSampleRange(sampleRate: number, duration: number, input: TimeRange) {
  const range = normalizeTimeRange(duration, input);
  const rate = Math.max(1, Math.floor(finite(sampleRate, 1)));
  const start = Math.floor(range.start * rate);
  const end = Math.ceil(range.end * rate);
  return { start, end: Math.max(start, end), length: Math.max(0, end - start) };
}

/** CBR MP3 payload estimate, before small encoder headers and padding. */
export function estimatedMp3Bytes(seconds: number, bitrate: number): number {
  return Math.max(0, Math.ceil((Math.max(0, finite(seconds)) * Math.max(0, finite(bitrate)) * 1000) / 8));
}

export function normalizeBitrate(value: number): Mp3Bitrate {
  return MP3_BITRATES.includes(value as Mp3Bitrate) ? (value as Mp3Bitrate) : 192;
}

export function formatTimestamp(seconds: number): string {
  const safe = Math.max(0, finite(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const remainder = Math.floor(safe % 60);
  const clock = `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  return hours ? `${hours}:${clock}` : clock;
}

/** Keep the local filename readable, including Korean and emoji source names. */
export function mp3Filename(name: string): string {
  const base = name
    .replace(/^.*[\\/]/u, '')
    .replace(/\.[^.]+$/u, '')
    .trim();
  return `${base || 'video'}-audio.mp3`;
}
