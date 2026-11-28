/**
 * Pure logic for yaml-json — no DOM, no Preact.
 *
 * Parsing and writing use js-yaml (loaded on demand so the tool page itself stays small). The
 * schema is YAML 1.2 core plus merge keys and binary, and deliberately without the timestamp
 * type: a date written as 2026-03-01 stays the string "2026-03-01" instead of turning into a
 * JavaScript Date and losing its text form.
 */
import type * as YamlModule from 'js-yaml';

export type Direction = 'yaml-to-json' | 'json-to-yaml';

export interface ConvertOptions {
  direction: Direction;
  indent: 2 | 4;
  sortKeys: boolean;
}

export type NoteKind =
  'comments-dropped' | 'unsafe-integer' | 'merge-applied' | 'multi-document' | 'binary' | 'duplicate-key';

export interface ConvertNote {
  kind: NoteKind;
  count?: number;
  line?: number;
}

export interface ConvertError {
  message: string;
  line?: number;
  column?: number;
}

export interface ConvertStats {
  keys: number;
  depth: number;
  documents: number;
}

export interface ConvertResult {
  ok: boolean;
  text: string;
  notes: ConvertNote[];
  error?: ConvertError;
  stats: ConvertStats;
}

type Yaml = typeof YamlModule;

let yamlPromise: Promise<Yaml> | null = null;

/** Load js-yaml once per page: the chunk is fetched the first time the tool needs it. */
export function loadYaml(): Promise<Yaml> {
  yamlPromise ??= import('js-yaml');
  return yamlPromise;
}

const MAX_SAFE = 9007199254740991n;

