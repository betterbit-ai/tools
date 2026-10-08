/**
 * Browser-only pixel work: decode the source with the browser's own image
 * engine and re-encode it as the target format. Pure naming/format decisions
 * live in logic.ts.
 */
import type { FormatChoice } from './logic';

export async function readDimensions(file: File): Promise<{ width: number; height: number }> {
  const bmp = await createImageBitmap(file);
  const dims = { width: bmp.width, height: bmp.height };
  bmp.close();
  return dims;
}

export async function convertImage(file: File, mime: FormatChoice, quality: number, background: string): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    const ctx = canvas.getContext('2d')!;
    if (mime === 'image/jpeg') {
      // JPEG has no alpha channel: transparent pixels would otherwise turn black.
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bmp, 0, 0);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), mime, quality),
    );
  } finally {
    bmp.close();
  }
}
