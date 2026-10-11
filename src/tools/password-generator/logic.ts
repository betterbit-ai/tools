/** Pure password-generation logic. The browser provides the random source. */

export const MIN_PASSWORD_LENGTH = 4;
export const MAX_PASSWORD_LENGTH = 128;
export const MIN_WORD_COUNT = 2;
export const MAX_WORD_COUNT = 12;

const UINT32_RANGE = 0x1_0000_0000;
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*_-+=?';
const AMBIGUOUS = 'Il1O0o';

/** A fixed, readable word list: each selection contributes exactly 7 bits. */
export const WORDS = [
  'amber',
  'anchor',
  'apple',
  'apricot',
  'arctic',
  'artist',
  'autumn',
  'bamboo',
  'beacon',
  'birch',
  'bison',
  'blossom',
  'bluebird',
  'brook',
  'cactus',
  'candle',
  'canyon',
  'cedar',
  'comet',
  'coral',
  'cricket',
  'crystal',
  'dawn',
  'desert',
  'drift',
  'eagle',
  'ember',
  'falcon',
  'fern',
  'field',
  'firefly',
  'forest',
  'frost',
  'garden',
  'glacier',
  'grove',
  'harbor',
  'hazel',
  'heather',
  'horizon',
  'island',
  'jasmine',
  'juniper',
  'lantern',
  'lark',
  'laurel',
  'leaf',
  'lemon',
  'lilac',
  'maple',
  'meadow',
  'meteor',
  'mist',
  'moon',
  'morning',
  'moss',
  'mountain',
  'nebula',
  'night',
  'oak',
  'ocean',
  'olive',
  'opal',
  'orchid',
  'otter',
  'owl',
  'paper',
  'pebble',
  'pepper',
  'pine',
  'planet',
  'plum',
  'prairie',
  'quartz',
  'rain',
  'raven',
  'reef',
  'river',
  'robin',
  'saffron',
  'sage',
  'sand',
  'shadow',
  'silver',
  'sky',
  'snow',
  'solar',
  'sparrow',
  'spring',
  'star',
  'stone',
  'summer',
  'sunset',
  'thistle',
  'thunder',
  'tidal',
  'trail',
  'tulip',
  'valley',
  'velvet',
  'violet',
  'walnut',
  'water',
  'willow',
  'wind',
  'winter',
  'wren',
  'zephyr',
  'acorn',
  'badger',
  'bay',
  'cinder',
  'clover',
  'dolphin',
  'elm',
  'feather',
  'finch',
  'golden',
  'ivy',
  'kingfisher',
  'lotus',
  'marble',
  'north',
  'poppy',
  'ripple',
  'rose',
  'sequoia',
  'whisper',
] as const;

export type PasswordMode = 'password' | 'passphrase';
export type RandomSource = () => number;

export interface PasswordSettings {
  mode: PasswordMode;
  length: number;
  wordCount: number;
  separator: string;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export type ValidationError = 'invalid-length' | 'invalid-word-count' | 'no-character-set' | 'length-too-short';

export function validateSettings(settings: PasswordSettings): ValidationError | null {
  if (
    !Number.isInteger(settings.length) ||
    settings.length < MIN_PASSWORD_LENGTH ||
    settings.length > MAX_PASSWORD_LENGTH
  ) {
    return 'invalid-length';
  }
  if (
    !Number.isInteger(settings.wordCount) ||
    settings.wordCount < MIN_WORD_COUNT ||
    settings.wordCount > MAX_WORD_COUNT
  ) {
    return 'invalid-word-count';
  }
  if (settings.mode === 'passphrase') return null;
  const sets = characterSets(settings);
  if (sets.length === 0) return 'no-character-set';
  if (settings.mode === 'password' && settings.length < sets.length) return 'length-too-short';
  return null;
}

export function characterSets(
  settings: Pick<PasswordSettings, 'uppercase' | 'lowercase' | 'numbers' | 'symbols' | 'excludeAmbiguous'>,
): string[] {
  const stripAmbiguous = (value: string) =>
    settings.excludeAmbiguous ? [...value].filter((character) => !AMBIGUOUS.includes(character)).join('') : value;
  return [
    settings.uppercase ? stripAmbiguous(UPPERCASE) : '',
    settings.lowercase ? stripAmbiguous(LOWERCASE) : '',
    settings.numbers ? stripAmbiguous(NUMBERS) : '',
    settings.symbols ? SYMBOLS : '',
  ].filter(Boolean);
}

/** Returns a uniformly selected index without modulo bias. */
export function randomIndex(size: number, source: RandomSource): number {
  if (!Number.isInteger(size) || size < 1 || size > UINT32_RANGE)
    throw new RangeError('Expected a size from 1 to 2³².');
  const limit = Math.floor(UINT32_RANGE / size) * size;
  let value: number;
  do {
    value = source();
    if (!Number.isInteger(value) || value < 0 || value >= UINT32_RANGE) {
      throw new RangeError('Random source must return an unsigned 32-bit integer.');
    }
  } while (value >= limit);
  return value % size;
}

export function generatePassword(settings: PasswordSettings, source: RandomSource): string {
  const error = validateSettings(settings);
  if (error) throw new RangeError(error);
  if (settings.mode === 'passphrase') return generatePassphrase(settings.wordCount, settings.separator, source);

  const sets = characterSets(settings);
  const alphabet = sets.join('');
  // Rejection sampling makes every eligible string equally likely while ensuring
  // that every enabled character category really appears in the result.
  for (;;) {
    const value = Array.from({ length: settings.length }, () => alphabet[randomIndex(alphabet.length, source)]).join(
      '',
    );
    if (sets.every((set) => [...value].some((character) => set.includes(character)))) return value;
  }
}

export function generatePassphrase(wordCount: number, separator: string, source: RandomSource): string {
  if (!Number.isInteger(wordCount) || wordCount < MIN_WORD_COUNT || wordCount > MAX_WORD_COUNT) {
    throw new RangeError('invalid-word-count');
  }
  return Array.from({ length: wordCount }, () => WORDS[randomIndex(WORDS.length, source)]).join(separator);
}

/** Exact entropy for this generator's uniformly sampled result space, in bits. */
export function entropyBits(settings: PasswordSettings): number {
  if (settings.mode === 'passphrase') return settings.wordCount * Math.log2(WORDS.length);
  const sets = characterSets(settings);
  if (!sets.length || settings.length < sets.length) return 0;

  const alphabetLength = sets.join('').length;
  let validPossibilities = 0;
  for (let mask = 0; mask < 1 << sets.length; mask++) {
    let removed = 0;
    let bits = 0;
    for (let index = 0; index < sets.length; index++) {
      if (mask & (1 << index)) {
        removed += sets[index]?.length ?? 0;
        bits++;
      }
    }
    const term = Math.pow(alphabetLength - removed, settings.length);
    validPossibilities += bits % 2 === 0 ? term : -term;
  }
  return Math.log2(validPossibilities);
}

/** Counts Unicode code points (not UTF-16 code units) for display and tests. */
export function characterCount(value: string): number {
  return Array.from(value).length;
}
