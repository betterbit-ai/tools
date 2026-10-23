/**
 * Pure 2026 workplace social-insurance calculation for a standard employee in Korea.
 * All figures that change by year live here so the next annual update is auditable.
 */

export const SOCIAL_INSURANCE_RULES_2026 = {
  year: 2026,
  effectiveDate: '2026-01-01',
  sources: {
    pensionRate: {
      authority: 'National Pension Service',
      authorityKo: '국민연금공단',
      effectiveFrom: '2026-01-01',
    },
    pensionIncomeBase: {
      authority: 'National Pension Service',
      authorityKo: '국민연금공단',
      publishedOn: '2026-02-13',
    },
    healthAndLongTermCare: {
      authority: 'National Health Insurance Service',
      authorityKo: '국민건강보험공단',
      effectiveFrom: '2026-01-01',
      limitNotice: 'Ministry of Health and Welfare Notice No. 2025-222',
      limitNoticeKo: '보건복지부고시 제2025-222호',
    },
    employment: {
      authority: 'Ministry of Employment and Labor',
      authorityKo: '고용노동부',
      currentFrom: '2022-07-01',
    },
    industrialAccident: {
      authority: 'Ministry of Employment and Labor',
      authorityKo: '고용노동부',
      notice: 'Notice No. 2025-91',
      noticeKo: '고용노동부고시 제2025-91호',
      effectiveFrom: '2026-01-01',
    },
  },
  pension: {
    totalRate: 0.095,
    employeeRate: 0.0475,
    incomeRoundingUnit: 1_000,
    firstHalf: {
      effectiveFrom: '2025-07-01',
      effectiveTo: '2026-06-30',
      minimumBase: 400_000,
      maximumBase: 6_370_000,
    },
    secondHalf: {
      effectiveFrom: '2026-07-01',
      effectiveTo: '2027-06-30',
      minimumBase: 410_000,
      maximumBase: 6_590_000,
    },
  },
  health: {
    totalRate: 0.0719,
    employeeRate: 0.03595,
    totalPremiumMinimum: 20_160,
    totalPremiumMaximum: 9_183_480,
  },
  longTermCare: {
    incomeRate: 0.009448,
    /** Official formula: health premium × 0.9448% ÷ 7.19%. */
    healthPremiumRatio: 0.009448 / 0.0719,
  },
  employment: {
    unemploymentEmployeeRate: 0.009,
    unemploymentEmployerRate: 0.009,
    workplaceEmployeeThresholds: {
      firstBandExclusive: 150,
      topBandMinimum: 1_000,
    },
    stabilityRates: {
      under150: 0.0025,
      priority150Plus: 0.0045,
      from150To999: 0.0065,
      atLeast1000: 0.0085,
    },
  },
  industrialAccidentAverageRate: 0.0147,
  premiumRoundingUnit: 10,
  coverageGuidance: {
    pensionMaximumAgeExclusive: 60,
    monthlyHoursThreshold: 60,
    weeklyHoursThreshold: 15,
    dailyWorkerDaysThreshold: 8,
    minimumEmploymentMonths: 1,
    continuousEmploymentExceptionMonths: 3,
    durunuriEmployeeCountExclusive: 10,
    durunuriMonthlyPayExclusive: 2_700_000,
    durunuriMaximumSupportRate: 0.8,
  },
  maximumMonthlyPayInput: 1_000_000_000,
  maximumAnnualPayInput: 12_000_000_000,
  maximumIndustrialAccidentRatePercent: 100,
} as const;

export type PayPeriod = 'monthly' | 'annual';
export type PensionPeriod = 'first-half' | 'second-half';
export type WorkplaceSize = keyof typeof SOCIAL_INSURANCE_RULES_2026.employment.stabilityRates;

export interface InsuranceCoverage {
  pension: boolean;
  health: boolean;
  employment: boolean;
}

export interface SocialInsuranceInput {
  pay: number | string;
  payPeriod: PayPeriod;
  monthlyNonTaxable: number | string;
  pensionPeriod: PensionPeriod;
  workplaceSize: WorkplaceSize;
  industrialAccidentRatePercent: number | string;
  coverage: InsuranceCoverage;
}

