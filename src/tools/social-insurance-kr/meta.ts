import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'social-insurance-kr',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-23',
  updated: '2026-10-23',
  edges: ['accuracy', 'features', 'usability'],
  competitors: [
    {
      name: 'AnytimeKit — 4대보험 계산기',
      url: 'https://anytimekit.com/money/insurance',
      weakness:
        '열어 본 계산기는 월 급여·비과세·사업장 규모·산재 요율·기준 기간을 지원하지만 결과를 보려면 별도 계산 버튼을 눌러야 하고 보험별 가입 제외를 반영하는 입력이나 결과별 적용 이유가 없다. Betterbit은 입력 즉시 계산하고 가입 스위치와 상·하한·제외 이유를 결과에 표시한다. (장점: 상·하반기 국민연금 기준과 월급별 비교표가 충실하다.)',
    },
    {
      name: '셈해봄 — 4대보험 계산기',
      url: 'https://semhaebom.com/salary/insurance/',
      weakness:
        '열어 본 폼은 비과세를 이미 뺀 월 보수만 입력받아 연봉이나 총급여에서 비과세액을 분리해 계산할 수 없고, 2026년 상·하반기 국민연금 기준 선택과 보험별 적용 제외 스위치가 없다. Betterbit은 연봉·월급 전환, 월 비과세, 두 기간, 가입 예외를 한 화면에서 계산한다. (장점: 법령 근거와 건강보험 상한, 사업주 부담 설명이 상세하다.)',
    },
    {
      name: '지팡이 — 4대보험 계산기',
      url: 'https://jipangi.co.kr/worker/calc/insurance/',
      weakness:
        '열어 본 기본 계산기는 월 보수와 근로자 부담만 먼저 보여 주고 사업주 기준은 별도 화면으로 이동해야 하며, 기준일을 사용자가 바꿀 수 없다고 명시한다. Betterbit은 상·하반기를 직접 고르고 근로자·사업주 금액과 사업주 총인건비를 같은 표에서 비교한다. (장점: 끝수 처리, 정산, 두루누리와 가입 조건을 매우 자세히 설명한다.)',
    },
    {
      name: 'Bolta — Social insurance calculator',
      url: 'https://bolta.io/en/tools/insurance-calculator',
      weakness:
        'The opened form requires monthly pay with non-taxable amounts already removed and has no annual-salary conversion, period selector, or per-insurance enrollment controls; its own scope note leaves age and part-time cases outside the result. Betterbit accepts gross annual or monthly pay, removes non-taxable pay visibly, and explains every exclusion and limit. (Strength: it links each effective date to an official source and states that inputs are not sent.)',
    },
    {
      name: 'Toolulah — Korea Social Insurance Calculator',
      url: 'https://toolulah.com/en/tools/social-insurance-calculator/',
      weakness:
        'The opened calculator has strong employee/employer detail but accepts only monthly pay already excluding non-taxable amounts and uses the July 2026 pension band without a Jan–Jun selector or enrollment switches. Betterbit handles annual salary, non-taxable pay, both 2026 pension periods, and confirmed exemptions. (Strength: it supports KRW and 10,000-KRW input units and cites each rate and limit.)',
    },
    {
      name: 'Utilo — 4 Major Insurances Calculator',
      url: 'https://utilo.co.kr/en/tools/four-insurance-calculator/',
      weakness:
        'The opened form exposes only one monthly gross-salary field; workplace size and industry accident rate are described in text but are not visible calculator inputs, so employer totals cannot reflect them there. Betterbit makes both inputs calculable and shows the employer-only lines separately. (Strength: its short English explanation clearly states the 2026 employee rates and local browser processing.)',
    },
  ],
  related: [
    'hourly-wage-kr',
    'salary-calculator-kr',
    'unemployment-benefit-kr',
    'severance-pay-kr',
    'weekly-holiday-pay-kr',
  ],
};
