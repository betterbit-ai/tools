import { describe, expect, it } from 'vitest';
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  characterCount,
  entropyBits,
  generatePassphrase,
  generatePassword,
  randomIndex,
  type PasswordSettings,
  validateSettings,
} from './logic';

const defaults: PasswordSettings = {
  mode: 'password',
  length: 20,
  wordCount: 6,
  separator: '-',
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
};
const zero = () => 0;
const passwordSource = (excludingAmbiguous = false) => {
  const values = excludingAmbiguous ? [0, 24, 48, 56] : [0, 26, 52, 62];
  let index = 0;
  return () => values[index++ % values.length] ?? 0;
};

describe('password-generator logic', () => {
  it('generates every enabled character category at both length boundaries', () => {
    const min = generatePassword({ ...defaults, length: MIN_PASSWORD_LENGTH }, passwordSource());
    const max = generatePassword({ ...defaults, length: MAX_PASSWORD_LENGTH }, passwordSource());
    expect(characterCount(min)).toBe(MIN_PASSWORD_LENGTH);
    expect(characterCount(max)).toBe(MAX_PASSWORD_LENGTH);
    expect(min).toMatch(/[A-Z]/);
    expect(min).toMatch(/[a-z]/);
    expect(min).toMatch(/[0-9]/);
    expect(min).toMatch(/[-!@#$%^&*_+=?]/);
  });

  it('removes look-alike characters when requested', () => {
    expect(generatePassword({ ...defaults, length: 32, excludeAmbiguous: true }, passwordSource(true))).not.toMatch(
      /[Il1O0o]/,
    );
  });

  it('rejects missing sets and out-of-bound values', () => {
    expect(validateSettings({ ...defaults, uppercase: false, lowercase: false, numbers: false, symbols: false })).toBe(
      'no-character-set',
    );
    expect(validateSettings({ ...defaults, length: 3 })).toBe('invalid-length');
    expect(validateSettings({ ...defaults, wordCount: 13 })).toBe('invalid-word-count');
  });

  it('creates a passphrase with a Unicode separator and counts Unicode code points', () => {
    expect(generatePassphrase(3, '·', zero)).toBe('amber·amber·amber');
    expect(characterCount('비밀번호🔐')).toBe(5);
  });

  it('calculates exact passphrase entropy and a positive character-password estimate', () => {
    expect(entropyBits({ ...defaults, mode: 'passphrase', wordCount: 6 })).toBe(42);
    expect(entropyBits(defaults)).toBeGreaterThan(100);
  });

  it('retries the modulo-bias remainder and rejects invalid random values', () => {
    expect(() => randomIndex(0, zero)).toThrow(RangeError);
    expect(() => randomIndex(2, () => -1)).toThrow(RangeError);
    let calls = 0;
    expect(randomIndex(3, () => (calls++ === 0 ? 0xffffffff : 5))).toBe(2);
    expect(calls).toBe(2);
  });
});
