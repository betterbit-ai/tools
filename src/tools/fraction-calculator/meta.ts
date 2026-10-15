import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'fraction-calculator',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-13',
  updated: '2026-10-13',
  edges: ['privacy', 'usability', 'accuracy'],
  competitors: [
    {
      name: 'Pearson — Fraction Calculator',
      url: 'https://www.pearson.com/channels/calculators/fraction-calculator',
      weakness:
        'It supports fractions, mixed numbers, and decimals, but its page presents a Calculate button after the input fields rather than updating the answer during entry. Betterbit recalculates immediately and keeps the last inputs in local browser storage. (Strength: it includes additional dedicated modes for comparing fractions and finding LCD/LCM.)',
    },
    {
      name: 'Calculator.net — Fraction Calculator',
      url: 'https://www.calculator.net/fraction-calculator.html',
      weakness:
        'Its page separates mixed-number arithmetic, simplification, decimal conversion, and big-number fractions into several independent calculator forms, so changing task means finding and filling another form. Betterbit accepts fractions, mixed numbers, integers, and finite decimals in the same two fields, with one live result and working area. (Strength: it provides dedicated forms for several related conversion tasks.)',
    },
    {
      name: 'FractionCalculator.com',
      url: 'https://fractioncalculator.com/',
      weakness:
        'Its instructions ask users to fill in numerator/denominator fields and submit before a result appears. Betterbit accepts a typed fraction such as 1 2/3 or 0.125 and updates the simplified result and working without a submit step. (Strength: it provides operation-specific written example pages.)',
    },
    {
      name: 'Toolzipper — 분수 계산기',
      url: 'https://toolzipper.com/calculator/fraction-calculator/',
      weakness:
        'The page tells users to enter separate numerator and denominator fields and press “계산하기”; its inputs are not stored on the page. Betterbit accepts one naturally typed value per side, updates without a calculation click, and saves inputs only in the current browser. (장점: 소수 근사값 자릿수를 선택할 수 있다.)',
    },
    {
      name: '툴앤조이 — 분수 계산기',
      url: 'https://toolnjoy.com/fraction',
      weakness:
        'The opened page places third-party ad blocks immediately after the result and identifies a Coupang Partners commission relationship. Betterbit contains no advertising, tracking, or affiliate block. (장점: 괄호가 있는 식과 최대 여섯 수의 연속 계산, 순환소수 입력까지 지원한다.)',
    },
    {
      name: 'Softonic Tools — 분수 계산기',
      url: 'https://tools.softonic.kr/fraction-calculator',
      weakness:
        'Its FAQ states that entered numbers are sent to its server to calculate the result, even though they are not stored. Betterbit performs exact arithmetic entirely in the browser and never sends input to a server. (장점: 4단계 입력 흐름으로 처음 쓰는 사람에게 순서를 안내한다.)',
    },
  ],
  related: ['percentage-calculator', 'scientific-calculator', 'discount-calculator'],
};
