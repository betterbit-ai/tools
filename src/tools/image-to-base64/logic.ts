/** Pure logic for image-to-base64 — no DOM, no Preact. */

export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

export type OutputFormat = 'data-uri' | 'base64' | 'html' | 'css';

export interface ImageOutputOptions {
  format: OutputFormat;
  mimeType: string;
  base64: string;
  alt: string;
  cssClass: string;
}

const MIME_BY_EXTENSION: Record<string, string> = {
  avif: 'image/avif',
  bmp: 'image/bmp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  ico: 'image/x-icon',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  webp: 'image/webp',
};

/** Find a useful image MIME type even when a browser leaves File.type blank. */
export function imageMimeType(fileType: string, fileName: string): string | null {
  const type = fileType.trim().toLowerCase();
  if (type.startsWith('image/')) return type;
  const extension = fileName.trim().toLowerCase().split('.').at(-1) ?? '';
  return MIME_BY_EXTENSION[extension] ?? null;
}

/** A readable default for an HTML alt attribute, including Korean and emoji names. */
export function defaultAltText(fileName: string): string {
  const withoutPath = fileName.split(/[\\/]/).at(-1) ?? '';
  const withoutExtension = withoutPath.replace(/\.[^.]+$/, '');
  return withoutExtension.replace(/[-_]+/g, ' ').trim() || 'Image';
}

/** Base64 turns each complete group of three bytes into four ASCII characters. */
export function base64Length(byteLength: number): number {
  if (!Number.isFinite(byteLength) || byteLength <= 0) return 0;
  return 4 * Math.ceil(byteLength / 3);
}

export function base64IncreasePercent(byteLength: number): number {
  if (!Number.isFinite(byteLength) || byteLength <= 0) return 0;
  return ((base64Length(byteLength) - byteLength) / byteLength) * 100;
}

export function createDataUri(mimeType: string, base64: string): string {
  return `data:${mimeType};base64,${base64}`;
}

/** Escape a value placed inside a double-quoted HTML attribute. */
export function escapeHtmlAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Make a safe, predictable CSS class name from an optional human-friendly label. */
export function cssClassName(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/[_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!normalized) return 'image';
  return /^[0-9]/.test(normalized) ? `image-${normalized}` : normalized;
}

export function imageOutput(options: ImageOutputOptions): string {
  const dataUri = createDataUri(options.mimeType, options.base64);
  switch (options.format) {
    case 'base64':
      return options.base64;
    case 'html':
      return `<img src="${dataUri}" alt="${escapeHtmlAttribute(options.alt)}">`;
    case 'css':
      return `.${cssClassName(options.cssClass)} {\n  background-image: url("${dataUri}");\n}`;
    case 'data-uri':
      return dataUri;
  }
}