/** Line numbers (1-based) of integers too large for a JavaScript number to hold exactly. */
export function findUnsafeIntegers(source: string): number[] {
  const lines: number[] = [];
  source.split('\n').forEach((raw, index) => {
    const line = raw.replace(/(^|\s)#.*$/, ''); // drop a trailing comment
    for (const match of line.matchAll(/(?<![\w.-])-?\d+(?:\.\d+)?(?![\w.])/g)) {
      const text = match[0];
      if (text.includes('.')) continue;
      const value = BigInt(text);
      if (value > MAX_SAFE || value < -MAX_SAFE) {
        if (!lines.includes(index + 1)) lines.push(index + 1);
      }
    }
  });
  return lines;
}

/** How many comment lines the YAML holds — they cannot survive a conversion to JSON. */
export function countCommentLines(source: string): number {
  let count = 0;
  let inBlock = false;
  for (const raw of source.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    // A block scalar keeps its # as text, so only count comments outside one.
    if (/^[^:#]+:\s*[|>][+-]?\d*\s*$/.test(line)) {
      inBlock = true;
      continue;
    }
    if (inBlock) {
      if (/^\S/.test(raw) && !/^[|>]/.test(line)) inBlock = false;
      else continue;
    }
    if (line.startsWith('#')) count++;
    else if (/^[^'"#]*\s#\s/.test(raw) && !/['"][^'"]*#/.test(raw)) count++;
  }
  return count;
}

interface Walk {
  keys: number;
  depth: number;
}

function walk(value: unknown, depth: number, acc: Walk): void {
  if (value === null || typeof value !== 'object') {
    acc.depth = Math.max(acc.depth, depth);
    return;
  }
  if (Array.isArray(value) || value instanceof Uint8Array) {
    acc.depth = Math.max(acc.depth, depth);
    if (Array.isArray(value)) for (const item of value) walk(item, depth + 1, acc);
    return;
  }
  const entries = Object.entries(value as Record<string, unknown>);
  acc.keys += entries.length;
  acc.depth = Math.max(acc.depth, depth);
  for (const [, item] of entries) walk(item, depth + 1, acc);
}

/** Count object keys and the deepest nesting level, for the summary line under the result. */
export function measure(value: unknown): Walk {
  const acc: Walk = { keys: 0, depth: 0 };
  walk(value, 1, acc);
  return acc;
}

/** JSON cannot hold a byte array or undefined; write bytes as base64 and undefined as null. */
function toJsonSafe(value: unknown, notes: ConvertNote[]): unknown {
  if (value === undefined) return null;
  if (value instanceof Uint8Array) {
    notes.push({ kind: 'binary' });
    let binary = '';
    for (const byte of value) binary += String.fromCharCode(byte);
    return btoa(binary);
  }
  if (Array.isArray(value)) return value.map((item) => toJsonSafe(item, notes));
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      out[key] = toJsonSafe(item, notes);
    }
    return out;
  }
  return value;
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === 'object' && !(value instanceof Uint8Array)) {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

function countMergeKeys(source: string): number {
  let count = 0;
  for (const raw of source.split('\n')) {
    if (/(^|\s)<<\s*:/.test(raw.replace(/(^|\s)#.*$/, ''))) count++;
  }
  return count;
}

const EMPTY_STATS: ConvertStats = { keys: 0, depth: 0, documents: 0 };

export async function convert(source: string, options: ConvertOptions): Promise<ConvertResult> {
  const notes: ConvertNote[] = [];
  if (!source.trim()) return { ok: true, text: '', notes, stats: EMPTY_STATUS() };

  const yaml = await loadYaml();
  const unsafeLines = findUnsafeIntegers(source);

  if (options.direction === 'yaml-to-json') {
    const comments = countCommentLines(source);
    if (comments > 0) notes.push({ kind: 'comments-dropped', count: comments });
    const merges = countMergeKeys(source);
    if (merges > 0) notes.push({ kind: 'merge-applied', count: merges });

    // js-yaml exposes its built-in types at runtime but @types/js-yaml does not declare them.
    const types = (yaml as unknown as { types: Record<string, YamlModule.Type> }).types;
    const schema = yaml.CORE_SCHEMA.extend({
      implicit: [types.merge],
      explicit: [types.binary, types.omap, types.pairs, types.set],
    });

    let documents: unknown[];
    try {
      documents = yaml.loadAll(source, undefined, { schema }) as unknown[];
    } catch (error) {
      const e = error as { message?: string; reason?: string; mark?: { line: number; column: number } };
      return {
        ok: false,
        text: '',
        notes,
        error: {
          message: e.reason ?? e.message ?? 'YAML error',
          line: e.mark ? e.mark.line + 1 : undefined,
          column: e.mark ? e.mark.column + 1 : undefined,
        },
        stats: EMPTY_STATUS(),
      };
    }

    if (documents.length > 1) notes.push({ kind: 'multi-document', count: documents.length });
    const value = documents.length === 1 ? documents[0] : documents;
    const safe = options.sortKeys ? sortKeysDeep(toJsonSafe(value, notes)) : toJsonSafe(value, notes);
    const measured = measure(value);
    if (unsafeLines.length) notes.push({ kind: 'unsafe-integer', count: unsafeLines.length, line: unsafeLines[0] });

    const text = safe === undefined ? '' : (JSON.stringify(safe, null, options.indent) ?? '');
    return {
      ok: true,
      text,
      notes,
      stats: { keys: measured.keys, depth: measured.depth, documents: documents.length },
    };
  }

  // JSON → YAML
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch (error) {
    const message = (error as Error).message;
    const at = /position (\d+)/.exec(message);
    // V8 reports a position only for some failures ("Unexpected token ','" has none), so fall
    // back to this scanner, which walks the same grammar and stops at the first broken token.
    const offset = at ? Number(at[1]) : locateJsonError(source);
    const before = offset === undefined ? '' : source.slice(0, offset);
    const line = offset === undefined ? undefined : before!.split('\n').length;
    const column = offset === undefined ? undefined : before!.length - before!.lastIndexOf('\n');
    return {
      ok: false,
      text: '',
      notes,
      error: { message: cleanJsonError(message), line, column },
      stats: EMPTY_STATUS(),
    };
  }

  if (unsafeLines.length) notes.push({ kind: 'unsafe-integer', count: unsafeLines.length, line: unsafeLines[0] });

  const text = yaml.dump(value, {
    indent: options.indent,
    lineWidth: -1,
    noRefs: true,
    sortKeys: options.sortKeys,
    quotingType: "'",
    forceQuotes: false,
  });
  const measured = measure(value);
  return { ok: true, text, notes, stats: { keys: measured.keys, depth: measured.depth, documents: 1 } };
}

/** Node and browsers both name the failing token; keep the message but drop engine noise. */
function cleanJsonError(message: string): string {
  return message
    .replace(/^JSON\.parse: /, '')
    .replace(/,\s*"[^"]*"\s*is not valid JSON$/, '')
    .replace(/\s*(in JSON )?at position \d+.*$/, '')
    .replace(/\s*\(line \d+ column \d+\)$/, '');
}

/**
 * Index of the first character that breaks the JSON grammar, or undefined when the text parses.
 * Only used to place a caret when the engine's error message carries no position.
 */
export function locateJsonError(source: string): number | undefined {
  let i = 0;
  const fail = (): never => {
    throw i;
  };
  const skip = () => {
    while (i < source.length && /[\s]/.test(source[i])) i++;
  };
  const literal = (word: string) => {
    if (!source.startsWith(word, i)) fail();
    i += word.length;
  };
  const string = () => {
    i++; // opening quote
    while (i < source.length) {
      const c = source[i++];
      if (c === '\\') i++;
      else if (c === '"') return;
    }
    fail();
  };
  const number = () => {
    const match = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/.exec(source.slice(i));
    if (!match) fail();
    i += match![0].length;
  };
  const object = () => {
    i++;
    skip();
    if (source[i] === '}') {
      i++;
      return;
    }
    for (;;) {
      skip();
      if (source[i] !== '"') fail();
      string();
      skip();
      if (source[i] !== ':') fail();
      i++;
      value();
      skip();
      if (source[i] === ',') {
        i++;
        continue;
      }
      if (source[i] === '}') {
        i++;
        return;
      }
      fail();
    }
  };
  const array = () => {
    i++;
    skip();
    if (source[i] === ']') {
      i++;
      return;
    }
    for (;;) {
      value();
      skip();
      if (source[i] === ',') {
        i++;
        continue;
      }
      if (source[i] === ']') {
        i++;
        return;
      }
      fail();
    }
  };
  const value = () => {
    skip();
    const c = source[i];
    if (c === '{') return object();
    if (c === '[') return array();
    if (c === '"') return string();
    if (c === '-' || (c >= '0' && c <= '9')) return number();
    if (c === 't') return literal('true');
    if (c === 'f') return literal('false');
    if (c === 'n') return literal('null');
    return fail();
  };

  try {
    value();
    skip();
    return i === source.length ? undefined : i;
  } catch (at) {
    return typeof at === 'number' ? Math.min(at, source.length) : undefined;
  }
}

const EMPTY_STATUS = (): ConvertStats => ({ ...EMPTY_STATS });
