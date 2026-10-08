/**
 * Compression planning — pure math, no DOM. The browser-side canvas encoding
 * lives in compress.ts; it calls back into searchQuality() below.
 */

export type CompressMode = 'quality' | 'size';
export type SizeUnit = 'KB' | 'MB';
export type FormatChoice = 'original' | 'image/jpeg' | 'image/png' | 'image/webp';

export function toBytes(value: number, unit: SizeUnit): number {
  return Math.max(1, Math.round(value * (unit === 'MB' ? 1024 * 1024 : 1024)));
}

const ENCODABLE = ['image/jpeg', 'image/png', 'image/webp'];

/** Output MIME. "original" keeps JPEG/PNG/WebP; anything else (GIF, BMP, HEIC…) becomes PNG. */
export function outputType(choice: FormatChoice, srcType: string): string {
  if (choice !== 'original') return choice;
  return ENCODABLE.includes(srcType) ? srcType : 'image/png';
}

/** Only JPEG and WebP have a quality knob; PNG is lossless in Canvas. */
export function supportsQuality(mime: string): boolean {
  return mime === 'image/jpeg' || mime === 'image/webp';
}

export function extensionFor(mime: string): string {
  return mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1];
}

/** "holiday photo.HEIC" + jpeg -> "holiday photo-compressed.jpg" */
export function outputName(name: string, mime: string): string {
  const base = name.replace(/\.[^.]+$/, '');
  return `${base}-compressed.${extensionFor(mime)}`;
}

export interface EncodeResult {
  size: number;
}

export interface QualitySearchOptions {
  /** Lowest quality worth trying (below this, results look too degraded). */
  minQuality?: number;
  maxQuality?: number;
  /** Binary-search iterations after finding the slot that already fits. */
  iterations?: number;
}

export interface QualitySearchOutcome<T extends EncodeResult> {
  quality: number;
  result: T;
  /** False when even the lowest quality is still larger than the target. */
  achieved: boolean;
}

/**
 * Finds the highest JPEG/WebP quality whose encoded size is at or below
 * `targetBytes`. `encode` is a caller-supplied async function so this stays
 * pure and testable without a real canvas (see logic.test.ts for a fake one
 * that models size as roughly proportional to quality).
 */
export async function searchQuality<T extends EncodeResult>(
  targetBytes: number,
  encode: (quality: number) => Promise<T>,
  opts: QualitySearchOptions = {},
): Promise<QualitySearchOutcome<T>> {
  const minQuality = opts.minQuality ?? 0.05;
  const maxQuality = opts.maxQuality ?? 0.95;
  const iterations = opts.iterations ?? 6;

  const best = await encode(maxQuality);
  if (best.size <= targetBytes) return { quality: maxQuality, result: best, achieved: true };

  const floor = await encode(minQuality);
  if (floor.size > targetBytes) return { quality: minQuality, result: floor, achieved: false };

  let lo = minQuality;
  let hi = maxQuality;
  let found = { quality: minQuality, result: floor };
  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2;
    const result = await encode(mid);
    if (result.size <= targetBytes) {
      found = { quality: mid, result };
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return { ...found, achieved: true };
}

/** Downscale steps tried when quality alone can't reach the target size. */
export const SCALE_STEPS = [1, 0.75, 0.5, 0.35, 0.25] as const;

/**
 * Canvas only ever draws a GIF's first frame, so compressing an animated one
 * silently throws away every other frame. Parse just enough of the GIF89a
 * structure to count image blocks, so the UI can warn instead of failing quietly.
 */
export function isAnimatedGif(bytes: Uint8Array): boolean {
  if (bytes.length < 13) return false;
  const header = String.fromCharCode(...bytes.subarray(0, 6));
  if (header !== 'GIF87a' && header !== 'GIF89a') return false;

  let pos = 6;
  const screenPacked = bytes[pos + 4];
  pos += 7;
  if (screenPacked & 0x80) pos += 3 * 2 ** ((screenPacked & 0x07) + 1);

  let frames = 0;
  while (pos < bytes.length) {
    const block = bytes[pos];
    if (block === 0x3b) break; // trailer
    if (block === 0x21) {
      pos += 2; // extension introducer + label
      pos = skipSubBlocks(bytes, pos);
    } else if (block === 0x2c) {
      frames++;
      if (frames > 1) return true;
      const localPacked = bytes[pos + 9];
      pos += 10;
      if (localPacked & 0x80) pos += 3 * 2 ** ((localPacked & 0x07) + 1);
      pos += 1; // LZW minimum code size
      pos = skipSubBlocks(bytes, pos);
    } else {
      break; // malformed or unrecognised block — stop rather than mis-scan
    }
  }
  return false;
}

function skipSubBlocks(bytes: Uint8Array, start: number): number {
  let pos = start;
  while (pos < bytes.length) {
    const size = bytes[pos];
    pos += 1;
    if (size === 0) break;
    pos += size;
  }
  return pos;
}
