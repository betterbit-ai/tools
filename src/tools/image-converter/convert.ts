/**
 * Browser-only pixel work: decode the source with the browser's own image
 * engine and re-encode it as the target format. Pure naming/format decisions
 * live in logic.ts.
 */
import type { FormatChoice } from './logic';
import { yieldToBrowser } from '../../lib/browser';
import { matchesOutputMime } from './logic';

export interface ImageInfo {
  width: number;
  height: number;
  thumbnail: Blob;
}

const THUMBNAIL_EDGE = 112;

/** Decode once and make a small preview so the file list does not retain full-size decoded images. */
export async function inspectImage(file: File): Promise<ImageInfo> {
  const bmp = await createImageBitmap(file);
  try {
    const scale = Math.min(1, THUMBNAIL_EDGE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bmp.width * scale));
    canvas.height = Math.max(1, Math.round(bmp.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas unavailable');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const thumbnail = await toBlob(canvas, 'image/png');
    return { width: bmp.width, height: bmp.height, thumbnail };
  } finally {
    bmp.close();
  }
}

export async function convertImage(file: File, mime: FormatChoice, quality: number, background: string): Promise<Blob> {
  await yieldToBrowser();
  const bmp = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas unavailable');
    if (mime === 'image/jpeg') {
      // JPEG has no alpha channel: transparent pixels would otherwise turn black.
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bmp, 0, 0);
    await yieldToBrowser();
    const result = await toBlob(canvas, mime, quality);
    if (!matchesOutputMime(mime, result.type)) throw new Error('requested encoder unavailable');
    return result;
  } finally {
    bmp.close();
  }
}

function toBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('encode failed'))), mime, quality),
  );
}
