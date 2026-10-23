/** Browser-only image decoding and exact-pixel sampling for color-picker. */
import { extractPalette, type PaletteColor, type RgbColor } from './logic';

const PALETTE_MAX_SIDE = 256;

export interface LoadedImage {
  bitmap: ImageBitmap;
  url: string;
  width: number;
  height: number;
  name: string;
}

export class ImageLoadError extends Error {}

export async function loadImage(file: File): Promise<LoadedImage> {
  try {
    const bitmap = await createImageBitmap(file);
    return { bitmap, url: URL.createObjectURL(file), width: bitmap.width, height: bitmap.height, name: file.name };
  } catch {
    throw new ImageLoadError();
  }
}

/** Releases the decoded image and object URL as soon as a replacement is loaded. */
export function releaseImage(image: LoadedImage | null): void {
  if (!image) return;
  image.bitmap.close();
  URL.revokeObjectURL(image.url);
}

/** Samples one original image pixel, even when the preview is displayed smaller. */
export function samplePixel(image: LoadedImage, x: number, y: number): RgbColor {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new ImageLoadError();
  context.imageSmoothingEnabled = false;
  context.drawImage(
    image.bitmap,
    Math.max(0, Math.min(image.width - 1, Math.round(x))),
    Math.max(0, Math.min(image.height - 1, Math.round(y))),
    1,
    1,
    0,
    0,
    1,
    1,
  );
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  canvas.width = 1;
  return { r, g, b };
}

/** Reads a compact canvas for quick, deterministic dominant-color analysis. */
export function imagePalette(image: LoadedImage, count: number): PaletteColor[] {
  const scale = Math.min(1, PALETTE_MAX_SIDE / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new ImageLoadError();
  context.imageSmoothingQuality = 'high';
  context.drawImage(image.bitmap, 0, 0, width, height);
  const palette = extractPalette(context.getImageData(0, 0, width, height).data, count);
  canvas.width = 1;
  return palette;
}
