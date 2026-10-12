import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  estimatedSpeechSeconds,
  isEditableElement,
  normalizeSettings,
  normalizeSpeechText,
  splitSpeechText,
} from './logic';

describe('text-to-speech helpers', () => {
  it('normalizes whitespace without changing Korean, CJK, or emoji', () => {
    expect(normalizeSpeechText('  안녕\n世界  👨‍👩‍👧‍👦  ')).toBe('안녕 世界 👨‍👩‍👧‍👦');
  });

  it('splits long text on sentence boundaries before using a hard limit', () => {
    expect(splitSpeechText('One. Two! Three?', 10)).toEqual(['One. Two!', 'Three?']);
    expect(splitSpeechText('')).toEqual([]);
  });

  it('keeps Unicode grapheme clusters intact while splitting a long token', () => {
    const chunks = splitSpeechText('👨‍👩‍👧‍👦'.repeat(5), 2);
    expect(chunks).toEqual(['👨‍👩‍👧‍👦👨‍👩‍👧‍👦', '👨‍👩‍👧‍👦👨‍👩‍👧‍👦', '👨‍👩‍👧‍👦']);
  });

  it('handles a large input without dropping or reordering words', () => {
    const text = 'word '.repeat(50_000).trim();
    expect(splitSpeechText(text).join(' ')).toBe(text);
  });

  it('clamps malformed settings to the advertised ranges', () => {
    expect(normalizeSettings({ rate: 20, pitch: -1, volume: Number.NaN, voiceURI: 'local' })).toEqual({
      voiceURI: 'local',
      rate: 2,
      pitch: 0.5,
      volume: 1,
    });
    expect(normalizeSettings({})).toEqual(DEFAULT_SETTINGS);
  });

  it('estimates duration from words and rate', () => {
    expect(estimatedSpeechSeconds('', 1)).toBe(0);
    expect(estimatedSpeechSeconds('one two three four five', 1)).toBe(2);
    expect(estimatedSpeechSeconds('one two three four five', 2)).toBe(1);
  });

  it('does not claim the playback shortcut from editable controls', () => {
    expect(isEditableElement('textarea')).toBe(true);
    expect(isEditableElement('div', true)).toBe(true);
    expect(isEditableElement('button')).toBe(false);
  });
});
