import type { Effect, OutputFormat, Region } from './logic';

export interface LoadedImage {
  bitmap: ImageBitmap;
  width: number;
  height: number;
}

export async function loadImage(file: File): Promise<LoadedImage> {
  const bitmap = await createImageBitmap(file);
  return { bitmap, width: bitmap.width, height: bitmap.height };
}

/** Renders at the image's native dimensions; the preview is only visually scaled by CSS. */
export async function renderImage(
  image: LoadedImage,
  regions: Region[],
  effect: Effect,
  strength: number,
  format: OutputFormat,
  quality: number,
): Promise<Blob> {
  const canvas = makeCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas-unavailable');

  if (format === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, image.width, image.height);
  }
  ctx.drawImage(image.bitmap, 0, 0);

  for (const region of regions) {
    const x = Math.round(region.x * image.width);
    const y = Math.round(region.y * image.height);
    const width = Math.max(1, Math.round(region.width * image.width));
    const height = Math.max(1, Math.round(region.height * image.height));
    if (effect === 'blur') blurRegion(ctx, image.bitmap, x, y, width, height, strength);
    else pixelateRegion(ctx, image.bitmap, x, y, width, height, strength);
  }

  return toBlob(canvas, format, quality);
}

function blurRegion(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function pixelateRegion(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  x: number,
  y: number,
  width: number,
  height: number,
  blockSize: number,
) {
  const small = makeCanvas(Math.max(1, Math.ceil(width / blockSize)), Math.max(1, Math.ceil(height / blockSize)));
  const smallCtx = small.getContext('2d');
  if (!smallCtx) return;
  smallCtx.imageSmoothingEnabled = true;
  smallCtx.drawImage(source, x, y, width, height, 0, 0, small.width, small.height);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(small, 0, 0, small.width, small.height, x, y, width, height);
  ctx.restore();
}

function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function toBlob(canvas: HTMLCanvasElement, format: OutputFormat, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('encode-failed'))), format, quality),
  );
}
