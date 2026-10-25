/** Pure display and download logic for the screen recorder. */

function finite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

/** Format a capture clock without showing invalid or negative values. */
export function formatRecordingTime(seconds: number): string {
  const total = Math.max(0, Math.floor(finite(seconds)));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainder = total % 60;
  const clock = `${minutes.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  return hours ? `${hours.toString().padStart(2, '0')}:${clock}` : clock;
}

/** Use a playback-friendly extension for browser-native recording formats. */
export function recordingExtension(mimeType: string): 'webm' | 'mp4' {
  return mimeType.toLowerCase().trim().startsWith('video/mp4') ? 'mp4' : 'webm';
}

/** Give every local download a portable timestamped name. */
export function recordingFilename(date: Date, mimeType: string): string {
  const part = (value: number) => value.toString().padStart(2, '0');
  return `screen-recording-${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}-${part(
    date.getHours(),
  )}${part(date.getMinutes())}.${recordingExtension(mimeType)}`;
}

/** Pick a broadly supported video type, keeping the browser's default as a safe fallback. */
export function preferredVideoMimeType(isSupported: (mimeType: string) => boolean): string | undefined {
  return ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'].find(isSupported);
}
