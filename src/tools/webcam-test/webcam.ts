/** Browser-only webcam capture. Video frames remain in the current browser tab. */

import { frameRateFromSamples, getCameraCapabilities } from './logic';

export const CAMERA_PREVIEW_TIMEOUT_MS = 10_000;

export interface CameraSession {
  stream: MediaStream;
  track: MediaStreamTrack;
}

interface FrameCallbackMetadata {
  presentedFrames: number;
}

interface FrameCallbackVideo {
  requestVideoFrameCallback?: (callback: (now: number, metadata: FrameCallbackMetadata) => void) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
}

export async function openCamera(deviceId: string): Promise<CameraSession> {
  if (!getCameraCapabilities().test) throw new Error('camera-unsupported');
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: deviceId ? { deviceId: { exact: deviceId } } : true,
  });
  const track = stream.getVideoTracks()[0];
  if (!track) {
    stream.getTracks().forEach((item) => item.stop());
    throw new Error('no-track');
  }
  return { stream, track };
}

export async function listCameras(): Promise<MediaDeviceInfo[]> {
  if (!getCameraCapabilities().selection) throw new Error('camera-list-unsupported');
  return (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === 'videoinput');
}

export function closeCamera(session: CameraSession | null): void {
  session?.stream.getTracks().forEach((track) => track.stop());
}

/** Avoid leaving the interface in limbo when a driver opens a track but never delivers a frame. */
export async function playCameraPreview(video: HTMLVideoElement, timeoutMs = CAMERA_PREVIEW_TIMEOUT_MS): Promise<void> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      video.play(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error('camera-preview-timeout')), Math.max(1, timeoutMs));
      }),
    ]);
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
  }
}

/** Measure delivered compositor frames when the browser supports video-frame callbacks. */
export function observeFrameRate(video: HTMLVideoElement, onRate: (fps: number) => void): () => void {
  const frameVideo = video as unknown as FrameCallbackVideo;
  if (!frameVideo.requestVideoFrameCallback) return () => undefined;
  let handle: number | undefined;
  let previous: { at: number; frames: number } | null = null;
  let stopped = false;
  const observe = (now: number, metadata: FrameCallbackMetadata) => {
    if (stopped) return;
    if (previous && now - previous.at >= 500) {
      onRate(frameRateFromSamples(metadata.presentedFrames - previous.frames, now - previous.at));
      previous = { at: now, frames: metadata.presentedFrames };
    } else if (!previous) {
      previous = { at: now, frames: metadata.presentedFrames };
    }
    handle = frameVideo.requestVideoFrameCallback?.(observe);
  };
  handle = frameVideo.requestVideoFrameCallback(observe);
  return () => {
    stopped = true;
    if (handle !== undefined) frameVideo.cancelVideoFrameCallback?.(handle);
  };
}

/** Draw a current video frame to an in-memory PNG. The caller controls any download. */
export async function snapshotFromVideo(video: HTMLVideoElement, mirrored: boolean): Promise<Blob> {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) throw new Error('no-frame');
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvas-unavailable');
  if (mirrored) {
    context.translate(width, 0);
    context.scale(-1, 1);
  }
  context.drawImage(video, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('encode-failed');
  return blob;
}
