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
        sections: [
          {
            heading: 'Square feet to square metres, exactly',
            body: 'One square foot is 144 square inches, and an inch is exactly 2.54 cm, so a square foot is 0.09290304 m² — the figure comes from squaring 0.3048 m rather than from rounding. Multiply a square-foot figure by that number to get m², or by 0.0929 for a quick estimate; 1,000 ft² is 92.9 m² and 2,000 ft² is 185.8 m².\n\nUS, Canadian and UK floor areas are quoted in square feet while Korean listings use ㎡ and pyeong. One pyeong is 400/121 m², or 35.5832 ft², so a 25-pyeong flat covers about 890 ft² of the same floor. Because both systems measure the same area, only the basis — exclusive or supply — can make the numbers disagree.',
            table: {
              caption: 'Square feet to square metres',
              head: ['Square feet (ft²)', 'Square metres (m²)'],
              rows: [
                ['100', '9.29'],
                ['250', '23.23'],
                ['500', '46.45'],
                ['1,000', '92.90'],
                ['2,000', '185.81'],
                ['5,000', '464.52'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How many square metres is 1,000 square feet?',
            a: '1,000 ft² is 92.90304 m², about 92.9 m². Multiply by 0.09290304, which is 0.3048 squared — not by 0.09, which loses about 3% of the area.',
          },
          {
            q: 'How many square feet is one pyeong?',
            a: 'One pyeong is 400/121 m², which is 35.5832 ft². A 25-pyeong flat is therefore about 890 ft², and a 1,000 ft² flat is about 28.1 pyeong.',
          },
          {
            q: 'Why is the factor 0.09290304 rather than 0.0929?',
            a: 'It is the square of the exact 0.3048 m foot. 0.0929 is fine for a rough figure but drifts by about 0.003 m² per square foot, which becomes 3 m² over 1,000 ft².',
          },
        ],
      },
      ko: {
        title: '평방피트 ㎡ 변환 — 평·에이커까지 함께 확인',
        description:
          '평방피트(ft²)를 ㎡로 입력 즉시 변환합니다. 평·에이커·헥타르·평방야드도 한 화면에서 함께 확인하며 변환 버튼이 필요 없습니다.',
        h1: '평방피트 ㎡ 변환',
        intro:
          '평방피트에서 제곱미터로 실시간 변환합니다. 1ft² = 정확히 0.09290304㎡이며, 같은 넓이의 평·에이커·헥타르 값도 아래에서 바로 확인할 수 있습니다.',
        sections: [
          {
            heading: '평방피트와 제곱미터, 정확한 관계',
            body: '1평방피트는 144평방인치이고 1인치는 정확히 2.54cm이므로, 1ft²는 0.09290304㎡입니다. 이 값은 0.3048m를 제곱한 결과이며 반올림한 숫자가 아닙니다. 평방피트 값에 이 수를 곱하면 ㎡가 되고, 0.0929를 쓰면 빠르게 어림할 수 있습니다. 1,000ft²는 92.9㎡, 2,000ft²는 185.8㎡입니다.\n\n미국·캐나다·영국의 매물은 평방피트로, 한국 매물은 ㎡와 평으로 면적을 표기합니다. 1평은 400/121㎡, 즉 35.5832ft²이므로 25평 아파트는 같은 바닥으로 약 890ft²입니다. 두 단위 모두 같은 면적을 재므로, 숫자가 어긋나는 이유는 단위가 아니라 전용·공급 기준 차이입니다.',
            table: {
              caption: '평방피트를 제곱미터로',
              head: ['평방피트 (ft²)', '제곱미터 (㎡)'],
              rows: [
                ['100', '9.29'],
                ['250', '23.23'],
                ['500', '46.45'],
                ['1,000', '92.90'],
                ['2,000', '185.81'],
                ['5,000', '464.52'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '1,000평방피트는 몇 ㎡인가요?',
            a: '1,000ft²는 0.09290304를 곱해 92.90304㎡, 약 92.9㎡입니다. 0.09를 곱하면 면적의 약 3%가 빠지므로 주의하세요.',
          },
          {
            q: '1평은 몇 평방피트인가요?',
            a: '1평은 400/121㎡이므로 35.5832ft²입니다. 25평 아파트는 약 890ft², 1,000ft²는 약 28.1평입니다.',
          },
          {
            q: '계수가 0.0929가 아니라 0.09290304인 이유는?',
            a: '정확히 0.3048m인 피트를 제곱한 값이기 때문입니다. 0.0929는 어림값이라 1,000ft²에서 약 3㎡ 차이가 납니다.',
          },
        ],
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
        sections: [
          {
            heading: 'Square metres to pyeong: the 400/121 definition',
            body: 'One pyeong is 400/121 m², about 3.3058 m², so a square-metre figure divided by 3.3058 gives pyeong. 84 m² is 25.41 pyeong, 59 m² is 17.85 pyeong and 101 m² is 30.55 pyeong. The common shortcut of multiplying ㎡ by 0.3025 gives the same answer because 0.3025 is exactly 121/400.\n\nThe number that trips people up is not the conversion but the basis. The ㎡ on a register or a 건축물대장 is usually exclusive area, while the pyeong in an advert is supply area that includes shared space. Convert both to the same basis with the same factor before comparing a listing, and use the two fields in the calculator when both figures are printed.',
            table: {
              caption: 'Common Korean floor areas in square metres and pyeong',
              head: ['Square metres (㎡)', 'Pyeong'],
              rows: [
                ['59', '17.85'],
                ['74', '22.39'],
                ['84', '25.41'],
                ['101', '30.55'],
                ['114', '34.49'],
                ['150', '45.37'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How many pyeong is 84 square metres?',
            a: '84 ㎡ is 25.41 pyeong: 84 × 121 ÷ 400. Adverts often call the same flat a 33-pyeong type because they count supply area rather than the exclusive area the ㎡ refers to.',
          },
          {
            q: 'How many pyeong is 59 square metres?',
            a: '59 ㎡ is 17.85 pyeong. With a typical 75% exclusive ratio the supply area is about 78.7 ㎡, or 23.8 pyeong, which is why a 59 ㎡ flat can be sold as a 24-pyeong type.',
          },
          {
            q: 'Is multiplying by 0.3025 accurate enough?',
            a: 'It is exact, because 0.3025 = 121/400. Multiplying gives the same answer as dividing by 3.3058 up to the rounding of the decimal, and the calculator keeps more digits so repeated conversions do not drift.',
          },
        ],
      },
      ko: {
        title: '㎡ 평 변환 — 84㎡는 몇 평? 입력 즉시 계산',
        description:
          '제곱미터(㎡)를 평으로 입력 즉시 변환합니다. 정확한 400/121㎡ 기준을 쓰며 평방피트·에이커·헥타르 결과도 함께 확인할 수 있습니다.',
        h1: '㎡ 평 변환',
        intro:
          '제곱미터를 평으로 실시간 변환합니다. 84㎡는 정확한 400/121㎡ 기준으로 25.41평입니다. 매물은 전용·공급 등 같은 면적 기준끼리 비교하세요.',
        sections: [
          {
            heading: '제곱미터에서 평으로, 400/121 기준',
            body: '1평은 400/121㎡로 약 3.3058㎡입니다. 그래서 ㎡ 값을 3.3058로 나누면 평이 됩니다. 84㎡는 25.41평, 59㎡는 17.85평, 101㎡는 30.55평입니다. ㎡에 0.3025를 곱하는 요령도 같은 답을 주는데, 0.3025가 정확히 121/400이기 때문입니다.\n\n사람들이 헷갈리는 지점은 환산이 아니라 기준입니다. 등기부나 건축물대장의 ㎡는 보통 전용면적이고, 광고의 평수는 공용면적을 더한 공급면적입니다. 매물을 비교할 때는 두 값을 같은 기준으로 같은 계수를 써서 환산하고, 두 숫자가 모두 적혀 있다면 아래 전용·공급 입력란에 함께 넣어 확인하세요.',
            table: {
              caption: '자주 쓰는 한국 아파트 면적',
              head: ['제곱미터 (㎡)', '평'],
              rows: [
                ['59', '17.85'],
                ['74', '22.39'],
                ['84', '25.41'],
                ['101', '30.55'],
                ['114', '34.49'],
                ['150', '45.37'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '84㎡는 몇 평인가요?',
            a: '84 × 121 ÷ 400 = 25.41평입니다. 광고에서 33평형이라고 부르는 것은 ㎡가 가리키는 전용면적이 아니라 공급면적을 세기 때문입니다.',
          },
          {
            q: '59㎡는 몇 평인가요?',
            a: '17.85평입니다. 전용률 75%를 가정하면 공급면적이 약 78.7㎡(23.8평)여서 24평형으로 광고되기도 합니다.',
          },
          {
            q: '0.3025를 곱하면 정확한가요?',
            a: '0.3025가 121/400이므로 곱셈도 같은 값이 나옵니다. 계산기는 소수를 더 많이 유지해 반복 환산에서 오차가 쌓이지 않습니다.',
          },
        ],
      },
    },
  },
];

export const meta: ToolMeta = {
  slug: 'area-converter',
  category: 'converter',
  icon: 'convert',
  added: '2026-10-14',
  updated: '2026-11-28',
  edges: ['usability'],
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
        'Its conversion content and reference table cover 평 and ㎡, but the page does not expose ft², yd², acres, or hectares in its calculator flow; its page also contains banner advertising. Betterbit keeps Korean, metric and imperial land units in one live converter. (Strength: it gives a detailed explanation of exclusive, supply and contract area.)',
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
