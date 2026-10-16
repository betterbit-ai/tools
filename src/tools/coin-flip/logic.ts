/** Pure coin-flip logic. The caller supplies the browser random source. */

export const HISTORY_LIMIT = 12;
export const LABEL_MAX_LENGTH = 80;
export const MAX_TALLY = Number.MAX_SAFE_INTEGER;
const UINT32_MIDPOINT = 0x8000_0000;

export type CoinSide = 'heads' | 'tails';
export type RandomSource = () => number;

export interface FlipStats {
  heads: number;
  tails: number;
  total: number;
  headsPercent: number;
  tailsPercent: number;
}

export interface CoinState {
  history: CoinSide[];
  heads: number;
  tails: number;
}

/**
 * Selects a side from an unsigned 32-bit source. Each side owns exactly
 * 2,147,483,648 values, so no modulo bias is introduced.
 */
export function flipCoin(source: RandomSource): CoinSide {
  const value = source();
  if (!Number.isInteger(value) || value < 0 || value >= 0x1_0000_0000) {
    throw new RangeError('Random source must return an unsigned 32-bit integer.');
  }
  return value < UINT32_MIDPOINT ? 'heads' : 'tails';
}

export function initialCoinState(): CoinState {
  return { history: [], heads: 0, tails: 0 };
}

/** Adds a result to an unlimited local tally and a compact 12-result display history. */
export function addFlip(state: CoinState, side: CoinSide): CoinState {
  const canCount = state.heads + state.tails < MAX_TALLY;
  return {
    history: [side, ...state.history].slice(0, HISTORY_LIMIT),
    heads: state.heads + (side === 'heads' && canCount ? 1 : 0),
    tails: state.tails + (side === 'tails' && canCount ? 1 : 0),
  };
}

export function getStats(state: Pick<CoinState, 'heads' | 'tails'>): FlipStats {
  const total = state.heads + state.tails;
  return {
    heads: state.heads,
    tails: state.tails,
    total,
    headsPercent: total ? Math.round((state.heads / total) * 100) : 0,
    tailsPercent: total ? Math.round((state.tails / total) * 100) : 0,
  };
}

/** Keeps labels readable and bounded while accepting Korean, CJK, emoji, and other Unicode text. */
export function normalizeLabel(value: string, fallback: string): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  return Array.from(normalized).slice(0, LABEL_MAX_LENGTH).join('') || fallback;
}

export function isCoinState(value: unknown): value is CoinState {
  if (!value || typeof value !== 'object') return false;
  const state = value as CoinState;
  return (
    Array.isArray(state.history) &&
    state.history.length <= HISTORY_LIMIT &&
    state.history.every((side) => side === 'heads' || side === 'tails') &&
    Number.isSafeInteger(state.heads) &&
    state.heads >= 0 &&
    Number.isSafeInteger(state.tails) &&
    state.tails >= 0 &&
    state.heads + state.tails <= MAX_TALLY
  );
}