export type ResultReason =
  | 'annual-converted'
  | 'non-taxable-excluded'
  | 'pension-thousand-floor'
  | 'pension-minimum'
  | 'pension-maximum'
  | 'pension-excluded'
  | 'health-minimum'
  | 'health-maximum'
  | 'health-excluded'
  | 'employment-excluded'
  | 'employer-size-rate'
  | 'industrial-rate-entered'
  | 'industrial-rate-missing';

export interface SocialInsuranceResult {
  monthlyGross: number;
  monthlyNonTaxable: number;
  remunerationBase: number;
  pensionBase: number;
  pensionMinimumBase: number;
  pensionMaximumBase: number;
  employee: {
    pension: number;
    health: number;
    longTermCare: number;
    employment: number;
    total: number;
  };
  employer: {
    pension: number;
    health: number;
    longTermCare: number;
    employment: number;
    employmentStability: number;
    industrialAccident: number;
    total: number;
  };
  combinedTotal: number;
  payAfterEmployeeInsurance: number;
  employerLaborCost: number;
  employmentStabilityRate: number;
  industrialAccidentRate: number;
  employeeEffectiveRate: number;
  reasons: ResultReason[];
}

/** Parses comma-grouped, full-width, won-sign, 원 and 만원 input. */
export function parseWon(value: number | string): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const normalized = value.normalize('NFKC').trim().replaceAll(',', '').replaceAll(' ', '').replace(/^₩/, '');
  const match = normalized.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(만)?원?$/);
  if (!match) return null;

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed * (match[2] ? 10_000 : 1) : null;
}

