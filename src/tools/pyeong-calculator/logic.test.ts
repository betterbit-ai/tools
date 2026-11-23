import { describe, expect, it } from 'vitest';
import {
  calculateArea,
  compareAreas,
  MAX_AREA,
  parseAreaInput,
  parseAreaNumber,
  parseSquareMeters,
  PYEONG_PER_SQUARE_METER,
  SQUARE_METERS_PER_PYEONG,
} from './logic';

describe('calculateArea', () => {
  it('uses the exact 400/121 square-metre definition in both directions', () => {
    expect(SQUARE_METERS_PER_PYEONG).toBe(400 / 121);
    expect(PYEONG_PER_SQUARE_METER).toBe(121 / 400);
    expect(calculateArea(84, 'squareMeters')).toEqual({ squareMeters: 84, pyeong: 25.41 });
    expect(calculateArea(25.41, 'pyeong')).toEqual({ squareMeters: 84, pyeong: 25.41 });
  });

  it('keeps zero and a large but safe area valid', () => {
    expect(calculateArea(0, 'pyeong')).toEqual({ squareMeters: 0, pyeong: 0 });
    expect(calculateArea(MAX_AREA, 'squareMeters')).toEqual({
      squareMeters: MAX_AREA,
      pyeong: MAX_AREA * PYEONG_PER_SQUARE_METER,
    });
  });

  it('accepts grouped full-width values pasted from Korean keyboards', () => {
    expect(calculateArea('８４．５', 'squareMeters')).toEqual({ squareMeters: 84.5, pyeong: 25.56125 });
    expect(calculateArea('１,０００', 'pyeong')).toEqual({ squareMeters: 3_305.7851239669, pyeong: 1000 });
  });

  it('rejects missing, non-numeric, negative, and oversized input', () => {
    expect(calculateArea('', 'squareMeters')).toBeNull();
    expect(calculateArea('84㎡', 'squareMeters')).toBeNull();
    expect(calculateArea('전용 84 🏠', 'squareMeters')).toBeNull();
    expect(calculateArea(-1, 'pyeong')).toBeNull();
    expect(calculateArea(MAX_AREA + 1, 'squareMeters')).toBeNull();
    expect(calculateArea(Infinity, 'pyeong')).toBeNull();
    expect(calculateArea(84, 'other' as never)).toBeNull();
  });
});

describe('compareAreas', () => {
  it('shows exclusive and supply figures side by side with the exclusive-area ratio', () => {
    expect(compareAreas(84, 112)).toEqual({
      exclusive: { squareMeters: 84, pyeong: 25.41 },
      supply: { squareMeters: 112, pyeong: 33.88 },
      exclusiveRatio: 75,
    });
  });

  it('rejects a comparison whose supply area is smaller than its exclusive area', () => {
    expect(compareAreas(84, 83.9)).toBeNull();
    expect(compareAreas(0, 0)).toBeNull();
  });
});

describe('parseAreaNumber', () => {
  it('normalizes full-width punctuation and rejects invalid values', () => {
    expect(parseAreaNumber(' １２,３４５．６ ')).toBe(12_345.6);
    expect(parseAreaNumber('')).toBeNull();
    expect(parseAreaNumber(NaN)).toBeNull();
  });
});

describe('parseAreaInput', () => {
  it('reads plain, grouped, decimal, and full-width numbers in the selected unit', () => {
    expect(parseAreaInput('84', 'squareMeters')).toEqual({ value: 84, unit: 'squareMeters' });
    expect(parseAreaInput('59.9', 'squareMeters')).toEqual({ value: 59.9, unit: 'squareMeters' });
    expect(parseAreaInput('1,000', 'pyeong')).toEqual({ value: 1000, unit: 'pyeong' });
    expect(parseAreaInput('８４．５', 'squareMeters')).toEqual({ value: 84.5, unit: 'squareMeters' });
  });

  it('takes the unit written in pasted text over the selected one', () => {
    expect(parseAreaInput('84㎡', 'pyeong')).toEqual({ value: 84, unit: 'squareMeters' });
    expect(parseAreaInput('84 m2', 'pyeong')).toEqual({ value: 84, unit: 'squareMeters' });
    expect(parseAreaInput('84제곱미터', 'pyeong')).toEqual({ value: 84, unit: 'squareMeters' });
    expect(parseAreaInput('34평', 'squareMeters')).toEqual({ value: 34, unit: 'pyeong' });
    expect(parseAreaInput('34 평수', 'squareMeters')).toEqual({ value: 34, unit: 'pyeong' });
  });

  it('rejects prose, a bare unit word, and an area outside the guardrail', () => {
    expect(parseAreaInput('전용 84', 'squareMeters')).toBeNull();
    expect(parseAreaInput('평', 'pyeong')).toBeNull();
    expect(parseAreaInput('', 'squareMeters')).toBeNull();
    // A readable but impossible area stops at the calculator, which owns the guardrail.
    expect(calculateArea(parseAreaInput('-1', 'pyeong')!.value, 'pyeong')).toBeNull();
  });
});

describe('parseSquareMeters', () => {
  it('converts a pasted pyeong figure so both comparison fields stay in square metres', () => {
    expect(parseSquareMeters('112')).toBe(112);
    expect(parseSquareMeters('112㎡')).toBe(112);
    expect(parseSquareMeters('34평')).toBe(112.3966942149);
    expect(parseSquareMeters('전용')).toBeNull();
  });
});
