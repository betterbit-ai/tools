import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'salary-calculator-kr',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['accuracy', 'usability'],
  competitors: [
    {
      name: 'Easy Funny Life — Korea Salary Calculator',
      url: 'https://www.easyfunnylife.com/en/calculator/salary',
      weakness:
        'Its page exposes a separate “Calculate Net Pay” action and describes its income tax as a simplified estimate. Betterbit recalculates while values change and uses the monthly simplified withholding table, including the 2026 child adjustment. (Strength: it clearly labels its annual and monthly net-pay outputs.)',
    },
    {
      name: 'KoreaCalc — Korea Salary Calculator',
      url: 'https://www.koreacalc.com/en/korea-salary-calculator',
      weakness:
        'Its published assumption is one taxpayer with standard basic deductions, so the visible calculator does not let a visitor enter eligible dependents or 8–20-year-old children. Betterbit exposes both inputs and applies the withholding-table child reduction. (Strength: it presents a readable live breakdown and states its estimate limits.)',
    },
    {
      name: 'CalcHub — Korea Salary Take-Home Pay Calculator',
      url: 'https://calc.pe.kr/en/calculators/salary',
      weakness:
        'Its published 2026 basis still lists the former employee rates—National Pension 4.5%, Health Insurance 3.545%, Long-term Care 12.95%—and a KRW 6,170,000 pension ceiling. Betterbit applies the current 4.75%, 3.595%, 13.14%, and KRW 6,590,000 July 2026 basis. (Strength: it explains how non-taxable pay affects its estimate.)',
    },
    {
      name: '잡코리아 — 연봉 계산기',
      url: 'https://www.jobkorea.co.kr/service/user/tool/incomepaycalc',
      weakness:
        'Its form requires a separate “계산하기” submission, and its published pension guidance still names the KRW 6,370,000 maximum rather than the KRW 6,590,000 limit effective from July 2026. Betterbit recalculates without a submit step using the current pension band. (장점: 퇴직금 포함 여부와 월급 입력을 함께 지원한다.)',
    },
    {
      name: '사람인 — 연봉 계산기',
      url: 'https://www.saramin.co.kr/zf_user/tools/salary-calculator?salary=14000',
      weakness:
        'Its calculator sits inside a long recruiting-platform page with account prompts, job-site navigation, analytics iframes, and a chatbot prompt; its child field is labelled broadly as “20세 이하 자녀수.” Betterbit keeps only the calculation surface, saves inputs locally, and makes the 2026 8–20-year-old withholding adjustment explicit. (장점: 퇴직금 포함·별도와 연봉·월급 기준을 모두 고를 수 있다.)',
    },
    {
      name: '연봉체크 — 2026 연봉 실수령액 계산기',
      url: 'https://salary.getcash.kr/calculator?salary=3089',
      weakness:
        'Its landing result is fixed to one dependent, no non-taxable pay, and 12 equal months before directing the visitor to a separate calculation flow; it also surrounds the result with company-salary matching. Betterbit starts with editable non-taxable pay, dependent, and child inputs beside the deduction result. (장점: 공개 국민연금 자료를 이용한 회사별 급여 참고 정보를 함께 제공한다.)',
    },
  ],
  related: ['loan-calculator', 'percentage-calculator'],
};
