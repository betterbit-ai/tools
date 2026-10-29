import { describe, expect, it } from 'vitest';
import { gcd, round, scaleRecipe, simplifyRatio, solveProportion } from './logic';

describe('ratio helpers', () => {
  it('finds a GCD and removes ordinary floating-point noise', () => {
    expect(gcd(1920, 1080)).toBe(120);
    expect(gcd(0, 9)).toBe(9);
    expect(round(0.1 + 0.2)).toBe(0.3);
  });

  it('keeps an already representable huge value finite while rounding', () => {
    expect(round(Number.MAX_VALUE)).toBe(Number.MAX_VALUE);
  });
});

describe('simplifyRatio', () => {
  it('reduces common screen dimensions and decimal ratios', () => {
    expect(simplifyRatio(1920, 1080)).toEqual({ ok: true, first: 16, second: 9 });
    expect(simplifyRatio(1.5, 2.25)).toEqual({ ok: true, first: 2, second: 3 });
  });

  it('allows a zero term but rejects a ratio of zero to zero', () => {
    expect(simplifyRatio(0, 720)).toEqual({ ok: true, first: 0, second: 1 });
    expect(simplifyRatio(0, 0)).toEqual({ ok: false, error: 'both-zero' });
  });

  it('rejects negative, infinite, and impractically precise values', () => {
    expect(simplifyRatio(-1, 2)).toEqual({ ok: false, error: 'invalid' });
    expect(simplifyRatio(Infinity, 2)).toEqual({ ok: false, error: 'invalid' });
    expect(simplifyRatio(1e20, 2)).toEqual({ ok: false, error: 'too-precise' });
  });
});

describe('solveProportion', () => {
  it('finds each possible missing term in a:b = c:d', () => {
    expect(solveProportion(['', 4, 6, 8])).toEqual({ ok: true, value: 3, missing: 0 });
    expect(solveProportion([3, '', 6, 8])).toEqual({ ok: true, value: 4, missing: 1 });
    expect(solveProportion([3, 4, '', 8])).toEqual({ ok: true, value: 6, missing: 2 });
    expect(solveProportion([3, 4, 6, ''])).toEqual({ ok: true, value: 8, missing: 3 });
  });

  it('requires exactly one blank and reports zero-denominator edge cases honestly', () => {
    expect(solveProportion([3, 4, 6, 8])).toEqual({ ok: false, error: 'need-one-blank' });
    expect(solveProportion(['', 0, 0, 0])).toEqual({ ok: false, error: 'not-unique' });
    expect(solveProportion(['', 1, 2, 0])).toEqual({ ok: false, error: 'impossible' });
  });

  it('rejects non-finite input and overflow', () => {
    expect(solveProportion([1, Infinity, 2, ''])).toEqual({ ok: false, error: 'invalid' });
    expect(solveProportion([2, Number.MAX_VALUE, 2, ''])).toEqual({ ok: false, error: 'overflow' });
  });
});

describe('scaleRecipe', () => {
  it('scales a recipe and preserves Korean and emoji ingredient names', () => {
    expect(
      scaleRecipe(4, 6, [
        { name: '밀가루', amount: 300 },
        { name: '🥛 우유', amount: 200 },
      ]),
    ).toEqual({
      ok: true,
      factor: 1.5,
      ingredients: [
        { name: '밀가루', amount: 450 },
        { name: '🥛 우유', amount: 300 },
      ],
    });
  });

  it('handles zero quantities but not zero original servings or non-finite values', () => {
    expect(scaleRecipe(2, 5, [{ name: 'salt', amount: 0 }])).toEqual({
      ok: true,
      factor: 2.5,
      ingredients: [{ name: 'salt', amount: 0 }],
    });
    expect(scaleRecipe(0, 5, [])).toEqual({ ok: false, error: 'zero-servings' });
    expect(scaleRecipe(2, 5, [{ name: 'salt', amount: NaN }])).toEqual({ ok: false, error: 'invalid' });
    expect(scaleRecipe(2, -5, [{ name: 'salt', amount: 1 }])).toEqual({ ok: false, error: 'invalid' });
  });
});
