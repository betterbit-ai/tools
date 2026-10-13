/** Pure calculations for calorie-calculator. Values are estimates for adults, not medical advice. */

export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'veryActive' | 'extraActive';
export type Goal = 'lose' | 'maintain' | 'gain';

export interface CalorieInput {
  sex: Sex;
  age: number | string;
  heightCm: number | string;
  weightKg: number | string;
  activity: ActivityLevel;
  goal: Goal;
}

export interface CalorieResult {
  bmr: number;
  maintenance: number;
  target: number;
  activityCalories: number;
}

/** Common TDEE multipliers paired with the activity descriptions in the interface. */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  veryActive: 1.725,
  extraActive: 1.9,
};

/** Conservative planning presets, expressed as a proportion of estimated maintenance calories. */
export const GOAL_MULTIPLIERS: Record<Goal, number> = {
  lose: 0.85,
  maintain: 1,
  gain: 1.1,
};

/** Convert a finite numeric input, including pasted full-width digits and commas, to a number. */
export function parseMeasurement(value: number | string): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const normalized = value.normalize('NFKC').trim().replaceAll(',', '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Mifflin–St Jeor resting-energy estimate in kcal/day. Inputs use kg, cm and years.
 * Returns null outside the calculator's documented adult measurement range.
 */
export function mifflinStJeor(
  sex: Sex,
  age: number | string,
  heightCm: number | string,
  weightKg: number | string,
): number | null {
  const parsedAge = parseMeasurement(age);
  const height = parseMeasurement(heightCm);
  const weight = parseMeasurement(weightKg);
  if (
    parsedAge === null ||
    height === null ||
    weight === null ||
    parsedAge < 18 ||
    parsedAge > 120 ||
    height < 80 ||
    height > 250 ||
    weight < 25 ||
    weight > 400
  ) {
    return null;
  }

  const bmr = 10 * weight + 6.25 * height - 5 * parsedAge + (sex === 'male' ? 5 : -161);
  return Number.isFinite(bmr) ? bmr : null;
}

/** Calculate rounded daily BMR, maintenance (TDEE), goal target, and non-resting energy estimate. */
export function calculateCalorieNeeds(input: CalorieInput): CalorieResult | null {
  const bmrRaw = mifflinStJeor(input.sex, input.age, input.heightCm, input.weightKg);
  if (bmrRaw === null) return null;

  const maintenanceRaw = bmrRaw * ACTIVITY_MULTIPLIERS[input.activity];
  const maintenance = round(maintenanceRaw);
  return {
    bmr: round(bmrRaw),
    maintenance,
    target: round(maintenance * GOAL_MULTIPLIERS[input.goal]),
    activityCalories: round(maintenanceRaw - bmrRaw),
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

function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON * Math.sign(value || 1)) * factor) / factor;
}
