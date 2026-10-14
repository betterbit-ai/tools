import { describe, expect, it } from 'vitest';
import { buildQuery, convert, encodeComponent, encodeFormValue, parseQuery } from './logic';

describe('url-encoder', () => {
  it('encodes RFC 3986 component data, including Unicode and emoji', () => {
    expect(encodeComponent('a b&c=한글 🚀!')).toBe('a%20b%26c%3D%ED%95%9C%EA%B8%80%20%F0%9F%9A%80%21');
    expect(convert('a%20b%26c%3D%ED%95%9C%EA%B8%80%20%F0%9F%9A%80%21', 'decode', 'component')).toEqual({
      ok: true,
      value: 'a b&c=한글 🚀!',
    });
  });

  it('keeps URL delimiters only in whole-URL mode', () => {
    const input = 'https://example.com/a path?q=a&b=한글#top';
    expect(convert(input, 'encode', 'url')).toEqual({
      ok: true,
      value: 'https://example.com/a%20path?q=a&b=%ED%95%9C%EA%B8%80#top',
    });
    expect(convert('https%3A%2F%2Fexample.com%2Fa%20path%3Fq%3Da', 'decode', 'url')).toEqual({
      ok: true,
      value: 'https%3A%2F%2Fexample.com%2Fa path%3Fq%3Da',
    });
  });

  it('uses plus for spaces and encodes tilde in HTML form values', () => {
    expect(encodeFormValue('a b~!*()')).toBe('a+b%7E%21*%28%29');
    expect(convert('q=hello+world%26%ED%95%9C%EA%B8%80', 'decode', 'form')).toEqual({
      ok: true,
      value: 'q=hello world&한글',
    });
  });

  it('reports malformed percent escapes and malformed UTF-8 without throwing', () => {
    expect(convert('one%2', 'decode', 'component')).toEqual({
      ok: false,
      error: { code: 'invalid-percent-encoding', index: 3 },
    });
    expect(convert('%E0%A4', 'decode', 'component')).toEqual({ ok: false, error: { code: 'invalid-utf8' } });
  });

  it('handles empty and very large input deterministically', () => {
    expect(convert('', 'encode', 'component')).toEqual({ ok: true, value: '' });
    const input = '한글 🚀 '.repeat(50_000);
    const encoded = convert(input, 'encode', 'component');
    expect(encoded.ok).toBe(true);
    if (encoded.ok) expect(convert(encoded.value, 'decode', 'component')).toEqual({ ok: true, value: input });
  });

  it('parses, edits and rebuilds a full URL query while retaining its fragment', () => {
    const parsed = parseQuery('https://example.com/search?q=hello+world&lang=%ED%95%9C%EA%B8%80&debug#top');
    expect(parsed).toEqual({
      prefix: 'https://example.com/search',
      fragment: '#top',
      hasQuestionMark: true,
      parameters: [
        { name: 'q', value: 'hello world', hasEquals: true },
        { name: 'lang', value: '한글', hasEquals: true },
        { name: 'debug', value: '', hasEquals: false },
      ],
    });
    if (!parsed) throw new Error('query should parse');
    expect(buildQuery(parsed, [...parsed.parameters, { name: 'page', value: '2', hasEquals: true }])).toBe(
      'https://example.com/search?q=hello+world&lang=%ED%95%9C%EA%B8%80&debug&page=2#top',
    );
  });

  it('recognizes a bare query but does not mistake plain text for a query', () => {
    const parsed = parseQuery('a=1&empty=');
    expect(parsed?.parameters).toEqual([
      { name: 'a', value: '1', hasEquals: true },
      { name: 'empty', value: '', hasEquals: true },
    ]);
    expect(parseQuery('plain text')).toBeNull();
  });
});
