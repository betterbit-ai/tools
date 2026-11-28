/**
 * Pure logic for css-minifier — no DOM, no Preact.
 *
 * Both minifiers are conservative on purpose: they remove comments and redundant whitespace and
 * nothing else. CSS keeps every string, url() and custom property value byte for byte, and the
 * JavaScript minifier never joins two lines, so a statement without a semicolon cannot change
 * meaning. Each result is checked against its input before it is shown.
 */

export type Language = 'css' | 'js';

export interface MinifyOptions {
  language: Language;
  /** Keep /*! … *\/ comments, which usually carry a licence. */
  keepLicense: boolean;
}

export interface MinifyResult {
  ok: boolean;
  text: string;
  inputLength: number;
  outputLength: number;
  removedComments: number;
  problem?: 'unterminated-string' | 'unbalanced-braces' | 'verification-failed';
}

const bytes = (text: string): number => new TextEncoder().encode(text).length;

/** Gzip size in bytes, measured with the browser's own compressor. Null when unavailable. */
export async function gzipSize(text: string): Promise<number | null> {
  if (!text) return 0;
  if (typeof CompressionStream === 'undefined') return null;
  try {
    const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
    const buffer = await new Response(stream).arrayBuffer();
    return buffer.byteLength;
  } catch {
    return null;
  }
}

interface CssScan {
  output: string;
  removedComments: number;
  problem?: MinifyResult['problem'];
}

const NO_SPACE_AFTER = new Set(['{', '}', ';', ',', '(', '[', ':', '>', '+', '~', '=', '!']);
const NO_SPACE_BEFORE = new Set(['{', '}', ';', ',', ')', ']', '>', '+', '~', '=', '!']);

/**
 * Minify CSS. Whitespace is the descendant combinator, so a space is kept whenever the two
 * neighbouring characters are both selector-ish: `.a :hover` must not become `.a:hover`.
 */
export function minifyCss(source: string, keepLicense = true): MinifyResult {
  const scan: CssScan = { output: '', removedComments: 0 };
  let i = 0;
  let pendingSpace = false;
  let lastChar = '';
  let inCustomValue = false;
  let declarationName = '';
  let braceDepth = 0;
  let parenDepth = 0;

  const push = (text: string) => {
    if (pendingSpace && scan.output && needsSpace(lastChar, text[0] ?? '')) scan.output += ' ';
    pendingSpace = false;
    scan.output += text;
    lastChar = text[text.length - 1] ?? lastChar;
  };

  while (i < source.length) {
    const c = source[i];

    if (c === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      const stop = end === -1 ? source.length : end + 2;
      const comment = source.slice(i, stop);
      const licence = comment.startsWith('/*!');
      if (!(keepLicense && licence)) {
        scan.removedComments++;
        pendingSpace = true;
      } else {
        push(comment);
      }
      i = stop;
      continue;
    }

    if (c === '"' || c === "'") {
      const end = findStringEnd(source, i);
      if (end === -1) {
        scan.problem = 'unterminated-string';
        return finish(source, scan);
      }
      push(source.slice(i, end));
      i = end;
      continue;
    }

    if (inCustomValue) {
      if (c === ';' || c === '}') {
        inCustomValue = false;
        continue; // the character is handled below, without a leading space
      }
      // Copy the value exactly: whitespace inside a custom property is part of its value.
      scan.output += c;
      lastChar = c;
      pendingSpace = false;
      i++;
      continue;
    }

    if (/\s/.test(c)) {
      pendingSpace = true;
      i++;
      continue;
    }

    if (c === '(') {
      parenDepth++;
      push('(');
      i++;
      continue;
    }
    if (c === ')') {
      parenDepth = Math.max(0, parenDepth - 1);
      push(')');
      i++;
      continue;
    }
    if (c === '{' && parenDepth === 0) {
      braceDepth++;
      declarationName = '';
      push('{');
      i++;
      continue;
    }
    if (c === '}' && parenDepth === 0) {
      braceDepth = Math.max(0, braceDepth - 1);
      if (scan.output.endsWith(';')) scan.output = scan.output.slice(0, -1);
      push('}');
      i++;
      continue;
    }
    if (c === ';' && parenDepth === 0) {
      declarationName = '';
      push(';');
      i++;
      continue;
    }
    if (c === ':' && parenDepth === 0) {
      if (declarationName.startsWith('--')) inCustomValue = true;
      push(':');
      i++;
      continue;
    }
    if (isNameChar(c)) {
      let j = i;
      while (j < source.length && isNameChar(source[j])) j++;
      declarationName = source.slice(i, j);
      push(declarationName);
      i = j;
      continue;
    }

    push(c);
    i++;
  }

  if (braceDepth !== 0) return { ...finish(source, scan), ok: false, problem: 'unbalanced-braces' };
  const result = finish(source, scan);
  if (result.ok && !literalsPreserved(source, result.text, 'css')) {
    return { ...result, ok: false, text: source, problem: 'verification-failed' };
  }
  return result;
}

