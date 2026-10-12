/** Pure transcript helpers. Browser recognition lives in recognition.ts. */

const WHITESPACE = /\s+/gu;
const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
const words = new Intl.Segmenter(undefined, { granularity: 'word' });

/** Turns a recognition result into one readable phrase without changing Unicode text. */
export function normalizeTranscript(value: string): string {
  return value.trim().replace(WHITESPACE, ' ');
}

/** Adds a finalized recognition phrase without running words together. */
export function appendTranscript(existing: string, addition: string): string {
  const next = normalizeTranscript(addition);
  if (!next) return existing;
  if (!existing) return next;
  return /\s$/u.test(existing) ? `${existing}${next}` : `${existing} ${next}`;
}

/** Counts user-perceived characters and Unicode word-like segments. */
export function transcriptStats(text: string): { characters: number; words: number } {
  let characters = 0;
  let wordCount = 0;
  for (const _ of graphemes.segment(text)) characters++;
  for (const segment of words.segment(text)) if (segment.isWordLike) wordCount++;
  return { characters, words: wordCount };
}

/** Keeps global shortcuts from firing while someone is editing text. */
export function isEditableElement(tagName: string, contentEditable = false): boolean {
  return contentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName.toUpperCase());
}

/** Browser Web Speech API error codes mapped to translatable UI keys. */
export function recognitionErrorKey(code: string): 'permission' | 'no-speech' | 'language' | 'generic' {
  if (code === 'not-allowed' || code === 'service-not-allowed') return 'permission';
  if (code === 'no-speech' || code === 'audio-capture') return 'no-speech';
  if (code === 'language-not-supported') return 'language';
  return 'generic';
}
