/**
 * Text statistics. Pure functions — no DOM. Uses Intl.Segmenter so word counts
 * are correct for languages without spaces (Chinese, Japanese, Thai).
 */

export interface TextStats {
  /** User-perceived characters (grapheme clusters), incl. whitespace. */
  characters: number;
  /** Characters excluding all whitespace (spaces, tabs, line breaks). */
  charactersNoSpaces: number;
  /** Characters excluding line breaks only (spaces still counted). */
  charactersNoLineBreaks: number;
  words: number;
  sentences: number;
  /** Non-empty lines. */
  paragraphs: number;
  /** UTF-8 encoded size. */
  bytesUtf8: number;
  /** Legacy 2-byte count used by many Korean forms: ASCII = 1, others = 2, line break = 2 (CRLF). */
  bytesLegacy: number;
  /** X's weighted length (twitter-text v3): most Latin = 1, Hangul/CJK/emoji = 2, URLs = 23. */
  xWeightedLength: number;
  /** Seconds. */
  readingSeconds: number;
  speakingSeconds: number;
}

export type LimitMetric = 'characters' | 'charactersNoSpaces' | 'bytesLegacy' | 'bytesUtf8' | 'xWeightedLength';

/** Silent reading of non-fiction, adults: 238 wpm (Brysbaert, 2019). */
export const READING_WPM = 238;
/** Typical presentation pace. */
export const SPEAKING_WPM = 150;
/** Chinese/Japanese reading speed in characters per minute (Trauzettel-Klosinski et al., 2012: zh 255, ja 357). */
export const READING_CJK_CPM = 300;
export const SPEAKING_CJK_CPM = 200;

const IDEOGRAPHIC = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
const WHITESPACE = /\s/u;
const LINE_BREAK = /^(?:\r\n|[\n\r\u0085\u2028\u2029])$/u;
const LINE_BREAKS = /\r\n|[\n\r\u0085\u2028\u2029]/u;

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
const wordsSeg = new Intl.Segmenter(undefined, { granularity: 'word' });
const sentencesSeg = new Intl.Segmenter(undefined, { granularity: 'sentence' });
const URL = /https?:\/\/[^\s]+/giu;
const EMOJI = /\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20e3/u;

/**
 * X's public twitter-text v3 weights. Emoji clusters count as one weighted character and web URLs
 * count as 23. This intentionally mirrors the published configuration without shipping the much
 * larger entity/linking library.
 * Source: https://github.com/twitter/twitter-text/blob/master/config/v3.json
 */
export function countXWeightedLength(input: string): number {
  const text = input.normalize('NFC');
  let total = 0;
  let cursor = 0;

  const countText = (part: string) => {
    for (const { segment } of graphemes.segment(part)) {
      if (EMOJI.test(segment)) {
        total += 2;
        continue;
      }
      for (const character of segment) {
        const codePoint = character.codePointAt(0)!;
        total +=
          codePoint <= 4351 ||
          (codePoint >= 8192 && codePoint <= 8205) ||
          (codePoint >= 8208 && codePoint <= 8223) ||
          (codePoint >= 8242 && codePoint <= 8247)
            ? 1
            : 2;
      }
    }
  };

  for (const match of text.matchAll(URL)) {
    countText(text.slice(cursor, match.index));
    total += 23;
    cursor = match.index + match[0].length;
  }
  countText(text.slice(cursor));
  return total;
}

export function analyze(text: string): TextStats {
  let characters = 0;
  let charactersNoSpaces = 0;
  let lineBreaks = 0;
  let bytesLegacy = 0;
  let ideographs = 0;

  for (const { segment } of graphemes.segment(text)) {
    characters++;
    if (LINE_BREAK.test(segment)) {
      lineBreaks++;
      bytesLegacy += 2;
      continue;
    }
    if (!WHITESPACE.test(segment)) charactersNoSpaces++;
    if (IDEOGRAPHIC.test(segment)) ideographs++;
    bytesLegacy += segment.length === 1 && segment.charCodeAt(0) < 0x80 ? 1 : 2;
  }

  let words = 0;
  let ideographicWords = 0;
  for (const s of wordsSeg.segment(text)) {
    if (!s.isWordLike) continue;
    words++;
    if (IDEOGRAPHIC.test(s.segment)) ideographicWords++;
  }

  let sentences = 0;
  for (const s of sentencesSeg.segment(text)) if (s.segment.trim()) sentences++;

  const paragraphs = text.split(LINE_BREAKS).filter((line) => line.trim()).length;

  // Time: spaced-language words at WPM + ideographic characters at CPM.
  const spacedWords = words - ideographicWords;
  const readingSeconds = (spacedWords / READING_WPM) * 60 + (ideographs / READING_CJK_CPM) * 60;
  const speakingSeconds = (spacedWords / SPEAKING_WPM) * 60 + (ideographs / SPEAKING_CJK_CPM) * 60;

  return {
    characters,
    charactersNoSpaces,
    charactersNoLineBreaks: characters - lineBreaks,
    words,
    sentences,
    paragraphs,
    bytesUtf8: new TextEncoder().encode(text).length,
    bytesLegacy,
    xWeightedLength: countXWeightedLength(text),
    readingSeconds: Math.round(readingSeconds),
    speakingSeconds: Math.round(speakingSeconds),
  };
}

export function countByMetric(text: string, metric: LimitMetric): number {
  return analyze(text)[metric];
}

/** Build-time helper for variant snippets; uses the same counter as the live tool. */
export function fitRepeatedText(
  limit: number,
  character: string,
  metric: LimitMetric,
): { characters: number; used: number; remaining: number } {
  let low = 0;
  let high = Math.max(1, limit + 1);
  while (low + 1 < high) {
    const middle = Math.floor((low + high) / 2);
    if (countByMetric(character.repeat(middle), metric) <= limit) low = middle;
    else high = middle;
  }
  const used = countByMetric(character.repeat(low), metric);
  return { characters: low, used, remaining: limit - used };
}

const STOPWORDS = new Set(
  'a an the and or but if of to in on at by for with from as is are was were be been it its this that these those i you he she we they not no so do does did have has had will would can could'.split(
    ' ',
  ),
);

/** Most frequent words (≥ 2 chars, English stopwords removed). */
export function topKeywords(text: string, limit = 5): { word: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const s of wordsSeg.segment(text.toLowerCase())) {
    if (!s.isWordLike) continue;
    const w = s.segment;
    if ([...w].length < 2 || STOPWORDS.has(w) || /^\d+$/.test(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, c]) => c > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

/** 75 -> "1m 15s" style parts, for UI formatting. */
export function splitDuration(seconds: number): { m: number; s: number } {
  return { m: Math.floor(seconds / 60), s: seconds % 60 };
}
