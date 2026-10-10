import { describe, expect, it } from 'vitest';
import { type HistoryEntry, MAX_HISTORY, evaluate, formatResult, pushHistory, toPlainString } from './logic';

function val(expr: string, mode: 'deg' | 'rad' = 'deg'): number {
  const r = evaluate(expr, mode);
  if (!r.ok) throw new Error(`expected ok, got error ${r.error} for "${expr}"`);
  return r.value;
}

function err(expr: string, mode: 'deg' | 'rad' = 'deg') {
  const r = evaluate(expr, mode);
  if (r.ok) throw new Error(`expected error, got value ${r.value} for "${expr}"`);
  return r.error;
}

describe('evaluate: arithmetic and precedence', () => {
  it('follows standard operator precedence', () => {
    expect(val('2+3*4')).toBe(14);
    expect(val('(2+3)*4')).toBe(20);
  });

  it('applies unary minus after exponentiation, like calculator.net and physical calculators', () => {
    expect(val('-2^2')).toBe(-4);
    expect(val('(-2)^2')).toBe(4);
  });

  it('exponentiation is right-associative', () => {
    expect(val('2^3^2')).toBe(512); // 2^(3^2), not (2^3)^2 = 64
  });

  it('handles decimals and negative numbers', () => {
    expect(val('0.1+0.2')).toBe(0.3); // floating-point noise cleaned away
    expect(val('-5+3')).toBe(-2);
  });

  it('percent divides by 100 in place', () => {
    expect(val('50%')).toBe(0.5);
    expect(val('200+10%')).toBeCloseTo(200.1, 10);
  });

  it('factorial covers 0, boundary and overflow', () => {
    expect(val('0!')).toBe(1);
    expect(val('5!')).toBe(120);
    expect(val('170!')).toBeGreaterThan(0);
    expect(err('171!')).toBe('overflow');
    expect(err('(-1)!')).toBe('domain');
    expect(err('2.5!')).toBe('domain');
  });
});

describe('evaluate: functions', () => {
  it('trig in degree mode', () => {
    expect(val('sin(90)', 'deg')).toBe(1);
    expect(val('cos(90)', 'deg')).toBe(0);
    expect(val('sin(180)', 'deg')).toBe(0);
  });

  it('tan is undefined at 90° even though floating point makes Math.tan return a huge finite number', () => {
    expect(err('tan(90)', 'deg')).toBe('domain');
    expect(val('tan(45)', 'deg')).toBeCloseTo(1, 10);
  });

  it('tan is undefined at odd multiples of π/2 in radian mode, but fine elsewhere', () => {
    expect(err('tan(π/2)', 'rad')).toBe('domain');
    expect(val('tan(90)', 'rad')).toBeCloseTo(Math.tan(90), 10); // 90 rad is not near π/2 + nπ
  });

  it('inverse trig rejects out-of-range input', () => {
    expect(val('asin(1)', 'deg')).toBe(90);
    expect(err('asin(2)')).toBe('domain');
    expect(err('acos(-1.5)')).toBe('domain');
    expect(val('atan(1)', 'deg')).toBe(45);
  });

  it('log and ln reject non-positive input', () => {
    expect(val('log(100)')).toBe(2);
    expect(val('ln(1)')).toBe(0);
    expect(err('log(0)')).toBe('domain');
    expect(err('ln(-5)')).toBe('domain');
  });

  it('sqrt rejects negatives but cbrt accepts them', () => {
    expect(val('sqrt(16)')).toBe(4);
    expect(err('sqrt(-1)')).toBe('domain');
    expect(val('cbrt(-8)')).toBe(-2);
  });

  it('exp and abs', () => {
    expect(val('exp(0)')).toBe(1);
    expect(val('abs(-7)')).toBe(7);
  });

  it('function names are case-insensitive', () => {
    expect(val('SIN(90)', 'deg')).toBe(1);
    expect(val('Sqrt(16)')).toBe(4);
  });
});

describe('evaluate: constants and unicode symbols', () => {
  it('reads π and e, and lets keyboard-only users type "pi" instead of the π button', () => {
    expect(val('π')).toBeCloseTo(Math.PI, 10);
    expect(val('pi')).toBeCloseTo(Math.PI, 10);
    expect(val('PI')).toBeCloseTo(Math.PI, 10);
    expect(val('e')).toBeCloseTo(Math.E, 10);
  });

  it("accepts the keypad's unicode operator glyphs (×, ÷, −)", () => {
    expect(val('4×5')).toBe(20);
    expect(val('10÷2')).toBe(5);
    expect(val('5−3')).toBe(2);
  });
});

describe('evaluate: domain errors and division by zero', () => {
  it('division by zero is a domain error, not Infinity', () => {
    expect(err('5/0')).toBe('domain');
  });

  it('negative base with a fractional exponent is undefined without complex numbers', () => {
    expect(err('(-8)^(1/3)')).toBe('domain');
    expect(val('(-8)^2')).toBe(64); // integer exponents on a negative base are fine
  });

  it('a result that overflows a double is an overflow error, not Infinity', () => {
    expect(err('10^1000')).toBe('overflow');
  });
});

describe('evaluate: invalid and boundary input', () => {
  it('empty or whitespace-only input is an "empty" error, not "syntax"', () => {
    expect(err('')).toBe('empty');
    expect(err('   ')).toBe('empty');
  });

  it('rejects incomplete or malformed expressions', () => {
    expect(err('2+')).toBe('syntax');
    expect(err('2 3')).toBe('syntax');
    expect(err('(2+3')).toBe('syntax');
    expect(err('2+)')).toBe('syntax');
    expect(err('foo(1)')).toBe('syntax');
    expect(err('..5')).toBe('syntax');
  });
});

describe('formatResult', () => {
  it('groups everyday numbers with locale separators', () => {
    expect(formatResult(1234.5, 'en')).toBe('1,234.5');
    expect(formatResult(0.3, 'en')).toBe('0.3');
  });

  it('switches to trimmed exponential notation for very large or very small results', () => {
    expect(formatResult(1.23e20, 'en')).toBe('1.23e+20');
    expect(formatResult(5e-12, 'en')).toBe('5e-12');
  });

  it('renders non-finite values as signed infinity symbols', () => {
    expect(formatResult(Infinity, 'en')).toBe('∞');
    expect(formatResult(-Infinity, 'en')).toBe('-∞');
  });
});

describe('toPlainString', () => {
  it('always uses a "." decimal point and no thousands grouping, so evaluate() can re-parse it', () => {
    expect(toPlainString(1234.5)).toBe('1234.5');
    expect(evaluate(toPlainString(val('1234.5*1')), 'deg')).toEqual({ ok: true, value: 1234.5 });
  });

  it('never switches to exponential notation, even for extreme magnitudes', () => {
    expect(toPlainString(1e20)).toBe('100000000000000000000');
    expect(toPlainString(5e-12)).toBe('0.000000000005');
  });
});

describe('pushHistory', () => {
  const entry = (expr: string): HistoryEntry => ({ expr, result: 1, at: 0 });

  it('adds newest entries to the front', () => {
    const h = pushHistory([entry('1+1')], entry('2+2'));
    expect(h.map((e) => e.expr)).toEqual(['2+2', '1+1']);
  });

  it('caps the list at MAX_HISTORY entries', () => {
    let history: HistoryEntry[] = [];
    for (let i = 0; i < MAX_HISTORY + 5; i++) history = pushHistory(history, entry(`${i}`));
    expect(history).toHaveLength(MAX_HISTORY);
    expect(history[0].expr).toBe(`${MAX_HISTORY + 4}`);
  });
});
