import { describe, expect, it } from 'vitest';
import {
  ABSOLUTE_ZERO_C,
  ABSOLUTE_ZERO_F,
  convertTemperature,
  cookingTable,
  isBelowAbsoluteZero,
  isTemperatureUnit,
} from './logic';

describe('convertTemperature', () => {
  it('converts the fixed reference points exactly', () => {
    expect(convertTemperature(0, 'c', 'f')).toBe(32);
    expect(convertTemperature(100, 'c', 'f')).toBe(212);
    expect(convertTemperature(32, 'f', 'c')).toBe(0);
    expect(convertTemperature(212, 'f', 'c')).toBe(100);
    expect(convertTemperature(0, 'c', 'k')).toBeCloseTo(273.15, 9);
    expect(convertTemperature(273.15, 'k', 'c')).toBeCloseTo(0, 9);
  });

  it('has the famous -40 crossover point between Celsius and Fahrenheit', () => {
    expect(convertTemperature(-40, 'c', 'f')).toBe(-40);
    expect(convertTemperature(-40, 'f', 'c')).toBe(-40);
  });

  it('is a no-op when from and to are the same unit', () => {
    expect(convertTemperature(37, 'c', 'c')).toBe(37);
  });

  it('chains correctly through Fahrenheit <-> Kelvin', () => {
    // Human body temperature: 37°C = 98.6°F = 310.15 K
    expect(convertTemperature(37, 'c', 'f')).toBeCloseTo(98.6, 9);
    expect(convertTemperature(98.6, 'f', 'k')).toBeCloseTo(310.15, 6);
  });

  it('returns 0 for non-finite input', () => {
    expect(convertTemperature(Infinity, 'c', 'f')).toBe(0);
    expect(convertTemperature(-Infinity, 'k', 'c')).toBe(0);
  });

  it('handles boundary and negative values', () => {
    expect(convertTemperature(0, 'k', 'c')).toBeCloseTo(ABSOLUTE_ZERO_C, 9);
    expect(convertTemperature(0, 'k', 'f')).toBeCloseTo(ABSOLUTE_ZERO_F, 2);
    expect(convertTemperature(-17.78, 'c', 'f')).toBeCloseTo(0, 1);
  });
});

describe('isBelowAbsoluteZero', () => {
  it('flags temperatures colder than absolute zero in every unit', () => {
    expect(isBelowAbsoluteZero(-274, 'c')).toBe(true);
    expect(isBelowAbsoluteZero(-1, 'k')).toBe(true);
    expect(isBelowAbsoluteZero(-460, 'f')).toBe(true);
  });

  it('does not flag absolute zero itself or anything warmer', () => {
    expect(isBelowAbsoluteZero(ABSOLUTE_ZERO_C, 'c')).toBe(false);
    expect(isBelowAbsoluteZero(0, 'k')).toBe(false);
    expect(isBelowAbsoluteZero(37, 'c')).toBe(false);
    expect(isBelowAbsoluteZero(0, 'f')).toBe(false);
  });

  it('is false for non-finite values rather than throwing', () => {
    expect(isBelowAbsoluteZero(NaN, 'c')).toBe(false);
    expect(isBelowAbsoluteZero(Infinity, 'k')).toBe(false);
  });
});

describe('isTemperatureUnit', () => {
  it('accepts only the three supported scales', () => {
    expect(isTemperatureUnit('c')).toBe(true);
    expect(isTemperatureUnit('f')).toBe(true);
    expect(isTemperatureUnit('k')).toBe(true);
    expect(isTemperatureUnit('C')).toBe(false);
    expect(isTemperatureUnit('섭씨')).toBe(false);
    expect(isTemperatureUnit(undefined)).toBe(false);
    expect(isTemperatureUnit(42)).toBe(false);
  });
});

describe('cookingTable', () => {
  it('has 9 gas-mark rows with increasing temperature', () => {
    const rows = cookingTable('c', 'f');
    expect(rows.length).toBe(9);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].celsius).toBeGreaterThan(rows[i - 1].celsius);
      expect(rows[i].fahrenheit).toBeGreaterThan(rows[i - 1].fahrenheit);
    }
  });

  it('matches the standard recipe rounding, not exact math, for gas mark 4', () => {
    const row = cookingTable('c', 'f').find((r) => r.gasMark === 4)!;
    expect(row.celsius).toBe(180);
    expect(row.fahrenheit).toBe(350);
    // The exact mathematical conversion of 350°F is ~176.7°C, not 180 — recipes round.
    expect(convertTemperature(350, 'f', 'c')).not.toBeCloseTo(180, 0);
  });

  it('matches thecalculatorsite.com gas-mark chart for every row (e.g. mark 6 = 205°C/400°F)', () => {
    const rows = cookingTable('c', 'f');
    const expected = [
      [1, 135, 275],
      [2, 150, 300],
      [3, 165, 325],
      [4, 180, 350],
      [5, 190, 375],
      [6, 205, 400],
      [7, 220, 425],
      [8, 230, 450],
      [9, 245, 475],
    ];
    expect(rows.map((r) => [r.gasMark, r.celsius, r.fahrenheit])).toEqual(expected);
  });

  it('re-expresses rows in whichever units are selected, including Kelvin', () => {
    const rows = cookingTable('k', 'c');
    const mark4 = rows.find((r) => r.gasMark === 4)!;
    expect(mark4.fromValue).toBeCloseTo(180 + 273.15, 6);
    expect(mark4.toValue).toBe(180);
  });
});
