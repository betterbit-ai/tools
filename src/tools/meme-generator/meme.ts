/** Browser-only Canvas rendering for meme-generator. */
import {
  constrainedImageDimensions,
  isSupportedImageFileSize,
  normalizeOptions,
  presetDimensions,
  wrapCaption,
  type CanvasPreset,
  type MemeOptions,
} from './logic';
import { yieldToBrowser } from '../../lib/browser';

const FONT_FAMILY = 'Impact, "Arial Black", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif';

export interface LoadedImage {
  bitmap: ImageBitmap;
  originalWidth: number;
  originalHeight: number;
}

function cancelled(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
}

export async function readImage(file: File, signal?: AbortSignal): Promise<LoadedImage> {
  if (!isSupportedImageFileSize(file.size)) throw new Error('Image file is too large');

  cancelled(signal);
  let source: ImageBitmap | null = await createImageBitmap(file);
  try {
    cancelled(signal);
    const originalWidth = source.width;
    const originalHeight = source.height;
    const dimensions = constrainedImageDimensions(source.width, source.height);
    if (dimensions.width === source.width && dimensions.height === source.height) {
      const bitmap = source;
      source = null;
      return { bitmap, originalWidth, originalHeight };
    }

    await yieldToBrowser();
    cancelled(signal);
    const resized = await createImageBitmap(source, {
      resizeWidth: dimensions.width,
      resizeHeight: dimensions.height,
      resizeQuality: 'high',
    });
    if (signal?.aborted) {
      resized.close();
      cancelled(signal);
    }
    return { bitmap: resized, originalWidth, originalHeight };
  } finally {
    source?.close();
  }
}

export function drawMeme(
  canvas: HTMLCanvasElement,
  source: ImageBitmap | null,
  preset: CanvasPreset,
  rawOptions: MemeOptions,
  targetDimensions?: { width: number; height: number },
): { width: number; height: number } {
  const options = normalizeOptions(rawOptions);
  const dimensions =
    targetDimensions ?? (source ? { width: source.width, height: source.height } : presetDimensions(preset));
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable');

  if (source) {
    context.drawImage(source, 0, 0, dimensions.width, dimensions.height);
  } else {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  drawCaption(context, options.topText, 'top', options, dimensions.width, dimensions.height);
  drawCaption(context, options.bottomText, 'bottom', options, dimensions.width, dimensions.height);
  return dimensions;
}

function drawCaption(
  context: CanvasRenderingContext2D,
  rawText: string,
  position: 'top' | 'bottom',
  options: MemeOptions,
  width: number,
  height: number,
): void {
  const text = options.allCaps ? rawText.toLocaleUpperCase() : rawText;
  if (!text) return;
  const fontSize = Math.round(Math.min(width, height) * (options.fontScale / 100));
  context.font = `900 ${fontSize}px ${FONT_FAMILY}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.lineJoin = 'round';
  const lines = wrapCaption(text, width * 0.9, (line) => context.measureText(line).width);
  const lineHeight = Math.round(fontSize * 1.06);
  const padding = Math.max(12, Math.round(Math.min(width, height) * 0.025));
  const firstY = position === 'top' ? padding + lineHeight / 2 : height - padding - lineHeight * (lines.length - 0.5);
  context.lineWidth = Math.max(2, Math.round(fontSize * 0.12));
  context.strokeStyle = '#000000';
  context.fillStyle = '#ffffff';
  for (const [index, line] of lines.entries()) {
    const y = firstY + index * lineHeight;
    context.strokeText(line, width / 2, y, width * 0.94);
    context.fillText(line, width / 2, y, width * 0.94);
  }
}

export function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Unable to encode the meme'))), 'image/png'),
  );
}

/** Renders the full-resolution result on a short-lived canvas so the live preview stays lightweight. */
export async function renderMemeBlob(
  source: ImageBitmap | null,
  preset: CanvasPreset,
  options: MemeOptions,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  try {
    drawMeme(canvas, source, preset, options);
    return await canvasBlob(canvas);
  } finally {
    canvas.width = 1;
    canvas.height = 1;
  }
}
