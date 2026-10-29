import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'ratio-calculator',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-29',
  updated: '2026-10-29',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'Minitool — Ratio Calculator',
      url: 'https://minitool.io/tools/ratio-calculator',
      weakness:
        'Its opened result provides separate two-value reduction and four-term proportion modes, but does not offer a named-ingredient recipe scaler or a target-width-to-height helper for an entered screen ratio. Betterbit keeps those three tasks as live modes in one saved surface. (Strength: it also presents equivalent fraction, percentage, and normalized forms.)',
    },
    {
      name: 'CalculatorSoup — Ratio Calculator',
      url: 'https://www.calculatorsoup.com/calculators/math/ratios.php',
      weakness:
        'Its opened calculator exposes several separate solve, equivalence, and scale forms, including separate 2-, 3-, and 4-term inputs, rather than one focused default flow for a screen ratio, a four-term blank, or a named recipe. Betterbit switches between those three live tasks without a calculate action. (Strength: it supports 3-term ratios and scientific-notation input, which Betterbit does not.)',
    },
    {
      name: 'CalcsTool — Ratio Calculator',
      url: 'https://calcstool.com/ratio-calculator',
      weakness:
        'Its opened search result presents a “Calculate” action for solving, simplifying, and splitting ratios; it does not expose named recipe inputs in that result surface. Betterbit updates its screen-ratio, proportion, and recipe results as fields change. (Strength: it includes a chart of other aspect ratios.)',
    },
    {
      name: 'DataChef — 비례식 계산기',
      url: 'https://tech-lagoon.com/numberchef/ko/ratio.html',
      weakness:
        'Its opened page separates “비례식 풀기” and “확대·축소” and asks the visitor to choose the calculation path, then use its solve flow. It has no named three-ingredient recipe rows or target-dimension helper. Betterbit keeps the missing-term result live and makes each recipe quantity readable beside its name. (장점: Excel·Google 스프레드시트·Python에 붙여 넣을 수 있는 수식을 자세히 제공한다.)',
    },
    {
      name: '일상툴 — 비례식 계산기',
      url: 'https://ilsangtool.com/biryesik/',
      weakness:
        'Its opened page solves a missing proportion and supports proportional distribution, but its visible calculator description does not include screen dimensions reduced to an aspect ratio or named recipe scaling. Betterbit puts a width–height simplifier and a 4인분→6인분-style recipe mode alongside the proportion. (장점: 전체를 여러 비로 나누는 비례배분을 별도로 지원한다.)',
    },
    {
      name: 'avgcalc — 비례식 계산기',
      url: 'https://avgcalc.com/ko/proportion-calculator/',
      weakness:
        'Its opened page is focused on one blank in a/b = c/d, with a written cross-multiplication explanation; it does not offer a ratio simplifier or recipe servings inputs on the visible tool. Betterbit adds those two tasks while retaining immediate missing-value calculation and the displayed equation. (장점: 단계별 풀이를 자세히 보여 준다.)',
    },
  ],
  related: ['percentage-calculator', 'fraction-calculator', 'scientific-calculator'],
};
