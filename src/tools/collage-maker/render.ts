/** Browser-only canvas work for the collage maker. */
import { layoutCells, outputDimensions, safeGap, type AspectId, type FormatChoice, type LayoutId } from './logic';

export interface RenderOptions {
  layout: LayoutId;
  aspect: AspectId;
  longSide: number;
  gap: number;
  format: FormatChoice;
  quality: number;
}

export async function renderCollage(files: File[], options: RenderOptions): Promise<Blob> {
  const { width, height } = outputDimensions(options.aspect, options.longSide);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable');

  // JPEG needs an opaque background; white is also a predictable print-ready gap.
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);

  const cells = layoutCells(options.layout, files.length);
  const gap = safeGap(options.gap, width, height);
  const bitmaps = await Promise.all(files.slice(0, cells.length).map((file) => createImageBitmap(file)));
  try {
    for (let index = 0; index < bitmaps.length; index++) {
      const cell = cells[index];
      const x = Math.round(cell.x * width) + gap / 2;
      const y = Math.round(cell.y * height) + gap / 2;
      const cellWidth = Math.max(1, Math.round(cell.width * width) - gap);
      const cellHeight = Math.max(1, Math.round(cell.height * height) - gap);
      drawCover(context, bitmaps[index], x, y, cellWidth, cellHeight);
    }
    return await toBlob(canvas, options.format, options.quality);
  } finally {
    bitmaps.forEach((bitmap) => bitmap.close());
  }
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: ImageBitmap,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const sourceRatio = image.width / image.height;
  const targetRatio = width / height;
  const sourceWidth = sourceRatio > targetRatio ? image.height * targetRatio : image.width;
  const sourceHeight = sourceRatio > targetRatio ? image.height : image.width / targetRatio;
  const sourceX = (image.width - sourceWidth) / 2;
  const sourceY = (image.height - sourceHeight) / 2;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function toBlob(canvas: HTMLCanvasElement, format: FormatChoice, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Image encoding failed'))), format, quality),
  );
}
