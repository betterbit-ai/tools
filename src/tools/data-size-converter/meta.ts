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
        sections: [
          {
            heading: 'Decimal GB and binary GiB are different sizes',
            body: 'Storage and network figures use decimal units: 1 GB = 1,000 MB = 1,000,000,000 bytes. Operating systems and many tools report binary units: 1 GiB = 1,024 MiB, and 1 GiB is about 7.37% larger than 1 GB. So 1,000 MB is exactly 1 GB in decimal, while the same byte total is 0.9313 GiB.\n\nThat gap explains why a 500 GB drive shows about 465 GB in a system that reports GiB with a GB label: 500 × 1000³ ÷ 1024³ = 465.7. Neither number is wrong; they count different units. This converter shows both so a size limit given by a host and a size shown by your system can be compared directly.',
            table: {
              caption: 'Megabytes in decimal and binary units',
              head: ['Megabytes (MB)', 'Gigabytes (GB)', 'Gibibytes (GiB)'],
              rows: [
                ['500', '0.5', '0.46'],
                ['1,000', '1', '0.93'],
                ['2,000', '2', '1.86'],
                ['5,000', '5', '4.66'],
                ['10,000', '10', '9.31'],
                ['50,000', '50', '46.57'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'Is 1,000 MB exactly 1 GB?',
            a: 'Yes in decimal units: 1 GB is 1,000 MB and the storage industry counts this way. In binary units the same 1,000 MB is 0.9313 GiB, which is what many operating systems display.',
          },
          {
            q: 'Why does a 500 GB drive show 465 GB?',
            a: 'Because the drive holds 500,000,000,000 bytes. Dividing by 1024³ instead of 1000³ gives 465.7 GiB, and systems that label GiB as GB show that smaller number. No space is missing.',
          },
          {
            q: 'Which unit should I use for an upload limit?',
            a: 'Use whatever the service states. Hosts usually mean decimal MB and GB, so when a limit says 1 GB a 1,000 MB file just fits and a 1,024 MB file does not.',
          },
        ],
      },
      ko: {
        title: 'MB GB 변환 — 1000·1024 기준을 함께 비교',
        description:
          'MB를 GB로 입력 즉시 변환합니다. 1,000MB는 정확히 1GB이며, 같은 용량의 MiB·GiB 기준도 변환 버튼 없이 함께 확인합니다.',
        h1: 'MB GB 변환',
        intro:
          '메가바이트를 기가바이트로 실시간 변환합니다. 1,000MB는 정확히 1GB이고, 같은 바이트 수는 별도의 IEC 이진 단위로 약 0.9313GiB입니다.',
        sections: [
          {
            heading: '십진 GB와 이진 GiB는 크기가 다릅니다',
            body: '저장장치와 통신 용량은 십진 단위를 씁니다. 1GB는 1,000MB, 즉 1,000,000,000바이트입니다. 운영체제와 일부 도구는 이진 단위를 쓰는데, 1GiB는 1,024MiB이고 1GiB는 1GB보다 약 7.37% 큽니다. 그래서 1,000MB는 십진 기준으로 정확히 1GB지만, 같은 바이트 수는 0.9313GiB입니다.\n\n500GB 드라이브가 운영체제에서 465GB로 보이는 이유가 여기 있습니다. 500 × 1000³ ÷ 1024³ = 465.7이고, GiB를 GB로 표기하는 시스템이 그 작은 숫자를 보여 줍니다. 어느 쪽도 틀리지 않았고 단위가 다를 뿐입니다. 이 변환기는 두 값을 함께 보여 주어 호스팅의 용량 제한과 내 컴퓨터의 표시를 바로 비교할 수 있게 합니다.',
            table: {
              caption: 'MB를 십진·이진 단위로',
              head: ['메가바이트 (MB)', '기가바이트 (GB)', '기비바이트 (GiB)'],
              rows: [
                ['500', '0.5', '0.46'],
                ['1,000', '1', '0.93'],
                ['2,000', '2', '1.86'],
                ['5,000', '5', '4.66'],
                ['10,000', '10', '9.31'],
                ['50,000', '50', '46.57'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '1,000MB는 정확히 1GB인가요?',
            a: '십진 기준으로는 맞습니다. 저장장치 업계가 이렇게 셉니다. 이진 단위로는 같은 1,000MB가 0.9313GiB이고, 운영체제가 보여 주는 값이 이것입니다.',
          },
          {
            q: '500GB 드라이브가 왜 465GB로 보이나요?',
            a: '드라이브가 500,000,000,000바이트인데, 1000³ 대신 1024³으로 나누면 465.7GiB가 되기 때문입니다. GiB를 GB로 표시하는 시스템에서 그렇게 보이며, 공간이 사라진 것은 아닙니다.',
          },
          {
            q: '업로드 제한에는 어떤 단위를 써야 하나요?',
            a: '서비스가 적은 단위를 그대로 쓰세요. 보통 십진 MB·GB이므로 1GB 제한이면 1,000MB 파일은 들어가고 1,024MB 파일은 들어가지 않습니다.',
          },
        ],
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
        sections: [
          {
            heading: 'Multiplying GB to MB, in both unit systems',
            body: 'One decimal gigabyte is exactly 1,000 megabytes, so 2 GB is 2,000 MB and 0.5 GB is 500 MB. In binary units one GiB is 1,024 MiB, so 1 GiB is 1,024 MiB while 1 GB of actual bytes is only 953.7 MiB — the two ratios are easy to mix up, which is why the decimal and binary columns appear separately.\n\nMobile data plans, cloud quotas and upload limits are almost always decimal. A 5 GB plan is 5,000 MB, not 4.88 GB, even though a file manager may show the same allowance as 4.66 GiB. Pick the unit the service uses before comparing figures.',
            table: {
              caption: 'Gigabytes in decimal and binary units',
              head: ['Gigabytes (GB)', 'Megabytes (MB)', 'Mebibytes (MiB)'],
              rows: [
                ['0.5', '500', '488.28'],
                ['1', '1,000', '953.67'],
                ['2', '2,000', '1,907.35'],
                ['8', '8,000', '7,629.39'],
                ['32', '32,000', '30,517.58'],
                ['128', '128,000', '122,070.31'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How many MB is 1 GB?',
            a: '1,000 MB in decimal units, which is how data plans and storage are sold. One GiB, the binary unit, is 1,024 MiB.',
          },
          {
            q: 'How many MB is a 5 GB data plan?',
            a: '5,000 MB. Data plans are decimal, so 5 GB is five thousand megabytes even if the phone shows the same allowance as 4.66 GiB.',
          },
          {
            q: 'Why do the decimal and binary answers differ by 7.4%?',
            a: 'Because 1,024 is 2.4% larger than 1,000 and the difference compounds at each step. A GB against a GiB is 7.37% apart, so 1 GB is 0.9313 GiB.',
          },
        ],
      },
      ko: {
        title: 'GB MB 변환 — 1000·1024 기준을 함께 비교',
        description:
          'GB를 MB로 입력 즉시 변환합니다. 1GB는 정확히 1,000MB이며, 같은 바이트 수의 GiB 기준도 한 화면에서 확인할 수 있습니다.',
        h1: 'GB MB 변환',
        intro:
          '기가바이트를 메가바이트로 실시간 변환합니다. 십진 1GB는 정확히 1,000MB이며, 아래에서 IEC 이진 단위의 같은 용량도 확인할 수 있습니다.',
        sections: [
          {
            heading: 'GB를 MB로, 두 단위 체계에서',
            body: '십진 기준으로 1GB는 정확히 1,000MB이므로 2GB는 2,000MB, 0.5GB는 500MB입니다. 이진 단위에서는 1GiB가 1,024MiB여서, 1GB라는 표기가 1,024MiB를 뜻할 때와 실제 바이트가 953.7MiB일 때의 값이 다릅니다. 두 비율이 섞이기 쉬워 변환기가 십진·이진 열을 따로 보여 줍니다.\n\n모바일 데이터 요금제, 클라우드 할당량, 업로드 제한은 거의 항상 십진입니다. 5GB 요금제는 5,000MB이고 4.88GB가 아니며, 휴대폰이 같은 양을 4.66GiB로 보여 줄 수 있습니다. 비교하기 전에 서비스가 쓰는 단위를 먼저 정하세요.',
            table: {
              caption: 'GB를 십진·이진 단위로',
              head: ['기가바이트 (GB)', '메가바이트 (MB)', '메비바이트 (MiB)'],
              rows: [
                ['0.5', '500', '488.28'],
                ['1', '1,000', '953.67'],
                ['2', '2,000', '1,907.35'],
                ['8', '8,000', '7,629.39'],
                ['32', '32,000', '30,517.58'],
                ['128', '128,000', '122,070.31'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '1GB는 몇 MB인가요?',
            a: '십진 기준 1,000MB입니다. 요금제와 저장장치가 이 기준을 씁니다. 이진 단위인 1GiB는 1,024MiB입니다.',
          },
          {
            q: '5GB 요금제는 몇 MB인가요?',
            a: '5,000MB입니다. 요금제는 십진 기준이므로, 휴대폰이 같은 양을 4.66GiB로 보여 주더라도 5GB는 5,000MB입니다.',
          },
          {
            q: '두 값이 7.4% 차이 나는 이유는?',
            a: '1,024가 1,000보다 2.4% 크고 그 차이가 단계마다 누적되기 때문입니다. GB와 GiB는 7.37% 차이라 1GB는 0.9313GiB입니다.',
          },
        ],
      },
    },
  },
];

export const meta: ToolMeta = {
  slug: 'data-size-converter',
  category: 'converter',
  icon: 'convert',
  added: '2026-10-14',
  updated: '2026-11-26',
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
