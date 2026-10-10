import type { ToolMeta, ToolVariant } from '../types';

const variants: ToolVariant[] = [
  {
    slug: 'celsius-to-fahrenheit',
    preset: { from: 'c', to: 'f', value: 20 },
    content: {
      en: {
        title: 'Celsius to Fahrenheit Converter — Instant, No Ads',
        description:
          'Convert Celsius to Fahrenheit instantly as you type. No "Convert" button, no ads — plus a gas-mark oven temperature table for recipes.',
        h1: 'Celsius to Fahrenheit',
        intro:
          'Celsius to Fahrenheit, live as you type. °F = °C × 9/5 + 32, so 0°C = 32°F and 100°C = 212°F — the result and the oven table below update with every keystroke.',
      },
      ko: {
        title: '섭씨 화씨 변환 — 입력 즉시 결과, 광고 없음',
        description:
          '섭씨를 화씨로 입력하는 즉시 변환합니다. "변환" 버튼과 광고 없이 바로 결과가 나오고, 해외 레시피용 오븐 온도표도 함께 제공합니다.',
        h1: '섭씨 화씨 변환',
        intro: '섭씨를 화씨로 실시간 변환합니다. °F = °C × 9/5 + 32이므로 0°C는 32°F, 100°C는 212°F입니다.',
      },
    },
  },
  {
    slug: 'fahrenheit-to-celsius',
    preset: { from: 'f', to: 'c', value: 98.6 },
    content: {
      en: {
        title: 'Fahrenheit to Celsius Converter — Instant, No Ads',
        description:
          'Convert Fahrenheit to Celsius instantly, no "Convert" button and no ads. Includes a gas-mark oven temperature table for recipes.',
        h1: 'Fahrenheit to Celsius',
        intro:
          'Fahrenheit to Celsius, updated live. °C = (°F − 32) × 5/9, so 98.6°F (normal body temperature) is 37°C — type any value and the result follows along.',
      },
      ko: {
        title: '화씨 섭씨 변환 — 입력 즉시 결과, 광고 없음',
        description:
          '화씨를 섭씨로 입력하는 즉시 변환합니다. "변환" 버튼 없이 바로 결과를 보여주고, 오븐 온도표도 함께 제공합니다.',
        h1: '화씨 섭씨 변환',
        intro: '화씨를 섭씨로 실시간 변환합니다. °C = (°F − 32) × 5/9이므로 정상 체온 98.6°F는 37°C입니다.',
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
      },
      ko: {
        title: '오븐 온도 변환 — 화씨·섭씨·가스 마크',
        description:
          '해외 레시피의 화씨 오븐 온도를 섭씨와 영국식 가스 마크로 즉시 변환합니다. 350°F는 가스 마크 4(180°C)의 표준 환산값입니다.',
        h1: '오븐 온도 변환',
        intro:
          '해외 레시피에 나오는 화씨 오븐 온도를 섭씨나 영국식 가스 마크로 실시간 변환합니다. 350°F는 레시피에서 흔히 180°C(가스 마크 4)로 표기됩니다. 아래 표에서 가스 마크 1~9를 모두 확인하세요.',
      },
    },
  },
];

export const meta: ToolMeta = {
  slug: 'temperature-converter',
  category: 'converter',
  icon: 'convert',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['no-ads', 'usability', 'features'],
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
        '입력 후 "변환" 버튼을 직접 눌러야 결과가 나오며(실시간 아님), 페이지 하단에는 "오늘 하루 보지 않기"로만 닫을 수 있는 앱 광고 배너가 떠 있고 요리용 온도표도 없다. Betterbit는 버튼과 광고 없이 입력 즉시 결과와 오븐 온도표가 바뀐다.',
    },
    {
      name: 'RapidTables 한국어 — 섭씨에서 화씨로 변환',
      url: 'https://www.rapidtables.org/ko/convert/temperature/celsius-to-fahrenheit.html',
      weakness:
        '과학적 기준점(절대영도, 물의 어는점·끓는점, 평균 체온) 표만 제공하고 요리·오븐 온도표는 없어, 해외 레시피의 화씨 온도를 확인하려면 다른 사이트를 찾아야 한다. Betterbit는 가스 마크 1~9의 화씨·섭씨 값을 같은 화면에서 바로 보여준다.',
    },
  ],
  related: ['length-converter', 'weight-converter', 'scientific-calculator', 'bmi-calculator'],
  variants,
};
