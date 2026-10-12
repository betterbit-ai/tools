import { describe, expect, it } from 'vitest';
import {
  dateTimeToMilliseconds,
  detectUnit,
  formatDateTimeInput,
  formatDisplayTime,
  millisecondsToSeconds,
  parseTimestamp,
} from './logic';

describe('Unix timestamp parsing', () => {
  it('converts epoch seconds and milliseconds with automatic detection', () => {
    const seconds = parseTimestamp('1704067200');
    const milliseconds = parseTimestamp('1704067200123');
    expect(seconds).toMatchObject({
      status: 'valid',
      conversion: { unit: 'seconds', millisecondsText: '1704067200000', iso: '2024-01-01T00:00:00.000Z' },
    });
    expect(milliseconds).toMatchObject({
      status: 'valid',
      conversion: { unit: 'milliseconds', seconds: '1704067200.123' },
    });
  });

  it('handles the epoch, negative pre-epoch values, and explicit unit overrides', () => {
    expect(parseTimestamp('0')).toMatchObject({
      status: 'valid',
      conversion: { unit: 'seconds', iso: '1970-01-01T00:00:00.000Z' },
    });
    expect(parseTimestamp('-86400')).toMatchObject({
      status: 'valid',
      conversion: { iso: '1969-12-31T00:00:00.000Z' },
    });
    expect(parseTimestamp('1704067200', 'milliseconds')).toMatchObject({
      status: 'valid',
      conversion: { unit: 'milliseconds', iso: '1970-01-20T17:21:07.200Z' },
    });
  });

  it('rejects blanks, decimals, separators, Unicode digits, emoji, and out-of-range values', () => {
    expect(parseTimestamp('')).toEqual({ status: 'empty' });
    expect(parseTimestamp('1704067200.5')).toEqual({ status: 'invalid', reason: 'number' });
    expect(parseTimestamp('1,704,067,200')).toEqual({ status: 'invalid', reason: 'number' });
    expect(parseTimestamp('１７０４０６７２００')).toEqual({ status: 'invalid', reason: 'number' });
    expect(parseTimestamp('1704067200🕒')).toEqual({ status: 'invalid', reason: 'number' });
    expect(parseTimestamp('999999999999999999999999')).toEqual({ status: 'invalid', reason: 'range' });
  });

  it('documents the digit convention and preserves sub-second values exactly', () => {
    expect(detectUnit('0000000001')).toBe('seconds');
    expect(detectUnit('1704067200123')).toBe('milliseconds');
    expect(millisecondsToSeconds(-1n)).toBe('-0.001');
    expect(millisecondsToSeconds(12_340n)).toBe('12.34');
  });
});

describe('date and time input', () => {
  it('converts a UTC datetime exactly and formats it back for the input', () => {
    const value = dateTimeToMilliseconds('2024-01-01T00:00', 'utc');
    expect(value).toBe(1_704_067_200_000);
    expect(formatDateTimeInput(value!, 'utc')).toBe('2024-01-01T00:00');
  });

  it('rejects impossible calendar dates and malformed Unicode values', () => {
    expect(dateTimeToMilliseconds('2024-02-30T12:00', 'utc')).toBeUndefined();
    expect(dateTimeToMilliseconds('2024-01-01T24:00', 'utc')).toBeUndefined();
    expect(dateTimeToMilliseconds('2024년-01-01T12:00', 'utc')).toBeUndefined();
    expect(dateTimeToMilliseconds('2024-01-01T12:00🕒', 'utc')).toBeUndefined();
  });

  it('uses a 24-hour localized display for timestamp results', () => {
    const display = formatDisplayTime(1_704_067_200_000, 'ko', 'utc');
    expect(display).toMatch(/0:00:00/);
    expect(display).not.toMatch(/AM|PM/);
  });
});
