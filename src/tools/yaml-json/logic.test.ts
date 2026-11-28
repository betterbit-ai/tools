import { describe, expect, it } from 'vitest';
import { convert, countCommentLines, findUnsafeIntegers } from './logic';

const toJson = (source: string, options: { indent?: 2 | 4; sortKeys?: boolean } = {}) =>
  convert(source, { direction: 'yaml-to-json', indent: options.indent ?? 2, sortKeys: options.sortKeys ?? false });
const toYaml = (source: string, options: { indent?: 2 | 4; sortKeys?: boolean } = {}) =>
  convert(source, { direction: 'json-to-yaml', indent: options.indent ?? 2, sortKeys: options.sortKeys ?? false });

describe('yaml → json', () => {
  it('converts a nested config with lists', async () => {
    const result = await toJson('service: api\nreplicas: 3\ntls:\n  enabled: true\nroutes:\n  - path: /v1/users\n');
    expect(result.ok).toBe(true);
    expect(JSON.parse(result.text)).toEqual({
      service: 'api',
      replicas: 3,
      tls: { enabled: true },
      routes: [{ path: '/v1/users' }],
    });
    expect(result.stats.keys).toBe(6);
    expect(result.stats.depth).toBeGreaterThan(1);
  });

  it('follows the YAML 1.2 core schema instead of the 1.1 truthies', async () => {
    const result = await toJson('yes: yes\nno: no\non: on\ntrue1: true\nn: 010\nv: 1.10\n');
    expect(JSON.parse(result.text)).toEqual({
      yes: 'yes',
      no: 'no',
      on: 'on',
      true1: true,
      n: 10,
      v: 1.1,
    });
  });

  it('keeps a date as the text that was written', async () => {
    const result = await toJson('release: 2026-03-01\nat: 2026-03-01T09:30:00Z\n');
    const parsed = JSON.parse(result.text);
    expect(parsed.release).toBe('2026-03-01');
    expect(parsed.at).toBe('2026-03-01T09:30:00Z');
  });

  it('resolves anchors, aliases and merge keys', async () => {
    const result = await toJson('base: &b\n  image: nginx\n  port: 80\nweb:\n  <<: *b\n  port: 8080\n');
    const parsed = JSON.parse(result.text);
    expect(parsed.web).toEqual({ image: 'nginx', port: 8080 });
    expect(result.notes.some((n) => n.kind === 'merge-applied' && n.count === 1)).toBe(true);
  });

  it('turns a multi-document stream into an array of documents', async () => {
    const result = await toJson('---\nkind: A\n---\nkind: B\n');
    expect(JSON.parse(result.text)).toEqual([{ kind: 'A' }, { kind: 'B' }]);
    expect(result.stats.documents).toBe(2);
    expect(result.notes.some((n) => n.kind === 'multi-document')).toBe(true);
  });

  it('keeps block scalar line breaks and folds the folded ones', async () => {
    const result = await toJson('literal: |\n  one\n  two\nfolded: >\n  one\n  two\n');
    const parsed = JSON.parse(result.text);
    expect(parsed.literal).toBe('one\ntwo\n');
    expect(parsed.folded).toBe('one two\n');
  });

  it('keeps Korean and emoji intact', async () => {
    const result = await toJson('이름: "테스트 😀"\n목록:\n  - 가\n  - 나\n');
    const parsed = JSON.parse(result.text);
    expect(parsed['이름']).toBe('테스트 😀');
    expect(parsed['목록']).toEqual(['가', '나']);
  });

  it('writes binary values as base64 and says so', async () => {
    const result = await toJson('blob: !!binary "aGk="\n');
    expect(JSON.parse(result.text).blob).toBe('aGk=');
    expect(result.notes.some((n) => n.kind === 'binary')).toBe(true);
  });

  it('reports comments that JSON cannot keep', async () => {
    const result = await toJson('# top\na: 1 # inline\nb: 2\n');
    expect(result.notes.some((n) => n.kind === 'comments-dropped' && n.count === 2)).toBe(true);
  });

  it('reports a syntax error with the line and column', async () => {
    const result = await toJson('a: 1\n  b: 2\n');
    expect(result.ok).toBe(false);
    expect(result.error?.line).toBe(2);
    expect(result.error?.message.toLowerCase()).toContain('indentation');
  });

  it('refuses a tab used for indentation', async () => {
    const result = await toJson('a:\n\tb: 1\n');
    expect(result.ok).toBe(false);
    expect(result.error?.line).toBe(2);
  });

  it('refuses a duplicated key rather than silently keeping one value', async () => {
    const result = await toJson('a: 1\na: 2\n');
    expect(result.ok).toBe(false);
    expect(result.error?.message.toLowerCase()).toContain('duplicated');
  });

  it('flags an integer a JavaScript number cannot hold', async () => {
    const result = await toJson('id: 9007199254740993\nsmall: 9007199254740991\n');
    expect(result.ok).toBe(true);
    expect(result.notes.some((n) => n.kind === 'unsafe-integer' && n.line === 1)).toBe(true);
  });

  it('sorts keys recursively when asked', async () => {
    const result = await toJson('b: 2\na:\n  d: 4\n  c: 3\n', { sortKeys: true });
    expect(result.text).toBe('{\n  "a": {\n    "c": 3,\n    "d": 4\n  },\n  "b": 2\n}');
  });

  it('uses four spaces when asked', async () => {
    const result = await toJson('a:\n  b: 1\n', { indent: 4 });
    expect(result.text).toContain('        "b": 1');
  });

  it('returns nothing for empty input', async () => {
    for (const source of ['', '   ', '\n\n']) {
      const result = await toJson(source);
      expect(result.ok).toBe(true);
      expect(result.text).toBe('');
    }
  });
});

