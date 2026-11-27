/** Browser-only audio decoding and encoding — no Preact. */
import { OUTPUT_SAMPLE_RATE, type AudioError } from './logic';

export class AudioConvertError extends Error {
  code: AudioError;
  constructor(code: AudioError) {
    super(code);
    this.code = code;
  }
}

export interface DecodedAudio {
  channels: Float32Array[];
  sampleRate: number;
  duration: number;
}

/**
 * Decodes any audio (or video) file the browser can play into float samples at 44.1 kHz.
 * decodeAudioData resamples to the context's rate, so the output is always a rate MP3 accepts.
 */
export async function decodeAudioFile(file: File): Promise<DecodedAudio> {
  const OfflineContext =
    window.OfflineAudioContext ??
    (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  if (!OfflineContext) throw new AudioConvertError('decode-failed');

  const buffer = await file.arrayBuffer();
  const context = new OfflineContext(1, 1, OUTPUT_SAMPLE_RATE);
  let decoded: AudioBuffer;
  try {
    decoded = await context.decodeAudioData(buffer);
  } catch {
    throw new AudioConvertError('decode-failed');
  }
  if (!decoded || decoded.numberOfChannels === 0 || decoded.length === 0) {
    throw new AudioConvertError('no-audio');
  }

  const channels: Float32Array[] = [];
  for (let channel = 0; channel < decoded.numberOfChannels; channel++) {
    channels.push(decoded.getChannelData(channel).slice());
  }
  return { channels, sampleRate: decoded.sampleRate, duration: decoded.duration };
}

export type EncodeResult = { ok: true; blob: Blob } | { ok: false; error: AudioError };

/**
 * MP3 encoding runs in a worker (lamejs is ~100 KB and blocks while it encodes).
 * Progress is reported per MPEG frame batch so a long file never looks frozen.
 */
export function encodeMp3(
  audio: DecodedAudio,
  bitrate: number,
  handlers: { onProgress?: (ratio: number) => void; signal?: AbortSignal },
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./encode.worker.ts', import.meta.url), { type: 'module' });
    const cleanup = () => {
      worker.terminate();
      handlers.signal?.removeEventListener('abort', abort);
    };
    const abort = () => {
      cleanup();
      reject(new AudioConvertError('encode-failed'));
    };
    handlers.signal?.addEventListener('abort', abort, { once: true });

    worker.onmessage = (event: MessageEvent<{ type: string; ratio?: number; bytes?: ArrayBuffer; error?: string }>) => {
      const message = event.data;
      if (message.type === 'progress') {
        handlers.onProgress?.(message.ratio ?? 0);
        return;
      }
      cleanup();
      if (message.type === 'done' && message.bytes) {
        resolve(new Blob([message.bytes], { type: 'audio/mpeg' }));
      } else {
        reject(new AudioConvertError('encode-failed'));
      }
    };
    worker.onerror = () => {
      cleanup();
      reject(new AudioConvertError('encode-failed'));
    };

    // Copies, because transferring detaches the buffer and the samples are still needed
    // for a WAV export or a second bitrate.
    const buffers = audio.channels.map((channel) => channel.slice().buffer);
    worker.postMessage(
      {
        channels: audio.channels.length,
        sampleRate: audio.sampleRate,
        bitrate,
        buffers,
      },
      buffers as Transferable[],
    );
  });
}
