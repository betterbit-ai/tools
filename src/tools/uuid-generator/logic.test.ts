import { describe, expect, it } from 'vitest';
import {
  MAX_COUNT,
  createV4,
  createV7,
  formatOutput,
  formatUuid,
  generateUuids,
  validateSettings,
  type RandomBytes,
  type UuidSettings,
} from './logic';

const bytes =
  (...values: number[]): RandomBytes =>
  (length) =>
    new Uint8Array(values.slice(0, length));
const defaults: UuidSettings = { version: 'v4', count: 1, format: 'standard', uppercase: false, output: 'lines' };

describe('uuid-generator', () => {
  it('sets RFC 9562 v4 version and variant bits while retaining random bits', () => {
    const value = createV4(bytes(0, 1, 2, 3, 4, 5, 0xab, 7, 0x43, 9, 10, 11, 12, 13, 14, 15));
    expect(formatUuid(value, 'standard')).toBe('00010203-0405-4b07-8309-0a0b0c0d0e0f');
    expect(value[6] >> 4).toBe(4);
    expect(value[8] >> 6).toBe(2);
  });

  it('puts the v7 Unix millisecond timestamp in the first 48 bits and sets required bits', () => {
    const timestamp = 1_717_201_234_567;
    const value = createV7(timestamp, bytes(255, 255, 255, 255, 255, 255, 0x0a, 8, 0x7f, 10, 11, 12, 13, 14, 15, 16));
    expect(formatUuid(value, 'standard')).toBe('018fd12b-6a87-7a08-bf0a-0b0c0d0e0f10');
    expect(value[6] >> 4).toBe(7);
    expect(value[8] >> 6).toBe(2);
  });

  it('supports every copy format, including Unicode-safe JSON output', () => {
    const value = new Uint8Array(16);
    expect(formatUuid(value, 'compact', true)).toBe('00000000000000000000000000000000');
    expect(formatUuid(value, 'braces')).toBe('{00000000-0000-0000-0000-000000000000}');
    expect(formatUuid(value, 'urn')).toBe('urn:uuid:00000000-0000-0000-0000-000000000000');
    expect(formatUuid(new Uint8Array(Array(16).fill(255)), 'urn', true)).toBe(
      'urn:uuid:FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF',
    );
    expect(formatOutput(['한글', '😀'], 'json')).toBe('[\n  "한글",\n  "😀"\n]');
  });

  it('generates the requested boundary-sized batch and rejects invalid counts', () => {
    const batch = generateUuids({ ...defaults, count: MAX_COUNT }, bytes(...Array(16).fill(0)), 0);
    expect(batch.ok && batch.values).toHaveLength(MAX_COUNT);
    expect(validateSettings({ ...defaults, count: 0 })).toBe('invalid-count');
    expect(validateSettings({ ...defaults, count: MAX_COUNT + 1 })).toBe('invalid-count');
  });

  it('rejects invalid random sources, timestamps, and byte lengths rather than producing malformed UUIDs', () => {
    expect(() => createV4(() => new Uint8Array(15))).toThrow(RangeError);
    expect(() => createV7(-1, bytes(...Array(16).fill(0)))).toThrow(RangeError);
    expect(() => createV7(0x1_0000_0000_0000, bytes(...Array(16).fill(0)))).toThrow(RangeError);
    expect(() => formatUuid(new Uint8Array(15), 'standard')).toThrow(RangeError);
  });
});
