/**
 * Browser-only pixel work: canvas encoding and the scale/quality search loop.
 * Pure decision-making (search algorithm, size math) lives in logic.ts.
 */
import { yieldToBrowser } from '../../lib/browser';
import {
  SCALE_STEPS,
  searchQuality,
  shouldKeepOriginal,
  smallerResult,
  supportsQuality,
  type EncodeResult,
} from './logic';

export async function readDimensions(file: File): Promise<{ width: number; height: number }> {
  const bmp = await createImageBitmap(file);
  const dims = { width: bmp.width, height: bmp.height };
  bmp.close();
  return dims;
}

export interface CompressResult extends EncodeResult {
  blob: Blob;
  width: number;
  height: number;
  keptOriginal?: boolean;
}

export interface CompressProgress {
  attempt: number;
  maximum: number;
}

export interface CompressOptions {
  signal?: AbortSignal;
  onProgress?: (progress: CompressProgress) => void;
}

async function encodeAt(
  bmp: ImageBitmap,
  width: number,
  height: number,
  mime: string,
  quality: number,
  signal?: AbortSignal,
): Promise<CompressResult> {
  throwIfAborted(signal);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser could not create an image canvas.');
  if (mime === 'image/jpeg') {
    // JPEG has no alpha: transparent pixels would turn black.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, 0, 0, width, height);
  const blob = await canvasToBlob(canvas, mime, quality, signal);
  if (blob.type !== mime) throw new Error(`This browser cannot encode ${mime}.`);
  return { blob, width, height, size: blob.size };
}

/** Quality-slider mode: one encode at the given quality, original dimensions. */
export async function compressAtQuality(
  file: File,
  mime: string,
  quality: number,
  options: CompressOptions = {},
): Promise<CompressResult> {
  const bmp = await createImageBitmap(file);
  try {
    options.onProgress?.({ attempt: 1, maximum: 1 });
    await yieldToBrowser();
    const encoded = await encodeAt(bmp, bmp.width, bmp.height, mime, quality, options.signal);
    return shouldKeepOriginal(file.size, encoded.size, file.type, mime)
      ? originalResult(file, bmp.width, bmp.height)
      : encoded;
  } finally {
    bmp.close();
  }
}

/**
 * Target-size mode: binary-search quality at full size first; if even the
 * lowest quality is still too big, step down the dimensions and search again.
 */
export async function compressToTarget(
  file: File,
  mime: string,
  targetBytes: number,
  options: CompressOptions = {},
): Promise<{ result: CompressResult; quality: number; achieved: boolean }> {
  const bmp = await createImageBitmap(file);
  try {
    throwIfAborted(options.signal);
    if (file.type === mime && file.size <= targetBytes) {
      return { result: originalResult(file, bmp.width, bmp.height), quality: 1, achieved: true };
    }

    const maximum = supportsQuality(mime) ? SCALE_STEPS.length * 8 : SCALE_STEPS.length;
    let attempt = 0;
    let smallest: CompressResult | undefined;
    let lastQuality = 1;
    const encode = async (width: number, height: number, quality: number) => {
      throwIfAborted(options.signal);
      options.onProgress?.({ attempt: ++attempt, maximum });
      await yieldToBrowser();
      return encodeAt(bmp, width, height, mime, quality, options.signal);
    };

    for (const scale of SCALE_STEPS) {
      const width = Math.max(1, Math.round(bmp.width * scale));
      const height = Math.max(1, Math.round(bmp.height * scale));
      if (!supportsQuality(mime)) {
        const result = await encode(width, height, 1);
        smallest = smallerResult(smallest, result);
        if (result.size <= targetBytes) return { quality: 1, result, achieved: true };
        continue;
      }
      const outcome = await searchQuality(targetBytes, (quality) => encode(width, height, quality));
      lastQuality = outcome.quality;
      smallest = smallerResult(smallest, outcome.result);
      if (outcome.achieved) return outcome;
    }

    if (!smallest) throw new Error('No compression result was produced.');
    const result = shouldKeepOriginal(file.size, smallest.size, file.type, mime)
      ? originalResult(file, bmp.width, bmp.height)
      : smallest;
    return { result, quality: lastQuality, achieved: result.size <= targetBytes };
  } finally {
    bmp.close();
  }
}

function originalResult(file: File, width: number, height: number): CompressResult {
  return { blob: file, width, height, size: file.size, keptOriginal: true };
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('Image compression was cancelled.', 'AbortError');
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number, signal?: AbortSignal): Promise<Blob> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', onAbort);
      callback();
    };
    const onAbort = () => finish(() => reject(new DOMException('Image compression was cancelled.', 'AbortError')));
    signal?.addEventListener('abort', onAbort, { once: true });
    canvas.toBlob(
      (blob) =>
        finish(() => {
          if (blob) resolve(blob);
          else reject(new Error(`This browser could not encode ${mime}.`));
        }),
      mime,
      quality,
    );
    if (signal?.aborted) onAbort();
  });
}
