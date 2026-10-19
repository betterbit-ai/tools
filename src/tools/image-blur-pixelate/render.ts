/** Browser-only decoding, bounded preview work, and full-resolution image rendering. */
import { yieldToBrowser } from '../../lib/browser';
import { boundedDimensions, type Effect, type OutputFormat, type Region } from './logic';

export interface LoadedImage {
  bitmap: ImageBitmap;
  width: number;
  height: number;
}

export interface RenderProgress {
  stage: 'drawing' | 'effects' | 'encoding';
  current: number;
  total: number;
}

export interface RenderControl {
  maxLongSide?: number;
  signal?: AbortSignal;
  onProgress?: (progress: RenderProgress) => void;
}

let renderQueue: Promise<void> = Promise.resolve();

export async function loadImage(file: File): Promise<LoadedImage> {
  const bitmap = await createImageBitmap(file);
  if (bitmap.width < 1 || bitmap.height < 1) {
    bitmap.close();
    throw new Error('empty-image');
  }
  return { bitmap, width: bitmap.width, height: bitmap.height };
}

/**
 * Renders either a bounded preview or the native-size download. Work is serialized so a
 * cancelled preview and a full export never retain two large canvas backing stores together.
 */
export async function renderImage(
  image: LoadedImage,
  regions: Region[],
  effect: Effect,
  strength: number,
  format: OutputFormat,
  quality: number,
  control: RenderControl = {},
): Promise<Blob> {
  const releaseTurn = await takeRenderTurn();
  let canvas: HTMLCanvasElement | undefined;
  try {
    throwIfAborted(control.signal);
    const dimensions = control.maxLongSide
      ? boundedDimensions(image.width, image.height, control.maxLongSide)
      : { width: image.width, height: image.height };
    const scale = dimensions.width / image.width;
    canvas = makeCanvas(dimensions.width, dimensions.height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('canvas-unavailable');

    control.onProgress?.({ stage: 'drawing', current: 0, total: regions.length });
    await yieldToBrowser();
    throwIfAborted(control.signal);

    if (format === 'image/jpeg') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, dimensions.width, dimensions.height);
    }
    context.drawImage(image.bitmap, 0, 0, image.width, image.height, 0, 0, dimensions.width, dimensions.height);

    for (let index = 0; index < regions.length; index++) {
      control.onProgress?.({ stage: 'effects', current: index + 1, total: regions.length });
      await yieldToBrowser();
      throwIfAborted(control.signal);
      const region = regions[index];
      const sourceX = Math.round(region.x * image.width);
      const sourceY = Math.round(region.y * image.height);
      const sourceWidth = Math.max(1, Math.round(region.width * image.width));
      const sourceHeight = Math.max(1, Math.round(region.height * image.height));
      const x = Math.round(region.x * dimensions.width);
      const y = Math.round(region.y * dimensions.height);
      const width = Math.max(1, Math.round(region.width * dimensions.width));
      const height = Math.max(1, Math.round(region.height * dimensions.height));
      const scaledStrength = Math.max(1, strength * scale);
      if (effect === 'blur') {
        blurRegion(
          context,
          image.bitmap,
          { x: sourceX, y: sourceY, width: sourceWidth, height: sourceHeight },
          { x, y, width, height },
          scaledStrength,
          scale,
        );
      } else {
        pixelateRegion(
          context,
          image.bitmap,
          { x: sourceX, y: sourceY, width: sourceWidth, height: sourceHeight },
          { x, y, width, height },
          scaledStrength,
        );
      }
    }

    control.onProgress?.({ stage: 'encoding', current: regions.length, total: regions.length });
    await yieldToBrowser();
    throwIfAborted(control.signal);
    return await toBlob(canvas, format, quality, control.signal);
  } finally {
    if (canvas) {
      canvas.width = 1;
      canvas.height = 1;
    }
    releaseTurn();
  }
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function blurRegion(
  context: CanvasRenderingContext2D,
  source: ImageBitmap,
  sourceRect: Rect,
  targetRect: Rect,
  radius: number,
  scale: number,
) {
  // Include surrounding pixels so the blur is natural at the selection edge, but redraw only
  // the selected neighborhood rather than rasterizing the entire 24 MP source for every box.
  const targetPadding = Math.ceil(radius * 2);
  const sourcePadding = Math.ceil(targetPadding / scale);
  const sourceX = Math.max(0, sourceRect.x - sourcePadding);
  const sourceY = Math.max(0, sourceRect.y - sourcePadding);
  const sourceRight = Math.min(source.width, sourceRect.x + sourceRect.width + sourcePadding);
  const sourceBottom = Math.min(source.height, sourceRect.y + sourceRect.height + sourcePadding);
  const targetX = Math.round(sourceX * scale);
  const targetY = Math.round(sourceY * scale);
  const targetWidth = Math.max(1, Math.round((sourceRight - sourceX) * scale));
  const targetHeight = Math.max(1, Math.round((sourceBottom - sourceY) * scale));

  context.save();
  context.beginPath();
  context.rect(targetRect.x, targetRect.y, targetRect.width, targetRect.height);
  context.clip();
  context.filter = `blur(${radius}px)`;
  context.drawImage(
    source,
    sourceX,
    sourceY,
    sourceRight - sourceX,
    sourceBottom - sourceY,
    targetX,
    targetY,
    targetWidth,
    targetHeight,
  );
  context.restore();
}

function pixelateRegion(
  context: CanvasRenderingContext2D,
  source: ImageBitmap,
  sourceRect: Rect,
  targetRect: Rect,
  blockSize: number,
) {
  const small = makeCanvas(
    Math.max(1, Math.ceil(targetRect.width / blockSize)),
    Math.max(1, Math.ceil(targetRect.height / blockSize)),
  );
  try {
    const smallContext = small.getContext('2d');
    if (!smallContext) throw new Error('canvas-unavailable');
    smallContext.imageSmoothingEnabled = true;
    smallContext.drawImage(
      source,
      sourceRect.x,
      sourceRect.y,
      sourceRect.width,
      sourceRect.height,
      0,
      0,
      small.width,
      small.height,
    );
    context.save();
    context.imageSmoothingEnabled = false;
    context.drawImage(
      small,
      0,
      0,
      small.width,
      small.height,
      targetRect.x,
      targetRect.y,
      targetRect.width,
      targetRect.height,
    );
    context.restore();
  } finally {
    small.width = 1;
    small.height = 1;
  }
}

function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
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
  if (signal?.aborted) throw new DOMException('Image rendering was cancelled', 'AbortError');
}

function toBlob(canvas: HTMLCanvasElement, format: OutputFormat, quality: number, signal?: AbortSignal): Promise<Blob> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', onAbort);
      callback();
    };
    const onAbort = () => finish(() => reject(new DOMException('Image rendering was cancelled', 'AbortError')));

    if (signal?.aborted) {
      onAbort();
      return;
    }
    signal?.addEventListener('abort', onAbort, { once: true });
    canvas.toBlob(
      (blob) =>
        finish(() => {
          if (!blob) reject(new Error('encode-failed'));
          else if (blob.type !== format) reject(new Error(`encoded-${blob.type || 'unknown'}-instead-of-${format}`));
          else resolve(blob);
        }),
      format,
      quality,
    );
  });
}
