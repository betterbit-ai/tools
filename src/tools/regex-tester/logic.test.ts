import { describe, expect, it } from 'vitest';
import { MATCH_LIMIT, explainPattern, testRegex } from './logic';

describe('testRegex', () => {
  it('returns all global matches, captures, named groups and UTF-16 indexes', () => {
    const result = testRegex('(?<name>안녕|😀)-(\\d+)', 'gu', 'x 안녕-12 😀-7');
    expect(result.error).toBeUndefined();
    expect(result.matches).toEqual([
      { value: '안녕-12', index: 2, end: 7, captures: ['안녕', '12'], groups: { name: '안녕' } },
      { value: '😀-7', index: 8, end: 12, captures: ['😀', '7'], groups: { name: '😀' } },
    ]);
  });

  it('honors the absence of the global flag and native replacement behavior', () => {
    const result = testRegex('a', '', 'banana', 'X');
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0]).toMatchObject({ value: 'a', index: 1 });
    expect(result.replacement).toBe('bXnana');
  });

  it('handles empty input and empty matches without looping forever', () => {
    expect(testRegex('a', 'g', '')).toMatchObject({ matches: [], hasMoreMatches: false });
    const emptyMatches = testRegex('(?:)', 'g', 'ab');
    expect(emptyMatches.matches.map((match) => match.index)).toEqual([0, 1, 2]);
  });

  it('caps a huge number of matches while indicating there is more to inspect', () => {
    const result = testRegex('x', 'g', 'x'.repeat(MATCH_LIMIT + 1));
    expect(result.matches).toHaveLength(MATCH_LIMIT);
    expect(result.hasMoreMatches).toBe(true);
  });

  it('returns invalid JavaScript regex syntax as an error instead of throwing', () => {
    const result = testRegex('([a-z]', 'g', 'abc');
    expect(result.matches).toEqual([]);
    expect(result.error).toMatch(/invalid regular expression/i);
  });
});

describe('explainPattern', () => {
  it('recognizes anchors, Unicode properties, groups, lookarounds and quantifiers', () => {
    expect(explainPattern('^(?<word>\\p{L}+)(?=!)$')).toEqual([
      { value: '^', kind: 'anchor' },
      { value: '(?<word>', kind: 'group' },
      { value: '\\p{L}', kind: 'escape' },
      { value: '+', kind: 'quantifier' },
      { value: '(?=', kind: 'lookaround' },
      { value: '!', kind: 'literal' },
      { value: '$', kind: 'anchor' },
    ]);
  });
});
