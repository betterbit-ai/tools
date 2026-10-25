/** Browser-only screen capture. Recorded chunks stay in browser memory until download. */

import { preferredVideoMimeType } from './logic';

export type RecorderFailure = 'unsupported' | 'permission' | 'not-found' | 'busy' | 'cancelled' | 'unknown';

export interface CaptureSession {
  stream: MediaStream;
  stop: () => void;
}

export interface ActiveRecording {
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export function canRecordScreen(
  environment: {
    navigator?: { mediaDevices?: { getDisplayMedia?: unknown } };
    MediaRecorder?: unknown;
  } = globalThis,
): boolean {
  return (
    typeof environment.navigator?.mediaDevices?.getDisplayMedia === 'function' &&
    typeof environment.MediaRecorder === 'function'
  );
}

export function recorderFailure(error: unknown): RecorderFailure {
  const name = error && typeof error === 'object' && 'name' in error ? String(error.name) : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'permission';
  if (name === 'NotFoundError') return 'not-found';
  if (name === 'AbortError' || name === 'InvalidStateError') return 'cancelled';
  if (name === 'NotReadableError') return 'busy';
  if (name === 'TypeError' || name === 'NotSupportedError') return 'unsupported';
  return 'unknown';
}

/** Ask the browser which screen, window or tab to capture, optionally adding microphone tracks. */
export async function openCaptureSession(includeMicrophone: boolean): Promise<CaptureSession> {
  if (!canRecordScreen()) throw new DOMException('Screen capture is unsupported', 'NotSupportedError');
  const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
  let microphone: MediaStream | null = null;
  try {
    if (includeMicrophone) microphone = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const stream = new MediaStream([
      ...display.getVideoTracks(),
      ...display.getAudioTracks(),
      ...(microphone?.getAudioTracks() ?? []),
    ]);
    return {
      stream,
      stop: () => stream.getTracks().forEach((track) => track.stop()),
    };
  } catch (error) {
    display.getTracks().forEach((track) => track.stop());
    microphone?.getTracks().forEach((track) => track.stop());
    throw error;
  }
}

/** Capture browser-native video in memory. The Blob is created only after recording stops. */
export function startLocalScreenRecording(
  stream: MediaStream,
  onComplete: (blob: Blob) => void,
  onError: () => void,
): ActiveRecording | null {
  const chunks: Blob[] = [];
  const mimeType = preferredVideoMimeType((type) => MediaRecorder.isTypeSupported?.(type) ?? false);
  let finished = false;
  let failed = false;
  let recorder: MediaRecorder;
  try {
    recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
  } catch {
    onError();
    return null;
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
    const type = recorder.mimeType || chunks[0]?.type || mimeType || 'video/webm';
    const blob = new Blob(chunks, { type });
    if (blob.size) onComplete(blob);
    else onError();
  });
  stream
    .getVideoTracks()
    .forEach((track) => track.addEventListener('ended', () => recorder.state !== 'inactive' && recorder.stop()));
  recorder.start(1_000);
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
