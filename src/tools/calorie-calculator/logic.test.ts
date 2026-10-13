import { describe, expect, it } from 'vitest';
import {
  ACTIVITY_MULTIPLIERS,
  calculateCalorieNeeds,
  imperialToMetric,
  metricToImperial,
  mifflinStJeor,
  parseMeasurement,
} from './logic';

describe('parseMeasurement', () => {
  it('accepts ordinary values, commas, and full-width Unicode digits', () => {
    expect(parseMeasurement(70)).toBe(70);
    expect(parseMeasurement('1,234.5')).toBe(1234.5);
    expect(parseMeasurement('１７０．５')).toBe(170.5);
  });

  it('rejects blank, non-numeric, emoji, and non-finite values', () => {
    expect(parseMeasurement('')).toBeNull();
    expect(parseMeasurement('몸무게 70kg')).toBeNull();
    expect(parseMeasurement('70🏃')).toBeNull();
    expect(parseMeasurement(Infinity)).toBeNull();
  });
});

describe('mifflinStJeor', () => {
  it('uses the published male and female constants', () => {
    expect(mifflinStJeor('male', 30, 175, 70)).toBe(1648.75);
    expect(mifflinStJeor('female', 30, 175, 70)).toBe(1482.75);
  });

  it('accepts normalized Unicode input values', () => {
    expect(mifflinStJeor('female', '３０', '１６５', '６０')).toBe(1320.25);
  });

  it('returns null for incomplete, non-adult, zero, and extreme measurements', () => {
    expect(mifflinStJeor('male', '', 175, 70)).toBeNull();
    expect(mifflinStJeor('male', 17, 175, 70)).toBeNull();
    expect(mifflinStJeor('male', 30, 0, 70)).toBeNull();
    expect(mifflinStJeor('male', 30, 175, 1_000_000)).toBeNull();
  });
});

describe('calculateCalorieNeeds', () => {
  it('calculates BMR, TDEE, a target from displayed maintenance, and activity energy', () => {
    expect(
      calculateCalorieNeeds({
        sex: 'male',
        age: 30,
        heightCm: 175,
        weightKg: 70,
        activity: 'moderate',
        goal: 'maintain',
      }),
    ).toEqual({ bmr: 1649, maintenance: 2556, target: 2556, activityCalories: 907 });
  });

  it('applies the 15% loss and 10% gain presets to maintenance', () => {
    const base = { sex: 'female' as const, age: 30, heightCm: 165, weightKg: 60, activity: 'light' as const };
    expect(calculateCalorieNeeds({ ...base, goal: 'lose' })?.target).toBe(1543);
    expect(calculateCalorieNeeds({ ...base, goal: 'gain' })?.target).toBe(1997);
  });

  it('keeps the documented activity multipliers available for the interface', () => {
    expect(ACTIVITY_MULTIPLIERS).toEqual({
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      veryActive: 1.725,
      extraActive: 1.9,
    });
  });

  it('returns null when a required input is invalid', () => {
    expect(
      calculateCalorieNeeds({
        sex: 'female',
        age: 30,
        heightCm: 165,
        weightKg: '',
        activity: 'light',
        goal: 'maintain',
      }),
    ).toBeNull();
  });
});

describe('unit conversion', () => {
  it('converts metric and US customary height and weight', () => {
    expect(imperialToMetric(5, 9, 154.3)).toEqual({ heightCm: 175.26, weightKg: 69.9893 });
    expect(metricToImperial(175.26, 69.9893)).toEqual({ feet: 5, inches: 9, pounds: 154.3 });
  });
});
