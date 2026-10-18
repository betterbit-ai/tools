import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'salary-calculator-kr',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-11',
  updated: '2026-10-18',
  edges: ['accuracy', 'usability'],
  competitors: [
    {
      name: 'Korea Tax — 2026 Salary Calculator',
      url: 'https://kjuso.com/en/tools/finance/salary-calculator',
      weakness:
        'Its page requires a separate “Calculate Net Pay” action and still lists the former employee insurance rates—National Pension 4.5%, Health Insurance 3.545%, and Long-term Care 12.95%. Betterbit recalculates while values change and applies the current 4.75%, 3.595%, and 13.14% basis. (Strength: it clearly labels its annual and monthly net-pay outputs.)',
    },
    {
      name: 'Korean Calculator — Salary Take-Home Calculator',
      url: 'https://www.kor-calc.com/en/salary-calculator',
      weakness:
        'Its current form requires a “Calculate Take-Home Salary” action before the result and its non-taxable presets do not show an itemized estimate until then. Betterbit updates the full deduction table live while preserving the locally entered conditions. (Strength: it includes meal/transport/childcare non-taxable presets and a reverse salary calculator.)',
    },
    {
      name: 'Kitfolio — Korea Take-Home Pay Calculator',
      url: 'https://kitfolio.app/en/salary-calculator',
      weakness:
        'Its live calculator supports annual or monthly pay, withholding-rate selection, and an itemized result, but does not identify the 2026 workplace health-insurance minimum that affects very low monthly pay. Betterbit applies the KRW 10,080 employee minimum and keeps the current-rate assumptions in the result flow. (Strength: it supports monthly-pay input and a severance-included option.)',
    },
  ],
  related: ['severance-pay-kr', 'unemployment-benefit-kr'],
};
