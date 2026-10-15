import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'color-converter',
  category: 'developer',
  icon: 'convert',
  added: '2026-10-15',
  updated: '2026-10-15',
  edges: ['features', 'usability'],
  competitors: [
    {
      name: 'Gera Tools — Hex to RGB Converter',
      url: 'https://geratools.com/hex-to-rgb',
      weakness:
        'Its opened page limits the live output to an RGB value and individual R/G/B channels, then places an email-subscription form above the explanatory content. Betterbit keeps HEX, RGB, HSL, CSS Color 4 OKLCH, and WCAG contrast results together in one focused panel. (Strength: it accepts a picker and clearly explains 3- and 6-digit HEX.)',
    },
    {
      name: 'ColoursCube — Hex to RGB',
      url: 'https://www.colourscube.com/convert/hex-to-rgb',
      weakness:
        'The opened search result presents a one-step HEX-to-RGB flow and links out to separate popular conversion pages; it does not present an OKLCH value or an accessibility contrast result in that result. Betterbit exposes both beside the copy-ready CSS values. (Strength: it provides a concise worked base-16 conversion guide.)',
    },
    {
      name: 'ShotMark — Hex ↔ RGB Converter',
      url: 'https://shotmark.dev/tools/hex-rgb-converter',
      weakness:
        'Its opened converter offers paired HEX and RGB inputs plus a live swatch, but its visible results are only HEX and RGB. Betterbit adds HSL, CSS Color 4 OKLCH, and the exact contrast ratio against white and black without leaving the conversion view. (Strength: it accepts RGB text in the paired input.)',
    },
    {
      name: 'potatospark — HEX·RGB 색상 변환기',
      url: 'https://potatospark.com/tools/color-converter/',
      weakness:
        'Its opened Korean search result explicitly says the tool does not support contrast checking, and its stated formats end at HEX, RGB, and HSL. Betterbit shows the WCAG ratios and CSS Color 4 OKLCH in the same live result. (장점: W3C CSS Color 4와 sRGB 기준을 한국어로 분명하게 설명한다.)',
    },
    {
      name: 'CHROMA — HEX → RGB 변환기',
      url: 'https://chromapicker.com/ko/hex-to-rgb/',
      weakness:
        'Its opened Korean result lists HEX, RGB, HSL, HSV, CMYK, LAB, and OKLCH output, but no contrast ratio or WCAG pass result is shown in its visible conversion results. Betterbit makes black and white contrast checks available next to the converted values. (장점: 더 많은 참조 색 공간을 함께 보여 준다.)',
    },
    {
      name: '국민계산기 — 색상 변환기',
      url: 'https://k-calc.org/hex-rgb/',
      weakness:
        'Its opened Korean page places a Coupang Partners promotion directly above the converter and outputs HEX, RGB, and HSL only. Betterbit keeps copy-ready OKLCH and WCAG contrast results in the initial conversion panel. (장점: 한국어로 3자리 HEX와 HSL의 기초를 자세히 설명한다.)',
    },
  ],
  related: ['json-formatter', 'regex-tester', 'url-encoder'],
};
