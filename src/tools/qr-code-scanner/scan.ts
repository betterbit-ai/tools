/** Browser-only image and camera decoding. Pixels never leave the current tab. */

import { validateImageDimensions } from './logic';

export type ScanFailure = 'image-too-large' | 'unreadable-image' | 'no-code' | 'no-frame';

export interface DecodedImage {
  value: string | null;
  width: number;
  height: number;
}

export interface CameraSession {
  stream: MediaStream;
}

/** Requests video only, favoring the rear camera when the browser can choose one. */
export async function openCamera(deviceId: string): Promise<CameraSession> {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('camera-unavailable');
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: 'environment' } },
  });
  return { stream };
}

export async function listCameras(): Promise<MediaDeviceInfo[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return [];
  return (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === 'videoinput');
}

export function closeCamera(session: CameraSession | null): void {
  session?.stream.getTracks().forEach((track) => track.stop());
}

async function decodePixels(source: CanvasImageSource, width: number, height: number): Promise<string | null> {
  const limitError = validateImageDimensions(width, height);
  if (limitError) throw new Error(limitError);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('unreadable-image');
  context.drawImage(source, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height);
  const { default: jsQR } = await import('jsqr');
  return jsQR(pixels.data, width, height, { inversionAttempts: 'attemptBoth' })?.data ?? null;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('unreadable-image'));
    };
    image.src = url;
  });
}

/** Decodes an image file locally and reports its source dimensions for the preview. */
export async function scanImage(file: File): Promise<DecodedImage> {
  const image = await loadImage(file);
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  return { value: await decodePixels(image, width, height), width, height };
}

/** Decodes the current camera frame locally. The caller controls frame scheduling and camera lifetime. */
export async function scanVideoFrame(video: HTMLVideoElement): Promise<string | null> {
  if (!video.videoWidth || !video.videoHeight) throw new Error('no-frame');
  return decodePixels(video, video.videoWidth, video.videoHeight);
}
