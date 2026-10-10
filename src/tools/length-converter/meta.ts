import type { ToolMeta, ToolVariant } from '../types';

const variants: ToolVariant[] = [
  {
    slug: 'cm-to-inches',
    preset: { from: 'cm', to: 'in', value: 170 },
    content: {
      en: {
        title: 'CM to Inches Converter — Instant, with a Quick Reference Table',
        description:
          'Convert centimeters to inches instantly as you type. No ads, no "Convert" button — plus a quick reference table and a feet+inches height converter.',
        h1: 'CM to Inches',
        intro:
          'Centimeters to inches, live as you type. 1 cm = 0.3937 inch, so 1 inch = 2.54 cm exactly — the result and the table below update with every keystroke.',
      },
      ko: {
        title: 'cm 인치 변환 — 입력하는 즉시 결과, 빠른 참조표 포함',
        description:
          'cm를 인치로 입력하는 즉시 변환합니다. 광고와 "변환" 버튼 없이 바로 결과가 나오고, 빠른 참조표와 피트·인치 키 변환기도 함께 제공합니다.',
        h1: 'cm 인치 변환',
        intro:
          '센티미터를 인치로 실시간 변환합니다. 1인치는 정확히 2.54cm이므로, 아래 결과와 표가 입력할 때마다 바로 바뀝니다.',
      },
    },
  },
  {
    slug: 'inches-to-cm',
    preset: { from: 'in', to: 'cm', value: 12 },
    content: {
      en: {
        title: 'Inches to CM Converter — Instant, No Ads',
        description:
          'Convert inches to centimeters instantly, no "Convert" button and no ads. Includes a quick reference table and a feet+inches to cm height converter.',
        h1: 'Inches to CM',
        intro:
          'Inches to centimeters, updated live. 1 inch is exactly 2.54 cm — type any value and the table below follows along.',
      },
      ko: {
        title: '인치 cm 변환 — 입력 즉시 결과, 광고 없음',
        description:
          '인치를 cm로 입력하는 즉시 변환합니다. "변환" 버튼과 광고 없이 바로 결과를 보여주고, 빠른 참조표와 키(피트·인치) 변환기도 함께 제공합니다.',
        h1: '인치 cm 변환',
        intro:
          '인치를 센티미터로 실시간 변환합니다. 1인치는 정확히 2.54cm입니다. 값을 입력하면 아래 표도 함께 바뀝니다.',
      },
    },
  },
  {
    slug: 'feet-to-meters',
    preset: { from: 'ft', to: 'm', value: 6 },
    content: {
      en: {
        title: 'Feet to Meters Converter — Live, with a Quick Table',
        description:
          'Convert feet to meters instantly as you type, with a quick reference table alongside — no ads, no sign-up, no "Convert" button to press.',
        h1: 'Feet to Meters',
        intro: 'Feet to meters, live. 1 foot is exactly 0.3048 meters — the result updates as you type.',
      },
      ko: {
        title: '피트 미터 변환 — 입력 즉시, 빠른 표 포함',
        description:
          '피트를 미터로 입력하는 즉시 변환합니다. 광고와 가입 없이 바로 결과가 나오고, 빠른 참조표도 함께 제공합니다.',
        h1: '피트 미터 변환',
        intro: '피트를 미터로 실시간 변환합니다. 1피트는 정확히 0.3048미터입니다.',
      },
    },
  },
  {
    slug: 'miles-to-km',
    preset: { from: 'mi', to: 'km', value: 5 },
    content: {
      en: {
        title: 'Miles to KM Converter — Instant, for Running & Driving',
        description:
          'Convert miles to kilometers instantly as you type — handy for pace, race distances and road signs. No ads, with a quick reference table.',
        h1: 'Miles to KM',
        intro:
          'Miles to kilometers, live. 1 mile is exactly 1.609344 km — useful for converting a 5K, 10K or marathon pace on the fly.',
      },
      ko: {
        title: '마일 km 변환 — 입력 즉시, 러닝·운전에 유용',
        description:
          '마일을 킬로미터로 입력하는 즉시 변환합니다. 러닝 페이스, 대회 거리, 해외 도로 표지판 환산에 유용하며 광고 없이 바로 결과를 보여줍니다.',
        h1: '마일 km 변환',
        intro: '마일을 킬로미터로 실시간 변환합니다. 1마일은 정확히 1.609344km입니다.',
      },
    },
  },
];

