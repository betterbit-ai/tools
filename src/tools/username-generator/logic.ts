/**
 * Pure username generation for username-generator — no DOM, no Preact.
 * The word lists and the combination rules live here so the same seed always produces the
 * same batch, which is what the tests (and a re-generated list) rely on.
 */

export type Style = 'adjective-noun' | 'word-number' | 'ko-modifier-noun' | 'ko-noun-tail';
export type Separator = '' | '_' | '.' | '-';
export type PlatformId = 'any' | 'instagram' | 'x' | 'tiktok' | 'discord' | 'github';

export const SEPARATORS: Separator[] = ['', '_', '.', '-'];

export interface UsernameOptions {
  style: Style;
  /** How many names to return (clamped to 1–60). */
  count: number;
  /** Hard limit on the finished name, in characters. 0 or less means no limit. */
  maxLength: number;
  separator: Separator;
  /** Digits appended to word-based styles; 0 appends none. */
  digits: number;
  /** Word the user wants inside every result. */
  keyword: string;
  /** Drop names that contain look-alike characters (l, I, 1, O, 0). */
  avoidLookalike: boolean;
}

export const DEFAULT_OPTIONS: UsernameOptions = {
  style: 'adjective-noun',
  count: 12,
  maxLength: 20,
  separator: '',
  digits: 0,
  keyword: '',
  avoidLookalike: false,
};

/** Character limits and separators documented by the platforms, for the preset picker. */
export const PLATFORM_PRESETS: { id: PlatformId; maxLength: number | null; separators: Separator[] }[] = [
  { id: 'any', maxLength: null, separators: ['', '_', '.', '-'] },
  { id: 'instagram', maxLength: 30, separators: ['', '_', '.'] },
  { id: 'x', maxLength: 15, separators: ['', '_'] },
  { id: 'tiktok', maxLength: 24, separators: ['', '_', '.'] },
  { id: 'discord', maxLength: 32, separators: ['', '_', '.'] },
  { id: 'github', maxLength: 39, separators: ['', '-'] },
];

export const LOOKALIKE_CHARS = ['l', 'I', '1', 'O', '0'];

export const ENGLISH_ADJECTIVES = [
  'quiet',
  'brave',
  'silver',
  'amber',
  'rapid',
  'clever',
  'gentle',
  'wild',
  'bright',
  'hidden',
  'lucky',
  'midnight',
  'crimson',
  'polar',
  'solar',
  'nimble',
  'cosmic',
  'rustic',
  'urban',
  'velvet',
  'electric',
  'frozen',
  'golden',
  'hollow',
  'ivory',
  'jade',
  'lunar',
  'misty',
  'noble',
  'opal',
  'pixel',
  'royal',
  'sable',
  'tidal',
  'vivid',
  'wandering',
  'zesty',
  'copper',
  'dusky',
  'ember',
];

export const ENGLISH_NOUNS = [
  'falcon',
  'otter',
  'comet',
  'harbor',
  'maple',
  'lantern',
  'cactus',
  'panda',
  'rocket',
  'willow',
  'badger',
  'cedar',
  'dolphin',
  'ember',
  'fern',
  'garnet',
  'hazel',
  'iris',
  'jasper',
  'kestrel',
  'lynx',
  'mango',
  'nebula',
  'orchid',
  'pebble',
  'quartz',
  'raven',
  'saffron',
  'tiger',
  'umber',
  'viola',
  'walnut',
  'yarrow',
  'zephyr',
  'anchor',
  'beacon',
  'cobalt',
  'dune',
  'echo',
  'forge',
];

export const KOREAN_MODIFIERS = [
  '말랑한',
  '포근한',
  '졸린',
  '반짝이는',
  '조용한',
  '느긋한',
  '씩씩한',
  '수줍은',
  '새벽의',
  '여름의',
  '겨울의',
  '은빛',
  '푸른',
  '붉은',
  '하얀',
  '작은',
  '커다란',
  '재빠른',
  '엉뚱한',
  '다정한',
  '배고픈',
  '신난',
  '차분한',
  '몽글몽글한',
  '반듯한',
  '말간',
  '깊은',
  '가벼운',
  '따뜻한',
  '서늘한',
];

export const KOREAN_TAILS = ['장인', '요정', '대장', '고수', '탐험가', '수집가', '친구', '박사', '기사', '선장'];

export const KOREAN_NOUNS = [
  '감자',
  '고양이',
  '수달',
  '펭귄',
  '호떡',
  '붕어빵',
  '만두',
  '토끼',
  '판다',
  '다람쥐',
  '별빛',
  '바다',
  '구름',
  '민들레',
  '단풍',
  '눈송이',
  '모래',
  '자갈',
  '호수',
  '숲길',
  '연필',
  '도토리',
  '감귤',
  '복숭아',
  '자두',
  '밤송이',
  '솜사탕',
  '푸딩',
  '젤리',
  '라면',
];

/** Small deterministic PRNG so a batch can be reproduced from its seed. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(list: readonly T[], random: () => number): T {
  return list[Math.floor(random() * list.length) % list.length];
}

const ALLOWED_KEYWORD = /[^\p{L}\p{N}]/gu;

/** Keeps letters and digits only, so a pasted "Lee Ji-hoon" does not break a handle. */
export function normalizeKeyword(input: string): string {
  return (input ?? '').normalize('NFC').replace(ALLOWED_KEYWORD, '').slice(0, 20);
}

