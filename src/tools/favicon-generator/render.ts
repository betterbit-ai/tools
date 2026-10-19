/** Browser-only favicon rendering and packaging. */
import { zipSync } from 'fflate';
import { yieldToBrowser } from '../../lib/browser';
import {
  boundedBitmapSize,
  buildIco,
  FAVICON_FILES,
  ICO_SIZES,
  imageDimensions,
  manifestJson,
  monogram,
} from './logic';

export type ImageFit = 'contain' | 'cover';

export interface FaviconSettings {
  source: 'text' | 'image';
  text: string;
  background: string;
  foreground: string;
  transparent: boolean;
  fit: ImageFit;
  padding: number;
  siteName: string;
}

export interface RenderedFavicon {
  pngs: Record<string, Blob>;
  ico: Blob;
}

export interface RenderControl {
  signal?: AbortSignal;
  onProgress?: (current: number, total: number) => void;
}

let renderQueue: Promise<void> = Promise.resolve();

export async function renderFavicons(
  file: File | null,
  settings: FaviconSettings,
  control: RenderControl = {},
): Promise<RenderedFavicon> {
  const releaseTurn = await takeRenderTurn();
  let bitmap: ImageBitmap | null = null;
  try {
    throwIfAborted(control.signal);
    if (settings.source === 'image') {
      if (!file) throw new Error('missing image');
      const bytes = new Uint8Array(await file.arrayBuffer());
      throwIfAborted(control.signal);
      const dimensions = imageDimensions(bytes);
      if (!dimensions) throw new Error('unsupported image header');
      const working = boundedBitmapSize(dimensions.width, dimensions.height);
      bitmap = await createImageBitmap(file, {
        resizeWidth: working.width,
        resizeHeight: working.height,
        resizeQuality: 'high',
      });
      throwIfAborted(control.signal);
    }

    const pngs: Record<string, Blob> = {};
    const icoImages: Uint8Array[] = [];
    for (let index = 0; index < FAVICON_FILES.length; index++) {
      const fileSpec = FAVICON_FILES[index];
      control.onProgress?.(index + 1, FAVICON_FILES.length);
      await yieldToBrowser();
      throwIfAborted(control.signal);
      const canvas = drawIcon(fileSpec.size, bitmap, settings);
      try {
        const png = await canvasToPng(canvas, control.signal);
        throwIfAborted(control.signal);
        pngs[fileSpec.name] = png;
        if ((ICO_SIZES as readonly number[]).includes(fileSpec.size)) {
          icoImages.push(new Uint8Array(await png.arrayBuffer()));
          throwIfAborted(control.signal);
        }
      } finally {
        canvas.width = 1;
        canvas.height = 1;
      }
    }
    const ico = buildIco(ICO_SIZES, icoImages);
    return { pngs, ico: new Blob([ico as unknown as BlobPart], { type: 'image/x-icon' }) };
  } finally {
    bitmap?.close();
    releaseTurn();
  }
}

export async function packageZip(
  rendered: RenderedFavicon,
  site: string,
  control: Pick<RenderControl, 'signal'> = {},
): Promise<Blob> {
  throwIfAborted(control.signal);
  const files: Record<string, Uint8Array> = {
    'favicon.ico': new Uint8Array(await rendered.ico.arrayBuffer()),
    'site.webmanifest': new TextEncoder().encode(manifestJson(site)),
  };
  for (const [name, blob] of Object.entries(rendered.pngs)) {
    await yieldToBrowser();
    throwIfAborted(control.signal);
    files[name] = new Uint8Array(await blob.arrayBuffer());
  }
  await yieldToBrowser();
  throwIfAborted(control.signal);
  return new Blob([zipSync(files, { level: 0 }) as BlobPart], { type: 'application/zip' });
}

async function takeRenderTurn(): Promise<() => void> {
  const previous = renderQueue;
  let release = () => {};
  renderQueue = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  return release;
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('Favicon rendering was cancelled', 'AbortError');
}

function drawIcon(size: number, bitmap: ImageBitmap | null, settings: FaviconSettings): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvas unavailable');
  context.imageSmoothingQuality = 'high';

  if (!settings.transparent) {
    context.fillStyle = settings.background;
    context.fillRect(0, 0, size, size);
  }

  if (bitmap) drawBitmap(context, bitmap, size, settings);
  else drawText(context, size, settings);
  return canvas;
}

function drawText(context: CanvasRenderingContext2D, size: number, settings: FaviconSettings): void {
  const value = monogram(settings.text);
  context.fillStyle = settings.foreground;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = `700 ${Math.round(size * (value.length > 1 ? 0.58 : 0.68))}px system-ui, sans-serif`;
  context.fillText(value, size / 2, size / 2 + size * 0.025, size * 0.9);
}

function drawBitmap(
  context: CanvasRenderingContext2D,
  bitmap: ImageBitmap,
  size: number,
  settings: Pick<FaviconSettings, 'fit' | 'padding'>,
): void {
  const padding = Math.min(40, Math.max(0, settings.padding)) / 100;
  const inner = size * (1 - padding * 2);
  const scale =
    settings.fit === 'cover'
      ? Math.max(inner / bitmap.width, inner / bitmap.height)
      : Math.min(inner / bitmap.width, inner / bitmap.height);
  const width = bitmap.width * scale;
  const height = bitmap.height * scale;
  context.save();
  context.beginPath();
  context.rect(size * padding, size * padding, inner, inner);
  context.clip();
  context.drawImage(bitmap, (size - width) / 2, (size - height) / 2, width, height);
  context.restore();
}

function canvasToPng(canvas: HTMLCanvasElement, signal?: AbortSignal): Promise<Blob> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', onAbort);
      callback();
    };
    const onAbort = () => finish(() => reject(new DOMException('Favicon rendering was cancelled', 'AbortError')));

    if (signal?.aborted) return onAbort();
    signal?.addEventListener('abort', onAbort, { once: true });
    canvas.toBlob(
      (blob) =>
        finish(() => {
          if (!blob || blob.type !== 'image/png') reject(new Error('PNG encoding failed'));
          else resolve(blob);
        }),
      'image/png',
    );
  });
}
