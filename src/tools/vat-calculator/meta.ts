import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'vat-calculator',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-13',
  updated: '2026-10-13',
  edges: ['usability', 'features', 'no-ads'],
  competitors: [
    {
      name: 'M2Toolkit — VAT, GST & Sales Tax Calculator',
      url: 'https://www.m2toolkit.com/tools/vat-calculator',
      weakness:
        'Its calculator offers a manually typed rate and a currency selector, but no country-rate preset, so a visitor must already know and type the rate before either add/remove calculation. Betterbit exposes six researched standard-rate presets beside a custom rate, keeps both directions live, and shows the substituted formula. (Strength: it explains the two formulas directly under its result.)',
    },
    {
      name: 'vatcalcs.com — VAT Calculator',
      url: 'https://vatcalcs.com/',
      weakness:
        'Its country list is extensive, but its main page makes visitors first choose a country/rate from a large control and presents country-rate browsing as a separate section. Betterbit keeps six frequently used standard-rate presets and the custom input together in one compact, live calculation surface. (Strength: it lists many more countries and displays a stated verification month for each rate.)',
    },
    {
      name: 'FreeOnlineInvoice.com — VAT Calculator',
      url: 'https://www.freeonlineinvoice.com/vat-calculator/',
      weakness:
        'The rate lookup is an additional search field and the page lets visitors add another rate, adding controls before a simple calculation. Betterbit puts a short verified preset list, custom rate, live breakdown, and the actual calculation line in one view. (Strength: it includes all 50 US state base rates and warns about local sales-tax stacking.)',
    },
    {
      name: '요금창고 — 부가세 계산기',
      url: 'https://yogum.kr/',
      weakness:
        'Its VAT calculator is packaged on a page with discount-rate and electricity-bill calculators, so the initial page presents several unrelated calculations rather than a dedicated tax-rate control. Betterbit gives a focused add/extract flow with six standard-rate presets and a custom percentage. (장점: 할인과 전기요금 계산을 같은 서비스에서 이어서 할 수 있다.)',
    },
    {
      name: 'utilo.kr — 부가세 계산기',
      url: 'https://utilo.kr/tax/',
      weakness:
        "It opens with a cookie choice for analytics and advertising, and its standard calculation is fixed at Korea's 10% rate while its extra tabs focus on Korean simplified-taxpayer estimates. Betterbit is ad-free, has a quick standard-rate preset list plus a custom rate, and clearly keeps the scope to a transaction breakdown. (장점: 간이과세 업종별 부가가치율과 매입·매출 차액을 별도로 다룬다.)",
    },
    {
      name: '도구몽 — 부가세 계산기',
      url: 'https://www.dogumong.com/tools/vat-calculator',
      weakness:
        'It accepts a custom rate and supports reverse calculation, but requires a separate “계산하기” action and describes a 0%–100% rate field without country presets. Betterbit recalculates on each input, provides six verified standard-rate presets, and shows the exact add/extract formula next to the result. (장점: Korean won inputs are explicitly limited to whole-won amounts and it discusses one-won rounding.)',
    },
  ],
  related: ['percentage-calculator', 'discount-calculator', 'scientific-calculator'],
};
