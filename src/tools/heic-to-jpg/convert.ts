/**
 * Browser-only half of the HEIC converter: get pixels out of a HEIC file and a
 * JPG back in. Container parsing and EXIF rewriting are pure and live in logic.ts.
 *
 * Two decode paths:
 *  1. `createImageBitmap` — Safari on macOS/iOS decodes HEIC natively, and that
 *     is where most HEIC photos actually are, so those users never download the
 *     WebAssembly decoder at all.
 *  2. libheif compiled to WebAssembly (~2 MB), imported on demand for Chrome,
 *     Edge, Firefox and Android, which have no HEIC support of their own.
 */
import type { Libheif } from 'libheif-js/libheif-wasm/libheif-bundle.mjs';
import { yieldToBrowser } from '../../lib/browser';
import {
  buildExifApp1,
  findExifTiff,
  isHeicBytes,
  insertExifIntoJpeg,
  readExifSummary,
  rewriteExifTiff,
  type ExifSummary,
} from './logic';

/** JPEG has no alpha channel; without a fill, transparent HEIC pixels encode as black. */
const JPEG_BACKGROUND = '#ffffff';

export type MetadataMode = 'no-gps' | 'keep' | 'strip';

export interface ConvertResult {
  blob: Blob;
  width: number;
  height: number;
  decoder: 'native' | 'wasm';
  /** What the source HEIC carried, whether or not it was kept. */
  exif: ExifSummary | null;
  /** True when EXIF was actually written into the JPG. */
  exifKept: boolean;
  /** True when the source contained an EXIF item, even if it could not be copied. */
  exifFound: boolean;
  /** True when EXIF was deliberately removed by the selected setting. */
  exifRemoved: boolean;
  /** True when GPS coordinates were present in the source and left out of the JPG. */
  gpsRemoved: boolean;
}

let libheif: Promise<Libheif> | null = null;

export type ConvertProgress =
  | { stage: 'reading' }
  | { stage: 'loading-decoder' }
  | { stage: 'decoding' }
  | { stage: 'encoding' }
  | { stage: 'metadata' };

export class NotHeicError extends Error {}
export class HeicDecodeError extends Error {}
export class JpegEncodeError extends Error {}

/** True once the WebAssembly decoder has been requested in this session. */
function decoderLoaded(): boolean {
  return libheif !== null;
}

function loadDecoder(): Promise<Libheif> {
  libheif ??= import('libheif-js/libheif-wasm/libheif-bundle.mjs')
    .then((m) => m.default())
    .catch((cause) => {
      // A transient chunk/network failure must not poison every later retry in
      // this tab with the same rejected promise.
      libheif = null;
      throw cause;
    });
  return libheif;
}

function newCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d');
  if (!context) throw new HeicDecodeError('Canvas rendering is unavailable.');
  return context;
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('HEIC conversion was cancelled.', 'AbortError');
}

async function drawNatively(file: File): Promise<HTMLCanvasElement | null> {
  let bitmap: ImageBitmap;
  try {
    // 'from-image' so a portrait photo is not left on its side if the browser's
    // default ever changes; the HEIC rotation properties are applied either way.
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return null; // no native HEIC support — fall back to WebAssembly
  }
  try {
    if (!bitmap.width || !bitmap.height) return null;
    const canvas = newCanvas(bitmap.width, bitmap.height);
    const ctx = context2d(canvas);
    ctx.fillStyle = JPEG_BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);
    return canvas;
  } finally {
    bitmap.close();
  }
}

