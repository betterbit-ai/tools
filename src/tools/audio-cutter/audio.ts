/** Browser-only MP3 decoding and frame-copy export. */
import { planMp3Clip, sampleWaveform, type ClipRange } from './logic';

export class AudioCutterError extends Error {}

export interface LoadedMp3 {
  bytes: Uint8Array;
  duration: number;
  waveform: number[];
}

function audioContext(): AudioContext {
  if (typeof window === 'undefined' || typeof window.AudioContext !== 'function') {
    throw new AudioCutterError('Web Audio is unsupported');
  }
  return new window.AudioContext();
}

/** Decode locally for the preview waveform; no file data is sent anywhere. */
export async function loadMp3(file: File): Promise<LoadedMp3> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const plan = planMp3Clip(bytes, { start: 0, end: Number.MAX_SAFE_INTEGER });
  if (!plan) throw new AudioCutterError('The file does not contain readable MP3 frames.');

  const context = audioContext();
  try {
    // decodeAudioData is allowed to detach its input, so give it an independent copy.
    const decoded = await context.decodeAudioData(bytes.slice().buffer);
    if (!Number.isFinite(decoded.duration) || decoded.duration <= 0)
      throw new AudioCutterError('The audio has no readable duration.');
    return { bytes, duration: decoded.duration, waveform: sampleWaveform(decoded.getChannelData(0), 240) };
  } catch (error) {
    if (error instanceof AudioCutterError) throw error;
    throw new AudioCutterError('The browser could not decode this MP3.');
  } finally {
    await context.close().catch(() => undefined);
  }
}

/** Copy complete MPEG frames and the leading ID3 metadata into a standalone MP3. */
export function makeMp3Clip(bytes: Uint8Array, range: ClipRange): Blob {
  const plan = planMp3Clip(bytes, range);
  if (!plan) throw new AudioCutterError('Choose a non-empty part of this audio.');
  const tag = bytes.slice(0, plan.id3Length);
  const frames = bytes.slice(plan.startOffset, plan.endOffset);
  return new Blob([tag, frames], { type: 'audio/mpeg' });
}
