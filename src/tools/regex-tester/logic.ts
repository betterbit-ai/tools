/** Pure JavaScript-RegExp logic for regex-tester — no DOM, no Preact. */

export const MATCH_LIMIT = 1_000;

export const DEFAULT_REGEX_STATE = {
  pattern: '(?<word>\\b[A-Za-z]+\\b)',
  flags: 'g',
  text: 'Regex can find words in English and 한글 text. Try 42 or hello@example.com.',
  replacement: '',
} as const;

export interface RegexMatch {
  value: string;
  index: number;
  end: number;
  captures: Array<string | undefined>;
  groups: Record<string, string | undefined>;
}

export interface RegexResult {
  matches: RegexMatch[];
  error?: string;
  replacement?: string;
  hasMoreMatches: boolean;
}

export type ExplanationKind =
  'anchor' | 'characterClass' | 'escape' | 'group' | 'lookaround' | 'quantifier' | 'alternation' | 'literal';

export interface ExplanationToken {
  value: string;
  kind: ExplanationKind;
}

function toRegexMatch(match: RegExpExecArray): RegexMatch {
  return {
    value: match[0],
    index: match.index,
    end: match.index + match[0].length,
    captures: Array.from(match).slice(1),
    groups: { ...(match.groups ?? {}) },
  };
}

function advanceStringIndex(text: string, index: number, unicode: boolean): number {
  if (!unicode || index + 1 >= text.length) return index + 1;
  const first = text.charCodeAt(index);
  const second = text.charCodeAt(index + 1);
  return first >= 0xd800 && first <= 0xdbff && second >= 0xdc00 && second <= 0xdfff ? index + 2 : index + 1;
}

/**
 * Runs the browser's JavaScript regex flavor. Indexes intentionally use UTF-16
 * code units because that is what RegExpExecArray.index exposes to JavaScript.
 */
export function testRegex(pattern: string, flags: string, text: string, replacement?: string): RegexResult {
  if (!pattern) return { matches: [], hasMoreMatches: false };

  let expression: RegExp;
  try {
    expression = new RegExp(pattern, flags);
  } catch (error) {
    return {
      matches: [],
      error: error instanceof Error ? error.message : String(error),
      hasMoreMatches: false,
    };
  }

  const matches: RegexMatch[] = [];
  if (expression.global) {
    let next: RegExpExecArray | null;
    while (matches.length < MATCH_LIMIT && (next = expression.exec(text)) !== null) {
      matches.push(toRegexMatch(next));
      // RegExp.prototype.exec does not advance lastIndex for an empty match.
      if (next[0] === '') expression.lastIndex = advanceStringIndex(text, expression.lastIndex, expression.unicode);
    }
  } else {
    const first = expression.exec(text);
    if (first) matches.push(toRegexMatch(first));
  }

  const hasMoreMatches = expression.global && matches.length === MATCH_LIMIT && expression.exec(text) !== null;
  return {
    matches,
    hasMoreMatches,
    ...(replacement === undefined ? {} : { replacement: text.replace(new RegExp(pattern, flags), replacement) }),
  };
}

/** Splits common JavaScript regex constructs into human-readable explanation tokens. */
export function explainPattern(pattern: string): ExplanationToken[] {
  const tokens: ExplanationToken[] = [];
  for (let index = 0; index < pattern.length;) {
    const current = pattern[index];
    if (current === '\\') {
      const property = pattern.slice(index).match(/^\\[pP]\{[^}]*\}/u)?.[0];
      const value = property ?? pattern.slice(index, index + Math.min(2, pattern.length - index));
      tokens.push({ value, kind: 'escape' });
      index += value.length;
    } else if (current === '[') {
      let end = index + 1;
      for (; end < pattern.length; end++) {
        if (pattern[end] === '\\') end++;
        else if (pattern[end] === ']') {
          end++;
          break;
        }
      }
      tokens.push({ value: pattern.slice(index, end), kind: 'characterClass' });
      index = end;
    } else if (current === '(') {
      const namedGroup = pattern.slice(index).match(/^\(\?<[$_\p{ID_Start}][$_\p{ID_Continue}]*>/u)?.[0];
      const value =
        pattern.startsWith('(?<=', index) || pattern.startsWith('(?<!', index)
          ? pattern.slice(index, index + 4)
          : pattern.startsWith('(?=', index) || pattern.startsWith('(?!', index)
            ? pattern.slice(index, index + 3)
            : pattern.startsWith('(?:', index)
              ? pattern.slice(index, index + 3)
              : (namedGroup ?? '(');
      tokens.push({
        value,
        kind:
          value.startsWith('(?=') || value.startsWith('(?!') || value.startsWith('(?<=') || value.startsWith('(?<!')
            ? 'lookaround'
            : 'group',
      });
      index += value.length;
    } else if (current === '*' || current === '+' || current === '?') {
      const value = pattern[index + 1] === '?' ? pattern.slice(index, index + 2) : current;
      tokens.push({ value, kind: 'quantifier' });
      index += value.length;
    } else if (current === '{') {
      const end = pattern.indexOf('}', index + 1);
      const value = end === -1 ? current : pattern.slice(index, end + 1);
      tokens.push({ value, kind: end === -1 ? 'literal' : 'quantifier' });
      index += value.length;
    } else if (current === '^' || current === '$') {
      tokens.push({ value: current, kind: 'anchor' });
      index++;
    } else if (current === '|') {
      tokens.push({ value: current, kind: 'alternation' });
      index++;
    } else if (current !== ')') {
      tokens.push({ value: current, kind: 'literal' });
      index++;
    } else {
      index++;
    }
  }
  return tokens;
}
