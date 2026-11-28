import { describe, expect, it } from 'vitest';
import {
  applyPlatform,
  checkSuggestion,
  composeUsername,
  DEFAULT_OPTIONS,
  ENGLISH_ADJECTIVES,
  ENGLISH_NOUNS,
  generateUsernames,
  KOREAN_MODIFIERS,
  KOREAN_NOUNS,
  KOREAN_TAILS,
  keywordFitsStyle,
  maxLengthFor,
  mulberry32,
  normalizeKeyword,
  separatorsFor,
  type UsernameOptions,
} from './logic';

const seeded = (seed = 7) => mulberry32(seed);

function options(overrides: Partial<UsernameOptions> = {}): UsernameOptions {
  return { ...DEFAULT_OPTIONS, ...overrides };
}

describe('normalizeKeyword', () => {
  it('keeps letters and digits in any script', () => {
    expect(normalizeKeyword('Lee Ji-hoon')).toBe('LeeJihoon');
    expect(normalizeKeyword('감자 77')).toBe('감자77');
  });

  it('drops punctuation, emoji and whitespace', () => {
    expect(normalizeKeyword('co:ol_name!')).toBe('coolname');
    expect(normalizeKeyword('🐧 penguin')).toBe('penguin');
  });

  it('normalises decomposed Hangul to one syllable per character', () => {
    expect(normalizeKeyword('\u1100\u1161')).toBe('가');
  });

  it('returns an empty string for empty input and caps very long input', () => {
    expect(normalizeKeyword('')).toBe('');
    expect(normalizeKeyword(undefined as unknown as string)).toBe('');
    expect(normalizeKeyword('a'.repeat(40)).length).toBe(20);
  });
});

describe('keywordFitsStyle', () => {
  it('accepts a Hangul keyword in Korean styles and a Latin keyword everywhere', () => {
    expect(keywordFitsStyle('감자', 'ko-modifier-noun')).toBe(true);
    expect(keywordFitsStyle('panda', 'ko-noun-tail')).toBe(true);
    expect(keywordFitsStyle('panda', 'adjective-noun')).toBe(true);
  });

  it('rejects a Hangul keyword in a Latin handle style', () => {
    expect(keywordFitsStyle('감자', 'adjective-noun')).toBe(false);
    expect(keywordFitsStyle('', 'adjective-noun')).toBe(true);
  });
});

describe('composeUsername', () => {
  it('builds a capitalised adjective + noun for the English style', () => {
    const random = seeded(1);
    const value = composeUsername(options({ style: 'adjective-noun' }), random);
    const [adjective, noun] = [value.slice(0, value.search(/[A-Z]/g)), value];
    expect(value).toMatch(/^[A-Z][a-zA-Z]+$/);
    const lower = value.toLowerCase();
    expect(ENGLISH_ADJECTIVES.some((word) => lower.includes(word))).toBe(true);
    expect(ENGLISH_NOUNS.some((word) => lower.includes(word))).toBe(true);
    expect(adjective).toBe('');
    expect(noun.length).toBeGreaterThan(4);
  });

  it('applies the chosen separator', () => {
    const value = composeUsername(options({ style: 'adjective-noun', separator: '_' }), seeded(2));
    expect(value).toContain('_');
    expect(value.split('_').length).toBe(2);
  });

  it('always ends the word-number style with at least two digits', () => {
    for (let seed = 1; seed < 15; seed += 1) {
      expect(composeUsername(options({ style: 'word-number', digits: 0 }), seeded(seed))).toMatch(/\d{2,}$/);
    }
  });

  it('builds a Hangul modifier + noun with no space', () => {
    const value = composeUsername(options({ style: 'ko-modifier-noun' }), seeded(3));
    expect(value).toMatch(/^[\uac00-\ud7a3]+$/);
    expect(KOREAN_MODIFIERS.some((word) => value.startsWith(word))).toBe(true);
    expect(KOREAN_NOUNS.some((word) => value.endsWith(word))).toBe(true);
  });

  it('builds a Hangul noun + tail', () => {
    const value = composeUsername(options({ style: 'ko-noun-tail' }), seeded(4));
    expect(KOREAN_NOUNS.some((word) => value.startsWith(word))).toBe(true);
    expect(KOREAN_TAILS.some((word) => value.endsWith(word))).toBe(true);
  });

  it('puts the keyword inside every style that accepts it', () => {
    expect(composeUsername(options({ style: 'adjective-noun', keyword: 'panda' }), seeded(5))).toContain('Panda');
    expect(composeUsername(options({ style: 'word-number', keyword: 'panda' }), seeded(5)).toLowerCase()).toContain(
      'panda',
    );
    expect(composeUsername(options({ style: 'ko-modifier-noun', keyword: '감자' }), seeded(5))).toContain('감자');
    expect(composeUsername(options({ style: 'ko-noun-tail', keyword: '감자' }), seeded(5))).toContain('감자');
  });

  it('never appends more than four digits', () => {
    const value = composeUsername(options({ style: 'adjective-noun', digits: 9 }), seeded(6));
    expect(value).toMatch(/\d{4}$/);
  });
});

