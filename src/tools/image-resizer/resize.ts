/**
 * Browser-only pixel work. Downscales in halving steps, which avoids the
 * aliasing/moire that a single large canvas downscale produces in some browsers.
 */
import type { ResizePlan } from './logic';

export async function readDimensions(file: File): Promise<{ width: number; height: number }> {
  const bmp = await createImageBitmap(file);
  const dims = { width: bmp.width, height: bmp.height };
  bmp.close();
  return dims;
}

export async function resizeImage(file: File, plan: ResizePlan, mime: string, quality: number): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  try {
    let source: CanvasImageSource = bmp;
    let { sx, sy, sw, sh } = plan;

    // Step down by halves until within 2× of the target.
    while (sw / 2 >= plan.width && sh / 2 >= plan.height) {
      const w = Math.round(sw / 2);
      const h = Math.round(sh / 2);
      const step = makeCanvas(w, h);
      const ctx = step.getContext('2d')!;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(source, sx, sy, sw, sh, 0, 0, w, h);
      source = step;
      sx = 0;
      sy = 0;
      sw = w;
      sh = h;
    }

    const out = makeCanvas(plan.width, plan.height);
    const ctx = out.getContext('2d')!;
    if (mime === 'image/jpeg') {
      // JPEG has no alpha: transparent pixels would turn black.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, plan.width, plan.height);
    }
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, plan.width, plan.height);
    return await toBlob(out, mime, quality);
  } finally {
    bmp.close();
  }
}

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function toBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), mime, quality),
  );
}
