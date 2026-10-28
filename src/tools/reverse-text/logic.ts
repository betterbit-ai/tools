/** Pure text transformations for reverse-text. This module deliberately has no browser or UI APIs. */

export type ReverseMode = 'characters' | 'words' | 'each-word' | 'lines' | 'upside-down';

const UPSIDE_DOWN_MAP: Record<string, string> = {
  a: 'ɐ',
  b: 'q',
  c: 'ɔ',
  d: 'p',
  e: 'ǝ',
  f: 'ɟ',
  g: 'ƃ',
  h: 'ɥ',
  i: 'ᴉ',
  j: 'ɾ',
  k: 'ʞ',
  l: 'l',
  m: 'ɯ',
  n: 'u',
  o: 'o',
  p: 'd',
  q: 'b',
  r: 'ɹ',
  s: 's',
  t: 'ʇ',
  u: 'n',
  v: 'ʌ',
  w: 'ʍ',
  x: 'x',
  y: 'ʎ',
  z: 'z',
  A: '∀',
  B: '𐐒',
  C: 'Ɔ',
  D: '◖',
  E: 'Ǝ',
  F: 'Ⅎ',
  G: '⅁',
  H: 'H',
  I: 'I',
  J: 'ſ',
  K: '⋊',
  L: '˥',
  M: 'W',
  N: 'N',
  O: 'O',
  P: 'Ԁ',
  Q: 'Ό',
  R: 'ᴚ',
  S: 'S',
  T: '┴',
  U: '∩',
  V: 'Ʌ',
  W: 'M',
  X: 'X',
  Y: '⅄',
  Z: 'Z',
  '0': '0',
  '1': 'Ɩ',
  '2': 'ᄅ',
  '3': 'Ɛ',
  '4': 'ㄣ',
  '5': 'ϛ',
  '6': '9',
  '7': 'ㄥ',
  '8': '8',
  '9': '6',
  '.': '˙',
  ',': "'",
  "'": ',',
  '"': '„',
  '`': ',',
  '?': '¿',
  '!': '¡',
  '(': ')',
  ')': '(',
  '[': ']',
  ']': '[',
  '{': '}',
  '}': '{',
  '<': '>',
  '>': '<',
  _: '‾',
  ';': '؛',
  '∴': '∵',
};

/**
 * Splits by user-perceived characters instead of UTF-16 units. Intl.Segmenter handles
 * joined emoji, flags, and combining marks; the fallback keeps surrogate pairs intact.
 */
export function splitGraphemes(input: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    return Array.from(
      new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(input),
      ({ segment }) => segment,
    );
  }
  return Array.from(input);
}

/** Reverses a string without splitting visible Unicode characters. */
export function reverseCharacters(input: string): string {
  return splitGraphemes(input).reverse().join('');
}

/** Reverses non-whitespace terms within each line while retaining all original separators. */
export function reverseWords(input: string): string {
  return input
    .split(/(\r\n|\r|\n)/)
    .map((part) => {
      if (/^(\r\n|\r|\n)$/u.test(part)) return part;
      const words = part.match(/\S+/gu) ?? [];
      return part.replace(/\S+/gu, () => words.pop() ?? '');
    })
    .join('');
}

/** Reverses every non-whitespace term but leaves the order of terms and whitespace intact. */
export function reverseEachWord(input: string): string {
  return input.replace(/\S+/gu, (word) => reverseCharacters(word));
}

/** Reverses line order while preserving the line-ending style and a final line ending. */
export function reverseLines(input: string): string {
  const finalEnding = input.match(/(\r\n|\r|\n)$/u)?.[0] ?? '';
  const body = finalEnding ? input.slice(0, -finalEnding.length) : input;
  const endings = body.match(/\r\n|\r|\n/gu) ?? [];
  const lines = body.split(/\r\n|\r|\n/u).reverse();
  return `${lines.map((line, index) => `${line}${endings[index] ?? ''}`).join('')}${finalEnding}`;
}

/**
 * Produces an approximate Unicode upside-down effect. Only Latin letters, digits, and
 * selected punctuation have visual counterparts; every other character remains intact.
 */
export function upsideDown(input: string): string {
  return splitGraphemes(input)
    .reverse()
    .map((grapheme) => Array.from(grapheme, (character) => UPSIDE_DOWN_MAP[character] ?? character).join(''))
    .join('');
}

/** Applies the selected reversal without changing the source text. */
export function reverseText(input: string, mode: ReverseMode): string {
  switch (mode) {
    case 'characters':
      return reverseCharacters(input);
    case 'words':
      return reverseWords(input);
    case 'each-word':
      return reverseEachWord(input);
    case 'lines':
      return reverseLines(input);
    case 'upside-down':
      return upsideDown(input);
  }
}

export function textStats(input: string): { graphemes: number; words: number; lines: number } {
  return {
    graphemes: splitGraphemes(input).length,
    words: input.match(/\S+/gu)?.length ?? 0,
    lines: input === '' ? 0 : input.split(/\r\n|\r|\n/u).length,
  };
}
