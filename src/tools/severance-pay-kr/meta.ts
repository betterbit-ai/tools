import type { ToolMeta, ToolVariant } from '../types';
import { calculateSeverance, type SeveranceInput } from './logic';

const MONTHLY_PAY_MANWON = [250, 300, 400] as const;
const SERVICE_YEARS = [1, 3, 5] as const;
const REFERENCE_LAST_WORKING_DATE = '2026-02-28';

const comma = (value: number) => Math.round(value).toLocaleString('en-US');

/**
 * Common-search scenarios use a 2026 reference retirement date whose final
 * three-month period is exactly 90 calendar days. Every snippet is generated
 * through the same statutory calculation used by the interactive tool.
 */
function scenario(monthlyPay: number, serviceYears: number): SeveranceInput {
  return {
    startDate: `${2026 - serviceYears}-03-01`,
    lastWorkingDate: REFERENCE_LAST_WORKING_DATE,
    wages: [monthlyPay, monthlyPay, monthlyPay],
    annualBonus: 0,
    annualLeavePay: 0,
    dailyOrdinaryWage: 0,
    weeklyHours: 40,
  };
}

const variants: ToolVariant[] = MONTHLY_PAY_MANWON.flatMap((payManwon) =>
  SERVICE_YEARS.map((serviceYears) => {
    const monthlyPay = payManwon * 10_000;
    const preset = scenario(monthlyPay, serviceYears);
    const result = calculateSeverance(preset)!;
    const amount = comma(result.severancePay);
    const serviceDays = comma(result.serviceDays);
    const yearlyRows = Array.from({ length: 10 }, (_, index) => {
      const years = index + 1;
      const row = calculateSeverance(scenario(monthlyPay, years))!;
      return [String(years), comma(row.serviceDays), comma(row.severancePay)];
    });

    return {
      slug: `${payManwon}-manwon-${serviceYears}-${serviceYears === 1 ? 'year' : 'years'}`,
      preset: { ...preset },
      content: {
        en: {
          title: `₩${payManwon / 100}M Monthly Pay, ${serviceYears} Year${serviceYears === 1 ? '' : 's'} — ₩${amount} Severance Estimate`,
          description: `With ₩${comma(monthlyPay)} monthly pay and ${serviceYears} year${serviceYears === 1 ? '' : 's'} of service, the statutory Korean severance estimate is ₩${amount} before tax under the stated assumptions.`,
          h1: `₩${payManwon / 100}M Pay · ${serviceYears}-Year Severance`,
          intro: `The calculated before-tax estimate is ₩${amount}: three final monthly wage totals of ₩${comma(monthlyPay)}, a 90-day average-wage period, and ${serviceDays} continuous-service days through February 28, 2026. It assumes 40 weekly hours, no eligible bonus or leave pay, and no higher ordinary-wage floor; change any field below for your actual records.`,
          sections: [
            {
              heading: `How ₩${amount} is built from ₩${comma(monthlyPay)} a month`,
              body: `Korean severance is one day's average wage × 30 days × (service days ÷ 365). The average daily wage here is ₩${comma(result.averageDailyWage)}: the three final monthly wages of ₩${comma(monthlyPay)} added to ₩${comma(result.includedBonus)} of bonus and ₩${comma(result.includedAnnualLeavePay)} of leave pay, divided by the ${comma(result.averageWageDays)} days in the three-month window ending February 28, 2026.

Two eligibility conditions decide whether the figure is payable at all: at least 365 days of continuous service and an average of 15 or more prescribed hours a week. This scenario meets both. The service-days figure of ${serviceDays} comes from counting calendar days from the start date to the day after the last working day, so the total moves by a day or two in a leap year — the table shows the same calculation for one to ten years of service at the same pay.`,
              table: {
                caption: `Estimated before-tax severance at ₩${comma(monthlyPay)} a month by service length`,
                head: ['Service', 'Service days', 'Severance before tax (KRW)'],
                rows: yearlyRows.map((row) => [`${row[0]} year${row[0] === '1' ? '' : 's'}`, row[1], row[2]]),
              },
            },
          ],
          faq: [
            {
              q: `How much severance do I get after ${serviceYears} year${serviceYears === 1 ? '' : 's'} on ₩${comma(monthlyPay)} a month?`,
              a: `About ₩${amount} before tax, on the stated assumptions: a 90-day average-wage window, no bonus or leave pay, 40 weekly hours and a last working day of February 28, 2026. A different end date or a higher ordinary wage changes the result.`,
            },
            {
              q: 'What is the severance formula in Korea?',
              a: `One day's average wage × 30 × (service days ÷ 365). Here that is ₩${comma(result.averageDailyWage)} × 30 × (${serviceDays} ÷ 365) = ₩${amount}. The average daily wage uses the final three months of wages, plus one quarter of an annual bonus and of eligible unused leave pay.`,
            },
            {
              q: 'Is one year of service enough for severance?',
              a: 'Continuous service must reach 365 days, and the contract must average at least 15 prescribed hours a week. Below either threshold the statutory severance is ₩0, even when the arithmetic above would produce a number.',
            },
          ],
        },
        ko: {
          title: `월급 ${payManwon}만원 퇴직금 — 근속 ${serviceYears}년 세전 ${amount}원 (2026 계산법)`,
          description: `월급 ${payManwon}만원, 근속 ${serviceYears}년이면 퇴직금은 세전 약 ${amount}원입니다. 퇴직 전 3개월 임금과 ${serviceDays}일 재직기간을 법정 산식으로 계산했습니다.`,
          h1: `월급 ${payManwon}만원·근속 ${serviceYears}년 퇴직금`,
          intro: `세전 예상 퇴직금은 ${amount}원입니다. 2026년 2월 28일 마지막 근무, 퇴직 전 3개월 임금이 매달 ${comma(monthlyPay)}원, 평균임금 산정기간 90일, 계속근로 ${serviceDays}일로 계산했습니다. 주 40시간, 상여금·연차수당·더 높은 통상임금은 없는 조건이며 실제 날짜와 급여명세서 금액으로 아래에서 다시 계산할 수 있습니다.`,
          sections: [
            {
              heading: `월급 ${payManwon}만원에서 ${amount}원이 나오는 계산`,
              body: `퇴직금은 1일 평균임금 × 30일 × (재직일수 ÷ 365)로 계산합니다. 이 사례의 1일 평균임금은 ${comma(result.averageDailyWage)}원입니다. 퇴직 전 3개월 임금 합계에 상여금 ${comma(result.includedBonus)}원과 연차수당 ${comma(result.includedAnnualLeavePay)}원을 더한 금액을, 2026년 2월 28일까지의 3개월 ${comma(result.averageWageDays)}일로 나눈 값입니다.

금액이 실제로 지급되는지는 두 가지 조건이 결정합니다. 계속근로기간이 365일 이상이어야 하고, 4주 평균 소정근로시간이 주 15시간 이상이어야 합니다. 이 사례는 두 조건을 모두 충족합니다. 재직일수 ${serviceDays}일은 입사일부터 마지막 근무일 다음 날까지 달력 일수로 세므로 윤년이 끼면 하루 이틀 달라질 수 있습니다. 표에는 같은 월급에서 근속 1년부터 10년까지의 계산 결과를 정리했습니다.`,
              table: {
                caption: `월급 ${comma(monthlyPay)}원 기준 근속 연수별 세전 퇴직금 추정`,
                head: ['근속', '재직일수', '세전 퇴직금(원)'],
                rows: yearlyRows.map((row) => [`${row[0]}년`, row[1], row[2]]),
              },
            },
          ],
          faq: [
            {
              q: `월급 ${payManwon}만원으로 ${serviceYears}년 일하면 퇴직금은 얼마인가요?`,
              a: `세전 약 ${amount}원입니다. 3개월 평균임금 산정, 상여금·연차수당 없음, 주 40시간, 마지막 근무일 2026년 2월 28일을 가정한 값입니다. 퇴직일이나 통상임금이 달라지면 금액도 달라집니다.`,
            },
            {
              q: '퇴직금 계산식은 어떻게 되나요?',
              a: `1일 평균임금 × 30일 × (재직일수 ÷ 365)입니다. 이 사례는 ${comma(result.averageDailyWage)}원 × 30 × (${serviceDays} ÷ 365) = ${amount}원입니다. 평균임금은 퇴직 전 3개월 임금에 연간 상여금과 연차수당의 각 4분의 1을 더해 계산합니다.`,
            },
            {
              q: '1년만 일해도 퇴직금을 받을 수 있나요?',
              a: '계속근로기간이 365일 이상이어야 하고, 4주 평균 소정근로시간이 주 15시간 이상이어야 합니다. 둘 중 하나라도 못 미치면 위 계산식의 금액과 관계없이 법정 퇴직금은 0원입니다.',
            },
          ],
        },
      },
    };
  }),
);

