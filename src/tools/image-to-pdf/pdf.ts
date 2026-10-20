import { yieldToBrowser } from '../../lib/browser';
import { buildPdf, fitImageWithinLimits, type PdfPageInput } from './logic';

/**
 * Browser-only pixel work: decode a source image and re-encode it as JPEG bytes
 * suitable for embedding in a PDF (/DCTDecode). Transparency is flattened to white.
 */

export type EncodeStage = 'decoding' | 'drawing' | 'encoding';

interface EncodeOptions {
  signal?: AbortSignal;
  onProgress?: (stage: EncodeStage) => void;
}

export class ImageDecodeError extends Error {}
export class ImageEncodeError extends Error {}
export class ConversionCancelledError extends Error {}

function throwIfCancelled(signal?: AbortSignal): void {
  if (signal?.aborted) throw new ConversionCancelledError('Image conversion was cancelled.');
}

export async function encodeToJpeg(
  file: File,
  quality: number,
  options: EncodeOptions = {},
): Promise<{
  bytes: Uint8Array;
  sourceWidth: number;
  sourceHeight: number;
  width: number;
  height: number;
}> {
  const { signal, onProgress } = options;
  onProgress?.('decoding');
  await yieldToBrowser();
  throwIfCancelled(signal);

  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    throw new ImageDecodeError('The source image could not be decoded.');
  }

  let canvas: HTMLCanvasElement | undefined;
  try {
    throwIfCancelled(signal);
    const fitted = fitImageWithinLimits(bmp.width, bmp.height);
    onProgress?.('drawing');
    await yieldToBrowser();
    throwIfCancelled(signal);

    canvas = document.createElement('canvas');
    canvas.width = fitted.width;
    canvas.height = fitted.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new ImageEncodeError('A 2D canvas is not available.');
    // JPEG has no alpha channel: flatten transparent sources onto white first.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);

    onProgress?.('encoding');
    await yieldToBrowser();
    throwIfCancelled(signal);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas!.toBlob(
        (result) => (result ? resolve(result) : reject(new ImageEncodeError('JPEG encoding failed.'))),
        'image/jpeg',
        quality,
      ),
    );
    throwIfCancelled(signal);
    if (blob.type !== 'image/jpeg') {
      throw new ImageEncodeError(`The browser returned ${blob.type || 'an unknown format'} instead of JPEG.`);
    }
    const bytes = new Uint8Array(await blob.arrayBuffer());
    throwIfCancelled(signal);
    if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes.at(-2) !== 0xff || bytes.at(-1) !== 0xd9) {
      throw new ImageEncodeError('The browser returned invalid JPEG bytes.');
    }
    return {
      bytes,
      sourceWidth: bmp.width,
      sourceHeight: bmp.height,
      width: fitted.width,
      height: fitted.height,
    };
  } finally {
    bmp.close();
    if (canvas) {
      canvas.width = 1;
      canvas.height = 1;
    }
  }
}

interface BuildOptions {
  signal?: AbortSignal;
}

/** Build large PDFs away from the interaction thread when the browser supports module workers. */
export async function buildPdfOffMainThread(pages: PdfPageInput[], { signal }: BuildOptions = {}): Promise<Uint8Array> {
  throwIfCancelled(signal);
  if (typeof Worker === 'undefined') {
    await yieldToBrowser();
    throwIfCancelled(signal);
    return buildPdf(pages);
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./pdf-worker.ts', import.meta.url), { type: 'module' });
    const cleanUp = () => {
      signal?.removeEventListener('abort', cancel);
      worker.terminate();
    };
    const cancel = () => {
      cleanUp();
      reject(new ConversionCancelledError('PDF assembly was cancelled.'));
    };

    worker.onmessage = (event: MessageEvent<{ bytes?: ArrayBuffer; error?: string }>) => {
      cleanUp();
      if (event.data.bytes) resolve(new Uint8Array(event.data.bytes));
      else reject(new Error(event.data.error ?? 'PDF assembly failed.'));
    };
    worker.onerror = () => {
      cleanUp();
      reject(new Error('PDF assembly failed.'));
    };
    signal?.addEventListener('abort', cancel, { once: true });
    worker.postMessage({ pages });
  });
}
