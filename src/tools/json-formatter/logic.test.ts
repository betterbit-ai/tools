import { describe, expect, it } from 'vitest';
import { computeStats, formatJson, lineColumnAt, minifyJson, parseJsonSafe, sortKeysDeep } from './logic';

describe('parseJsonSafe', () => {
  it('parses a normal object', () => {
    const r = parseJsonSafe('{"a": 1, "b": [true, false, null]}');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual({ a: 1, b: [true, false, null] });
  });

  it('parses numbers: negative, decimal, exponent', () => {
    const r = parseJsonSafe('[-5, 0.25, 1e10, -1.5E-3, 0]');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual([-5, 0.25, 1e10, -1.5e-3, 0]);
  });

  it('parses unicode strings and escapes', () => {
    const r = parseJsonSafe('{"한글": "안녕 \\uD83D\\uDE00", "emoji": "🎉"}');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual({ 한글: '안녕 😀', emoji: '🎉' });
  });

  it('rejects empty input', () => {
    const r = parseJsonSafe('   ');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('empty');
  });

  it('rejects a trailing comma in an object', () => {
    const r = parseJsonSafe('{"a": 1,}');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('trailing-comma');
  });

  it('rejects a trailing comma in an array', () => {
    const r = parseJsonSafe('[1, 2,]');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('trailing-comma');
  });

  it('rejects a missing colon', () => {
    const r = parseJsonSafe('{"a" 1}');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('expected-colon');
  });

  it('rejects an unquoted key', () => {
    const r = parseJsonSafe('{a: 1}');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('expected-key');
  });

  it('rejects single-quoted strings as an unexpected token', () => {
    const r = parseJsonSafe("{'a': 1}");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('expected-key');
  });

  it('rejects an unterminated string', () => {
    const r = parseJsonSafe('{"a": "unterminated}');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('unterminated-string');
  });

  it('rejects an invalid escape sequence', () => {
    const r = parseJsonSafe('"bad \\x escape"');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe('invalid-escape');
      expect(r.error.detail).toBe('x');
    }
  });

  it('rejects a raw control character inside a string', () => {
    const r = parseJsonSafe('"line1\nline2"');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('control-character');
  });

  it('rejects a leading-zero number (the "0" is a complete token on its own)', () => {
    const r = parseJsonSafe('[01]');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('expected-comma-or-bracket');
  });

  it('rejects trailing data after a valid value', () => {
    const r = parseJsonSafe('{"a": 1} extra');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('trailing-data');
  });

  it('reports the line and column of a multi-line error', () => {
    const r = parseJsonSafe('{\n  "a": 1,\n  "b":\n}');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.line).toBe(4);
      expect(r.error.column).toBe(1);
    }
  });
});

describe('lineColumnAt', () => {
  it('finds line 1 column 1 at the start', () => {
    expect(lineColumnAt('abc', 0)).toEqual({ line: 1, column: 1 });
  });

  it('counts newlines', () => {
    expect(lineColumnAt('a\nb\nc', 4)).toEqual({ line: 3, column: 1 });
  });

  it('clamps an out-of-range index', () => {
    expect(lineColumnAt('abc', 999)).toEqual({ line: 1, column: 4 });
  });
});

describe('formatJson / minifyJson', () => {
  const value = { b: 1, a: [1, 2] };

  it('indents with 2 spaces', () => {
    expect(formatJson(value, 2)).toBe('{\n  "b": 1,\n  "a": [\n    1,\n    2\n  ]\n}');
  });

  it('indents with a tab', () => {
    expect(formatJson(value, 'tab')).toContain('\t"b": 1');
  });

  it('minifies with no whitespace', () => {
    expect(minifyJson(value)).toBe('{"b":1,"a":[1,2]}');
  });
});

describe('sortKeysDeep', () => {
  it('sorts object keys ordinally, recursively', () => {
    expect(sortKeysDeep({ b: 1, a: { d: 2, c: 3 } })).toEqual({ a: { c: 3, d: 2 }, b: 1 });
    expect(Object.keys(sortKeysDeep({ b: 1, a: 2 }))).toEqual(['a', 'b']);
  });

  it('leaves array order untouched but sorts objects inside', () => {
    const result = sortKeysDeep([{ b: 1, a: 2 }, 3, 1]);
    expect(result).toEqual([{ a: 2, b: 1 }, 3, 1]);
  });

  it('passes through primitives and null', () => {
    expect(sortKeysDeep(null)).toBe(null);
    expect(sortKeysDeep(5)).toBe(5);
    expect(sortKeysDeep('x')).toBe('x');
  });
});

describe('computeStats', () => {
  it('counts keys, values and depth for a nested object', () => {
    const value = { a: 1, b: { c: 2, d: [1, 2, 3] } };
    const stats = computeStats(value, JSON.stringify(value));
    expect(stats.keys).toBe(4); // a, b, c, d
    expect(stats.values).toBe(5); // a:1, c:2, d:[1,2,3]
    expect(stats.depth).toBe(3); // {a,b} -> {c,d} -> [1,2,3]
  });

  it('treats an empty object/array as depth 1', () => {
    expect(computeStats({}, '{}').depth).toBe(1);
    expect(computeStats([], '[]').depth).toBe(1);
  });

  it('counts unicode code points, not UTF-16 units, for characters', () => {
    const raw = '"🎉🎉"'; // each emoji is a surrogate pair (2 UTF-16 units) but 1 code point
    const stats = computeStats('🎉🎉', raw);
    expect(stats.characters).toBe(4); // the two quotes + two emoji code points
  });

  it('counts UTF-8 bytes correctly for Korean text', () => {
    const raw = '"한글"';
    const stats = computeStats('한글', raw);
    // 2 quotes (1 byte each) + 2 Korean chars (3 bytes each in UTF-8)
    expect(stats.bytes).toBe(8);
  });
});
