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
import {
  buildExifApp1,
  findExifTiff,
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
  /** True when GPS coordinates were present in the source and left out of the JPG. */
  gpsRemoved: boolean;
}

let libheif: Promise<Libheif> | null = null;

/** True once the WebAssembly decoder has been requested in this session. */
function decoderLoaded(): boolean {
  return libheif !== null;
}

function loadDecoder(): Promise<Libheif> {
  libheif ??= import('libheif-js/libheif-wasm/libheif-bundle.mjs').then((m) => m.default());
  return libheif;
}

function newCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
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
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = JPEG_BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);
    return canvas;
  } finally {
    bitmap.close();
  }
}

async function drawWithWasm(bytes: Uint8Array): Promise<HTMLCanvasElement> {
  const lib = await loadDecoder();
  const images = new lib.HeifDecoder().decode(bytes);
  if (images.length === 0) throw new Error('not a decodable HEIC image');
  // Bursts and depth-capture files hold several top-level images; the primary one
  // is the photo the user sees in their gallery.
  const image = images.find((i) => i.is_primary()) ?? images[0];
  try {
    const width = image.get_width();
    const height = image.get_height();
    if (!width || !height) throw new Error('HEIC image has no pixels');

    const canvas = newCanvas(width, height);
    const ctx = canvas.getContext('2d')!;
    const pixels = ctx.createImageData(width, height);
    await new Promise<void>((resolve, reject) => {
      image.display(pixels, (result) => (result ? resolve() : reject(new Error('HEIC decoding failed'))));
    });

    if (image.has_alpha_channel()) {
      // putImageData overwrites whatever is underneath, so the white background
      // has to be composited on a second canvas rather than painted first.
      const source = newCanvas(width, height);
      source.getContext('2d')!.putImageData(pixels, 0, 0);
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
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('JPEG encoding failed'))), 'image/jpeg', quality),
  );
}

export interface ConvertOptions {
  /** 0–1, passed straight to the JPEG encoder. */
  quality: number;
  metadata: MetadataMode;
  /** Called before the WebAssembly decoder is downloaded, so the UI can explain the wait. */
  onDecoderLoad?: () => void;
}

export async function convertHeicToJpeg(file: File, opts: ConvertOptions): Promise<ConvertResult> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const tiff = findExifTiff(bytes);
  const exif = tiff ? readExifSummary(tiff) : null;

  let canvas = await drawNatively(file);
  let decoder: ConvertResult['decoder'] = 'native';
  if (!canvas) {
    if (!decoderLoaded()) opts.onDecoderLoad?.();
    canvas = await drawWithWasm(bytes);
    decoder = 'wasm';
  }
  const { width, height } = canvas;

  let blob = await encodeJpeg(canvas, opts.quality);
  canvas.width = canvas.height = 0; // release the backing store early for large batches

  let exifKept = false;
  if (tiff && opts.metadata !== 'strip') {
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
    gpsRemoved: Boolean(exif?.hasGps) && (opts.metadata !== 'keep' || !exifKept),
  };
}
