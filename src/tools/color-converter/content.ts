import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  hexLabel: 'HEX color',
  hexHint: 'Use #RGB or #RRGGBB. This converter handles opaque sRGB colors.',
  hexPlaceholder: '#3B82F6',
  pickerLabel: 'Choose color',
  rgbLabel: 'RGB channels',
  redLabel: 'Red',
  greenLabel: 'Green',
  blueLabel: 'Blue',
  channelHint: 'Whole numbers from 0 to 255.',
  resultsTitle: 'Copy-ready CSS values',
  hslLabel: 'HSL',
  oklchLabel: 'OKLCH',
  luminanceLabel: 'Relative luminance',
  contrastTitle: 'WCAG contrast',
  onWhiteLabel: 'On white',
  onBlackLabel: 'On black',
  aaNormal: 'AA text',
  aaLarge: 'AA large',
  aaaNormal: 'AAA text',
  aaaLarge: 'AAA large',
  pass: 'Pass',
  fail: 'Fail',
  reset: 'Reset example',
  saved: 'Saved in this browser only',
  copy: 'Copy',
  copied: 'Copied',
  errorEmpty: 'Enter a HEX color to convert it.',
  errorHex: 'Use exactly 3 or 6 hexadecimal digits, with an optional #.',
  errorRgb: 'Each RGB channel must be a whole number from 0 to 255.',
  contrastHint: 'Opaque color against a solid white or black background.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'HEX to RGB Converter — OKLCH & WCAG Contrast',
    description:
      'Convert HEX to RGB, HSL, and CSS OKLCH instantly, then check WCAG contrast on white and black. Copy every value and keep your last color locally.',
    h1: 'HEX to RGB Color Converter',
    tagline:
      'Convert an opaque sRGB color as you type, copy modern CSS values, and see its WCAG contrast against white and black.',
    name: 'Color Converter',
    keywords: [
      'hex to rgb',
      'rgb to hex',
      'color code converter',
      'hex color converter',
      'oklch converter',
      'contrast ratio',
    ],
    howTo: [
      'Paste a 3- or 6-digit HEX value, choose a color, or enter the three RGB channels.',
      'Read the normalized HEX, RGB, HSL, and OKLCH CSS values as they update.',
      'Use the Copy button beside the format needed by your stylesheet or design token.',
      'Check the contrast ratios and AA or AAA result for white and black backgrounds.',
    ],
    sections: [
      {
        heading: 'HEX and RGB describe the same opaque sRGB color',
        body: 'A six-digit HEX code has one two-digit base-16 value for each sRGB channel: #3B82F6 means 3B = 59, 82 = 130, and F6 = 246, or rgb(59 130 246). Each RGB channel has 256 possible integer values, from 0 to 255, so an opaque 24-bit RGB color has 256³ = 16,777,216 possible combinations. The three-digit CSS shorthand #3BF expands to #33BBFF.\n\nCSS Color Module Level 4 defines hexadecimal and rgb() notation for sRGB colors. This converter intentionally accepts only opaque #RGB and #RRGGBB values; alpha compositing needs a known background before contrast can be calculated correctly.',
      },
      {
        heading: 'Why use HSL and OKLCH?',
        body: 'HSL writes the same sRGB color as hue (0–360 degrees), saturation, and lightness, which is convenient for a quick visual adjustment. HSL is not perceptually uniform: changing lightness by the same amount does not always look equally bright.\n\nOKLCH is the cylindrical form of Oklab: L is perceived lightness, C is chroma, and h is hue in degrees. CSS Color 4 includes oklch() notation. The result here is calculated from the selected sRGB color and rounded for readable CSS; it does not create colors outside the sRGB gamut.',
      },
      {
        heading: 'Reading the WCAG contrast result',
        body: 'The contrast ratio compares relative luminance after sRGB is converted to linear light: (lighter + 0.05) / (darker + 0.05). It ranges from 1:1 for identical colors to 21:1 for black and white.\n\nUnder WCAG 2.2, normal text needs at least 4.5:1 for AA and 7:1 for AAA. Large text needs at least 3:1 for AA and 4.5:1 for AAA. This tool checks an opaque foreground against solid white and black only; an image, gradient, transparency, font weight, and actual text size still need review in the final interface.',
      },
    ],
    faq: [
      {
        q: 'How do I convert HEX to RGB?',
        a: 'Split a six-digit HEX code into three pairs and read each pair in base 16. For example, #3B82F6 becomes 0x3B = 59, 0x82 = 130, and 0xF6 = 246, so its CSS RGB form is rgb(59 130 246).',
      },
      {
        q: 'Is #RGB the same as #RRGGBB?',
        a: 'A three-digit HEX value is CSS shorthand that repeats every digit: #3BF expands to #33BBFF. It can represent only colors whose two digits in each 8-bit RGB channel are the same.',
      },
      {
        q: 'What contrast ratio passes WCAG AA?',
        a: 'WCAG 2.2 requires a contrast ratio of at least 4.5:1 for normal AA text and 3:1 for large AA text. For AAA, the thresholds are 7:1 for normal text and 4.5:1 for large text.',
      },
      {
        q: 'Does this color converter upload or share my color values?',
        a: 'No. Conversion and contrast calculations run in the browser. The last unfinished value is stored only in this browser so it can be restored after a refresh.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'HEX RGB 변환기 — OKLCH·WCAG 대비율',
    description:
      'HEX 색상 코드를 RGB·HSL·CSS OKLCH로 즉시 변환하고 흰색·검은색 배경의 WCAG 대비율을 확인합니다. 마지막 색상은 이 브라우저에만 저장됩니다.',
    h1: 'HEX RGB 색상 변환기',
    tagline: 'HEX와 RGB 값을 바로 바꾸고, 복사 가능한 CSS 표기와 흰색·검은색 배경 대비율을 한 화면에서 확인합니다.',
    name: '색상 변환기',
    keywords: ['HEX RGB 변환', '색상 코드 변환', 'RGB HEX 변환', '컬러 코드 변환', 'OKLCH 변환', '색상 대비율'],
    howTo: [
      '3자리 또는 6자리 HEX 코드를 붙여넣거나, 색상 선택기 또는 RGB 채널을 입력합니다.',
      '즉시 바뀌는 HEX, RGB, HSL, OKLCH CSS 표기값을 확인합니다.',
      '스타일시트나 디자인 토큰에 필요한 형식 옆의 복사 버튼을 누릅니다.',
      '흰색과 검은색 배경에서의 대비율과 AA·AAA 결과를 확인합니다.',
    ],
    sections: [
      {
        heading: 'HEX와 RGB는 같은 불투명 sRGB 색을 다르게 적는 방법입니다',
        body: '6자리 HEX 코드는 sRGB 채널 3개를 각각 16진수 두 자리로 적습니다. #3B82F6은 3B = 59, 82 = 130, F6 = 246이므로 rgb(59 130 246)과 같습니다. RGB 채널은 0부터 255까지 256개 정수 중 하나이므로, 불투명 24비트 RGB 색은 256³ = 16,777,216가지입니다. CSS의 3자리 축약형 #3BF는 #33BBFF로 늘어납니다.\n\nW3C CSS Color Module Level 4는 sRGB의 16진수 표기와 rgb() 표기를 정의합니다. 이 도구는 불투명 #RGB·#RRGGBB만 받습니다. 투명 색은 배경을 알아야 대비율을 정확히 계산할 수 있기 때문입니다.',
      },
      {
        heading: 'HSL과 OKLCH를 함께 보는 이유',
        body: 'HSL은 같은 sRGB 색을 색상(0~360도), 채도, 명도로 적으므로 빠르게 색을 조정할 때 편리합니다. 다만 HSL은 지각적으로 균일하지 않아 명도를 같은 폭으로 바꿔도 사람 눈에는 같은 정도로 밝아지거나 어두워지지 않을 수 있습니다.\n\nOKLCH는 Oklab의 원통형 표기입니다. L은 지각 밝기, C는 채도, h는 색상 각도입니다. CSS Color 4는 oklch() 문법을 포함합니다. 이 도구는 선택한 sRGB 색에서 OKLCH를 계산하고 읽기 쉬운 CSS 값으로 반올림하며, sRGB 색역 밖의 색을 만들지는 않습니다.',
      },
      {
        heading: 'WCAG 대비율 읽는 법',
        body: '대비율은 sRGB를 선형 광량으로 바꾼 뒤 (밝은 색 + 0.05) / (어두운 색 + 0.05)로 계산합니다. 같은 색끼리는 1:1, 검정과 흰색은 21:1입니다.\n\nWCAG 2.2에서 일반 텍스트의 AA 기준은 4.5:1, AAA 기준은 7:1입니다. 큰 텍스트는 AA 3:1, AAA 4.5:1입니다. 이 도구는 불투명 글자색과 단색 흰색·검은색 배경만 검사합니다. 이미지·그라데이션·투명도·글자 굵기·실제 글자 크기는 최종 화면에서 추가로 확인해야 합니다.',
      },
    ],
    faq: [
      {
        q: 'HEX 색상 코드를 RGB로 어떻게 바꾸나요?',
        a: '6자리 HEX 코드를 두 자리씩 나누어 16진수에서 10진수로 바꾸면 됩니다. 예를 들어 #3B82F6은 0x3B = 59, 0x82 = 130, 0xF6 = 246이므로 CSS RGB 표기는 rgb(59 130 246)입니다.',
      },
      {
        q: '3자리 HEX와 6자리 HEX는 같은 색인가요?',
        a: '3자리 HEX는 각 글자를 두 번 반복하는 CSS 축약형입니다. #3BF는 #33BBFF와 같으며, 각 RGB 채널의 두 16진수 자리가 같은 색만 표현할 수 있습니다.',
      },
      {
        q: 'WCAG AA 대비율 기준은 얼마인가요?',
        a: 'WCAG 2.2의 AA 기준은 일반 텍스트 4.5:1 이상, 큰 텍스트 3:1 이상입니다. AAA 기준은 일반 텍스트 7:1 이상, 큰 텍스트 4.5:1 이상입니다.',
      },
      {
        q: '입력한 색상 코드가 서버로 전송되나요?',
        a: '아니요. 색상 변환과 대비율 계산은 브라우저에서 수행합니다. 새로고침 뒤에도 이어서 쓸 수 있도록 마지막 입력값만 현재 브라우저의 local storage에 저장하며 서버로 전송하지 않습니다.',
      },
    ],
    ui: {
      hexLabel: 'HEX 색상 코드',
      hexHint: '#RGB 또는 #RRGGBB를 입력합니다. 이 도구는 불투명 sRGB 색을 변환합니다.',
      hexPlaceholder: '#3B82F6',
      pickerLabel: '색상 선택',
      rgbLabel: 'RGB 채널',
      redLabel: '빨강',
      greenLabel: '초록',
      blueLabel: '파랑',
      channelHint: '0부터 255까지의 정수를 입력합니다.',
      resultsTitle: '복사 가능한 CSS 값',
      hslLabel: 'HSL',
      oklchLabel: 'OKLCH',
      luminanceLabel: '상대 휘도',
      contrastTitle: 'WCAG 대비율',
      onWhiteLabel: '흰색 배경',
      onBlackLabel: '검은색 배경',
      aaNormal: 'AA 일반 글자',
      aaLarge: 'AA 큰 글자',
      aaaNormal: 'AAA 일반 글자',
      aaaLarge: 'AAA 큰 글자',
      pass: '통과',
      fail: '미통과',
      reset: '예시로 초기화',
      saved: '이 브라우저에만 저장됨',
      copy: '복사',
      copied: '복사됨',
      errorEmpty: '변환할 HEX 색상 코드를 입력하세요.',
      errorHex: '#을 포함하거나 생략한 3자리 또는 6자리 16진수를 입력하세요.',
      errorRgb: 'RGB 채널은 각각 0부터 255까지의 정수여야 합니다.',
      contrastHint: '불투명 색을 단색 흰색 또는 검은색 배경과 비교합니다.',
    },
  },
};
