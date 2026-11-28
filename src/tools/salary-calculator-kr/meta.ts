import type { ToolMeta, ToolVariant } from '../types';
import { calculateSalary } from './logic';

/**
 * Landing pages for the salaries people actually search ("연봉 3000 실수령액"). Each page's
 * snippet carries the computed 2026 take-home pay, so the number shows up in search results.
 * Assumptions match the calculator's defaults: no non-taxable pay, one dependent (yourself).
 */
const SEARCHED_SALARIES_MANWON = [
  2400, 2500, 2600, 2800, 3000, 3200, 3300, 3500, 3600, 3800, 4000, 4200, 4500, 4800, 5000, 5500, 6000, 6500, 7000,
  7500, 8000, 9000, 10000, 12000, 15000,
];

const comma = (n: number) => Math.round(n).toLocaleString('en-US');
/** 3000 → '3000', 10000 → '1억', 12000 → '1억 2천', 15000 → '1억 5천' (how people type it). */
const koLabel = (man: number) =>
  man < 10000 ? String(man) : `${Math.floor(man / 10000)}억${man % 10000 ? ` ${(man % 10000) / 1000}천` : ''}`;
const manwon = (won: number) => Math.round(won / 10000).toLocaleString('en-US');

const variants: ToolVariant[] = SEARCHED_SALARIES_MANWON.map((man) => {
  const annualSalary = man * 10_000;
  const r = calculateSalary({
    annualSalary,
    monthlyNonTaxable: 0,
    dependents: 1,
    childrenAge8To20: 0,
    withholdingRate: 100,
  })!;
  const label = koLabel(man);
  const millions = man / 100;
  const deductionPct = ((r.totalDeductions / r.monthlyGross) * 100).toFixed(1);
  return {
    slug: `${man}-manwon`,
    preset: { annualSalary },
    content: {
      en: {
        title: `₩${millions}M Salary in Korea: Take-Home Pay 2026 (₩${comma(r.monthlyTakeHome)}/month)`,
        description: `On a ₩${millions} million annual salary in Korea you take home about ₩${comma(r.monthlyTakeHome)} a month in 2026, after national pension, health insurance and income tax.`,
        h1: `₩${millions}M Salary — Monthly Take-Home Pay`,
        intro: `A ₩${comma(annualSalary)} salary is ₩${comma(r.monthlyGross)} a month before deductions. With 2026 rates, about ₩${comma(r.totalDeductions)} goes to the four social insurances and income tax, leaving ₩${comma(r.monthlyTakeHome)} (no non-taxable pay, one dependent). Change the conditions below to recalculate.`,
        sections: [
          {
            heading: `Where the ₩${comma(r.monthlyGross)} goes each month`,
            body: `Four social insurances and income tax are deducted from the monthly gross of ₩${comma(r.monthlyGross)}. At the 2026 employee rates that is national pension 4.75%, health insurance 3.595%, long-term care insurance 13.14% of the health premium, and employment insurance 0.9%; income tax comes from the withholding table for one dependent and local income tax adds 10% of it. Together they take ₩${comma(r.totalDeductions)}, or ${deductionPct}% of the gross, leaving ₩${comma(r.monthlyTakeHome)}.

The national pension is based on a capped base: at least ₩410,000 and at most ₩6,590,000 a month. A ₩${comma(annualSalary)} salary gives a monthly base of ₩${comma(r.monthlyTaxable)}, which is above the minimum and below the maximum, so the standard rate applies in full. Paying part of the salary as non-taxable meal allowance changes the taxable base and lowers every line below — enter it in the calculator to see the difference.`,
            table: {
              caption: `Estimated monthly 2026 payroll deductions on a ₩${comma(annualSalary)} salary (no non-taxable pay, one dependent)`,
              head: ['Line', 'Amount per month (KRW)'],
              rows: [
                ['Gross pay', comma(r.monthlyGross)],
                ['National pension (4.75%)', comma(r.nationalPension)],
                ['Health insurance (3.595%)', comma(r.healthInsurance)],
                ['Long-term care (13.14% of health)', comma(r.longTermCareInsurance)],
                ['Employment insurance (0.9%)', comma(r.employmentInsurance)],
                ['Income tax (withholding)', comma(r.incomeTax)],
                ['Local income tax (10% of income tax)', comma(r.localIncomeTax)],
                ['Total deducted', comma(r.totalDeductions)],
                ['Take-home pay', comma(r.monthlyTakeHome)],
              ],
            },
          },
        ],
        faq: [
          {
            q: `What is the monthly take-home pay on a ₩${millions} million salary in Korea?`,
            a: `About ₩${comma(r.monthlyTakeHome)} a month, or ₩${comma(r.annualTakeHome)} a year, with no non-taxable pay and one dependent. That is ₩${comma(r.totalDeductions)} a month less than the ₩${comma(r.monthlyGross)} gross.`,
          },
          {
            q: `How much is deducted from a ₩${millions} million salary each month?`,
            a: `₩${comma(r.totalDeductions)} a month, ${deductionPct}% of the gross. The largest single line is income tax at ₩${comma(r.incomeTax)}, followed by the national pension at ₩${comma(r.nationalPension)} and health insurance at ₩${comma(r.healthInsurance)}.`,
          },
          {
            q: `Does a meal allowance change the take-home pay on this salary?`,
            a: `Yes. Up to ₩200,000 a month of qualifying meal allowance is non-taxable, so more of the same gross pay reaches you. Enter the non-taxable amount in the calculator to see the new take-home figure instead of subtracting it from this page's estimate.`,
          },
        ],
      },
      ko: {
        title: `연봉 ${label} 실수령액 — 2026년 월 ${manwon(r.monthlyTakeHome)}만원 (4대보험·세금 반영)`,
        description:
          `2026년 기준 연봉 ${label}만원의 월 실수령액은 약 ${comma(r.monthlyTakeHome)}원입니다. 국민연금 ${comma(r.nationalPension)}원, 건강보험 ${comma(r.healthInsurance)}원, 소득세 ${comma(r.incomeTax)}원 등 공제 내역을 확인하세요.`.replace(
            '1억만원',
            '1억원',
          ),
        h1: `연봉 ${label} 실수령액`,
        intro: `연봉 ${comma(annualSalary)}원은 세전 월 ${comma(r.monthlyGross)}원입니다. 2026년 요율로 4대보험과 소득세·지방소득세 ${comma(r.totalDeductions)}원을 빼면 매달 약 ${comma(r.monthlyTakeHome)}원을 받습니다(비과세 0원, 본인 1명 기준). 식대 같은 비과세 금액이나 부양가족을 바꾸면 아래에서 바로 다시 계산됩니다.`,
        sections: [
          {
            heading: `세전 월 ${comma(r.monthlyGross)}원에서 무엇이 빠지나`,
            body: `세전 월급 ${comma(r.monthlyGross)}에서 4대보험과 소득세를 뺍니다. 2026년 근로자 기준으로 국민연금 4.75%, 건강보험 3.595%, 장기요양보험은 건강보험료의 13.14%, 고용보험 0.9%이고, 소득세는 부양가족 1명 기준 간이세액표에서 정해지며 지방소득세가 소득세의 10%로 더해집니다. 합계 ${comma(r.totalDeductions)}로 세전 월급의 ${deductionPct}%이고, 남는 금액이 ${comma(r.monthlyTakeHome)}입니다.

국민연금은 기준소득월액의 상한과 하한이 있어 월 41만원부터 659만원까지만 적용됩니다. 연봉 ${comma(annualSalary)}의 과세 기준 월액은 ${comma(r.monthlyTaxable)}로 하한보다 높고 상한보다 낮아 표준 요율이 그대로 적용됩니다. 식대처럼 비과세로 인정되는 금액을 나눠 받으면 과세 기준이 줄어 아래 공제액도 함께 줄어듭니다. 아래 계산기에 비과세 금액을 넣어 실제 차액을 확인하세요.`,
            table: {
              caption: `연봉 ${comma(annualSalary)}원의 2026년 월 공제 추정치(비과세 0원, 부양가족 1명)`,
              head: ['항목', '월 금액(원)'],
              rows: [
                ['세전 월급', comma(r.monthlyGross)],
                ['국민연금 (4.75%)', comma(r.nationalPension)],
                ['건강보험 (3.595%)', comma(r.healthInsurance)],
                ['장기요양보험 (건강보험료의 13.14%)', comma(r.longTermCareInsurance)],
                ['고용보험 (0.9%)', comma(r.employmentInsurance)],
                ['소득세 (간이세액)', comma(r.incomeTax)],
                ['지방소득세 (소득세의 10%)', comma(r.localIncomeTax)],
                ['공제 합계', comma(r.totalDeductions)],
                ['실수령액', comma(r.monthlyTakeHome)],
              ],
            },
          },
        ],
        faq: [
          {
            q: `연봉 ${label}만원 실수령액은 얼마인가요?`,
            a: `비과세 0원, 부양가족 1명 기준으로 월 약 ${comma(r.monthlyTakeHome)}원, 연 약 ${comma(r.annualTakeHome)}원입니다. 세전 월급 ${comma(r.monthlyGross)}원에서 매달 ${comma(r.totalDeductions)}원이 빠진 금액입니다.`,
          },
          {
            q: `연봉 ${label}만원이면 매달 세금과 보험료로 얼마가 빠지나요?`,
            a: `월 ${comma(r.totalDeductions)}원으로 세전 월급의 ${deductionPct}%입니다. 항목별로는 소득세 ${comma(r.incomeTax)}원이 가장 크고, 국민연금 ${comma(r.nationalPension)}원, 건강보험 ${comma(r.healthInsurance)}원이 뒤를 잇습니다.`,
          },
          {
            q: `식대를 비과세로 받으면 실수령액이 달라지나요?`,
            a: `네. 월 20만원까지 식대를 비과세로 받을 수 있어 같은 연봉에서도 과세 기준이 줄고 실수령액이 늘어납니다. 이 페이지의 숫자는 비과세 0원 기준이므로, 실제 금액은 아래 계산기에 비과세 금액을 넣어 확인하세요.`,
          },
        ],
      },
    },
  };
});

