import { describe, expect, it } from 'vitest';
import { countReferences, decodeHtml, encodeHtml, namedEntityCount } from './logic';

const enc = (
  input: string,
  mode: 'minimal' | 'non-ascii' | 'all' = 'minimal',
  format: 'named' | 'decimal' | 'hex' = 'named',
) => encodeHtml(input, { mode, format });

describe('encode', () => {
  it('escapes the five characters that change meaning in HTML', () => {
    expect(enc('Tom & Jerry said "hi"')).toBe('Tom &amp; Jerry said &quot;hi&quot;');
    expect(enc('<b>x</b>')).toBe('&lt;b&gt;x&lt;/b&gt;');
  });

  it('leaves accented letters, Korean and emoji alone on the minimal level', () => {
    expect(enc('Café 한글 😀')).toBe('Café 한글 😀');
  });

  it('escapes quotes but not apostrophes as a name, because HTML 4 has no apos', () => {
    expect(enc("it's")).toBe('it&#39;s');
  });

  it('writes non-ASCII as one reference per code point, not per UTF-16 unit', () => {
    expect(enc('Café', 'non-ascii', 'decimal')).toBe('Caf&#233;');
    // The emoji is one code point (U+1F600), so it must not become two surrogate references.
    expect(enc('😀', 'non-ascii', 'decimal')).toBe('&#128512;');
    expect(enc('가', 'non-ascii', 'decimal')).toBe('&#44032;');
  });

  it('uses hexadecimal digits when asked', () => {
    expect(enc('é', 'non-ascii', 'hex')).toBe('&#xE9;');
    expect(enc('😀', 'non-ascii', 'hex')).toBe('&#x1F600;');
  });

  it('prefers HTML 4 names and falls back to hex for characters without one', () => {
    expect(enc('© ™ … é', 'non-ascii', 'named')).toBe('&copy; &trade; &hellip; &eacute;');
    expect(enc('가', 'non-ascii', 'named')).toBe('&#xAC00;');
    expect(enc('§', 'minimal', 'named')).toBe('§');
  });

  it('keeps tabs and line breaks readable, or turns line breaks into references on request', () => {
    expect(enc('a\nb', 'non-ascii', 'decimal')).toBe('a\nb');
    expect(encodeHtml('a\nb', { mode: 'minimal', format: 'decimal', lineBreaks: true })).toBe('a&#10;b');
  });

  it('encodes every non-alphanumeric character on the "all" level', () => {
    expect(enc('a.b,c (d)', 'all', 'decimal')).toBe('a&#46;b&#44;c &#40;d&#41;');
  });

  it('keeps the escape for the ampersand it just wrote out of reach', () => {
    // An already escaped string must be escaped again, so nothing turns back into markup.
    expect(enc('&amp;')).toBe('&amp;amp;');
  });

  it('handles an empty string and a long document', () => {
    expect(enc('')).toBe('');
    const long = 'Tom & Jerry 😀\n'.repeat(10_000);
    const out = enc(long, 'non-ascii', 'decimal');
    expect(out.length).toBeGreaterThan(long.length);
    expect(out).not.toContain('😀');
  });
});

describe('decode', () => {
  it('decodes named, decimal and hexadecimal references', () => {
    expect(decodeHtml('&amp; &lt; &gt; &quot; &#39;').text).toBe('& < > " \'');
    expect(decodeHtml('&#233; &#xE9; &#XE9;').text).toBe('é é é');
    expect(decodeHtml('&#128512;').text).toBe('😀');
  });

  it('decodes the non-breaking space and typographic names', () => {
    expect(decodeHtml('a&nbsp;b&mdash;c&hellip;').text).toBe('a\u00a0b\u2014c\u2026');
  });

  it('decodes names that stand for several code points', () => {
    const { text, unknown } = decodeHtml('&NotEqualTilde;');
    expect([...text].map((c) => c.codePointAt(0))).toEqual([0x2242, 0x0338]);
    expect(unknown).toEqual([]);
  });

  it('accepts the legacy names without a semicolon, as browsers do', () => {
    expect(decodeHtml('&copy 2026 &notit;').text).toBe('© 2026 ¬it;');
  });

  it('needs the semicolon for the names added in HTML 5', () => {
    expect(decodeHtml('&tradex').text).toBe('&tradex');
  });

  it('leaves unknown references untouched and reports them once', () => {
    const result = decodeHtml('&bogus; &bogus; &nope;');
    expect(result.text).toBe('&bogus; &bogus; &nope;');
    expect(result.unknown).toEqual(['&bogus;', '&nope;']);
    expect(result.replaced).toBe(0);
  });

  it('replaces out-of-range and surrogate values with the replacement character', () => {
    expect(decodeHtml('&#0;').text).toBe('\ufffd');
    expect(decodeHtml('&#x110000;').text).toBe('\ufffd');
    expect(decodeHtml('&#xD800;').text).toBe('\ufffd');
    expect(decodeHtml('&#0;').invalid).toBe(1);
  });

  it('reports that one pass was not enough for double-encoded text', () => {
    const once = decodeHtml('&amp;lt;b&amp;gt;');
    expect(once.text).toBe('&lt;b&gt;');
    expect(once.remaining).toBe(2);
    expect(decodeHtml(once.text).text).toBe('<b>');
    expect(decodeHtml(once.text).remaining).toBe(0);
  });

  it('counts references without decoding them', () => {
    expect(countReferences('&amp; &#65; &#x41; &bogus')).toBe(3);
    expect(countReferences('plain text')).toBe(0);
  });

  it('round-trips text through every format', () => {
    const source = 'Café & <b>"한글" 😀</b> — 100% &eacute; &bogus;';
    for (const mode of ['minimal', 'non-ascii', 'all'] as const) {
      for (const format of ['named', 'decimal', 'hex'] as const) {
        const encoded = encodeHtml(source, { mode, format });
        expect(decodeHtml(encoded).text, `${mode}/${format}`).toBe(source);
      }
    }
  });

  it('handles an empty string', () => {
    expect(decodeHtml('').text).toBe('');
    expect(decodeHtml('').replaced).toBe(0);
  });
});

describe('entity table', () => {
  it('covers the full HTML 5 named reference set', () => {
    expect(namedEntityCount()).toBeGreaterThan(2000);
  });
});
