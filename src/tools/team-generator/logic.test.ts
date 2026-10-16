import { describe, expect, it } from 'vitest';
import {
  MAX_NAME_LENGTH,
  MAX_PARTICIPANTS,
  formatTeams,
  generateTeams,
  parseParticipants,
  scoreRange,
  shuffle,
  validateSettings,
  type RandomSource,
} from './logic';

function sourceFrom(values: number[]): RandomSource {
  let index = 0;
  return () => values[index++] ?? 0;
}

describe('team-generator', () => {
  it('parses a pasted roster while preserving Unicode names and optional trailing scores', () => {
    expect(parseParticipants('\uFEFF Alice, 3 \r\n김민지, 4.5\n😀\nAda, Lovelace\n')).toEqual([
      { name: 'Alice', score: 3 },
      { name: '김민지', score: 4.5 },
      { name: '😀', score: null },
      { name: 'Ada, Lovelace', score: null },
    ]);
  });

  it('rejects incomplete and boundary-invalid settings before assigning anyone', () => {
    expect(validateSettings([], 2, 'random')).toBe('not-enough-participants');
    expect(validateSettings(parseParticipants('only one'), 2, 'random')).toBe('not-enough-participants');
    expect(
      validateSettings(
        Array.from({ length: MAX_PARTICIPANTS + 1 }, () => ({ name: 'A', score: null })),
        2,
        'random',
      ),
    ).toBe('too-many-participants');
    expect(
      validateSettings(
        [
          { name: 'A'.repeat(MAX_NAME_LENGTH + 1), score: null },
          { name: 'B', score: null },
        ],
        2,
        'random',
      ),
    ).toBe('name-too-long');
    expect(validateSettings(parseParticipants('A\nB'), 0, 'random')).toBe('invalid-team-count');
    expect(validateSettings(parseParticipants('A\nB'), 3, 'random')).toBe('invalid-team-count');
    expect(validateSettings(parseParticipants('A, 1\nB'), 2, 'balanced')).toBe('missing-scores');
  });

  it('keeps every participant exactly once and makes team sizes differ by no more than one', () => {
    const roster = parseParticipants('A\nB\nC\nD\nE\nF\nG');
    const teams = generateTeams(roster, 3, 'random', sourceFrom([0, 0, 0, 0, 0, 0, 0, 0]));
    expect(teams.map((team) => team.members.length).sort()).toEqual([2, 2, 3]);
    expect(teams.flatMap((team) => team.members.map((member) => member.name)).sort()).toEqual([
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
    ]);
    expect(roster).toHaveLength(7);
  });

  it('uses every supplied score to make a balanced assignment and reports its total-score spread', () => {
    const teams = generateTeams(
      parseParticipants('A, 10\nB, 9\nC, 8\nD, 7'),
      2,
      'balanced',
      sourceFrom([0, 0, 0, 0, 0, 0]),
    );
    expect(teams.map((team) => team.score).sort()).toEqual([17, 17]);
    expect(scoreRange(teams)).toBe(0);
    expect(formatTeams(teams, 'Team', 'Skill')).toContain('Team 1 (Skill: 17)');
  });

  it('shuffles a copy and rejects invalid random sources', () => {
    const roster = ['A', 'B', 'C'];
    expect(shuffle(roster, sourceFrom([0, 0]))).toEqual(['B', 'C', 'A']);
    expect(roster).toEqual(['A', 'B', 'C']);
    expect(() => shuffle(roster, sourceFrom([1]))).toThrow(RangeError);
  });
});
