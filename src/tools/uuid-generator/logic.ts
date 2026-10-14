/** Pure UUID generation and presentation logic. Browser randomness is supplied by the caller. */

export const MAX_COUNT = 10_000;
const MAX_TIMESTAMP = 0xffff_ffff_ffff;

export type UuidVersion = 'v4' | 'v7';
export type UuidTextFormat = 'standard' | 'compact' | 'braces' | 'urn';
export type OutputFormat = 'lines' | 'json';
export type RandomBytes = (length: number) => Uint8Array;

export interface UuidSettings {
  version: UuidVersion;
  count: number;
  format: UuidTextFormat;
  uppercase: boolean;
  output: OutputFormat;
}

export type ValidationError = 'invalid-count';

export function validateSettings(settings: UuidSettings): ValidationError | null {
  return Number.isSafeInteger(settings.count) && settings.count >= 1 && settings.count <= MAX_COUNT
    ? null
    : 'invalid-count';
}

function randomUuidBytes(source: RandomBytes): Uint8Array {
  const bytes = source(16);
  if (!(bytes instanceof Uint8Array) || bytes.length !== 16) {
    throw new RangeError('Random source must return exactly 16 bytes.');
  }
  return bytes.slice();
}

/** Creates an RFC 9562 version 4 UUID from 16 random bytes. */
export function createV4(source: RandomBytes): Uint8Array {
  const bytes = randomUuidBytes(source);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bytes;
}

/** Creates an RFC 9562 version 7 UUID with a 48-bit Unix-millisecond timestamp. */
export function createV7(timestamp: number, source: RandomBytes): Uint8Array {
  if (!Number.isSafeInteger(timestamp) || timestamp < 0 || timestamp > MAX_TIMESTAMP) {
    throw new RangeError('Timestamp must be a non-negative 48-bit integer in milliseconds.');
  }

  const bytes = randomUuidBytes(source);
  for (let index = 0; index < 6; index++) {
    bytes[index] = Math.floor(timestamp / 2 ** (8 * (5 - index))) & 0xff;
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bytes;
}

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Formats 16 UUID bytes as standard, compact, brace-wrapped, or RFC URN text. */
export function formatUuid(bytes: Uint8Array, format: UuidTextFormat, uppercase = false): string {
  if (bytes.length !== 16) throw new RangeError('UUIDs are exactly 16 bytes.');
  const compact = uppercase ? hex(bytes).toUpperCase() : hex(bytes);
  const standard = `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20)}`;
  const value =
    format === 'compact'
      ? compact
      : format === 'braces'
        ? `{${standard}}`
        : format === 'urn'
          ? `urn:uuid:${standard}`
          : standard;
  return value;
}

/** Generates a batch. v7 values share the supplied millisecond timestamp by design. */
export function generateUuids(
  settings: UuidSettings,
  source: RandomBytes,
  timestamp: number,
): { ok: true; values: string[] } | { ok: false; error: ValidationError } {
  const error = validateSettings(settings);
  if (error) return { ok: false, error };

  const create = settings.version === 'v4' ? () => createV4(source) : () => createV7(timestamp, source);
  return {
    ok: true,
    values: Array.from({ length: settings.count }, () => formatUuid(create(), settings.format, settings.uppercase)),
  };
}

/** Turns a batch into a copy-ready plain-text list or JSON array. */
export function formatOutput(values: readonly string[], output: OutputFormat): string {
  return output === 'json' ? JSON.stringify(values, null, 2) : values.join('\n');
}
