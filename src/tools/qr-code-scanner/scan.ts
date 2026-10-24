/** Browser-only image and camera decoding. Pixels never leave the current tab. */

import { yieldToBrowser } from '../../lib/browser';
import { createScanRegions, fitScanDimensions, validateImageDimensions, type ScanRegion } from './logic';

export type ScanFailure = 'image-too-large' | 'unreadable-image' | 'no-code' | 'no-frame';

export interface DecodedImage {
  value: string | null;
  width: number;
  height: number;
}

export interface CameraSession {
  stream: MediaStream;
}

export interface ScanProgress {
  completed: number;
  total: number;
}

export interface ScanImageOptions {
  signal?: AbortSignal;
  onProgress?: (progress: ScanProgress) => void;
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

function abortError(): DOMException {
  return new DOMException('Image scanning was cancelled.', 'AbortError');
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw abortError();
}

async function decodePixels(
  source: CanvasImageSource,
  width: number,
  height: number,
  options: ScanImageOptions & { detailPasses?: boolean } = {},
): Promise<string | null> {
  const limitError = validateImageDimensions(width, height);
  if (limitError) throw new Error(limitError);
  let regions: ScanRegion[];
  if (options.detailPasses === false) {
    const target = fitScanDimensions(width, height);
    regions = [
      {
        sourceX: 0,
        sourceY: 0,
        sourceWidth: width,
        sourceHeight: height,
        targetWidth: target.width,
        targetHeight: target.height,
      },
    ];
  } else {
    regions = createScanRegions(width, height);
  }

  throwIfAborted(options.signal);
  await yieldToBrowser();
  throwIfAborted(options.signal);
  const { default: jsQR } = await import('jsqr');
  const canvas = document.createElement('canvas');
  try {
    for (let index = 0; index < regions.length; index++) {
      throwIfAborted(options.signal);
      options.onProgress?.({ completed: index, total: regions.length });
      await yieldToBrowser();
      throwIfAborted(options.signal);

      const scan = regions[index];
      canvas.width = scan.targetWidth;
      canvas.height = scan.targetHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('unreadable-image');
      context.drawImage(
        source,
        scan.sourceX,
        scan.sourceY,
        scan.sourceWidth,
        scan.sourceHeight,
        0,
        0,
        scan.targetWidth,
        scan.targetHeight,
      );
      const pixels = context.getImageData(0, 0, scan.targetWidth, scan.targetHeight);
      const value = jsQR(pixels.data, scan.targetWidth, scan.targetHeight, { inversionAttempts: 'attemptBoth' })?.data;
      options.onProgress?.({ completed: index + 1, total: regions.length });
      if (value) return value;
    }
    return null;
  } finally {
    // Explicitly release the largest backing store before the next photo or camera frame.
    canvas.width = 1;
    canvas.height = 1;
  }
}

function loadImage(file: File, signal?: AbortSignal): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    const cleanup = () => {
      URL.revokeObjectURL(url);
      signal?.removeEventListener('abort', onAbort);
    };
    const onAbort = () => {
      image.src = '';
      cleanup();
      reject(abortError());
    };
    image.onload = () => {
      cleanup();
      if (signal?.aborted) reject(abortError());
      else resolve(image);
    };
    image.onerror = () => {
      cleanup();
      reject(new Error('unreadable-image'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    if (signal?.aborted) return onAbort();
    image.src = url;
  });
}

/** Decodes an image file locally and reports its source dimensions for the preview. */
export async function scanImage(file: File, options: ScanImageOptions = {}): Promise<DecodedImage> {
  const image = await loadImage(file, options.signal);
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  return { value: await decodePixels(image, width, height, options), width, height };
}

/** Decodes the current camera frame locally. The caller controls frame scheduling and camera lifetime. */
export async function scanVideoFrame(video: HTMLVideoElement): Promise<string | null> {
  if (!video.videoWidth || !video.videoHeight) throw new Error('no-frame');
  return decodePixels(video, video.videoWidth, video.videoHeight, { detailPasses: false });
}
