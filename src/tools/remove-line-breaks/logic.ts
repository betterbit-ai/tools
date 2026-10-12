/** Pure text transformations for the line-break remover. No DOM or Preact. */

export type JoinMode = 'space' | 'remove' | 'custom';

export interface CleanupOptions {
  mode: JoinMode;
  customSeparator: string;
  preserveParagraphs: boolean;
  preserveListItems: boolean;
  joinHyphenatedWords: boolean;
  trimLineWhitespace: boolean;
  collapseSpaces: boolean;
}

export interface CleanupResult {
  text: string;
  inputLineBreaks: number;
  outputLineBreaks: number;
  removedLineBreaks: number;
}

/** The safe default for text copied from a PDF or a narrow email column. */
export const PDF_CLEANUP_OPTIONS: CleanupOptions = {
  mode: 'space',
  customSeparator: '',
  preserveParagraphs: true,
  preserveListItems: true,
  joinHyphenatedWords: true,
  trimLineWhitespace: true,
  collapseSpaces: true,
};

/** Treat platform and Unicode paragraph/line separators as a single internal LF. */
export function normalizeLineBreaks(input: string): string {
  return input.replace(/\r\n|[\r\u0085\u2028\u2029]/g, '\n');
}

export function countLineBreaks(input: string): number {
  return (normalizeLineBreaks(input).match(/\n/g) ?? []).length;
}

/**
 * Joins hard-wrapped text without guessing at sentence boundaries. When paragraph
 * preservation is enabled, one or more blank lines delimit a paragraph. List items
 * are detected only at the start of a line, so ordinary hyphens remain untouched.
 */
export function removeLineBreaks(input: string, options: CleanupOptions): CleanupResult {
  const normalized = normalizeLineBreaks(input);
  const inputLineBreaks = countLineBreaks(normalized);
  if (!normalized) return { text: '', inputLineBreaks, outputLineBreaks: 0, removedLineBreaks: 0 };

  const paragraphs = options.preserveParagraphs ? normalized.split(/\n[\t ]*\n+/) : [normalized];
  const text = paragraphs
    .map((paragraph) => joinParagraph(paragraph, options))
    .filter((paragraph) => paragraph.length > 0)
    .join(options.preserveParagraphs ? '\n\n' : '');
  const outputLineBreaks = countLineBreaks(text);

  return {
    text,
    inputLineBreaks,
    outputLineBreaks,
    removedLineBreaks: Math.max(0, inputLineBreaks - outputLineBreaks),
  };
}

function joinParagraph(paragraph: string, options: CleanupOptions): string {
  const lines = paragraph.split('\n').map((line) => (options.trimLineWhitespace ? line.trim() : line));
  let output = '';

  for (const line of lines) {
    if (!output) {
      output = line;
      continue;
    }

    if (options.preserveListItems && isListItem(line)) {
      output += `\n${line}`;
      continue;
    }

    if (options.joinHyphenatedWords && endsWithHyphenatedLatinWord(output) && startsWithLowercaseLatin(line)) {
      output = output.replace(/-\s*$/, '') + line.replace(/^\s+/, '');
      continue;
    }

    output += separator(options) + line;
  }

  return options.collapseSpaces ? output.replace(/[\t ]{2,}/g, ' ') : output;
}

function separator(options: CleanupOptions): string {
  if (options.mode === 'remove') return '';
  if (options.mode === 'custom') return options.customSeparator;
  return ' ';
}

function isListItem(line: string): boolean {
  return /^\s*(?:[-*•‣◦]|\d+[.)])\s+/.test(line);
}

function endsWithHyphenatedLatinWord(text: string): boolean {
  return /[A-Za-z]-\s*$/.test(text);
}

function startsWithLowercaseLatin(text: string): boolean {
  return /^\s*[a-z]/.test(text);
}
