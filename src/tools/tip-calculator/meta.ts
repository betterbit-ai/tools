import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'tip-calculator',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-13',
  updated: '2026-10-13',
  edges: ['features', 'usability'],
  competitors: [
    {
      name: 'Pearson — Tip Calculator',
      url: 'https://www.pearson.com/channels/calculators/tip-calculator',
      weakness:
        'The result remains empty until the separate “Calculate” button is pressed, and the page does not offer a country preset for a customary starting rate. Betterbit recalculates on every input and gives country-specific defaults. (Strength: it supports both a percent tip and a flat-amount tip, plus optional tax.)',
    },
    {
      name: 'TheTipCalc — Free Tip Calculator',
      url: 'https://www.thetipcalc.com/',
      weakness:
        'The page places affiliate travel recommendations for Viator, Booking.com, and an eSIM below the calculator, with a commission disclosure. Betterbit has no affiliate promotions. (Strength: it offers country guidance for more than 40 countries.)',
    },
    {
      name: 'QuickCalc.ai — Tip Calculator',
      url: 'https://www.quickcalc.ai/tip-calculator',
      weakness:
        'An “Advertisement” block appears directly after its result area and again between its explanatory sections. Betterbit shows exact split allocations when a total cannot divide evenly. (Strength: it has a clear before- or after-tax switch and a round-up option.)',
    },
    {
      name: 'Calqu — Tip Calculator',
      url: 'https://calqu.kr/en/etc/tip/',
      weakness:
        'Its visible calculator has only bill amount, tip rate, and people inputs; there is no country selector or separate service-charge field in the calculation controls. Betterbit pairs country defaults with a separate service-charge line. (Strength: it explains the basic formula and gives a South Korea etiquette note.)',
    },
    {
      name: 'CalculKorea — Tip Calculator',
      url: 'https://www.calculkorea.com/en/tip',
      weakness:
        'The calculator labels the bill only in dollars and exposes fixed tip buttons, a custom rate, people, and rounding, but no country choice or service-charge amount. Betterbit switches USD, CAD, GBP, KRW, and JPY formatting with its country preset. (Strength: it offers four per-person rounding modes.)',
    },
    {
      name: 'ConvertAtlas — South Korea Tip Calculator',
      url: 'https://convertatlas.net/t/everyday-life/south-korea-tip-calculator',
      weakness:
        'It is a single South Korea page whose results are displayed with a $ symbol, so a traveller must find a different page for another country or currency. Betterbit changes both the customary starting rate and currency format in one calculator. (Strength: it includes a separate service-charge input and a rounded-per-person result.)',
    },
  ],
  related: ['percentage-calculator', 'scientific-calculator', 'compound-interest', 'discount-calculator'],
};
