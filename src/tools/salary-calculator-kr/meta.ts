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
  return {
    slug: `${man}-manwon`,
    preset: { annualSalary },
    content: {
      en: {
        title: `₩${millions}M Salary in Korea: Take-Home Pay 2026 (₩${comma(r.monthlyTakeHome)}/month)`,
        description: `On a ₩${millions} million annual salary in Korea you take home about ₩${comma(r.monthlyTakeHome)} a month in 2026, after national pension, health insurance and income tax.`,
        h1: `₩${millions}M Salary — Monthly Take-Home Pay`,
        intro: `A ₩${comma(annualSalary)} salary is ₩${comma(r.monthlyGross)} a month before deductions. With 2026 rates, about ₩${comma(r.totalDeductions)} goes to the four social insurances and income tax, leaving ₩${comma(r.monthlyTakeHome)} (no non-taxable pay, one dependent). Change the conditions below to recalculate.`,
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
      },
    },
  };
});

export const meta: ToolMeta = {
  slug: 'salary-calculator-kr',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-11',
  updated: '2026-10-22',
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
  related: ['severance-pay-kr', 'unemployment-benefit-kr', 'weekly-holiday-pay-kr'],
  variants,
};
