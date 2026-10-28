import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  valueLabel: 'Area',
  fromLabel: 'From',
  toLabel: 'To',
  swap: 'Swap units',
  resultLabel: 'Result in {unit}',
  otherUnitsTitle: 'Also in these units',
  quickTableTitle: 'Quick reference',
  factorHint: 'Results update as you type. The selected units also drive the reference table below.',
  invalidValue: 'Enter a valid number, for example 1,234.5.',
  negativeValue: 'Area cannot be negative.',
  valueTooLarge: 'Enter an area no greater than {max}.',
  unavailableResult: '—',
  copyError: 'Could not copy the results. Select and copy the values manually.',
  autosaved: 'Saved in this browser',
  copy: 'Copy all results',
  copied: 'Copied',
  unitSquareMeter: 'Square metres (m²)',
  unitSquareFoot: 'Square feet (ft²)',
  unitSquareYard: 'Square yards (yd²)',
  unitAcre: 'Acres (ac)',
  unitHectare: 'Hectares (ha)',
  unitPyeong: 'Pyeong (평)',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Area Converter — Sq Ft, m², Acres, Hectares & Pyeong',
    description:
      'Convert square feet, square metres, acres, hectares, square yards and Korean pyeong instantly. See all common area units together, with no Convert button.',
    h1: 'Area Converter',
    tagline:
      'Square feet, square metres, acres, hectares and Korean pyeong — live results for all common area units in one place.',
    name: 'Area Converter',
    keywords: [
      'sq ft to m2',
      'square feet to square meters',
      'm2 to pyeong',
      'pyeong calculator',
      'acre to hectare',
      'area conversion',
      'land area converter',
    ],
    howTo: [
      'Enter the area you have, then choose its unit under From.',
      'Choose the unit you want under To; the result updates immediately.',
      'Use the swap button to reverse the conversion while keeping the displayed result.',
      'Check the other-unit cards and quick reference table to compare the same area in several systems at once.',
    ],
    sections: [
      {
        heading: 'Exact factors for square feet, acres and hectares',
        body: 'This converter uses the international foot: 1 ft = 0.3048 m exactly, so 1 ft² = 0.09290304 m² exactly. One square yard is 9 ft² = 0.83612736 m², and one acre is 43,560 ft² = 4,046.8564224 m². One hectare is exactly 10,000 m², so 1 ha is about 2.47105 acres. These factors follow the NIST Handbook 44 tables for international units; U.S. survey feet are a distinct, rarely used surveying unit and are not mixed in here.',
      },
      {
        heading: 'Pyeong and square metres',
        body: 'One Korean pyeong (평) is exactly 400/121 m², or about 3.305785 m². To convert m² to pyeong, multiply by 121/400 (0.3025); 84 m² is 25.41평. To convert pyeong to m², multiply by 400/121; 34평 is 112.40 m². The familiar 3.3 m² shortcut is useful for a rough mental estimate, but this converter keeps the exact fraction before formatting the result.',
      },
      {
        heading: 'A unit conversion does not change the area basis',
        body: 'A number in a Korean property listing can describe exclusive area, supply area, or contract area. Converting 84 m² gives 25.41평 only for that same 84 m² basis; it does not turn an exclusive-area figure into a marketed “34-pyeong type.” Compare like with like. For a side-by-side exclusive/supply check, use the dedicated Pyeong Calculator linked below.',
      },
    ],
    faq: [
      {
        q: 'How many square metres are 1,000 square feet?',
        a: 'One thousand square feet equal exactly 92.90304 square metres, because 1 ft² equals exactly 0.09290304 m² under the international-foot definition.',
      },
      {
        q: 'How many pyeong is 84 m²?',
        a: 'Eighty-four square metres equal 25.41 pyeong when converted directly: 84 × 121 ÷ 400 = 25.41. The result keeps the original area basis, so 84 m² of exclusive area is still exclusive area after conversion.',
      },
      {
        q: 'How many square metres are in an acre?',
        a: 'One acre equals exactly 4,046.8564224 square metres, or 43,560 square feet. One hectare equals exactly 10,000 square metres and is about 2.47105 acres.',
      },
      {
        q: 'Is a square foot to square metre conversion exact?',
        a: 'Yes, when “foot” means the international foot used here: 1 foot is exactly 0.3048 metre, so 1 square foot is exactly 0.09290304 square metre. The displayed decimal may be rounded, but the calculation keeps the full factor.',
      },
      {
        q: 'Does this area converter save my values?',
        a: 'Your latest value and unit choices are stored only in this browser so a refresh keeps them available. They are not sent to a server, and clearing site data removes them.',
      },
      {
        q: 'Can I paste comma-formatted or Korean full-width numbers?',
        a: 'Yes. The input accepts grouped numbers such as 1,234.5 and full-width digits and punctuation such as １，２３４．５, then converts the numeric value directly.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '넓이 변환기 — 평·㎡·평방피트·에이커 환산',
    description:
      '평, 제곱미터(㎡), 평방피트(ft²), 평방야드, 에이커, 헥타르를 입력 즉시 변환합니다. 변환 버튼 없이 여러 넓이 단위를 한 화면에서 함께 확인하세요.',
    h1: '넓이 변환',
    tagline: '평·㎡·평방피트·에이커·헥타르를 입력하는 즉시 변환하고, 다른 단위 결과도 함께 확인합니다.',
    name: '넓이 변환',
    keywords: [
      '평 계산',
      '평수 계산',
      '제곱미터 평 변환',
      '평방피트 제곱미터 변환',
      'sq ft m2 변환',
      '에이커 헥타르 변환',
      '넓이 단위 변환',
    ],
    howTo: [
      '변환할 넓이를 입력하고, 변환 전 단위를 고르세요.',
      '변환 후 단위를 선택하면 결과가 바로 바뀝니다.',
      '단위 바꾸기 버튼을 누르면 현재 결과를 기준으로 두 단위의 방향을 바꿉니다.',
      '아래의 다른 단위 결과와 빠른 참조표에서 같은 넓이를 여러 기준으로 비교하세요.',
    ],
    sections: [
      {
        heading: '평방피트·에이커·헥타르의 정확한 환산값',
        body: '이 도구는 국제 피트 기준을 사용합니다. 1피트는 정확히 0.3048m이므로 1평방피트(ft²)는 정확히 0.09290304㎡입니다. 1평방야드(yd²)는 9평방피트, 즉 0.83612736㎡이고, 1에이커(ac)는 43,560평방피트, 즉 4,046.8564224㎡입니다. 1헥타르(ha)는 정확히 10,000㎡이며 약 2.47105에이커입니다. 이 값은 NIST Handbook 44의 국제 단위 환산표를 따르며, 별도 측량 단위인 미국 측량피트는 섞지 않습니다.',
      },
      {
        heading: '평과 제곱미터(㎡) 환산',
        body: '1평은 정확히 400/121㎡, 약 3.305785㎡입니다. ㎡를 평으로 바꿀 때는 121/400(0.3025)을 곱하므로 전용 84㎡는 25.41평입니다. 평을 ㎡로 바꿀 때는 400/121을 곱하므로 34평은 112.40㎡입니다. 1평을 3.3㎡로 외우는 방식은 빠른 어림에는 편하지만, 이 도구는 정확한 분수를 끝까지 적용한 뒤 표시할 때만 반올림합니다.',
      },
      {
        heading: '단위 환산과 면적 기준은 다릅니다',
        body: '부동산 매물의 숫자는 전용면적, 공급면적, 계약면적 중 하나를 뜻합니다. 전용 84㎡를 바꾸면 전용 25.41평일 뿐, 공급면적 기준의 “34평형”으로 바뀌는 것은 아닙니다. 같은 기준끼리 비교해야 합니다. 전용·공급면적을 나란히 비교하려면 아래 관련 도구의 평수 계산기를 사용하세요.',
      },
    ],
    faq: [
      {
        q: '1,000평방피트는 몇 ㎡인가요?',
        a: '1,000평방피트는 정확히 92.90304㎡입니다. 국제 피트 기준에서 1평방피트가 정확히 0.09290304㎡이기 때문입니다.',
      },
      {
        q: '84㎡는 몇 평인가요?',
        a: '84㎡는 직접 환산하면 25.41평입니다. 계산식은 84 × 121 ÷ 400 = 25.41이며, 이 값은 입력한 84㎡의 전용·공급 등 면적 기준을 그대로 유지합니다.',
      },
      {
        q: '1에이커는 몇 ㎡인가요?',
        a: '1에이커는 정확히 4,046.8564224㎡이며 43,560평방피트입니다. 1헥타르는 정확히 10,000㎡이고 약 2.47105에이커입니다.',
      },
      {
        q: '평방피트를 제곱미터로 바꾼 값은 정확한가요?',
        a: '네. 이 도구는 국제 피트 1ft = 정확히 0.3048m를 사용하므로 1평방피트 = 정확히 0.09290304㎡입니다. 화면의 소수점 표시는 읽기 좋게 반올림하지만 계산에는 전체 환산값을 사용합니다.',
      },
      {
        q: '입력한 넓이와 단위가 저장되나요?',
        a: '마지막으로 입력한 넓이와 단위는 새로고침 후에도 사용할 수 있도록 이 브라우저에만 저장합니다. 서버로 전송하지 않으며, 브라우저의 사이트 데이터를 지우면 함께 삭제됩니다.',
      },
      {
        q: '쉼표가 있거나 전각 숫자로 된 값을 붙여넣어도 되나요?',
        a: '네. 1,234.5처럼 쉼표가 있는 숫자와 １，２３４．５처럼 전각 숫자·문장부호를 모두 붙여넣을 수 있으며, 숫자값으로 바로 환산합니다.',
      },
    ],
    ui: {
      valueLabel: '넓이',
      fromLabel: '변환할 단위',
      toLabel: '결과 단위',
      swap: '단위 바꾸기',
      resultLabel: '결과 ({unit})',
      otherUnitsTitle: '다른 단위로 보기',
      quickTableTitle: '빠른 참조표',
      factorHint: '값을 입력하면 바로 결과가 바뀌고, 아래 참조표도 선택한 단위에 맞춰 바뀝니다.',
      invalidValue: '1,234.5처럼 올바른 숫자를 입력하세요.',
      negativeValue: '넓이는 음수가 될 수 없습니다.',
      valueTooLarge: '{max} 이하의 넓이를 입력하세요.',
      unavailableResult: '—',
      copyError: '결과를 복사하지 못했습니다. 값을 직접 선택해 복사하세요.',
      autosaved: '이 브라우저에 저장됨',
      copy: '결과 모두 복사',
      copied: '복사됨',
      unitSquareMeter: '제곱미터 (㎡)',
      unitSquareFoot: '평방피트 (ft²)',
      unitSquareYard: '평방야드 (yd²)',
      unitAcre: '에이커 (ac)',
      unitHectare: '헥타르 (ha)',
      unitPyeong: '평',
    },
  },
};
