import { describe, expect, it } from 'vitest';
import { detectLanguage, gzipSize, literalsPreserved, minifyCss, minifyJs } from './logic';

describe('css', () => {
  it('removes comments, indentation and the last semicolon', () => {
    const css = `/* Card */
.card {
  margin: 0;
  color: #ffffff;
}
`;
    expect(minifyCss(css).text).toBe('.card{margin:0;color:#ffffff}');
  });

  it('keeps a descendant space that would otherwise become a different selector', () => {
    expect(minifyCss('.a :hover { color: red }').text).toBe('.a :hover{color:red}');
    expect(minifyCss('.a > .b { color: red }').text).toBe('.a>.b{color:red}');
    expect(minifyCss('.a [data-x] { color: red }').text).toBe('.a [data-x]{color:red}');
  });

  it('keeps strings, escapes and url() contents byte for byte', () => {
    const css = `a { background: url("data:image/svg+xml;charset=utf8,%3Csvg%3E"); content: "a  b"; }`;
    const result = minifyCss(css);
    expect(result.text).toContain('url("data:image/svg+xml;charset=utf8,%3Csvg%3E")');
    expect(result.text).toContain('content:"a  b"');
  });

  it('does not mistake a semicolon inside url() for a declaration end', () => {
    const css = 'a { background: url(a;b.png); color: red; }';
    expect(minifyCss(css).text).toBe('a{background:url(a;b.png);color:red}');
  });

  it('copies a custom property value exactly', () => {
    const css = ':root { --gap:  4px   8px ; --empty: ; }';
    const result = minifyCss(css);
    expect(result.text).toContain('--gap:  4px   8px');
    expect(result.text).toContain('--empty:');
  });

  it('drops comments but keeps licence comments by default', () => {
    const css = '/*! MIT */\n/* gone */\na { color: red; }';
    const result = minifyCss(css, true);
    expect(result.text).toBe('/*! MIT */ a{color:red}');
    expect(result.removedComments).toBe(1);
    expect(minifyCss(css, false).text).toBe('a{color:red}');
  });

  it('minifies @media and nested blocks', () => {
    const css = `@media (min-width: 600px) {
  .a { color: red; }
  .b { color: blue; }
}`;
    expect(minifyCss(css).text).toBe('@media (min-width:600px){.a{color:red}.b{color:blue}}');
  });

  it('reports a string that is never closed and leaves the input alone', () => {
    const css = 'a { content: "oops }';
    const result = minifyCss(css);
    expect(result.ok).toBe(false);
    expect(result.text).toBe(css);
    expect(result.problem).toBe('unterminated-string');
  });

  it('reports unbalanced braces', () => {
    const result = minifyCss('a { color: red;');
    expect(result.ok).toBe(false);
    expect(result.problem).toBe('unbalanced-braces');
  });

  it('handles Korean content and an empty stylesheet', () => {
    expect(minifyCss('a::after { content: "한글"; }').text).toBe('a::after{content:"한글"}');
    expect(minifyCss('').text).toBe('');
  });
});

describe('js', () => {
  it('removes comments and indentation but keeps line breaks', () => {
    const js = `// header
function add(a, b) {
  // sum
  return a + b;
}

const x = 1;
`;
    const result = minifyJs(js);
    expect(result.text).toBe('function add(a, b) {\nreturn a + b;\n}\nconst x = 1;');
    expect(result.removedComments).toBe(2);
  });

  it('never joins two lines, so a missing semicolon cannot change meaning', () => {
    const js = 'const a = b\n(function () {})()\n';
    const result = minifyJs(js);
    expect(result.text.split('\n').length).toBe(js.trim().split('\n').length);
  });

  it('keeps strings, template literals and regex literals exactly', () => {
    const js = `const s = "a  b"; const t = \`x \${y}  z\`; const r = /a  b/g; const q = 'it\\'s';`;
    const result = minifyJs(js);
    expect(result.text).toContain('"a  b"');
    expect(result.text).toContain('`x ${y}  z`');
    expect(result.text).toContain('/a  b/g');
    expect(result.text).toContain("'it\\'s'");
  });

  it('does not read a division as a regex', () => {
    const result = minifyJs('const x = a / b / c;');
    expect(result.text).toBe('const x = a / b / c;');
  });

  it('reads a regex after return', () => {
    const result = minifyJs('function f() { return /a+/.test(x); }');
    expect(result.text).toContain('/a+/');
  });

  it('keeps a block comment that acts as a licence', () => {
    const js = '/*! (c) 2026 */\nconst x = 1;';
    expect(minifyJs(js, true).text).toContain('/*! (c) 2026 */');
    expect(minifyJs(js, false).text).toBe('const x = 1;');
  });

  it('keeps a space where a block comment separated two tokens', () => {
    expect(minifyJs('const a = 1;/*x*/const b = 2;').text).toBe('const a = 1; const b = 2;');
  });

  it('reports an unclosed string and leaves the input alone', () => {
    const js = 'const s = "oops';
    const result = minifyJs(js);
    expect(result.ok).toBe(false);
    expect(result.text).toBe(js);
  });

  it('handles Korean text and an empty file', () => {
    expect(minifyJs('const s = "한글";').text).toBe('const s = "한글";');
    expect(minifyJs('').text).toBe('');
    expect(minifyJs('  \n\n  ').text).toBe('');
  });
});

describe('verification and helpers', () => {
  it('sees the same literals before and after', () => {
    expect(literalsPreserved('a{content:"x"}', 'a{content:"x"}', 'css')).toBe(true);
    expect(literalsPreserved('a{content:"x"}', 'a{content:"y"}', 'css')).toBe(false);
  });

  it('measures the gzip size of the output', async () => {
    const size = await gzipSize('a{color:red}'.repeat(100));
    expect(size).toBeGreaterThan(0);
    expect(size!).toBeLessThan(100 * 'a{color:red}'.length);
  });

  it('guesses the language from the text', () => {
    expect(detectLanguage('.a { color: red; }')).toBe('css');
    expect(detectLanguage('function f() { return 1; }')).toBe('js');
    expect(detectLanguage('import x from "y";')).toBe('js');
    expect(detectLanguage('')).toBe('css');
  });
});