function needsSpace(prev: string, next: string): boolean {
  if (!prev || !next) return false;
  if (NO_SPACE_AFTER.has(prev) || NO_SPACE_BEFORE.has(next)) return false;
  if (prev === '@') return false;
  return true;
}

const isNameChar = (c: string): boolean => /[A-Za-z0-9_\-\\\u00a0-\uffff]/.test(c);

function findStringEnd(source: string, start: number): number {
  const quote = source[start];
  let i = start + 1;
  while (i < source.length) {
    if (source[i] === '\\') {
      i += 2;
      continue;
    }
    if (source[i] === quote) return i + 1;
    i++;
  }
  return -1;
}

function finish(source: string, scan: CssScan): MinifyResult {
  const text = scan.output.trim();
  return {
    ok: !scan.problem,
    text: scan.problem ? source : text,
    inputLength: bytes(source),
    outputLength: bytes(scan.problem ? source : text),
    removedComments: scan.removedComments,
    problem: scan.problem,
  };
}

/* ───────────────────────── JavaScript ───────────────────────── */

interface JsScan {
  output: string;
  removedComments: number;
  problem?: MinifyResult['problem'];
  literals: string[];
}

const REGEX_PREFIX = new Set([
  '(',
  ',',
  '=',
  ':',
  '[',
  '!',
  '&',
  '|',
  '?',
  '{',
  '}',
  ';',
  '+',
  '-',
  '*',
  '%',
  '<',
  '>',
  '~',
  '^',
]);
const REGEX_WORDS = new Set([
  'return',
  'typeof',
  'case',
  'do',
  'else',
  'in',
  'of',
  'new',
  'delete',
  'void',
  'throw',
  'yield',
  'await',
]);

/**
 * Minify JavaScript without ever joining two lines. Comments and indentation go, a run of spaces
 * inside a line becomes one space, and literals are copied exactly — a conservative minifier that
 * cannot break automatic semicolon insertion, but also does not rename anything.
 */
