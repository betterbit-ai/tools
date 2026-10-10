import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  valueLabel: 'Value',
  fromLabel: 'From',
  toLabel: 'To',
  swap: 'Swap units',
  resultLabel: 'Result',
  autosaved: 'Saved automatically',
  belowAbsoluteZero: 'That is colder than absolute zero (-273.15°C / 0 K) — not a physically possible temperature.',
  cookingTableTitle: 'Oven temperature reference',
  gasMark: 'Gas mark',
  heatLabel: 'Heat',
  unitC: 'Celsius (°C)',
  unitF: 'Fahrenheit (°F)',
  unitK: 'Kelvin (K)',
  ovenSlow: 'Slow',
  ovenModeratelySlow: 'Moderately slow',
  ovenModerate: 'Moderate',
  ovenModeratelyHot: 'Moderately hot',
  ovenHot: 'Hot',
  ovenVeryHot: 'Very hot',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Temperature Converter — Celsius, Fahrenheit, Kelvin + Oven Table',
    description:
      'Convert Celsius, Fahrenheit and Kelvin instantly as you type — no ads, no "Convert" button — with a gas-mark oven temperature table for recipes.',
    h1: 'Temperature Converter',
    tagline: 'Celsius, Fahrenheit and Kelvin, converted live, with an oven temperature table built in.',
    name: 'Temperature Converter',
    keywords: [
      'celsius to fahrenheit',
      'fahrenheit to celsius',
      'celsius to kelvin',
      'c to f',
      'f to c',
      'oven temperature converter',
      'gas mark converter',
      'body temperature converter',
    ],
    howTo: [
      'Type a value and pick the units to convert from and to.',
      'Press the swap button to flip the two units instantly.',
      'Check the oven temperature table below for the gas-mark equivalent of any recipe temperature.',
      'If the result would be colder than absolute zero, a warning appears — that temperature is not physically possible.',
    ],
    sections: [
      {
        heading: 'The three formulas',
        body: 'Celsius to Fahrenheit: °F = °C × 9/5 + 32. Fahrenheit to Celsius: °C = (°F − 32) × 5/9. Celsius to Kelvin: K = °C + 273.15 (Kelvin has no negative values — 0 K, or -273.15°C, is absolute zero, the coldest anything can get). The scales agree at exactly one point: -40°C equals -40°F. This converter uses the exact formulas above, not rounded shortcuts, so results stay accurate at any size of input.',
      },
      {
        heading: 'Oven temperatures and gas mark',
        body: 'UK and Irish gas ovens are marked with a "gas mark" number instead of a temperature. Gas mark 4 (350°F / 180°C) is the most common "moderate" baking temperature; gas mark 7 (425°F / 220°C) is a hot oven for roasting. These are the rounded values recipes actually print — not the exact math conversion. For example, 350°F converts mathematically to about 176.7°C, but recipes and oven dials use 180°C instead, because home ovens are rarely accurate to better than ±5°C anyway. The table below lists gas marks 1 through 9 with both the Fahrenheit and Celsius values printed on real recipes and oven dials.',
      },
    ],
    faq: [
      {
        q: 'What is 350°F in Celsius for baking?',
        a: 'For an oven, 350°F is treated as 180°C (gas mark 4) — the standard rounded recipe equivalent, not the exact math conversion of about 176.7°C. Use 180°C on the dial; home ovens are not accurate enough for the extra few degrees to matter.',
      },
      {
        q: 'How do you convert Celsius to Fahrenheit?',
        a: 'Multiply the Celsius value by 9/5 and add 32: °F = °C × 9/5 + 32. For example, 20°C × 9/5 = 36, plus 32 = 68°F.',
      },
      {
        q: 'How do you convert Fahrenheit to Celsius?',
        a: 'Subtract 32, then multiply by 5/9: °C = (°F − 32) × 5/9. For example, (98.6 − 32) × 5/9 = 37°C, normal human body temperature.',
      },
      {
        q: 'What temperature is the same in Celsius and Fahrenheit?',
        a: '-40 degrees. -40°C equals exactly -40°F — the one point where both scales give the same number.',
      },
      {
        q: 'What is 0 Kelvin in Celsius and Fahrenheit?',
        a: '0 K is -273.15°C (-459.67°F), known as absolute zero — the theoretical lower limit of temperature, where nothing can be colder. Kelvin values below 0 are not physically possible.',
      },
      {
        q: 'What gas mark is 220°C?',
        a: '220°C is gas mark 7 (425°F), described as a "hot" oven — common for roasting vegetables or baking bread.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '온도 변환기 — 섭씨·화씨·켈빈, 오븐 온도표 포함',
    description:
      '섭씨, 화씨, 켈빈을 입력하는 즉시 변환합니다. "변환" 버튼과 광고 없이 바로 결과가 나오고, 해외 레시피용 가스 마크 오븐 온도표도 함께 제공합니다.',
    h1: '온도 변환기',
    tagline: '섭씨·화씨·켈빈을 입력 즉시 변환하고, 오븐 온도표까지 한 화면에서 확인하세요.',
    name: '온도 변환기',
    keywords: [
      '섭씨 화씨 변환',
      '화씨 섭씨 변환',
      '섭씨 켈빈 변환',
      '온도 단위 변환',
      '오븐 온도 변환',
      '가스 마크 변환',
      '체온 변환',
      '화씨 온도 계산',
    ],
    howTo: [
      '값을 입력하고 변환할 단위와 결과 단위를 선택하세요.',
      '단위 바꾸기 버튼을 누르면 두 단위가 즉시 서로 바뀝니다.',
      '아래 오븐 온도표에서 해외 레시피 온도의 가스 마크·섭씨·화씨 값을 확인하세요.',
      '절대영도보다 낮은 값을 입력하면 물리적으로 불가능한 온도라는 경고가 표시됩니다.',
    ],
    sections: [
      {
        heading: '세 가지 변환 공식',
        body: '섭씨를 화씨로: °F = °C × 9/5 + 32. 화씨를 섭씨로: °C = (°F − 32) × 5/9. 섭씨를 켈빈으로: K = °C + 273.15 (켈빈에는 음수가 없습니다 — 0K, 즉 -273.15°C가 절대영도이며 이보다 낮은 온도는 존재할 수 없습니다). 두 스케일이 정확히 같아지는 지점은 단 하나, -40°C와 -40°F입니다. 이 변환기는 어림값이 아니라 정확한 공식을 그대로 쓰기 때문에 입력값의 크기와 상관없이 결과가 정확합니다.',
      },
      {
        heading: '오븐 온도와 가스 마크',
        body: '영국·아일랜드식 가스오븐은 온도 대신 "가스 마크(gas mark)" 숫자로 눈금이 표시됩니다. 가스 마크 4(350°F / 180°C)는 가장 흔한 "보통" 굽기 온도이고, 가스 마크 7(425°F / 220°C)은 로스팅에 쓰는 뜨거운 오븐입니다. 이 값들은 실제 계산값이 아니라 레시피와 오븐 다이얼에 실제로 적혀 있는 반올림 값입니다. 예를 들어 350°F를 수학적으로 정확히 환산하면 약 176.7°C이지만, 레시피와 오븐 다이얼은 180°C를 씁니다 — 가정용 오븐 자체가 ±5°C 이상의 오차를 갖기 때문에 몇 도 차이는 의미가 없습니다. 아래 표는 가스 마크 1~9의 화씨·섭씨 값을 레시피에 실제로 쓰이는 숫자 그대로 보여줍니다.',
      },
    ],
    faq: [
      {
        q: '베이킹에서 350°F는 섭씨 몇 도인가요?',
        a: '오븐에서는 350°F를 180°C(가스 마크 4)로 봅니다. 이는 수학적으로 정확한 환산값(약 176.7°C)이 아니라 레시피에서 쓰는 표준 반올림 값입니다. 가정용 오븐은 그 몇 도 차이를 구분할 만큼 정확하지 않으므로 180°C로 맞추면 됩니다.',
      },
      {
        q: '섭씨를 화씨로 변환하는 방법은?',
        a: '섭씨 값에 9/5를 곱하고 32를 더합니다: °F = °C × 9/5 + 32. 예를 들어 20°C는 20×9/5=36, 36+32=68°F입니다.',
      },
      {
        q: '화씨를 섭씨로 변환하는 방법은?',
        a: '화씨 값에서 32를 빼고 5/9를 곱합니다: °C = (°F − 32) × 5/9. 예를 들어 (98.6−32)×5/9=37°C로, 정상 체온과 같습니다.',
      },
      {
        q: '섭씨와 화씨가 같은 숫자가 되는 온도가 있나요?',
        a: '네, -40도입니다. -40°C는 정확히 -40°F와 같습니다 — 두 온도 체계가 같은 숫자로 만나는 유일한 지점입니다.',
      },
      {
        q: '켈빈 0도는 섭씨·화씨로 몇 도인가요?',
        a: '0K는 -273.15°C(-459.67°F)로, 절대영도라고 부릅니다. 이론상 가능한 가장 낮은 온도이며, 0K보다 낮은 켈빈 값은 물리적으로 존재할 수 없습니다.',
      },
      {
        q: '섭씨 220도는 가스 마크 몇인가요?',
        a: '220°C는 가스 마크 7(화씨 425도)에 해당하며, 채소 로스팅이나 빵 굽기에 많이 쓰는 "뜨거운" 오븐 온도입니다.',
      },
    ],
    ui: {
      valueLabel: '값',
      fromLabel: '변환할 단위',
      toLabel: '결과 단위',
      swap: '단위 바꾸기',
      resultLabel: '결과',
      autosaved: '자동 저장됨',
      belowAbsoluteZero: '절대영도(-273.15°C / 0K)보다 낮은, 물리적으로 존재할 수 없는 온도입니다.',
      cookingTableTitle: '오븐 온도 참조표',
      gasMark: '가스 마크',
      heatLabel: '굽기 정도',
      unitC: '섭씨 (°C)',
      unitF: '화씨 (°F)',
      unitK: '켈빈 (K)',
      ovenSlow: '약하게',
      ovenModeratelySlow: '약간 약하게',
      ovenModerate: '보통',
      ovenModeratelyHot: '약간 뜨겁게',
      ovenHot: '뜨겁게',
      ovenVeryHot: '매우 뜨겁게',
    },
  },
};
