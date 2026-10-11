/** Pure caption and export helpers for meme-generator. No DOM or Canvas here. */

export const MAX_CAPTION_LENGTH = 280;
export const MIN_FONT_SCALE = 4;
export const MAX_FONT_SCALE = 20;

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
    topText: normalizeCaption(value.topText ?? DEFAULT_OPTIONS.topText),
    bottomText: normalizeCaption(value.bottomText ?? DEFAULT_OPTIONS.bottomText),
    fontScale: clamp(value.fontScale ?? DEFAULT_OPTIONS.fontScale, MIN_FONT_SCALE, MAX_FONT_SCALE),
    allCaps: value.allCaps ?? DEFAULT_OPTIONS.allCaps,
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

export function outputName(inputName?: string): string {
  const stem = inputName?.replace(/\.[^.]+$/, '') || 'meme';
  return `${stem}-meme.png`;
}
