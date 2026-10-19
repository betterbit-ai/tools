/** Browser-only pixel work: draw the cropped region, optionally masked to a circle. */
import { yieldToBrowser } from '../../lib/browser';
import type { CropRect, ShapeKind } from './logic';

export type CropProgress = 'decoding' | 'drawing' | 'encoding';

export interface CropControl {
  signal?: AbortSignal;
  onProgress?: (stage: CropProgress) => void;
}

export async function readDimensions(file: File): Promise<{ width: number; height: number }> {
  const bmp = await createImageBitmap(file);
  const dims = { width: bmp.width, height: bmp.height };
  bmp.close();
  return dims;
}

export async function cropImage(
  file: File,
  rect: CropRect,
  shape: ShapeKind,
  mime: string,
  quality: number,
  control: CropControl = {},
): Promise<Blob> {
  let bmp: ImageBitmap | undefined;
  let canvas: HTMLCanvasElement | undefined;
  try {
    control.onProgress?.('decoding');
    await yieldToBrowser();
    throwIfAborted(control.signal);
    bmp = await createImageBitmap(file);
    throwIfAborted(control.signal);

    canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(rect.w));
    canvas.height = Math.max(1, Math.round(rect.h));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is unavailable');

    if (mime === 'image/jpeg') {
      // JPEG has no alpha: fill white first so a circle crop doesn't turn black outside the mask.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (shape === 'circle') {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2, 0, 0, Math.PI * 2);
      ctx.clip();
    }

    control.onProgress?.('drawing');
    await yieldToBrowser();
    throwIfAborted(control.signal);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bmp, rect.x, rect.y, rect.w, rect.h, 0, 0, canvas.width, canvas.height);

    if (shape === 'circle') ctx.restore();

    control.onProgress?.('encoding');
    await yieldToBrowser();
    throwIfAborted(control.signal);
    return await toBlob(canvas, mime, quality, control.signal);
  } finally {
    bmp?.close();
    // Do not retain a multi-megapixel backing store while the downloaded Blob lives on.
    if (canvas) {
      canvas.width = 1;
      canvas.height = 1;
    }
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('Image crop was cancelled', 'AbortError');
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
    const onAbort = () => finish(() => reject(new DOMException('Image crop was cancelled', 'AbortError')));

    if (signal?.aborted) {
      onAbort();
      return;
    }
    signal?.addEventListener('abort', onAbort, { once: true });
    canvas.toBlob(
      (blob) =>
        finish(() => {
          if (!blob) reject(new Error('Image encoding failed'));
          else if (blob.type !== mime)
            reject(new Error(`Browser encoded ${blob.type || 'an unknown format'} instead of ${mime}`));
          else resolve(blob);
        }),
      mime,
      quality,
    );
  });
}
