/** Pure text and settings helpers. Browser speech synthesis lives in speech.ts. */

const DEFAULT_RATE = 1;
const MIN_RATE = 0.5;
const MAX_RATE = 2;
const MIN_PITCH = 0.5;
const MAX_PITCH = 2;
const MIN_VOLUME = 0;
const MAX_VOLUME = 1;
const WHITESPACE = /\s+/gu;
const SENTENCE = /[^.!?。！？…]+[.!?。！？…]*|[.!?。！？…]+/gu;
const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
const words = new Intl.Segmenter(undefined, { granularity: 'word' });

export interface SpeechSettings {
  voiceURI: string;
  rate: number;
  pitch: number;
  volume: number;
}

export const DEFAULT_SETTINGS: SpeechSettings = {
  voiceURI: '',
  rate: DEFAULT_RATE,
  pitch: 1,
  volume: 1,
};

/** Collapses spacing while retaining every spoken Unicode character. */
export function normalizeSpeechText(text: string): string {
  return text.trim().replace(WHITESPACE, ' ');
}

/** Keeps settings within the intentionally simple controls exposed in the UI. */
export function normalizeSettings(settings: Partial<SpeechSettings>): SpeechSettings {
  return {
    voiceURI: typeof settings.voiceURI === 'string' ? settings.voiceURI : DEFAULT_SETTINGS.voiceURI,
    rate: clampNumber(settings.rate, MIN_RATE, MAX_RATE, DEFAULT_SETTINGS.rate),
    pitch: clampNumber(settings.pitch, MIN_PITCH, MAX_PITCH, DEFAULT_SETTINGS.pitch),
    volume: clampNumber(settings.volume, MIN_VOLUME, MAX_VOLUME, DEFAULT_SETTINGS.volume),
  };
}

/**
 * Divides lengthy text into short, sentence-first chunks. Each chunk stays at
 * or below `maxLength` grapheme clusters, so emoji sequences are never split.
 */
export function splitSpeechText(text: string, maxLength = 220): string[] {
  const normalized = normalizeSpeechText(text);
  if (!normalized) return [];
  const limit = Math.max(1, Math.floor(maxLength));
  const sentences = normalized.match(SENTENCE) ?? [normalized];
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const next = sentence.trim();
    if (!next) continue;
    if (graphemeLength(next) > limit) {
      if (current) chunks.push(current);
      current = '';
      chunks.push(...splitLongChunk(next, limit));
      continue;
    }
    const combined = current ? `${current} ${next}` : next;
    if (graphemeLength(combined) > limit && current) {
      chunks.push(current);
      current = next;
    } else {
      current = combined;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/** An approximate duration that updates when speaking speed changes. */
export function estimatedSpeechSeconds(text: string, rate: number): number {
  const wordCount = [...words.segment(normalizeSpeechText(text))].filter((segment) => segment.isWordLike).length;
  if (!wordCount) return 0;
  return Math.ceil((wordCount / 2.5 / clampNumber(rate, MIN_RATE, MAX_RATE, DEFAULT_RATE)) * 10) / 10;
}

/** Keeps global shortcuts out of editable controls. */
export function isEditableElement(tagName: string, contentEditable = false): boolean {
  return contentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName.toUpperCase());
}

function splitLongChunk(value: string, maxLength: number): string[] {
  const output: string[] = [];
  let current = '';
  for (const word of value.split(' ')) {
    const combined = current ? `${current} ${word}` : word;
    if (graphemeLength(combined) <= maxLength) {
      current = combined;
      continue;
    }
    if (current) output.push(current);
    if (graphemeLength(word) <= maxLength) {
      current = word;
      continue;
    }
    const pieces = splitGraphemes(word, maxLength);
    output.push(...pieces.slice(0, -1));
    current = pieces.at(-1) ?? '';
  }
  if (current) output.push(current);
  return output;
}

function splitGraphemes(value: string, maxLength: number): string[] {
  const output: string[] = [];
  let current = '';
  for (const { segment } of graphemes.segment(value)) {
    if (graphemeLength(current) === maxLength) {
      output.push(current);
      current = '';
    }
    current += segment;
  }
  if (current) output.push(current);
  return output;
}

function graphemeLength(value: string): number {
  return [...graphemes.segment(value)].length;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}
