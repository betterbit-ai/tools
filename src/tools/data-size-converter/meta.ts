import type { ToolMeta, ToolVariant } from '../types';

const variants: ToolVariant[] = [
  {
    slug: 'mb-to-gb',
    preset: { from: 'MB', to: 'GB', value: 1000 },
    content: {
      en: {
        title: 'MB to GB Converter — SI and IEC Results Together',
        description:
          'Convert MB to GB instantly. 1,000 MB is exactly 1 GB; compare its 1,024-based MiB/GiB equivalent alongside it with no Convert button.',
        h1: 'MB to GB Converter',
        intro:
          'Convert megabytes to gigabytes live. 1,000 MB equals exactly 1 GB; the same byte total is about 0.9313 GiB in the separate IEC binary system.',
      },
      ko: {
        title: 'MB GB 변환 — 1000·1024 기준을 함께 비교',
        description:
          'MB를 GB로 입력 즉시 변환합니다. 1,000MB는 정확히 1GB이며, 같은 용량의 MiB·GiB 기준도 변환 버튼 없이 함께 확인합니다.',
        h1: 'MB GB 변환',
        intro:
          '메가바이트를 기가바이트로 실시간 변환합니다. 1,000MB는 정확히 1GB이고, 같은 바이트 수는 별도의 IEC 이진 단위로 약 0.9313GiB입니다.',
      },
    },
  },
  {
    slug: 'gb-to-mb',
    preset: { from: 'GB', to: 'MB', value: 1 },
    content: {
      en: {
        title: 'GB to MB Converter — SI and IEC Results Together',
        description:
          'Convert GB to MB instantly. 1 GB is exactly 1,000 MB, while the same bytes are about 0.9313 GiB in the binary IEC system.',
        h1: 'GB to MB Converter',
        intro:
          'Convert gigabytes to megabytes live. One decimal GB is exactly 1,000 MB; compare the clearly labelled IEC binary equivalent below.',
      },
      ko: {
        title: 'GB MB 변환 — 1000·1024 기준을 함께 비교',
        description:
          'GB를 MB로 입력 즉시 변환합니다. 1GB는 정확히 1,000MB이며, 같은 바이트 수의 GiB 기준도 한 화면에서 확인할 수 있습니다.',
        h1: 'GB MB 변환',
        intro:
          '기가바이트를 메가바이트로 실시간 변환합니다. 십진 1GB는 정확히 1,000MB이며, 아래에서 IEC 이진 단위의 같은 용량도 확인할 수 있습니다.',
      },
    },
  },
];

export const meta: ToolMeta = {
  slug: 'data-size-converter',
  category: 'converter',
  icon: 'convert',
  added: '2026-10-14',
  updated: '2026-10-14',
  edges: ['usability', 'features', 'accuracy'],
  competitors: [
    {
      name: 'letmecalc — MB to GB Converter',
      url: 'https://letmecalc.com/converters/mb-to-gb',
      weakness:
        'Its MB-to-GB page is a single pair flow: visitors choose a direction and one convention, then receive that convention’s result. It does not expose a full byte-to-PB / KiB-to-PiB unit picker or show both formal systems for an arbitrary input in one result surface. Betterbit accepts every common SI and IEC data-size unit and displays the two systems together. (Strength: it clearly explains the 1,000-versus-1,024 choice and provides long MB-to-GB charts.)',
    },
    {
      name: 'NumberBench — MB to GB Converter',
      url: 'https://numberbench.com/mb-to-gb-converter',
      weakness:
        'Its visible control begins with an MB input and a convention selector, so byte, bit, TB/PB, and explicit MiB/GiB input require another tool or manual conversion; the page footer also discloses affiliate links. Betterbit lets a visitor start with any supported SI or IEC unit and copies a complete, side-by-side result list. (Strength: it shows the alternative convention and a byte total next to its chosen MB-to-GB result.)',
    },
    {
      name: 'FreeSmartCalculator — MB to GB Converter',
      url: 'https://www.freesmartcalculator.com/conversion/mb-to-gb-converter/',
      weakness:
        'Its page describes the binary option as “1 GB = 1,024 MB,” which reuses the decimal GB/MB symbols for a different quantity. Betterbit labels 1,024-based results as MiB and GiB, so 1,024 MB = 1.024 GB and 1,024 MiB = 1 GiB remain distinguishable. (Strength: it offers both directions and a short worked explanation.)',
    },
    {
      name: 'Calcday — 데이터 용량 변환기',
      url: 'https://www.calcday.com/unit/dataSizeConverter.do',
      weakness:
        'Its flow presents a separate “Calculate” button after choosing the value, unit, and 1,024/1,000 base, and the page includes a Google Tag Manager iframe. Betterbit updates as the value or unit changes, has no third-party tracking script, and shows explicitly named SI and IEC results side by side. (Strength: it includes bit through PB and several one-click common conversions.)',
    },
    {
      name: 'ZEKILO — 데이터 용량 변환기',
      url: 'https://zekilo.com/ko/data-size-converter/',
      weakness:
        'Its all-unit output is useful, but the visible input is a single amount and unit rather than a direct source-to-destination conversion; a visitor cannot choose a primary result pair to swap and copy. Betterbit provides that immediate pair conversion while retaining both complete SI and IEC comparisons. (Strength: it already separates the SI and IEC names correctly and explains the drive-capacity example.)',
    },
    {
      name: 'CalcTools — 데이터 용량 변환기',
      url: 'https://calctools.co.kr/unit/data-storage',
      weakness:
        'Its interface asks the visitor to press “계산하기” after selecting the value, input unit, and calculation basis; its page also loads Google Tag Manager. Betterbit has no calculation step or third-party tracking and retains both standards at once rather than making the visitor pick one before calculating. (Strength: it includes a detailed capacity-difference table and bit/byte examples.)',
    },
  ],
  related: ['base64', 'scientific-calculator', 'length-converter', 'number-base-converter'],
  variants,
};
