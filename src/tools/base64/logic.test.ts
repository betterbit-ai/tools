import { describe, expect, it } from 'vitest';
import { base64ToBytes, base64ToText, bytesToBase64, textToBase64 } from './logic';

describe('bytesToBase64 / base64ToBytes round trip', () => {
  it('encodes and decodes empty input', () => {
    expect(bytesToBase64(new Uint8Array(), { variant: 'standard', padding: true })).toBe('');
    const result = base64ToBytes('');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.bytes.length).toBe(0);
  });

  it('round-trips every padding length (1, 2, 3 input bytes)', () => {
    for (const len of [1, 2, 3, 4, 5, 6, 7]) {
      const bytes = Uint8Array.from({ length: len }, (_, i) => (i * 37 + 11) % 256);
      const encoded = bytesToBase64(bytes, { variant: 'standard', padding: true });
      const decoded = base64ToBytes(encoded);
      expect(decoded.ok).toBe(true);
      if (decoded.ok) expect([...decoded.bytes]).toEqual([...bytes]);
    }
  });

  it('matches known RFC 4648 test vectors', () => {
    expect(textToBase64('f', { variant: 'standard', padding: true })).toBe('Zg==');
    expect(textToBase64('fo', { variant: 'standard', padding: true })).toBe('Zm8=');
    expect(textToBase64('foo', { variant: 'standard', padding: true })).toBe('Zm9v');
    expect(textToBase64('foob', { variant: 'standard', padding: true })).toBe('Zm9vYg==');
    expect(textToBase64('fooba', { variant: 'standard', padding: true })).toBe('Zm9vYmE=');
    expect(textToBase64('foobar', { variant: 'standard', padding: true })).toBe('Zm9vYmFy');
  });

  it('omits padding when padding is disabled', () => {
    expect(textToBase64('fo', { variant: 'standard', padding: false })).toBe('Zm8');
    expect(textToBase64('f', { variant: 'standard', padding: false })).toBe('Zg');
  });

  it('decodes unpadded input of every remainder length', () => {
    expect(base64ToText('Zg')).toEqual({ ok: true, text: 'f' });
    expect(base64ToText('Zm8')).toEqual({ ok: true, text: 'fo' });
    expect(base64ToText('Zm9v')).toEqual({ ok: true, text: 'foo' });
  });

  it('uses - and _ for the URL-safe variant instead of + and /', () => {
    // byte 0xfb 0xff 0xbf -> standard "+/+/" territory
    const bytes = Uint8Array.from([0xfb, 0xff, 0xbf]);
    const standard = bytesToBase64(bytes, { variant: 'standard', padding: true });
    const urlSafe = bytesToBase64(bytes, { variant: 'url', padding: true });
    expect(standard).toContain('+');
    expect(standard).toContain('/');
    expect(urlSafe).toContain('-');
    expect(urlSafe).toContain('_');
    expect(urlSafe).not.toContain('+');
    expect(urlSafe).not.toContain('/');
  });

  it('decodes URL-safe and standard alphabets without being told which one it is', () => {
    const bytes = Uint8Array.from([0xfb, 0xff, 0xbf]);
    const standard = bytesToBase64(bytes, { variant: 'standard', padding: true });
    const urlSafe = bytesToBase64(bytes, { variant: 'url', padding: true });
    expect(base64ToBytes(standard)).toEqual({ ok: true, bytes });
    expect(base64ToBytes(urlSafe)).toEqual({ ok: true, bytes });
  });

  it('ignores whitespace and newlines (MIME/PEM-wrapped base64)', () => {
    const wrapped = 'Zm9v\nYmFy\n  ';
    expect(base64ToText(wrapped)).toEqual({ ok: true, text: 'foobar' });
  });

  it('round-trips Korean, CJK and emoji through UTF-8', () => {
    for (const text of ['안녕하세요', '日本語テスト', '😀🎉👍🏽', 'mixed 한글 and emoji 🚀']) {
      const encoded = textToBase64(text, { variant: 'standard', padding: true });
      expect(base64ToText(encoded)).toEqual({ ok: true, text });
    }
  });

  it('rejects an invalid character with its position', () => {
    const result = base64ToBytes('Zm9v!YmFy');
    expect(result).toEqual({ ok: false, error: { code: 'invalid-character', index: 4, char: '!' } });
  });

  it('rejects a dangling single leftover character', () => {
    // 5 significant chars can never be a valid base64 length (6 bits is not enough for a byte).
    expect(base64ToBytes('Zm9vY')).toEqual({ ok: false, error: { code: 'invalid-length' } });
  });

  it('rejects more than two padding characters', () => {
    expect(base64ToBytes('Zg===')).toEqual({ ok: false, error: { code: 'invalid-padding', index: 2 } });
  });

  it('rejects non-padding characters after the padding starts', () => {
    expect(base64ToBytes('Zg=g')).toEqual({ ok: false, error: { code: 'invalid-padding', index: 2 } });
  });

  it('reports invalid-utf8 for bytes that are not valid UTF-8 text', () => {
    // 0xff is never valid as a standalone UTF-8 byte.
    const invalidUtf8 = bytesToBase64(Uint8Array.from([0xff, 0xfe]), { variant: 'standard', padding: true });
    expect(base64ToText(invalidUtf8)).toEqual({ ok: false, error: { code: 'invalid-utf8' } });
  });

  it('round-trips arbitrary binary file bytes (not just text)', () => {
    const bytes = Uint8Array.from({ length: 300 }, (_, i) => (i * 97 + 13) % 256);
    const encoded = bytesToBase64(bytes, { variant: 'url', padding: false });
    const decoded = base64ToBytes(encoded);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) expect([...decoded.bytes]).toEqual([...bytes]);
  });
});
