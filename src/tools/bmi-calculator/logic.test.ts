import { describe, expect, it } from 'vitest';
import {
  calculateBmi,
  categorizeBmi,
  healthyWeightRange,
  imperialToMetric,
  metricToImperial,
  parseMeasurement,
} from './logic';

describe('calculateBmi', () => {
  it('calculates the standard metric formula and rounds to one decimal', () => {
    expect(calculateBmi(170, 65)).toBe(22.5);
    expect(calculateBmi(170, 70)).toBe(24.2);
  });

  it('rejects empty, zero, negative, non-finite, and extraordinarily large inputs', () => {
    expect(calculateBmi('', 65)).toBeNull();
    expect(calculateBmi(170, '')).toBeNull();
    expect(calculateBmi(0, 65)).toBeNull();
    expect(calculateBmi(170, 0)).toBeNull();
    expect(calculateBmi(-170, 65)).toBeNull();
    expect(calculateBmi(Infinity, 65)).toBeNull();
    expect(calculateBmi(1e-300, 1e308)).toBeNull();
  });

  it('accepts pasted full-width Unicode digits after normalization', () => {
    expect(parseMeasurement('１７０')).toBe(170);
    expect(calculateBmi('１７０', '６５')).toBe(22.5);
  });
});

describe('categorizeBmi', () => {
  it('uses every WHO boundary exactly', () => {
    expect(categorizeBmi(18.4, 'who')).toBe('underweight');
    expect(categorizeBmi(18.5, 'who')).toBe('healthy');
    expect(categorizeBmi(24.9, 'who')).toBe('healthy');
    expect(categorizeBmi(25, 'who')).toBe('overweight');
    expect(categorizeBmi(30, 'who')).toBe('obesity1');
    expect(categorizeBmi(35, 'who')).toBe('obesity2');
    expect(categorizeBmi(40, 'who')).toBe('obesity3');
  });

  it('uses Korean Society for the Study of Obesity adult boundaries exactly', () => {
    expect(categorizeBmi(22.9, 'korean')).toBe('healthy');
    expect(categorizeBmi(23, 'korean')).toBe('preObesity');
    expect(categorizeBmi(24.9, 'korean')).toBe('preObesity');
    expect(categorizeBmi(25, 'korean')).toBe('obesity1');
    expect(categorizeBmi(30, 'korean')).toBe('obesity2');
    expect(categorizeBmi(35, 'korean')).toBe('obesity3');
  });

  it('does not classify non-positive or non-finite BMI values', () => {
    expect(categorizeBmi(0, 'who')).toBeNull();
    expect(categorizeBmi(-1, 'korean')).toBeNull();
    expect(categorizeBmi(NaN, 'who')).toBeNull();
  });
});

describe('healthyWeightRange', () => {
  it('shows different healthy ranges for WHO and Korean adult criteria', () => {
    expect(healthyWeightRange(170, 'who')).toEqual({ min: 53.5, max: 72 });
    expect(healthyWeightRange(170, 'korean')).toEqual({ min: 53.5, max: 66.2 });
  });

  it('rejects blank or non-positive height', () => {
    expect(healthyWeightRange('', 'who')).toBeNull();
    expect(healthyWeightRange(0, 'korean')).toBeNull();
  });
});

describe('unit conversions', () => {
  it('converts imperial inputs to metric values', () => {
    const converted = imperialToMetric(5, 7, 143.3);
    expect(converted.heightCm).toBe(170.18);
    expect(converted.weightKg).toBeCloseTo(65, 3);
  });

  it('converts metric values to display-friendly imperial values', () => {
    expect(metricToImperial(170, 65)).toEqual({ feet: 5, inches: 6.9, pounds: 143.3 });
  });
});
