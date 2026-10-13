import { describe, expect, it } from 'vitest';
import {
  calculate,
  formatDecimal,
  formatFraction,
  formatMixedNumber,
  formatRawFraction,
  greatestCommonDivisor,
  parseFraction,
} from './logic';

const fraction = (input: string) => {
  const parsed = parseFraction(input);
  if ('error' in parsed) throw new Error(parsed.error);
  return parsed.value;
};

describe('parseFraction', () => {
  it('reads fractions, mixed numbers, integers, and finite decimals exactly', () => {
    expect(formatFraction(fraction('6/8'))).toBe('3/4');
    expect(formatFraction(fraction('-2 1/3'))).toBe('-7/3');
    expect(formatFraction(fraction('7'))).toBe('7');
    expect(formatFraction(fraction('.125'))).toBe('1/8');
  });

  it('normalizes full-width digits, fraction slashes, and a Unicode minus sign', () => {
    expect(formatFraction(fraction('−２⁄４'))).toBe('-1/2');
  });

  it('rejects empty, malformed, zero-denominator, emoji, Korean text, and excessively long input', () => {
    expect(parseFraction('')).toEqual({ error: 'empty' });
    expect(parseFraction('1/')).toEqual({ error: 'invalid' });
    expect(parseFraction('1/0')).toEqual({ error: 'zero-denominator' });
    expect(parseFraction('🍰 1/2')).toEqual({ error: 'invalid' });
    expect(parseFraction('삼분의 일')).toEqual({ error: 'invalid' });
    expect(parseFraction('9'.repeat(1001))).toEqual({ error: 'too-large' });
  });
});

describe('calculate', () => {
  it('adds using the least common denominator and simplifies the result', () => {
    const result = calculate(fraction('1/2'), 'add', fraction('1/3'));
    expect(result.commonDenominator).toBe(6n);
    expect(formatRawFraction(result.rawResult)).toBe('5/6');
    expect(formatFraction(result.result)).toBe('5/6');
  });

  it('subtracts, multiplies, and divides with exact BigInt arithmetic', () => {
    expect(formatFraction(calculate(fraction('1/6'), 'subtract', fraction('3/4')).result)).toBe('-7/12');
    expect(formatFraction(calculate(fraction('123456789123456789/7'), 'multiply', fraction('7/9')).result)).toBe(
      '13717421013717421',
    );
    const divided = calculate(fraction('5/6'), 'divide', fraction('2/3'));
    expect(formatFraction(divided.reciprocal!)).toBe('3/2');
    expect(formatFraction(divided.result)).toBe('5/4');
  });

  it('reports an undefined zero divisor instead of calculating Infinity', () => {
    expect(calculate(fraction('1/2'), 'divide', fraction('0')).divisorIsZero).toBe(true);
  });
});

describe('formatting', () => {
  it('formats improper and negative fractions as mixed numbers', () => {
    expect(formatMixedNumber(fraction('13/6'))).toBe('2 1/6');
    expect(formatMixedNumber(fraction('-13/6'))).toBe('-2 1/6');
  });

  it('keeps unsimplified intermediate values available for the working', () => {
    expect(formatRawFraction(calculate(fraction('1/6'), 'add', fraction('1/3')).rawResult)).toBe('3/6');
  });

  it('shows finite decimals exactly and recurring decimals with a visible truncation mark', () => {
    expect(formatDecimal(fraction('1/8'))).toBe('0.125');
    expect(formatDecimal(fraction('1/3'), 6)).toBe('0.333333…');
  });

  it('handles zero boundaries in GCD', () => {
    expect(greatestCommonDivisor(0n, 18n)).toBe(18n);
    expect(greatestCommonDivisor(0n, 0n)).toBe(0n);
  });
});
