import type { ToolMeta, ToolVariant } from '../types';

const variants: ToolVariant[] = [
  {
    slug: 'cm-to-inches',
    preset: { from: 'cm', to: 'in', value: 170 },
    content: {
      en: {
        title: 'CM to Inches Converter — Instant, with a Quick Reference Table',
        description:
          'Convert centimeters to inches instantly as you type. No "Convert" button — plus a quick reference table and a feet+inches height converter.',
        h1: 'CM to Inches',
        intro:
          'Centimeters to inches, live as you type. 1 cm = 0.3937 inch, so 1 inch = 2.54 cm exactly — the result and the table below update with every keystroke.',
      },
      ko: {
        title: 'cm 인치 변환 — 입력하는 즉시 결과, 빠른 참조표 포함',
        description:
          'cm를 인치로 입력하는 즉시 변환합니다. "변환" 버튼 없이 바로 결과가 나오고, 빠른 참조표와 피트·인치 키 변환기도 함께 제공합니다.',
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
        title: 'Inches to CM Converter — Instant, With Reference Table',
        description:
          'Convert inches to centimeters instantly, no "Convert" button needed. Includes a quick reference table and a feet+inches to cm height converter.',
        h1: 'Inches to CM',
        intro:
          'Inches to centimeters, updated live. 1 inch is exactly 2.54 cm — type any value and the table below follows along.',
      },
      ko: {
        title: '인치 cm 변환 — 입력 즉시 결과, 참조표 포함',
        description:
          '인치를 cm로 입력하는 즉시 변환합니다. "변환" 버튼 없이 바로 결과를 보여주고, 빠른 참조표와 키(피트·인치) 변환기도 함께 제공합니다.',
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
          'Convert feet to meters instantly as you type, with a quick reference table alongside — no sign-up, no "Convert" button to press.',
        h1: 'Feet to Meters',
        intro: 'Feet to meters, live. 1 foot is exactly 0.3048 meters — the result updates as you type.',
      },
      ko: {
        title: '피트 미터 변환 — 입력 즉시, 빠른 표 포함',
        description:
          '피트를 미터로 입력하는 즉시 변환합니다. 가입 없이 바로 결과가 나오고, 빠른 참조표도 함께 제공합니다.',
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
          'Convert miles to kilometers instantly as you type — handy for pace, race distances and road signs, with a quick reference table.',
        h1: 'Miles to KM',
        intro:
          'Miles to kilometers, live. 1 mile is exactly 1.609344 km — useful for converting a 5K, 10K or marathon pace on the fly.',
      },
      ko: {
        title: '마일 km 변환 — 입력 즉시, 러닝·운전에 유용',
        description:
          '마일을 킬로미터로 입력하는 즉시 변환합니다. 러닝 페이스, 대회 거리, 해외 도로 표지판 환산에 유용합니다.',
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
  updated: '2026-10-19',
  edges: ['usability'],
  competitors: [
    {
      name: 'RapidTables — CM to Inches Converter',
      url: 'https://www.rapidtables.com/convert/length/cm-to-inch.html',
      weakness:
        'Its cm-to-inch page requires using its Convert control and sends many alternative pairs, such as feet-to-cm and miles-to-km, to separate pages. Betterbit keeps eight common units, a live current-unit reference table, and editable feet+inches↔cm height fields in one immediately updating panel. (Strength: it shows the nearest 1/64-inch fraction alongside decimal and feet+inches results.)',
    },
    {
      name: 'LengthConverter.org — Length and Distance Conversion Tool',
      url: 'https://www.lengthconverter.org/',
      weakness:
        'It displays a feet-and-inches result but does not provide editable feet and inches fields for a two-way height conversion; its height output follows the selected general conversion. Betterbit keeps a direct cm↔feet+inches form below the live length result, so a height can be entered from either convention. (Strength: it covers much smaller and larger units, including nano- and micrometres and nautical miles, and offers copy and formula output.)',
    },
    {
      name: 'EverydayCalcPro — Length Converter',
      url: 'https://www.everydaycalcpro.com/calculators/length-converter.php',
      weakness:
        'Its standard, feet+inches, height and fraction inputs are separate modes, and its results do not appear until its Convert button is pressed. Betterbit leaves the general conversion and editable height fields together and updates them on input. (Strength: it supports fractional-inch entry and an all-unit breakdown.)',
    },
  ],
  related: ['weight-converter', 'temperature-converter', 'area-converter', 'volume-converter'],
  variants,
};
