/** Pure, browser-independent rules for image OCR. */

export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 24_000_000;

export type OcrLanguage = 'eng' | 'kor' | 'eng+kor';

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|bmp)$/i;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/bmp']);

/** Accepts common browser-decodable raster images, even when a picker omits their MIME type. */
export function isSupportedImage(fileName: string, mimeType: string): boolean {
  const mediaType = mimeType.trim().toLowerCase().split(';', 1)[0];
  return IMAGE_TYPES.has(mediaType) || IMAGE_EXTENSIONS.test(fileName.trim());
}

export function fileExceedsLimit(bytes: number): boolean {
  return !Number.isFinite(bytes) || bytes < 1 || bytes > MAX_IMAGE_BYTES;
}

export function imageExceedsPixelLimit(width: number, height: number): boolean {
  return (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width * height > MAX_IMAGE_PIXELS
  );
}

/** Keeps OCR line breaks while removing the engine's trailing blank lines. */
export function normalizeOcrText(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

/** Counts Unicode code points so a Hangul syllable or emoji is one visible character. */
export function characterCount(text: string): number {
  return Array.from(text).length;
}

/** Turns an input image name into a safe, Unicode-preserving TXT filename. */
export function extractedTextFileName(fileName: string): string {
  const base =
    fileName
      .trim()
      .replace(/[\\/\0]/g, '_')
      .replace(/\.(jpe?g|png|webp|bmp)$/i, '') || 'image-text';
  return `${base}.txt`;
}
