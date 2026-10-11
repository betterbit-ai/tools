/**
 * Pure logic for base64 — no DOM, no Preact. Everything testable lives here.
 * Implements RFC 4648 §4 (standard) and §5 (URL-safe) base64 manually so decoding
 * can lean on one combined alphabet and report exact error positions.
 */

export type Base64Variant = 'standard' | 'url';

export interface EncodeOptions {
  variant: Base64Variant;
  padding: boolean;
}

const ALPHABET_STANDARD = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const ALPHABET_URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Accepts either alphabet (and a mix of both) so decoding never needs a mode switch. */
const REVERSE: Record<string, number> = {};
for (let i = 0; i < ALPHABET_STANDARD.length; i++) REVERSE[ALPHABET_STANDARD[i]] = i;
for (let i = 0; i < ALPHABET_URL.length; i++) REVERSE[ALPHABET_URL[i]] = i;

export function bytesToBase64(bytes: Uint8Array, opts: EncodeOptions): string {
  const alphabet = opts.variant === 'url' ? ALPHABET_URL : ALPHABET_STANDARD;
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const hasB1 = i + 1 < bytes.length;
    const hasB2 = i + 2 < bytes.length;
    const triple = (bytes[i] << 16) | ((hasB1 ? bytes[i + 1] : 0) << 8) | (hasB2 ? bytes[i + 2] : 0);
    out += alphabet[(triple >> 18) & 63];
    out += alphabet[(triple >> 12) & 63];
    out += hasB1 ? alphabet[(triple >> 6) & 63] : opts.padding ? '=' : '';
    out += hasB2 ? alphabet[triple & 63] : opts.padding ? '=' : '';
  }
  return out;
}

export function textToBase64(text: string, opts: EncodeOptions): string {
  return bytesToBase64(new TextEncoder().encode(text), opts);
}

export type Base64DecodeErrorCode = 'invalid-character' | 'invalid-length' | 'invalid-padding' | 'invalid-utf8';

export interface Base64DecodeError {
  code: Base64DecodeErrorCode;
  /** Index into the whitespace-stripped input, when the error is positional. */
  index?: number;
  char?: string;
}

export type Base64BytesResult = { ok: true; bytes: Uint8Array } | { ok: false; error: Base64DecodeError };
export type Base64TextResult = { ok: true; text: string } | { ok: false; error: Base64DecodeError };

/**
 * Decodes base64 (standard or URL-safe, padded or not, optionally wrapped with
 * whitespace/newlines like PEM/MIME blocks) into raw bytes.
 */
export function base64ToBytes(input: string): Base64BytesResult {
  const cleaned = input.replace(/\s/g, '');

  const eqIndex = cleaned.indexOf('=');
  let data = cleaned;
  if (eqIndex !== -1) {
    const tail = cleaned.slice(eqIndex);
    if (!/^=+$/.test(tail) || tail.length > 2) {
      return { ok: false, error: { code: 'invalid-padding', index: eqIndex } };
    }
    data = cleaned.slice(0, eqIndex);
  }

  for (let i = 0; i < data.length; i++) {
    const ch = data[i];
    if (!(ch in REVERSE)) return { ok: false, error: { code: 'invalid-character', index: i, char: ch } };
  }

  if (data.length % 4 === 1) return { ok: false, error: { code: 'invalid-length' } };

  const bytes: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const remaining = Math.min(4, data.length - i);
    const c0 = REVERSE[data[i]];
    const c1 = remaining > 1 ? REVERSE[data[i + 1]] : 0;
    const c2 = remaining > 2 ? REVERSE[data[i + 2]] : 0;
    const c3 = remaining > 3 ? REVERSE[data[i + 3]] : 0;
    const triple = (c0 << 18) | (c1 << 12) | (c2 << 6) | c3;
    bytes.push((triple >> 16) & 0xff);
    if (remaining > 2) bytes.push((triple >> 8) & 0xff);
    if (remaining > 3) bytes.push(triple & 0xff);
  }

  return { ok: true, bytes: Uint8Array.from(bytes) };
}

/** Decodes to text, failing with `invalid-utf8` if the bytes aren't valid UTF-8. */
export function base64ToText(input: string): Base64TextResult {
  const decoded = base64ToBytes(input);
  if (!decoded.ok) return decoded;
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(decoded.bytes);
    return { ok: true, text };
  } catch {
    return { ok: false, error: { code: 'invalid-utf8' } };
  }
}
