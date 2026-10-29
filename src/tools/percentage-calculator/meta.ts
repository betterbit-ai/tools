import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'percentage-calculator',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-11',
  updated: '2026-10-16',
  edges: ['usability'],
  competitors: [
    {
      name: 'Calculator.net — Percentage Calculator',
      url: 'https://www.calculator.net/percent-calculator.html',
      weakness:
        'Its percentage and percentage-change forms ask for two values and a separate “Calculate” click before showing an answer. Betterbit keeps its four core percentage questions visible at once and updates each result as numbers change. (Strength: it also has a dedicated percentage-difference calculator, which Betterbit does not include.)',
    },
    {
      name: 'CalculatorSoup — Percentage Calculator',
      url: 'https://www.calculatorsoup.com/calculators/math/percentage.php',
      weakness:
        'Its calculator puts one percentage question behind a selector, so switching tasks hides the other forms. Betterbit keeps all four core questions and their actual-number formulas visible together for quick comparison. (Strength: its selector also offers direct add- and subtract-a-percentage calculations, which Betterbit leaves to its dedicated discount calculator.)',
    },
    {
      name: 'OurCalc — 퍼센트 계산기',
      url: 'https://ourcalc.com/percent-calculator/',
      weakness:
        'Its four calculator sections are followed immediately by an unrelated “Payment options” field, and its third and fourth sections calculate a discounted or raised final price rather than the change between two entered values. Betterbit keeps the surface focused on percentage questions and shows the substituted formula under each answer. (장점: 할인 후 가격과 인상 후 가격을 각각 바로 계산한다.)',
    },
  ],
  related: [
    'discount-calculator',
    'vat-calculator',
    'tip-calculator',
    'compound-interest',
    'ratio-calculator',
    'average-calculator',
  ],
};
