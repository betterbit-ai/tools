/** Browser-only image decode, EXIF-aware draw, and canvas encoding. */
import { yieldToBrowser } from '../../lib/browser';
import { transformedDimensions, type TransformOptions } from './logic';

export type RotateProgress = 'decoding' | 'drawing' | 'encoding';

export interface RotateControl {
  signal?: AbortSignal;
  onProgress?: (progress: RotateProgress) => void;
}

export interface RotateResult {
  blob: Blob;
  width: number;
  height: number;
  sourceWidth: number;
  sourceHeight: number;
}

export class ImageDecodeError extends Error {}
export class OutputFormatError extends Error {}

/**
 * Decode and transform one image at a time. Each stage yields through MessageChannel so
 * progress and cancellation still update when the page is in a background tab.
 */
export async function rotateImage(
  file: File,
  opts: TransformOptions,
  mime: string,
  quality: number,
  control: RotateControl = {},
): Promise<RotateResult> {
  throwIfAborted(control.signal);
  control.onProgress?.('decoding');
  await yieldToBrowser();

  let bitmap: ImageBitmap;
  try {
    // `from-image` applies a phone photo's EXIF orientation before export.
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new ImageDecodeError('The browser could not decode this image.');
  }

  let canvas: HTMLCanvasElement | null = null;
  try {
    throwIfAborted(control.signal);
    const sourceWidth = bitmap.width;
    const sourceHeight = bitmap.height;
    const { width, height } = transformedDimensions(sourceWidth, sourceHeight, opts.rotation);

    control.onProgress?.('drawing');
    await yieldToBrowser();
    throwIfAborted(control.signal);

    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas rendering is unavailable.');

    if (mime === 'image/jpeg') {
      // JPEG has no alpha channel; avoid transparent pixels turning black.
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
    }

    context.translate(width / 2, height / 2);
    context.rotate((opts.rotation * Math.PI) / 180);
    context.scale(opts.flipHorizontal ? -1 : 1, opts.flipVertical ? -1 : 1);
    context.drawImage(bitmap, -sourceWidth / 2, -sourceHeight / 2);
    bitmap.close();

    control.onProgress?.('encoding');
    await yieldToBrowser();
    throwIfAborted(control.signal);
    const blob = await toBlob(canvas, mime, quality, control.signal);
    throwIfAborted(control.signal);
    if (blob.type.toLowerCase() !== mime.toLowerCase()) {
      throw new OutputFormatError(`The browser returned ${blob.type || 'an unknown format'} instead of ${mime}.`);
    }

    return { blob, width, height, sourceWidth, sourceHeight };
  } finally {
    bitmap.close();
    if (canvas) {
      canvas.width = 1;
      canvas.height = 1;
    }
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('Image rotation was cancelled.', 'AbortError');
}

function toBlob(canvas: HTMLCanvasElement, mime: string, quality: number, signal?: AbortSignal): Promise<Blob> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', onAbort);
      callback();
    };
    const onAbort = () => finish(() => reject(new DOMException('Image rotation was cancelled.', 'AbortError')));
    signal?.addEventListener('abort', onAbort, { once: true });
    canvas.toBlob(
      (blob) => finish(() => (blob ? resolve(blob) : reject(new Error('Image encoding failed.')))),
      mime,
      quality,
    );
    if (signal?.aborted) onAbort();
  });
}
