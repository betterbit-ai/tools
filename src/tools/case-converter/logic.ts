/** Pure case-conversion logic. This module deliberately has no browser or UI APIs. */

export type CaseFormat =
  'upper' | 'lower' | 'sentence' | 'title-ap' | 'title-chicago' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant';

const AP_MINOR_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'but',
  'for',
  'nor',
  'or',
  'so',
  'yet',
  'as',
  'at',
  'by',
  'in',
  'of',
  'off',
  'on',
  'per',
  'to',
  'up',
  'via',
]);

const CHICAGO_MINOR_WORDS = new Set([
  ...AP_MINOR_WORDS,
  'about',
  'above',
  'across',
  'after',
  'against',
  'along',
  'alongside',
  'amid',
  'among',
  'around',
  'before',
  'behind',
  'below',
  'beneath',
  'beside',
  'between',
  'beyond',
  'despite',
  'down',
  'during',
  'except',
  'from',
  'inside',
  'into',
  'like',
  'near',
  'onto',
  'outside',
  'over',
  'past',
  'since',
  'through',
  'throughout',
  'toward',
  'under',
  'underneath',
  'until',
  'unto',
  'upon',
  'with',
  'within',
  'without',
]);

function capitalize(word: string): string {
  const lower = word.toLowerCase();
  return lower.replace(/^\p{L}/u, (letter) => letter.toUpperCase());
}

function titleCase(input: string, style: 'ap' | 'chicago'): string {
  const minorWords = style === 'ap' ? AP_MINOR_WORDS : CHICAGO_MINOR_WORDS;
  const words = Array.from(input.matchAll(/\p{L}[\p{L}\p{M}'’]*/gu));
  if (words.length === 0) return input;

  const first = words[0].index ?? 0;
  const last = words.at(-1)?.index ?? first;

  return input.replace(/\p{L}[\p{L}\p{M}'’]*/gu, (word, index) => {
    const normalized = word.toLowerCase();
    return index !== first && index !== last && minorWords.has(normalized) ? normalized : capitalize(word);
  });
}

function sentenceCase(input: string): string {
  const normalized = input.toLowerCase();
  return normalized.replace(
    /(^\s*|[.!?]+[\s"”’'»]*|(?:\r\n|\r|\n)+[ \t]*)(\p{L})/gu,
    (_match, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`,
  );
}

function identifierWords(input: string): string[] {
  return (
    input
      .replace(/(\p{Ll}|\p{Nd})(\p{Lu})/gu, '$1 $2')
      .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, '$1 $2')
      .match(/\p{L}[\p{L}\p{M}\p{N}]*|\p{N}+/gu)
      ?.map((word) => word.toLowerCase()) ?? []
  );
}

function identifierCase(
  input: string,
  format: Extract<CaseFormat, 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant'>,
): string {
  return input
    .split(/(\r\n|\r|\n)/)
    .map((line) => {
      if (/^(\r\n|\r|\n)$/.test(line)) return line;
      const words = identifierWords(line);
      if (format === 'camel') return words.map((word, index) => (index === 0 ? word : capitalize(word))).join('');
      if (format === 'pascal') return words.map(capitalize).join('');
      if (format === 'snake') return words.join('_');
      if (format === 'kebab') return words.join('-');
      return words.join('_').toUpperCase();
    })
    .join('');
}

/** Converts text while preserving punctuation and line endings where the selected format permits it. */
export function convertCase(input: string, format: CaseFormat): string {
  switch (format) {
    case 'upper':
      return input.toUpperCase();
    case 'lower':
      return input.toLowerCase();
    case 'sentence':
      return sentenceCase(input);
    case 'title-ap':
      return titleCase(input, 'ap');
    case 'title-chicago':
      return titleCase(input, 'chicago');
    case 'camel':
    case 'pascal':
    case 'snake':
    case 'kebab':
    case 'constant':
      return identifierCase(input, format);
  }
}
