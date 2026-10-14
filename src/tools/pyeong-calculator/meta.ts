import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'pyeong-calculator',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-14',
  updated: '2026-10-14',
  edges: ['no-ads', 'usability'],
  competitors: [
    {
      name: 'gemini2k Tools — Pyeong ↔ ㎡ Calculator',
      url: 'https://gemini2k.co.kr/en/pyeong.html',
      weakness:
        'It has two direct-conversion inputs and useful common-size buttons, but its only treatment of exclusive versus supply area is a sentence below the calculator; visitors cannot enter the two figures from a listing and see their pyeong values together. Betterbit makes both figures editable in a side-by-side comparison, including the resulting exclusive-area ratio. (Strength: it also shows hectare conversion and both exact and commonly rounded pyeong values.)',
    },
    {
      name: 'pyeong.fyi — Square Meters to Pyeong Converter',
      url: 'https://pyeong.fyi/en/',
      weakness:
        'Its supply-area card asks for private area and an efficiency ratio, then asks visitors to choose apartment, small apartment, or officetel; that is useful for an estimate but is not a direct comparison of the two measurements printed on a listing. Betterbit keeps separate editable exclusive and supply fields so it never infers one area from a building-type assumption. (Strength: it also calculates price per pyeong and supports sharing a size candidate.)',
    },
    {
      name: 'Calcul Korea — Pyeong Converter',
      url: 'https://www.calculkorea.com/en/pyeong-converter',
      weakness:
        'Its converter can add rectangular rooms, but it treats the primary conversion as one pyeong field and one square-metre field; it does not provide a place to compare an apartment listing’s exclusive and supply measurements together. Betterbit gives direct, live conversion plus a separate two-field comparison with the common-area difference. (Strength: it can total multiple named room rectangles.)',
    },
    {
      name: 'EVERYCALC — 평수 변환 계산기',
      url: 'https://www.everycalc.pe.kr/pyeong',
      weakness:
        'Its page explains that exclusive and supply area must be compared separately, but the interactive calculation is initially hidden behind a “로딩 중...” state and the page includes banner advertising. Betterbit is ad-free and makes the exclusive/supply comparison an immediately visible, editable part of the calculator. (장점: 전용·공급·계약면적의 차이를 긴 안내문과 환산표로 자세히 설명한다.)',
    },
    {
      name: 'alwayscorp — 평수 계산기',
      url: 'https://alwayscorp.co.kr/tools/pyeong',
      weakness:
        'It offers live one-way conversion, presets, and a share action, but its calculator does not let a visitor type the exclusive and supply figures from the same listing side by side; the distinction appears in explanatory text instead. Betterbit pairs its live conversion with two editable listing fields, a pyeong result for each, and the exclusive-area ratio. (장점: 10평부터 100평까지의 긴 환산표와 결과 공유 기능을 제공한다.)',
    },
    {
      name: 'K Juso — Pyeong ↔ m² Converter',
      url: 'https://kjuso.com/en/tools/area-converter',
      weakness:
        'Its “Popular Sizes” places labels such as “24 평(59㎡)” and “32 평(84㎡)” next to a direct converter, even though 59㎡ and 84㎡ convert directly to about 17.85평 and 25.41평; readers must find the later explanation to learn those labels use another area basis. Betterbit names the basis next to the result and exposes both entered figures together. (Strength: its guide clearly explains exclusive, supply, and contract area below the calculator.)',
    },
  ],
  related: ['length-converter', 'scientific-calculator', 'loan-calculator', 'area-converter'],
};
