import { describe, expect, it } from 'vitest';
import {
  appendTranscript,
  isEditableElement,
  normalizeTranscript,
  recognitionErrorKey,
  transcriptStats,
} from './logic';

describe('speech-to-text transcript helpers', () => {
  it('normalizes recognition whitespace without changing Korean, CJK, or emoji', () => {
    expect(normalizeTranscript('  안녕\n世界  👋🏽  ')).toBe('안녕 世界 👋🏽');
  });

  it('appends final phrases with exactly one separating space', () => {
    expect(appendTranscript('Hello', ' world')).toBe('Hello world');
    expect(appendTranscript('Hello ', 'world')).toBe('Hello world');
    expect(appendTranscript('', '  시작  ')).toBe('시작');
    expect(appendTranscript('Keep this', '   ')).toBe('Keep this');
  });

  it('counts grapheme clusters and Unicode words', () => {
    expect(transcriptStats('')).toEqual({ characters: 0, words: 0 });
    expect(transcriptStats('가족 👨‍👩‍👧‍👦 東京')).toEqual({ characters: 7, words: 2 });
  });

  it('handles a large transcript without truncating it', () => {
    const text = 'word '.repeat(100_000);
    expect(appendTranscript(text, 'done').endsWith('done')).toBe(true);
    expect(transcriptStats(text).words).toBe(100_000);
  });

  it('does not run the recording shortcut inside editable controls', () => {
    expect(isEditableElement('textarea')).toBe(true);
    expect(isEditableElement('DIV', true)).toBe(true);
    expect(isEditableElement('BUTTON')).toBe(false);
  });

  it('maps Web Speech API errors to actionable states', () => {
    expect(recognitionErrorKey('not-allowed')).toBe('permission');
    expect(recognitionErrorKey('no-speech')).toBe('no-speech');
    expect(recognitionErrorKey('language-not-supported')).toBe('language');
    expect(recognitionErrorKey('network')).toBe('generic');
  });
});
