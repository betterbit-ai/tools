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

export type Base64DecodeErrorCode =
  'invalid-character' | 'invalid-length' | 'invalid-padding' | 'invalid-trailing-bits' | 'invalid-utf8';

export interface Base64DecodeError {
  code: Base64DecodeErrorCode;
  /** Index into the original input, when the error is positional. */
  index?: number;
  char?: string;
}

export type Base64BytesResult = { ok: true; bytes: Uint8Array } | { ok: false; error: Base64DecodeError };
export type Base64TextResult = { ok: true; text: string } | { ok: false; error: Base64DecodeError };

interface NormalizedInput {
  value: string;
  /** Each character's index in the original input, including an optional data: URI prefix. */
  indices: number[];
}

/**
 * The output pane never holds more than this many characters. An 8 MB file becomes
 * an 11 MB Base64 string, and laying that out in the DOM (with break-all wrapping and
 * a polite live region) killed the tab in a real browser, while 7 MB of output was
 * still fine. Two million characters keeps any result up to about 1.5 MB of input
 * readable in full. Copy and download always use the complete value.
 */
export const MAX_DISPLAY_CHARS = 2_000_000;

export interface DisplaySlice {
  text: string;
  truncated: boolean;
  total: number;
}

/** Keeps the first `limit` characters, without splitting a surrogate pair. */
export function sliceForDisplay(text: string, limit = MAX_DISPLAY_CHARS): DisplaySlice {
  if (text.length <= limit) return { text, truncated: false, total: text.length };
  let end = Math.max(0, limit);
  const last = text.charCodeAt(end - 1);
  if (last >= 0xd800 && last <= 0xdbff) end -= 1;
  return { text: text.slice(0, end), truncated: true, total: text.length };
}

/**
 * Removes whitespace and, when present, a RFC 2397 `data:*;base64,` prefix.
 * Retaining source indexes lets validation point to the character users see.
 */
function normalizeInput(input: string): NormalizedInput {
  const dataUri = input.match(/^\s*data:[^,]*;base64,/i);
  const start = dataUri?.[0].length ?? 0;
  const value: string[] = [];
  const indices: number[] = [];

  for (let i = start; i < input.length; i++) {
    if (/\s/.test(input[i])) continue;
    value.push(input[i]);
    indices.push(i);
  }

  return { value: value.join(''), indices };
}

/**
 * How many characters of Base64 actually carry data: the padding, any whitespace and a
 * data: URI header are not payload, so size figures computed from this are honest.
 */
export function base64PayloadLength(input: string): number {
  const { value } = normalizeInput(input);
  const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0;
  return value.length - padding;
}

/**
 * Decodes base64 (standard or URL-safe, padded or not, optionally wrapped with
 * whitespace/newlines like PEM/MIME blocks) into raw bytes.
 */
export function base64ToBytes(input: string): Base64BytesResult {
  const cleaned = normalizeInput(input);

  const eqIndex = cleaned.value.indexOf('=');
  let data = cleaned.value;
  if (eqIndex !== -1) {
    const tail = cleaned.value.slice(eqIndex);
    if (!/^=+$/.test(tail) || tail.length > 2 || eqIndex === 0 || (eqIndex + tail.length) % 4 !== 0) {
      return { ok: false, error: { code: 'invalid-padding', index: cleaned.indices[eqIndex] } };
    }
    data = cleaned.value.slice(0, eqIndex);
  }

  for (let i = 0; i < data.length; i++) {
    const ch = data[i];
    if (!(ch in REVERSE)) {
      return { ok: false, error: { code: 'invalid-character', index: cleaned.indices[i], char: ch } };
    }
  }

  if (data.length % 4 === 1) return { ok: false, error: { code: 'invalid-length' } };

  // RFC 4648 requires the unused bits in a final partial quantum to be zero.
  // Without this, several non-canonical strings decode to the same bytes.
  const remainder = data.length % 4;
  const finalValue = data ? REVERSE[data[data.length - 1]] : 0;
  if ((remainder === 2 && (finalValue & 0b1111) !== 0) || (remainder === 3 && (finalValue & 0b11) !== 0)) {
    return {
      ok: false,
      error: { code: 'invalid-trailing-bits', index: cleaned.indices[data.length - 1] },
    };
  }

  const bytes = new Uint8Array(Math.floor(data.length / 4) * 3 + (remainder === 2 ? 1 : remainder === 3 ? 2 : 0));
  let byteIndex = 0;
  for (let i = 0; i < data.length; i += 4) {
    const remaining = Math.min(4, data.length - i);
    const c0 = REVERSE[data[i]];
    const c1 = remaining > 1 ? REVERSE[data[i + 1]] : 0;
    const c2 = remaining > 2 ? REVERSE[data[i + 2]] : 0;
    const c3 = remaining > 3 ? REVERSE[data[i + 3]] : 0;
    const triple = (c0 << 18) | (c1 << 12) | (c2 << 6) | c3;
    bytes[byteIndex++] = (triple >> 16) & 0xff;
    if (remaining > 2) bytes[byteIndex++] = (triple >> 8) & 0xff;
    if (remaining > 3) bytes[byteIndex++] = triple & 0xff;
  }

  return { ok: true, bytes };
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
