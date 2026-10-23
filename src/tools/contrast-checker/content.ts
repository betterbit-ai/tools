import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  foreground: 'Text colour',
  background: 'Background colour',
  foregroundPicker: 'Choose text colour',
  backgroundPicker: 'Choose background colour',
  foregroundHex: 'Text colour HEX value',
  backgroundHex: 'Background colour HEX value',
  hexHint: 'Enter #RGB or #RRGGBB',
  swap: 'Swap colours',
  reset: 'Reset',
  copyResults: 'Copy results',
  copied: 'Copied',
  invalidColor: 'Enter a valid 3- or 6-digit HEX colour in both fields.',
  wcagRatio: 'WCAG 2 ratio',
  apca: 'APCA Lc',
  aaNormal: 'AA normal text',
  aaLarge: 'AA large text',
  aaaNormal: 'AAA normal text',
  aaaLarge: 'AAA large text',
  nonText: 'UI & graphics',
  pass: 'Pass',
  fail: 'Fail',
  previewTitle: 'Readable interface',
  previewBody: 'Check body text, labels and supporting copy with the exact pair you plan to use.',
  previewButton: 'Example action',
  previewLabel: 'Live preview of the chosen text and background colours',
  apcaNote: 'APCA is advisory. Use WCAG 2 results for current conformance checks.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Contrast Checker — WCAG 2.2 and APCA',
    description:
      'Check any two HEX colours against WCAG 2.2 AA and AAA, with polarity-aware APCA guidance, a live preview, and copy-ready results.',
    h1: 'Contrast Checker',
    tagline: 'Test text and background colours instantly with formal WCAG 2 checks and an advisory APCA reading.',
    name: 'Contrast Checker',
    keywords: [
      'color contrast checker',
      'WCAG contrast checker',
      'AA AAA contrast ratio',
      'APCA checker',
      'text color accessibility',
    ],
    howTo: [
      'Enter a text colour and a background colour as 3- or 6-digit HEX values, or use the colour pickers.',
      'Read the unrounded WCAG 2 contrast ratio and its AA, AAA, and UI-component results.',
      'Review the APCA Lc value as additional, polarity-aware guidance.',
      'Use the live preview and copy the result summary into a design review or ticket.',
    ],
    sections: [
      {
        heading: 'WCAG 2.2 contrast thresholds',
        body: 'WCAG 2.2 Success Criterion 1.4.3 requires at least 4.5:1 for normal text at AA and 3:1 for large text. Large text means at least 24 CSS px regular or approximately 18.66 CSS px bold. The enhanced AAA targets are 7:1 for normal text and 4.5:1 for large text.\n\nFor meaningful controls, icons, and graphics, Success Criterion 1.4.11 requires at least 3:1 against adjacent colours. Threshold decisions use the full calculated ratio: a value displayed as 4.50:1 can still fail if its unrounded value is below 4.5.',
      },
      {
        heading: 'How the ratio is calculated',
        body: 'WCAG contrast uses relative luminance after converting sRGB channels to linear light. The ratio is (L lighter + 0.05) ÷ (L darker + 0.05), so opaque sRGB pairs range from 1:1 to 21:1. The visual preview is useful, but a solid-colour result does not prove that text over a photo, gradient, translucent layer, or changing state meets a requirement. Check the least favourable actual background.',
      },
      {
        heading: 'APCA is a second reading, not a conformance result',
        body: 'APCA reports signed lightness contrast (Lc), so dark text on a light background and light text on a dark background can receive different values. This tool uses the APCA 0.1.9 reference constants. The sign indicates polarity; a larger absolute value generally means greater lightness contrast.\n\nAPCA has not replaced the WCAG 2 contrast success criteria. Use the WCAG 2 rows for present-day acceptance and compliance work, then use APCA as an additional signal when evaluating text choices.',
      },
    ],
    faq: [
      {
        q: 'What contrast ratio is required for WCAG AA?',
        a: 'WCAG AA requires a minimum 4.5:1 ratio for normal text and 3:1 for large text. Large text is at least 24 CSS px regular or about 18.66 CSS px bold; meaningful UI components and graphical objects also require 3:1 against adjacent colours.',
      },
      {
        q: 'What is the highest possible WCAG contrast ratio?',
        a: 'The highest possible contrast ratio for two opaque sRGB colours is 21:1, produced by black #000000 against white #FFFFFF. Identical opaque colours have a ratio of 1:1.',
      },
      {
        q: 'Why can a displayed 4.50:1 still fail WCAG?',
        a: 'WCAG thresholds must be checked without rounding. A raw ratio of 4.499:1 is displayed near 4.50:1 but does not meet the 4.5:1 AA threshold; this checker tests the full precision value.',
      },
      {
        q: 'Can APCA replace WCAG 2 contrast checks?',
        a: 'APCA cannot replace WCAG 2 contrast checks for current conformance work. APCA is a perceptual model with a signed Lc result, while WCAG 2.2 defines the current 4.5:1, 3:1, and 7:1 success-criterion thresholds.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '명도 대비 검사기 — WCAG 2.2·APCA',
    description:
      '글자색과 배경색의 명도 대비를 WCAG 2.2 AA·AAA 기준으로 바로 확인합니다. APCA Lc, 실제 미리보기, 결과 복사를 한 화면에서 제공합니다.',
    h1: '명도 대비 검사기',
    tagline: '색상 조합의 WCAG 2 기준과 APCA 참고값을 즉시 확인하고 실제 읽기 화면으로 비교합니다.',
    name: '명도 대비 검사기',
    keywords: ['명도 대비 검사기', '색상 대비 검사', '색상 대비율', 'WCAG 대비', '웹 접근성 색상', 'APCA'],
    howTo: [
      '글자색과 배경색에 3자리 또는 6자리 HEX 코드를 입력하거나 색상 선택기를 사용합니다.',
      '반올림하지 않은 WCAG 2 대비율과 AA·AAA·UI 요소 결과를 확인합니다.',
      '밝은 배경과 어두운 배경을 구분하는 APCA Lc 값을 참고합니다.',
      '실시간 미리보기로 읽기 상태를 보고 결과를 복사해 디자인 검토나 이슈에 붙여 넣습니다.',
    ],
    sections: [
      {
        heading: 'WCAG 2.2 명도 대비 기준',
        body: 'WCAG 2.2 성공 기준 1.4.3에서 AA는 일반 텍스트 4.5:1 이상, 큰 텍스트 3:1 이상을 요구합니다. 큰 텍스트는 일반 글자 24 CSS px 이상 또는 굵은 글자 약 18.66 CSS px 이상입니다. AAA 기준은 일반 텍스트 7:1, 큰 텍스트 4.5:1입니다.\n\n버튼 경계, 아이콘, 의미 있는 그래픽 같은 비텍스트 요소는 성공 기준 1.4.11에 따라 인접 색상과 3:1 이상이어야 합니다. 통과 여부는 표시용 반올림 수치가 아니라 계산된 원래 대비율로 판정합니다.',
      },
      {
        heading: '대비율 계산 방식',
        body: 'WCAG 대비율은 sRGB 채널을 선형화한 상대 휘도로 계산합니다. 공식은 (더 밝은 색의 L + 0.05) ÷ (더 어두운 색의 L + 0.05)이며, 불투명한 sRGB 색상은 1:1부터 21:1 사이입니다.\n\n이 결과는 단색 전경과 배경의 기준입니다. 사진, 그라데이션, 투명 레이어, 상태에 따라 달라지는 배경 위 텍스트는 실제 사용 화면에서 가장 불리한 배경을 따로 점검해야 합니다.',
      },
      {
        heading: 'APCA는 참고용으로 사용합니다',
        body: 'APCA는 밝기 대비 Lc를 부호와 함께 표시합니다. 어두운 글자와 밝은 배경, 밝은 글자와 어두운 배경은 같은 색상 조합 범위라도 다른 값을 얻을 수 있습니다. 이 도구는 APCA 0.1.9 기준 상수를 사용하며, 절댓값이 클수록 밝기 대비가 큰 편입니다.\n\nAPCA는 아직 WCAG 2 성공 기준을 대체하지 않습니다. 현재의 납품·접근성 검사에는 WCAG 2 결과를 사용하고, APCA는 텍스트 조합을 추가로 판단하는 참고값으로 사용합니다.',
      },
    ],
    faq: [
      {
        q: 'WCAG AA를 충족하려면 대비율이 얼마여야 하나요?',
        a: 'WCAG AA는 일반 텍스트에 4.5:1 이상, 큰 텍스트에 3:1 이상의 대비율을 요구합니다. 큰 텍스트는 일반 24 CSS px 이상 또는 굵은 글자 약 18.66 CSS px 이상이며, 의미 있는 UI 요소와 그래픽도 인접 색상과 3:1 이상이어야 합니다.',
      },
      {
        q: '명도 대비율의 최대값은 얼마인가요?',
        a: '불투명한 sRGB 색상 두 개의 최대 대비율은 검정 #000000과 흰색 #FFFFFF 조합의 21:1입니다. 같은 색상끼리는 1:1입니다.',
      },
      {
        q: '화면에 4.50:1로 보이는데 왜 실패할 수 있나요?',
        a: 'WCAG 기준은 반올림 전 계산값으로 판정합니다. 실제 값이 4.499:1이면 표시상 4.50:1에 가까워도 AA의 4.5:1 기준을 충족하지 못합니다. 이 검사기는 원래 계산값으로 통과 여부를 판단합니다.',
      },
      {
        q: 'APCA로 WCAG 2 검사를 대신할 수 있나요?',
        a: '현재 접근성 적합성 검사에서 APCA는 WCAG 2를 대신할 수 없습니다. APCA는 부호가 있는 Lc 값을 쓰는 지각 모델이고, WCAG 2.2는 4.5:1·3:1·7:1의 현행 성공 기준을 정의합니다.',
      },
    ],
    ui: {
      foreground: '글자색',
      background: '배경색',
      foregroundPicker: '글자색 선택',
      backgroundPicker: '배경색 선택',
      foregroundHex: '글자색 HEX 값',
      backgroundHex: '배경색 HEX 값',
      hexHint: '#RGB 또는 #RRGGBB 입력',
      swap: '색상 교체',
      reset: '초기화',
      copyResults: '결과 복사',
      copied: '복사됨',
      invalidColor: '두 입력란에 올바른 3자리 또는 6자리 HEX 색상을 입력하세요.',
      wcagRatio: 'WCAG 2 대비율',
      apca: 'APCA Lc',
      aaNormal: 'AA 일반 텍스트',
      aaLarge: 'AA 큰 텍스트',
      aaaNormal: 'AAA 일반 텍스트',
      aaaLarge: 'AAA 큰 텍스트',
      nonText: 'UI·그래픽',
      pass: '통과',
      fail: '실패',
      previewTitle: '읽기 편한 인터페이스',
      previewBody: '실제로 사용할 색상 조합으로 본문, 라벨, 보조 문구를 함께 확인합니다.',
      previewButton: '예시 동작',
      previewLabel: '선택한 글자색과 배경색의 실시간 미리보기',
      apcaNote: 'APCA는 참고값입니다. 현재 적합성 검사는 WCAG 2 결과를 사용하세요.',
    },
  },
};
