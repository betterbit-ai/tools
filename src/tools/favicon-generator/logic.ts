/** Pure favicon package details. Canvas rendering and downloads live in render.ts. */

export const ICO_SIZES = [16, 32, 48] as const;
export const PNG_SIZES = [16, 32, 48, 180, 192, 512] as const;

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
