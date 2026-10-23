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

    return {
      slug: `${payManwon}-manwon-${serviceYears}-${serviceYears === 1 ? 'year' : 'years'}`,
      preset: { ...preset },
      content: {
        en: {
          title: `₩${payManwon / 100}M Monthly Pay, ${serviceYears} Year${serviceYears === 1 ? '' : 's'} — ₩${amount} Severance Estimate`,
          description: `With ₩${comma(monthlyPay)} monthly pay and ${serviceYears} year${serviceYears === 1 ? '' : 's'} of service, the statutory Korean severance estimate is ₩${amount} before tax under the stated assumptions.`,
          h1: `₩${payManwon / 100}M Pay · ${serviceYears}-Year Severance`,
          intro: `The calculated before-tax estimate is ₩${amount}: three final monthly wage totals of ₩${comma(monthlyPay)}, a 90-day average-wage period, and ${serviceDays} continuous-service days through February 28, 2026. It assumes 40 weekly hours, no eligible bonus or leave pay, and no higher ordinary-wage floor; change any field below for your actual records.`,
        },
        ko: {
          title: `월급 ${payManwon}만원 퇴직금 — 근속 ${serviceYears}년 세전 ${amount}원 (2026 계산법)`,
          description: `월급 ${payManwon}만원, 근속 ${serviceYears}년이면 퇴직금은 세전 약 ${amount}원입니다. 퇴직 전 3개월 임금과 ${serviceDays}일 재직기간을 법정 산식으로 계산했습니다.`,
          h1: `월급 ${payManwon}만원·근속 ${serviceYears}년 퇴직금`,
          intro: `세전 예상 퇴직금은 ${amount}원입니다. 2026년 2월 28일 마지막 근무, 퇴직 전 3개월 임금이 매달 ${comma(monthlyPay)}원, 평균임금 산정기간 90일, 계속근로 ${serviceDays}일로 계산했습니다. 주 40시간, 상여금·연차수당·더 높은 통상임금은 없는 조건이며 실제 날짜와 급여명세서 금액으로 아래에서 다시 계산할 수 있습니다.`,
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
  updated: '2026-10-23',
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
