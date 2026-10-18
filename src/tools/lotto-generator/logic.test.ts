import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  LOTTO_MAX,
  MAX_GAMES,
  PICK_COUNT,
  cycleNumber,
  formatLottoGames,
  formatLottoNumber,
  generateLottoGames,
  isLottoSettings,
  possibleCombinationCount,
  settingsFromSaved,
  validateSettings,
} from './logic';

describe('Lotto 6/45 settings', () => {
  it('accepts exactly the valid saved settings shape and restores sorted selections', () => {
    expect(isLottoSettings({ fixed: [7, 1], excluded: [45], gameCount: 5 })).toBe(true);
    expect(settingsFromSaved({ fixed: [7, 1], excluded: [45], gameCount: 5 })).toEqual({
      fixed: [1, 7],
      excluded: [45],
      gameCount: 5,
    });
    expect(settingsFromSaved({ fixed: ['７'], excluded: [], gameCount: 1 })).toEqual(DEFAULT_SETTINGS);
    expect(isLottoSettings({ fixed: [1, 1], excluded: [], gameCount: 1 })).toBe(false);
    expect(isLottoSettings({ fixed: [1], excluded: [1], gameCount: 1 })).toBe(false);
    expect(isLottoSettings({ fixed: [], excluded: [], gameCount: '1' })).toBe(false);
  });

  it('cycles a selected ball through fixed, excluded, and clear', () => {
    const fixed = cycleNumber(DEFAULT_SETTINGS, 12);
    expect(fixed.fixed).toEqual([12]);
    const excluded = cycleNumber(fixed, 12);
    expect(excluded.excluded).toEqual([12]);
    expect(cycleNumber(excluded, 12)).toEqual(DEFAULT_SETTINGS);
    expect(cycleNumber(DEFAULT_SETTINGS, 0)).toBe(DEFAULT_SETTINGS);
  });

  it('rejects boundaries that cannot represent a valid six-number line', () => {
    expect(
      validateSettings({
        fixed: Array.from({ length: PICK_COUNT + 1 }, (_, index) => index + 1),
        excluded: [],
        gameCount: 1,
      }),
    ).toBe('too-many-fixed');
    expect(
      validateSettings({
        fixed: [],
        excluded: Array.from({ length: LOTTO_MAX - PICK_COUNT + 1 }, (_, index) => index + 1),
        gameCount: 1,
      }),
    ).toBe('not-enough-available');
    expect(validateSettings({ fixed: [], excluded: [], gameCount: 0 })).toBe('invalid-game-count');
    expect(validateSettings({ fixed: [], excluded: [], gameCount: MAX_GAMES + 1 })).toBe('invalid-game-count');
  });
});

describe('Lotto 6/45 generation', () => {
  it('generates sorted, distinct six-number lines and keeps fixed numbers in every line', () => {
    const result = generateLottoGames({ fixed: [7, 42], excluded: [1, 2, 3], gameCount: 2 }, () => 0);
    expect(result).toEqual({
      ok: true,
      games: [
        [4, 5, 6, 7, 8, 42],
        [4, 5, 6, 7, 8, 42],
      ],
    });
    if (result.ok) {
      for (const game of result.games) {
        expect(game).toHaveLength(PICK_COUNT);
        expect(new Set(game).size).toBe(PICK_COUNT);
        expect(game).toEqual([...game].sort((a, b) => a - b));
        expect(game).toContain(7);
        expect(game).toContain(42);
        expect(game).not.toContain(1);
      }
    }
  });

  it('retries rejected 32-bit values so every candidate has the same chance', () => {
    const values = [0xffff_ffff, 44, 43, 42, 41, 40, 39];
    const result = generateLottoGames(DEFAULT_SETTINGS, () => values.shift() ?? 0);
    expect(result).toEqual({ ok: true, games: [[1, 2, 3, 4, 5, 45]] });
  });

  it('counts all 8,145,060 unrestricted combinations and respects constraints', () => {
    expect(possibleCombinationCount(DEFAULT_SETTINGS)).toBe(8_145_060);
    expect(possibleCombinationCount({ fixed: [1, 2], excluded: [45], gameCount: 1 })).toBe(111_930);
    expect(
      possibleCombinationCount({
        fixed: [],
        excluded: Array.from({ length: 40 }, (_, index) => index + 1),
        gameCount: 1,
      }),
    ).toBe(0);
  });
});

describe('Lotto 6/45 formatting', () => {
  it('uses two-digit ball labels and accepts only valid numeric values', () => {
    expect(formatLottoNumber(1)).toBe('01');
    expect(formatLottoNumber(45)).toBe('45');
    expect(() => formatLottoNumber(Number.NaN)).toThrow(RangeError);
    expect(() => formatLottoNumber(46)).toThrow(RangeError);
  });

  it('formats compact, localized copy text without parsing Unicode labels as numbers', () => {
    expect(formatLottoGames([[1, 9, 10, 20, 30, 45]], (index) => `게임 ${index}회`)).toBe(
      '게임 1회: 01 09 10 20 30 45',
    );
  });
});
