import { describe, expect, it } from 'vitest';
import {
  HISTORY_LIMIT,
  LABEL_MAX_LENGTH,
  MAX_TALLY,
  addFlip,
  flipCoin,
  getStats,
  initialCoinState,
  isCoinState,
  normalizeLabel,
} from './logic';

describe('flipCoin', () => {
  it('splits the exact 32-bit range at its midpoint', () => {
    expect(flipCoin(() => 0)).toBe('heads');
    expect(flipCoin(() => 0x7fff_ffff)).toBe('heads');
    expect(flipCoin(() => 0x8000_0000)).toBe('tails');
    expect(flipCoin(() => 0xffff_ffff)).toBe('tails');
  });

  it('rejects invalid random source values', () => {
    expect(() => flipCoin(() => -1)).toThrow(RangeError);
    expect(() => flipCoin(() => 0x1_0000_0000)).toThrow(RangeError);
    expect(() => flipCoin(() => Number.NaN)).toThrow(RangeError);
  });
});

describe('statistics and history', () => {
  it('calculates counts and rounded shares, including an empty history', () => {
    expect(getStats(initialCoinState())).toEqual({ heads: 0, tails: 0, total: 0, headsPercent: 0, tailsPercent: 0 });
    expect(getStats({ heads: 2, tails: 1 })).toEqual({
      heads: 2,
      tails: 1,
      total: 3,
      headsPercent: 67,
      tailsPercent: 33,
    });
  });

  it('puts the newest result first and bounds saved history', () => {
    const full = Array.from({ length: HISTORY_LIMIT }, () => 'tails' as const);
    expect(addFlip({ history: full, heads: 100, tails: 100 }, 'heads')).toEqual({
      history: ['heads', ...full.slice(0, -1)],
      heads: 101,
      tails: 100,
    });
  });

  it('keeps the counter safe at its maximum and validates saved state', () => {
    const fullTally = { history: [], heads: MAX_TALLY, tails: 0 };
    expect(addFlip(fullTally, 'tails')).toEqual({ history: ['tails'], heads: MAX_TALLY, tails: 0 });
    expect(isCoinState({ history: ['heads', 'tails'], heads: 2, tails: 1 })).toBe(true);
    expect(isCoinState({ history: ['heads', 'edge'], heads: 1, tails: 1 })).toBe(false);
    expect(isCoinState({ history: Array.from({ length: HISTORY_LIMIT + 1 }, () => 'heads'), heads: 0, tails: 0 })).toBe(
      false,
    );
    expect(isCoinState({ history: [], heads: Number.MAX_SAFE_INTEGER, tails: 1 })).toBe(false);
    expect(isCoinState('heads')).toBe(false);
  });
});

describe('normalizeLabel', () => {
  it('uses the fallback for blank text and accepts Unicode choices', () => {
    expect(normalizeLabel('   ', 'Heads')).toBe('Heads');
    expect(normalizeLabel('  짜장  면  ', '앞면')).toBe('짜장 면');
    expect(normalizeLabel('🏀 승리', 'Heads')).toBe('🏀 승리');
  });

  it('limits labels by Unicode code point rather than UTF-16 units', () => {
    const longEmojiLabel = '🪙'.repeat(LABEL_MAX_LENGTH + 1);
    expect(Array.from(normalizeLabel(longEmojiLabel, 'Heads'))).toHaveLength(LABEL_MAX_LENGTH);
  });
});
