/** Browser-only local microphone recording and MP3 export. */

import { normalizeBitrate } from './logic';

export type RecorderFailure = 'unsupported' | 'permission' | 'not-found' | 'busy' | 'unknown';

export interface RecordingSession {
  stream: MediaStream;
  analyser: AnalyserNode;
  context: AudioContext;
}

export interface ActiveRecording {
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export function recorderFailure(error: unknown): RecorderFailure {
  const name = error && typeof error === 'object' && 'name' in error ? String(error.name) : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'permission';
  if (name === 'NotFoundError') return 'not-found';
  if (name === 'NotReadableError' || name === 'AbortError') return 'busy';
  return 'unknown';
}

export function canRecord(
  environment: {
    navigator?: { mediaDevices?: { getUserMedia?: unknown } };
    AudioContext?: unknown;
    MediaRecorder?: unknown;
  } = globalThis,
): boolean {
  return (
    typeof environment.navigator?.mediaDevices?.getUserMedia === 'function' &&
    typeof environment.AudioContext === 'function' &&
    typeof environment.MediaRecorder === 'function'
  );
}

export async function listInputDevices(): Promise<MediaDeviceInfo[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return [];
  return (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === 'audioinput');
}

export async function openSession(deviceId: string): Promise<RecordingSession> {
  if (!canRecord()) throw new Error('recording-unsupported');
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: false,
  });
  const context = new AudioContext();
  try {
    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.75;
    context.createMediaStreamSource(stream).connect(analyser);
    await context.resume();
    return { stream, analyser, context };
  } catch (error) {
    stream.getTracks().forEach((track) => track.stop());
    await context.close();
    throw error;
  }
}

export function closeSession(session: RecordingSession | null): void {
  if (!session) return;
  session.stream.getTracks().forEach((track) => track.stop());
  void session.context.close();
}

function recorderMimeType(): string | undefined {
  if (typeof MediaRecorder.isTypeSupported !== 'function') return undefined;
  return ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4'].find((type) =>
    MediaRecorder.isTypeSupported(type),
  );
}

/** Capture browser-native audio in memory; it is decoded and encoded locally after Stop. */
export function startLocalRecording(
  stream: MediaStream,
  onComplete: (blob: Blob) => void,
  onError: () => void,
): ActiveRecording {
  const chunks: Blob[] = [];
  const type = recorderMimeType();
  let finished = false;
  let failed = false;
  let recorder: MediaRecorder;
  try {
    recorder = type ? new MediaRecorder(stream, { mimeType: type }) : new MediaRecorder(stream);
  } catch {
    onError();
    return { pause: () => undefined, resume: () => undefined, stop: () => undefined };
  }
  recorder.addEventListener('dataavailable', (event) => {
    if (event.data.size) chunks.push(event.data);
  });
  recorder.addEventListener('error', () => {
    failed = true;
    onError();
  });
  recorder.addEventListener('stop', () => {
    if (finished || failed) return;
    finished = true;
    const blob = new Blob(chunks, { type: recorder.mimeType || chunks[0]?.type || 'audio/webm' });
    if (blob.size) onComplete(blob);
    else onError();
  });
  recorder.start(250);
  return {
    pause: () => {
      if (recorder.state === 'recording') recorder.pause();
    },
    resume: () => {
      if (recorder.state === 'paused') recorder.resume();
    },
    stop: () => {
      if (recorder.state !== 'inactive') recorder.stop();
    },
  };
}

/** Decode a local MediaRecorder Blob, then delegate CPU-heavy MP3 work to a Worker. */
export async function encodeMp3(blob: Blob, bitrate: number): Promise<Blob> {
  const context = new AudioContext();
  try {
    const decoded = await context.decodeAudioData(await blob.arrayBuffer());
    const channels = decoded.numberOfChannels > 1 ? 2 : 1;
    const left = decoded.getChannelData(0).slice().buffer;
    const right = channels === 2 ? decoded.getChannelData(1).slice().buffer : undefined;
    const bytes = await new Promise<ArrayBuffer>((resolve, reject) => {
      const worker = new Worker(new URL('./encode.worker.ts', import.meta.url), { type: 'module' });
      worker.addEventListener('message', (event: MessageEvent<{ bytes?: ArrayBuffer; error?: string }>) => {
        worker.terminate();
        if (event.data.bytes) resolve(event.data.bytes);
        else reject(new Error(event.data.error ?? 'encode-failed'));
      });
      worker.addEventListener('error', () => {
        worker.terminate();
        reject(new Error('encode-failed'));
      });
      worker.postMessage(
        { channels, sampleRate: decoded.sampleRate, bitrate: normalizeBitrate(bitrate), left, right },
        right ? [left, right] : [left],
      );
    });
    if (!bytes.byteLength) throw new Error('encode-empty');
    return new Blob([bytes], { type: 'audio/mpeg' });
  } finally {
    await context.close().catch(() => undefined);
  }
}
