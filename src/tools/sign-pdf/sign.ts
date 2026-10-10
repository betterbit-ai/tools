/**
 * Browser-only PDF rendering and signing. pdf-lib and pdfjs-dist are both
 * loaded lazily so the heavy parsers aren't in the initial page bundle.
 */
import { EncryptedPdfError, InvalidPdfError, TYPED_SIGNATURE_FONT, type PdfRect, type Stroke } from './logic';

async function loadPdfLib() {
  return import('pdf-lib');
}

export interface PdfInfo {
  pageCount: number;
  pageSizes: { width: number; height: number }[];
}

/** Parses a PDF far enough to report its page count and page sizes, without modifying it. */
export async function readPdfInfo(bytes: Uint8Array, fileName: string): Promise<PdfInfo> {
  const { PDFDocument, EncryptedPDFError } = await loadPdfLib();
  let doc;
  try {
    doc = await PDFDocument.load(bytes);
  } catch (err) {
    if (err instanceof EncryptedPDFError) throw new EncryptedPdfError(fileName);
    throw new InvalidPdfError(fileName);
  }
  return {
    pageCount: doc.getPageCount(),
    pageSizes: doc.getPages().map((page) => ({ width: page.getWidth(), height: page.getHeight() })),
  };
}

/** Renders one page (0-based index) to a canvas for the live placement preview. */
export async function renderPagePreview(
  bytes: Uint8Array,
  pageIndex: number,
  maxWidthPx: number,
): Promise<HTMLCanvasElement> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();
  const loadingTask = pdfjs.getDocument({ data: bytes });
  try {
    const doc = await loadingTask.promise;
    const page = await doc.getPage(pageIndex + 1);
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
    await page.render({ canvas, viewport }).promise;
    page.cleanup();
    return canvas;
  } finally {
    await loadingTask.destroy();
  }
}

/** Draws freehand strokes (in the canvas's own pixel coordinates) as dark ink on a transparent background. */
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
        .then((buf) => resolve(new Uint8Array(buf)))
        .catch(reject);
    }, 'image/png');
  });
}

/** Embeds the signature canvas onto one page and returns the signed PDF bytes. */
export async function signPdf(
  bytes: Uint8Array,
  fileName: string,
  signatureCanvas: HTMLCanvasElement,
  pageIndex: number,
  rect: PdfRect,
): Promise<Uint8Array> {
  const { PDFDocument, EncryptedPDFError } = await loadPdfLib();
  let doc;
  try {
    doc = await PDFDocument.load(bytes);
  } catch (err) {
    if (err instanceof EncryptedPDFError) throw new EncryptedPdfError(fileName);
    throw new InvalidPdfError(fileName);
  }
  const pngBytes = await canvasToPngBytes(signatureCanvas);
  const image = await doc.embedPng(pngBytes);
  const page = doc.getPages()[pageIndex];
  if (!page) throw new Error(`signPdf: page ${pageIndex} does not exist`);
  page.drawImage(image, rect);
  return doc.save();
}
