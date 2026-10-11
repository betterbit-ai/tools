/**
 * Pure planning for the fixed 128px Real-ESRGAN model. Browser canvas and
 * ONNX Runtime work deliberately live in upscale.ts instead.
 */
export const MODEL_INPUT_SIZE = 128;
export const MODEL_SCALE = 4;
export const TILE_OVERLAP = 16;
export const MAX_INPUT_PIXELS = 1_000_000;
export const MAX_INPUT_DIMENSION = 4096;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

export type Scale = 2 | 4;

export interface Tile {
  /** Pixel rectangle read from the source image, including context overlap. */
  inputX: number;
  inputY: number;
  inputWidth: number;
  inputHeight: number;
  /** Non-overlapping source region written to the final image. */
  coreX: number;
  coreY: number;
  coreWidth: number;
  coreHeight: number;
}

export interface DimensionCheck {
  ok: boolean;
  reason?: 'invalid' | 'dimension' | 'pixels' | 'file';
}

const coreSize = (tileSize: number, overlap: number) => tileSize - overlap * 2;

export function outputDimensions(width: number, height: number, scale: Scale): { width: number; height: number } {
  return { width: width * scale, height: height * scale };
}

/**
 * Splits an image into 128px inference inputs. Tiles overlap for model context,
 * but only their non-overlapping cores are copied back, so there are no seams or
 * duplicated output pixels. Edge inputs are padded by the browser worker.
 */
export function makeTileGrid(
  width: number,
  height: number,
  tileSize = MODEL_INPUT_SIZE,
  overlap = TILE_OVERLAP,
): Tile[] {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) return [];
  const core = coreSize(tileSize, overlap);
  if (core <= 0) throw new RangeError('overlap must leave a non-empty tile core');
  const tiles: Tile[] = [];

  for (let coreY = 0; coreY < height; coreY += core) {
    const coreHeight = Math.min(core, height - coreY);
    const inputY = Math.max(0, coreY - overlap);
    const inputBottom = Math.min(height, coreY + coreHeight + overlap);
    for (let coreX = 0; coreX < width; coreX += core) {
      const coreWidth = Math.min(core, width - coreX);
      const inputX = Math.max(0, coreX - overlap);
      const inputRight = Math.min(width, coreX + coreWidth + overlap);
      tiles.push({
        inputX,
        inputY,
        inputWidth: inputRight - inputX,
        inputHeight: inputBottom - inputY,
        coreX,
        coreY,
        coreWidth,
        coreHeight,
      });
    }
  }
  return tiles;
}

/** Where a tile's core belongs in the 4× model output before optional 2× downsampling. */
export function stitchRect(tile: Tile, modelScale = MODEL_SCALE) {
  return {
    sourceX: (tile.coreX - tile.inputX) * modelScale,
    sourceY: (tile.coreY - tile.inputY) * modelScale,
    sourceWidth: tile.coreWidth * modelScale,
    sourceHeight: tile.coreHeight * modelScale,
    destinationX: tile.coreX * modelScale,
    destinationY: tile.coreY * modelScale,
    destinationWidth: tile.coreWidth * modelScale,
    destinationHeight: tile.coreHeight * modelScale,
  };
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

export function outputName(filename: string, scale: Scale, mime: string): string {
  const base = (filename.startsWith('.') ? filename : filename.replace(/\.[^/.]+$/, '')) || 'image';
  const extension = mime === 'image/jpeg' ? 'jpg' : mime === 'image/webp' ? 'webp' : 'png';
  return `${base}-${scale}x-upscaled.${extension}`;
}
