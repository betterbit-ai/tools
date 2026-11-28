import type { ToolMeta, ToolVariant } from '../types';
import { RULES_2026, benefitDaysFor, calculateUnemploymentBenefit, type AgeGroup } from './logic';

const comma = (value: number) => Math.round(value).toLocaleString('en-US');

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
    const otherAge: AgeGroup = age.ageGroup === 'under-50' ? '50-or-disabled' : 'under-50';
    const otherDays = benefitDaysFor(coverage.months, otherAge);
    const tableRows = COVERAGE_CASES.map((row) => [
      row.shortEn === '6 months' ? 'Under 12 months' : row.shortEn,
      String(benefitDaysFor(row.months, 'under-50')),
      String(benefitDaysFor(row.months, '50-or-disabled')),
    ]);
    return {
      slug: `duration-${age.slug}-${coverage.slug}`,
      preset: { ageGroup: age.ageGroup, insuranceMonths: coverage.months },
      content: {
        en: {
          title: `${days}-Day Korea Benefit — ${coverage.shortEn}, ${age.shortEn}`,
          description: `With ${coverage.en} of coverage and ${age.en} at separation, Korea's prescribed unemployment-benefit period is ${days} days if eligible.`,
          h1: `${days}-Day Benefit Period · ${age.en}`,
          intro: `For an ordinary employee who is ${age.en} at separation with ${coverage.en} of qualifying Employment Insurance coverage, the statutory table gives ${days} prescribed benefit days. Benefits must still be claimed within 12 months after separation, and eligibility must be approved; edit the coverage or age band below to compare another row.`,
          sections: [
            {
              heading: `What the ${days}-day figure does and does not cover`,
              body: `The ${days} days come from the 2026 table for ordinary employees, read across two axes: how long the Employment Insurance coverage ran and which age band applies at separation. The same coverage is worth ${otherDays} days on the ${otherAge === '50-or-disabled' ? 'age 50+ / disabled' : 'under-50'} side of the table, which is why the age at separation has to be decided before the row is chosen.

The number is a ceiling on prescribed days, not a promise of payment. You need at least 180 insured-unit days in the 18 months before separation and a separation reason the law does not disqualify, and the days must be used within 12 months of the day after separation — days left after that window expire even if they were never claimed. Each payment also has a daily floor and a 2026 cap of ₩68,100, so the amount per day is separate from the ${days}-day length.`,
              table: {
                caption: '2026 prescribed benefit days by coverage and age band',
                head: ['Coverage', 'Under 50', 'Age 50+ or disabled'],
                rows: tableRows,
              },
            },
          ],
          faq: [
            {
              q: `How many unemployment-benefit days does ${coverage.shortEn} of coverage give?`,
              a: `${days} days in the 2026 table for someone ${age.en} at separation. The same ${coverage.shortEn} gives ${otherDays} days on the other side of the age split, so check the age band before relying on the figure.`,
            },
            {
              q: `What has to be true before those ${days} days can be paid?`,
              a: 'At least 180 insured-unit days in the 18 months before separation, a separation reason that does not disqualify you, and an active job search. The days must be claimed within 12 months of the day after separation, after which the remaining days expire.',
            },
            {
              q: `Does the daily payment change the total for ${days} days?`,
              a: `It does. The days fix the length, while the daily amount is 60% of the average daily wage for the last three months, never below the 2026 floor (₩${comma(RULES_2026.hourlyMinimumWage * RULES_2026.minimumBenefitRate)} per contracted hour) and never above ₩${comma(RULES_2026.maximumDailyBenefit)} a day.`,
            },
          ],
        },
        ko: {
          title: `실업급여 수급기간 — ${age.ko}·고용보험 ${coverage.ko}이면 ${days}일`,
          description: `${age.ko}, 고용보험 가입기간 ${coverage.ko}이면 실업급여 소정급여일수는 ${days}일입니다. 수급자격 인정 후 이직 다음 날부터 12개월 안에 받아야 합니다.`,
          h1: `${age.ko}·고용보험 ${coverage.ko} 실업급여 수급기간`,
          intro: `${age.ko}이고 합산 대상 고용보험 가입기간이 ${coverage.ko}인 일반 근로자는 수급자격이 인정되면 소정급여일수 ${days}일을 적용받습니다. 다만 이직 다음 날부터 12개월이 지나면 남은 일수가 있어도 받을 수 없습니다. 아래에서 가입기간과 연령 구간을 바꾸면 공식 표의 다른 구간을 바로 비교할 수 있습니다.`,
          sections: [
            {
              heading: `${days}일은 무엇을 뜻하고, 무엇을 보장하지 않나`,
              body: `${days}일은 2026년 일반 근로자 기준 소정급여일수 표를 두 축으로 읽은 값입니다. 하나는 고용보험 가입기간, 다른 하나는 이직 당시의 연령 구간입니다. 같은 ${coverage.ko}이라도 ${otherAge === '50-or-disabled' ? '50세 미만' : '50세 이상·장애인'} 구간에서는 ${otherDays}일이 되므로, 표의 행을 고르기 전에 연령 구간을 먼저 확정해야 합니다.

이 숫자는 받을 수 있는 일수의 상한이지 지급 확정은 아닙니다. 이직 전 18개월 중 피보험단위기간 180일 이상과 법에서 정한 이직 사유, 적극적인 구직 활동이 함께 충족되어야 하고, 이직 다음 날부터 12개월 안에 받아야 합니다. 그 기간이 지나면 남은 일수는 소멸합니다. 하루 지급액은 별도로 정해져 2026년 상한이 1일 ${comma(RULES_2026.maximumDailyBenefit)}이고 하한은 소정근로시간 1시간당 ${comma(RULES_2026.hourlyMinimumWage * RULES_2026.minimumBenefitRate)}입니다.`,
              table: {
                caption: '2026년 고용보험 가입기간·연령 구간별 소정급여일수',
                head: ['가입기간', '50세 미만', '50세 이상·장애인'],
                rows: tableRows,
              },
            },
          ],
          faq: [
            {
              q: `고용보험 ${coverage.ko}이면 실업급여를 며칠 받나요?`,
              a: `${age.ko} 기준으로 2026년 표에서 ${days}일입니다. 같은 가입기간이라도 ${otherAge === '50-or-disabled' ? '50세 미만' : '50세 이상·장애인'} 구간이면 ${otherDays}일이므로 연령 구간을 먼저 확인해야 합니다.`,
            },
            {
              q: `${days}일을 받으려면 어떤 조건이 필요한가요?`,
              a: '이직 전 18개월 중 피보험단위기간 180일 이상, 법에서 정한 이직 사유, 적극적인 구직 활동이 필요합니다. 또한 이직 다음 날부터 12개월 안에 신청·수급해야 하고, 그 기간이 지나면 남은 일수는 사라집니다.',
            },
            {
              q: `하루 지급액이 달라지면 ${days}일 총액도 달라지나요?`,
              a: `그렇습니다. 일수는 기간을 정하고, 하루 지급액은 이직 전 3개월 평균임금의 60%로 정해지되 2026년 하한(소정근로시간 1시간당 ${comma(RULES_2026.hourlyMinimumWage * RULES_2026.minimumBenefitRate)})과 상한(1일 ${comma(RULES_2026.maximumDailyBenefit)})을 벗어날 수 없습니다.`,
            },
          ],
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

const minimumVariant: ToolVariant = {
  slug: 'minimum-2026',
  preset: minimumPreset,
  content: {
    en: {
      title: `Korea Unemployment Benefit Minimum 2026 — ₩${comma(minimumResult.minimumDailyBenefit)}/Day`,
      description: `The 2026 minimum for an 8-hour contracted day is ₩${comma(minimumResult.minimumDailyBenefit)}: ₩${comma(RULES_2026.hourlyMinimumWage)} × 80% × 8 hours.`,
      h1: '2026 Korea Unemployment Benefit Minimum',
      intro: `The 2026 daily floor is ₩${comma(minimumResult.minimumDailyBenefit)} for an 8-hour contracted day. It is calculated as the ₩${comma(RULES_2026.hourlyMinimumWage)} hourly minimum wage × 80% × 8; the floor scales to ₩${comma(RULES_2026.hourlyMinimumWage * RULES_2026.minimumBenefitRate)} per contracted hour for 1–8 hours. The fields below open on the 8-hour floor case.`,
      sections: [
        {
          heading: 'The floor, hour by hour',
          body: `The floor exists so that a low-wage claim still pays something usable: it is set at 80% of the 2026 minimum wage — ₩${comma(RULES_2026.hourlyMinimumWage * RULES_2026.minimumBenefitRate)} per contracted hour — rather than 60% of the average daily wage. For a full 8-hour day that gives ₩${comma(minimumResult.minimumDailyBenefit)}, and a part-time contract scales the same figure down with its scheduled hours.

The floor is a minimum, not the benefit itself. The daily amount is the higher of the wage-based 60% and this floor, and it can never exceed the 2026 cap of ₩${comma(RULES_2026.maximumDailyBenefit)} a day. A worker whose average daily wage already produces more than ₩${comma(minimumResult.minimumDailyBenefit)} is paid on the wage figure instead, so the floor matters most for short-hours and low-wage claims.`,
          table: {
            caption: '2026 daily floor by contracted hours',
            head: ['Contracted hours per day', 'Daily floor (KRW)'],
            rows: [1, 2, 3, 4, 5, 6, 7, 8].map((hours) => [
              `${hours} hour${hours === 1 ? '' : 's'}`,
              comma(RULES_2026.hourlyMinimumWage * RULES_2026.minimumBenefitRate * hours),
            ]),
          },
        },
      ],
      faq: [
        {
          q: 'What is the 2026 minimum daily unemployment benefit in Korea?',
          a: `₩${comma(minimumResult.minimumDailyBenefit)} for an 8-hour contracted day, or ₩${comma(RULES_2026.hourlyMinimumWage * RULES_2026.minimumBenefitRate)} per contracted hour. It is 80% of the ₩${comma(RULES_2026.hourlyMinimumWage)} 2026 minimum wage, not 60% of the claimant's wage.`,
        },
        {
          q: 'Does the floor apply to part-time workers?',
          a:
            'Yes, in proportion to the contracted hours. A 4-hour contract uses half of the 8-hour floor, so the daily floor is ₩' +
            comma(RULES_2026.hourlyMinimumWage * RULES_2026.minimumBenefitRate * 4) +
            ', while the cap and the 60% wage calculation still apply in the same way.',
        },
        {
          q: 'Can the floor ever be higher than the actual benefit?',
          a: `The floor raises the payment only up to the wage-based amount; the claimant receives whichever is higher, capped at ₩${comma(RULES_2026.maximumDailyBenefit)} a day. For a high daily wage the cap binds before the floor matters.`,
        },
      ],
    },
    ko: {
      title: `실업급여 하한액 2026 — 8시간 기준 1일 ${comma(minimumResult.minimumDailyBenefit)}원`,
      description: `2026년 실업급여 하한액은 8시간 기준 하루 ${comma(minimumResult.minimumDailyBenefit)}원입니다. 최저시급 ${comma(RULES_2026.hourlyMinimumWage)}원 × 80% × 소정근로시간으로 계산합니다.`,
      h1: '실업급여 하한액 2026',
      intro: `2026년 일반 근로자의 실업급여 하한액은 1일 8시간 기준 ${comma(minimumResult.minimumDailyBenefit)}원입니다. 2026년 최저시급 ${comma(RULES_2026.hourlyMinimumWage)}원 × 80% × 8시간으로 계산하며, 1~8시간 근로자는 소정근로시간 1시간당 ${comma(RULES_2026.hourlyMinimumWage * RULES_2026.minimumBenefitRate)}원씩 적용됩니다. 아래 계산기는 8시간 하한액이 적용되는 조건으로 열립니다.`,
      sections: [
        {
          heading: '하한액은 시간별로 이렇게 계산됩니다',
          body: `하한액은 저임금·단시간 가입자도 쓸 만한 금액을 받도록 2026년 최저임금의 80%, 즉 소정근로시간 1시간당 ${comma(RULES_2026.hourlyMinimumWage * RULES_2026.minimumBenefitRate)}원을 기준으로 정합니다. 8시간을 일한 계약이면 1일 ${comma(minimumResult.minimumDailyBenefit)}원이고, 단시간 계약은 소정근로시간에 비례해 줄어듭니다.

하한액은 지급액 자체가 아니라 최소선입니다. 하루 지급액은 평균임금의 60%로 계산한 금액과 하한액 중 큰 쪽으로 정해지고, 2026년 상한인 1일 ${comma(RULES_2026.maximumDailyBenefit)}원을 넘을 수 없습니다. 평균임금이 이미 하한액보다 큰 금액을 만드는 근로자는 임금 기준으로 지급받으므로, 하한액은 주로 단시간·저임금 가입자에게 의미가 있습니다.`,
          table: {
            caption: '2026년 소정근로시간별 1일 하한액',
            head: ['소정근로시간', '1일 하한액(원)'],
            rows: [1, 2, 3, 4, 5, 6, 7, 8].map((hours) => [
              `${hours}시간`,
              comma(RULES_2026.hourlyMinimumWage * RULES_2026.minimumBenefitRate * hours),
            ]),
          },
        },
      ],
      faq: [
        {
          q: '2026년 실업급여 하한액은 얼마인가요?',
          a: `8시간 기준 1일 ${comma(minimumResult.minimumDailyBenefit)}원이고, 소정근로시간 1시간당 ${comma(RULES_2026.hourlyMinimumWage * RULES_2026.minimumBenefitRate)}원입니다. 평균임금의 60%가 아니라 2026년 최저임금 ${comma(RULES_2026.hourlyMinimumWage)}원의 80%로 정해집니다.`,
        },
        {
          q: '단시간 근로자도 하한액을 받을 수 있나요?',
          a: `네, 소정근로시간에 비례해 적용됩니다. 1일 4시간 계약이면 8시간 하한액의 절반인 ${comma(RULES_2026.hourlyMinimumWage * RULES_2026.minimumBenefitRate * 4)}원이 하한이 되고, 상한과 평균임금 60% 계산은 그대로 함께 적용됩니다.`,
        },
        {
          q: '하한액이 실제 지급액보다 클 수도 있나요?',
          a: `하한액과 평균임금 60% 중 큰 금액이 지급되므로 지급액이 하한액보다 작아지지는 않습니다. 다만 2026년 상한인 1일 ${comma(RULES_2026.maximumDailyBenefit)}원을 넘을 수 없어, 임금이 높은 경우에는 하한액보다 상한이 먼저 적용됩니다.`,
        },
      ],
    },
  },
};

export const meta: ToolMeta = {
  slug: 'unemployment-benefit-kr',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-13',
  updated: '2026-11-28',
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