async function drawWithWasm(bytes: Uint8Array, signal?: AbortSignal): Promise<HTMLCanvasElement> {
  const lib = await loadDecoder();
  throwIfAborted(signal);
  await yieldToBrowser();
  throwIfAborted(signal);
  const images = new lib.HeifDecoder().decode(bytes);
  if (images.length === 0) throw new HeicDecodeError('The HEIC decoder could not read this image.');
  // Bursts and depth-capture files hold several top-level images; the primary one
  // is the photo the user sees in their gallery.
  const image = images.find((i) => i.is_primary()) ?? images[0];
  try {
    const width = image.get_width();
    const height = image.get_height();
    if (!width || !height) throw new HeicDecodeError('The HEIC image has no pixels.');

    const canvas = newCanvas(width, height);
    const ctx = context2d(canvas);
    const pixels = ctx.createImageData(width, height);
    await yieldToBrowser();
    throwIfAborted(signal);
    await new Promise<void>((resolve, reject) => {
      image.display(pixels, (result) =>
        result ? resolve() : reject(new HeicDecodeError('The HEIC decoder could not produce pixels.')),
      );
    });
    throwIfAborted(signal);

    if (image.has_alpha_channel()) {
      // putImageData overwrites whatever is underneath, so the white background
      // has to be composited on a second canvas rather than painted first.
      const source = newCanvas(width, height);
      context2d(source).putImageData(pixels, 0, 0);
      ctx.fillStyle = JPEG_BACKGROUND;
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(source, 0, 0);
      source.width = source.height = 0;
    } else {
      ctx.putImageData(pixels, 0, 0);
    }
    return canvas;
  } finally {
    for (const i of images) i.free();
  }
}

function encodeJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new JpegEncodeError('JPEG encoding failed.'));
        if (blob.type.toLowerCase() !== 'image/jpeg') {
          return reject(
            new JpegEncodeError(`The browser returned ${blob.type || 'an unknown format'} instead of JPEG.`),
          );
        }
        resolve(blob);
      },
      'image/jpeg',
      quality,
    ),
  );
}

export interface ConvertOptions {
  /** 0–1, passed straight to the JPEG encoder. */
  quality: number;
  metadata: MetadataMode;
  signal?: AbortSignal;
  onProgress?: (progress: ConvertProgress) => void;
}

export async function convertHeicToJpeg(file: File, opts: ConvertOptions): Promise<ConvertResult> {
  throwIfAborted(opts.signal);
  opts.onProgress?.({ stage: 'reading' });
  await yieldToBrowser();
  const bytes = new Uint8Array(await file.arrayBuffer());
  throwIfAborted(opts.signal);
  // Extensions and MIME types are hints only. Without this check a renamed JPG
  // can take the native decode path and be silently returned as a new JPG.
  if (!isHeicBytes(bytes)) throw new NotHeicError('The file contents are not HEIC.');
  const tiff = findExifTiff(bytes);
  const exif = tiff ? readExifSummary(tiff) : null;

  opts.onProgress?.({ stage: 'decoding' });
  await yieldToBrowser();
  let canvas = await drawNatively(file);
  let decoder: ConvertResult['decoder'] = 'native';
  if (!canvas) {
    if (!decoderLoaded()) {
      opts.onProgress?.({ stage: 'loading-decoder' });
      await yieldToBrowser();
    }
    opts.onProgress?.({ stage: 'decoding' });
    try {
      canvas = await drawWithWasm(bytes, opts.signal);
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
      if (cause instanceof HeicDecodeError) throw cause;
      throw new HeicDecodeError(cause instanceof Error ? cause.message : 'HEIC decoding failed.');
    }
    decoder = 'wasm';
  }
  throwIfAborted(opts.signal);
  const { width, height } = canvas;

  let blob: Blob;
  try {
    opts.onProgress?.({ stage: 'encoding' });
    await yieldToBrowser();
    throwIfAborted(opts.signal);
    blob = await encodeJpeg(canvas, opts.quality);
    throwIfAborted(opts.signal);
  } finally {
    // Release the backing store even when the browser encoder fails.
    canvas.width = canvas.height = 1;
  }

  let exifKept = false;
  if (tiff && opts.metadata !== 'strip') {
    opts.onProgress?.({ stage: 'metadata' });
    await yieldToBrowser();
    throwIfAborted(opts.signal);
    const dropGps = opts.metadata === 'no-gps';
    const rewritten = rewriteExifTiff(tiff, { dropGps });
    const app1 = rewritten && buildExifApp1(rewritten);
    if (app1) {
      const withExif = insertExifIntoJpeg(new Uint8Array(await blob.arrayBuffer()), app1);
      blob = new Blob([withExif as BlobPart], { type: 'image/jpeg' });
      exifKept = true;
    }
  }

  return {
    blob,
    width,
    height,
    decoder,
    exif,
    exifKept,
    exifFound: Boolean(tiff),
    exifRemoved: Boolean(tiff) && opts.metadata === 'strip',
    gpsRemoved: Boolean(exif?.hasGps) && (opts.metadata !== 'keep' || !exifKept),
  };
}
