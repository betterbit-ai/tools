/**
 * Pure planning for Real-ESRGAN tiling. Browser canvas and ONNX Runtime work
 * deliberately live in upscale.ts instead.
 */
/** Largest tile fed to the model. The model accepts any size; 256px runs ~1.8× faster per pixel than 128px on WebGPU. */
export const TILE_SIZE = 256;
export const MODEL_SCALE = 4;
export const TILE_OVERLAP = 16;
/** Largest source the browser is asked to decode. Bigger photos are reduced before the AI runs. */
export const MAX_INPUT_PIXELS = 50_000_000;
export const MAX_INPUT_DIMENSION = 16_384;
export const MAX_FILE_BYTES = 50 * 1024 * 1024;
/**
 * Pixels the AI works on per scale. Larger sources are reduced to this first, so a 12 MP phone
 * photo still works and the result stays within ~10–16 MP (memory and time on phones/CPU).
 */
export const MAX_WORK_PIXELS: Record<Scale, number> = { 2: 2_500_000, 4: 1_000_000 };

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

export interface ImageDimensions {
  width: number;
  height: number;
}

const coreSize = (tileSize: number, overlap: number) => tileSize - overlap * 2;

/** The size the AI actually processes: the source, or a proportional reduction of it. */
export function workDimensions(width: number, height: number, scale: Scale): ImageDimensions & { reduced: boolean } {
  const max = MAX_WORK_PIXELS[scale];
  if (width * height <= max) return { width, height, reduced: false };
  const factor = Math.sqrt(max / (width * height));
  return {
    width: Math.max(1, Math.floor(width * factor)),
    height: Math.max(1, Math.floor(height * factor)),
    reduced: true,
  };
}

/** Final output size for a source image, after any reduction. */
export function outputDimensions(width: number, height: number, scale: Scale): { width: number; height: number } {
  const work = workDimensions(width, height, scale);
  return { width: work.width * scale, height: work.height * scale };
}

/** Cores along one axis, evenly sized so no edge tile is a thin sliver. */
function axisCores(length: number, maxCore: number): Array<[start: number, size: number]> {
  const count = Math.ceil(length / maxCore);
  const step = Math.ceil(length / count);
  const cores: Array<[number, number]> = [];
  for (let start = 0; start < length; start += step) cores.push([start, Math.min(step, length - start)]);
  return cores;
}

/**
 * Splits an image into inference inputs of at most `tileSize` px. Tiles overlap for
 * model context, but only their non-overlapping cores are copied back, so there are
 * no seams or duplicated output pixels.
 */
export function makeTileGrid(width: number, height: number, tileSize = TILE_SIZE, overlap = TILE_OVERLAP): Tile[] {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) return [];
  const core = coreSize(tileSize, overlap);
  if (core <= 0) throw new RangeError('overlap must leave a non-empty tile core');
  const tiles: Tile[] = [];

  for (const [coreY, coreHeight] of axisCores(height, core)) {
    const inputY = Math.max(0, coreY - overlap);
    const inputBottom = Math.min(height, coreY + coreHeight + overlap);
    for (const [coreX, coreWidth] of axisCores(width, core)) {
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

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

function uint16BE(bytes: Uint8Array, offset: number) {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function uint32BE(bytes: Uint8Array, offset: number) {
  return bytes[offset] * 2 ** 24 + (bytes[offset + 1] << 16) + (bytes[offset + 2] << 8) + bytes[offset + 3];
}

function uint32LE(bytes: Uint8Array, offset: number) {
  return bytes[offset] + (bytes[offset + 1] << 8) + (bytes[offset + 2] << 16) + bytes[offset + 3] * 2 ** 24;
}

function dimensions(width: number, height: number): ImageDimensions | null {
  return Number.isInteger(width) && Number.isInteger(height) && width > 0 && height > 0 ? { width, height } : null;
}

function jpegDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset < bytes.length) {
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (
      marker === undefined ||
      marker === 0xd8 ||
      marker === 0xd9 ||
      marker === 0x01 ||
      (marker >= 0xd0 && marker <= 0xd7)
    ) {
      continue;
    }
    if (offset + 1 >= bytes.length) return null;
    const length = uint16BE(bytes, offset);
    if (length < 8 || offset + length > bytes.length) return null;
    const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isStartOfFrame) return dimensions(uint16BE(bytes, offset + 5), uint16BE(bytes, offset + 3));
    offset += length;
  }
  return null;
}

function webpDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (
    bytes.length < 20 ||
    String.fromCharCode(...bytes.slice(0, 4)) !== 'RIFF' ||
    String.fromCharCode(...bytes.slice(8, 12)) !== 'WEBP'
  ) {
    return null;
  }
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const chunk = String.fromCharCode(...bytes.slice(offset, offset + 4));
    const length = uint32LE(bytes, offset + 4);
    const start = offset + 8;
    if (start + length > bytes.length) return null;
    if (chunk === 'VP8X' && length >= 10) {
      const width = 1 + bytes[start + 4] + (bytes[start + 5] << 8) + (bytes[start + 6] << 16);
      const height = 1 + bytes[start + 7] + (bytes[start + 8] << 8) + (bytes[start + 9] << 16);
      return dimensions(width, height);
    }
    if (
      chunk === 'VP8 ' &&
      length >= 10 &&
      bytes[start + 3] === 0x9d &&
      bytes[start + 4] === 0x01 &&
      bytes[start + 5] === 0x2a
    ) {
      const width = (bytes[start + 6] | (bytes[start + 7] << 8)) & 0x3fff;
      const height = (bytes[start + 8] | (bytes[start + 9] << 8)) & 0x3fff;
      return dimensions(width, height);
    }
    if (chunk === 'VP8L' && length >= 5 && bytes[start] === 0x2f) {
      const width = 1 + ((bytes[start + 1] | (bytes[start + 2] << 8)) & 0x3fff);
      const height = 1 + (((bytes[start + 2] >> 6) | (bytes[start + 3] << 2) | (bytes[start + 4] << 10)) & 0x3fff);
      return dimensions(width, height);
    }
    offset = start + length + (length % 2);
  }
  return null;
}

/**
 * Reads dimensions from supported image headers without decoding the full image.
 * This lets the UI reject a highly compressed, oversized image before it can
 * allocate a huge decoded bitmap on the main thread.
 */
export function imageDimensionsFromHeader(bytes: Uint8Array): ImageDimensions | null {
  if (PNG_SIGNATURE.every((value, index) => bytes[index] === value) && bytes.length >= 24) {
    return dimensions(uint32BE(bytes, 16), uint32BE(bytes, 20));
  }
  return jpegDimensions(bytes) ?? webpDimensions(bytes);
}

/** Remaining time from the tiles finished so far, or null until there is a measurement. */
export function etaSeconds(completed: number, total: number, elapsedMs: number): number | null {
  if (completed <= 0 || completed >= total || elapsedMs <= 0) return null;
  return Math.ceil(((elapsedMs / completed) * (total - completed)) / 1000);
}

export function outputName(filename: string, scale: Scale, mime: string): string {
  const base = (filename.startsWith('.') ? filename : filename.replace(/\.[^/.]*$/, '')) || 'image';
  const extension = mime === 'image/jpeg' ? 'jpg' : mime === 'image/webp' ? 'webp' : 'png';
  return `${base}-${scale}x-upscaled.${extension}`;
}
