/**
 * Pure logic for json-formatter — no DOM, no Preact. Everything testable lives here.
 *
 * Errors are reported via a hand-rolled recursive-descent JSON scanner instead of
 * relying on `JSON.parse`'s thrown message: engines disagree on wording and some
 * (older Safari/Firefox) don't expose a line/column at all, which breaks the
 * "오류 위치 표시" edge. The scanner only runs on the (already-failed) error path,
 * so the native, highly optimized `JSON.parse` stays the hot path for valid input.
 */

export type JsonErrorCode =
  | 'empty'
  | 'unexpected-end'
  | 'unexpected-token'
  | 'expected-key'
  | 'expected-colon'
  | 'expected-comma-or-brace'
  | 'expected-comma-or-bracket'
  | 'trailing-comma'
  | 'unterminated-string'
  | 'invalid-escape'
  | 'invalid-unicode-escape'
  | 'control-character'
  | 'invalid-number'
  | 'trailing-data';

export interface JsonError {
  code: JsonErrorCode;
  /** Offending token/character, substituted into the localized message template. */
  detail?: string;
  /** 0-based character index into the input. */
  index: number;
  /** 1-based. */
  line: number;
  /** 1-based. */
  column: number;
}

export type ParseResult = { ok: true; value: unknown } | { ok: false; error: JsonError };

class JsonSyntaxError extends Error {
  code: JsonErrorCode;
  detail?: string;
  index: number;
  constructor(code: JsonErrorCode, index: number, detail?: string) {
    super(code);
    this.code = code;
    this.index = index;
    this.detail = detail;
  }
}

const DIGIT = (c: string | undefined) => c !== undefined && c >= '0' && c <= '9';

function scan(input: string): void {
  const len = input.length;
  let i = 0;

  const fail = (code: JsonErrorCode, at = i, detail?: string): never => {
    throw new JsonSyntaxError(code, at, detail);
  };
  const skipWs = () => {
    while (i < len && (input[i] === ' ' || input[i] === '\t' || input[i] === '\n' || input[i] === '\r')) i++;
  };

  const parseValue = (): void => {
    skipWs();
    if (i >= len) fail('unexpected-end');
    const c = input[i];
    if (c === '{') return parseObject();
    if (c === '[') return parseArray();
    if (c === '"') return parseString();
    if (c === '-' || DIGIT(c)) return parseNumber();
    if (input.startsWith('true', i)) {
      i += 4;
      return;
    }
    if (input.startsWith('false', i)) {
      i += 5;
      return;
    }
    if (input.startsWith('null', i)) {
      i += 4;
      return;
    }
    fail('unexpected-token', i, c);
  };

  const parseObject = (): void => {
    i++; // '{'
    skipWs();
    if (input[i] === '}') {
      i++;
      return;
    }
    for (;;) {
      skipWs();
      if (input[i] !== '"') fail('expected-key');
      parseString();
      skipWs();
      if (input[i] !== ':') fail('expected-colon');
      i++;
      parseValue();
      skipWs();
      if (input[i] === ',') {
        i++;
        skipWs();
        if (input[i] === '}') fail('trailing-comma');
        continue;
      }
      if (input[i] === '}') {
        i++;
        return;
      }
      fail('expected-comma-or-brace');
    }
  };

  const parseArray = (): void => {
    i++; // '['
    skipWs();
    if (input[i] === ']') {
      i++;
      return;
    }
    for (;;) {
      parseValue();
      skipWs();
      if (input[i] === ',') {
        i++;
        skipWs();
        if (input[i] === ']') fail('trailing-comma');
        continue;
      }
      if (input[i] === ']') {
        i++;
        return;
      }
      fail('expected-comma-or-bracket');
    }
  };

  const parseString = (): void => {
    const start = i;
    i++; // opening quote
    for (;;) {
      if (i >= len) fail('unterminated-string', start);
      const c = input[i];
      if (c === '"') {
        i++;
        return;
      }
      if (c === '\\') {
        const esc = input[i + 1];
        if (esc === undefined) fail('unterminated-string', start);
        if ('"\\/bfnrt'.includes(esc)) {
          i += 2;
        } else if (esc === 'u') {
          const hex = input.slice(i + 2, i + 6);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) fail('invalid-unicode-escape', i);
          i += 6;
        } else {
          fail('invalid-escape', i, esc);
        }
        continue;
      }
      if (c.charCodeAt(0) < 0x20) fail('control-character', i);
      i++;
    }
  };

  const parseNumber = (): void => {
    const start = i;
    if (input[i] === '-') i++;
    if (input[i] === '0') {
      i++;
    } else if (DIGIT(input[i])) {
      while (DIGIT(input[i])) i++;
    } else {
      fail('invalid-number', start);
    }
    if (input[i] === '.') {
      i++;
      if (!DIGIT(input[i])) fail('invalid-number', start);
      while (DIGIT(input[i])) i++;
    }
    if (input[i] === 'e' || input[i] === 'E') {
      i++;
      if (input[i] === '+' || input[i] === '-') i++;
      if (!DIGIT(input[i])) fail('invalid-number', start);
      while (DIGIT(input[i])) i++;
    }
  };

  parseValue();
  skipWs();
  if (i < len) fail('trailing-data');
}

