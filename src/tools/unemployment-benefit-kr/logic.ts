/** Pure 2026 Korean job-seeker's-benefit estimates for standard employees. */

export const RULES_2026 = {
  hourlyMinimumWage: 10_320,
  benefitRate: 0.6,
  minimumBenefitRate: 0.8,
  maximumDailyBenefit: 68_100,
  minimumInsuredUnitDays: 180,
  maximumDailyHours: 8,
  maximumInsuranceMonths: 1_200,
  maximumDailyWage: 10_000_000,
} as const;

export type AgeGroup = 'under-50' | '50-or-disabled';
export type AppliedDailyRule = 'floor' | 'wage' | 'cap';

export interface UnemploymentBenefitInput {
  /** Average daily wage from the final three months before separation, in KRW. */
  averageDailyWage: number | string;
  /** Known daily ordinary wage, used when higher than the average daily wage. */
  ordinaryDailyWage: number | string;
  /** Daily contracted hours used for the statutory minimum, from 1 to 8. */
  scheduledHoursPerDay: number | string;
  /** Total qualifying Employment Insurance coverage, in whole months. */
  insuranceMonths: number | string;
  /** Under 50, or 50+ / registered disabled at separation. */
  ageGroup: AgeGroup;
  /** Paid-base insured days in the applicable look-back period. */
  insuredUnitDays: number | string;
  /** Whether the separation reason is not disqualifying. */
  eligibleSeparation: boolean;
  /** Whether the person is unemployed, able to work and actively seeking work. */
  seekingWork: boolean;
}

export interface EligibilityCheck {
  insuredDays: boolean;
  separation: boolean;
  seekingWork: boolean;
  likelyEligible: boolean;
}

export interface UnemploymentBenefitResult {
  applicableDailyBase: number;
  dailyWageBenefit: number;
  minimumDailyBenefit: number;
  maximumDailyBenefit: number;
  dailyBenefit: number;
  appliedDailyRule: AppliedDailyRule;
  benefitDays: number;
  estimatedTotal: number;
  eligibility: EligibilityCheck;
}

/**
 * Parses a plain KRW number pasted with grouping commas, full-width digits,
 * ₩, 원, or 만원. Korean words and other surrounding text are rejected.
 */
export function parseKrw(value: number | string): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const normalized = value.normalize('NFKC').trim().replaceAll(',', '').replaceAll(' ', '').replace(/^₩/, '');
  const match = normalized.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(만)?원?$/);
  if (!match) return null;

  const amount = Number(match[1]);
  return Number.isFinite(amount) ? amount * (match[2] ? 10_000 : 1) : null;
}

/**
 * Returns prescribed benefit days from Employment Insurance coverage and age.
 * This is the current Employment Insurance Act table for ordinary employees.
 */
export function benefitDaysFor(insuranceMonths: number, ageGroup: AgeGroup): number {
  if (insuranceMonths < 12) return 120;
  if (insuranceMonths < 36) return ageGroup === 'under-50' ? 150 : 180;
  if (insuranceMonths < 60) return ageGroup === 'under-50' ? 180 : 210;
  if (insuranceMonths < 120) return ageGroup === 'under-50' ? 210 : 240;
  return ageGroup === 'under-50' ? 240 : 270;
}

/**
 * Estimates 2026 Korean job-seeker's allowance. It is not an eligibility
 * decision: insured-unit days, separation reason, and job-search status are
 * only the high-level checks a browser calculator can ask about.
 */
export function calculateUnemploymentBenefit(input: UnemploymentBenefitInput): UnemploymentBenefitResult | null {
  const averageDailyWage = parseKrw(input.averageDailyWage);
  const ordinaryDailyWage = parseOptionalKrw(input.ordinaryDailyWage);
  const scheduledHoursPerDay = parseKrw(input.scheduledHoursPerDay);
  const insuranceMonths = parseKrw(input.insuranceMonths);
  const insuredUnitDays = parseKrw(input.insuredUnitDays);

  if (
    averageDailyWage === null ||
    ordinaryDailyWage === null ||
    scheduledHoursPerDay === null ||
    insuranceMonths === null ||
    insuredUnitDays === null ||
    !Number.isInteger(scheduledHoursPerDay) ||
    !Number.isInteger(insuranceMonths) ||
    !Number.isInteger(insuredUnitDays) ||
    averageDailyWage <= 0 ||
    averageDailyWage > RULES_2026.maximumDailyWage ||
    ordinaryDailyWage > RULES_2026.maximumDailyWage ||
    scheduledHoursPerDay < 1 ||
    scheduledHoursPerDay > RULES_2026.maximumDailyHours ||
    insuranceMonths < 0 ||
    insuranceMonths > RULES_2026.maximumInsuranceMonths ||
    insuredUnitDays < 0 ||
    insuredUnitDays > 10_000 ||
    (input.ageGroup !== 'under-50' && input.ageGroup !== '50-or-disabled')
  ) {
    return null;
  }

  const applicableDailyBase = Math.max(averageDailyWage, ordinaryDailyWage);
  const dailyWageBenefit = Math.floor(applicableDailyBase * RULES_2026.benefitRate);
  const minimumDailyBenefit = Math.floor(
    RULES_2026.hourlyMinimumWage * RULES_2026.minimumBenefitRate * scheduledHoursPerDay,
  );
  const maximumDailyBenefit = RULES_2026.maximumDailyBenefit;
  const dailyBenefit = Math.min(Math.max(dailyWageBenefit, minimumDailyBenefit), maximumDailyBenefit);
  const appliedDailyRule: AppliedDailyRule =
    dailyWageBenefit < minimumDailyBenefit ? 'floor' : dailyWageBenefit > maximumDailyBenefit ? 'cap' : 'wage';
  const eligibility = {
    insuredDays: insuredUnitDays >= RULES_2026.minimumInsuredUnitDays,
    separation: input.eligibleSeparation,
    seekingWork: input.seekingWork,
    likelyEligible: false,
  };
  eligibility.likelyEligible = eligibility.insuredDays && eligibility.separation && eligibility.seekingWork;
  const benefitDays = benefitDaysFor(insuranceMonths, input.ageGroup);

  return {
    applicableDailyBase,
    dailyWageBenefit,
    minimumDailyBenefit,
    maximumDailyBenefit,
    dailyBenefit,
    appliedDailyRule,
    benefitDays,
    estimatedTotal: dailyBenefit * benefitDays,
    eligibility,
  };
}

/** An unknown ordinary daily wage does not lower a verified average daily wage. */
function parseOptionalKrw(value: number | string): number | null {
  if (typeof value === 'string' && !value.trim()) return 0;
  const amount = parseKrw(value);
  return amount === null || amount < 0 ? null : amount;
}
