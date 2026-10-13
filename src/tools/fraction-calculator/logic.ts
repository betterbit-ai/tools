/** Pure exact arithmetic for fraction-calculator — no DOM, no Preact. */

export type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

export interface Fraction {
  numerator: bigint;
  denominator: bigint;
}

export type FractionInputError = 'empty' | 'invalid' | 'zero-denominator' | 'too-large';

export type ParseFractionResult = { value: Fraction } | { error: FractionInputError };

export interface Calculation {
  first: Fraction;
  second: Fraction;
  result: Fraction;
  rawResult: Fraction;
  commonDenominator?: bigint;
  reciprocal?: Fraction;
  divisorIsZero: boolean;
}

const MAX_DIGITS = 1_000;

/** Parses an integer, finite decimal, simple fraction, or mixed number exactly. */
export function parseFraction(input: string): ParseFractionResult {
  const value = normalizeInput(input);
  if (!value) return { error: 'empty' };
  if ((value.match(/\d/g) ?? []).length > MAX_DIGITS) return { error: 'too-large' };

  const decimal = value.match(/^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))$/);
  if (decimal) {
    const sign = decimal[1] === '-' ? -1n : 1n;
    const whole = decimal[2] ?? '0';
    const fraction = decimal[3] ?? decimal[4] ?? '';
    const denominator = 10n ** BigInt(fraction.length);
    return { value: simplify({ numerator: sign * BigInt(`${whole}${fraction}`), denominator }) };
  }

  const fraction = value.match(/^([+-]?)(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/);
  if (fraction) {
    const denominator = BigInt(fraction[4]);
    if (denominator === 0n) return { error: 'zero-denominator' };
    const whole = BigInt(fraction[2] ?? '0');
    const numerator = whole * denominator + BigInt(fraction[3]);
    return { value: simplify({ numerator: (fraction[1] === '-' ? -1n : 1n) * numerator, denominator }) };
  }

  if (/^[+-]?\d+$/.test(value)) return { value: { numerator: BigInt(value), denominator: 1n } };
  return { error: 'invalid' };
}

/** Performs exact fraction arithmetic. Division by zero is reported, never represented as Infinity. */
export function calculate(first: Fraction, operation: Operation, second: Fraction): Calculation {
  const left = simplify(first);
  const right = simplify(second);
  const commonDenominator =
    operation === 'add' || operation === 'subtract' ? lcm(left.denominator, right.denominator) : undefined;

  if (operation === 'divide' && right.numerator === 0n) {
    return {
      first: left,
      second: right,
      result: { numerator: 0n, denominator: 1n },
      rawResult: { numerator: 0n, denominator: 1n },
      reciprocal: { numerator: 0n, denominator: 1n },
      divisorIsZero: true,
    };
  }

  let rawResult: Fraction;
  let reciprocal: Fraction | undefined;
  if (operation === 'add' || operation === 'subtract') {
    const leftNumerator = left.numerator * (commonDenominator! / left.denominator);
    const rightNumerator = right.numerator * (commonDenominator! / right.denominator);
    rawResult = {
      numerator: operation === 'add' ? leftNumerator + rightNumerator : leftNumerator - rightNumerator,
      denominator: commonDenominator!,
    };
  } else if (operation === 'multiply') {
    rawResult = { numerator: left.numerator * right.numerator, denominator: left.denominator * right.denominator };
  } else {
    reciprocal = { numerator: right.denominator, denominator: right.numerator };
    rawResult = {
      numerator: left.numerator * reciprocal.numerator,
      denominator: left.denominator * reciprocal.denominator,
    };
  }

  return {
    first: left,
    second: right,
    result: simplify(rawResult),
    rawResult,
    commonDenominator,
    reciprocal,
    divisorIsZero: false,
  };
}

export function formatFraction(value: Fraction): string {
  const fraction = simplify(value);
  return fraction.denominator === 1n ? fraction.numerator.toString() : `${fraction.numerator}/${fraction.denominator}`;
}

/** Formats an intermediate fraction without cancelling common factors. */
export function formatRawFraction(value: Fraction): string {
  const sign = value.denominator < 0n ? -1n : 1n;
  const numerator = value.numerator * sign;
  const denominator = value.denominator * sign;
  return denominator === 1n ? numerator.toString() : `${numerator}/${denominator}`;
}

export function formatMixedNumber(value: Fraction): string {
  const fraction = simplify(value);
  const sign = fraction.numerator < 0n ? '-' : '';
  const absolute = abs(fraction.numerator);
  const whole = absolute / fraction.denominator;
  const remainder = absolute % fraction.denominator;
  if (remainder === 0n) return `${sign}${whole}`;
  if (whole === 0n) return formatFraction(fraction);
  return `${sign}${whole} ${remainder}/${fraction.denominator}`;
}

/** Produces an exact finite decimal or a safely truncated recurring decimal. */
export function formatDecimal(value: Fraction, maxDigits = 12): string {
  const fraction = simplify(value);
  if (fraction.numerator === 0n) return '0';
  const sign = fraction.numerator < 0n ? '-' : '';
  const numerator = abs(fraction.numerator);
  const whole = numerator / fraction.denominator;
  let remainder = numerator % fraction.denominator;
  if (remainder === 0n) return `${sign}${whole}`;

  let digits = '';
  while (remainder !== 0n && digits.length < maxDigits) {
    remainder *= 10n;
    digits += (remainder / fraction.denominator).toString();
    remainder %= fraction.denominator;
  }
  return `${sign}${whole}.${digits}${remainder !== 0n ? '…' : ''}`;
}

export function greatestCommonDivisor(a: bigint, b: bigint): bigint {
  let left = abs(a);
  let right = abs(b);
  while (right !== 0n) [left, right] = [right, left % right];
  return left;
}

function simplify(value: Fraction): Fraction {
  if (value.numerator === 0n) return { numerator: 0n, denominator: 1n };
  const sign = value.denominator < 0n ? -1n : 1n;
  const divisor = greatestCommonDivisor(value.numerator, value.denominator);
  return { numerator: (value.numerator / divisor) * sign, denominator: abs(value.denominator) / divisor };
}

function lcm(a: bigint, b: bigint): bigint {
  return abs((a / greatestCommonDivisor(a, b)) * b);
}

function abs(value: bigint): bigint {
  return value < 0n ? -value : value;
}

function normalizeInput(input: string): string {
  return Array.from(input.trim())
    .map((character) => {
      const code = character.charCodeAt(0);
      if (code >= 0xff10 && code <= 0xff19) return String(code - 0xff10);
      if (character === '／' || character === '⁄' || character === '∕') return '/';
      if (character === '−' || character === '–' || character === '—') return '-';
      if (character === '．') return '.';
      return character;
    })
    .join('');
}
