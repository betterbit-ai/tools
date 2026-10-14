import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'exchange-rate',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-14',
  updated: '2026-10-14',
  edges: ['privacy', 'usability', 'features'],
  competitors: [
    {
      name: 'Wise — Currency Converter',
      url: 'https://wise.com/us/currency-converter/',
      weakness:
        'The opened page pivots from its live mid-market conversion into “Send money,” account, card, rate-tracking, and app calls to action; its converter does not expose fields for a quoted percentage charge and a fixed target-currency fee together with the resulting effective rate. Betterbit accepts the quote a visitor was actually offered, calculates entirely in-browser, and shows the final effective rate without sending the quote to a rate API. (Strength: it supplies live mid-market rates, a five-year chart, and rate alerts.)',
    },
    {
      name: 'Fxverter — Currency Converter',
      url: 'https://fxverter.com/',
      weakness:
        'Its opened form depends on a selected public rate API and JavaScript says it needs to fetch rates; the visible “Saved pairs” area also asks for a name and optional email. It offers no visible input for a provider’s fixed target-currency fee or a percentage adjustment in the core conversion. Betterbit needs no network request, keeps a copied quote in local browser storage only, and applies both charges live. (Strength: it can choose among three data sources and covers 141 currencies.)',
    },
    {
      name: 'ThisCalc — Currency Converter',
      url: 'https://thiscalc.com/calculators/currency-converter',
      weakness:
        'The opened tool first shows “Loading exchange rates…” and describes fetching a USD-based ExchangeRate-API table cached for up to one hour; it supports 30+ currencies but has no visible fee, discount, or provider-quote fields. Betterbit starts with a usable manual quote, does not wait for a rate request, and gives the total charge plus effective rate in the same panel. (Strength: it displays both direct and inverse live reference rates.)',
    },
    {
      name: '모두의 계산기 — 환율 계산기',
      url: 'https://calculation.quest/currency?lang=ko',
      weakness:
        'The Korean search result opens with “환율 불러오는 중…” and says it uses the ECB reference rate; it adds conversion tabs but does not expose a bank/card quote, percentage adjustment, fixed fee, and effective rate together. Betterbit works from the condition a visitor was actually offered, updates as each value changes, and retains that local quote only in the browser. (장점: ECB 기준 환율과 원화 결제(DCC) 안내를 함께 제공한다.)',
    },
    {
      name: 'CurrencyBooth — 환율 계산기 및 통화 변환기',
      url: 'https://currencybooth.com/ko',
      weakness:
        'Its Korean landing page says it updates rates daily from Frankfurter and Exchange Rate API for 154 currencies, so the result depends on a remote reference feed; the displayed tool description does not offer a field to model a separately stated fixed fee and resulting effective rate. Betterbit does not request a rate, lets a visitor paste the provider quote, and makes fees and the effective rate explicit. (장점: 154개 통화와 지역별 통화 목록을 제공한다.)',
    },
    {
      name: '칼크모 — 실시간 환율 계산기',
      url: 'https://calcmo.kr/exchange.html',
      weakness:
        'The opened Korean calculator initially displays “환율 불러오는 중…” and later states it uses open.er-api.com with rates normally updated daily; it supports 16 major currencies and shows a reference rate, but has no visible percentage discount/charge or fixed-fee input. Betterbit calculates a bank, card, or exchange-counter quote without a fetch state and shows its fee-adjusted effective rate live. (장점: 현찰·송금·트래블카드와 DCC에 관한 자세한 한국어 안내를 제공한다.)',
    },
  ],
  related: ['percentage-calculator', 'discount-calculator', 'loan-calculator'],
};