describe('json → yaml', () => {
  it('writes a nested object as block YAML', async () => {
    const result = await toYaml('{"name":"api","ports":[80,443],"env":{"DEBUG":false}}');
    expect(result.ok).toBe(true);
    expect(result.text).toBe('name: api\nports:\n  - 80\n  - 443\nenv:\n  DEBUG: false\n');
  });

  it('quotes strings that would otherwise change type', async () => {
    const result = await toYaml('{"a":"true","b":"123","c":"null","d":"a: b"}');
    const roundTrip = await toJson(result.text);
    expect(JSON.parse(roundTrip.text)).toEqual({ a: 'true', b: '123', c: 'null', d: 'a: b' });
  });

  it('keeps Korean text readable instead of escaping it', async () => {
    const result = await toYaml('{"이름":"테스트","emoji":"😀"}');
    expect(result.text).toContain('이름: 테스트');
    expect(result.text).toContain('😀');
  });

  it('sorts keys when asked and keeps the requested indent', async () => {
    const result = await toYaml('{"b":2,"a":{"d":4,"c":3}}', { sortKeys: true, indent: 4 });
    expect(result.text).toBe('a:\n    c: 3\n    d: 4\nb: 2\n');
  });

  it('reports where the JSON is broken', async () => {
    const result = await toYaml('{\n  "a": 1,\n  "b": ,\n}');
    expect(result.ok).toBe(false);
    expect(result.error?.line).toBe(3);
    expect(result.error?.message.length).toBeGreaterThan(3);
  });

  it('flags a big integer the same way', async () => {
    const result = await toYaml('{"id": 12345678901234567890}');
    expect(result.notes.some((n) => n.kind === 'unsafe-integer')).toBe(true);
  });

  it('round-trips JSON → YAML → JSON', async () => {
    const source = JSON.stringify({
      service: 'api',
      replicas: 3,
      tls: { enabled: true, minVersion: '1.3' },
      routes: [
        { path: '/v1/users', limit: 120 },
        { path: '/v1/health', limit: 600 },
      ],
      note: '한글 😀 "quote" #hash',
    });
    const yaml = await toYaml(source);
    const back = await toJson(yaml.text);
    expect(JSON.parse(back.text)).toEqual(JSON.parse(source));
  });

  it('returns nothing for empty input', async () => {
    const result = await toYaml('');
    expect(result.ok).toBe(true);
    expect(result.text).toBe('');
  });
});

describe('scanners', () => {
  it('ignores small integers and quoted digits', () => {
    expect(findUnsafeIntegers('a: 9007199254740991\nb: 42\n')).toEqual([]);
    expect(findUnsafeIntegers('a: 12345678901234567890\nb: 1\n')).toEqual([1]);
    expect(findUnsafeIntegers('a: -12345678901234567890\n')).toEqual([1]);
  });

  it('counts comment lines but not # inside a block scalar', () => {
    expect(countCommentLines('# one\na: 1 # two\nb: 2\n')).toBe(2);
    expect(countCommentLines('text: |\n  # not a comment\n')).toBe(0);
  });
});
