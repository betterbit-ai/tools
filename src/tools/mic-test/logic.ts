/** Pure microphone readings and display helpers. Browser audio APIs stay in microphone.ts. */

export const MAX_RECORDING_SECONDS = 10;

export type SignalStatus = 'silent' | 'quiet' | 'good' | 'clipping';

export interface SignalReading {
  peak: number;
  rms: number;
  peakDbfs: number;
  percent: number;
  status: SignalStatus;
}

/**
 * Analyse unsigned Web Audio time-domain bytes without touching browser APIs.
 * A byte value of 128 represents silence; dBFS is relative to digital full scale.
 */
export function analyseSignal(samples: Uint8Array): SignalReading {
  if (samples.length === 0) return { peak: 0, rms: 0, peakDbfs: -Infinity, percent: 0, status: 'silent' };

  let sumSquares = 0;
  let peak = 0;
  for (const sample of samples) {
    const normalized = (sample - 128) / 128;
    const magnitude = Math.abs(normalized);
    peak = Math.max(peak, magnitude);
    sumSquares += normalized * normalized;
  }

  const rms = Math.sqrt(sumSquares / samples.length);
  const peakDbfs = peak === 0 ? -Infinity : 20 * Math.log10(peak);
  const status: SignalStatus = peak < 0.003 ? 'silent' : peak < 0.08 ? 'quiet' : peak >= 0.95 ? 'clipping' : 'good';
  return { peak, rms, peakDbfs, percent: Math.min(100, Math.round(peak * 100)), status };
}

/** Show a stable, compact dBFS reading. A digital zero is represented as −∞. */
export function formatDbfs(value: number): string {
  if (!Number.isFinite(value)) return '−∞ dBFS';
  return `${Math.max(-99, Math.round(value))} dBFS`;
}

/** Recording is deliberately capped so a forgotten recording cannot grow indefinitely. */
export function recordingDuration(seconds: number): number {
  if (!Number.isFinite(seconds)) return 0;
  return Math.max(0, Math.min(MAX_RECORDING_SECONDS, Math.floor(seconds)));
}

export function formatRecordingTime(seconds: number): string {
  return `0:${String(recordingDuration(seconds)).padStart(2, '0')}`;
}

/** Device labels are often hidden until permission is granted; keep real Unicode labels intact. */
export function deviceLabel(label: string, index: number, unnamed: string): string {
  const trimmed = label.trim();
  return trimmed || `${unnamed} ${Math.max(1, Math.floor(index) + 1)}`;
}
