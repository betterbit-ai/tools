/** Pure Lotto 6/45 generation logic. Browser APIs stay in Tool.tsx. */

export const LOTTO_MIN = 1;
export const LOTTO_MAX = 45;
export const PICK_COUNT = 6;
export const MAX_GAMES = 5;
const UINT32_RANGE = 0x1_0000_0000;

export type RandomSource = () => number;

export interface LottoSettings {
  fixed: number[];
  excluded: number[];
  gameCount: number;
}

export const DEFAULT_SETTINGS: LottoSettings = { fixed: [], excluded: [], gameCount: 1 };

export type LottoError = 'invalid-selection' | 'invalid-game-count' | 'too-many-fixed' | 'not-enough-available';
export type LottoResult = { ok: true; games: number[][] } | { ok: false; error: LottoError };

function isLottoNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= LOTTO_MIN && value <= LOTTO_MAX;
}

function isNumberList(value: unknown): value is number[] {
  return Array.isArray(value) && value.every(isLottoNumber) && new Set(value).size === value.length;
}

/** Validates persisted settings as well as the settings used to make a draw. */
export function validateSettings(settings: LottoSettings): LottoError | null {
  if (!isNumberList(settings.fixed) || !isNumberList(settings.excluded)) return 'invalid-selection';
  if (settings.fixed.some((value) => settings.excluded.includes(value))) return 'invalid-selection';
  if (!Number.isSafeInteger(settings.gameCount) || settings.gameCount < 1 || settings.gameCount > MAX_GAMES) {
    return 'invalid-game-count';
  }
  if (settings.fixed.length > PICK_COUNT) return 'too-many-fixed';
  if (LOTTO_MAX - settings.excluded.length < PICK_COUNT) return 'not-enough-available';
  return null;
}

export function isLottoSettings(value: unknown): value is LottoSettings {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  if (!isNumberList(candidate.fixed) || !isNumberList(candidate.excluded) || typeof candidate.gameCount !== 'number') {
    return false;
  }
  return (
    validateSettings({ fixed: candidate.fixed, excluded: candidate.excluded, gameCount: candidate.gameCount }) === null
  );
}

/** Returns the default settings unless a complete, valid saved value was supplied. */
export function settingsFromSaved(value: unknown): LottoSettings {
  return isLottoSettings(value)
    ? {
        fixed: [...value.fixed].sort((a, b) => a - b),
        excluded: [...value.excluded].sort((a, b) => a - b),
        gameCount: value.gameCount,
      }
    : { ...DEFAULT_SETTINGS };
}

/** Cycles a number through unselected → fixed → excluded → unselected. */
export function cycleNumber(settings: LottoSettings, value: number): LottoSettings {
  if (!isLottoNumber(value)) return settings;
  const fixed = new Set(settings.fixed);
  const excluded = new Set(settings.excluded);
  if (fixed.delete(value)) excluded.add(value);
  else if (excluded.delete(value)) {
    // The number returns to the unselected state.
  } else fixed.add(value);
  return {
    ...settings,
    fixed: [...fixed].sort((a, b) => a - b),
    excluded: [...excluded].sort((a, b) => a - b),
  };
}

/** The number of valid combinations remaining under the selected constraints. */
export function possibleCombinationCount(settings: LottoSettings): number {
  if (validateSettings(settings)) return 0;
  const availableToFill = LOTTO_MAX - settings.fixed.length - settings.excluded.length;
  return combinations(availableToFill, PICK_COUNT - settings.fixed.length);
}

/** Generates independent, ascending Lotto 6/45 lines while preserving every fixed number. */
export function generateLottoGames(settings: LottoSettings, source: RandomSource): LottoResult {
  const error = validateSettings(settings);
  if (error) return { ok: false, error };

  const candidates = Array.from({ length: LOTTO_MAX }, (_, index) => index + LOTTO_MIN).filter(
    (value) => !settings.fixed.includes(value) && !settings.excluded.includes(value),
  );
  const remaining = PICK_COUNT - settings.fixed.length;
  const games = Array.from({ length: settings.gameCount }, () =>
    [...settings.fixed, ...sampleWithoutReplacement(candidates, remaining, source)].sort((a, b) => a - b),
  );
  return { ok: true, games };
}

/** Formats a Lotto ball label with the familiar two-digit form. */
export function formatLottoNumber(value: number): string {
  if (!isLottoNumber(value)) throw new RangeError('Expected a Lotto number from 1 through 45.');
  return String(value).padStart(2, '0');
}

/** Formats copyable lines while letting the UI provide the localized line label. */
export function formatLottoGames(games: readonly (readonly number[])[], lineLabel: (index: number) => string): string {
  return games.map((game, index) => `${lineLabel(index + 1)}: ${game.map(formatLottoNumber).join(' ')}`).join('\n');
}

function sampleWithoutReplacement(candidates: readonly number[], count: number, source: RandomSource): number[] {
  const pool = [...candidates];
  for (let index = 0; index < count; index++) {
    const selected = randomInteger(index, pool.length - 1, source);
    [pool[index], pool[selected]] = [pool[selected]!, pool[index]!];
  }
  return pool.slice(0, count);
}

/** Samples an inclusive integer from a 32-bit source without modulo bias. */
function randomInteger(min: number, max: number, source: RandomSource): number {
  const span = max - min + 1;
  const limit = Math.floor(UINT32_RANGE / span) * span;
  let value: number;
  do {
    value = source();
    if (!Number.isInteger(value) || value < 0 || value >= UINT32_RANGE) {
      throw new RangeError('Random source must return an unsigned 32-bit integer.');
    }
  } while (value >= limit);
  return min + (value % span);
}

function combinations(n: number, k: number): number {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(k) || n < 0 || k < 0 || k > n) return 0;
  const selected = Math.min(k, n - k);
  let result = 1;
  for (let index = 1; index <= selected; index++) result = (result * (n - selected + index)) / index;
  return result;
}
