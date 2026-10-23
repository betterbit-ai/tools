/** Browser-only local video re-encoding with CanvasCaptureMediaStream + MediaRecorder. */
import type { CompressionPlan } from './logic';

export class VideoCompressionError extends Error {}

export interface CompressionControl {
  signal?: AbortSignal;
  onProgress?: (fraction: number) => void;
}

export interface CompressionResult {
  blob: Blob;
  mimeType: string;
}

type CapturableVideo = HTMLVideoElement & {
  captureStream?: () => MediaStream;
  webkitCaptureStream?: () => MediaStream;
};

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('Video compression was cancelled.', 'AbortError');
}

function recorderOptions(plan: CompressionPlan): MediaRecorderOptions {
  const candidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  const mimeType = candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate));
  return {
    ...(mimeType ? { mimeType } : {}),
    videoBitsPerSecond: plan.videoBitsPerSecond,
    audioBitsPerSecond: plan.audioBitsPerSecond,
  };
}

function captureAudio(video: HTMLVideoElement): MediaStreamTrack[] {
  const capturable = video as CapturableVideo;
  const stream = capturable.captureStream?.() ?? capturable.webkitCaptureStream?.();
  return stream?.getAudioTracks() ?? [];
}

/**
 * Replays a locally selected video into a scaled canvas and records that stream.
 * The browser chooses a supported WebM codec; no input bytes leave the page.
 */
export async function compressVideo(
  video: HTMLVideoElement,
  plan: CompressionPlan,
  control: CompressionControl = {},
): Promise<CompressionResult> {
  if (!('MediaRecorder' in window) || !HTMLCanvasElement.prototype.captureStream) {
    throw new VideoCompressionError('This browser cannot record a local video stream.');
  }
  if (!video.videoWidth || !video.videoHeight || !Number.isFinite(video.duration) || video.duration <= 0) {
    throw new VideoCompressionError('The browser did not provide readable video metadata.');
  }

  throwIfAborted(control.signal);
  const canvas = document.createElement('canvas');
  canvas.width = plan.width;
  canvas.height = plan.height;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new VideoCompressionError('Canvas is unavailable in this browser.');

  const canvasStream = canvas.captureStream(plan.frameRate);
  const stream = new MediaStream([...canvasStream.getVideoTracks(), ...captureAudio(video)]);
  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(stream, recorderOptions(plan));
  } catch {
    stream.getTracks().forEach((track) => track.stop());
    throw new VideoCompressionError('This browser could not start the selected video encoder.');
  }

  const chunks: Blob[] = [];
  let animation = 0;
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(animation);
    if (recorder.state !== 'inactive') recorder.stop();
  };

  const completion = new Promise<CompressionResult>((resolve, reject) => {
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    recorder.onerror = () => reject(new VideoCompressionError('The browser stopped while encoding the video.'));
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      canvas.width = 1;
      canvas.height = 1;
      if (control.signal?.aborted) return reject(new DOMException('Video compression was cancelled.', 'AbortError'));
      const mimeType = recorder.mimeType || 'video/webm';
      resolve({ blob: new Blob(chunks, { type: mimeType }), mimeType });
    };
  });

  const draw = () => {
    if (control.signal?.aborted) {
      video.pause();
      stop();
      return;
    }
    context.drawImage(video, 0, 0, plan.width, plan.height);
    control.onProgress?.(Math.min(1, video.currentTime / video.duration));
    if (!video.ended) animation = requestAnimationFrame(draw);
  };
  const onEnded = () => {
    context.drawImage(video, 0, 0, plan.width, plan.height);
    control.onProgress?.(1);
    stop();
  };
  const onAbort = () => {
    video.pause();
    stop();
  };

  video.addEventListener('ended', onEnded, { once: true });
  control.signal?.addEventListener('abort', onAbort, { once: true });
  try {
    video.currentTime = 0;
    recorder.start(500);
    animation = requestAnimationFrame(draw);
    await video.play();
    return await completion;
  } catch (error) {
    stop();
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new VideoCompressionError('The browser could not play this video for local compression.');
  } finally {
    cancelAnimationFrame(animation);
    video.removeEventListener('ended', onEnded);
    control.signal?.removeEventListener('abort', onAbort);
    video.pause();
  }
}
