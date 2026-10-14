/**
 * Pure logic for number-base-converter — no DOM, no Preact. Values are parsed
 * as BigInt so whole-number conversions never lose precision at 2^53.
 */

export const MIN_BASE = 2;
export const MAX_BASE = 36;
export const MAX_DIGITS = 10_000;
export const STANDARD_BASES = [2, 8, 10, 16] as const;

export type StandardBase = (typeof STANDARD_BASES)[number];
export type ParseErrorCode = 'empty' | 'missingDigits' | 'tooLong' | 'invalidCharacter' | 'invalidDigit';

export interface ParseSuccess {
  ok: true;
  value: bigint;
  normalized: string;
}

export interface ParseFailure {
  ok: false;
  code: ParseErrorCode;
  character?: string;
}

export type ParseResult = ParseSuccess | ParseFailure;

export function isBase(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= MIN_BASE && value <= MAX_BASE;
}

export function digitValue(character: string): number {
  const code = character.charCodeAt(0);
  if (code >= 48 && code <= 57) return code - 48;
  if (code >= 65 && code <= 90) return code - 65 + 10;
  if (code >= 97 && code <= 122) return code - 97 + 10;
  return -1;
}

/**
 * Removes only ASCII grouping separators. Other Unicode characters deliberately
 * remain invalid so pasted lookalike digits and letters cannot change a value.
 */
function compactInput(input: string): string {
  return input.replace(/[\t\n\r _]/g, '');
}

function prefixLength(value: string, base: number): number {
  const prefix = value.slice(0, 2).toLowerCase();
  if ((base === 2 && prefix === '0b') || (base === 8 && prefix === '0o') || (base === 16 && prefix === '0x')) return 2;
  return 0;
}

/** Parses a signed whole number written in bases 2–36, exactly. */
export function parseInteger(input: string, base: number): ParseResult {
  if (!isBase(base)) throw new RangeError(`Base must be an integer from ${MIN_BASE} through ${MAX_BASE}.`);

  let value = compactInput(input);
  if (!value) return { ok: false, code: 'empty' };

  let sign = 1n;
  if (value[0] === '+' || value[0] === '-') {
    if (value[0] === '-') sign = -1n;
    value = value.slice(1);
  }

  value = value.slice(prefixLength(value, base));
  if (!value) return { ok: false, code: 'missingDigits' };
  if (value.length > MAX_DIGITS) return { ok: false, code: 'tooLong' };

  let result = 0n;
  const radix = BigInt(base);
  for (const character of value) {
    const digit = digitValue(character);
    if (digit === -1) return { ok: false, code: 'invalidCharacter', character };
    if (digit >= base) return { ok: false, code: 'invalidDigit', character };
    result = result * radix + BigInt(digit);
  }

  const normalizedDigits = value.toUpperCase().replace(/^0+(?=.)/, '');
  const signedResult = result * sign;
  return { ok: true, value: signedResult, normalized: `${signedResult < 0n ? '-' : ''}${normalizedDigits}` };
}

/** Formats a whole number in a base from 2 through 36 using uppercase letters. */
export function formatInteger(value: bigint, base: number): string {
  if (!isBase(base)) throw new RangeError(`Base must be an integer from ${MIN_BASE} through ${MAX_BASE}.`);
  return value.toString(base).toUpperCase();
}

/** Groups a formatted result without changing the underlying value. */
export function groupDigits(value: string, groupSize: number): string {
  if (!Number.isInteger(groupSize) || groupSize < 1) throw new RangeError('Group size must be a positive integer.');
  const sign = value.startsWith('-') ? '-' : '';
  const digits = sign ? value.slice(1) : value;
  const firstGroup = digits.length % groupSize || groupSize;
  const groups = [digits.slice(0, firstGroup)];
  for (let index = firstGroup; index < digits.length; index += groupSize)
    groups.push(digits.slice(index, index + groupSize));
  return `${sign}${groups.filter(Boolean).join(' ')}`;
}

export function groupSizeForBase(base: number): number {
  if (base === 2) return 4;
  if (base === 8) return 3;
  if (base === 16) return 2;
  return 3;
}

export interface Conversion {
  base: number;
  value: string;
  grouped: string;
}

export interface ConversionResult {
  ok: true;
  input: string;
  conversions: Conversion[];
}

/** Converts valid input to all standard bases and one arbitrary target base. */
export function convertInteger(input: string, fromBase: number, targetBase: number): ParseFailure | ConversionResult {
  if (!isBase(targetBase)) throw new RangeError(`Base must be an integer from ${MIN_BASE} through ${MAX_BASE}.`);
  const parsed = parseInteger(input, fromBase);
  if (!parsed.ok) return parsed;

  const bases = [...STANDARD_BASES, targetBase].filter((base, index, all) => all.indexOf(base) === index);
  return {
    ok: true,
    input: parsed.normalized,
    conversions: bases.map((base) => {
      const value = formatInteger(parsed.value, base);
      return { base, value, grouped: groupDigits(value, groupSizeForBase(base)) };
    }),
  };
}
