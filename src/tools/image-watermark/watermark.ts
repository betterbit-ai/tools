/** Browser-only canvas rendering for image-watermark. */
import {
  anchorPoint,
  isAnimatedGif,
  isAnimatedWebp,
  normalizeOptions,
  outputMime,
  tileOrigins,
  type WatermarkOptions,
} from './logic';

export async function readDimensions(file: File): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  try {
    return { width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
}

/** Canvas outputs a still image, so animated sources must not be flattened without warning. */
export async function isAnimatedImage(file: File): Promise<boolean> {
  const type = file.type.toLowerCase();
  if (type !== 'image/gif' && type !== 'image/webp') return false;
  const bytes = new Uint8Array(await file.arrayBuffer());
  return type === 'image/gif' ? isAnimatedGif(bytes) : isAnimatedWebp(bytes);
}

export async function watermarkImage(file: File, options: WatermarkOptions, logo?: File): Promise<Blob> {
  const source = await createImageBitmap(file);
  let logoBitmap: ImageBitmap | undefined;
  try {
    if (options.mode === 'logo') {
      if (!logo) throw new Error('Logo is required');
      logoBitmap = await createImageBitmap(logo);
    }
    const canvas = makeCanvas(source.width, source.height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable');
    const mime = outputMime(options.format, file.type);
    if (mime === 'image/jpeg') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(source, 0, 0);
    drawWatermark(context, canvas.width, canvas.height, options, logoBitmap);
    return await toBlob(canvas, mime, mime === 'image/png' ? undefined : 0.92);
  } finally {
    source.close();
    logoBitmap?.close();
  }
}

function drawWatermark(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  rawOptions: WatermarkOptions,
  logo?: ImageBitmap,
): void {
  const options = normalizeOptions(rawOptions);
  const targetWidth = width * (options.size / 100);
  const mark = createMark(options, targetWidth, logo);
  const padding = Math.min(width, height) * 0.04;
  const gap = width * (options.gap / 100);
  const points =
    options.layout === 'tile'
      ? tileOrigins(width, height, mark.width, mark.height, gap)
      : [anchorPoint(width, height, mark.width, mark.height, options.position, padding)];
  context.save();
  context.globalAlpha = options.opacity / 100;
  for (const point of points) {
    context.save();
    context.translate(point.x + mark.width / 2, point.y + mark.height / 2);
    context.rotate((options.rotation * Math.PI) / 180);
    context.drawImage(mark, -mark.width / 2, -mark.height / 2);
    context.restore();
  }
  context.restore();
}

function createMark(
  options: WatermarkOptions,
  targetWidth: number,
  logo?: ImageBitmap,
): HTMLCanvasElement | ImageBitmap {
  if (options.mode === 'logo' && logo) {
    const width = Math.max(1, Math.round(targetWidth));
    const height = Math.max(1, Math.round((logo.height / logo.width) * width));
    const canvas = makeCanvas(width, height);
    canvas.getContext('2d')!.drawImage(logo, 0, 0, width, height);
    return canvas;
  }
  const measureCanvas = makeCanvas(1, 1);
  const measure = measureCanvas.getContext('2d')!;
  const text = options.text || '©';
  let fontSize = Math.max(12, Math.round(targetWidth / 7));
  measure.font = `700 ${fontSize}px system-ui, sans-serif`;
  const measuredWidth = Math.max(1, measure.measureText(text).width);
  fontSize = Math.max(12, Math.round((fontSize * targetWidth) / measuredWidth));
  measure.font = `700 ${fontSize}px system-ui, sans-serif`;
  const metrics = measure.measureText(text);
  const padding = Math.max(4, Math.round(fontSize * 0.12));
  const width = Math.ceil(metrics.width + padding * 2);
  const height = Math.ceil(fontSize * 1.3 + padding * 2);
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(1, fontSize / 18);
  ctx.strokeStyle = options.color === 'light' ? '#111111' : '#ffffff';
  ctx.fillStyle = options.color === 'light' ? '#ffffff' : '#111111';
  ctx.strokeText(text, padding, height / 2);
  ctx.fillText(text, padding, height / 2);
  return canvas;
}

function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function toBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Unable to encode image'))), mime, quality),
  );
}
