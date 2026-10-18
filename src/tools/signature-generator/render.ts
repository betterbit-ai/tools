/** Browser-only canvas rendering and PNG export for signature-generator. */
import {
  EXPORT_PADDING,
  findInkBounds,
  paddedBounds,
  SIGNATURE_HEIGHT,
  SIGNATURE_WIDTH,
  type PenWidth,
  type SignatureStyle,
  type Stroke,
} from './logic';

const FONT_STACKS: Record<SignatureStyle, string> = {
  script: "'Segoe Script', 'Bradley Hand', 'Apple Chancery', cursive",
  formal: "'Times New Roman', 'Apple SD Gothic Neo', serif",
  simple: "'Segoe UI', 'Apple SD Gothic Neo', sans-serif",
};

const PEN_WIDTHS: Record<PenWidth, number> = { thin: 0.012, medium: 0.02, bold: 0.03 };

export function canvasPoint(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
  const rect = canvas.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top, width: rect.width, height: rect.height };
}

export function drawSignature(
  canvas: HTMLCanvasElement,
  options: { text: string; strokes: Stroke[]; style: SignatureStyle; penWidth: PenWidth; ink: string; draw: boolean },
): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (options.draw) drawStrokes(context, canvas, options.strokes, options.penWidth, options.ink);
  else drawText(context, canvas, options.text, options.style, options.ink);
}

function drawStrokes(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  strokes: Stroke[],
  penWidth: PenWidth,
  ink: string,
): void {
  context.strokeStyle = ink;
  context.fillStyle = ink;
  context.lineWidth = canvas.height * PEN_WIDTHS[penWidth];
  context.lineCap = 'round';
  context.lineJoin = 'round';
  for (const stroke of strokes) {
    if (!stroke.length) continue;
    const first = stroke[0];
    if (stroke.length === 1) {
      context.beginPath();
      context.arc(first.x * canvas.width, first.y * canvas.height, context.lineWidth / 2, 0, Math.PI * 2);
      context.fill();
      continue;
    }
    context.beginPath();
    context.moveTo(first.x * canvas.width, first.y * canvas.height);
    for (const point of stroke.slice(1)) context.lineTo(point.x * canvas.width, point.y * canvas.height);
    context.stroke();
  }
}

function drawText(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  text: string,
  style: SignatureStyle,
  ink: string,
): void {
  const value = text.trim();
  if (!value) return;
  context.fillStyle = ink;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  let size = canvas.height * 0.62;
  do {
    context.font = `${style === 'formal' ? 'italic ' : ''}${size}px ${FONT_STACKS[style]}`;
    if (context.measureText(value).width <= canvas.width * 0.88) break;
    size -= 2;
  } while (size > 12);
  context.fillText(value, canvas.width / 2, canvas.height / 2);
}

/** Exports tightly cropped visible ink with transparent padding around it. */
export async function exportSignaturePng(canvas: HTMLCanvasElement): Promise<Blob> {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas unavailable');
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const bounds = findInkBounds(image.data, canvas.width, canvas.height);
  if (!bounds) throw new Error('Signature is blank');
  const crop = paddedBounds(bounds, EXPORT_PADDING, canvas.width, canvas.height);
  const width = crop.right - crop.left + 1;
  const height = crop.bottom - crop.top + 1;
  const output = document.createElement('canvas');
  output.width = width;
  output.height = height;
  const outputContext = output.getContext('2d');
  if (!outputContext) throw new Error('Canvas unavailable');
  outputContext.drawImage(canvas, crop.left, crop.top, width, height, 0, 0, width, height);
  return new Promise((resolve, reject) => {
    output.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG encoding failed'))), 'image/png');
  });
}

export { SIGNATURE_HEIGHT, SIGNATURE_WIDTH };