export function calculateSocialInsurance(input: SocialInsuranceInput): SocialInsuranceResult | null {
  const pay = parseWon(input.pay);
  const monthlyNonTaxable = parseWon(input.monthlyNonTaxable);
  const industrialAccidentRatePercent = parseWon(input.industrialAccidentRatePercent);
  const validPayPeriod = input.payPeriod === 'monthly' || input.payPeriod === 'annual';
  const validPensionPeriod = input.pensionPeriod === 'first-half' || input.pensionPeriod === 'second-half';
  const validWorkplaceSize = Object.hasOwn(SOCIAL_INSURANCE_RULES_2026.employment.stabilityRates, input.workplaceSize);

  if (
    pay === null ||
    monthlyNonTaxable === null ||
    industrialAccidentRatePercent === null ||
    !validPayPeriod ||
    !validPensionPeriod ||
    !validWorkplaceSize ||
    pay <= 0 ||
    monthlyNonTaxable < 0 ||
    industrialAccidentRatePercent < 0 ||
    industrialAccidentRatePercent > SOCIAL_INSURANCE_RULES_2026.maximumIndustrialAccidentRatePercent ||
    (input.payPeriod === 'monthly' && pay > SOCIAL_INSURANCE_RULES_2026.maximumMonthlyPayInput) ||
    (input.payPeriod === 'annual' && pay > SOCIAL_INSURANCE_RULES_2026.maximumAnnualPayInput)
  ) {
    return null;
  }

  const monthlyGross = Math.floor(input.payPeriod === 'annual' ? pay / 12 : pay);
  const normalizedNonTaxable = Math.floor(monthlyNonTaxable);
  if (normalizedNonTaxable > monthlyGross) return null;

  const remunerationBase = monthlyGross - normalizedNonTaxable;
  const pensionRules =
    input.pensionPeriod === 'first-half'
      ? SOCIAL_INSURANCE_RULES_2026.pension.firstHalf
      : SOCIAL_INSURANCE_RULES_2026.pension.secondHalf;
  const pensionBaseBeforeLimits =
    Math.floor(remunerationBase / SOCIAL_INSURANCE_RULES_2026.pension.incomeRoundingUnit) *
    SOCIAL_INSURANCE_RULES_2026.pension.incomeRoundingUnit;
  const pensionBase = input.coverage.pension
    ? clamp(pensionBaseBeforeLimits, pensionRules.minimumBase, pensionRules.maximumBase)
    : 0;

  const pension = input.coverage.pension
    ? roundDownToTen(pensionBase * SOCIAL_INSURANCE_RULES_2026.pension.employeeRate)
    : 0;
  const rawHealth = roundDownToTen(remunerationBase * SOCIAL_INSURANCE_RULES_2026.health.employeeRate);
  const health = input.coverage.health
    ? clamp(
        rawHealth,
        SOCIAL_INSURANCE_RULES_2026.health.totalPremiumMinimum / 2,
        SOCIAL_INSURANCE_RULES_2026.health.totalPremiumMaximum / 2,
      )
    : 0;
  const longTermCare = input.coverage.health
    ? roundDownToTen(health * SOCIAL_INSURANCE_RULES_2026.longTermCare.healthPremiumRatio)
    : 0;
  const employment = input.coverage.employment
    ? roundDownToTen(remunerationBase * SOCIAL_INSURANCE_RULES_2026.employment.unemploymentEmployeeRate)
    : 0;
  const employmentStabilityRate = SOCIAL_INSURANCE_RULES_2026.employment.stabilityRates[input.workplaceSize];
  const employmentStability = input.coverage.employment
    ? roundDownToTen(remunerationBase * employmentStabilityRate)
    : 0;
  const industrialAccidentRate = industrialAccidentRatePercent / 100;
  const industrialAccident = roundDownToTen(remunerationBase * industrialAccidentRate);

  const employeeTotal = pension + health + longTermCare + employment;
  const employerTotal = pension + health + longTermCare + employment + employmentStability + industrialAccident;
  const reasons: ResultReason[] = [];

  if (input.payPeriod === 'annual') reasons.push('annual-converted');
  if (normalizedNonTaxable > 0) reasons.push('non-taxable-excluded');
  if (!input.coverage.pension) {
    reasons.push('pension-excluded');
  } else {
    if (pensionBaseBeforeLimits !== remunerationBase) reasons.push('pension-thousand-floor');
    if (pensionBaseBeforeLimits < pensionRules.minimumBase) reasons.push('pension-minimum');
    if (pensionBaseBeforeLimits > pensionRules.maximumBase) reasons.push('pension-maximum');
  }
  if (!input.coverage.health) {
    reasons.push('health-excluded');
  } else if (rawHealth < SOCIAL_INSURANCE_RULES_2026.health.totalPremiumMinimum / 2) {
    reasons.push('health-minimum');
  } else if (rawHealth > SOCIAL_INSURANCE_RULES_2026.health.totalPremiumMaximum / 2) {
    reasons.push('health-maximum');
  }
  if (!input.coverage.employment) reasons.push('employment-excluded');
  if (input.coverage.employment) reasons.push('employer-size-rate');
  reasons.push(industrialAccidentRatePercent > 0 ? 'industrial-rate-entered' : 'industrial-rate-missing');

  return {
    monthlyGross,
    monthlyNonTaxable: normalizedNonTaxable,
    remunerationBase,
    pensionBase,
    pensionMinimumBase: pensionRules.minimumBase,
    pensionMaximumBase: pensionRules.maximumBase,
    employee: {
      pension,
      health,
      longTermCare,
      employment,
      total: employeeTotal,
    },
    employer: {
      pension,
      health,
      longTermCare,
      employment,
      employmentStability,
      industrialAccident,
      total: employerTotal,
    },
    combinedTotal: employeeTotal + employerTotal,
    payAfterEmployeeInsurance: monthlyGross - employeeTotal,
    employerLaborCost: monthlyGross + employerTotal,
    employmentStabilityRate,
    industrialAccidentRate,
    employeeEffectiveRate: monthlyGross > 0 ? employeeTotal / monthlyGross : 0,
    reasons,
  };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(value, maximum));
}

function roundDownToTen(value: number): number {
  return (
    Math.floor((value + 1e-7) / SOCIAL_INSURANCE_RULES_2026.premiumRoundingUnit) *
    SOCIAL_INSURANCE_RULES_2026.premiumRoundingUnit
  );
}
