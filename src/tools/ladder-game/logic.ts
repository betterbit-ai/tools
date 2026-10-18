/** Pure ladder-game logic. Browser randomness and drawing stay in Tool.tsx. */

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 20;
export const MAX_LABEL_LENGTH = 80;
const UINT32_RANGE = 0x1_0000_0000;

export type RandomSource = () => number;
export type LadderError = 'invalid-player-count' | 'empty-label' | 'label-too-long';

export interface Rung {
  /** Zero-based visual row, shared only by non-touching rungs. */
  row: number;
  /** The rung joins this column to the column immediately to its right. */
  left: number;
}

export interface Ladder {
  /** Maps each top participant index to its bottom outcome index. */
  mapping: number[];
  rungs: Rung[];
  rowCount: number;
}

/** Validates the paired participant and outcome fields before a ladder is built. */
export function validateLabels(participants: string[], outcomes: string[]): LadderError | null {
  if (
    participants.length !== outcomes.length ||
    participants.length < MIN_PLAYERS ||
    participants.length > MAX_PLAYERS
  ) {
    return 'invalid-player-count';
  }
  if ([...participants, ...outcomes].some((label) => !label.trim())) return 'empty-label';
  if ([...participants, ...outcomes].some((label) => Array.from(label.trim()).length > MAX_LABEL_LENGTH)) {
    return 'label-too-long';
  }
  return null;
}

/** Picks an unbiased array index from an unsigned 32-bit random source. */
export function randomIndex(length: number, source: RandomSource): number {
  if (!Number.isSafeInteger(length) || length < 1 || length > UINT32_RANGE) {
    throw new RangeError('Expected a length from 1 through 2³².');
  }
  const limit = Math.floor(UINT32_RANGE / length) * length;
  let value: number;
  do {
    value = source();
    if (!Number.isInteger(value) || value < 0 || value >= UINT32_RANGE) {
      throw new RangeError('Random source must return an unsigned 32-bit integer.');
    }
  } while (value >= limit);
  return value % length;
}

/** Returns a uniformly shuffled copy using Fisher–Yates and rejection sampling. */
export function shuffledIndices(length: number, source: RandomSource): number[] {
  if (!Number.isSafeInteger(length) || length < MIN_PLAYERS || length > MAX_PLAYERS) {
    throw new RangeError(`Expected ${MIN_PLAYERS} through ${MAX_PLAYERS} players.`);
  }
  const values = Array.from({ length }, (_, index) => index);
  for (let index = values.length - 1; index > 0; index -= 1) {
    const other = randomIndex(index + 1, source);
    [values[index], values[other]] = [values[other]!, values[index]!];
  }
  return values;
}

function isPermutation(mapping: number[]): boolean {
  return (
    mapping.length >= MIN_PLAYERS &&
    mapping.every((destination) => Number.isInteger(destination) && destination >= 0 && destination < mapping.length) &&
    new Set(mapping).size === mapping.length
  );
}

/**
 * Makes visible rungs for a supplied one-to-one assignment. A ladder is a
 * sequence of adjacent swaps, so this constructs the requested mapping exactly.
 * Independent swaps share a row when that does not change their result.
 */
export function rungsForMapping(mapping: number[]): { rungs: Rung[]; rowCount: number } {
  if (!isPermutation(mapping) || mapping.length > MAX_PLAYERS)
    throw new RangeError('Mapping must be a player permutation.');

  const targetAtBottom = Array.from({ length: mapping.length }, (_, destination) => mapping.indexOf(destination));
  const current = Array.from({ length: mapping.length }, (_, index) => index);
  const sequence: number[] = [];

  for (let destination = 0; destination < targetAtBottom.length; destination += 1) {
    const player = targetAtBottom[destination];
    let column = current.indexOf(player);
    while (column > destination) {
      const left = column - 1;
      [current[left], current[column]] = [current[column]!, current[left]!];
      sequence.push(left);
      column -= 1;
    }
  }

  const rows: number[][] = [];
  const rungs: Rung[] = [];
  for (const left of sequence) {
    let row = rows.length - 1;
    if (row < 0 || (rows[row] ?? []).some((existing) => Math.abs(existing - left) <= 1)) {
      rows.push([]);
      row = rows.length - 1;
    }
    rows[row]?.push(left);
    rungs.push({ row, left });
  }
  return { rungs, rowCount: Math.max(1, rows.length) };
}

/** Builds a fair assignment first, then a ladder that visibly realizes it. */
export function createLadder(playerCount: number, source: RandomSource): Ladder {
  const mapping = shuffledIndices(playerCount, source);
  const { rungs, rowCount } = rungsForMapping(mapping);
  return { mapping, rungs, rowCount };
}

/** Follows one participant through a ladder and returns its destination. */
export function destinationFor(ladder: Ladder, participantIndex: number): number {
  if (!Number.isSafeInteger(participantIndex) || participantIndex < 0 || participantIndex >= ladder.mapping.length) {
    throw new RangeError('Participant index is outside this ladder.');
  }
  let column = participantIndex;
  const rungs = [...ladder.rungs].sort((a, b) => a.row - b.row || a.left - b.left);
  for (const rung of rungs) {
    if (rung.left === column) column += 1;
    else if (rung.left + 1 === column) column -= 1;
  }
  return column;
}
