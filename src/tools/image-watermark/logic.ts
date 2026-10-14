/** Pure, browser-independent helpers for the image watermark tool. */

export type WatermarkMode = 'text' | 'logo';
export type Layout = 'single' | 'tile';
export type Position =
  'top-left' | 'top' | 'top-right' | 'left' | 'center' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right';
export type OutputFormat = 'original' | 'image/jpeg' | 'image/png' | 'image/webp';
export type TextColor = 'light' | 'dark';

export interface WatermarkOptions {
  mode: WatermarkMode;
  text: string;
  layout: Layout;
  position: Position;
  size: number;
  opacity: number;
  rotation: number;
  gap: number;
  color: TextColor;
  format: OutputFormat;
}

export const DEFAULT_OPTIONS: WatermarkOptions = {
  mode: 'text',
  text: '© Your name',
  layout: 'single',
  position: 'bottom-right',
  size: 18,
  opacity: 45,
  rotation: 0,
  gap: 12,
  color: 'light',
  format: 'original',
};

const MAX_TEXT_LENGTH = 160;

/** Keep one full-resolution canvas per image within broadly supported browser limits. */
export const MAX_INPUT_PIXELS = 24_000_000;
export const MAX_INPUT_DIMENSION = 8_000;
export const MAX_FILE_BYTES = 30 * 1024 * 1024;
export const MAX_IMAGE_COUNT = 20;

export interface InputCheck {
  ok: boolean;
  reason?: 'invalid' | 'dimension' | 'pixels' | 'file';
}

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Limits by grapheme cluster so emoji and Korean characters are never split. */
export function normalizeText(value: string): string {
  const text = value.trim();
  if ('Segmenter' in Intl) {
    return Array.from(new Intl.Segmenter().segment(text), ({ segment }) => segment)
      .slice(0, MAX_TEXT_LENGTH)
      .join('');
  }
  return Array.from(text).slice(0, MAX_TEXT_LENGTH).join('');
}

export function normalizeOptions(value: Partial<WatermarkOptions>): WatermarkOptions {
  const position: Position = POSITIONS.includes(value.position as Position)
    ? (value.position as Position)
    : DEFAULT_OPTIONS.position;
  const format: OutputFormat = FORMATS.includes(value.format as OutputFormat)
    ? (value.format as OutputFormat)
    : DEFAULT_OPTIONS.format;
  return {
    mode: value.mode === 'logo' ? 'logo' : 'text',
    text: normalizeText(value.text ?? DEFAULT_OPTIONS.text),
    layout: value.layout === 'tile' ? 'tile' : 'single',
    position,
    size: clamp(value.size ?? DEFAULT_OPTIONS.size, 4, 80),
    opacity: clamp(value.opacity ?? DEFAULT_OPTIONS.opacity, 0, 100),
    rotation: clamp(value.rotation ?? DEFAULT_OPTIONS.rotation, -90, 90),
    gap: clamp(value.gap ?? DEFAULT_OPTIONS.gap, 0, 100),
    color: value.color === 'dark' ? 'dark' : 'light',
    format,
  };
}

/** Reject sources that would make a full-resolution canvas unreliable or memory-heavy. */
export function validateInput(width: number, height: number, fileBytes: number): InputCheck {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    return { ok: false, reason: 'invalid' };
  }
  if (width > MAX_INPUT_DIMENSION || height > MAX_INPUT_DIMENSION) return { ok: false, reason: 'dimension' };
  if (width * height > MAX_INPUT_PIXELS) return { ok: false, reason: 'pixels' };
  if (fileBytes > MAX_FILE_BYTES) return { ok: false, reason: 'file' };
  return { ok: true };
}

/** Canvas draws only the first GIF frame, so detect animation before it can be silently flattened. */
export function isAnimatedGif(bytes: Uint8Array): boolean {
  if (bytes.length < 13) return false;
  const header = String.fromCharCode(...bytes.subarray(0, 6));
  if (header !== 'GIF87a' && header !== 'GIF89a') return false;

  let position = 6;
  const screenPacked = bytes[position + 4];
  position += 7;
  if (screenPacked & 0x80) position += 3 * 2 ** ((screenPacked & 0x07) + 1);

  let frames = 0;
  while (position < bytes.length) {
    const block = bytes[position];
    if (block === 0x3b) return false;
    if (block === 0x21) {
      position = skipGifSubBlocks(bytes, position + 2);
    } else if (block === 0x2c) {
      frames++;
      if (frames > 1) return true;
      const localPacked = bytes[position + 9];
      position += 10;
      if (localPacked & 0x80) position += 3 * 2 ** ((localPacked & 0x07) + 1);
      position = skipGifSubBlocks(bytes, position + 1);
    } else {
      return false;
    }
  }
  return false;
}

