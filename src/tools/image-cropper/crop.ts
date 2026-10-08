/** Browser-only pixel work: draw the cropped region, optionally masked to a circle. */
import type { CropRect, ShapeKind } from './logic';

export async function readDimensions(file: File): Promise<{ width: number; height: number }> {
  const bmp = await createImageBitmap(file);
  const dims = { width: bmp.width, height: bmp.height };
  bmp.close();
  return dims;
}

export async function cropImage(
  file: File,
  rect: CropRect,
  shape: ShapeKind,
  mime: string,
  quality: number,
): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(rect.w));
    canvas.height = Math.max(1, Math.round(rect.h));
    const ctx = canvas.getContext('2d')!;

    if (mime === 'image/jpeg') {
      // JPEG has no alpha: fill white first so a circle crop doesn't turn black outside the mask.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (shape === 'circle') {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2, 0, 0, Math.PI * 2);
      ctx.clip();
    }

    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bmp, rect.x, rect.y, rect.w, rect.h, 0, 0, canvas.width, canvas.height);

    if (shape === 'circle') ctx.restore();

    return await toBlob(canvas, mime, quality);
  } finally {
    bmp.close();
  }
}

function toBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), mime, quality),
  );
}