export const meta: ToolMeta = {
  slug: 'salary-calculator-kr',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-11',
  updated: '2026-11-28',
  edges: ['accuracy', 'usability'],
  competitors: [
    {
      name: 'Korea Tax — 2026 Salary Calculator',
      url: 'https://kjuso.com/en/tools/finance/salary-calculator',
      weakness:
        'Its page requires a separate “Calculate Net Pay” action and still lists the former employee insurance rates—National Pension 4.5%, Health Insurance 3.545%, and Long-term Care 12.95%. Betterbit recalculates while values change and applies the current 4.75%, 3.595%, and 13.14% basis. (Strength: it clearly labels its annual and monthly net-pay outputs.)',
    },
    {
      name: 'Korean Calculator — Salary Take-Home Calculator',
      url: 'https://www.kor-calc.com/en/salary-calculator',
      weakness:
        'Its current form requires a “Calculate Take-Home Salary” action before the result and its non-taxable presets do not show an itemized estimate until then. Betterbit updates the full deduction table live while preserving the locally entered conditions. (Strength: it includes meal/transport/childcare non-taxable presets and a reverse salary calculator.)',
    },
    {
      name: 'Kitfolio — Korea Take-Home Pay Calculator',
      url: 'https://kitfolio.app/en/salary-calculator',
      weakness:
        'Its live calculator supports annual or monthly pay, withholding-rate selection, and an itemized result, but does not identify the 2026 workplace health-insurance minimum that affects very low monthly pay. Betterbit applies the KRW 10,080 employee minimum and keeps the current-rate assumptions in the result flow. (Strength: it supports monthly-pay input and a severance-included option.)',
    },
  ],
  related: [
    'hourly-wage-kr',
    'severance-pay-kr',
    'unemployment-benefit-kr',
    'weekly-holiday-pay-kr',
    'annual-leave-kr',
    'social-insurance-kr',
  ],
  variants,
};
