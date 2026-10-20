/** Browser-only canvas rendering for image-watermark. */
import { yieldToBrowser } from '../../lib/browser';
import {
  anchorPoint,
  isAnimatedGif,
  isAnimatedWebp,
  normalizeOptions,
  outputMime,
  tileOrigins,
  type WatermarkOptions,
} from './logic';

export type WatermarkProgress = 'decoding' | 'drawing' | 'encoding';

export interface WatermarkControl {
  signal?: AbortSignal;
  onProgress?: (progress: WatermarkProgress) => void;
}

export class ImageDecodeError extends Error {}
export class OutputFormatError extends Error {}

export async function readDimensions(file: File): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    return { width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
}

/** Canvas outputs a still image, so animated sources must not be flattened without warning. */
export async function isAnimatedImage(file: File): Promise<boolean> {
  const type = file.type.toLowerCase();
  if (type !== 'image/gif' && type !== 'image/webp') return false;
  const bytes = new Uint8Array(await file.arrayBuffer());
  return type === 'image/gif' ? isAnimatedGif(bytes) : isAnimatedWebp(bytes);
}

/**
 * Decode, draw, and encode one full-resolution image. Stage yields use MessageChannel so
 * progress and cancellation continue when the page is behind another tab.
 */
export async function watermarkImage(
  file: File,
  options: WatermarkOptions,
  logo?: File,
  control: WatermarkControl = {},
): Promise<Blob> {
  throwIfAborted(control.signal);
  control.onProgress?.('decoding');
  await yieldToBrowser();

  let source: ImageBitmap;
  try {
    source = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new ImageDecodeError('The browser could not decode this image.');
  }

  let logoBitmap: ImageBitmap | undefined;
  let canvas: HTMLCanvasElement | undefined;
  try {
    throwIfAborted(control.signal);
    if (options.mode === 'logo') {
      if (!logo) throw new Error('Logo is required');
      logoBitmap = await createImageBitmap(logo, { imageOrientation: 'from-image' });
    }

    control.onProgress?.('drawing');
    await yieldToBrowser();
    throwIfAborted(control.signal);

    canvas = makeCanvas(source.width, source.height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable');
    const mime = outputMime(options.format, file.type);
    if (mime === 'image/jpeg') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(source, 0, 0);
    await drawWatermark(context, canvas.width, canvas.height, options, logoBitmap, control.signal);

    control.onProgress?.('encoding');
    await yieldToBrowser();
    throwIfAborted(control.signal);
    const blob = await toBlob(canvas, mime, mime === 'image/png' ? undefined : 0.92, control.signal);
    throwIfAborted(control.signal);
    if (blob.type.toLowerCase() !== mime.toLowerCase()) {
      throw new OutputFormatError(`The browser returned ${blob.type || 'an unknown format'} instead of ${mime}.`);
    }
    return blob;
  } finally {
    source.close();
    logoBitmap?.close();
    if (canvas) {
      canvas.width = 1;
      canvas.height = 1;
    }
  }
}

async function drawWatermark(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  rawOptions: WatermarkOptions,
  logo?: ImageBitmap,
  signal?: AbortSignal,
): Promise<void> {
  const options = normalizeOptions(rawOptions);
  const targetWidth = width * (options.size / 100);
  const mark = createMark(options, targetWidth, logo);
  const padding = Math.min(width, height) * 0.04;
  const gap = width * (options.gap / 100);
  const points =
    options.layout === 'tile'
      ? tileOrigins(width, height, mark.width, mark.height, gap)
      : [anchorPoint(width, height, mark.width, mark.height, options.position, padding)];
  context.save();
  try {
    context.globalAlpha = options.opacity / 100;
    for (const [index, point] of points.entries()) {
      if (index > 0 && index % 100 === 0) {
        await yieldToBrowser();
        throwIfAborted(signal);
      }
      context.save();
      context.translate(point.x + mark.width / 2, point.y + mark.height / 2);
      context.rotate((options.rotation * Math.PI) / 180);
      context.drawImage(mark, -mark.width / 2, -mark.height / 2);
      context.restore();
    }
  } finally {
    context.restore();
    mark.width = 1;
    mark.height = 1;
  }
}

function createMark(options: WatermarkOptions, targetWidth: number, logo?: ImageBitmap): HTMLCanvasElement {
  if (options.mode === 'logo' && logo) {
    const width = Math.max(1, Math.round(targetWidth));
    const height = Math.max(1, Math.round((logo.height / logo.width) * width));
    const canvas = makeCanvas(width, height);
    canvas.getContext('2d')!.drawImage(logo, 0, 0, width, height);
    return canvas;
  }
  const measureCanvas = makeCanvas(1, 1);
  const measure = measureCanvas.getContext('2d')!;
  const text = options.text || '©';
  let fontSize = Math.max(12, Math.round(targetWidth / 7));
  measure.font = `700 ${fontSize}px system-ui, sans-serif`;
  const measuredWidth = Math.max(1, measure.measureText(text).width);
  fontSize = Math.max(12, Math.round((fontSize * targetWidth) / measuredWidth));
  measure.font = `700 ${fontSize}px system-ui, sans-serif`;
  const metrics = measure.measureText(text);
  const padding = Math.max(4, Math.round(fontSize * 0.12));
  const width = Math.ceil(metrics.width + padding * 2);
  const height = Math.ceil(fontSize * 1.3 + padding * 2);
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(1, fontSize / 18);
  ctx.strokeStyle = options.color === 'light' ? '#111111' : '#ffffff';
  ctx.fillStyle = options.color === 'light' ? '#ffffff' : '#111111';
  ctx.strokeText(text, padding, height / 2);
  ctx.fillText(text, padding, height / 2);
  return canvas;
}

function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('Watermarking was cancelled.', 'AbortError');
}

function toBlob(canvas: HTMLCanvasElement, mime: string, quality?: number, signal?: AbortSignal): Promise<Blob> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', onAbort);
      callback();
    };
    const onAbort = () => finish(() => reject(new DOMException('Watermarking was cancelled.', 'AbortError')));
    signal?.addEventListener('abort', onAbort, { once: true });
    canvas.toBlob(
      (blob) => finish(() => (blob ? resolve(blob) : reject(new Error('Unable to encode image')))),
      mime,
      quality,
    );
    if (signal?.aborted) onAbort();
  });
}
