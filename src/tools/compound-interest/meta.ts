import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'compound-interest',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-11',
  updated: '2026-10-14',
  edges: ['usability', 'accuracy'],
  competitors: [
    {
      name: 'Calculator.net — Interest Calculator',
      url: 'https://www.calculator.net/interest-calculator.html',
      weakness:
        'It asks visitors to modify values and click Calculate before refreshing its results. Betterbit updates the balance, chart, and annual schedule as each input changes. (Strength: it also supports annual contributions, tax and inflation assumptions, and a detailed monthly accumulation schedule.)',
    },
    {
      name: 'CompoundCalc — Compound Interest Calculator',
      url: 'https://compoundcalc.com/compound-interest-calculator.html',
      weakness:
        'It requires Calculate and documents a grouped-deposit approximation whenever a monthly contribution is paired with a non-monthly compounding frequency. Betterbit applies each contribution in its actual month using the equivalent monthly growth factor, while preserving the selected annual growth factor. (Strength: it includes inflation, currency labels, scenario comparison, time-to-double, and embeddable output.)',
    },
    {
      name: 'Letvr Tools — Compound Interest Calculator',
      url: 'https://www.letvr.com/compound-interest-calculator/',
      weakness:
        'It does not retain inputs after a visit, so a returning user must enter a scenario again. Betterbit saves the scenario only in the current browser and offers a reset to the locale-appropriate defaults. (Strength: it also shows time to double, a currency selector, and a split contribution-versus-interest chart.)',
    },
  ],
  related: ['loan-calculator', 'percentage-calculator', 'salary-calculator-kr'],
};
