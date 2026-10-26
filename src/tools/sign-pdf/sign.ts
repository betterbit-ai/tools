/** Browser-only PDF preview rendering and off-main-thread signing. */
import { yieldToBrowser } from '../../lib/browser';
import {
  EncryptedPdfError,
  InvalidPdfError,
  PdfSigningCancelledError,
  TYPED_SIGNATURE_FONT,
  type PdfRect,
  type Stroke,
} from './logic';
import type { PdfInfo } from './sign-core';

export type SignProgress = 'preparing' | 'signing' | 'finishing';

type SignWorkerRequest =
  | { type: 'inspect'; bytes: ArrayBuffer; fileName: string }
  | {
      type: 'sign';
      bytes: ArrayBuffer;
      fileName: string;
      pngBytes: ArrayBuffer;
      pageIndex: number;
      rect: PdfRect;
    };

type SignWorkerResponse =
  | { type: 'info'; pageCount: number; pageSizes: { width: number; height: number }[] }
  | { type: 'signed'; bytes: ArrayBuffer }
  | { type: 'error'; error: 'encrypted' | 'invalid' | 'failed' };

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new PdfSigningCancelledError();
}

function workerFailure(error: 'encrypted' | 'invalid' | 'failed', fileName: string): Error {
  if (error === 'encrypted') return new EncryptedPdfError(fileName);
  if (error === 'invalid') return new InvalidPdfError(fileName);
  return new Error('PDF signing failed.');
}

function runWorker(
  request: SignWorkerRequest,
  transfer: Transferable[],
  fileName: string,
  signal?: AbortSignal,
): Promise<SignWorkerResponse> {
  throwIfAborted(signal);
  if (typeof Worker === 'undefined') return Promise.reject(new Error('A background PDF worker is unavailable.'));

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./sign.worker.ts', import.meta.url), { type: 'module' });
    const cleanUp = () => {
      worker.terminate();
      signal?.removeEventListener('abort', onAbort);
    };
    const onAbort = () => {
      cleanUp();
      reject(new PdfSigningCancelledError());
    };
    worker.onmessage = (event: MessageEvent<SignWorkerResponse>) => {
      cleanUp();
      if (event.data.type === 'error') reject(workerFailure(event.data.error, fileName));
      else resolve(event.data);
    };
    worker.onerror = () => {
      cleanUp();
      reject(new Error('The background PDF worker failed.'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    worker.postMessage(request, transfer);
  });
}

/** Parses a PDF away from the interaction thread and reports its page sizes. */
export async function readPdfInfo(bytes: Uint8Array, fileName: string, signal?: AbortSignal): Promise<PdfInfo> {
  throwIfAborted(signal);
  const buffer =
    bytes.buffer instanceof ArrayBuffer && bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength
      ? bytes.buffer
      : (bytes.slice().buffer as ArrayBuffer);
  const response = await runWorker({ type: 'inspect', bytes: buffer, fileName }, [buffer], fileName, signal);
  if (response.type !== 'info') throw new InvalidPdfError(fileName);
  return response;
}

export interface RenderedPreview {
  canvas: HTMLCanvasElement;
  pageSize: { width: number; height: number };
}

/** Renders one page (0-based index) at bounded resolution for the live placement preview. */
export async function renderPagePreview(
  file: File,
  pageIndex: number,
  maxWidthPx: number,
  signal?: AbortSignal,
): Promise<RenderedPreview> {
  throwIfAborted(signal);
  const bytes = new Uint8Array(await file.arrayBuffer());
  throwIfAborted(signal);
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  throwIfAborted(signal);
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();
  const loadingTask = pdfjs.getDocument({ data: bytes });
  const cancelLoading = () => void loadingTask.destroy();
  signal?.addEventListener('abort', cancelLoading, { once: true });
  try {
    const pdf = await loadingTask.promise;
    throwIfAborted(signal);
    const page = await pdf.getPage(pageIndex + 1);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(2, maxWidthPx / base.width);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(viewport.width));
    canvas.height = Math.max(1, Math.round(viewport.height));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    const renderTask = page.render({ canvas, viewport });
    renderTask.onContinue = (continueRendering: () => void) => {
      void yieldToBrowser().then(() => {
        if (!signal?.aborted) continueRendering();
      });
    };
    const cancelRender = () => renderTask.cancel();
    signal?.addEventListener('abort', cancelRender, { once: true });
    try {
      await renderTask.promise;
    } catch (caught) {
      if (signal?.aborted) throw new PdfSigningCancelledError();
      throw caught;
    } finally {
      signal?.removeEventListener('abort', cancelRender);
    }
    throwIfAborted(signal);
    page.cleanup();
    return { canvas, pageSize: { width: base.width, height: base.height } };
  } catch (caught) {
    if (signal?.aborted) throw new PdfSigningCancelledError();
    throw caught;
  } finally {
    signal?.removeEventListener('abort', cancelLoading);
    await loadingTask.destroy();
  }
}

/** Draws freehand strokes as dark ink on a transparent canvas. */
export function drawStrokes(canvas: HTMLCanvasElement, strokes: Stroke[], color: string): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, canvas.width * 0.01);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const stroke of strokes) {
    if (stroke.length < 2) continue;
    ctx.beginPath();
    ctx.moveTo(stroke[0].x, stroke[0].y);
    for (const point of stroke.slice(1)) ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }
}

/** Renders typed text in a cursive font onto a transparent-background canvas, shrinking it to fit. */
export function drawTypedSignature(canvas: HTMLCanvasElement, text: string, color: string): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const trimmed = text.trim();
  if (!trimmed) return;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  let fontSize = canvas.height * 0.62;
  do {
    ctx.font = `${fontSize}px ${TYPED_SIGNATURE_FONT}`;
    if (ctx.measureText(trimmed).width <= canvas.width * 0.92) break;
    fontSize -= 2;
  } while (fontSize > 10);
  ctx.fillText(trimmed, canvas.width / 2, canvas.height / 2);
}

function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('PNG encoding failed'));
        return;
      }
      blob
        .arrayBuffer()
        .then((buffer) => resolve(new Uint8Array(buffer)))
        .catch(reject);
    }, 'image/png');
  });
}

export interface SignPdfOptions {
  signal?: AbortSignal;
  onProgress?: (progress: SignProgress) => void;
}

/** Embeds the signature in a worker and transfers large buffers instead of cloning them. */
export async function signPdf(
  file: File,
  signatureCanvas: HTMLCanvasElement,
  pageIndex: number,
  rect: PdfRect,
  options: SignPdfOptions = {},
): Promise<Uint8Array> {
  const { signal, onProgress } = options;
  throwIfAborted(signal);
  onProgress?.('preparing');
  await yieldToBrowser();
  const png = await canvasToPngBytes(signatureCanvas);
  throwIfAborted(signal);
  const source = await file.arrayBuffer();
  throwIfAborted(signal);
  onProgress?.('signing');
  await yieldToBrowser();
  const pngBuffer = png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength) as ArrayBuffer;
  const response = await runWorker(
    { type: 'sign', bytes: source, fileName: file.name, pngBytes: pngBuffer, pageIndex, rect },
    [source, pngBuffer],
    file.name,
    signal,
  );
  if (response.type !== 'signed') throw new Error('The background PDF worker returned no file.');
  throwIfAborted(signal);
  onProgress?.('finishing');
  await yieldToBrowser();
  throwIfAborted(signal);
  return new Uint8Array(response.bytes);
}
