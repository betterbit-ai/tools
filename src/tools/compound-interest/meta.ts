import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'compound-interest',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'Investor.gov — Compound Interest Calculator',
      url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator',
      weakness:
        'Its four-step form asks for an initial investment, monthly contribution, years, rate variance, and compounding frequency, but its calculator section does not show a year-by-year projection or growth chart in the page itself. Betterbit updates an annual chart and expandable annual schedule as each input changes. (Strength: it is an official SEC investor-education resource and supports an interest-rate variance range.)',
    },
    {
      name: 'Calculator.net — Interest Calculator',
      url: 'https://www.calculator.net/interest-calculator.html',
      weakness:
        'Its calculator instructs visitors to modify values and click Calculate before the ending balance, interest, and accumulation schedule appear. Betterbit recalculates the projection as a number changes and makes the monthly deposit timing a two-option control. (Strength: it also models annual contributions, tax rate, and inflation rate.)',
    },
    {
      name: 'DQYDJ — Compound Interest Calculator',
      url: 'https://dqydj.com/compound-interest-calculator/',
      weakness:
        'The calculator is embedded as an iframe, while the surrounding page exposes only explanatory text rather than its inputs, result, or schedule in the document. Betterbit keeps inputs, live result cards, the chart, and the full annual projection together in one compact surface. (Strength: it supports periodic additions, annual/monthly/daily periods, and a growth graph.)',
    },
    {
      name: 'PriceGuess — 복리 계산기·CAGR 변환기',
      url: 'https://priceguess.online/tools/compound',
      weakness:
        'The visible 복리 미래가치 form has only 원금, 연이율, and 기간 inputs, so it cannot model monthly saving or show a year-by-year growth projection. Betterbit adds 월 적립금, month-start versus month-end timing, and an annual chart. (장점: 누적 수익률을 CAGR로 바꾸고 72의 법칙을 함께 설명한다.)',
    },
    {
      name: 'DataChef — 복리 계산기',
      url: 'https://tech-lagoon.com/numberchef/ko/compound-interest.html',
      weakness:
        'Its visible growth-calculation inputs are 원금, 연이율, 기간, and 복리 주기, followed by a separate 계산 button; recurring monthly deposits are not among those inputs. Betterbit is designed around an initial amount plus 월 적립금, recalculates live, and shows deposits separately from interest. (장점: 이율의 복리 주기 환산과 PNG·SVG 그래프 저장을 제공한다.)',
    },
    {
      name: '모두의 계산기 — 복리 계산기',
      url: 'https://modoocalc.com/saving/compound',
      weakness:
        'It asks for a per-period return and a number of periods, so a visitor using an annual rate must first convert the rate for a monthly plan. Betterbit accepts one annual rate, lets the visitor select annual/quarterly/monthly/daily compounding, and shows the resulting effective annual rate. (장점: 회차마다 추가 납입금을 직접 설정하고 세전 결과임을 명확히 알린다.)',
    },
  ],
  related: ['loan-calculator', 'percentage-calculator', 'salary-calculator-kr'],
};
