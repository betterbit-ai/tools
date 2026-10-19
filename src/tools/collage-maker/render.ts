/** Browser-only canvas work for the collage maker. */
import { yieldToBrowser } from '../../lib/browser';
import { layoutCells, outputDimensions, safeGap, type AspectId, type FormatChoice, type LayoutId } from './logic';

export interface RenderOptions {
  layout: LayoutId;
  aspect: AspectId;
  longSide: number;
  gap: number;
  format: FormatChoice;
  quality: number;
}

export interface RenderProgress {
  stage: 'drawing' | 'encoding';
  current: number;
  total: number;
}

export interface RenderControl {
  signal?: AbortSignal;
  onProgress?: (progress: RenderProgress) => void;
}

let renderQueue: Promise<void> = Promise.resolve();

export async function renderCollage(files: File[], options: RenderOptions, control: RenderControl = {}): Promise<Blob> {
  const releaseTurn = await takeRenderTurn();
  let canvas: HTMLCanvasElement | undefined;
  try {
    throwIfAborted(control.signal);
    const { width, height } = outputDimensions(options.aspect, options.longSide);
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable');

    // JPEG needs an opaque background; white is also a predictable print-ready gap.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);

    const cells = layoutCells(options.layout, files.length);
    const gap = safeGap(options.gap, width, height);
    await yieldToBrowser();
    throwIfAborted(control.signal);

    // Decode and release one source at a time. Twelve 24 MP RGBA bitmaps would
    // otherwise exceed a gigabyte even though the final canvas is at most 4K.
    for (let index = 0; index < cells.length; index++) {
      control.onProgress?.({ stage: 'drawing', current: index + 1, total: cells.length });
      await yieldToBrowser();
      throwIfAborted(control.signal);
      const bitmap = await createImageBitmap(files[index]);
      try {
        throwIfAborted(control.signal);
        const cell = cells[index];
        const x = Math.round(cell.x * width) + gap / 2;
        const y = Math.round(cell.y * height) + gap / 2;
        const cellWidth = Math.max(1, Math.round(cell.width * width) - gap);
        const cellHeight = Math.max(1, Math.round(cell.height * height) - gap);
        drawCover(context, bitmap, x, y, cellWidth, cellHeight);
      } finally {
        bitmap.close();
      }
    }

    control.onProgress?.({ stage: 'encoding', current: cells.length, total: cells.length });
    await yieldToBrowser();
    throwIfAborted(control.signal);
    return await toBlob(canvas, options.format, options.quality, control.signal);
  } finally {
    // Explicitly release the backing store after encoding or cancellation.
    if (canvas) {
      canvas.width = 1;
      canvas.height = 1;
    }
    releaseTurn();
  }
}

async function takeRenderTurn(): Promise<() => void> {
  const previous = renderQueue;
  let release = () => {};
  renderQueue = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  return release;
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('Collage rendering was cancelled', 'AbortError');
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: ImageBitmap,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const sourceRatio = image.width / image.height;
  const targetRatio = width / height;
  const sourceWidth = sourceRatio > targetRatio ? image.height * targetRatio : image.width;
  const sourceHeight = sourceRatio > targetRatio ? image.height : image.width / targetRatio;
  const sourceX = (image.width - sourceWidth) / 2;
  const sourceY = (image.height - sourceHeight) / 2;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function toBlob(canvas: HTMLCanvasElement, format: FormatChoice, quality: number, signal?: AbortSignal): Promise<Blob> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', onAbort);
      callback();
    };
    const onAbort = () => finish(() => reject(new DOMException('Collage rendering was cancelled', 'AbortError')));

    if (signal?.aborted) {
      onAbort();
      return;
    }
    signal?.addEventListener('abort', onAbort, { once: true });
    canvas.toBlob(
      (blob) =>
        finish(() => {
          if (!blob) {
            reject(new Error('Image encoding failed'));
          } else if (blob.type !== format) {
            reject(new Error(`Browser encoded ${blob.type || 'an unknown format'} instead of ${format}`));
          } else {
            resolve(blob);
          }
        }),
      format,
      quality,
    );
  });
}
