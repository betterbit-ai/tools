/** Browser-only microphone capture. Audio is never uploaded or persisted. */

export interface MicrophoneSession {
  stream: MediaStream;
  analyser: AnalyserNode;
  context: AudioContext;
  track: MediaStreamTrack;
}

export interface MicrophoneCapabilities {
  test: boolean;
  recording: boolean;
}

interface MicrophoneEnvironment {
  navigator?: {
    mediaDevices?: {
      getUserMedia?: unknown;
    };
  };
  AudioContext?: unknown;
  MediaRecorder?: unknown;
}

export type MicrophoneFailureKind =
  'unsupported' | 'permission' | 'not-found' | 'busy' | 'device-unavailable' | 'unknown';

/** Detect only the standard APIs exposed by current Chrome, Safari, and Firefox. */
export function getMicrophoneCapabilities(
  environment: MicrophoneEnvironment = globalThis as MicrophoneEnvironment,
): MicrophoneCapabilities {
  const capture = typeof environment.navigator?.mediaDevices?.getUserMedia === 'function';
  const analysis = typeof environment.AudioContext === 'function';
  return {
    test: capture && analysis,
    recording: capture && analysis && typeof environment.MediaRecorder === 'function',
  };
}

export function microphoneFailureKind(error: unknown): MicrophoneFailureKind {
  if (error instanceof Error && error.message === 'microphone-unsupported') return 'unsupported';
  const name = error && typeof error === 'object' && 'name' in error ? String(error.name) : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'permission';
  if (name === 'NotFoundError') return 'not-found';
  if (name === 'NotReadableError' || name === 'AbortError') return 'busy';
  if (name === 'OverconstrainedError') return 'device-unavailable';
  return 'unknown';
}

/**
 * Keeps an older permission request from taking over after the user starts,
 * stops, or switches devices again before it resolves.
 */
export function createSessionRequestGate() {
  let currentRequest = 0;

  return {
    begin: () => {
      currentRequest += 1;
      return currentRequest;
    },
    invalidate: () => {
      currentRequest += 1;
      return currentRequest;
    },
    isCurrent: (request: number) => request === currentRequest,
  };
}

export async function openMicrophone(deviceId: string): Promise<MicrophoneSession> {
  if (!getMicrophoneCapabilities().test) throw new Error('microphone-unsupported');

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: deviceId ? { deviceId: { exact: deviceId } } : true,
    video: false,
  });
  const context = new AudioContext();
  try {
    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.75;
    context.createMediaStreamSource(stream).connect(analyser);
    await context.resume();
    const track = stream.getAudioTracks()[0];
    if (!track) throw new Error('no-track');
    return { stream, analyser, context, track };
  } catch (error) {
    stream.getTracks().forEach((item) => item.stop());
    await context.close();
    throw error;
  }
}

export async function listMicrophones(): Promise<MediaDeviceInfo[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return [];
  return (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === 'audioinput');
}

export function closeMicrophone(session: MicrophoneSession | null): void {
  if (!session) return;
  session.stream.getTracks().forEach((track) => track.stop());
  void session.context.close();
}

export interface LocalRecording {
  stop: () => void;
}

/** Record a MediaStream into an in-memory Blob; its lifetime is controlled by the caller. */
export function recordLocally(
  stream: MediaStream,
  onComplete: (recording: Blob) => void,
  onError?: () => void,
  maxDurationMs = 10_000,
): LocalRecording {
  if (typeof MediaRecorder === 'undefined') throw new Error('recording-unsupported');
  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream);
  let failed = false;
  let finished = false;
  let maximumTimer: ReturnType<typeof setTimeout> | undefined;

  const clearMaximumTimer = () => {
    if (maximumTimer !== undefined) clearTimeout(maximumTimer);
    maximumTimer = undefined;
  };
  const stopRecorder = () => {
    if (recorder.state !== 'inactive') recorder.stop();
  };
  const fail = () => {
    if (failed || finished) return;
    failed = true;
    clearMaximumTimer();
    onError?.();
    stopRecorder();
  };

  recorder.addEventListener('dataavailable', (event) => {
    if (event.data.size > 0) chunks.push(event.data);
    if (event.timecode >= maxDurationMs) stopRecorder();
  });
  recorder.addEventListener('error', fail);
  recorder.addEventListener('stop', () => {
    clearMaximumTimer();
    if (failed || finished) return;
    finished = true;
    const type = recorder.mimeType || chunks.find((chunk) => chunk.type)?.type || 'audio/webm';
    const recording = new Blob(chunks, { type });
    if (recording.size === 0) {
      onError?.();
      return;
    }
    onComplete(recording);
  });
  // Periodic chunks bound the amount held by the recorder and give the media pipeline its own
  // chance to enforce the cap if ordinary page timers are throttled in a background tab.
  recorder.start(250);
  maximumTimer = setTimeout(stopRecorder, Math.max(1, maxDurationMs));
  return {
    stop: stopRecorder,
  };
}