/** Animated WebP uses an ANIM chunk in its RIFF container. */
export function isAnimatedWebp(bytes: Uint8Array): boolean {
  if (bytes.length < 16) return false;
  const signature = String.fromCharCode(...bytes.subarray(0, 4));
  const format = String.fromCharCode(...bytes.subarray(8, 12));
  if (signature !== 'RIFF' || format !== 'WEBP') return false;

  let position = 12;
  while (position + 8 <= bytes.length) {
    const chunk = String.fromCharCode(...bytes.subarray(position, position + 4));
    const length =
      bytes[position + 4] | (bytes[position + 5] << 8) | (bytes[position + 6] << 16) | (bytes[position + 7] << 24);
    if (chunk === 'ANIM') return true;
    if (length < 0 || position + 8 + length > bytes.length) return false;
    position += 8 + length + (length % 2);
  }
  return false;
}

export const POSITIONS: Position[] = [
  'top-left',
  'top',
  'top-right',
  'left',
  'center',
  'right',
  'bottom-left',
  'bottom',
  'bottom-right',
];

export const FORMATS: OutputFormat[] = ['original', 'image/jpeg', 'image/png', 'image/webp'];
export const MAX_TILE_COUNT = 2500;

export function outputMime(format: OutputFormat, inputType: string): Exclude<OutputFormat, 'original'> {
  if (format !== 'original') return format;
  return inputType === 'image/jpeg' || inputType === 'image/png' || inputType === 'image/webp'
    ? inputType
    : 'image/png';
}

export function outputName(inputName: string, mime: string): string {
  const stem = inputName.replace(/\.[^.]+$/, '') || 'image';
  const extension = mime === 'image/jpeg' ? 'jpg' : mime === 'image/webp' ? 'webp' : 'png';
  return `${stem}-watermarked.${extension}`;
}

export function anchorPoint(
  canvasWidth: number,
  canvasHeight: number,
  markWidth: number,
  markHeight: number,
  position: Position,
  padding: number,
): { x: number; y: number } {
  const x = position.includes('left')
    ? padding
    : position.includes('right')
      ? canvasWidth - markWidth - padding
      : (canvasWidth - markWidth) / 2;
  const y = position.startsWith('top')
    ? padding
    : position.startsWith('bottom')
      ? canvasHeight - markHeight - padding
      : (canvasHeight - markHeight) / 2;
  return { x, y };
}

/** Tile origins extend beyond every image edge so rotation leaves no blank band. */
export function tileOrigins(
  canvasWidth: number,
  canvasHeight: number,
  markWidth: number,
  markHeight: number,
  gap: number,
): { x: number; y: number }[] {
  const baseStepX = Math.max(1, markWidth + gap);
  const baseStepY = Math.max(1, markHeight + gap);
  const rangeWidth = canvasWidth + 2 * (markWidth + gap);
  const rangeHeight = canvasHeight + 2 * (markHeight + gap);
  // Keep extreme aspect-ratio logos responsive while preserving a balanced
  // pattern. A pattern can never create more than 2,500 draw operations.
  const aspect = rangeWidth / Math.max(1, rangeHeight);
  const maxColumns = Math.max(1, Math.floor(Math.sqrt(MAX_TILE_COUNT * aspect)));
  const maxRows = Math.max(1, Math.floor(MAX_TILE_COUNT / maxColumns));
  const stepX = Math.max(baseStepX, rangeWidth / Math.max(1, maxColumns - 1));
  const stepY = Math.max(baseStepY, rangeHeight / Math.max(1, maxRows - 1));
  const origins: { x: number; y: number }[] = [];
  for (let y = -markHeight - gap; y <= canvasHeight + markHeight + gap; y += stepY) {
    for (let x = -markWidth - gap; x <= canvasWidth + markWidth + gap; x += stepX) origins.push({ x, y });
  }
  return origins;
}

function skipGifSubBlocks(bytes: Uint8Array, position: number): number {
  while (position < bytes.length) {
    const length = bytes[position++];
    if (length === 0) return position;
    position += length;
  }
  return position;
}
