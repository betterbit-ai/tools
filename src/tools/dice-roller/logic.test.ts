import { describe, expect, it } from 'vitest';
import { MAX_DICE, formatExpression, formatRoll, parseDiceExpression, randomDie, rollDice } from './logic';

describe('parseDiceExpression', () => {
  it('parses mixed dice, a modifier, and optional whitespace', () => {
    expect(parseDiceExpression(' 2d6 + d8 - 3 ')).toEqual({
      ok: true,
      value: {
        groups: [
          { count: 2, sides: 6 },
          { count: 1, sides: 8 },
        ],
        modifier: -3,
      },
    });
  });

  it('parses D&D keep-high and keep-low notation', () => {
    expect(parseDiceExpression('4d6kh3 + 2d20kl1')).toEqual({
      ok: true,
      value: {
        groups: [
          { count: 4, sides: 6, keep: { mode: 'high', count: 3 } },
          { count: 2, sides: 20, keep: { mode: 'low', count: 1 } },
        ],
        modifier: 0,
      },
    });
  });

  it('rejects empty, malformed, and Unicode lookalike notation', () => {
    expect(parseDiceExpression('')).toEqual({ ok: false, error: 'empty' });
    expect(parseDiceExpression('2d6 + 🎲')).toEqual({ ok: false, error: 'invalid' });
    expect(parseDiceExpression('２ｄ６＋３')).toEqual({ ok: false, error: 'invalid' });
    expect(parseDiceExpression('주사위')).toEqual({ ok: false, error: 'invalid' });
    expect(parseDiceExpression('2d6 +')).toEqual({ ok: false, error: 'invalid' });
  });

  it('enforces dice, side, modifier, and keep boundaries', () => {
    expect(parseDiceExpression(`${MAX_DICE}d2`)).toMatchObject({ ok: true });
    expect(parseDiceExpression('0d6')).toEqual({ ok: false, error: 'too-many-dice' });
    expect(parseDiceExpression(`${MAX_DICE + 1}d2`)).toEqual({ ok: false, error: 'too-many-dice' });
    expect(parseDiceExpression('d1')).toEqual({ ok: false, error: 'too-many-sides' });
    expect(parseDiceExpression('d1001')).toEqual({ ok: false, error: 'too-many-sides' });
    expect(parseDiceExpression('4d6kh0')).toEqual({ ok: false, error: 'invalid-keep' });
    expect(parseDiceExpression('4d6kl5')).toEqual({ ok: false, error: 'invalid-keep' });
    expect(parseDiceExpression('d6+10001')).toEqual({ ok: false, error: 'modifier-too-large' });
  });
});

describe('randomDie', () => {
  it('uses inclusive die bounds and rejects modulo-biased remainder values', () => {
    const source = sequence([0xffffffff, 5]);
    expect(randomDie(6, source)).toBe(6);
    expect(randomDie(6, sequence([0]))).toBe(1);
  });
});

describe('rollDice', () => {
  it('keeps the highest requested dice and applies the modifier once', () => {
    const parsed = parseDiceExpression('4d6kh3+2');
    if (!parsed.ok) throw new Error('Expected test expression to parse');
    const result = rollDice(parsed.value, sequence([0, 5, 1, 3]));
    expect(result.dice.map((die) => [die.value, die.kept])).toEqual([
      [1, false],
      [6, true],
      [2, true],
      [4, true],
    ]);
    expect(result.diceTotal).toBe(12);
    expect(result.total).toBe(14);
    expect(formatExpression(parsed.value)).toBe('4d6kh3 + 2');
    expect(formatRoll(result)).toBe('4d6kh3 + 2: (1) + 6 + 2 + 4 + 2 = 14');
  });
});

function sequence(values: number[]): () => number {
  let index = 0;
  return () => values[index++] ?? 0;
}
