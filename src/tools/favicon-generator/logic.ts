/** Pure favicon package details. Canvas rendering and downloads live in render.ts. */

export const ICO_SIZES = [16, 32, 48] as const;
export const PNG_SIZES = [16, 32, 48, 180, 192, 512] as const;
export const MAX_WORKING_DIMENSION = 1024;

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface FaviconFile {
  name: string;
  size: number;
  purpose: 'tab' | 'apple' | 'android';
}

export const FAVICON_FILES: readonly FaviconFile[] = [
  { name: 'favicon-16x16.png', size: 16, purpose: 'tab' },
  { name: 'favicon-32x32.png', size: 32, purpose: 'tab' },
  { name: 'favicon-48x48.png', size: 48, purpose: 'tab' },
  { name: 'apple-touch-icon.png', size: 180, purpose: 'apple' },
  { name: 'android-chrome-192x192.png', size: 192, purpose: 'android' },
  { name: 'android-chrome-512x512.png', size: 512, purpose: 'android' },
];

/** Reads dimensions from supported image headers without decoding a full phone photo. */
export function imageDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (
    bytes.length >= 24 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    ascii(bytes, 12, 4) === 'IHDR'
  ) {
    return validDimensions(readUint32(bytes, 16, false), readUint32(bytes, 20, false));
  }

  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 8 < bytes.length) {
      while (offset < bytes.length && bytes[offset] !== 0xff) offset++;
      while (offset < bytes.length && bytes[offset] === 0xff) offset++;
      const marker = bytes[offset++];
      if (marker === undefined || marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) continue;
      if (offset + 2 > bytes.length) break;
      const length = readUint16(bytes, offset, false);
      if (length < 2 || offset + length > bytes.length) break;
      if (isJpegStartOfFrame(marker) && length >= 7) {
        return validDimensions(readUint16(bytes, offset + 5, false), readUint16(bytes, offset + 3, false));
      }
      offset += length;
    }
  }

  if (bytes.length >= 30 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') {
    const kind = ascii(bytes, 12, 4);
    if (kind === 'VP8X') {
      return validDimensions(readUint24(bytes, 24) + 1, readUint24(bytes, 27) + 1);
    }
    if (kind === 'VP8 ' && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) {
      return validDimensions(readUint16(bytes, 26, true) & 0x3fff, readUint16(bytes, 28, true) & 0x3fff);
    }
    if (kind === 'VP8L' && bytes[20] === 0x2f) {
      const width = 1 + bytes[21] + ((bytes[22] & 0x3f) << 8);
      const height = 1 + (bytes[22] >> 6) + (bytes[23] << 2) + ((bytes[24] & 0x0f) << 10);
      return validDimensions(width, height);
    }
  }

  return null;
}

/** Caps decoded bitmap memory while retaining 2× source pixels for the largest 512px icon. */
export function boundedBitmapSize(width: number, height: number, maximum = MAX_WORKING_DIMENSION): ImageDimensions {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1 || maximum < 1) {
    throw new RangeError('Image dimensions must be positive');
  }
  const scale = Math.min(1, maximum / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(offset, offset + length));
}

function readUint16(bytes: Uint8Array, offset: number, littleEndian: boolean): number {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint16(offset, littleEndian);
}

function readUint24(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
}

function readUint32(bytes: Uint8Array, offset: number, littleEndian: boolean): number {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, littleEndian);
}

function validDimensions(width: number, height: number): ImageDimensions | null {
  return width > 0 && height > 0 ? { width, height } : null;
}

function isJpegStartOfFrame(marker: number): boolean {
  return (
    (marker >= 0xc0 && marker <= 0xc3) ||
    (marker >= 0xc5 && marker <= 0xc7) ||
    (marker >= 0xc9 && marker <= 0xcb) ||
    (marker >= 0xcd && marker <= 0xcf)
  );
}

/** ICO stores a 256px dimension as 0; all other valid dimensions fit in one byte. */
export function icoDimensionByte(size: number): number {
  if (!Number.isInteger(size) || size < 1 || size > 256) throw new RangeError('ICO size must be 1–256');
  return size === 256 ? 0 : size;
}

/** Builds an ICO container around already-encoded PNG frames. No browser APIs required. */
export function buildIco(sizes: readonly number[], images: readonly Uint8Array[]): Uint8Array {
  if (sizes.length !== images.length) throw new Error('ICO entries do not match');
  const directoryLength = 6 + sizes.length * 16;
  const total = directoryLength + images.reduce((sum, image) => sum + image.length, 0);
  const result = new Uint8Array(total);
  const view = new DataView(result.buffer);
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, sizes.length, true);
  let offset = directoryLength;
  sizes.forEach((size, index) => {
    const start = 6 + index * 16;
    result[start] = icoDimensionByte(size);
    result[start + 1] = icoDimensionByte(size);
    result[start + 2] = 0;
    result[start + 3] = 0;
    view.setUint16(start + 4, 1, true);
    view.setUint16(start + 6, 32, true);
    view.setUint32(start + 8, images[index].length, true);
    view.setUint32(start + 12, offset, true);
    result.set(images[index], offset);
    offset += images[index].length;
  });
  return result;
}

/** Keeps a text favicon legible while respecting Unicode code points (not UTF-16 halves). */
export function monogram(value: string, maxCharacters = 2): string {
  return Array.from(value.trim()).slice(0, Math.max(1, maxCharacters)).join('') || 'B';
}

/** A manifest name is plain display text: collapse whitespace and cap accidental long pastes. */
export function siteName(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, 80) || 'My website';
}

export function manifestJson(name: string): string {
  return `${JSON.stringify(
    {
      name: siteName(name),
      short_name: siteName(name),
      icons: [
        { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  )}\n`;
}

export function installSnippet(): string {
  return [
    '<link rel="icon" href="/favicon.ico" sizes="any">',
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
    '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
    '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
    '<link rel="manifest" href="/site.webmanifest">',
  ].join('\n');
}
