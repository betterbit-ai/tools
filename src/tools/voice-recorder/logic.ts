/** Pure display and filename logic for the voice recorder. */

function finite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

/** Format elapsed capture time without ever exposing an invalid clock value. */
export function formatRecordingTime(seconds: number): string {
  const total = Math.max(0, Math.floor(finite(seconds)));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainder = total % 60;
  const clock = `${minutes.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  return hours ? `${hours.toString().padStart(2, '0')}:${clock}` : clock;
}

/** Give every local download a predictable, filesystem-safe MP3 name. */
export function recordingFilename(date: Date): string {
  const part = (value: number) => value.toString().padStart(2, '0');
  return `voice-recording-${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}-${part(
    date.getHours(),
  )}${part(date.getMinutes())}.mp3`;
}

/** Prevent invalid bitrate requests from reaching the encoder worker. */
export function normalizeBitrate(kbps: number): number {
  const options = [96, 128, 192] as const;
  const requested = finite(kbps, 128);
  return options.reduce((nearest, candidate) =>
    Math.abs(candidate - requested) < Math.abs(nearest - requested) ? candidate : nearest,
  );
}
