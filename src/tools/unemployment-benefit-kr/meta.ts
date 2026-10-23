import type { ToolMeta, ToolVariant } from '../types';
import { RULES_2026, benefitDaysFor, calculateUnemploymentBenefit, type AgeGroup } from './logic';

const COVERAGE_CASES = [
  { months: 6, slug: '6-months', ko: '6개월(1년 미만)', en: '6 months (under 1 year)', shortEn: '6 months' },
  { months: 12, slug: '1-year', ko: '1년', en: '1 year', shortEn: '1 year' },
  { months: 36, slug: '3-years', ko: '3년', en: '3 years', shortEn: '3 years' },
  { months: 60, slug: '5-years', ko: '5년', en: '5 years', shortEn: '5 years' },
  { months: 120, slug: '10-years', ko: '10년', en: '10 years', shortEn: '10 years' },
] as const;

const AGE_CASES: readonly { ageGroup: AgeGroup; slug: string; ko: string; en: string; shortEn: string }[] = [
  { ageGroup: 'under-50', slug: 'under-50', ko: '50세 미만', en: 'under age 50', shortEn: 'under 50' },
  {
    ageGroup: '50-or-disabled',
    slug: '50-or-disabled',
    ko: '50세 이상·장애인',
    en: 'age 50+ or disabled',
    shortEn: '50+/disabled',
  },
];

const durationVariants: ToolVariant[] = AGE_CASES.flatMap((age) =>
  COVERAGE_CASES.map((coverage) => {
    const days = benefitDaysFor(coverage.months, age.ageGroup);
    return {
      slug: `duration-${age.slug}-${coverage.slug}`,
      preset: { ageGroup: age.ageGroup, insuranceMonths: coverage.months },
      content: {
        en: {
          title: `${days}-Day Korea Benefit — ${coverage.shortEn}, ${age.shortEn}`,
          description: `With ${coverage.en} of coverage and ${age.en} at separation, Korea's prescribed unemployment-benefit period is ${days} days if eligible.`,
          h1: `${days}-Day Benefit Period · ${age.en}`,
          intro: `For an ordinary employee who is ${age.en} at separation with ${coverage.en} of qualifying Employment Insurance coverage, the statutory table gives ${days} prescribed benefit days. Benefits must still be claimed within 12 months after separation, and eligibility must be approved; edit the coverage or age band below to compare another row.`,
        },
        ko: {
          title: `실업급여 수급기간 — ${age.ko}·고용보험 ${coverage.ko}이면 ${days}일`,
          description: `${age.ko}, 고용보험 가입기간 ${coverage.ko}이면 실업급여 소정급여일수는 ${days}일입니다. 수급자격 인정 후 이직 다음 날부터 12개월 안에 받아야 합니다.`,
          h1: `${age.ko}·고용보험 ${coverage.ko} 실업급여 수급기간`,
          intro: `${age.ko}이고 합산 대상 고용보험 가입기간이 ${coverage.ko}인 일반 근로자는 수급자격이 인정되면 소정급여일수 ${days}일을 적용받습니다. 다만 이직 다음 날부터 12개월이 지나면 남은 일수가 있어도 받을 수 없습니다. 아래에서 가입기간과 연령 구간을 바꾸면 공식 표의 다른 구간을 바로 비교할 수 있습니다.`,
        },
      },
    };
  }),
);

const minimumPreset = {
  averageDailyWage: 50_000,
  ordinaryDailyWage: 0,
  scheduledHoursPerDay: 8,
};
const minimumResult = calculateUnemploymentBenefit({
  ...minimumPreset,
  insuranceMonths: 48,
  ageGroup: 'under-50',
  insuredUnitDays: 180,
  eligibleSeparation: true,
  seekingWork: true,
})!;
const comma = (value: number) => Math.round(value).toLocaleString('en-US');

