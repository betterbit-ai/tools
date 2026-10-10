import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  valueLabel: 'Value',
  fromLabel: 'From',
  toLabel: 'To',
  swap: 'Swap units',
  resultLabel: 'Result',
  autosaved: 'Saved automatically',
  quickTableTitle: 'Quick reference',
  heightTitle: 'Height converter (feet & inches ↔ cm)',
  heightFeetLabel: 'Feet',
  heightInchesLabel: 'Inches',
  heightCmLabel: 'Centimeters',
  unitMm: 'Millimeters (mm)',
  unitCm: 'Centimeters (cm)',
  unitM: 'Meters (m)',
  unitKm: 'Kilometers (km)',
  unitIn: 'Inches (in)',
  unitFt: 'Feet (ft)',
  unitYd: 'Yards (yd)',
  unitMi: 'Miles (mi)',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Length Converter — cm to Inches, Feet to Meters & More',
    description:
      'Convert cm, inches, feet, meters, yards, miles, mm and km instantly as you type — no ads, no "Convert" button, plus a quick table and a feet+inches height converter.',
    h1: 'Length Converter',
    tagline: 'cm, inches, feet, meters and more — converted live, with a feet+inches height converter built in.',
    name: 'Length Converter',
    keywords: [
      'cm to inches',
      'inches to cm',
      'feet to meters',
      'meters to feet',
      'miles to km',
      'height converter',
      'length conversion',
      'mm to inches',
    ],
    howTo: [
      'Type a value and pick the units to convert from and to.',
      'Press the swap button to flip the two units instantly.',
      'Check the quick reference table for common values in your chosen units.',
      'Enter a height in feet and inches, or in centimeters, to convert it instantly.',
    ],
    sections: [
      {
        heading: 'Exact conversion factors',
        body: 'This converter uses exact international definitions, not rounded approximations: 1 inch = 2.54 cm, 1 foot = 0.3048 m, 1 yard = 0.9144 m and 1 mile = 1609.344 m, all fixed by the 1959 international yard and pound agreement. Because the factors are exact, results stay accurate whether you convert 0.5 mm or 50,000 km — the error some rounded converters introduce at very small or very large values never appears here.',
      },
      {
        heading: 'Converting a height in feet and inches',
        body: 'A height given in feet and inches converts to centimeters as (feet × 12 + inches) × 2.54. For example, 5 feet 7 inches is (5 × 12 + 7) × 2.54 ≈ 170.18 cm, and 6 feet exactly is 182.88 cm. The height converter below does this both ways live: type feet and inches to get centimeters, or type centimeters to get feet and inches (rounded to the nearest 0.1 inch).',
      },
    ],
    faq: [
      {
        q: 'How many inches is 1 cm?',
        a: 'One centimeter equals exactly 0.3937 inch, since 1 inch is defined as exactly 2.54 cm.',
      },
      {
        q: 'How many cm is 1 foot?',
        a: 'One foot equals exactly 30.48 cm, since 1 foot is defined as exactly 0.3048 meters.',
      },
      {
        q: 'How many km is 1 mile?',
        a: 'One mile equals exactly 1.609344 km — the international definition agreed in 1959 and still used today.',
      },
      {
        q: 'How do I convert my height in feet and inches to centimeters?',
        a: 'Multiply the feet by 12, add the inches, then multiply the total by 2.54. For example, 5 feet 7 inches is (5×12+7)×2.54 ≈ 170.18 cm — the height converter on this page does this instantly as you type.',
      },
      {
        q: 'Is this length converter accurate?',
        a: 'Yes. It uses the exact international definitions (1 inch = 2.54 cm, 1 foot = 0.3048 m, 1 mile = 1609.344 m) rather than rounded approximations, so results stay accurate for both tiny and very large values.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '길이 변환기 — cm 인치, 피트 미터, 마일 km 변환',
    description:
      'cm, 인치, 피트, 미터, 야드, 마일, mm, km까지 입력하는 즉시 변환합니다. 광고와 "변환" 버튼 없이 바로 결과가 나오고, 빠른 참조표와 키(피트·인치) 변환기도 함께 제공합니다.',
    h1: '길이 변환기',
    tagline: 'cm, 인치, 피트, 미터 등을 즉시 변환하고, 키(피트·인치)도 같은 화면에서 바로 바꿔보세요.',
    name: '길이 변환기',
    keywords: [
      'cm 인치 변환',
      '인치 cm 변환',
      '피트 미터 변환',
      '마일 km 변환',
      '키 cm 환산',
      '길이 단위 변환',
      'mm 인치 변환',
    ],
    howTo: [
      '값을 입력하고 변환할 단위와 결과 단위를 선택하세요.',
      '단위 바꾸기 버튼을 누르면 두 단위가 즉시 서로 바뀝니다.',
      '빠른 참조표에서 자주 찾는 값의 변환 결과를 바로 확인하세요.',
      '키를 피트·인치 또는 센티미터로 입력하면 즉시 서로 변환됩니다.',
    ],
    sections: [
      {
        heading: '정확한 변환 비율',
        body: '1인치는 정확히 2.54cm, 1피트는 정확히 0.3048m, 1야드는 정확히 0.9144m, 1마일은 정확히 1.609344km로 정의됩니다. 이 값들은 1959년 국제 야드-파운드 협정에서 정한 정확한 기준이며 반올림된 근사값이 아니기 때문에, 0.5mm처럼 아주 작은 값이나 50,000km처럼 아주 큰 값을 변환해도 오차가 쌓이지 않습니다.',
      },
      {
        heading: '키(피트·인치)를 센티미터로 변환하기',
        body: '피트와 인치로 표시된 키는 (피트×12+인치)×2.54 공식으로 센티미터로 바꿉니다. 예를 들어 5피트 7인치는 (5×12+7)×2.54 ≈ 170.18cm이고, 정확히 6피트는 182.88cm입니다. 아래 키 변환기는 양방향으로 동작해, 피트·인치를 입력하면 cm를, cm를 입력하면 피트·인치(0.1인치 단위로 반올림)를 바로 보여줍니다.',
      },
    ],
    faq: [
      {
        q: '1cm는 몇 인치인가요?',
        a: '1cm는 정확히 0.3937인치입니다. 1인치가 정확히 2.54cm로 정의되기 때문입니다.',
      },
      {
        q: '1피트는 몇 cm인가요?',
        a: '1피트는 정확히 30.48cm입니다. 1피트가 정확히 0.3048미터로 정의되기 때문입니다.',
      },
      {
        q: '1마일은 몇 km인가요?',
        a: '1마일은 정확히 1.609344km입니다. 1959년부터 지금까지 쓰이는 국제 합의 기준입니다.',
      },
      {
        q: '키를 피트·인치에서 센티미터로 어떻게 바꾸나요?',
        a: '피트에 12를 곱하고 인치를 더한 뒤 2.54를 곱합니다. 예를 들어 5피트 7인치는 (5×12+7)×2.54 ≈ 170.18cm이며, 아래 키 변환기가 입력 즉시 이 계산을 대신해 줍니다.',
      },
      {
        q: '이 길이 변환기는 정확한가요?',
        a: '네. 1인치=2.54cm, 1피트=0.3048m, 1마일=1609.344km처럼 반올림 없는 정확한 국제 정의를 사용하므로 아주 작은 값이나 큰 값에서도 오차 없이 정확합니다.',
      },
    ],
    ui: {
      valueLabel: '값',
      fromLabel: '변환할 단위',
      toLabel: '결과 단위',
      swap: '단위 바꾸기',
      resultLabel: '결과',
      autosaved: '자동 저장됨',
      quickTableTitle: '빠른 참조표',
      heightTitle: '키 변환기 (피트·인치 ↔ cm)',
      heightFeetLabel: '피트',
      heightInchesLabel: '인치',
      heightCmLabel: '센티미터',
      unitMm: '밀리미터 (mm)',
      unitCm: '센티미터 (cm)',
      unitM: '미터 (m)',
      unitKm: '킬로미터 (km)',
      unitIn: '인치 (in)',
      unitFt: '피트 (ft)',
      unitYd: '야드 (yd)',
      unitMi: '마일 (mi)',
    },
  },
};
