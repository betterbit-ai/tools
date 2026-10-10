/**
 * Pure logic for scientific-calculator — no DOM, no Preact. Everything testable lives here.
 *
 * A hand-written recursive-descent parser/evaluator for calculator expressions
 * (e.g. "sin(30)+sqrt(16)^2"). No `eval()` — arbitrary input must never run as JS.
 */
import type { Locale } from '../../i18n/locales';

export type AngleMode = 'deg' | 'rad';
export type EvalErrorKind = 'empty' | 'syntax' | 'domain' | 'overflow';
export type EvalResult = { ok: true; value: number } | { ok: false; error: EvalErrorKind };

export interface HistoryEntry {
  expr: string;
  result: number;
  at: number;
}

export const MAX_HISTORY = 30;

/** Functions that take one argument in parentheses, e.g. "sin(30)". */
const FUNCTIONS = new Set(['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'ln', 'log', 'sqrt', 'cbrt', 'abs', 'exp']);

class CalcError extends Error {
  constructor(public kind: EvalErrorKind) {
    super(kind);
  }
}

interface Cursor {
  s: string;
  i: number;
}

/** Evaluates a calculator expression. Never throws — syntax/domain/overflow issues come back as `ok: false`. */
export function evaluate(input: string, angleMode: AngleMode): EvalResult {
  const expr = input.trim();
  if (expr === '') return { ok: false, error: 'empty' };
  const c: Cursor = { s: normalize(expr), i: 0 };
  try {
    const value = parseAddSub(c, angleMode);
    if (peekChar(c) !== undefined) throw new CalcError('syntax');
    const cleaned = cleanNumber(value);
    if (!Number.isFinite(cleaned)) throw new CalcError('overflow');
    return { ok: true, value: cleaned };
  } catch (e) {
    return { ok: false, error: e instanceof CalcError ? e.kind : 'syntax' };
  }
}

/** Maps the alternate symbols the keypad inserts onto the ASCII ones the parser reads. */
function normalize(expr: string): string {
  return expr.replaceAll('×', '*').replaceAll('÷', '/').replaceAll('−', '-');
}

function skipSpaces(c: Cursor): void {
  while (c.i < c.s.length && c.s[c.i] === ' ') c.i++;
}

function peekChar(c: Cursor): string | undefined {
  skipSpaces(c);
  return c.s[c.i];
}

function parseAddSub(c: Cursor, mode: AngleMode): number {
  let value = parseMulDiv(c, mode);
  for (;;) {
    const ch = peekChar(c);
    if (ch !== '+' && ch !== '-') return value;
    c.i++;
    const rhs = parseMulDiv(c, mode);
    value = ch === '+' ? value + rhs : value - rhs;
  }
}

function parseMulDiv(c: Cursor, mode: AngleMode): number {
  let value = parseUnary(c, mode);
  for (;;) {
    const ch = peekChar(c);
    if (ch !== '*' && ch !== '/') return value;
    c.i++;
    const rhs = parseUnary(c, mode);
    if (ch === '/') {
      if (rhs === 0) throw new CalcError('domain');
      value = value / rhs;
    } else {
      value = value * rhs;
    }
  }
}

function parseUnary(c: Cursor, mode: AngleMode): number {
  const ch = peekChar(c);
  if (ch === '-') {
    c.i++;
    return -parseUnary(c, mode);
  }
  if (ch === '+') {
    c.i++;
    return parseUnary(c, mode);
  }
  return parsePow(c, mode);
}

/** Right-associative: 2^3^2 = 2^(3^2) = 512. */
function parsePow(c: Cursor, mode: AngleMode): number {
  const base = parsePostfix(c, mode);
  if (peekChar(c) !== '^') return base;
  c.i++;
  const exp = parseUnary(c, mode);
  if (base < 0 && !Number.isInteger(exp)) throw new CalcError('domain');
  return Math.pow(base, exp);
}

function parsePostfix(c: Cursor, mode: AngleMode): number {
  let value = parsePrimary(c, mode);
  for (;;) {
    const ch = peekChar(c);
    if (ch === '!') {
      c.i++;
      value = factorial(value);
    } else if (ch === '%') {
      c.i++;
      value = value / 100;
    } else {
      return value;
    }
  }
}

function parsePrimary(c: Cursor, mode: AngleMode): number {
  const ch = peekChar(c);
  if (ch === undefined) throw new CalcError('syntax');
  if (ch === '(') {
    c.i++;
    const value = parseAddSub(c, mode);
    if (peekChar(c) !== ')') throw new CalcError('syntax');
    c.i++;
    return value;
  }
  if (ch === 'π') {
    c.i++;
    return Math.PI;
  }
  if ((ch >= '0' && ch <= '9') || ch === '.') return parseNumber(c);
  if (/[a-zA-Z]/.test(ch)) return parseIdentifier(c, mode);
  throw new CalcError('syntax');
}

function parseNumber(c: Cursor): number {
  const start = c.i;
  let sawDot = false;
  while (c.i < c.s.length) {
    const ch = c.s[c.i];
    if (ch >= '0' && ch <= '9') {
      c.i++;
    } else if (ch === '.' && !sawDot) {
      sawDot = true;
      c.i++;
    } else {
      break;
    }
  }
  const text = c.s.slice(start, c.i);
  if (text === '' || text === '.') throw new CalcError('syntax');
  return Number(text);
}

function parseIdentifier(c: Cursor, mode: AngleMode): number {
  const start = c.i;
  while (c.i < c.s.length && /[a-zA-Z]/.test(c.s[c.i])) c.i++;
  const name = c.s.slice(start, c.i).toLowerCase();
  if (name === 'e') return Math.E;
  if (name === 'pi') return Math.PI; // typing "pi" works too, not just the π button
  if (!FUNCTIONS.has(name)) throw new CalcError('syntax');
  if (peekChar(c) !== '(') throw new CalcError('syntax');
  c.i++;
  const arg = parseAddSub(c, mode);
  if (peekChar(c) !== ')') throw new CalcError('syntax');
  c.i++;
  return applyFunction(name, arg, mode);
}

function toRadians(x: number, mode: AngleMode): number {
  return mode === 'deg' ? (x * Math.PI) / 180 : x;
}

function fromRadians(x: number, mode: AngleMode): number {
  return mode === 'deg' ? (x * 180) / Math.PI : x;
}

function applyFunction(name: string, arg: number, mode: AngleMode): number {
  switch (name) {
    case 'sin':
      return Math.sin(toRadians(arg, mode));
    case 'cos':
      return Math.cos(toRadians(arg, mode));
    case 'tan': {
      const rad = toRadians(arg, mode);
      // cos(rad) ~ 0 means the angle is an odd multiple of 90°/π/2 — mathematically undefined.
      if (Math.abs(Math.cos(rad)) < 1e-10) throw new CalcError('domain');
      return Math.tan(rad);
    }
    case 'asin':
      if (arg < -1 || arg > 1) throw new CalcError('domain');
      return fromRadians(Math.asin(arg), mode);
    case 'acos':
      if (arg < -1 || arg > 1) throw new CalcError('domain');
      return fromRadians(Math.acos(arg), mode);
    case 'atan':
      return fromRadians(Math.atan(arg), mode);
    case 'ln':
      if (arg <= 0) throw new CalcError('domain');
      return Math.log(arg);
    case 'log':
      if (arg <= 0) throw new CalcError('domain');
      return Math.log10(arg);
    case 'sqrt':
      if (arg < 0) throw new CalcError('domain');
      return Math.sqrt(arg);
    case 'cbrt':
      return Math.cbrt(arg);
    case 'abs':
      return Math.abs(arg);
    case 'exp':
      return Math.exp(arg);
    default:
      throw new CalcError('syntax');
  }
}

/** 170! is the largest integer factorial that fits in a double; 171! overflows to Infinity. */
function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new CalcError('domain');
  if (n > 170) return Infinity;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

/** Rounds away binary floating-point noise (e.g. sin(30°) = 0.49999999999999994) and snaps near-zero to 0. */
function cleanNumber(n: number): number {
  if (!Number.isFinite(n)) return n;
  if (Math.abs(n) < 1e-10) return 0;
  return Number(n.toPrecision(12));
}

/** Formats a result for display: grouped decimal for everyday sizes, trimmed exponential for extremes. */
export function formatResult(value: number, locale: Locale): string {
  if (!Number.isFinite(value)) return value > 0 ? '∞' : '-∞';
  const abs = Math.abs(value);
  if (value !== 0 && (abs >= 1e15 || abs < 1e-9)) {
    return trimExponential(value.toExponential(6));
  }
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 10 }).format(value);
}

function trimExponential(s: string): string {
  const [mantissa, exp] = s.split('e');
  const trimmed = mantissa.includes('.') ? mantissa.replace(/0+$/, '').replace(/\.$/, '') : mantissa;
  return `${trimmed}e${exp}`;
}

/** Prepends `entry` and caps the list at {@link MAX_HISTORY}, newest first. */
export function pushHistory(history: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  return [entry, ...history].slice(0, MAX_HISTORY);
}

/**
 * Renders a result as plain decimal text (always "." for the decimal point, never grouped
 * or exponential) so it can be fed straight back into the expression parser — e.g. to keep
 * typing after pressing "=". Display formatting (`formatResult`) is locale-aware and lossy
 * by comparison; this one round-trips through {@link evaluate}.
 */
export function toPlainString(n: number): string {
  if (!Number.isFinite(n)) return n > 0 ? 'Infinity' : '-Infinity';
  return new Intl.NumberFormat('en-US', { useGrouping: false, maximumFractionDigits: 20 }).format(n);
}
