/** Pure text de-duplication. No DOM or Preact. */

export type KeepOccurrence = 'first' | 'last';
export type SortOrder = 'original' | 'ascending' | 'descending';

export interface DeduplicateOptions {
  caseSensitive: boolean;
  trimWhitespace: boolean;
  removeEmptyLines: boolean;
  normalizeUnicode: boolean;
  keepOccurrence: KeepOccurrence;
  sortOrder: SortOrder;
}

export interface DeduplicateResult {
  text: string;
  inputLines: number;
  outputLines: number;
  duplicatesRemoved: number;
  emptyLinesRemoved: number;
}

/** Order-preserving comparison is the least surprising default. */
export const DEFAULT_OPTIONS: DeduplicateOptions = {
  caseSensitive: true,
  trimWhitespace: false,
  removeEmptyLines: false,
  normalizeUnicode: true,
  keepOccurrence: 'first',
  sortOrder: 'original',
};

/** Split all common line ending forms. An empty editor has zero lines. */
export function splitLines(input: string): string[] {
  return input ? input.split(/\r\n|[\n\r\u0085\u2028\u2029]/) : [];
}

/**
 * Remove repeated lines while preserving the original retained spelling and
 * whitespace. Matching options only affect the comparison key, never output.
 */
export function removeDuplicateLines(
  input: string,
  options: DeduplicateOptions = DEFAULT_OPTIONS,
  locale?: string | string[],
): DeduplicateResult {
  const sourceLines = splitLines(input);
  const lines = options.removeEmptyLines ? sourceLines.filter((line) => line.trim() !== '') : sourceLines;
  const emptyLinesRemoved = sourceLines.length - lines.length;
  const kept = keepUnique(lines, options, locale);
  const sorted = sortLines(kept, options.sortOrder, locale);

  return {
    text: sorted.join('\n'),
    inputLines: sourceLines.length,
    outputLines: sorted.length,
    duplicatesRemoved: lines.length - kept.length,
    emptyLinesRemoved,
  };
}

function keepUnique(lines: string[], options: DeduplicateOptions, locale: string | string[] | undefined): string[] {
  const seen = new Set<string>();
  const retained: string[] = [];
  const ordered = options.keepOccurrence === 'last' ? [...lines].reverse() : lines;

  for (const line of ordered) {
    const key = comparisonKey(line, options, locale);
    if (seen.has(key)) continue;
    seen.add(key);
    retained.push(line);
  }

  return options.keepOccurrence === 'last' ? retained.reverse() : retained;
}

function comparisonKey(line: string, options: DeduplicateOptions, locale: string | string[] | undefined): string {
  let key = options.trimWhitespace ? line.trim() : line;
  if (options.normalizeUnicode) key = key.normalize('NFC');
  return options.caseSensitive ? key : key.toLocaleLowerCase(locale);
}

function sortLines(lines: string[], order: SortOrder, locale: string | string[] | undefined): string[] {
  if (order === 'original') return lines;
  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'variant' });
  return [...lines].sort((a, b) => (order === 'ascending' ? collator.compare(a, b) : collator.compare(b, a)));
}
