/**
 * Pure planning for the U²-NetP background-removal model. Canvas and ONNX
 * Runtime calls deliberately live in remove.ts so this file stays testable.
 */

export const MODEL_INPUT_SIZE = 320;
export const MAX_INPUT_PIXELS = 24_000_000;
export const MAX_INPUT_DIMENSION = 8_000;
export const MAX_FILE_BYTES = 30 * 1024 * 1024;

export interface DimensionCheck {
  ok: boolean;
  reason?: 'invalid' | 'dimension' | 'pixels' | 'file';
}

/** The output keeps the source dimensions; the model produces only its alpha mask at 320 px. */
export function outputDimensions(width: number, height: number): { width: number; height: number } {
  return { width, height };
}

export function validateInput(width: number, height: number, fileBytes = 0): DimensionCheck {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    return { ok: false, reason: 'invalid' };
  }
  if (width > MAX_INPUT_DIMENSION || height > MAX_INPUT_DIMENSION) return { ok: false, reason: 'dimension' };
  if (width * height > MAX_INPUT_PIXELS) return { ok: false, reason: 'pixels' };
  if (fileBytes > MAX_FILE_BYTES) return { ok: false, reason: 'file' };
  return { ok: true };
}

/**
 * U²-Net's saliency output is not guaranteed to be in the 0–1 range. Stretch
 * each image's finite mask values into an 8-bit alpha range, treating a flat
 * or invalid mask as fully transparent instead of producing NaN pixels.
 */
export function normaliseMask(values: ArrayLike<number>): Uint8ClampedArray {
  const alpha = new Uint8ClampedArray(values.length);
  let min = Infinity;
  let max = -Infinity;
  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    if (Number.isFinite(value)) {
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }
  if (!Number.isFinite(min) || max <= min) return alpha;
  const scale = 255 / (max - min);
  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    alpha[index] = Number.isFinite(value) ? Math.round((value - min) * scale) : 0;
  }
  return alpha;
}

export function outputName(filename: string): string {
  const base = (filename.startsWith('.') ? filename : filename.replace(/\.[^/.]+$/, '')) || 'image';
  return `${base}-background-removed.png`;
}
