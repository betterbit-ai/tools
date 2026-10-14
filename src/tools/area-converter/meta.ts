import type { ToolMeta, ToolVariant } from '../types';

const variants: ToolVariant[] = [
  {
    slug: 'sq-ft-to-m2',
    preset: { from: 'squareFoot', to: 'squareMeter', value: 1000 },
    content: {
      en: {
        title: 'Sq Ft to m² Converter — Instant, with All Area Units',
        description:
          'Convert square feet to square metres instantly as you type. See pyeong, acres, hectares and square yards at the same time — no Convert button.',
        h1: 'Sq Ft to m² Converter',
        intro:
          'Square feet to square metres, live as you type. 1 ft² = 0.09290304 m² exactly; the same area also appears in pyeong, acres, hectares and square yards below.',
      },
      ko: {
        title: '평방피트 ㎡ 변환 — 평·에이커까지 함께 확인',
        description:
          '평방피트(ft²)를 ㎡로 입력 즉시 변환합니다. 평·에이커·헥타르·평방야드도 한 화면에서 함께 확인하며 변환 버튼이 필요 없습니다.',
        h1: '평방피트 ㎡ 변환',
        intro:
          '평방피트에서 제곱미터로 실시간 변환합니다. 1ft² = 정확히 0.09290304㎡이며, 같은 넓이의 평·에이커·헥타르 값도 아래에서 바로 확인할 수 있습니다.',
      },
    },
  },
  {
    slug: 'm2-to-pyeong',
    preset: { from: 'squareMeter', to: 'pyeong', value: 84 },
    content: {
      en: {
        title: 'm² to Pyeong Converter — Instant Korean Area Conversion',
        description:
          'Convert square metres to Korean pyeong instantly. Uses the exact 400/121㎡ factor and also shows square feet, acres and hectares together.',
        h1: 'm² to Pyeong Converter',
        intro:
          'Square metres to pyeong, live as you type. 84 m² is 25.41평 using the exact 400/121㎡ factor; check the original area basis before comparing property listings.',
      },
      ko: {
        title: '㎡ 평 변환 — 84㎡는 몇 평? 입력 즉시 계산',
        description:
          '제곱미터(㎡)를 평으로 입력 즉시 변환합니다. 정확한 400/121㎡ 기준을 쓰며 평방피트·에이커·헥타르 결과도 함께 확인할 수 있습니다.',
        h1: '㎡ 평 변환',
        intro:
          '제곱미터를 평으로 실시간 변환합니다. 84㎡는 정확한 400/121㎡ 기준으로 25.41평입니다. 매물은 전용·공급 등 같은 면적 기준끼리 비교하세요.',
      },
    },
  },
];

export const meta: ToolMeta = {
  slug: 'area-converter',
  category: 'converter',
  icon: 'convert',
  added: '2026-10-14',
  updated: '2026-10-14',
  edges: ['no-ads', 'usability'],
  competitors: [
    {
      name: 'SqFtMath — Square feet to square metres',
      url: 'https://sqftmath.com/square-feet-to-square-meters/',
      weakness:
        'Its page is dedicated to the single square-feet-to-square-metres pair; the visible converter and its table do not offer Korean pyeong, acres, hectares, or a way to choose another pair in the same interface. Betterbit keeps six commonly paired property and land units together, and shows the remaining units beside the selected result. (Strength: it provides unusually detailed UK housing-size context and citations.)',
    },
    {
      name: 'CalculatorSoup — Square Feet to Square Meters',
      url: 'https://www.calculatorsoup.com/calculators/conversions/square-feet-to-square-meters.php',
      weakness:
        'The calculator is fixed to ft² → m², and the reverse direction is a separate linked “Square Meters to Square Feet Converter”; the page has no pyeong, acre, hectare, or square-yard result alongside the main answer. Betterbit reverses the same conversion with one button and gives all six units together. (Strength: it shows the cancellation steps behind the ft²-to-m² formula.)',
    },
    {
      name: 'ThousandTools — Square Foot to Square Meter Converter',
      url: 'https://www.thousandtools.com/unit-converters/area/square-foot-to-square-meter/',
      weakness:
        'Its search result describes a square-foot-to-square-metre page with a list of metric and imperial area units, but Korean pyeong is absent and the result surface centres one destination unit at a time. Betterbit includes pyeong with ft², m², acres, hectares and yd² in the same live result panel. (Strength: it exposes a precision selector and a large generated conversion table.)',
    },
    {
      name: 'EVERYCALC — 평수 변환 계산기',
      url: 'https://www.everycalc.pe.kr/pyeong',
      weakness:
        'Its conversion content and reference table cover 평 and ㎡, but the page does not expose ft², yd², acres, or hectares in its calculator flow; its page also contains banner advertising. Betterbit keeps Korean, metric and imperial land units in one ad-free live converter. (Strength: it gives a detailed explanation of exclusive, supply and contract area.)',
    },
    {
      name: 'WikiTool — 평수 계산기',
      url: 'https://wikitool.co.kr/tools/pyeong-calculator',
      weakness:
        'Its visible input offers a direction selector for only 평 and ㎡, so a visitor comparing a U.S. floor-plan size or land listing must use another tool. Betterbit lets the same input move among six units, including ft², acres and hectares. (Strength: it clearly cautions that exclusive, supply and contract area are different bases.)',
    },
    {
      name: '신호랩 — 평수 계산기',
      url: 'https://sinholab.com/calc/pyeong/',
      weakness:
        'Its two live fields are limited to 평 and ㎡ and the page sends visitors to a separate list for 55 common-area values; it does not show imperial or land-unit equivalents next to the entered result. Betterbit shows ft², yd², acres and hectares together with the chosen 평/㎡ conversion. (Strength: it provides concise common-apartment-size shortcuts.)',
    },
  ],
  related: ['length-converter', 'weight-converter', 'scientific-calculator', 'pyeong-calculator'],
  variants,
};