export const meta: ToolMeta = {
  slug: 'length-converter',
  category: 'converter',
  icon: 'convert',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['no-ads', 'usability', 'features'],
  competitors: [
    {
      name: 'RapidTables — CM to Inches Converter',
      url: 'https://www.rapidtables.com/convert/length/cm-to-inch.html',
      weakness:
        'Its cm-to-inch page is fixed to converting cm into inches, with feet+inches only available as an output format there or on a separate "Height converter" page; every other unit pair (feet to cm, inch to feet, mm, km, yard, mile…) is its own standalone URL (e.g. feet-to-cm.html, inch-to-feet.html), so switching which units you compare means multiple page loads. Betterbit lets you pick any of 8 units on both sides of one converter, plus a live feet+inches height field, all on a single page. (Strength: no ads, and shows decimal, fractional and feet+inches output for that one pair.)',
    },
    {
      name: 'TheCalculatorSite — Cm to Inches Converter',
      url: 'https://www.thecalculatorsite.com/conversions/common/cm-inches.php',
      weakness:
        'Results require pressing a "Convert" button and first choosing a "decimal places" dropdown — nothing updates as you type — and a long related-calculators sidebar competes for attention, which is cramped on mobile. Betterbit updates the result and the quick-reference table on every keystroke with no button.',
    },
    {
      name: 'UnitConverters.net — Feet to Meters',
      url: 'https://www.unitconverters.net/length/feet-to-meters.htm',
      weakness:
        'The converter is fixed to one unit pair per URL; converting to millimeters, kilometers, yards or miles means following a separate list of "dozens" of alternate unit pages, and there is no feet+inches composite field anywhere on the feet-to-meters page. Betterbit lets you pick any of 8 units on both sides of a single converter.',
    },
    {
      name: 'devcomma 인치 계산기',
      url: 'https://tools.devcomma.com/calculators/inch',
      weakness:
        '배너 광고와 쿠팡 파트너스 제휴 링크가 페이지에 포함되어 있고, 센티미터·인치 두 필드만 제공해 피트+인치(예: 5\'7") 조합 입력은 지원하지 않으며 FAQ 텍스트로만 환산법을 설명한다. Betterbit는 광고 없이 피트+인치 입력 필드를 변환기에 바로 포함한다.',
    },
    {
      name: 'enolasoft 센티미터-인치 변환 계산기',
      url: 'https://enolasoft.com/centimeter.php',
      weakness:
        '부동산 게임, 투두리스트 앱 등 플로팅 배너 광고가 여러 개 떠 있고, "계산하기" 버튼을 눌러야 결과가 나오며(실시간 아님), 1cm~400cm 400행짜리 고정 표를 스크롤해서 원하는 값을 찾아야 한다. Betterbit는 광고 없이 입력 즉시 결과가 바뀌고, 표는 현재 선택한 단위에 맞는 실제로 자주 찾는 값만 보여준다.',
    },
    {
      name: 'sunavin 인치·피트·센티미터 변환표',
      url: 'https://www.sunavin.com/inches-feet-and-centimeters-conversion-table/',
      weakness:
        '피트+인치 조합 변환이 메인 변환기와 분리된 "Combined Unit Conversion" 섹션과 정적 표로만 제공되어, 하나의 입력창에서 cm·m·km·인치·피트 등 다른 단위로 바로 전환할 수 없다. Betterbit는 같은 패널에서 단위를 바로 바꾸고 키(피트+인치) 변환도 함께 보여준다. (Strength: 변환표를 PDF/JPG로 내려받을 수 있다.)',
    },
  ],
  related: [
    'bmi-calculator',
    'time-zone-converter',
    'scientific-calculator',
    'percentage-calculator',
    'weight-converter',
    'temperature-converter',
  ],
  variants,
};
