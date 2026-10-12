/**
 * Unicode data and text inspection for invisible-character. Pure functions only:
 * copying and clipboard access stay in the UI.
 */

export const MAX_COUNT = 10_000;

export type InvisibleCharacterId = 'hangul-filler' | 'braille-blank' | 'zero-width-space' | 'word-joiner';

export interface InvisibleCharacter {
  id: InvisibleCharacterId;
  character: string;
  codePoint: string;
}

export const INVISIBLE_CHARACTERS: readonly InvisibleCharacter[] = [
  { id: 'hangul-filler', character: '\u3164', codePoint: 'U+3164' },
  { id: 'braille-blank', character: '\u2800', codePoint: 'U+2800' },
  { id: 'zero-width-space', character: '\u200B', codePoint: 'U+200B' },
  { id: 'word-joiner', character: '\u2060', codePoint: 'U+2060' },
];

const characterByValue = new Map(INVISIBLE_CHARACTERS.map((item) => [item.character, item]));

/** Limits a generated string to a responsive, copy-friendly 1–10,000 range. */
export function normalizeCount(count: number): number {
  if (!Number.isFinite(count)) return 1;
  return Math.min(MAX_COUNT, Math.max(1, Math.trunc(count)));
}

export function getInvisibleCharacter(id: InvisibleCharacterId): InvisibleCharacter {
  return INVISIBLE_CHARACTERS.find((item) => item.id === id) ?? INVISIBLE_CHARACTERS[0];
}

/** Makes a repeated string of one selected Unicode code point. */
export function makeInvisibleText(id: InvisibleCharacterId, count: number): string {
  return getInvisibleCharacter(id).character.repeat(normalizeCount(count));
}

export interface InspectedCharacter {
  character: string;
  codePoint: string;
  count: number;
  id?: InvisibleCharacterId;
}

export interface Inspection {
  characters: number;
  recognized: number;
  entries: InspectedCharacter[];
}

/**
 * Reports Unicode scalars rather than UTF-16 code units, so supplementary-plane
 * characters such as emoji are always counted once and shown as one code point.
 */
export function inspectText(text: string): Inspection {
  const counts = new Map<string, number>();
  for (const character of text) counts.set(character, (counts.get(character) ?? 0) + 1);

  const entries = [...counts.entries()]
    .map(([character, count]) => {
      const known = characterByValue.get(character);
      return {
        character,
        codePoint: `U+${character.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0')}`,
        count,
        id: known?.id,
      };
    })
    .sort((a, b) => (a.character.codePointAt(0) ?? 0) - (b.character.codePointAt(0) ?? 0));

  return {
    characters: [...text].length,
    recognized: entries.filter((entry) => entry.id).reduce((sum, entry) => sum + entry.count, 0),
    entries,
  };
}
