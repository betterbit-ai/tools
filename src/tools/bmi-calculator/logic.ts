/**
 * Pure calculations for bmi-calculator. BMI is a screening measure for adults,
 * calculated as kg / m²; this module deliberately makes no health diagnosis.
 */

export type BmiStandard = 'who' | 'korean';

export type BmiCategory =
  'underweight' | 'healthy' | 'preObesity' | 'overweight' | 'obesity1' | 'obesity2' | 'obesity3';

export interface WeightRange {
  min: number;
  max: number;
}

const HEALTHY_LIMITS: Record<BmiStandard, WeightRange> = {
  who: { min: 18.5, max: 24.9 },
  korean: { min: 18.5, max: 22.9 },
};

/** Convert a finite numeric input, including pasted full-width digits, to a number. */
export function parseMeasurement(value: number | string): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const normalized = value.normalize('NFKC').trim().replaceAll(',', '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Returns BMI rounded to one decimal, or null for empty, non-positive, or non-finite measurements. */
export function calculateBmi(heightCm: number | string, weightKg: number | string): number | null {
  const height = parseMeasurement(heightCm);
  const weight = parseMeasurement(weightKg);
  if (height === null || weight === null || height <= 0 || weight <= 0) return null;

  const bmi = weight / (height / 100) ** 2;
  if (!Number.isFinite(bmi)) return null;
  return round(bmi, 1);
}

/** Categorize an adult BMI using WHO international or Korean Society for the Study of Obesity thresholds. */
export function categorizeBmi(bmi: number, standard: BmiStandard): BmiCategory | null {
  if (!Number.isFinite(bmi) || bmi <= 0) return null;

  if (bmi < 18.5) return 'underweight';
  if (standard === 'korean') {
    if (bmi < 23) return 'healthy';
    if (bmi < 25) return 'preObesity';
    if (bmi < 30) return 'obesity1';
    if (bmi < 35) return 'obesity2';
    return 'obesity3';
  }

  if (bmi < 25) return 'healthy';
  if (bmi < 30) return 'overweight';
  if (bmi < 35) return 'obesity1';
  if (bmi < 40) return 'obesity2';
  return 'obesity3';
}

/** Healthy-weight range at a given height, using the selected adult BMI standard. */
export function healthyWeightRange(heightCm: number | string, standard: BmiStandard): WeightRange | null {
  const height = parseMeasurement(heightCm);
  if (height === null || height <= 0) return null;
  const heightM2 = (height / 100) ** 2;
  return {
    min: round(HEALTHY_LIMITS[standard].min * heightM2, 1),
    max: round(HEALTHY_LIMITS[standard].max * heightM2, 1),
  };
}

export function imperialToMetric(feet: number, inches: number, pounds: number): { heightCm: number; weightKg: number } {
  return {
    heightCm: round((feet * 12 + inches) * 2.54, 4),
    weightKg: round(pounds * 0.45359237, 4),
  };
}

export function metricToImperial(heightCm: number, weightKg: number): { feet: number; inches: number; pounds: number } {
  const totalInches = heightCm / 2.54;
  const feet = Math.floor(totalInches / 12);
  return {
    feet,
    inches: round(totalInches - feet * 12, 1),
    pounds: round(weightKg / 0.45359237, 1),
  };
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON * Math.sign(value || 1)) * factor) / factor;
}
