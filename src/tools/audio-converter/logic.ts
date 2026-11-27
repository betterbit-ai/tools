/**
 * Pure audio conversion logic — no DOM and no Web Audio. The WAV writer, size estimates and
 * filename rules are all testable here; decoding lives in `audio.ts`.
 */

export const OUTPUT_FORMATS = ['mp3', 'wav'] as const;
export type OutputFormat = (typeof OUTPUT_FORMATS)[number];

/** lamejs accepts these MPEG-1/2 Layer III bitrates at 44.1 kHz. */
export const MP3_BITRATES = [128, 192, 256, 320] as const;
export type Mp3Bitrate = (typeof MP3_BITRATES)[number];

/** MP3 output sample rate; MPEG-1 Layer III accepts 32, 44.1 and 48 kHz. */
export const OUTPUT_SAMPLE_RATE = 44_100;

/** MPEG-1 Layer III frame holds 1152 samples; lamejs encodes one such frame per call. */
export const FRAME_SAMPLES = 1152;

/** Browsers decode everything they can play, but a huge file would exhaust memory. */
export const MAX_INPUT_BYTES = 300 * 1024 * 1024;

/**
 * Decoded audio is about 21 MB per stereo minute at 44.1 kHz, so 20 minutes is the point
 * where a phone would rather close the tab than finish the conversion.
 */
export const MAX_DURATION_SECONDS = 20 * 60;

export type AudioError = 'empty-file' | 'too-large' | 'too-long' | 'decode-failed' | 'no-audio' | 'encode-failed';

/** A 16-bit PCM WAV from decoded channels. Pure: it only reads the sample arrays. */
export function buildWav(channels: Float32Array[], sampleRate: number): Uint8Array {
  if (channels.length === 0) throw new Error('no channels');
  const frames = channels[0].length;
  const channelCount = channels.length;
  const bytesPerSample = 2;
  const blockAlign = channelCount * bytesPerSample;
  const dataBytes = frames * blockAlign;
  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);
  const ascii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  ascii(0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true); // chunk size: everything after this field
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM fmt chunk length
  view.setUint16(20, 1, true); // format 1 = PCM
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  ascii(36, 'data');
  view.setUint32(40, dataBytes, true);

  let offset = 44;
  for (let frame = 0; frame < frames; frame++) {
    for (let channel = 0; channel < channelCount; channel++) {
      view.setInt16(offset, floatToInt16(channels[channel][frame]), true);
      offset += 2;
    }
  }
  return new Uint8Array(buffer);
}

/** Clamps to [-1, 1] and scales to signed 16-bit integers, the same mapping browsers use. */
export function floatToInt16(sample: number): number {
  if (!Number.isFinite(sample)) return 0;
  const clamped = Math.max(-1, Math.min(1, sample));
  return clamped < 0 ? Math.round(clamped * 0x8000) : Math.round(clamped * 0x7fff);
}

/** Reads a WAV's 16-bit PCM header — used by tests and by the file info panel. */
export interface WavInfo {
  format: number;
  channels: number;
  sampleRate: number;
  bitsPerSample: number;
  dataBytes: number;
}

export function readWavHeader(bytes: Uint8Array): WavInfo | null {
  if (bytes.length < 44) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tag = (offset: number) => String.fromCharCode(...bytes.subarray(offset, offset + 4));
  if (tag(0) !== 'RIFF' || tag(8) !== 'WAVE' || tag(12) !== 'fmt ') return null;
  return {
    format: view.getUint16(20, true),
    channels: view.getUint16(22, true),
    sampleRate: view.getUint32(24, true),
    bitsPerSample: view.getUint16(34, true),
    dataBytes: view.getUint32(40, true),
  };
}

/**
 * MP3 size = bitrate × duration. MPEG audio frames add a little overhead (a 128 kbps frame is
 * 417.9 bytes for 1152 samples), so this is accurate to about 1%.
 */
export function estimateMp3Bytes(durationSeconds: number, bitrateKbps: number): number {
  const seconds = Math.max(0, Number.isFinite(durationSeconds) ? durationSeconds : 0);
  return Math.round((bitrateKbps * 1000 * seconds) / 8);
}

/** WAV size for 16-bit PCM: 44-byte header plus frames × channels × 2 bytes. */
export function estimateWavBytes(durationSeconds: number, sampleRate: number, channels: number): number {
  const frames = Math.round(Math.max(0, durationSeconds) * sampleRate);
  return 44 + frames * channels * 2;
}

/** Percentage saved compared with the source file; negative when the output is bigger. */
export function sizeSavings(inputBytes: number, outputBytes: number): number {
  if (inputBytes <= 0) return 0;
  return Math.round((1 - outputBytes / inputBytes) * 100);
}

/** `song.m4a` → `song.mp3`. Keeps Unicode names and drops the old extension. */
export function outputFilename(name: string, format: OutputFormat): string {
  const base = name.replace(/\.[^.]+$/u, '').trim() || 'audio';
  return `${base}.${format}`;
}

/** 65.4 → "1:05.4"; hours are shown only when the audio is that long. */
export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const rest = safe % 60;
  const secs = rest.toFixed(1).padStart(4, '0');
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${secs}` : `${minutes}:${secs}`;
}

/** A short description of what was decoded, e.g. "2 channels, 44.1 kHz, 3:12.4". */
export function describeAudio(channels: number, sampleRate: number, durationSeconds: number): string {
  const layout = channels === 1 ? 'mono' : channels === 2 ? 'stereo' : `${channels} ch`;
  const rate = `${(sampleRate / 1000).toFixed(1)} kHz`;
  return `${layout} · ${rate} · ${formatDuration(durationSeconds)}`;
}

/** Rejects input before any decoding work happens. */
export function validateInput(size: number): AudioError | null {
  if (size <= 0) return 'empty-file';
  if (size > MAX_INPUT_BYTES) return 'too-large';
  return null;
}
