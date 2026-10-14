import type { Locale } from '../../i18n/locales';
import type { CompoundFrequency, ContributionTiming } from './logic';

export interface CompoundInterestState {
  principal: number | '';
  monthlyContribution: number | '';
  annualRate: number | '';
  years: number | '';
  frequency: CompoundFrequency;
  contributionTiming: ContributionTiming;
}

export function defaultCompoundInterestState(locale: Locale): CompoundInterestState {
  return locale === 'ko'
    ? {
        principal: 10_000_000,
        monthlyContribution: 500_000,
        annualRate: 5,
        years: 10,
        frequency: 'monthly',
        contributionTiming: 'end',
      }
    : {
        principal: 10_000,
        monthlyContribution: 500,
        annualRate: 7,
        years: 20,
        frequency: 'monthly',
        contributionTiming: 'end',
      };
}

/** Restores only safe form values, including intentional blank number fields. */
export function restoreCompoundInterestState(saved: unknown, fallback: CompoundInterestState): CompoundInterestState {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return fallback;
  const value = saved as Partial<CompoundInterestState>;
  return {
    principal: isInputNumber(value.principal) ? value.principal : fallback.principal,
    monthlyContribution: isInputNumber(value.monthlyContribution)
      ? value.monthlyContribution
      : fallback.monthlyContribution,
    annualRate: isInputNumber(value.annualRate) ? value.annualRate : fallback.annualRate,
    years: isInputNumber(value.years) ? value.years : fallback.years,
    frequency: isFrequency(value.frequency) ? value.frequency : fallback.frequency,
    contributionTiming: isTiming(value.contributionTiming) ? value.contributionTiming : fallback.contributionTiming,
  };
}

function isInputNumber(value: unknown): value is number | '' {
  return value === '' || (typeof value === 'number' && Number.isFinite(value));
}

function isFrequency(value: unknown): value is CompoundFrequency {
  return value === 'annual' || value === 'quarterly' || value === 'monthly' || value === 'daily';
}

function isTiming(value: unknown): value is ContributionTiming {
  return value === 'beginning' || value === 'end';
}
