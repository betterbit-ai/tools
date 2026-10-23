/** Browser-only canvas work for the passport-photo tool. */
import { yieldToBrowser } from '../../lib/browser';
import { withJfifDensity, type Crop, type PrintLayout } from './logic';

export type PhotoProgress = 'decoding' | 'drawing' | 'encoding';

export interface PhotoControl {
  signal?: AbortSignal;
  onProgress?: (progress: PhotoProgress) => void;
}

export class ImageDecodeError extends Error {}
export class OutputFormatError extends Error {}

export async function readDimensions(file: File): Promise<{ width: number; height: number }> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ImageDecodeError('The browser could not decode this image.');
  }
  const dimensions = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return dimensions;
}

export async function renderPhoto(
  file: File,
  crop: Crop,
  width: number,
  height: number,
  control: PhotoControl = {},
): Promise<Blob> {
  return renderJpeg(
    file,
    width,
    height,
    (context, bitmap) => {
      context.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
    },
    control,
  );
}

export async function renderPrintSheet(
  file: File,
  crop: Crop,
  photoWidth: number,
  photoHeight: number,
  layout: PrintLayout,
  control: PhotoControl = {},
): Promise<Blob> {
  return renderJpeg(
    file,
    1200,
    1800,
    (context, bitmap) => {
      for (let row = 0; row < layout.rows; row++) {
        for (let col = 0; col < layout.cols; col++) {
          const x = layout.x + col * (photoWidth + layout.gap);
          const y = layout.y + row * (photoHeight + layout.gap);
          context.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, x, y, photoWidth, photoHeight);
        }
      }
    },
    control,
  );
}

async function renderJpeg(
  file: File,
  width: number,
  height: number,
  draw: (context: CanvasRenderingContext2D, bitmap: ImageBitmap) => void,
  control: PhotoControl,
): Promise<Blob> {
  let bitmap: ImageBitmap | undefined;
  let canvas: HTMLCanvasElement | undefined;
  try {
    control.onProgress?.('decoding');
    await yieldToBrowser();
    throwIfAborted(control.signal);
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      throw new ImageDecodeError('The browser could not decode this image.');
    }
    throwIfAborted(control.signal);

    canvas = makeCanvas(width, height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas rendering is unavailable.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.imageSmoothingQuality = 'high';

    control.onProgress?.('drawing');
    await yieldToBrowser();
    throwIfAborted(control.signal);
    draw(context, bitmap);
    bitmap.close();
    bitmap = undefined;

    control.onProgress?.('encoding');
    await yieldToBrowser();
    throwIfAborted(control.signal);
    return await toJpeg(canvas, control.signal);
  } finally {
    bitmap?.close();
    // Release the canvas backing store after the encoded Blob has its own bytes.
    if (canvas) {
      canvas.width = 1;
      canvas.height = 1;
    }
  }
}

function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

async function toJpeg(canvas: HTMLCanvasElement, signal?: AbortSignal): Promise<Blob> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', onAbort);
      callback();
    };
    const onAbort = () => finish(() => reject(new DOMException('Photo rendering was cancelled.', 'AbortError')));
    if (signal?.aborted) {
      onAbort();
      return;
    }
    signal?.addEventListener('abort', onAbort, { once: true });
    canvas.toBlob(
      (value) =>
        finish(() => {
          if (!value) reject(new Error('Image encoding failed.'));
          else if (value.type.toLowerCase() !== 'image/jpeg') {
            reject(new OutputFormatError(`The browser returned ${value.type || 'an unknown format'} instead of JPEG.`));
          } else resolve(value);
        }),
      'image/jpeg',
      0.96,
    );
  });
  throwIfAborted(signal);
  const bytes = withJfifDensity(new Uint8Array(await blob.arrayBuffer()));
  throwIfAborted(signal);
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'image/jpeg' });
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('Photo rendering was cancelled.', 'AbortError');
}
