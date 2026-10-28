/** Browser-only canvas drawing. Geometry is planned and tested in logic.ts. */
import { type BackgroundId, type BeautifyOptions, planRender, sanitizeOptions } from './logic';

const GRADIENTS: Record<BackgroundId, readonly [string, string]> = {
  violet: ['#5b5bd6', '#c56ad8'],
  sunset: ['#ef7a62', '#e3b650'],
  ocean: ['#2676b8', '#48b7aa'],
  mint: ['#3ba889', '#91cf8a'],
  warm: ['#a45e55', '#dfad78'],
};

export interface RenderSettings extends BeautifyOptions {
  background: BackgroundId;
  browserTitle: string;
}

export async function renderScreenshot(
  file: File,
  settings: RenderSettings,
  preview: boolean,
  signal?: AbortSignal,
): Promise<Blob> {
  throwIfAborted(signal);
  const bitmap = await createImageBitmap(file);
  let canvas: HTMLCanvasElement | null = null;
  try {
    throwIfAborted(signal);
    const safe = sanitizeOptions(settings);
    const plan = planRender(bitmap.width, bitmap.height, safe);
    const scale = preview ? Math.min(1, 960 / Math.max(plan.width, plan.height)) : 1;
    canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(plan.width * scale));
    canvas.height = Math.max(1, Math.round(plan.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas rendering is unavailable.');
    context.scale(scale, scale);

    const [start, end] = GRADIENTS[settings.background] ?? GRADIENTS.violet;
    const gradient = context.createLinearGradient(0, 0, plan.width, plan.height);
    gradient.addColorStop(0, start);
    gradient.addColorStop(1, end);
    context.fillStyle = gradient;
    context.fillRect(0, 0, plan.width, plan.height);

    const cardX = plan.image.x;
    const cardY = plan.image.y - plan.headerHeight;
    const cardWidth = plan.image.width;
    const cardHeight = plan.image.height + plan.headerHeight;
    const radius = Math.min(safe.radius, cardWidth / 2, cardHeight / 2);
    context.save();
    context.shadowColor = 'rgba(0, 0, 0, 0.28)';
    context.shadowBlur = safe.shadow * 0.8;
    context.shadowOffsetY = safe.shadow * 0.35;
    roundedRect(context, cardX, cardY, cardWidth, cardHeight, radius);
    context.fillStyle = '#ffffff';
    context.fill();
    context.restore();

    context.save();
    roundedRect(context, cardX, cardY, cardWidth, cardHeight, radius);
    context.clip();
    if (safe.frame !== 'none')
      drawBrowserBar(context, cardX, cardY, cardWidth, plan.headerHeight, safe.frame, settings.browserTitle);
    context.drawImage(bitmap, cardX, plan.image.y, cardWidth, plan.image.height);
    context.restore();

    throwIfAborted(signal);
    return await toPng(canvas, signal);
  } finally {
    bitmap.close();
    if (canvas) {
      canvas.width = 1;
      canvas.height = 1;
    }
  }
}

function drawBrowserBar(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  frame: 'browser-light' | 'browser-dark',
  title: string,
): void {
  const dark = frame === 'browser-dark';
  context.fillStyle = dark ? '#25252a' : '#f4f4f5';
  context.fillRect(x, y, width, height);
  const dot = Math.max(4, Math.round(height * 0.14));
  const dotY = y + height / 2;
  for (let index = 0; index < 3; index++) {
    context.beginPath();
    context.arc(x + height * (0.45 + index * 0.26), dotY, dot, 0, Math.PI * 2);
    context.fillStyle = dark ? '#72727a' : '#b0b0b6';
    context.fill();
  }
  const text = title.trim();
  if (!text) return;
  context.fillStyle = dark ? '#ededf0' : '#3b3b40';
  context.font = `${Math.max(10, Math.round(height * 0.32))}px system-ui, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, x + width / 2, dotY, Math.max(0, width - height * 3));
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('Rendering was cancelled.', 'AbortError');
}

function toPng(canvas: HTMLCanvasElement, signal?: AbortSignal): Promise<Blob> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', onAbort);
      callback();
    };
    const onAbort = () => finish(() => reject(new DOMException('Rendering was cancelled.', 'AbortError')));
    signal?.addEventListener('abort', onAbort, { once: true });
    canvas.toBlob(
      (blob) => finish(() => (blob ? resolve(blob) : reject(new Error('PNG export failed.')))),
      'image/png',
    );
    if (signal?.aborted) onAbort();
  });
}