describe('generateUsernames', () => {
  it('returns the requested count by default', () => {
    expect(generateUsernames({ count: 12 }, seeded(10))).toHaveLength(12);
    expect(generateUsernames({ count: 3 }, seeded(10))).toHaveLength(3);
  });

  it('is deterministic for a seed', () => {
    expect(generateUsernames({ count: 8 }, seeded(42))).toEqual(generateUsernames({ count: 8 }, seeded(42)));
    expect(generateUsernames({ count: 8 }, seeded(42))).not.toEqual(generateUsernames({ count: 8 }, seeded(43)));
  });

  it('keeps every name inside the character limit', () => {
    const names = generateUsernames({ count: 20, maxLength: 12 }, seeded(11));
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) expect([...name].length).toBeLessThanOrEqual(12);
  });

  it('counts Hangul by character, not by UTF-16 unit', () => {
    const names = generateUsernames({ count: 10, style: 'ko-modifier-noun', maxLength: 6 }, seeded(12));
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) expect([...name].length).toBeLessThanOrEqual(6);
  });

  it('returns fewer names rather than broken ones when the limit cannot be met', () => {
    expect(generateUsernames({ count: 10, style: 'ko-modifier-noun', maxLength: 2 }, seeded(13))).toEqual([]);
  });

  it('returns no duplicates, case-insensitively', () => {
    const names = generateUsernames({ count: 40, maxLength: 6 }, seeded(14));
    const lowered = names.map((name) => name.toLowerCase());
    expect(new Set(lowered).size).toBe(lowered.length);
  });

  it('drops look-alike characters when asked', () => {
    const names = generateUsernames({ count: 30, maxLength: 24, avoidLookalike: true }, seeded(15));
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) expect(name).not.toMatch(/[lI1O0]/);
  });

  it('clamps an absurd count instead of hanging', () => {
    expect(generateUsernames({ count: 0 }, seeded(16))).toHaveLength(1);
    expect(generateUsernames({ count: 500 }, seeded(16)).length).toBeLessThanOrEqual(60);
  });

  it('survives an impossible keyword with a tight limit', () => {
    const names = generateUsernames({ count: 5, maxLength: 4, keyword: 'penguin' }, seeded(17));
    expect(names).toEqual([]);
  });

  it('keeps working with a 4-character limit on the shortest style', () => {
    const names = generateUsernames({ count: 6, style: 'ko-noun-tail', maxLength: 5 }, seeded(18));
    for (const name of names) expect([...name].length).toBeLessThanOrEqual(5);
  });
});

describe('platform presets', () => {
  it('reports the documented limits', () => {
    expect(maxLengthFor('instagram')).toBe(30);
    expect(maxLengthFor('x')).toBe(15);
    expect(maxLengthFor('tiktok')).toBe(24);
    expect(maxLengthFor('discord')).toBe(32);
    expect(maxLengthFor('github')).toBe(39);
    expect(maxLengthFor('any')).toBe(null);
  });

  it('lists only the separators each platform allows', () => {
    expect(separatorsFor('github')).toEqual(['', '-']);
    expect(separatorsFor('x')).toEqual(['', '_']);
    expect(separatorsFor('instagram')).toContain('.');
    expect(separatorsFor('instagram')).not.toContain('-');
  });

  it('applies a limit and replaces a separator the platform rejects', () => {
    const applied = applyPlatform(options({ separator: '-' }), 'x');
    expect(applied.maxLength).toBe(15);
    expect(applied.separator).toBe('');
    expect(applyPlatform(options({ separator: '_' }), 'x').separator).toBe('_');
  });

  it('keeps the user limit for the unrestricted preset', () => {
    const applied = applyPlatform(options({ maxLength: 24 }), 'any');
    expect(applied.maxLength).toBe(24);
  });
});

describe('checkSuggestion', () => {
  it('counts characters and names the script', () => {
    const latin = checkSuggestion('QuietFalcon', 20);
    expect(latin.length).toBe(11);
    expect(latin.script).toBe('latin');
    expect(latin.overLimit).toBe(false);
    expect(checkSuggestion('말랑한감자', 20).script).toBe('hangul');
    expect(checkSuggestion('말랑한감자', 20).length).toBe(5);
  });

  it('flags a Latin name with a Hangul keyword as mixed script', () => {
    expect(checkSuggestion('panda감자', 20).script).toBe('mixed');
  });

  it('lists characters a form may reject', () => {
    expect(checkSuggestion('quiet🦊falcon', 30).unusual).toEqual(['🦊']);
    expect(checkSuggestion('quiet-falcon', 30).unusual).toEqual([]);
  });

  it('flags a name over the platform limit', () => {
    const long = checkSuggestion('a'.repeat(31), 30);
    expect(long.overLimit).toBe(true);
    expect(checkSuggestion('a'.repeat(31), 0).overLimit).toBe(false);
  });
});
