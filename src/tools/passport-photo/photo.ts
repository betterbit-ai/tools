/** Browser-only canvas work for the passport-photo tool. */
import { withJfifDensity, type Crop, type PrintLayout } from './logic';

export async function readDimensions(file: File): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const dimensions = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return dimensions;
}

export async function renderPhoto(file: File, crop: Crop, width: number, height: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = makeCanvas(width, height);
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
    return toJpeg(canvas);
  } finally {
    bitmap.close();
  }
}

export async function renderPrintSheet(
  file: File,
  crop: Crop,
  photoWidth: number,
  photoHeight: number,
  layout: PrintLayout,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = makeCanvas(1200, 1800);
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingQuality = 'high';
    for (let row = 0; row < layout.rows; row++) {
      for (let col = 0; col < layout.cols; col++) {
        const x = layout.x + col * (photoWidth + layout.gap);
        const y = layout.y + row * (photoHeight + layout.gap);
        context.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, x, y, photoWidth, photoHeight);
      }
    }
    return toJpeg(canvas);
  } finally {
    bitmap.close();
  }
}

function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

async function toJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((value) => (value ? resolve(value) : reject(new Error('encode failed'))), 'image/jpeg', 0.96),
  );
  const bytes = withJfifDensity(new Uint8Array(await blob.arrayBuffer()));
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'image/jpeg' });
}
