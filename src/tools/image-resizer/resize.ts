/** Browser-only pixel work. Pure resize planning lives in logic.ts. */
import { yieldToBrowser } from '../../lib/browser';
import { planResize, type ResizeOptions, type ResizePlan } from './logic';

export type ResizeProgress =
  { stage: 'decoding' } | { stage: 'resizing'; current: number; total: number } | { stage: 'encoding' };

export interface ResizeControl {
  signal?: AbortSignal;
  onProgress?: (progress: ResizeProgress) => void;
}

export interface ResizeResult {
  blob: Blob;
  plan: ResizePlan;
  sourceWidth: number;
  sourceHeight: number;
}

export class ImageDecodeError extends Error {}
export class OutputFormatError extends Error {}

/**
 * Decode once, resize in halving steps, and release every decoded/canvas backing
 * store as soon as it is no longer needed. Yields between stages so progress,
 * cancellation, and background-tab work do not depend on throttled timers.
 */
export async function resizeImage(
  file: File,
  options: ResizeOptions,
  mime: string,
  quality: number,
  control: ResizeControl = {},
): Promise<ResizeResult> {
  throwIfAborted(control.signal);
  control.onProgress?.({ stage: 'decoding' });
  await yieldToBrowser();

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ImageDecodeError('The browser could not decode this image.');
  }

  let workingCanvas: HTMLCanvasElement | null = null;
  let outputCanvas: HTMLCanvasElement | null = null;
  try {
    throwIfAborted(control.signal);
    const plan = planResize(bitmap.width, bitmap.height, options);
    let source: CanvasImageSource = bitmap;
    let { sx, sy, sw, sh } = plan;
    const halvingSteps = countHalvingSteps(sw, sh, plan.width, plan.height);
    const totalSteps = halvingSteps + 1;
    let currentStep = 0;

    // Step down by halves until within 2× of the target. This avoids the
    // aliasing/moire that a single large canvas downscale produces.
    while (sw / 2 >= plan.width && sh / 2 >= plan.height) {
      control.onProgress?.({ stage: 'resizing', current: ++currentStep, total: totalSteps });
      await yieldToBrowser();
      throwIfAborted(control.signal);

      const width = Math.round(sw / 2);
      const height = Math.round(sh / 2);
      const nextCanvas = makeCanvas(width, height);
      const context = getContext(nextCanvas);
      context.imageSmoothingQuality = 'high';
      context.drawImage(source, sx, sy, sw, sh, 0, 0, width, height);
      releaseCanvas(workingCanvas);
      workingCanvas = nextCanvas;
      source = nextCanvas;
      sx = 0;
      sy = 0;
      sw = width;
      sh = height;
    }

    control.onProgress?.({ stage: 'resizing', current: ++currentStep, total: totalSteps });
    await yieldToBrowser();
    throwIfAborted(control.signal);

    outputCanvas = makeCanvas(plan.width, plan.height);
    const context = getContext(outputCanvas);
    if (mime === 'image/jpeg') {
      // JPEG has no alpha: transparent pixels would otherwise turn black.
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, plan.width, plan.height);
    }
    context.imageSmoothingQuality = 'high';
    context.drawImage(source, sx, sy, sw, sh, 0, 0, plan.width, plan.height);
    releaseCanvas(workingCanvas);
    workingCanvas = null;

    control.onProgress?.({ stage: 'encoding' });
    await yieldToBrowser();
    throwIfAborted(control.signal);
    const blob = await toBlob(outputCanvas, mime, quality, control.signal);
    throwIfAborted(control.signal);
    if (blob.type.toLowerCase() !== mime.toLowerCase()) {
      throw new OutputFormatError(`The browser returned ${blob.type || 'an unknown format'} instead of ${mime}.`);
    }

    return {
      blob,
      plan,
      sourceWidth: bitmap.width,
      sourceHeight: bitmap.height,
    };
  } finally {
    releaseCanvas(workingCanvas);
    releaseCanvas(outputCanvas);
    bitmap.close();
  }
}

function countHalvingSteps(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): number {
  let count = 0;
  while (sourceWidth / 2 >= targetWidth && sourceHeight / 2 >= targetHeight) {
    sourceWidth = Math.round(sourceWidth / 2);
    sourceHeight = Math.round(sourceHeight / 2);
    count++;
  }
  return count;
}

function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas rendering is unavailable.');
  return context;
}

function releaseCanvas(canvas: HTMLCanvasElement | null): void {
  if (!canvas) return;
  canvas.width = 1;
  canvas.height = 1;
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('Image resizing was cancelled.', 'AbortError');
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
    const onAbort = () => finish(() => reject(new DOMException('Image resizing was cancelled.', 'AbortError')));
    signal?.addEventListener('abort', onAbort, { once: true });
    canvas.toBlob(
      (blob) => finish(() => (blob ? resolve(blob) : reject(new Error('Image encoding failed.')))),
      mime,
      quality,
    );
    if (signal?.aborted) onAbort();
  });
}
