import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  intro: 'Change your salary details to see each 2026 Korean payroll deduction instantly.',
  autosaved: 'Saved in this browser',
  annualSalaryLabel: 'Annual salary (KRW, before tax)',
  annualSalaryHint: 'Assumes the stated salary is paid evenly over 12 months and excludes severance pay.',
  nonTaxableLabel: 'Monthly non-taxable pay (KRW)',
  nonTaxableHint:
    'Enter the total shown as non-taxable on your payslip; a qualifying meal allowance can be up to KRW 200,000 a month.',
  dependentsLabel: 'Eligible dependents (including yourself)',
  dependentsHint:
    'Count only people eligible for the basic deduction. A single employee with no eligible dependents enters 1.',
  childrenLabel: 'Children aged 8–20 (among dependents)',
  childrenHint:
    'Used for the 2026 monthly child withholding reduction; do not count children outside the dependent total.',
  resultsHeading: 'Estimated monthly take-home pay',
  monthlyTakeHome: 'Monthly take-home',
  annualTakeHome: 'Estimated annual take-home',
  monthlyGross: 'Monthly gross pay',
  totalDeductions: 'Total monthly deductions',
  withholdingNotice:
    'Uses the 100% monthly withholding table. Bonuses, year-end settlement, and your company’s rounding can change the actual payslip.',
  copyResult: 'Copy result',
  copiedResult: 'Copied',
  invalidInput:
    'Enter a positive annual salary, a non-taxable amount no greater than one month’s pay, and whole-number dependent counts.',
  deductionHeading: 'Monthly deduction breakdown',
  item: 'Item',
  monthlyAmount: 'Amount',
  nationalPension: 'National Pension',
  healthInsurance: 'Health Insurance',
  longTermCareInsurance: 'Long-term Care Insurance',
  employmentInsurance: 'Employment Insurance',
  incomeTax: 'Income tax',
  localIncomeTax: 'Local income tax',
  won: ' KRW',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Korea Salary Calculator — 2026 Take-home Pay',
    description:
      'Estimate Korean monthly take-home pay from annual salary with 2026 insurance rates, the withholding table, dependents, and non-taxable pay—entirely in your browser.',
    h1: 'Korea Salary Calculator',
    tagline:
      'See your estimated 2026 Korean take-home pay and every payroll deduction, including non-taxable pay and the current withholding table.',
    name: 'Korea Salary Calculator',
    keywords: [
      'Korea salary calculator',
      'Korean take-home pay calculator',
      'Korea net salary calculator',
      'Korean payroll calculator',
      'Korea income tax calculator',
      '4 major insurance Korea',
    ],
    howTo: [
      'Enter the annual salary in Korean won before employee deductions.',
      'Enter the monthly total recorded as non-taxable pay on your payslip.',
      'Enter eligible dependents including yourself, then eligible children aged 8 to 20.',
      'Review the live monthly take-home result and the six deduction amounts.',
      'Copy the monthly and annual estimate if you need to compare a job offer.',
    ],
    sections: [
      {
        heading: '2026 employee-side social-insurance rates used here',
        body: 'This calculator is for a standard workplace-insured employee in South Korea. From July 2026, the employee share of National Pension is 4.75%, applied to the standard monthly income band from KRW 410,000 to KRW 6,590,000. The employee share of Health Insurance is 3.595% (half of the 7.19% workplace rate), Long-term Care Insurance is 13.14% of the Health Insurance premium, and Employment Insurance for unemployment benefits is 0.9%. Industrial Accident Compensation Insurance is generally employer-paid, so it is not deducted from this take-home estimate. The National Pension Service, National Health Insurance Service, and Ministry of Employment and Labor publish these bases and rates.',
      },
      {
        heading: 'How monthly income tax is estimated',
        body: 'Employers withhold income tax from monthly salary using the National Tax Service’s simplified withholding table (근로소득 간이세액표), indexed by monthly pay after non-taxable items and eligible dependent count. This calculator uses the 100% table amount, then adds local income tax at 10% of income tax after the statutory rounding. For pay withheld from 1 March 2026, the table’s separate monthly reduction for eligible children aged 8 to 20 is KRW 20,830 for one child, KRW 45,830 for two children, and KRW 33,330 for each child after the second.',
      },
      {
        heading: 'Why your payslip can be different',
        body: 'The estimate assumes the annual salary is paid in 12 equal months, that the non-taxable total applies to the pay entered, and that you use the default 100% withholding rate. A bonus month, a different 80% or 120% withholding election, several jobs, a mid-year join or leave date, pension eligibility, and company-level rounding can produce another monthly figure. Year-end settlement also applies personal deductions and credits for items such as medical spending, education, card spending, and pension savings; it is not included here. Check your payslip and payroll team for a payment decision.',
      },
    ],
    faq: [
      {
        q: 'How much is taken from a Korean employee’s salary in 2026?',
        a: 'For a standard workplace-insured employee from July 2026, the employee shares are National Pension 4.75%, Health Insurance 3.595%, Long-term Care Insurance equal to 13.14% of the health premium, and Employment Insurance 0.9%, plus income tax and local income tax. Income tax varies with monthly taxable pay, eligible dependents, and eligible children, so there is no single take-home percentage.',
      },
      {
        q: 'Is Korean National Pension capped in 2026?',
        a: 'Yes. From 1 July 2026 through 30 June 2027, the National Pension standard monthly income band is KRW 410,000 to KRW 6,590,000. This calculator caps the employee’s 4.75% pension contribution at the KRW 6,590,000 ceiling, while the other displayed deductions use their own rules.',
      },
      {
        q: 'Should I include the KRW 200,000 meal allowance as non-taxable pay?',
        a: 'Include a meal allowance only when it is treated as non-taxable on your payslip. A qualifying meal allowance can be non-taxable up to KRW 200,000 per month, but eligibility and other non-taxable items depend on the payment conditions, so confirm the total with your employer.',
      },
      {
        q: 'Why does the calculator ask for dependents and children?',
        a: 'The Korean simplified withholding table changes with the number of eligible dependents, including the employee. For withholding from 1 March 2026, eligible children aged 8 to 20 receive an additional monthly reduction of KRW 20,830 for one child or KRW 45,830 for two children, so both counts can change the estimated income tax.',
      },
      {
        q: 'Does this Korea salary calculator calculate year-end tax settlement?',
        a: 'No. This calculator estimates the monthly payroll withholding from an even 12-month salary, current social-insurance rates, non-taxable pay, and the simplified withholding table. The final year-end settlement can change after deductions and tax credits for actual spending and savings are applied.',
      },
      {
        q: 'Does this calculator send my salary information to a server?',
        a: 'No. The calculation runs in your browser, and the values are saved only in that browser’s local storage for convenience. Salary and family inputs are not sent to a server.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '연봉 실수령액 계산기 — 2026년 4대보험·비과세 반영',
    description:
      '2026년 4대보험 요율과 근로소득 간이세액표를 적용해 연봉 실수령액을 계산합니다. 비과세·부양가족·자녀를 반영하고 입력값은 브라우저에서만 처리합니다.',
    h1: '연봉 실수령액 계산기',
    tagline: '2026년 4대보험과 근로소득 간이세액표를 바탕으로 월 실수령액과 공제 항목을 즉시 확인합니다.',
    name: '연봉 실수령액 계산기',
    keywords: [
      '연봉 실수령액 계산기',
      '연봉 계산기',
      '월급 실수령액',
      '세후 연봉 계산기',
      '4대보험 계산기',
      '2026 연봉 실수령액',
      '월급 세금 계산기',
    ],
    howTo: [
      '퇴직금을 뺀 세전 연봉을 원 단위로 입력하세요.',
      '급여명세서에 비과세로 잡히는 월 합계액을 입력하세요.',
      '본인을 포함한 공제대상 부양가족 수와 그중 8세 이상 20세 이하 자녀 수를 입력하세요.',
      '월 예상 실수령액과 국민연금·건강보험·세금 공제액을 바로 확인하세요.',
      '이직 제안이나 연봉 협상 비교에 쓸 수 있도록 결과를 복사하세요.',
    ],
    sections: [
      {
        heading: '2026년 근로자 부담 4대보험 요율',
        body: '이 계산기는 일반적인 직장가입자와 2026년 7월 이후 기준을 가정합니다. 국민연금 근로자 부담은 4.75%이고 기준소득월액 41만 원~659만 원 범위에 적용합니다. 건강보험 근로자 부담은 직장가입자 보험료율 7.19%의 절반인 3.595%입니다. 장기요양보험료는 건강보험료의 13.14%, 고용보험 실업급여 보험료는 0.9%를 적용합니다. 산재보험료는 원칙적으로 사업주가 전액 부담하므로 실수령액 공제에 넣지 않습니다. 국민연금공단·국민건강보험공단·고용노동부가 각각 기준과 요율을 안내합니다.',
      },
      {
        heading: '소득세와 지방소득세를 계산하는 방식',
        body: '회사는 비과세소득 등을 뺀 월급여액과 공제대상가족 수에 따라 국세청 근로소득 간이세액표의 소득세를 원천징수합니다. 이 계산기는 기본 100% 원천징수액을 사용하고, 소득세의 10%를 원 단위 절사한 개인지방소득세를 더합니다. 2026년 3월 1일 이후 원천징수분은 8세 이상 20세 이하 자녀가 1명이면 월 20,830원, 2명이면 45,830원, 3명째부터 1명당 33,330원을 간이세액표 금액에서 추가로 뺍니다.',
      },
      {
        heading: '실제 급여명세서와 차이 나는 경우',
        body: '연봉을 12개월에 같은 금액으로 나눠 받는다고 가정한 추정치입니다. 상여금 지급월, 80%·120% 원천징수 선택, 입·퇴사월, 복수 근무지, 국민연금 가입 여부, 회사별 원 단위 처리에 따라 월 공제액은 달라질 수 있습니다. 의료비·교육비·신용카드·연금저축 등 실제 지출과 공제를 반영하는 연말정산 결정세액도 계산하지 않습니다. 계약이나 중요한 의사결정 전에는 급여명세서와 회사 급여 담당자의 안내를 확인하세요.',
      },
    ],
    faq: [
      {
        q: '2026년 직장인 4대보험 근로자 부담률은 얼마인가요?',
        a: '2026년 7월 이후 일반 직장가입자의 근로자 부담은 국민연금 4.75%, 건강보험 3.595%, 건강보험료의 13.14%인 장기요양보험료, 고용보험 실업급여 0.9%입니다. 소득세와 개인지방소득세는 월 과세급여·부양가족·자녀에 따라 달라지므로 고정 비율이 아닙니다.',
      },
      {
        q: '2026년 국민연금 상한액은 얼마인가요?',
        a: '2026년 7월 1일부터 2027년 6월 30일까지 국민연금 기준소득월액은 하한 41만 원, 상한 659만 원입니다. 이 계산기는 과세 월급이 659만 원을 넘어도 국민연금 근로자 부담 4.75%는 659만 원까지만 적용합니다.',
      },
      {
        q: '식대 20만 원은 비과세로 넣어도 되나요?',
        a: '월 식대가 지급 요건을 충족해 급여명세서에서 비과세로 처리될 때에는 월 20만 원까지 비과세 금액에 넣을 수 있습니다. 식대 외 차량유지비·보육수당 등은 각각 요건과 한도가 있으므로, 이 계산기에는 회사가 비과세로 처리한 월 합계액만 입력해야 합니다.',
      },
      {
        q: '부양가족 수에 본인도 포함하나요?',
        a: '포함합니다. 공제대상 부양가족 수는 본인과 요건을 충족한 배우자·자녀·부모 등을 합한 수이며, 혼자 일하고 공제대상 가족이 없으면 1명을 입력합니다. 8세 이상 20세 이하 자녀 수는 이 부양가족 수 안에 포함된 자녀만 따로 입력합니다.',
      },
      {
        q: '연봉 실수령액 계산 결과와 실제 월급이 다른 이유는 무엇인가요?',
        a: '실제 월급은 상여금, 비과세 항목, 원천징수 80%·120% 선택, 입·퇴사 시점, 보험 가입 조건, 회사별 반올림, 연말정산에 따라 달라집니다. 이 계산기는 연봉을 12개월 균등 지급하고 기본 100% 간이세액표를 적용한 월 예상 실수령액입니다.',
      },
      {
        q: '입력한 연봉과 가족 정보가 서버에 저장되나요?',
        a: '아니요. 연봉·비과세액·가족 수 계산은 모두 브라우저에서 실행되고, 다시 열 때 편하도록 이 브라우저의 로컬 저장소에만 저장됩니다. 입력값은 서버로 전송되지 않습니다.',
      },
    ],
    ui: {
      intro: '급여 조건을 바꾸면 2026년 공제액과 월 실수령액이 바로 계산됩니다.',
      autosaved: '입력값은 이 브라우저에 저장됩니다',
      annualSalaryLabel: '세전 연봉(원)',
      annualSalaryHint: '퇴직금은 별도이고, 연봉을 12개월에 같은 금액으로 받는다고 가정합니다.',
      nonTaxableLabel: '월 비과세 급여(원)',
      nonTaxableHint: '급여명세서의 비과세 월 합계액을 입력하세요. 요건을 충족한 식대는 월 20만 원까지 비과세입니다.',
      dependentsLabel: '공제대상 부양가족 수(본인 포함)',
      dependentsHint: '본인만 해당하면 1명을 입력하세요. 기본공제 요건을 충족한 가족만 셉니다.',
      childrenLabel: '8세 이상 20세 이하 자녀 수(부양가족 중)',
      childrenHint: '2026년 자녀 원천징수 공제에 사용합니다. 위 부양가족 수를 넘길 수 없습니다.',
      resultsHeading: '월 예상 실수령액',
      monthlyTakeHome: '월 실수령액',
      annualTakeHome: '예상 연 실수령액',
      monthlyGross: '월 세전 급여',
      totalDeductions: '월 공제액 합계',
      withholdingNotice:
        '기본 100% 간이세액표 기준입니다. 상여금·연말정산·회사별 원 단위 처리에 따라 실제 급여명세서와 다를 수 있습니다.',
      copyResult: '결과 복사',
      copiedResult: '복사됨',
      invalidInput: '세전 연봉은 0보다 크게, 월 비과세액은 한 달 급여 이하로, 부양가족 수는 정수로 입력하세요.',
      deductionHeading: '월 공제 내역',
      item: '항목',
      monthlyAmount: '금액',
      nationalPension: '국민연금',
      healthInsurance: '건강보험',
      longTermCareInsurance: '장기요양보험',
      employmentInsurance: '고용보험',
      incomeTax: '소득세',
      localIncomeTax: '지방소득세',
      won: '원',
    },
  },
};
