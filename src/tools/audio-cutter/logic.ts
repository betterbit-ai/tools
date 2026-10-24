/** Pure MP3 parsing, waveform sampling and clip planning — no DOM or Preact. */

export interface ClipRange {
  start: number;
  end: number;
}

export interface Mp3Frame {
  offset: number;
  length: number;
  start: number;
  duration: number;
}

export interface Mp3ClipPlan {
  id3Length: number;
  startOffset: number;
  endOffset: number;
  start: number;
  end: number;
}

function finite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

/** Keep a selected time range inside decoded audio's actual duration. */
export function normalizeClipRange(duration: number, input: ClipRange): ClipRange {
  const total = Math.max(0, finite(duration));
  const start = Math.min(total, Math.max(0, finite(input.start)));
  const end = Math.min(total, Math.max(start, finite(input.end, start)));
  return { start, end };
}

/** A compact, stable timestamp for fields, progress and screen-reader labels. */
export function formatTimestamp(seconds: number): string {
  const safe = Math.max(0, finite(seconds));
  const minutes = Math.floor(safe / 60);
  const remainder = safe - minutes * 60;
  return `${minutes}:${remainder.toFixed(2).padStart(5, '0')}`;
}

/** Keep user-visible Unicode in the downloaded MP3 filename. */
export function clipFilename(name: string): string {
  const base = name.replace(/\.mp3$/iu, '').trim() || 'audio';
  return `${base}-clip.mp3`;
}

/**
 * Finds the full ID3v2 tag at the start of an MP3. ID3v2 sizes are synchsafe:
 * the top bit of each size byte is always zero, so a corrupt tag never makes a
 * negative offset here.
 */
export function id3v2Length(bytes: Uint8Array): number {
  if (bytes.length < 10 || bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) return 0;
  const tagSize = ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14) | ((bytes[8] & 0x7f) << 7) | (bytes[9] & 0x7f);
  const footer = bytes[5] & 0x10 ? 10 : 0;
  return Math.min(bytes.length, 10 + tagSize + footer);
}

interface Header {
  length: number;
  duration: number;
}

const MPEG1_LAYER3_BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320] as const;
const MPEG2_LAYER3_BITRATES = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160] as const;

function parseHeader(bytes: Uint8Array, offset: number): Header | null {
  if (offset + 4 > bytes.length || bytes[offset] !== 0xff || (bytes[offset + 1] & 0xe0) !== 0xe0) return null;
  const versionBits = (bytes[offset + 1] >> 3) & 0x03;
  const layerBits = (bytes[offset + 1] >> 1) & 0x03;
  const bitrateIndex = (bytes[offset + 2] >> 4) & 0x0f;
  const sampleRateIndex = (bytes[offset + 2] >> 2) & 0x03;
  const padding = (bytes[offset + 2] >> 1) & 0x01;
  // Layer III only. Free-format and reserved headers have no predictable length.
  if (versionBits === 1 || layerBits !== 1 || bitrateIndex === 0 || bitrateIndex === 15 || sampleRateIndex === 3)
    return null;

  const sampleRates =
    versionBits === 3 ? [44100, 48000, 32000] : versionBits === 2 ? [22050, 24000, 16000] : [11025, 12000, 8000];
  const sampleRate = sampleRates[sampleRateIndex];
  const bitrate = (versionBits === 3 ? MPEG1_LAYER3_BITRATES : MPEG2_LAYER3_BITRATES)[bitrateIndex] * 1000;
  const samplesPerFrame = versionBits === 3 ? 1152 : 576;
  const length = Math.floor(((versionBits === 3 ? 144 : 72) * bitrate) / sampleRate) + padding;
  return length >= 4 ? { length, duration: samplesPerFrame / sampleRate } : null;
}

/**
 * Parse ordinary MPEG Layer III frames. The cutter copies complete frames, so
 * the output stays an MP3 at its original bitrate without an encode pass.
 */
export function parseMp3Frames(bytes: Uint8Array): Mp3Frame[] {
  const frames: Mp3Frame[] = [];
  let offset = id3v2Length(bytes);
  let start = 0;
  while (offset + 4 <= bytes.length) {
    const header = parseHeader(bytes, offset);
    if (!header || offset + header.length > bytes.length) {
      offset++;
      continue;
    }
    frames.push({ offset, length: header.length, start, duration: header.duration });
    start += header.duration;
    offset += header.length;
  }
  return frames;
}

/** Return byte offsets that contain all MP3 frames touched by the selected time. */
export function planMp3Clip(bytes: Uint8Array, input: ClipRange): Mp3ClipPlan | null {
  const frames = parseMp3Frames(bytes);
  if (!frames.length) return null;
  const total = frames.at(-1)!.start + frames.at(-1)!.duration;
  const range = normalizeClipRange(total, input);
  if (range.end <= range.start) return null;
  const first = frames.findIndex((frame) => frame.start + frame.duration > range.start);
  const afterLast = frames.findIndex((frame) => frame.start >= range.end);
  const lastExclusive = afterLast === -1 ? frames.length : afterLast;
  if (first === -1 || lastExclusive <= first) return null;
  return {
    id3Length: id3v2Length(bytes),
    startOffset: frames[first].offset,
    endOffset: lastExclusive === frames.length ? bytes.length : frames[lastExclusive].offset,
    start: frames[first].start,
    end: frames[lastExclusive - 1].start + frames[lastExclusive - 1].duration,
  };
}

/** Compress PCM samples into peak amplitudes suitable for a compact waveform. */
export function sampleWaveform(samples: Float32Array, buckets: number): number[] {
  const count = Math.max(1, Math.floor(finite(buckets, 1)));
  if (!samples.length) return Array.from({ length: count }, () => 0);
  return Array.from({ length: count }, (_, bucket) => {
    const from = Math.floor((bucket * samples.length) / count);
    const to = Math.max(from + 1, Math.floor(((bucket + 1) * samples.length) / count));
    let peak = 0;
    for (let index = from; index < Math.min(to, samples.length); index++)
      peak = Math.max(peak, Math.abs(samples[index]));
    return Math.min(1, peak);
  });
}
