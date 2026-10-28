/** Pure line sorting. No DOM or Preact. */

export type SortMode = 'alphabetical' | 'reverse-alphabetical' | 'reverse' | 'shuffle';

export interface SortOptions {
  mode: SortMode;
  naturalOrder: boolean;
  caseSensitive: boolean;
  trimWhitespace: boolean;
  removeEmptyLines: boolean;
  removeDuplicates: boolean;
}

export interface SortResult {
  text: string;
  inputLines: number;
  outputLines: number;
  removedLines: number;
}

export const DEFAULT_OPTIONS: SortOptions = {
  mode: 'alphabetical',
  naturalOrder: true,
  caseSensitive: false,
  trimWhitespace: false,
  removeEmptyLines: false,
  removeDuplicates: false,
};

type Random = () => number;

/** Split platform and Unicode line separators. An empty editor has zero lines. */
export function splitLines(input: string): string[] {
  return input ? input.split(/\r\n|[\n\r\u0085\u2028\u2029]/) : [];
}

/**
 * Prepare then reorder complete lines. Comparison options never change retained
 * spelling unless whitespace trimming is explicitly selected.
 */
export function sortTextLines(
  input: string,
  options: SortOptions = DEFAULT_OPTIONS,
  locale?: string | string[],
  random: Random = Math.random,
): SortResult {
  const source = splitLines(input);
  const prepared = options.trimWhitespace ? source.map((line) => line.trim()) : source;
  const withoutEmpty = options.removeEmptyLines ? prepared.filter((line) => line.trim() !== '') : prepared;
  const unique = options.removeDuplicates ? keepUnique(withoutEmpty, options, locale) : withoutEmpty;
  const output = reorder(unique, options, locale, random);

  return {
    text: output.join('\n'),
    inputLines: source.length,
    outputLines: output.length,
    removedLines: source.length - output.length,
  };
}

function keepUnique(lines: string[], options: SortOptions, locale: string | string[] | undefined): string[] {
  const seen = new Set<string>();
  return lines.filter((line) => {
    const key = comparisonKey(line, options, locale);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function comparisonKey(line: string, options: SortOptions, locale: string | string[] | undefined): string {
  const normalized = line.normalize('NFC');
  return options.caseSensitive ? normalized : normalized.toLocaleLowerCase(locale);
}

function reorder(
  lines: string[],
  options: SortOptions,
  locale: string | string[] | undefined,
  random: Random,
): string[] {
  if (options.mode === 'reverse') return [...lines].reverse();
  if (options.mode === 'shuffle') return fisherYates(lines, random);

  const collator = new Intl.Collator(locale, {
    numeric: options.naturalOrder,
    sensitivity: options.caseSensitive ? 'variant' : 'base',
  });
  const direction = options.mode === 'alphabetical' ? 1 : -1;
  return lines
    .map((line, index) => ({ line, index }))
    .sort((a, b) => direction * collator.compare(a.line, b.line) || a.index - b.index)
    .map(({ line }) => line);
}

/** Fisher–Yates gives every permutation the same probability with a uniform random source. */
function fisherYates(lines: string[], random: Random): string[] {
  const shuffled = [...lines];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}