export function lineColumnAt(input: string, index: number): { line: number; column: number } {
  const clamped = Math.max(0, Math.min(index, input.length));
  let line = 1;
  let lastNewline = -1;
  for (let i = 0; i < clamped; i++) {
    if (input[i] === '\n') {
      line++;
      lastNewline = i;
    }
  }
  return { line, column: clamped - lastNewline };
}

function locateJsonError(input: string): JsonError {
  try {
    scan(input);
    return { code: 'trailing-data', index: input.length, ...lineColumnAt(input, input.length) };
  } catch (e) {
    if (e instanceof JsonSyntaxError) {
      return { code: e.code, detail: e.detail, index: e.index, ...lineColumnAt(input, e.index) };
    }
    throw e;
  }
}

export function parseJsonSafe(input: string): ParseResult {
  if (input.trim() === '') {
    return { ok: false, error: { code: 'empty', index: 0, line: 1, column: 1 } };
  }
  try {
    return { ok: true, value: JSON.parse(input) };
  } catch {
    return { ok: false, error: locateJsonError(input) };
  }
}

export type IndentOption = 2 | 4 | 'tab';

export function formatJson(value: unknown, indent: IndentOption): string {
  return JSON.stringify(value, null, indent === 'tab' ? '\t' : indent);
}

export function minifyJson(value: unknown): string {
  return JSON.stringify(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Recursively sorts object keys ordinally (byte-wise); array order is left untouched. */
export function sortKeysDeep<T>(value: T): T {
  if (Array.isArray(value)) return value.map((v) => sortKeysDeep(v)) as unknown as T;
  if (isPlainObject(value)) {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))) {
      sorted[key] = sortKeysDeep(value[key]);
    }
    return sorted as unknown as T;
  }
  return value;
}

function depthOf(value: unknown): number {
  if (Array.isArray(value)) return value.length === 0 ? 1 : 1 + Math.max(...value.map(depthOf));
  if (isPlainObject(value)) {
    const vals = Object.values(value);
    return vals.length === 0 ? 1 : 1 + Math.max(...vals.map(depthOf));
  }
  return 0;
}

function countKeys(value: unknown): number {
  if (Array.isArray(value)) return value.reduce((sum: number, v) => sum + countKeys(v), 0);
  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    return entries.reduce((sum, [, v]) => sum + countKeys(v), entries.length);
  }
  return 0;
}

function countLeaves(value: unknown): number {
  if (Array.isArray(value)) return value.reduce((sum: number, v) => sum + countLeaves(v), 0);
  if (isPlainObject(value)) return Object.values(value).reduce((sum: number, v) => sum + countLeaves(v), 0);
  return 1;
}

export interface JsonStats {
  bytes: number;
  characters: number;
  depth: number;
  keys: number;
  values: number;
}

export function computeStats(value: unknown, raw: string): JsonStats {
  return {
    bytes: new TextEncoder().encode(raw).length,
    characters: Array.from(raw).length,
    depth: depthOf(value),
    keys: countKeys(value),
    values: countLeaves(value),
  };
}
