/** Pure find-and-replace logic. No DOM or Preact. */

export interface ReplaceOptions {
  regex: boolean;
  caseSensitive: boolean;
  wholeWord: boolean;
}

export interface ReplaceResult {
  text: string;
  matchCount: number;
  error: string | null;
}

export const DEFAULT_OPTIONS: ReplaceOptions = {
  regex: false,
  caseSensitive: false,
  wholeWord: false,
};

const WORD_CHARACTER = '[\\p{L}\\p{N}_]';

/**
 * Replace every match without changing the source string. Plain-text searches
 * escape regular-expression syntax, including `$` in the replacement; regex
 * searches deliberately retain JavaScript's `$1`, `$&`, and `$$` semantics.
 */
export function findAndReplace(
  input: string,
  find: string,
  replacement: string,
  options: ReplaceOptions = DEFAULT_OPTIONS,
): ReplaceResult {
  if (!find) return { text: input, matchCount: 0, error: null };

  try {
    const expression = buildExpression(find, options);
    const matchCount = Array.from(input.matchAll(expression)).length;
    const text = options.regex ? input.replace(expression, replacement) : input.replace(expression, () => replacement);
    return { text, matchCount, error: null };
  } catch (error) {
    return { text: input, matchCount: 0, error: error instanceof Error ? error.message : String(error) };
  }
}

function buildExpression(find: string, options: ReplaceOptions): RegExp {
  const source = options.regex ? find : escapeRegExp(find);
  const bounded = options.wholeWord ? `(?<!${WORD_CHARACTER})(?:${source})(?!${WORD_CHARACTER})` : source;
  return new RegExp(bounded, `gu${options.caseSensitive ? '' : 'i'}`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
