import { describe, expect, it } from 'vitest';
import {
  DEFAULT_OPTIONS,
  MAX_CAPTION_LENGTH,
  normalizeCaption,
  normalizeOptions,
  outputName,
  presetDimensions,
  wrapCaption,
} from './logic';

describe('meme-generator logic', () => {
  it('keeps empty captions empty and supplies useful defaults', () => {
    expect(normalizeCaption('')).toBe('');
    expect(normalizeOptions({ topText: '', bottomText: '' })).toMatchObject({
      topText: '',
      bottomText: '',
      fontScale: DEFAULT_OPTIONS.fontScale,
    });
  });

  it('limits text by grapheme, without splitting emoji or Korean characters', () => {
    expect(normalizeCaption('👨‍👩‍👧‍👦'.repeat(MAX_CAPTION_LENGTH + 1))).toBe('👨‍👩‍👧‍👦'.repeat(MAX_CAPTION_LENGTH));
    expect(normalizeCaption('한글 밈\r\n만들기')).toBe('한글 밈\n만들기');
  });

  it('clamps invalid visual settings at the supported boundaries', () => {
    expect(normalizeOptions({ fontScale: 0 }).fontScale).toBe(4);
    expect(normalizeOptions({ fontScale: 100 }).fontScale).toBe(20);
    expect(normalizeOptions({ fontScale: Number.NaN }).fontScale).toBe(4);
  });

  it('wraps spaced text by words and CJK text by grapheme', () => {
    const measure = (line: string) => Array.from(line).length;
    expect(wrapCaption('make a meme quickly', 8, measure)).toEqual(['make a', 'meme', 'quickly']);
    expect(wrapCaption('한글밈만들기', 3, measure)).toEqual(['한글밈', '만들기']);
    expect(wrapCaption('top\nbottom', 20, measure)).toEqual(['top', 'bottom']);
  });

  it('uses stable blank canvas sizes and a safe PNG filename', () => {
    expect(presetDimensions('wide')).toEqual({ width: 1200, height: 675 });
    expect(presetDimensions('square')).toEqual({ width: 1080, height: 1080 });
    expect(outputName('my.photo.webp')).toBe('my.photo-meme.png');
    expect(outputName()).toBe('meme-meme.png');
  });
});
