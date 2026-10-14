import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  valueLabel: 'Data size',
  fromLabel: 'From',
  toLabel: 'Result unit',
  swap: 'Swap units',
  resultLabel: 'Result ({unit})',
  factorHint: 'Results update as you type. MB/GB and MiB/GiB stay separately labelled.',
  autosaved: 'Saved in this browser',
  copy: 'Copy all results',
  copied: 'Copied',
  comparisonTitle: 'Decimal and binary results',
  comparisonHint: 'Both columns describe the same number of bytes; only the unit system changes.',
  decimalTitle: 'Decimal (SI)',
  decimalHint: 'Each step is × 1,000: kB, MB, GB, TB, PB.',
  binaryTitle: 'Binary (IEC)',
  binaryHint: 'Each step is × 1,024: KiB, MiB, GiB, TiB, PiB.',
  bitsLabel: 'Bits (bit)',
  bytesLabel: 'Bytes (B)',
  unitBit: 'Bits (bit)',
  unitByte: 'Bytes (B)',
  unitKilobyte: 'Kilobytes (kB, 1,000 B)',
  unitMegabyte: 'Megabytes (MB, 1,000,000 B)',
  unitGigabyte: 'Gigabytes (GB, 1,000,000,000 B)',
  unitTerabyte: 'Terabytes (TB, 10¹² B)',
  unitPetabyte: 'Petabytes (PB, 10¹⁵ B)',
  unitKibibyte: 'Kibibytes (KiB, 1,024 B)',
  unitMebibyte: 'Mebibytes (MiB, 1,024² B)',
  unitGibibyte: 'Gibibytes (GiB, 1,024³ B)',
  unitTebibyte: 'Tebibytes (TiB, 1,024⁴ B)',
  unitPebibyte: 'Pebibytes (PiB, 1,024⁵ B)',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Data Size Converter — MB, GB, MiB & GiB Compared',
    description:
      'Convert MB to GB, bytes, TB, MiB and GiB instantly. Compare the exact 1,000-based SI and 1,024-based IEC values side by side, with no Convert button.',
    h1: 'Data Size Converter',
    tagline: 'Convert MB, GB, TB, MiB and GiB live — with decimal and binary units clearly separated side by side.',
    name: 'Data Size Converter',
    keywords: [
      'mb to gb',
      'gb to mb',
      'data size converter',
      'file size converter',
      'bytes to mb',
      'gb to gib',
      'mb to mib',
      'storage converter',
    ],
    howTo: [
      'Enter a data size and choose the unit it is written in.',
      'Choose a result unit to see that exact conversion at the top.',
      'Compare the SI and IEC columns below to see both 1,000- and 1,024-based readings for the same bytes.',
      'Use Copy all results when you need the values in another app.',
    ],
    sections: [
      {
        heading: 'MB to GB: divide by 1,000 when the symbols are MB and GB',
        body: 'The SI prefixes in MB and GB are decimal: 1 MB = 1,000,000 bytes and 1 GB = 1,000,000,000 bytes. Therefore 1,000 MB = 1 GB, while 1,024 MB = 1.024 GB. Storage makers, cloud plans, and data-transfer specifications commonly use these decimal symbols. This converter keeps that definition intact instead of treating MB and GB as 1,024-based units.',
      },
      {
        heading: 'MiB and GiB are the 1,024-based names',
        body: 'IEC binary prefixes remove the ambiguity: 1 KiB = 1,024 bytes, 1 MiB = 1,024 KiB = 1,048,576 bytes, and 1 GiB = 1,024 MiB = 1,073,741,824 bytes. So 1,024 MiB = 1 GiB. A 1 TB decimal drive contains 1,000,000,000,000 bytes, which is about 931.32 GiB; no capacity disappeared—the unit name changed.',
      },
      {
        heading: 'Bits are not bytes',
        body: 'A byte is exactly 8 bits. A lower-case b means bit; an upper-case B means byte. For example, 100 Mbps is 100 megabits per second, which corresponds to at most 12.5 MB/s before protocol overhead. Use bit for transfer rates such as Mbps and byte-based units for files and storage capacity.',
      },
    ],
    faq: [
      {
        q: 'How many MB are in 1 GB?',
        a: 'One gigabyte is exactly 1,000 megabytes when the symbols are the decimal SI units GB and MB. The separate binary relation is 1 GiB = 1,024 MiB.',
      },
      {
        q: 'Is 1024 MB equal to 1 GB?',
        a: 'No under the formal SI symbols: 1,024 MB equals 1.024 GB. The 1,024-based identity is 1,024 MiB = 1 GiB, where the “i” identifies the binary IEC unit.',
      },
      {
        q: 'Why does a 1 TB drive show about 931 GiB?',
        a: 'A 1 TB drive contains 1,000,000,000,000 bytes by its decimal label. Dividing that same byte count by 1,073,741,824 bytes per GiB gives about 931.32 GiB, so the different number is a unit conversion rather than missing storage.',
      },
      {
        q: 'How many bits are in a byte?',
        a: 'One byte is exactly 8 bits. This means a 1 GB decimal file contains 8 Gb, and a 100 Mbps connection has a theoretical raw maximum of 12.5 MB per second.',
      },
      {
        q: 'Does this data-size converter save my input?',
        a: 'The latest value and unit choices are stored only in this browser so they survive a refresh. They are never sent to a server, and clearing this site’s data removes them.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '데이터 용량 변환기 — MB·GB와 MiB·GiB 비교',
    description:
      'MB·GB·TB와 MiB·GiB를 입력 즉시 변환합니다. 1000 기준 SI와 1024 기준 IEC 값을 한 화면에서 정확한 단위명으로 함께 비교하며 변환 버튼이 필요 없습니다.',
    h1: '데이터 용량 변환',
    tagline: 'MB·GB·TB와 MiB·GiB를 바로 변환하고, 1000·1024 기준의 차이를 단위명까지 정확하게 비교합니다.',
    name: '데이터 용량 변환',
    keywords: [
      '용량 변환',
      '데이터 용량 변환',
      'MB GB 변환',
      'GB MB 변환',
      '메가바이트 기가바이트 변환',
      '파일 용량 변환',
      'GiB GB 차이',
      '바이트 변환',
    ],
    howTo: [
      '용량을 입력하고 현재 표기에 쓰인 단위를 고르세요.',
      '결과 단위를 선택하면 해당 단위의 환산값이 바로 표시됩니다.',
      '아래 SI·IEC 표에서 같은 바이트 수를 1000·1024 기준으로 함께 비교하세요.',
      '다른 앱에 붙여 넣을 값이 필요하면 전체 결과 복사를 누르세요.',
    ],
    sections: [
      {
        heading: 'MB를 GB로 바꿀 때는 1,000으로 나눕니다',
        body: 'MB와 GB는 SI 십진 접두어입니다. 1MB는 1,000,000바이트, 1GB는 1,000,000,000바이트이므로 1,000MB = 1GB입니다. 따라서 1,024MB는 1.024GB입니다. SSD·하드디스크 제조사 표기, 클라우드 요금제, 데이터 전송량처럼 MB·GB 기호를 쓰는 표기는 이 십진 기준으로 읽는 것이 정확합니다.',
      },
      {
        heading: '1,024 기준은 MiB·GiB로 구분합니다',
        body: 'IEC 이진 접두어는 1,024배 단위를 분명히 적습니다. 1KiB = 1,024B, 1MiB = 1,024KiB = 1,048,576B, 1GiB = 1,024MiB = 1,073,741,824B입니다. 즉 1,024MiB = 1GiB입니다. 1TB 저장장치의 1,000,000,000,000바이트는 약 931.32GiB로도 표시되지만, 용량이 줄어든 것이 아니라 단위가 달라진 것입니다.',
      },
      {
        heading: 'bit와 B는 다릅니다',
        body: '1바이트(B)는 정확히 8비트(bit)입니다. 소문자 b는 비트, 대문자 B는 바이트를 뜻합니다. 예를 들어 100Mbps 인터넷은 초당 100메가비트이므로 이론상 최대 12.5MB/s입니다. 인터넷 속도는 보통 Mbps처럼 비트로, 파일과 저장공간은 MB·GB처럼 바이트로 표시합니다.',
      },
    ],
    faq: [
      {
        q: '1GB는 몇 MB인가요?',
        a: 'SI 십진 단위에서 1GB는 정확히 1,000MB입니다. 1,024 기준 이진 단위의 정확한 표기는 1GiB = 1,024MiB입니다.',
      },
      {
        q: '1,024MB가 1GB인가요?',
        a: 'MB·GB의 SI 표기에서는 아닙니다. 1,024MB는 1.024GB이고, 1,024MiB가 정확히 1GiB입니다. i가 들어간 MiB·GiB가 1,024 기준 단위입니다.',
      },
      {
        q: '1TB SSD가 약 931GiB로 보이는 이유는 무엇인가요?',
        a: '1TB SSD의 십진 표기는 1,000,000,000,000바이트입니다. 이를 1GiB당 1,073,741,824바이트로 나누면 약 931.32GiB이므로, 숫자의 차이는 저장공간 손실이 아니라 단위 차이입니다.',
      },
      {
        q: '1바이트는 몇 비트인가요?',
        a: '1바이트는 정확히 8비트입니다. 따라서 1GB 십진 파일은 8Gb이고, 100Mbps 회선의 이론상 원시 전송량은 초당 12.5MB입니다.',
      },
      {
        q: '입력한 용량이 저장되나요?',
        a: '마지막으로 입력한 용량과 단위는 새로고침 후에도 쓸 수 있도록 이 브라우저에만 저장합니다. 서버로 전송하지 않으며, 브라우저에서 사이트 데이터를 지우면 함께 삭제됩니다.',
      },
    ],
    ui: {
      valueLabel: '용량',
      fromLabel: '변환할 단위',
      toLabel: '결과 단위',
      swap: '단위 바꾸기',
      resultLabel: '결과 ({unit})',
      factorHint: '입력 즉시 결과가 바뀝니다. MB·GB와 MiB·GiB는 서로 다른 단위명으로 표시합니다.',
      autosaved: '이 브라우저에 저장됨',
      copy: '전체 결과 복사',
      copied: '복사됨',
      comparisonTitle: '1000·1024 기준 함께 보기',
      comparisonHint: '두 표는 같은 바이트 수를 표시하며, 달라지는 것은 단위 체계뿐입니다.',
      decimalTitle: '십진 (SI)',
      decimalHint: '단계마다 1,000배: kB, MB, GB, TB, PB',
      binaryTitle: '이진 (IEC)',
      binaryHint: '단계마다 1,024배: KiB, MiB, GiB, TiB, PiB',
      bitsLabel: '비트 (bit)',
      bytesLabel: '바이트 (B)',
      unitBit: '비트 (bit)',
      unitByte: '바이트 (B)',
      unitKilobyte: '킬로바이트 (kB, 1,000B)',
      unitMegabyte: '메가바이트 (MB, 1,000,000B)',
      unitGigabyte: '기가바이트 (GB, 1,000,000,000B)',
      unitTerabyte: '테라바이트 (TB, 10¹²B)',
      unitPetabyte: '페타바이트 (PB, 10¹⁵B)',
      unitKibibyte: '키비바이트 (KiB, 1,024B)',
      unitMebibyte: '메비바이트 (MiB, 1,024²B)',
      unitGibibyte: '기비바이트 (GiB, 1,024³B)',
      unitTebibyte: '테비바이트 (TiB, 1,024⁴B)',
      unitPebibyte: '페비바이트 (PiB, 1,024⁵B)',
    },
  },
};
