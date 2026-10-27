/** Browser-only local video-audio decoding and worker-based MP3 encoding. */

import { normalizeTimeRange, selectionSampleRange, type Mp3Bitrate, type TimeRange } from './logic';

export class VideoAudioError extends Error {}

export interface DecodedVideoAudio {
  duration: number;
  sampleRate: number;
  channels: number;
  buffer: AudioBuffer;
}

export interface EncodeControl {
  signal?: AbortSignal;
}

/** Decode a browser-playable local video. Nothing is uploaded or sent to an API. */
export async function decodeVideoAudio(file: File): Promise<DecodedVideoAudio> {
  const context = new AudioContext();
  try {
    const buffer = await context.decodeAudioData(await file.arrayBuffer());
    if (!buffer.length || !buffer.sampleRate || !Number.isFinite(buffer.duration))
      throw new VideoAudioError('empty-audio');
    return {
      duration: buffer.duration,
      sampleRate: buffer.sampleRate,
      channels: Math.min(2, Math.max(1, buffer.numberOfChannels)),
      buffer,
    };
  } catch (error) {
    if (error instanceof VideoAudioError) throw error;
    throw new VideoAudioError('decode-failed');
  } finally {
    await context.close().catch(() => undefined);
  }
}

/** Copy the chosen PCM interval to an encoder worker, keeping UI work off the main thread. */
export async function encodeVideoAudio(
  decoded: DecodedVideoAudio,
  input: TimeRange,
  bitrate: Mp3Bitrate,
  control: EncodeControl = {},
): Promise<Blob> {
  const range = normalizeTimeRange(decoded.duration, input);
  const samples = selectionSampleRange(decoded.sampleRate, decoded.duration, range);
  if (!samples.length) throw new VideoAudioError('empty-range');
  const left = decoded.buffer.getChannelData(0).slice(samples.start, samples.end).buffer;
  const right =
    decoded.channels === 2 ? decoded.buffer.getChannelData(1).slice(samples.start, samples.end).buffer : undefined;
  const bytes = await new Promise<ArrayBuffer>((resolve, reject) => {
    const worker = new Worker(new URL('./encode.worker.ts', import.meta.url), { type: 'module' });
    const finish = (callback: () => void) => {
      control.signal?.removeEventListener('abort', onAbort);
      worker.terminate();
      callback();
    };
    const onAbort = () => finish(() => reject(new DOMException('MP3 encoding was cancelled.', 'AbortError')));
    worker.addEventListener('message', (event: MessageEvent<{ bytes?: ArrayBuffer; error?: string }>) => {
      finish(() => {
        if (event.data.bytes) resolve(event.data.bytes);
        else reject(new VideoAudioError(event.data.error ?? 'encode-failed'));
      });
    });
    worker.addEventListener('error', () => {
      finish(() => reject(new VideoAudioError('encode-failed')));
    });
    if (control.signal?.aborted) return onAbort();
    control.signal?.addEventListener('abort', onAbort, { once: true });
    worker.postMessage(
      { channels: right ? 2 : 1, sampleRate: decoded.sampleRate, bitrate, left, right },
      right ? [left, right] : [left],
    );
  });
  if (!bytes.byteLength) throw new VideoAudioError('encode-empty');
  return new Blob([bytes], { type: 'audio/mpeg' });
}
