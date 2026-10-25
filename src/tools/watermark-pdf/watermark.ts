/** Browser-only PDF reading and watermark rendering. Loaded after a PDF is chosen. */
import {
  EncryptedPdfError,
  InvalidPdfError,
  PdfWatermarkCancelledError,
  watermarkPosition,
  type WatermarkOptions,
} from './logic';

export type WatermarkProgress = { current: number; total: number };

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new PdfWatermarkCancelledError();
}

function classifyPdfError(caught: unknown): Error {
  const message = caught instanceof Error ? `${caught.name} ${caught.message}` : String(caught);
  if (/encrypt|password/i.test(message)) return new EncryptedPdfError();
  return new InvalidPdfError();
}

async function blobToBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

async function canvasToPng(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Watermark image could not be created.');
  return blobToBytes(blob);
}

/** Canvas gives text a browser font fallback, so Korean, CJK, and emoji are preserved as an image layer. */
async function textPng(text: string): Promise<Uint8Array> {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable.');
  const fontSize = Math.max(36, Math.min(180, Math.floor(2600 / Math.max(1, text.length))));
  context.font = `700 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;
  const metrics = context.measureText(text);
  const padding = Math.ceil(fontSize * 0.2);
  canvas.width = Math.min(4096, Math.max(2, Math.ceil(metrics.width + padding * 2)));
  canvas.height = Math.ceil(fontSize * 1.5 + padding * 2);
  const draw = canvas.getContext('2d');
  if (!draw) throw new Error('Canvas is unavailable.');
  draw.font = `700 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;
  draw.textBaseline = 'middle';
  draw.lineJoin = 'round';
  draw.lineWidth = Math.max(2, Math.round(fontSize * 0.035));
  draw.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  draw.fillStyle = 'rgba(0, 0, 0, 1)';
  const y = canvas.height / 2;
  draw.strokeText(text, padding, y);
  draw.fillText(text, padding, y);
  return canvasToPng(canvas);
}

async function imagePng(file: File): Promise<Uint8Array> {
  if (file.type === 'image/png' || file.type === 'image/jpeg') return new Uint8Array(await file.arrayBuffer());
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable.');
    context.drawImage(bitmap, 0, 0);
    return canvasToPng(canvas);
  } finally {
    bitmap.close();
  }
}

export async function inspectPdf(file: File, signal?: AbortSignal): Promise<number> {
  throwIfAborted(signal);
  const bytes = new Uint8Array(await file.arrayBuffer());
  throwIfAborted(signal);
  const { PDFDocument } = await import('pdf-lib');
  try {
    const document = await PDFDocument.load(bytes);
    return document.getPageCount();
  } catch (caught) {
    throw classifyPdfError(caught);
  }
}

export interface ApplyWatermarkOptions {
  image?: File | null;
  signal?: AbortSignal;
  onProgress?: (progress: WatermarkProgress) => void;
}

export async function applyWatermark(
  source: File,
  options: WatermarkOptions,
  pageIndexes: number[],
  applyOptions: ApplyWatermarkOptions = {},
): Promise<Uint8Array> {
  const { image, signal, onProgress } = applyOptions;
  throwIfAborted(signal);
  const bytes = new Uint8Array(await source.arrayBuffer());
  throwIfAborted(signal);
  const { PDFDocument, degrees } = await import('pdf-lib');
  let document;
  try {
    document = await PDFDocument.load(bytes);
  } catch (caught) {
    throw classifyPdfError(caught);
  }
  throwIfAborted(signal);
  const markBytes = options.mode === 'image' && image ? await imagePng(image) : await textPng(options.text);
  throwIfAborted(signal);
  const mark =
    markBytes[0] === 0x89 && markBytes[1] === 0x50
      ? await document.embedPng(markBytes)
      : await document.embedJpg(markBytes);
  const aspect = mark.height / mark.width;
  const pages = document.getPages();

  for (const [current, pageIndex] of pageIndexes.entries()) {
    throwIfAborted(signal);
    const page = pages[pageIndex];
    if (!page) continue;
    const { width: pageWidth, height: pageHeight } = page.getSize();
    const markWidth = Math.max(1, pageWidth * (options.size / 100));
    const markHeight = Math.max(1, markWidth * aspect);
    const opacity = options.opacity / 100;
    if (options.layout === 'tile') {
      const stepX = Math.max(markWidth * 1.55, 24);
      const stepY = Math.max(markHeight * 2.2, 24);
      let draws = 0;
      for (let y = -markHeight; y < pageHeight + markHeight && draws < 500; y += stepY) {
        for (let x = -markWidth; x < pageWidth + markWidth && draws < 500; x += stepX) {
          page.drawImage(mark, {
            x,
            y,
            width: markWidth,
            height: markHeight,
            opacity,
            rotate: degrees(options.rotation),
          });
          draws++;
        }
      }
    } else {
      const point = watermarkPosition(pageWidth, pageHeight, markWidth, markHeight, options.position);
      page.drawImage(mark, {
        x: point.x,
        y: point.y,
        width: markWidth,
        height: markHeight,
        opacity,
        rotate: degrees(options.rotation),
      });
    }
    onProgress?.({ current: current + 1, total: pageIndexes.length });
    await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
  }
  throwIfAborted(signal);
  return document.save();
}
