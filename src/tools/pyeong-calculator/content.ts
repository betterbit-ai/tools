import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  intro: 'Convert pyeong and square metres, then compare exclusive and supply area on the same basis.',
  autosaved: 'Values stay in this browser',
  unitLabel: 'Unit you have',
  squareMeters: 'Square metres (㎡)',
  pyeong: 'Pyeong (평)',
  basisLabel: 'Area basis',
  basisHint: 'A conversion changes units only; it does not change which area the number describes.',
  exclusive: 'Exclusive area',
  supply: 'Supply area',
  valueLabel: 'Area to convert',
  valueHint: 'Enter 0 to 1,000,000,000,000. Decimals are allowed.',
  resultsHeading: 'Converted area',
  squareMetersResult: 'Square metres',
  pyeongResult: 'Pyeong',
  basisResult: 'Basis used',
  exactFactor: 'Exact factor: 1 pyeong = 400 ÷ 121㎡ = 3.305785…㎡',
  squareMetersFormula: '{value}㎡ × 121 ÷ 400 = {result}평',
  pyeongFormula: '{value}평 × 400 ÷ 121 = {result}㎡',
  exclusiveNotice:
    'This is an exclusive-area conversion. It describes the space inside the home, not the larger marketed supply-area type.',
  supplyNotice:
    'This is a supply-area conversion. It includes the exclusive area plus shared residential space, so compare it only with another supply-area figure.',
  comparisonTitle: 'Compare exclusive and supply area',
  comparisonHint:
    'Enter both figures exactly as the listing states them. This calculator does not estimate one from the other.',
  exclusiveInput: 'Exclusive area (㎡)',
  supplyInput: 'Supply area (㎡)',
  exclusivePyeong: 'Exclusive area (평)',
  supplyPyeong: 'Supply area (평)',
  exclusiveRatio: 'Exclusive-area ratio',
  commonArea: 'Shared residential area',
  comparisonNotice:
    'The same listing can therefore read {exclusive}평 exclusive and {supply}평 supply. The difference is shared residential area, not an extra unit conversion.',
  invalidInput: 'Enter a number from 0 to 1,000,000,000,000.',
  invalidComparison: 'Supply area must be greater than or equal to exclusive area, and supply area cannot be zero.',
  copy: 'Copy results',
  copied: 'Copied',
  reset: 'Reset',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Pyeong Calculator — Compare Exclusive & Supply Area',
    description:
      'Convert pyeong and square metres instantly with the exact 400/121㎡ factor, then compare a Korean listing’s exclusive and supply area side by side — no ads.',
    h1: 'Pyeong Calculator',
    tagline:
      'Convert ㎡ and 평 instantly, then put exclusive and supply area side by side so a listing’s two pyeong figures do not get mixed up.',
    name: 'Pyeong Calculator',
    keywords: [
      'pyeong calculator',
      'square meters to pyeong',
      'pyeong to square meters',
      'Korean apartment size calculator',
      'exclusive area supply area',
      '평 제곱미터',
    ],
    howTo: [
      'Choose whether the number you have is in square metres or pyeong, then enter the area to see both units immediately.',
      'Mark the result as exclusive area or supply area so you keep the listing’s area basis visible while converting.',
      'When a listing gives both figures, enter its exclusive and supply square metres in the comparison fields below.',
      'Compare like with like: use exclusive-area figures to compare living space, and supply-area figures to compare advertised unit types.',
    ],
    sections: [
      {
        heading: 'The exact pyeong conversion is 400/121 square metres',
        body: 'One pyeong is exactly 400/121 square metres, which is approximately 3.305785㎡. Convert square metres to pyeong by multiplying by 121/400 (0.3025), and convert pyeong to square metres by multiplying by 400/121. For example, 84㎡ × 121 ÷ 400 = 25.41평; 34평 × 400 ÷ 121 = 112.40㎡. The common mental shortcut of 3.3㎡ per pyeong is close, but the difference grows with larger areas, so this calculator keeps the exact fraction before displaying rounded results.',
      },
      {
        heading: 'Exclusive area and supply area are different measurements',
        body: 'Exclusive area (전용면적) is the private area inside a home, such as rooms, living room, kitchen, and bathrooms. Supply area (공급면적) adds the home’s share of residential common space such as corridors, stairs, and elevator halls. Changing 84㎡ to 25.41평 preserves the fact that it is 84㎡ of exclusive area; it does not turn it into the supply-area pyeong type used in an advertisement. The two editable fields in this tool deliberately keep both bases visible rather than estimating one from the other.',
      },
      {
        heading: 'Why an 84㎡ home can be described with two pyeong figures',
        body: 'An exclusive area of 84㎡ converts directly to 25.41평. A building may market that home as a larger supply-area type because the supply figure includes shared residential area. The supply area and exclusive-area ratio differ by building, layout, and housing type, so a direct conversion of 84㎡ cannot prove that every home is a particular supply-area type. Enter the supply number printed on the listing or contract, then compare both results on the same screen. For a contract, tax, or eligibility decision, use the registered area and the applicable official documents.',
      },
    ],
    faq: [
      {
        q: 'How many pyeong is 84 square metres?',
        a: '84㎡ is exactly 25.41평 when it is converted directly: 84 × 121 ÷ 400 = 25.41. That result keeps the same area basis, so 84㎡ of exclusive area is 25.41평 of exclusive area rather than a supply-area apartment type.',
      },
      {
        q: 'How many square metres are in one pyeong?',
        a: 'One pyeong is exactly 400/121㎡, approximately 3.305785㎡. The reverse conversion is exactly 121/400평 per square metre, or 0.3025평 per ㎡.',
      },
      {
        q: 'Why does an 84㎡ apartment sometimes get called a 34-pyeong type?',
        a: '84㎡ is about 25.41평 of exclusive area, while a marketed pyeong type may use the larger supply area that includes shared residential space. The supply figure varies by building, so confirm the separate exclusive and supply figures on the listing instead of converting one number and treating it as the other.',
      },
      {
        q: 'What is the difference between exclusive area and supply area in a Korean apartment listing?',
        a: 'Exclusive area is the private interior space inside the home. Supply area is exclusive area plus the household’s share of common residential spaces such as halls, corridors, and stairs. They must be compared on the same basis because the supply figure is normally larger.',
      },
      {
        q: 'Does this pyeong calculator send a property size to a server?',
        a: 'No. The conversion and exclusive-versus-supply comparison run in the browser. The current values are saved only in that browser so the calculator can restore them, and they are not sent to a server.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '평수 계산기 — 전용·공급면적 비교와 ㎡ 환산',
    description:
      '평과 제곱미터를 정확한 400/121㎡ 기준으로 즉시 환산하고, 매물의 전용면적·공급면적을 나란히 비교합니다. 광고 없이 브라우저에서 계산합니다.',
    h1: '평수 계산기',
    tagline: '평·㎡를 바로 환산하고, 전용면적과 공급면적을 함께 비교해 같은 집의 서로 다른 평수 표기를 구분합니다.',
    name: '평수 계산기',
    keywords: ['평수 계산기', '평 제곱미터', '평수 ㎡ 변환', '제곱미터 평수 계산', '84㎡ 몇평', '전용면적 공급면적'],
    howTo: [
      '가지고 있는 숫자의 단위를 평 또는 제곱미터로 고르고 면적을 입력하면 두 단위가 바로 표시됩니다.',
      '입력한 숫자가 전용면적인지 공급면적인지 선택해 환산 결과의 기준을 함께 확인합니다.',
      '매물에 전용·공급면적이 모두 적혀 있다면 아래 비교 입력란에 각각 제곱미터 값을 넣습니다.',
      '실제 생활 공간은 전용면적끼리, 광고 평형은 공급면적끼리처럼 같은 기준끼리 비교합니다.',
    ],
    sections: [
      {
        heading: '1평은 정확히 400/121㎡입니다',
        body: '1평은 정확히 400/121㎡, 약 3.305785㎡입니다. 제곱미터를 평으로 바꿀 때는 121/400(0.3025)을 곱하고, 평을 제곱미터로 바꿀 때는 400/121을 곱합니다. 예를 들어 84㎡ × 121 ÷ 400 = 25.41평이고, 34평 × 400 ÷ 121 = 112.40㎡입니다. 1평을 3.3㎡로 잡는 암산은 편하지만 면적이 커질수록 차이가 누적되므로 이 계산기는 정확한 분수 비율로 계산한 뒤 화면에 반올림해 표시합니다.',
      },
      {
        heading: '전용면적과 공급면적은 단위가 아니라 기준의 차이입니다',
        body: '전용면적은 현관문 안쪽의 방·거실·주방·화장실 등 세대가 단독으로 쓰는 면적입니다. 공급면적은 전용면적에 복도·계단·엘리베이터 홀 같은 주거공용면적을 더한 값입니다. 전용 84㎡를 25.41평으로 바꾸어도 전용면적이라는 기준은 변하지 않으며, 이를 광고의 공급 평형으로 바꾸는 것은 아닙니다. 이 도구는 한쪽을 추정하지 않고 매물에 적힌 두 값을 직접 나란히 보여 줍니다.',
      },
      {
        heading: '전용 84㎡가 25평이면서 34평형으로 불리는 이유',
        body: '전용 84㎡를 그대로 환산하면 25.41평입니다. 하지만 아파트 광고의 평형은 공용 부분을 포함한 공급면적을 기준으로 부르는 경우가 있어 더 큰 숫자가 함께 쓰입니다. 공급면적과 전용률은 단지·동·평면·주택 유형마다 달라 전용 84㎡ 하나만으로 특정 공급 평형을 확정할 수 없습니다. 계약서나 매물에 적힌 공급면적을 직접 입력해 두 기준을 비교하고, 계약·세금·청약 판단에는 등기·공고 등 공식 서류의 면적을 확인해야 합니다.',
      },
    ],
    faq: [
      {
        q: '84㎡는 몇 평인가요?',
        a: '84㎡는 84 × 121 ÷ 400으로 계산해 정확히 25.41평입니다. 매물의 84㎡가 전용면적이라면 결과도 전용 25.41평이며, 공급면적 기준의 평형을 뜻하지는 않습니다.',
      },
      {
        q: '1평은 몇 제곱미터인가요?',
        a: '1평은 정확히 400/121㎡, 약 3.305785㎡입니다. 반대로 1㎡는 정확히 121/400평, 즉 0.3025평입니다.',
      },
      {
        q: '전용 84㎡가 왜 34평형이라고도 불리나요?',
        a: '전용 84㎡는 직접 환산하면 25.41평이지만, 광고의 평형은 전용면적에 주거공용면적을 더한 공급면적을 기준으로 부르는 경우가 있습니다. 공급면적은 단지마다 다르므로 매물에 적힌 전용·공급면적을 각각 확인해야 합니다.',
      },
      {
        q: '전용면적과 공급면적의 차이는 무엇인가요?',
        a: '전용면적은 세대 내부에서 단독으로 쓰는 방·거실·주방·화장실 등의 면적이고, 공급면적은 전용면적에 복도·계단·엘리베이터 홀 같은 주거공용면적을 더한 면적입니다. 공급면적이 보통 더 크므로 서로 다른 기준의 평수를 바로 비교하면 안 됩니다.',
      },
      {
        q: '평수 계산기에 입력한 매물 면적이 서버로 전송되나요?',
        a: '아니요. 평수 환산과 전용·공급면적 비교는 브라우저 안에서만 실행됩니다. 현재 입력값은 다시 열어 이어서 계산할 수 있도록 이 브라우저에만 저장되며 서버로 전송되지 않습니다.',
      },
    ],
    ui: {
      intro: '평과 제곱미터를 환산하고, 전용면적·공급면적을 같은 기준으로 나란히 비교합니다.',
      autosaved: '입력값은 이 브라우저에 저장됩니다',
      unitLabel: '입력한 면적의 단위',
      squareMeters: '제곱미터 (㎡)',
      pyeong: '평',
      basisLabel: '면적 기준',
      basisHint: '단위만 환산할 뿐 전용·공급면적의 기준은 바뀌지 않습니다.',
      exclusive: '전용면적',
      supply: '공급면적',
      valueLabel: '환산할 면적',
      valueHint: '0~1,000,000,000,000 사이의 숫자를 입력하세요. 소수도 입력할 수 있습니다.',
      resultsHeading: '환산 결과',
      squareMetersResult: '제곱미터',
      pyeongResult: '평',
      basisResult: '적용한 기준',
      exactFactor: '정확한 환산: 1평 = 400 ÷ 121㎡ = 3.305785…㎡',
      squareMetersFormula: '{value}㎡ × 121 ÷ 400 = {result}평',
      pyeongFormula: '{value}평 × 400 ÷ 121 = {result}㎡',
      exclusiveNotice:
        '전용면적을 환산한 결과입니다. 세대 내부의 생활 공간을 뜻하며, 더 큰 공급면적 기준의 광고 평형과는 다릅니다.',
      supplyNotice:
        '공급면적을 환산한 결과입니다. 전용면적과 주거공용면적이 함께 포함되므로 다른 공급면적과 같은 기준으로 비교하세요.',
      comparisonTitle: '전용면적·공급면적 함께 비교',
      comparisonHint:
        '매물이나 계약서에 적힌 두 값을 그대로 입력하세요. 이 계산기는 한쪽 면적을 다른 쪽으로 추정하지 않습니다.',
      exclusiveInput: '전용면적 (㎡)',
      supplyInput: '공급면적 (㎡)',
      exclusivePyeong: '전용면적 (평)',
      supplyPyeong: '공급면적 (평)',
      exclusiveRatio: '전용률',
      commonArea: '주거공용면적',
      comparisonNotice:
        '같은 매물도 전용 {exclusive}평, 공급 {supply}평으로 함께 표기될 수 있습니다. 차이는 단위 환산이 아니라 주거공용면적입니다.',
      invalidInput: '0~1,000,000,000,000 사이의 숫자를 입력하세요.',
      invalidComparison: '공급면적은 전용면적보다 크거나 같아야 하며, 0일 수 없습니다.',
      copy: '결과 복사',
      copied: '복사됨',
      reset: '초기화',
    },
  },
};
