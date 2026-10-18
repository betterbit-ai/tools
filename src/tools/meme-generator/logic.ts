/** Pure caption and export helpers for meme-generator. No DOM or Canvas here. */

export const MAX_CAPTION_LENGTH = 280;
export const MIN_FONT_SCALE = 4;
export const MAX_FONT_SCALE = 20;
/** Limits memory used by an exported canvas to roughly 64 MB of RGBA pixels. */
export const MAX_OUTPUT_PIXELS = 16_000_000;
/** Keeps the output within the maximum canvas dimension supported by common browsers. */
export const MAX_OUTPUT_DIMENSION = 8_192;
/** Keeps repeated live-preview redraws light while retaining a sharp 2× display-sized canvas. */
export const MAX_PREVIEW_PIXELS = 2_000_000;
export const MAX_PREVIEW_DIMENSION = 2_048;
export const MAX_IMAGE_FILE_BYTES = 20 * 1024 * 1024;

export type CanvasPreset = 'wide' | 'square';

export interface MemeOptions {
  topText: string;
  bottomText: string;
  fontScale: number;
  allCaps: boolean;
}

export const DEFAULT_OPTIONS: MemeOptions = {
  topText: 'WHEN YOU NEED A MEME',
  bottomText: 'IN TEN SECONDS',
  fontScale: 10,
  allCaps: true,
};

function graphemes(value: string): string[] {
  if ('Segmenter' in Intl) return Array.from(new Intl.Segmenter().segment(value), ({ segment }) => segment);
  return Array.from(value);
}

/** Limits each caption by grapheme cluster so emoji and combined Korean text are never split. */
export function normalizeCaption(value: string): string {
  return graphemes(value.replace(/\r\n?/g, '\n')).slice(0, MAX_CAPTION_LENGTH).join('');
}

export function clamp(value: number, min: number, max: number): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
}

export function normalizeOptions(value: Partial<MemeOptions>): MemeOptions {
  return {
    topText: normalizeCaption(typeof value.topText === 'string' ? value.topText : DEFAULT_OPTIONS.topText),
    bottomText: normalizeCaption(typeof value.bottomText === 'string' ? value.bottomText : DEFAULT_OPTIONS.bottomText),
    fontScale: clamp(
      typeof value.fontScale === 'number' ? value.fontScale : DEFAULT_OPTIONS.fontScale,
      MIN_FONT_SCALE,
      MAX_FONT_SCALE,
    ),
    allCaps: typeof value.allCaps === 'boolean' ? value.allCaps : DEFAULT_OPTIONS.allCaps,
  };
}

/**
 * Wraps a caption to a measured line width. Word boundaries are preferred for
 * spaced languages, while a single long word (including CJK text) wraps by
 * grapheme cluster. Explicit newlines always start a new line.
 */
export function wrapCaption(value: string, maxWidth: number, measure: (line: string) => number): string[] {
  const width = Math.max(1, maxWidth);
  const result: string[] = [];
  for (const paragraph of normalizeCaption(value).split('\n')) {
    if (!paragraph) {
      result.push('');
      continue;
    }
    const tokens = paragraph.split(/(\s+)/).filter(Boolean);
    let line = '';
    for (const token of tokens) {
      if (/^\s+$/.test(token)) {
        if (line && !line.endsWith(' ')) line += ' ';
        continue;
      }
      const candidate = line ? `${line}${line.endsWith(' ') ? '' : ' '}${token}` : token;
      if (measure(candidate) <= width) {
        line = candidate;
        continue;
      }
      if (line) result.push(line.trimEnd());
      line = '';
      for (const cluster of graphemes(token)) {
        const next = line + cluster;
        if (line && measure(next) > width) {
          result.push(line);
          line = cluster;
        } else {
          line = next;
        }
      }
    }
    if (line || !result.length) result.push(line.trimEnd());
  }
  return result;
}

export function presetDimensions(preset: CanvasPreset): { width: number; height: number } {
  return preset === 'square' ? { width: 1080, height: 1080 } : { width: 1200, height: 675 };
}

function constrainedDimensions(
  width: number,
  height: number,
  maxPixels: number,
  maxDimension: number,
): { width: number; height: number } {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new RangeError('Image dimensions must be positive finite numbers');
  }

  const scale = Math.min(1, Math.sqrt(maxPixels / (width * height)), maxDimension / width, maxDimension / height);
  return {
    width: Math.max(1, Math.floor(width * scale)),
    height: Math.max(1, Math.floor(height * scale)),
  };
}

/** Returns a canvas-safe export size while preserving the source image's aspect ratio. */
export function constrainedImageDimensions(width: number, height: number): { width: number; height: number } {
  return constrainedDimensions(width, height, MAX_OUTPUT_PIXELS, MAX_OUTPUT_DIMENSION);
}

/** Returns a bounded live-preview size without changing the separately rendered export. */
export function previewDimensions(width: number, height: number): { width: number; height: number } {
  return constrainedDimensions(width, height, MAX_PREVIEW_PIXELS, MAX_PREVIEW_DIMENSION);
}

export function isSupportedImageFileSize(size: number): boolean {
  return Number.isFinite(size) && size >= 0 && size <= MAX_IMAGE_FILE_BYTES;
}

export function outputName(inputName?: string): string {
  const stem = inputName?.replace(/\.[^.]+$/, '') || 'meme';
  return `${stem}-meme.png`;
}