export const meta: ToolMeta = {
  slug: 'severance-pay-kr',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-13',
  updated: '2026-11-22',
  edges: ['features', 'usability'],
  competitors: [
    {
      name: 'Blackdog Economy Lab — Korean Severance Pay Calculator',
      url: 'https://investor-blackdog.com/en/tools/severance-pay',
      weakness:
        'Its form asks for one monthly gross wage and explicitly assumes the same pay throughout the final three months, so a visitor with changing wages cannot enter the three actual amounts. Betterbit keeps three separate wage entries while calculating the calendar period, daily average, eligibility, and ordinary-wage floor live. (Strength: it clearly separates annual bonus and eligible unused-leave pay.)',
    },
    {
      name: 'LikeApp — Korean Severance Pay Calculator',
      url: 'https://likeapp.info/en/severance-calculator/',
      weakness:
        'Its opened calculator collects three monthly amounts plus annual bonus and leave allowance, but has no visible field to compare a known daily ordinary wage or to check the 15-hour weekly threshold. Betterbit shows both checks beside the live statutory estimate. (Strength: it offers a convenient monthly-versus-total wage-entry switch.)',
    },
    {
      name: 'WikiTool — Korea Severance Pay Calculator',
      url: 'https://wikitool.co.kr/en/severance-calculator',
      weakness:
        'Its form takes a single total for the final three months and explains the 15-hours-per-week condition without collecting it; no daily ordinary-wage input is exposed. Betterbit accepts three actual wage totals and makes both the eligibility condition and higher ordinary-wage floor calculable. (Strength: its guide states the statutory eligibility rule in English.)',
    },
    {
      name: '몇이지? — 퇴직금 계산기',
      url: 'https://www.myeotiji.kr/retirement',
      weakness:
        'Its opened form accepts one combined three-month wage total, rather than three pay-stub totals, so a visitor cannot keep the actual payments visible while checking the sum. Betterbit preserves three entries and immediately displays their total next to the automatically determined 89–92-day period. (장점: 주 소정근로시간과 1일 통상임금도 입력할 수 있다.)',
    },
    {
      name: 'recordsforest — 퇴직금 계산기',
      url: 'https://www.recordsforest.com/severance',
      weakness:
        'Its normal calculation flow requires a separate “급여자료로 퇴직금 검산하기” action before results appear. Betterbit recalculates as values change and shows the formula, statutory thresholds, and intermediate figures in the same panel. (장점: 평균임금 미산입기간·근속 제외기간을 별도로 확인하는 안내가 자세하다.)',
    },
    {
      name: '내돈내셈 — 퇴직금 계산기',
      url: 'https://naedon.co.kr/',
      weakness:
        'Its opened landing page presents a three-field start—hire date, retirement date, and monthly pay—without exposing a daily ordinary-wage comparison or weekly-hours eligibility check there. Betterbit keeps those two statutory checks available in its initial live calculation. (장점: 직전 3개월 구간과 역일수를 자동 분할한다고 명확히 안내한다.)',
    },
  ],
  related: [
    'salary-calculator-kr',
    'date-calculator',
    'hours-calculator',
    'unemployment-benefit-kr',
    'weekly-holiday-pay-kr',
    'annual-leave-kr',
    'social-insurance-kr',
  ],
  variants,
};
