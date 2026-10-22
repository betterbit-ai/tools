import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'annual-leave-kr',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-22',
  updated: '2026-10-22',
  edges: ['features'],
  competitors: [
    {
      name: '머니코리아 — 연차 계산기',
      url: 'https://moneykoreas.com/calculator/annual-leave',
      weakness:
        'Its opened form makes the visitor choose either hire-date or fiscal-year calculation before viewing the result. Betterbit keeps both current grants and both cumulative totals in the same result, then adds a positive termination shortfall directly to the pay formula. (장점: 사용 연차 입력과 5년 발생 일정표가 있고, 단시간근로자·5인 미만·출근율·연차수당까지 폭넓게 지원한다.)',
    },
    {
      name: 'KOSUNI — 연차 계산기 2026',
      url: 'https://calc.kosuni.com/salary/annual-leave/',
      weakness:
        'Its opened calculator uses only the hire-date basis and explicitly says a fiscal-year company can differ, without calculating that difference or a termination top-up. It also requires a Calculate button. Betterbit calculates both bases and the shortfall live. (장점: 근속연수별 일수와 모두 미사용 시 수당 표가 간결하다.)',
    },
    {
      name: 'calai — 연차·휴가 일수 계산기',
      url: 'https://www.calai.kr/annual-leave',
      weakness:
        'Its opened tool says it calculates only the hire-date standard; the fiscal-year comparison appears as explanatory text and no ordinary-wage inputs or unused-pay result are present in the calculator. Betterbit makes both bases and pay inspectable in one flow. (장점: 출근율과 5인 미만 여부를 입력받고 휴직·휴가의 출근 간주를 설명한다.)',
    },
    {
      name: 'WorkCal — Korea Annual Leave Calculator',
      url: 'https://workcal.kr/en/leave-worktime/annual-leave-calculator/',
      weakness:
        'Its opened English calculator provides hire-date/fiscal-year history but only states assumptions for 5+ employees, 15+ weekly hours, and 80% attendance; those conditions are not visible result-changing inputs, and unused-leave pay is a separate tool. Betterbit calculates each condition, the basis shortfall, and pay together. (Strength: its detailed accrual-history table is extensive.)',
    },
    {
      name: 'DoguMoa — Annual leave calculator',
      url: 'https://dogu.cheheum.com/en/tools/annual-leave',
      weakness:
        'Its English page displays the actual input labels and all result explanations in Korean, and it has no used-leave or ordinary-wage inputs for an unused-pay estimate. Betterbit localizes the full workflow in English and includes the pay calculation. (Strength: it puts hire-date and fiscal-year day counts side by side.)',
    },
    {
      name: 'Mitra Korea — Annual leave calculator',
      url: 'https://mitrakorea.com/en/tools/leave',
      weakness:
        'Its opened calculator shows the current hire-date result and a rough hourly-wage payout, but only warns that fiscal-year companies may differ and does not calculate first-year monthly accrual dates or a termination shortfall. Betterbit exposes those figures directly. (Strength: it is concise and available in English, Korean, Nepali, and Vietnamese.)',
    },
  ],
  related: ['severance-pay-kr', 'salary-calculator-kr', 'weekly-holiday-pay-kr', 'date-calculator'],
};
