import type { ToolMeta, ToolVariant } from '../types';

const variants: ToolVariant[] = [
  {
    slug: 'celsius-to-fahrenheit',
    preset: { from: 'c', to: 'f', value: 20 },
    content: {
      en: {
        title: 'Celsius to Fahrenheit Converter — Instant, Oven Chart',
        description:
          'Convert Celsius to Fahrenheit instantly as you type. No "Convert" button — plus a gas-mark oven temperature table for recipes.',
        h1: 'Celsius to Fahrenheit',
        intro:
          'Celsius to Fahrenheit, live as you type. °F = °C × 9/5 + 32, so 0°C = 32°F and 100°C = 212°F — the result and the oven table below update with every keystroke.',
        sections: [
          {
            heading: 'Celsius to Fahrenheit, and the point where they meet',
            body: 'The formula is °F = °C × 9/5 + 32, so 0 °C is 32 °F, 20 °C is 68 °F, 37 °C is 98.6 °F and 100 °C is 212 °F. Because the two scales cross at −40, that value needs no conversion at all: −40 °C is −40 °F.\n\nWeather, oven dials and body temperature are where the two scales meet in daily life. A Korean forecast of 30 °C is 86 °F; a US forecast of 90 °F is 32.2 °C. The scales are not proportional: a 10 °C rise is an 18 °F rise, because a Fahrenheit degree is five ninths of a Celsius degree.',
            table: {
              caption: 'Celsius to Fahrenheit',
              head: ['Celsius (°C)', 'Fahrenheit (°F)', 'Context'],
              rows: [
                ['-10', '14', 'Cold winter day'],
                ['0', '32', 'Water freezes'],
                ['20', '68', 'Room temperature'],
                ['30', '86', 'Hot summer day'],
                ['37', '98.6', 'Body temperature'],
                ['100', '212', 'Water boils'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How do I convert 20 °C to °F?',
            a: '20 × 9/5 + 32 = 68 °F. Multiply by 1.8 and add 32; doubling and adding 30 gives 70 °F, close but wrong enough to matter for a recipe or a fever.',
          },
          {
            q: 'Why is −40 the same in both scales?',
            a: 'Because the two scales converge at −40: −40 × 9/5 + 32 = −40. It is the only temperature where the numbers match.',
          },
          {
            q: 'Is 37 °C exactly 98.6 °F?',
            a: 'Yes, 37 °C converts to 98.6 °F. The familiar 98.6 °F is a rounded average body temperature, and normal temperature varies by about half a degree through the day.',
          },
        ],
      },
      ko: {
        title: '섭씨 화씨 변환 — 입력 즉시 결과, 오븐 온도표',
        description:
          '섭씨를 화씨로 입력하는 즉시 변환합니다. "변환" 버튼 없이 바로 결과가 나오고, 해외 레시피용 오븐 온도표도 함께 제공합니다.',
        h1: '섭씨 화씨 변환',
        intro: '섭씨를 화씨로 실시간 변환합니다. °F = °C × 9/5 + 32이므로 0°C는 32°F, 100°C는 212°F입니다.',
        sections: [
          {
            heading: '섭씨에서 화씨로, 두 눈금이 만나는 지점',
            body: '공식은 °F = °C × 9/5 + 32입니다. 0°C는 32°F, 20°C는 68°F, 37°C는 98.6°F, 100°C는 212°F입니다. 두 눈금은 −40에서 만나므로 그 값만은 환산이 필요 없습니다. −40°C는 −40°F입니다.\n\n일상에서 두 눈금이 만나는 곳은 날씨, 오븐 다이얼, 체온입니다. 한국 예보의 30°C는 86°F이고, 미국 예보의 90°F는 32.2°C입니다. 두 눈금은 비례하지 않습니다. 화씨 1도가 섭씨 1도의 5/9이므로 10°C 차이는 18°F 차이입니다.',
            table: {
              caption: '섭씨를 화씨로',
              head: ['섭씨 (°C)', '화씨 (°F)', '상황'],
              rows: [
                ['-10', '14', '추운 겨울날'],
                ['0', '32', '물이 어는 점'],
                ['20', '68', '실내 온도'],
                ['30', '86', '더운 여름날'],
                ['37', '98.6', '체온'],
                ['100', '212', '물이 끓는 점'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '20°C는 화씨로 몇 도인가요?',
            a: '20 × 9/5 + 32 = 68°F입니다. 1.8을 곱하고 32를 더하세요. 두 배를 하고 30을 더하면 70°F가 되어 레시피나 체온에는 오차가 큽니다.',
          },
          {
            q: '−40이 두 눈금에서 같은 이유는?',
            a: '−40 × 9/5 + 32 = −40이므로 두 눈금이 −40에서 만납니다. 숫자가 일치하는 유일한 온도입니다.',
          },
          {
            q: '37°C는 정확히 98.6°F인가요?',
            a: '네, 37°C는 98.6°F입니다. 흔히 말하는 98.6°F는 반올림한 평균 체온이며, 실제 체온은 하루 동안 0.5도 안팎으로 변합니다.',
          },
        ],
      },
    },
  },
  {
    slug: 'fahrenheit-to-celsius',
    preset: { from: 'f', to: 'c', value: 98.6 },
    content: {
      en: {
        title: 'Fahrenheit to Celsius Converter — Instant, Oven Chart',
        description:
          'Convert Fahrenheit to Celsius instantly, no "Convert" button needed. Includes a gas-mark oven temperature table for recipes.',
        h1: 'Fahrenheit to Celsius',
        intro:
          'Fahrenheit to Celsius, updated live. °C = (°F − 32) × 5/9, so 98.6°F (normal body temperature) is 37°C — type any value and the result follows along.',
        sections: [
          {
            heading: 'Fahrenheit to Celsius, from body temperature to weather',
            body: 'The reverse formula is °C = (°F − 32) × 5/9. Normal body temperature 98.6 °F is 37 °C, 32 °F is 0 °C, 212 °F is 100 °C and 68 °F is 20 °C. Subtracting 30 and halving is the usual shortcut and is off by about 1–2 °C — fine for deciding what to wear, not for a fever.\n\nA fever of 100.4 °F is 38 °C, the threshold most guidelines use, and 104 °F is 40 °C. For weather, 50 °F is 10 °C and 86 °F is 30 °C, which is why a US forecast in the 50s feels like a cool Korean spring day.',
            table: {
              caption: 'Fahrenheit to Celsius',
              head: ['Fahrenheit (°F)', 'Celsius (°C)', 'Context'],
              rows: [
                ['32', '0', 'Water freezes'],
                ['50', '10', 'Cool day'],
                ['68', '20', 'Room temperature'],
                ['86', '30', 'Hot day'],
                ['98.6', '37', 'Body temperature'],
                ['104', '40', 'High fever'],
                ['212', '100', 'Water boils'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How do I convert 98.6 °F to °C?',
            a: '(98.6 − 32) × 5/9 = 37 °C. This is the standard body-temperature conversion and the reference point most thermometers use.',
          },
          {
            q: 'What fever is 100.4 °F in Celsius?',
            a: '100.4 °F is exactly 38 °C, the threshold many medical guidelines use to define a fever. A reading of 104 °F is 40 °C.',
          },
          {
            q: 'Is subtracting 30 and halving accurate?',
            a: 'It is a rough rule: 86 °F becomes 28 °C instead of 30 °C. Use it for judging weather, and use the formula for cooking, fever or anything where two degrees matter.',
          },
        ],
      },
      ko: {
        title: '화씨 섭씨 변환 — 입력 즉시 결과, 오븐 온도표',
        description:
          '화씨를 섭씨로 입력하는 즉시 변환합니다. "변환" 버튼 없이 바로 결과를 보여주고, 오븐 온도표도 함께 제공합니다.',
        h1: '화씨 섭씨 변환',
        intro: '화씨를 섭씨로 실시간 변환합니다. °C = (°F − 32) × 5/9이므로 정상 체온 98.6°F는 37°C입니다.',
        sections: [
          {
            heading: '화씨에서 섭씨로, 체온에서 날씨까지',
            body: '반대 공식은 °C = (°F − 32) × 5/9입니다. 정상 체온 98.6°F는 37°C이고, 32°F는 0°C, 212°F는 100°C, 68°F는 20°C입니다. 30을 빼고 반으로 나누는 요령은 1~2°C 틀리므로 옷을 고를 때는 충분하지만 체온에는 부족합니다.\n\n발열 기준인 100.4°F는 38°C이고 104°F는 40°C입니다. 날씨로는 50°F가 10°C, 86°F가 30°C여서 미국 예보의 50도대는 한국의 서늘한 봄날과 비슷합니다.',
            table: {
              caption: '화씨를 섭씨로',
              head: ['화씨 (°F)', '섭씨 (°C)', '상황'],
              rows: [
                ['32', '0', '물이 어는 점'],
                ['50', '10', '서늘한 날'],
                ['68', '20', '실내 온도'],
                ['86', '30', '더운 날'],
                ['98.6', '37', '체온'],
                ['104', '40', '고열'],
                ['212', '100', '물이 끓는 점'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '98.6°F는 섭씨 몇 도인가요?',
            a: '(98.6 − 32) × 5/9 = 37°C입니다. 체온의 표준 환산값이며 대부분의 체온계가 쓰는 기준입니다.',
          },
          {
            q: '100.4°F는 섭씨 몇 도인가요?',
            a: '정확히 38°C로, 많은 의료 지침이 발열로 보는 기준입니다. 104°F는 40°C입니다.',
          },
          {
            q: '30을 빼고 반으로 나누면 정확한가요?',
            a: '어림값입니다. 86°F가 30°C가 아니라 28°C로 나옵니다. 날씨 판단에는 쓸 만하지만 요리나 체온처럼 2도가 중요한 경우에는 공식을 쓰세요.',
          },
        ],
      },
    },
  },
  {
    slug: 'oven-temperature',
    preset: { from: 'f', to: 'c', value: 350 },
    content: {
      en: {
        title: 'Oven Temperature Converter — °F, °C and Gas Mark',
        description:
          'Convert oven temperatures between Fahrenheit, Celsius and UK gas mark instantly — 350°F is gas mark 4 (180°C), the standard rounded recipe value.',
        h1: 'Oven Temperature Converter',
        intro:
          "Convert a US recipe's Fahrenheit oven setting to Celsius or UK gas mark, live. 350°F is the common recipe equivalent of 180°C (gas mark 4) — the table below lists every gas mark from 1 to 9.",
        sections: [
          {
            heading: 'Oven dials: Fahrenheit, Celsius and gas marks',
            body: 'Most US recipes give an oven temperature in °F, European and Korean ovens use °C, and British recipes still use gas marks. The useful anchors are 325 °F = 163 °C = gas 3, 350 °F = 177 °C = gas 4, 375 °F = 191 °C = gas 5 and 425 °F = 218 °C = gas 7. Oven thermostats cycle around the set point, so a 10 °C difference rarely matters.\n\nA fan (convection) oven moves heat more efficiently and is usually set about 20 °C lower than the conventional figure in the recipe, so 350 °F conventional becomes roughly 160 °C fan. Check whether the recipe says conventional or fan before converting.',
            table: {
              caption: 'Common oven temperatures',
              head: ['Fahrenheit (°F)', 'Celsius (°C)', 'Gas mark', 'Fan oven (°C)'],
              rows: [
                ['250', '121', '1/2', '100'],
                ['300', '149', '2', '130'],
                ['325', '163', '3', '140'],
                ['350', '177', '4', '160'],
                ['375', '191', '5', '170'],
                ['400', '204', '6', '180'],
                ['425', '218', '7', '200'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'What is 350 °F in Celsius for an oven?',
            a: '177 °C, which is gas mark 4 and about 160 °C in a fan oven. Many recipes round it to 180 °C for a conventional oven.',
          },
          {
            q: 'How much lower should a fan oven be?',
            a: 'About 20 °C lower than the conventional temperature, so 350 °F (177 °C) becomes roughly 160 °C fan. Check the recipe, because some are already written for fan ovens.',
          },
          {
            q: 'What is gas mark 4 in Celsius?',
            a: 'Gas mark 4 is 350 °F, or 177 °C. Gas marks step up by roughly 25 °F from mark 1 at 275 °F.',
          },
        ],
      },
      ko: {
        title: '오븐 온도 변환 — 화씨·섭씨·가스 마크',
        description:
          '해외 레시피의 화씨 오븐 온도를 섭씨와 영국식 가스 마크로 즉시 변환합니다. 350°F는 가스 마크 4(180°C)의 표준 환산값입니다.',
        h1: '오븐 온도 변환',
        intro:
          '해외 레시피에 나오는 화씨 오븐 온도를 섭씨나 영국식 가스 마크로 실시간 변환합니다. 350°F는 레시피에서 흔히 180°C(가스 마크 4)로 표기됩니다. 아래 표에서 가스 마크 1~9를 모두 확인하세요.',
        sections: [
          {
            heading: '오븐 다이얼: 화씨, 섭씨, 가스 표시',
            body: '미국 레시피는 오븐 온도를 °F로 적고, 유럽과 한국 오븐은 °C, 영국 레시피는 여전히 가스 표시를 씁니다. 자주 쓰는 기준은 325°F = 163°C = 가스 3, 350°F = 177°C = 가스 4, 375°F = 191°C = 가스 5, 425°F = 218°C = 가스 7입니다. 오븐 온도조절기는 설정값 주위에서 오르내리므로 10°C 차이는 대개 문제가 되지 않습니다.\n\n팬(컨벡션) 오븐은 열을 더 효율적으로 옮겨 보통 레시피의 일반 오븐 온도보다 20°C 낮게 설정합니다. 350°F 일반 오븐은 160°C 팬 오븐이 됩니다. 환산 전에 레시피가 일반인지 팬인지 확인하세요.',
            table: {
              caption: '자주 쓰는 오븐 온도',
              head: ['화씨 (°F)', '섭씨 (°C)', '가스 표시', '팬 오븐 (°C)'],
              rows: [
                ['250', '121', '1/2', '100'],
                ['300', '149', '2', '130'],
                ['325', '163', '3', '140'],
                ['350', '177', '4', '160'],
                ['375', '191', '5', '170'],
                ['400', '204', '6', '180'],
                ['425', '218', '7', '200'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '350°F는 오븐 섭씨로 몇 도인가요?',
            a: '177°C이고 가스 4, 팬 오븐으로는 약 160°C입니다. 많은 레시피가 일반 오븐 기준 180°C로 반올림합니다.',
          },
          {
            q: '팬 오븐은 얼마나 낮춰야 하나요?',
            a: '일반 오븐 온도보다 약 20°C 낮춥니다. 350°F(177°C)는 160°C 팬 오븐이 됩니다. 레시피에 팬 기준으로 적힌 경우도 있으니 확인하세요.',
          },
          {
            q: '가스 4는 섭씨 몇 도인가요?',
            a: '가스 4는 350°F, 즉 177°C입니다. 가스 표시는 275°F인 1단계부터 약 25°F씩 올라갑니다.',
          },
        ],
      },
    },
  },
];

export const meta: ToolMeta = {
  slug: 'temperature-converter',
  category: 'converter',
  icon: 'convert',
  added: '2026-10-11',
  updated: '2026-11-28',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'RapidTables — Celsius to Fahrenheit Converter',
      url: 'https://www.rapidtables.com/convert/temperature/celsius-to-fahrenheit.html',
      weakness:
        'The converter and its reference table only ever show scientific reference points (absolute zero up to 1000°C, freezing/boiling/body temperature) — there is no oven, gas-mark or cooking temperature table anywhere on the page, so converting a recipe\'s "350°F" still means leaving the site. Betterbit shows a 9-row gas-mark oven table (1–9, °F/°C plus "moderate/hot" wording) next to the live converter. (Strength: no ads, has a Celsius/Fahrenheit/Kelvin/Rankine dropdown.)',
    },
    {
      name: 'UnitConverters.net — Celsius to Fahrenheit',
      url: 'https://www.unitconverters.net/temperature/celsius-to-fahrenheit.htm',
      weakness:
        'Like its other unit pages, this one is a static reference table (0°C to 1000°C in fixed steps) with a long sidebar list of "dozens" of alternate temperature-pair pages (Celsius to Rankine, Reaumur to Kelvin…); there is no cooking-specific table and no indication the main field updates live as you type. Betterbit keeps Celsius, Fahrenheit and Kelvin on one page with a cooking table built in.',
    },
    {
      name: 'Omni Calculator — Celsius to Fahrenheit Converter',
      url: 'https://www.omnicalculator.com/conversion/celsius-to-fahrenheit',
      weakness:
        'The page leads with a long explainer (history of both scales, worked formulas, FAQ) before the actual input fields, and has no oven/gas-mark table — just the freezing and boiling points. Betterbit puts the converter and the cooking table first, with the explanation below.',
    },
    {
      name: 'DigiKey — 섭씨 화씨 변환 계산기',
      url: 'https://www.digikey.kr/ko/resources/conversion-calculators/conversion-calculator-temperature',
      weakness:
        '섭씨·화씨·켈빈·랭킨 네 단위를 지원하지만 요리, 체온 등 실생활 예시가 전혀 없어 숫자만 덩그러니 나오고, 오븐 온도나 가스 마크 표는 없다. Betterbit는 같은 변환기에 요리용 오븐 온도표(가스 마크 1~9)를 바로 붙여 놓았다.',
    },
    {
      name: 'enolasoft 섭씨 화씨 온도 변환 계산기',
      url: 'https://enolasoft.com/celsius.php',
      weakness:
        '입력 후 "변환" 버튼을 직접 눌러야 결과가 나오며(실시간 아님), 페이지 하단에는 "오늘 하루 보지 않기"로만 닫을 수 있는 앱 광고 배너가 떠 있고 요리용 온도표도 없다. Betterbit는 버튼 없이 입력 즉시 결과와 오븐 온도표가 바뀐다.',
    },
    {
      name: 'RapidTables 한국어 — 섭씨에서 화씨로 변환',
      url: 'https://www.rapidtables.org/ko/convert/temperature/celsius-to-fahrenheit.html',
      weakness:
        '과학적 기준점(절대영도, 물의 어는점·끓는점, 평균 체온) 표만 제공하고 요리·오븐 온도표는 없어, 해외 레시피의 화씨 온도를 확인하려면 다른 사이트를 찾아야 한다. Betterbit는 가스 마크 1~9의 화씨·섭씨 값을 같은 화면에서 바로 보여준다.',
    },
  ],
  related: [
    'length-converter',
    'weight-converter',
    'scientific-calculator',
    'bmi-calculator',
    'volume-converter',
    'speed-converter',
    'shoe-size-converter',
  ],
  variants,
};
