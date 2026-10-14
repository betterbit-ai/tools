import { describe, expect, it } from 'vitest';
import {
  MAX_DIGITS,
  convertInteger,
  digitValue,
  formatInteger,
  groupDigits,
  groupSizeForBase,
  isBase,
  parseInteger,
} from './logic';

describe('parseInteger', () => {
  it('converts binary to an exact decimal BigInt', () => {
    expect(parseInteger('101101', 2)).toMatchObject({ ok: true, value: 45n, normalized: '101101' });
    expect(parseInteger('0b1111_1111', 2)).toMatchObject({ ok: true, value: 255n, normalized: '11111111' });
  });

  it('accepts signs, whitespace, lowercase digits and matching standard prefixes', () => {
    expect(parseInteger(' - 0x ff ', 16)).toMatchObject({ ok: true, value: -255n, normalized: '-FF' });
    expect(parseInteger('+z', 36)).toMatchObject({ ok: true, value: 35n, normalized: 'Z' });
    expect(parseInteger('0o 755', 8)).toMatchObject({ ok: true, value: 493n, normalized: '755' });
  });

  it('keeps arbitrarily large whole numbers exact beyond Number.MAX_SAFE_INTEGER', () => {
    const result = parseInteger('90071992547409931234567890', 10);
    expect(result).toMatchObject({ ok: true, value: 90071992547409931234567890n });
    expect(formatInteger(90071992547409931234567890n, 16)).toBe('4A817C800000029DA1E6D2');
  });

  it('preserves zero and normalizes leading zeroes', () => {
    expect(parseInteger('0000', 2)).toMatchObject({ ok: true, value: 0n, normalized: '0' });
    expect(parseInteger('-0000', 2)).toMatchObject({ ok: true, value: 0n, normalized: '0' });
    expect(parseInteger('-000A', 16)).toMatchObject({ ok: true, value: -10n, normalized: '-A' });
  });

  it('reports empty input, lone signs and prefixes, and an input above the cap', () => {
    expect(parseInteger('', 10)).toEqual({ ok: false, code: 'empty' });
    expect(parseInteger('-', 10)).toEqual({ ok: false, code: 'missingDigits' });
    expect(parseInteger('0x', 16)).toEqual({ ok: false, code: 'missingDigits' });
    expect(parseInteger('1'.repeat(MAX_DIGITS + 1), 2)).toEqual({ ok: false, code: 'tooLong' });
  });

  it('rejects invalid digits and Unicode lookalikes instead of silently changing the value', () => {
    expect(parseInteger('102', 2)).toEqual({ ok: false, code: 'invalidDigit', character: '2' });
    expect(parseInteger('G', 16)).toEqual({ ok: false, code: 'invalidDigit', character: 'G' });
    expect(parseInteger('１２３', 10)).toEqual({ ok: false, code: 'invalidCharacter', character: '１' });
    expect(parseInteger('한글', 36)).toEqual({ ok: false, code: 'invalidCharacter', character: '한' });
    expect(parseInteger('😀', 10)).toEqual({ ok: false, code: 'invalidCharacter', character: '😀' });
  });

  it('throws for bases outside the documented 2–36 range', () => {
    expect(() => parseInteger('10', 1)).toThrow(RangeError);
    expect(() => parseInteger('10', 37)).toThrow(RangeError);
    expect(() => formatInteger(10n, 1)).toThrow(RangeError);
  });
});

describe('conversion and formatting', () => {
  it('shows binary, octal, decimal, hexadecimal and a custom base in one result', () => {
    const result = convertInteger('255', 10, 36);
    expect(result).toMatchObject({ ok: true, input: '255' });
    if (result.ok) {
      expect(result.conversions).toEqual([
        { base: 2, value: '11111111', grouped: '1111 1111' },
        { base: 8, value: '377', grouped: '377' },
        { base: 10, value: '255', grouped: '255' },
        { base: 16, value: 'FF', grouped: 'FF' },
        { base: 36, value: '73', grouped: '73' },
      ]);
    }
  });

  it('does not duplicate a selected standard target base', () => {
    const result = convertInteger('FF', 16, 10);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.conversions).toHaveLength(4);
  });

  it('uses readable grouping and base helpers at their boundaries', () => {
    expect(groupDigits('-1234567', 3)).toBe('-1 234 567');
    expect(groupDigits('11111111', 4)).toBe('1111 1111');
    expect(groupSizeForBase(2)).toBe(4);
    expect(groupSizeForBase(8)).toBe(3);
    expect(groupSizeForBase(10)).toBe(3);
    expect(groupSizeForBase(16)).toBe(2);
    expect(() => groupDigits('10', 0)).toThrow(RangeError);
    expect(isBase(2)).toBe(true);
    expect(isBase(36)).toBe(true);
    expect(isBase(1)).toBe(false);
    expect(isBase(2.5)).toBe(false);
    expect(digitValue('A')).toBe(10);
    expect(digitValue('z')).toBe(35);
    expect(digitValue('한')).toBe(-1);
  });
});
