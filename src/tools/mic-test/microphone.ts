/** Browser-only microphone capture. Audio is never uploaded or persisted. */

export interface MicrophoneSession {
  stream: MediaStream;
  analyser: AnalyserNode;
  context: AudioContext;
  track: MediaStreamTrack;
}

export async function openMicrophone(deviceId: string): Promise<MicrophoneSession> {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: deviceId ? { deviceId: { exact: deviceId } } : true,
    video: false,
  });
  const context = new AudioContext();
  const analyser = context.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.75;
  context.createMediaStreamSource(stream).connect(analyser);
  await context.resume();
  const track = stream.getAudioTracks()[0];
  if (!track) {
    stream.getTracks().forEach((item) => item.stop());
    await context.close();
    throw new Error('no-track');
  }
  return { stream, analyser, context, track };
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
export function recordLocally(stream: MediaStream, onComplete: (recording: Blob) => void): LocalRecording {
  if (typeof MediaRecorder === 'undefined') throw new Error('recording-unsupported');
  const chunks: BlobPart[] = [];
  const recorder = new MediaRecorder(stream);
  recorder.addEventListener('dataavailable', (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  });
  recorder.addEventListener('stop', () => {
    onComplete(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }));
  });
  recorder.start();
  return {
    stop: () => {
      if (recorder.state !== 'inactive') recorder.stop();
    },
  };
}
