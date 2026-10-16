/** Pure dice parsing and rolling logic. No DOM or browser random source lives here. */

export const MAX_DICE = 100;
export const MAX_SIDES = 1_000;
export const MAX_MODIFIER = 10_000;
const UINT32_RANGE = 0x1_0000_0000;

export type RandomSource = () => number;
export type Keep = { mode: 'high' | 'low'; count: number };

export interface DiceGroup {
  count: number;
  sides: number;
  keep?: Keep;
}

export interface DiceExpression {
  groups: DiceGroup[];
  modifier: number;
}

export interface RolledDie {
  value: number;
  sides: number;
  kept: boolean;
}

export interface RollResult {
  expression: DiceExpression;
  dice: RolledDie[];
  diceTotal: number;
  total: number;
}

export type DiceError =
  'empty' | 'invalid' | 'too-many-dice' | 'too-many-sides' | 'modifier-too-large' | 'invalid-keep';

export type ParseResult = { ok: true; value: DiceExpression } | { ok: false; error: DiceError };

/**
 * Parses a compact dice expression such as `2d6 + d8 - 1` or `4d6kh3`.
 * The grammar deliberately accepts ASCII dice notation only, so lookalike
 * Unicode digits and operators cannot be mistaken for a valid roll.
 */
export function parseDiceExpression(input: string): ParseResult {
  const text = input.trim();
  if (!text) return { ok: false, error: 'empty' };
  if (text.length > 200 || /[^\d\s+d\-khl]/i.test(text)) return { ok: false, error: 'invalid' };

  const groups: DiceGroup[] = [];
  let modifier = 0;
  let position = 0;
  let sign = 1;

  while (position < text.length) {
    while (/\s/.test(text[position] ?? '')) position++;
    if (position >= text.length) break;

    const operator = text[position];
    if (operator === '+' || operator === '-') {
      sign = operator === '+' ? 1 : -1;
      position++;
      while (/\s/.test(text[position] ?? '')) position++;
    } else if (groups.length || modifier !== 0) {
      return { ok: false, error: 'invalid' };
    }

    const term = /^(?:(\d*)d(\d+)(?:(kh|kl)(\d+))?|(\d+))/i.exec(text.slice(position));
    if (!term) return { ok: false, error: 'invalid' };
    position += term[0].length;

    if (term[5]) {
      modifier += sign * Number(term[5]);
      if (Math.abs(modifier) > MAX_MODIFIER) return { ok: false, error: 'modifier-too-large' };
    } else {
      if (sign < 0) return { ok: false, error: 'invalid' };
      const count = term[1] ? Number(term[1]) : 1;
      const sides = Number(term[2]);
      const keepMode = term[3] === 'kh' ? 'high' : term[3] === 'kl' ? 'low' : undefined;
      const keepCount = term[4] ? Number(term[4]) : undefined;
      if (!Number.isSafeInteger(count) || count < 1 || totalDice(groups) + count > MAX_DICE) {
        return { ok: false, error: 'too-many-dice' };
      }
      if (!Number.isSafeInteger(sides) || sides < 2 || sides > MAX_SIDES) {
        return { ok: false, error: 'too-many-sides' };
      }
      if (keepMode && (!Number.isSafeInteger(keepCount) || !keepCount || keepCount > count)) {
        return { ok: false, error: 'invalid-keep' };
      }
      groups.push({ count, sides, ...(keepMode && keepCount ? { keep: { mode: keepMode, count: keepCount } } : {}) });
    }

    sign = 1;
    while (/\s/.test(text[position] ?? '')) position++;
    if (position < text.length && text[position] !== '+' && text[position] !== '-')
      return { ok: false, error: 'invalid' };
  }

  if (!groups.length) return { ok: false, error: 'invalid' };
  return { ok: true, value: { groups, modifier } };
}

/** Samples an inclusive integer from an unsigned 32-bit source without modulo bias. */
export function randomDie(sides: number, source: RandomSource): number {
  if (!Number.isSafeInteger(sides) || sides < 2 || sides > MAX_SIDES) {
    throw new RangeError(`Expected a die with 2 to ${MAX_SIDES} sides.`);
  }
  const limit = Math.floor(UINT32_RANGE / sides) * sides;
  let value: number;
  do {
    value = source();
    if (!Number.isInteger(value) || value < 0 || value >= UINT32_RANGE) {
      throw new RangeError('Random source must return an unsigned 32-bit integer.');
    }
  } while (value >= limit);
  return (value % sides) + 1;
}

export function rollDice(expression: DiceExpression, source: RandomSource): RollResult {
  const dice: RolledDie[] = [];
  for (const group of expression.groups) {
    const groupDice = Array.from({ length: group.count }, () => ({
      value: randomDie(group.sides, source),
      sides: group.sides,
      kept: true,
    }));
    if (group.keep) {
      const ranked = [...groupDice].sort((a, b) =>
        group.keep?.mode === 'high' ? b.value - a.value : a.value - b.value,
      );
      const kept = new Set(ranked.slice(0, group.keep.count));
      groupDice.forEach((die) => {
        die.kept = kept.has(die);
      });
    }
    dice.push(...groupDice);
  }
  const diceTotal = dice.filter((die) => die.kept).reduce((sum, die) => sum + die.value, 0);
  return { expression, dice, diceTotal, total: diceTotal + expression.modifier };
}

export function formatExpression(expression: DiceExpression): string {
  const groups = expression.groups.map((group) => {
    const count = group.count === 1 ? '' : String(group.count);
    const keep = group.keep ? `k${group.keep.mode === 'high' ? 'h' : 'l'}${group.keep.count}` : '';
    return `${count}d${group.sides}${keep}`;
  });
  const base = groups.join(' + ');
  if (expression.modifier > 0) return `${base} + ${expression.modifier}`;
  if (expression.modifier < 0) return `${base} − ${Math.abs(expression.modifier)}`;
  return base;
}

export function formatRoll(result: RollResult): string {
  const values = result.dice.map((die) => (die.kept ? String(die.value) : `(${die.value})`));
  const modifier = result.expression.modifier
    ? ` ${result.expression.modifier > 0 ? '+' : '−'} ${Math.abs(result.expression.modifier)}`
    : '';
  return `${formatExpression(result.expression)}: ${values.join(' + ')}${modifier} = ${result.total}`;
}

function totalDice(groups: readonly DiceGroup[]): number {
  return groups.reduce((sum, group) => sum + group.count, 0);
}
