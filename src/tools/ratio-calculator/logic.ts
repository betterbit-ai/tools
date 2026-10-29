/** Pure calculations for ratio-calculator — no DOM or Preact. */

export type NumberField = number | '';

export type SimplifyResult =
  { ok: true; first: number; second: number } | { ok: false; error: 'invalid' | 'both-zero' | 'too-precise' };

export type ProportionResult =
  | { ok: true; value: number; missing: 0 | 1 | 2 | 3 }
  | { ok: false; error: 'need-one-blank' | 'invalid' | 'not-unique' | 'impossible' | 'overflow' };

export type RecipeIngredient = { name: string; amount: number };

export type RecipeResult =
  | { ok: true; factor: number; ingredients: RecipeIngredient[] }
  | { ok: false; error: 'invalid' | 'zero-servings' | 'overflow' };

const DECIMAL_PRECISION = 9;

/** Removes floating-point noise from a result while retaining practical recipe precision. */
export function round(value: number, decimals = DECIMAL_PRECISION): number {
  if (!Number.isFinite(value)) return value;
  const factor = 10 ** decimals;
  if (Math.abs(value) > Number.MAX_VALUE / factor) return value;
  return Math.round((value + Number.EPSILON * Math.sign(value || 1)) * factor) / factor;
}

/** Finds the greatest common divisor of two non-negative safe integers. */
export function gcd(first: number, second: number): number {
  let a = Math.abs(Math.trunc(first));
  let b = Math.abs(Math.trunc(second));
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

/** Reduces two non-negative finite values to their smallest practical whole-number ratio. */
export function simplifyRatio(first: number, second: number): SimplifyResult {
  if (!Number.isFinite(first) || !Number.isFinite(second) || first < 0 || second < 0) {
    return { ok: false, error: 'invalid' };
  }
  if (first === 0 && second === 0) return { ok: false, error: 'both-zero' };

  const scaled = toSharedIntegers(first, second);
  if (!scaled) return { ok: false, error: 'too-precise' };
  const divisor = gcd(scaled.first, scaled.second);
  return { ok: true, first: scaled.first / divisor, second: scaled.second / divisor };
}

/** Solves the one blank in a:b = c:d using cross multiplication. */
export function solveProportion(values: [NumberField, NumberField, NumberField, NumberField]): ProportionResult {
  const blanks = values.reduce<number[]>((all, value, index) => (value === '' ? [...all, index] : all), []);
  if (blanks.length !== 1) return { ok: false, error: 'need-one-blank' };
  if (values.some((value) => value !== '' && !Number.isFinite(value))) return { ok: false, error: 'invalid' };

  const missing = blanks[0] as 0 | 1 | 2 | 3;
  const [a, b, c, d] = values.map((value) => (value === '' ? 0 : value)) as [number, number, number, number];
  const numerator = missing === 0 || missing === 3 ? b * c : a * d;
  const denominator = missing === 0 ? d : missing === 1 ? c : missing === 2 ? b : a;

  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return { ok: false, error: 'overflow' };
  if (denominator === 0) {
    return numerator === 0 ? { ok: false, error: 'not-unique' } : { ok: false, error: 'impossible' };
  }
  const value = round(numerator / denominator);
  if (!Number.isFinite(value)) return { ok: false, error: 'overflow' };
  return { ok: true, value, missing };
}

/** Scales named recipe quantities from one serving count to another, preserving their names verbatim. */
export function scaleRecipe(
  originalServings: number,
  targetServings: number,
  ingredients: RecipeIngredient[],
): RecipeResult {
  if (
    !Number.isFinite(originalServings) ||
    !Number.isFinite(targetServings) ||
    originalServings < 0 ||
    targetServings < 0 ||
    ingredients.some((ingredient) => !Number.isFinite(ingredient.amount) || ingredient.amount < 0)
  ) {
    return { ok: false, error: 'invalid' };
  }
  if (originalServings === 0) return { ok: false, error: 'zero-servings' };
  const factor = round(targetServings / originalServings);
  const scaled = ingredients.map((ingredient) => ({ ...ingredient, amount: round(ingredient.amount * factor) }));
  if (!Number.isFinite(factor) || scaled.some((ingredient) => !Number.isFinite(ingredient.amount))) {
    return { ok: false, error: 'overflow' };
  }
  return { ok: true, factor, ingredients: scaled };
}

function toSharedIntegers(first: number, second: number): { first: number; second: number } | null {
  const roundedFirst = round(first);
  const roundedSecond = round(second);
  const places = Math.max(decimalPlaces(roundedFirst), decimalPlaces(roundedSecond));
  const scale = 10 ** places;
  const scaledFirst = Math.round(roundedFirst * scale);
  const scaledSecond = Math.round(roundedSecond * scale);
  if (!Number.isSafeInteger(scaledFirst) || !Number.isSafeInteger(scaledSecond)) return null;
  return { first: scaledFirst, second: scaledSecond };
}

function decimalPlaces(value: number): number {
  const text = value.toString().toLowerCase();
  const exponent = text.match(/^([\d.]+)e([+-]?\d+)$/u);
  if (!exponent) return (text.split('.')[1] ?? '').length;
  const fractionLength = (exponent[1].split('.')[1] ?? '').length;
  return Math.max(0, fractionLength - Number(exponent[2]));
}
