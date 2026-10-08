/**
 * Format/naming decisions — pure math, no DOM. The browser-side canvas
 * encoding lives in convert.ts.
 */

/** Canvas can only *encode* to these three; anything else is a source-only format. */
export type FormatChoice = 'image/jpeg' | 'image/png' | 'image/webp';

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  bmp: 'image/bmp',
  avif: 'image/avif',
  svg: 'image/svg+xml',
};

/** Browsers leave `file.type` empty for some formats (e.g. BMP, AVIF, HEIC); fall back to the extension. */
export function sourceMime(file: { type: string; name: string }): string {
  if (file.type) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return EXT_TO_MIME[ext] ?? 'application/octet-stream';
}

const LABELS: Record<string, string> = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'image/gif': 'GIF',
  'image/bmp': 'BMP',
  'image/avif': 'AVIF',
  'image/svg+xml': 'SVG',
};

export function formatLabel(mime: string): string {
  return LABELS[mime] ?? mime.split('/')[1]?.toUpperCase() ?? mime;
}

export function extensionFor(mime: FormatChoice): string {
  return mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1];
}

/** "holiday photo.HEIC" + png -> "holiday photo.png" */
export function outputName(name: string, mime: FormatChoice): string {
  const base = name.replace(/\.[^.]+$/, '');
  return `${base}.${extensionFor(mime)}`;
}

/** Only JPEG and WebP have a quality knob; PNG is always lossless in Canvas. */
export function supportsQuality(mime: FormatChoice): boolean {
  return mime === 'image/jpeg' || mime === 'image/webp';
}

/** JPEG has no alpha channel, so a fill colour is needed behind transparent pixels. */
export function needsBackground(mime: FormatChoice): boolean {
  return mime === 'image/jpeg';
}

/** True when the source format can carry transparency, so the background colour actually matters. */
export function sourceMayHaveAlpha(mime: string): boolean {
  return mime === 'image/png' || mime === 'image/webp' || mime === 'image/gif' || mime === 'image/avif';
}

/**
 * Canvas only ever draws a GIF's first frame, so converting an animated one
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