const minimumVariant: ToolVariant = {
  slug: 'minimum-2026',
  preset: minimumPreset,
  content: {
    en: {
      title: `Korea Unemployment Benefit Minimum 2026 — ₩${comma(minimumResult.minimumDailyBenefit)}/Day`,
      description: `The 2026 minimum for an 8-hour contracted day is ₩${comma(minimumResult.minimumDailyBenefit)}: ₩${comma(RULES_2026.hourlyMinimumWage)} × 80% × 8 hours.`,
      h1: '2026 Korea Unemployment Benefit Minimum',
      intro: `The 2026 daily floor is ₩${comma(minimumResult.minimumDailyBenefit)} for an 8-hour contracted day. It is calculated as the ₩${comma(RULES_2026.hourlyMinimumWage)} hourly minimum wage × 80% × 8; the floor scales to ₩${comma(RULES_2026.hourlyMinimumWage * RULES_2026.minimumBenefitRate)} per contracted hour for 1–8 hours. The fields below open on the 8-hour floor case.`,
    },
    ko: {
      title: `실업급여 하한액 2026 — 8시간 기준 1일 ${comma(minimumResult.minimumDailyBenefit)}원`,
      description: `2026년 실업급여 하한액은 8시간 기준 하루 ${comma(minimumResult.minimumDailyBenefit)}원입니다. 최저시급 ${comma(RULES_2026.hourlyMinimumWage)}원 × 80% × 소정근로시간으로 계산합니다.`,
      h1: '실업급여 하한액 2026',
      intro: `2026년 일반 근로자의 실업급여 하한액은 1일 8시간 기준 ${comma(minimumResult.minimumDailyBenefit)}원입니다. 2026년 최저시급 ${comma(RULES_2026.hourlyMinimumWage)}원 × 80% × 8시간으로 계산하며, 1~8시간 근로자는 소정근로시간 1시간당 ${comma(RULES_2026.hourlyMinimumWage * RULES_2026.minimumBenefitRate)}원씩 적용됩니다. 아래 계산기는 8시간 하한액이 적용되는 조건으로 열립니다.`,
    },
  },
};

export const meta: ToolMeta = {
  slug: 'unemployment-benefit-kr',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-13',
  updated: '2026-10-23',
  edges: ['accuracy', 'privacy', 'usability'],
  competitors: [
    {
      name: '고용24 — 실업급여 모의계산',
      url: 'https://www.work24.go.kr/cm/c/f/1100/selecSimulate.do?systId=SI00000411',
      weakness:
        'The opened regular-employee flow asks for the first six digits of a resident-registration number and then expands into dates, three wage rows, and several alternative worker-type forms before the estimate. Betterbit asks no birth-date or ID data, restores only the calculation state in local browser storage, and makes the 2026 cap, hourly floor, and three eligibility checks visible together. (Strength: it is the official simulator and covers day workers, artists, labour providers, self-employed people, and early re-employment.)',
    },
    {
      name: '봉급계산소 — 실업급여(구직급여) 계산기',
      url: 'https://moneywatch.kr/calc/unemployment-benefit',
      weakness:
        'The searched result advertises a 2026 estimate from pre-leaving pay, age, and coverage, but its page could not be opened by the web fetcher to inspect the calculation basis or its treatment of part-time hours. Betterbit exposes the exact KRW 68,100 cap and the 80% minimum-wage floor for each 1–8-hour selection in the result itself. (Strength: its Korean landing result is concise.)',
    },
    {
      name: 'CalcTool — 실업급여 계산기',
      url: 'https://calctool.co.kr/unemployment-benefit-calculator',
      weakness:
        'Its opened form starts with daily average wage, daily ordinary wage, daily hours, coverage period, and special-case selection; the official 2026 floor is explained below the hours selector rather than surfaced as an immediate result. Betterbit keeps a shorter standard-employee path and shows the applied floor, wage-rate, or cap beside the total. (Strength: it supports ordinary-wage comparison and selected special cases that Betterbit intentionally sends to the official simulator.)',
    },
    {
      name: 'WorkCal — Korea Unemployment Benefit Calculator',
      url: 'https://workcal.kr/en/retirement-unemployment/unemployment-benefit-calculator/',
      weakness:
        'Its opened English calculator asks for insured days, coverage years, age, daily wage, hours, separation reason, disability status, unemployment, ability, and job-search status as separate inputs. Betterbit groups the three high-level statutory checks and gives a live breakdown without requesting a date of birth. (Strength: it offers more detailed separation-reason choices and a dedicated English methodology page.)',
    },
    {
      name: 'Kmagpie Tools — Korean Unemployment Benefit Calculator',
      url: 'https://www.kmagpie.com/en/tools/unemployment/',
      weakness:
        'Its opened English form accepts only average monthly pay, coverage years and months, age/disability, and daily hours; it does not collect the 180 insured-unit days or high-level separation/job-search checks before presenting a payout. Betterbit places all three checks next to the estimate and accepts the daily wage used by the statutory formula. (Strength: it provides unusually clear English explanations for foreign residents.)',
    },
    {
      name: 'KBG Tools — Korea Unemployment Benefit Calculator',
      url: 'https://kbgtools.com/en/unemployment-benefit-calculator',
      weakness:
        'The English search result identifies a 2026 daily-and-total calculator, but its page returned a cache miss when opened, leaving its inputs and calculation basis unavailable for review. Betterbit makes its 2026 constants and floor/cap application visible directly in the first result. (Strength: unavailable to assess because the opened page did not load.)',
    },
  ],
  related: [
    'salary-calculator-kr',
    'severance-pay-kr',
    'hours-calculator',
    'weekly-holiday-pay-kr',
    'social-insurance-kr',
  ],
  variants: [...durationVariants, minimumVariant],
};
