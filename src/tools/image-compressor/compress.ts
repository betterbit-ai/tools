/**
 * Browser-only pixel work: canvas encoding and the scale/quality search loop.
 * Pure decision-making (search algorithm, size math) lives in logic.ts.
 */
import { SCALE_STEPS, searchQuality, type EncodeResult } from './logic';

export async function readDimensions(file: File): Promise<{ width: number; height: number }> {
  const bmp = await createImageBitmap(file);
  const dims = { width: bmp.width, height: bmp.height };
  bmp.close();
  return dims;
}

export interface CompressResult extends EncodeResult {
  blob: Blob;
  width: number;
  height: number;
}

async function encodeAt(
  bmp: ImageBitmap,
  width: number,
  height: number,
  mime: string,
  quality: number,
): Promise<CompressResult> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  if (mime === 'image/jpeg') {
    // JPEG has no alpha: transparent pixels would turn black.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, 0, 0, width, height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), mime, quality),
  );
  return { blob, width, height, size: blob.size };
}

/** Quality-slider mode: one encode at the given quality, original dimensions. */
export async function compressAtQuality(file: File, mime: string, quality: number): Promise<CompressResult> {
  const bmp = await createImageBitmap(file);
  try {
    return await encodeAt(bmp, bmp.width, bmp.height, mime, quality);
  } finally {
    bmp.close();
  }
}

/**
 * Target-size mode: binary-search quality at full size first; if even the
 * lowest quality is still too big, step down the dimensions and search again.
 */
export async function compressToTarget(
  file: File,
  mime: string,
  targetBytes: number,
): Promise<{ result: CompressResult; quality: number; achieved: boolean }> {
  const bmp = await createImageBitmap(file);
  try {
    let last: Awaited<ReturnType<typeof searchQuality<CompressResult>>> | undefined;
    for (const scale of SCALE_STEPS) {
      const width = Math.max(1, Math.round(bmp.width * scale));
      const height = Math.max(1, Math.round(bmp.height * scale));
      const outcome = await searchQuality(targetBytes, (quality) => encodeAt(bmp, width, height, mime, quality));
      last = outcome;
      if (outcome.achieved) return outcome;
    }
    return last!;
  } finally {
    bmp.close();
  }
}
