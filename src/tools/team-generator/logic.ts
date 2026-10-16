/** Pure team-generator logic. Browser randomness and UI state stay in Tool.tsx. */

export const MAX_PARTICIPANTS = 200;
export const MAX_NAME_LENGTH = 100;

export type RandomSource = () => number;
export type TeamMode = 'random' | 'balanced';
export type TeamError =
  'not-enough-participants' | 'too-many-participants' | 'name-too-long' | 'invalid-team-count' | 'missing-scores';

export interface Participant {
  name: string;
  score: number | null;
}

export interface Team {
  members: Participant[];
  score: number | null;
}

const SCORE_LINE = /^(.*?),\s*(-?(?:\d+(?:\.\d+)?|\.\d+))\s*$/;

/**
 * Reads one participant per line. A trailing numeric value after the final comma
 * is treated as an optional relative skill score (for example, "민지, 4.5").
 */
export function parseParticipants(input: string): Participant[] {
  return input
    .replace(/^\uFEFF/, '')
    .split(/\r\n?|\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(SCORE_LINE);
      const score = match ? Number(match[2]) : Number.NaN;
      if (match && match[1].trim() && Number.isFinite(score)) return { name: match[1].trim(), score };
      return { name: line, score: null };
    });
}

export function validateSettings(participants: Participant[], teamCount: number, mode: TeamMode): TeamError | null {
  if (participants.length < 2) return 'not-enough-participants';
  if (participants.length > MAX_PARTICIPANTS) return 'too-many-participants';
  if (participants.some((participant) => participant.name.length > MAX_NAME_LENGTH)) return 'name-too-long';
  if (!Number.isSafeInteger(teamCount) || teamCount < 2 || teamCount > participants.length) return 'invalid-team-count';
  if (mode === 'balanced' && participants.some((participant) => participant.score === null)) return 'missing-scores';
  return null;
}

function randomIndex(length: number, random: RandomSource): number {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError('Random source must return a number from 0 through 1.');
  }
  return Math.floor(value * length);
}

/** Returns a new shuffled array without changing the supplied participant list. */
export function shuffle<T>(values: readonly T[], random: RandomSource): T[] {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1, random);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex]!, shuffled[index]!];
  }
  return shuffled;
}

function capacities(participantCount: number, teamCount: number, random: RandomSource): number[] {
  const base = Math.floor(participantCount / teamCount);
  const extra = participantCount % teamCount;
  const order = shuffle(
    Array.from({ length: teamCount }, (_, index) => index),
    random,
  );
  const values = Array.from({ length: teamCount }, () => base);
  order.slice(0, extra).forEach((index) => {
    values[index] = (values[index] ?? base) + 1;
  });
  return values;
}

function pickLowestScoreTeam(teams: Team[], maximumSizes: number[], random: RandomSource): number {
  const eligible = teams
    .map((team, index) => ({
      index,
      score: team.score ?? 0,
      remaining: (maximumSizes[index] ?? 0) - team.members.length,
    }))
    .filter((team) => team.remaining > 0);
  const lowest = Math.min(...eligible.map((team) => team.score));
  const tied = eligible.filter((team) => team.score === lowest);
  return tied[randomIndex(tied.length, random)]?.index ?? 0;
}

/**
 * Splits a list into teams whose member counts differ by at most one. In balanced
 * mode, strongest scored participants are placed one at a time on the currently
 * lowest-total eligible team, then score ties are randomized.
 */
export function generateTeams(
  participants: Participant[],
  teamCount: number,
  mode: TeamMode,
  random: RandomSource = Math.random,
): Team[] {
  const error = validateSettings(participants, teamCount, mode);
  if (error) throw new RangeError(error);

  const maximumSizes = capacities(participants.length, teamCount, random);
  const teams: Team[] = Array.from({ length: teamCount }, () => ({
    members: [],
    score: mode === 'balanced' ? 0 : null,
  }));

  if (mode === 'random') {
    shuffle(participants, random).forEach((participant, index) => {
      const teamIndex = index % teamCount;
      teams[teamIndex]?.members.push(participant);
    });
    return teams;
  }

  const byScore = [...participants].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  let cursor = 0;
  while (cursor < byScore.length) {
    const score = byScore[cursor]?.score;
    let end = cursor + 1;
    while (end < byScore.length && byScore[end]?.score === score) end += 1;
    shuffle(byScore.slice(cursor, end), random).forEach((participant) => {
      const teamIndex = pickLowestScoreTeam(teams, maximumSizes, random);
      const team = teams[teamIndex];
      if (!team) return;
      team.members.push(participant);
      team.score = (team.score ?? 0) + (participant.score ?? 0);
    });
    cursor = end;
  }
  return teams;
}

export function scoreRange(teams: Team[]): number | null {
  const scores = teams.map((team) => team.score).filter((score): score is number => score !== null);
  return scores.length ? Math.max(...scores) - Math.min(...scores) : null;
}

export function formatTeams(teams: Team[], teamLabel: string, scoreLabel?: string): string {
  return teams
    .map((team, index) => {
      const heading = `${teamLabel} ${index + 1}${team.score !== null && scoreLabel ? ` (${scoreLabel}: ${team.score})` : ''}`;
      return `${heading}\n${team.members.map((member) => member.name).join('\n')}`;
    })
    .join('\n\n');
}
