import { describe, expect, it } from 'vitest';
import {
  MAX_LABEL_LENGTH,
  MAX_PLAYERS,
  createLadder,
  destinationFor,
  randomIndex,
  rungsForMapping,
  shuffledIndices,
  validateLabels,
  type RandomSource,
} from './logic';

function sourceFrom(values: number[]): RandomSource {
  let index = 0;
  return () => values[index++] ?? 0;
}

function permutations(values: number[]): number[][] {
  if (values.length < 2) return [values];
  return values.flatMap((value, index) =>
    permutations([...values.slice(0, index), ...values.slice(index + 1)]).map((rest) => [value, ...rest]),
  );
}

describe('ladder-game', () => {
  it('accepts Unicode paired labels and rejects empty, mismatched, and oversized inputs', () => {
    expect(validateLabels(['민지', '😀'], ['커피 사기', '통과'])).toBeNull();
    expect(validateLabels(['A'], ['B'])).toBe('invalid-player-count');
    expect(validateLabels(['A', 'B'], ['A'])).toBe('invalid-player-count');
    expect(validateLabels(['A', ''], ['1', '2'])).toBe('empty-label');
    expect(validateLabels(['A'.repeat(MAX_LABEL_LENGTH + 1), 'B'], ['1', '2'])).toBe('label-too-long');
    expect(validateLabels(['😀'.repeat(MAX_LABEL_LENGTH), 'B'], ['1', '2'])).toBeNull();
    expect(validateLabels(['😀'.repeat(MAX_LABEL_LENGTH + 1), 'B'], ['1', '2'])).toBe('label-too-long');
    expect(
      validateLabels(
        Array.from({ length: MAX_PLAYERS + 1 }, () => 'A'),
        Array.from({ length: MAX_PLAYERS + 1 }, () => 'B'),
      ),
    ).toBe('invalid-player-count');
  });

  it('uses rejection sampling at boundaries without mutating the source data', () => {
    expect(randomIndex(3, sourceFrom([0]))).toBe(0);
    expect(randomIndex(3, sourceFrom([0xffff_ffff, 5]))).toBe(2);
    expect(() => randomIndex(0, sourceFrom([0]))).toThrow(RangeError);
    expect(() => randomIndex(2, sourceFrom([-1]))).toThrow(RangeError);
  });

  it('shuffles all player indexes exactly once, including the two-player boundary', () => {
    expect(shuffledIndices(2, sourceFrom([0]))).toEqual([1, 0]);
    expect(shuffledIndices(4, sourceFrom([0, 0, 0]))).toEqual([1, 2, 3, 0]);
    expect(() => shuffledIndices(MAX_PLAYERS + 1, sourceFrom([0]))).toThrow(RangeError);
  });

  it('constructs a non-ambiguous ladder that realizes every requested permutation', () => {
    const mapping = [2, 0, 3, 1];
    const { rungs, rowCount } = rungsForMapping(mapping);
    const ladder = { mapping, rungs, rowCount };
    expect(rungs).toEqual([
      { row: 0, left: 0 },
      { row: 0, left: 2 },
      { row: 1, left: 1 },
    ]);
    expect(mapping.map((_, participant) => destinationFor(ladder, participant))).toEqual(mapping);
    expect(
      rungs.every(
        (rung) =>
          !rungs.some((other) => other !== rung && other.row === rung.row && Math.abs(other.left - rung.left) <= 1),
      ),
    ).toBe(true);
  });

  it('creates a fair assignment before drawing the ladder', () => {
    const ladder = createLadder(4, sourceFrom([0, 0, 0]));
    expect(ladder.mapping).toEqual([1, 2, 3, 0]);
    expect(ladder.mapping.map((_, participant) => destinationFor(ladder, participant))).toEqual(ladder.mapping);
    expect(() => rungsForMapping([0, 0])).toThrow(RangeError);
    expect(() => destinationFor(ladder, 4)).toThrow(RangeError);
  });

  it('realizes every four-player assignment without placing touching rungs on one row', () => {
    for (const mapping of permutations([0, 1, 2, 3])) {
      const { rungs, rowCount } = rungsForMapping(mapping);
      const ladder = { mapping, rungs, rowCount };
      expect(mapping.map((_, participant) => destinationFor(ladder, participant))).toEqual(mapping);
      expect(
        rungs.every(
          (rung) =>
            !rungs.some((other) => other !== rung && other.row === rung.row && Math.abs(other.left - rung.left) <= 1),
        ),
      ).toBe(true);
    }
  });
});
