import { describe, expect, it } from 'vitest';
import { CHARACTERS, codePointOf, filterCharacters, rememberRecent } from './logic';

describe('filterCharacters', () => {
  it('returns the selected group when the query is empty', () => {
    expect(filterCharacters('', 'mieum').every((entry) => entry.group === 'mieum')).toBe(true);
    expect(filterCharacters('', 'all')).toHaveLength(CHARACTERS.length + 7);
  });

  it('finds Korean keywords and keeps the Korean keyboard group', () => {
    const arrows = filterCharacters('화살표', 'mieum');
    expect(arrows.map((entry) => entry.character)).toContain('→');
    expect(filterCharacters('화살표', 'digeut')).toEqual([]);
  });

  it('finds a Unicode code point with or without U+', () => {
    expect(filterCharacters('U+2192', 'all').map((entry) => entry.character)).toContain('→');
    expect(filterCharacters('2192', 'all').map((entry) => entry.character)).toContain('→');
  });

  it('finds a literal Unicode character and English names', () => {
    expect(filterCharacters('★', 'all')).toEqual(expect.arrayContaining([expect.objectContaining({ character: '★' })]));
    expect(filterCharacters('infinity', 'all')).toEqual(
      expect.arrayContaining([expect.objectContaining({ character: '∞' })]),
    );
  });
});

describe('codePointOf', () => {
  it('formats BMP and supplementary Unicode characters', () => {
    expect(codePointOf('★')).toBe('U+2605');
    expect(codePointOf('😀')).toBe('U+1F600');
    expect(codePointOf('')).toBe('');
  });
});

describe('rememberRecent', () => {
  it('deduplicates copied characters and keeps the newest first', () => {
    expect(rememberRecent(['★', '→', '★'], '→')).toEqual(['→', '★']);
  });

  it('honours zero and the requested boundary', () => {
    expect(rememberRecent(['★'], '→', 0)).toEqual([]);
    expect(rememberRecent(['★', '→', '∞'], '✓', 2)).toEqual(['✓', '★']);
  });

  it('does not discard Unicode symbols', () => {
    expect(rememberRecent(['한', '😀'], '㎡', 3)).toEqual(['㎡', '한', '😀']);
  });
});
