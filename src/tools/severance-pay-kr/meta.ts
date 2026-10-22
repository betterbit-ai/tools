import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'severance-pay-kr',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-13',
  updated: '2026-10-22',
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
  ],
};
