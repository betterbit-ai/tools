/** Browser-only image decode, EXIF-aware draw, and canvas encoding. */
import type { TransformOptions } from './logic';

export async function readDimensions(file: File): Promise<{ width: number; height: number }> {
  // `from-image` applies a phone photo's EXIF orientation before we export it.
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    return { width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
}

export async function rotateImage(
  file: File,
  opts: TransformOptions,
  mime: string,
  quality: number,
): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const quarterTurn = opts.rotation === 90 || opts.rotation === 270;
    const width = quarterTurn ? bitmap.height : bitmap.width;
    const height = quarterTurn ? bitmap.width : bitmap.height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas unavailable');

    if (mime === 'image/jpeg') {
      // JPEG has no alpha channel; avoid transparent pixels turning black.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.translate(width / 2, height / 2);
    ctx.rotate((opts.rotation * Math.PI) / 180);
    ctx.scale(opts.flipHorizontal ? -1 : 1, opts.flipVertical ? -1 : 1);
    ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);

    return { blob: await toBlob(canvas, mime, quality), width, height };
  } finally {
    bitmap.close();
  }
}

function toBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('encode failed'))), mime, quality),
  );
}