export function minifyJs(source: string, keepLicense = true): MinifyResult {
  const scan: JsScan = { output: '', removedComments: 0, literals: [] };
  let i = 0;
  let prevSignificant = '';
  let prevWord = '';

  const append = (text: string) => {
    scan.output += text;
  };

  while (i < source.length) {
    const c = source[i];

    if (c === '/' && source[i + 1] === '/') {
      const end = source.indexOf('\n', i);
      scan.removedComments++;
      i = end === -1 ? source.length : end;
      continue;
    }
    if (c === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      const stop = end === -1 ? source.length : end + 2;
      const comment = source.slice(i, stop);
      if (keepLicense && comment.startsWith('/*!')) {
        append(comment);
      } else {
        scan.removedComments++;
        // A block comment can separate two tokens, so keep one space if it had any around it.
        if (scan.output && !/\s$/.test(scan.output)) append(' ');
      }
      i = stop;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      const end = findStringEnd(source, i);
      if (end === -1) {
        scan.problem = 'unterminated-string';
        return finishJs(source, scan);
      }
      const literal = source.slice(i, end);
      scan.literals.push(literal);
      append(literal);
      prevSignificant = c;
      prevWord = '';
      i = end;
      continue;
    }
    if (c === '/' && (prevSignificant === '' || REGEX_PREFIX.has(prevSignificant) || REGEX_WORDS.has(prevWord))) {
      const end = findRegexEnd(source, i);
      if (end !== -1) {
        const literal = source.slice(i, end);
        scan.literals.push(literal);
        append(literal);
        prevSignificant = '/';
        prevWord = '';
        i = end;
        continue;
      }
    }
    if (c === '\n') {
      // Never join lines: that is what keeps a missing semicolon safe.
      append('\n');
      i++;
      continue;
    }
    if (/\s/.test(c)) {
      let j = i;
      while (j < source.length && /\s/.test(source[j]) && source[j] !== '\n') j++;
      if (j < source.length && source[j] === '\n') {
        i = j;
        continue;
      }
      append(' ');
      i = j;
      continue;
    }

    append(c);
    prevSignificant = c;
    if (/[A-Za-z_$]/.test(c)) {
      let j = i + 1;
      while (j < source.length && /[A-Za-z0-9_$]/.test(source[j])) j++;
      append(source.slice(i + 1, j));
      prevWord = source.slice(i, j);
      prevSignificant = source[j - 1];
      i = j;
      continue;
    }
    prevWord = '';
    i++;
  }

  return finishJs(source, scan);
}

function findRegexEnd(source: string, start: number): number {
  let i = start + 1;
  let inClass = false;
  while (i < source.length) {
    const c = source[i];
    if (c === '\\') {
      i += 2;
      continue;
    }
    if (c === '\n') return -1;
    if (c === '[') inClass = true;
    else if (c === ']') inClass = false;
    else if (c === '/' && !inClass) {
      i++;
      while (i < source.length && /[a-z]/.test(source[i])) i++;
      return i;
    }
    i++;
  }
  return -1;
}

function finishJs(source: string, scan: JsScan): MinifyResult {
  const text = scan.problem ? source : trimJs(scan.output);
  const result: MinifyResult = {
    ok: !scan.problem,
    text,
    inputLength: bytes(source),
    outputLength: bytes(text),
    removedComments: scan.removedComments,
    problem: scan.problem,
  };
  if (result.ok && !literalsPreserved(source, result.text, 'js')) {
    return { ...result, ok: false, text: source, problem: 'verification-failed' };
  }
  return result;
}

const trimJs = (text: string): string =>
  text
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line) => line.length > 0)
    .join('\n');

/** Every literal in the source must appear, in order, in the output. */
export function literalsPreserved(source: string, output: string, language: Language): boolean {
  const extract = (code: string): string[] => {
    const found: string[] = [];
    for (let i = 0; i < code.length; i++) {
      const c = code[i];
      if (c === '"' || c === "'" || (language === 'js' && c === '`')) {
        const end = findStringEnd(code, i);
        if (end === -1) return found;
        found.push(code.slice(i, end));
        i = end - 1;
      }
    }
    return found;
  };
  const before = extract(source);
  const after = extract(output);
  return before.length === after.length && before.every((literal, index) => literal === after[index]);
}

/** Guess the language from the text, so pasting the right kind of file needs no setting. */
export function detectLanguage(source: string): Language {
  const trimmed = source.trim();
  if (!trimmed) return 'css';
  if (/^[^{}]*[{]/.test(trimmed) && /[a-zA-Z-]+\s*:\s*[^;{}]+;/.test(trimmed)) return 'css';
  if (/\b(function|const|let|var|=>|import|export|class)\b/.test(trimmed)) return 'js';
  if (trimmed.startsWith('{') || /[;]\s*$/m.test(trimmed)) return 'js';
  return 'css';
}