/** True when the keyword can be written in the script of the chosen style. */
export function keywordFitsStyle(keyword: string, style: Style): boolean {
  if (!keyword) return true;
  const korean = /[\u3131-\u318e\uac00-\ud7a3]/.test(keyword);
  return style.startsWith('ko-') ? true : !korean;
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function withDigits(base: string, digits: number, random: () => number): string {
  if (digits <= 0) return base;
  let out = '';
  for (let i = 0; i < digits; i += 1) out += String(Math.floor(random() * 10));
  return `${base}${out}`;
}

function join(parts: string[], separator: Separator): string {
  return parts.filter(Boolean).join(separator);
}

function hasLookalike(value: string): boolean {
  return LOOKALIKE_CHARS.some((char) => value.includes(char));
}

/** One candidate from the chosen style, before length filtering. */
export function composeUsername(options: UsernameOptions, random: () => number): string {
  const keyword = normalizeKeyword(options.keyword);
  const digits = Math.max(0, Math.min(4, Math.floor(options.digits)));
  switch (options.style) {
    case 'adjective-noun': {
      const adjective = capitalize(pick(ENGLISH_ADJECTIVES, random));
      const noun = capitalize(pick(ENGLISH_NOUNS, random));
      const base = join([adjective, keyword ? capitalize(keyword) : noun], options.separator);
      return withDigits(base, digits, random);
    }
    case 'word-number': {
      const noun = pick(ENGLISH_NOUNS, random);
      const head = join([keyword || noun, pick(ENGLISH_ADJECTIVES, random)], options.separator);
      // The style always ends with a number, even when the digits option is 0.
      return withDigits(head.toLowerCase(), Math.max(2, digits), random);
    }
    case 'ko-modifier-noun': {
      const modifier = pick(KOREAN_MODIFIERS, random);
      const noun = keyword || pick(KOREAN_NOUNS, random);
      return withDigits(join([modifier, noun], options.separator), digits, random);
    }
    case 'ko-noun-tail': {
      const noun = keyword || pick(KOREAN_NOUNS, random);
      const tail = pick(KOREAN_TAILS, random);
      return withDigits(join([noun, tail], options.separator), digits, random);
    }
    default:
      return keyword;
  }
}

/**
 * A batch of unique names that obey the options. Impossible constraints (a 2-character limit with
 * a style whose shortest word is longer) return fewer names instead of padding with broken ones.
 */
export function generateUsernames(
  options: Partial<UsernameOptions> = {},
  random: () => number = Math.random,
): string[] {
  const merged: UsernameOptions = { ...DEFAULT_OPTIONS, ...options };
  const requested = Number.isFinite(merged.count) ? Math.floor(merged.count) : DEFAULT_OPTIONS.count;
  const count = Math.max(1, Math.min(60, requested));
  const maxLength = Math.max(0, Math.floor(merged.maxLength));
  const keyword = normalizeKeyword(merged.keyword);
  const safe = { ...merged, keyword };

  const results: string[] = [];
  const seen = new Set<string>();
  for (let attempt = 0; attempt < count * 40 && results.length < count; attempt += 1) {
    const candidate = composeUsername(safe, random).slice(0, 64);
    if (!candidate) continue;
    if (maxLength > 0 && [...candidate].length > maxLength) continue;
    if (merged.avoidLookalike && hasLookalike(candidate)) continue;
    const key = candidate.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(candidate);
  }
  return results;
}

/** Separators a platform accepts, for disabling the others in the picker. */
export function separatorsFor(platform: PlatformId): Separator[] {
  return PLATFORM_PRESETS.find((preset) => preset.id === platform)?.separators ?? SEPARATORS;
}

/** The platform's character limit, or null when the platform allows any length. */
export function maxLengthFor(platform: PlatformId): number | null {
  return PLATFORM_PRESETS.find((preset) => preset.id === platform)?.maxLength ?? null;
}

/** Applies a platform preset without discarding a separator the platform does not allow. */
export function applyPlatform(options: UsernameOptions, platform: PlatformId): UsernameOptions {
  const separators = separatorsFor(platform);
  const limit = maxLengthFor(platform);
  return {
    ...options,
    separator: separators.includes(options.separator) ? options.separator : (separators[0] ?? ''),
    maxLength: limit ?? options.maxLength,
  };
}

export interface SuggestionCheck {
  value: string;
  /** Character length after NFC normalisation. */
  length: number;
  /** Script of the name: latin, hangul or mixed. */
  script: 'latin' | 'hangul' | 'mixed' | 'other';
  /** Characters a platform might reject even when the length fits. */
  unusual: string[];
  overLimit: boolean;
}

const ALLOWED_CHAR = /^[A-Za-z0-9._\-\u3131-\u318e\uac00-\ud7a3]$/u;

/** Describes one suggestion so the UI can flag a name that will not fit a platform form. */
export function checkSuggestion(value: string, maxLength: number): SuggestionCheck {
  const normalized = value.normalize('NFC');
  const hangul = /[\u3131-\u318e\uac00-\ud7a3]/.test(normalized);
  const latin = /[A-Za-z]/.test(normalized);
  return {
    value,
    length: [...normalized].length,
    script: hangul && latin ? 'mixed' : hangul ? 'hangul' : latin ? 'latin' : 'other',
    unusual: [...new Set([...normalized].filter((char) => !ALLOWED_CHAR.test(char)))],
    overLimit: maxLength > 0 && [...normalized].length > maxLength,
  };
}
