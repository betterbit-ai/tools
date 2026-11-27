import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  baseLabel: 'Base color',
  baseHint: 'Type a HEX code or pick one. The first swatch is this exact color.',
  basePicker: 'Pick a base color',
  baseHex: 'Base color HEX',
  baseBadge: 'base',
  harmonyLabel: 'Harmony',
  harmonyAnalogous: 'Analogous',
  harmonyMonochrome: 'Monochromatic',
  harmonyComplementary: 'Complementary',
  harmonySplit: 'Split-complementary',
  harmonyTriadic: 'Triadic',
  harmonyTetradic: 'Tetradic',
  countLabel: 'Colors',
  swatchText: 'Sample text on',
  statAaOnWhite: 'Colors that pass AA on white',
  statAaOnBlack: 'Colors that pass AA on black',
  statLightnessStep: 'Lightness step',
  lightnessStepValue: '0.12 OKLCH L',
  contrastHint:
    'The two ratios under each swatch are WCAG contrast against white and black. 4.5:1 is AA for normal text, 7:1 is AAA, 3:1 is AA for large text only. The “Aa” sample already uses whichever text color reads better.',
  exportHeading: 'Copy as code',
  copyCss: 'CSS variables',
  copyTailwind: 'Tailwind',
  copyJson: 'JSON',
  copyHex: 'HEX list',
  copied: 'Copied',
  invalidHex: 'Enter a HEX color such as #3b82f6 (3 or 6 digits).',
  reset: 'Reset',
  savedLocally: 'Saved in this browser only',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Color Palette Generator — OKLCH Shades & WCAG Contrast',
    description:
      'Build a palette from one HEX color with even OKLCH lightness steps, see WCAG contrast on white and black for every swatch, and copy CSS, Tailwind or JSON. No sign-up.',
    h1: 'Color Palette Generator',
    tagline:
      'One base color becomes a palette of evenly spaced, perceptually balanced colors — each with the text color and contrast ratio it needs.',
    name: 'Color Palette Generator',
    keywords: [
      'color palette generator',
      'colour palette generator',
      'color scheme generator',
      'palette from hex',
      'oklch palette',
      'tailwind color palette',
      'contrast checker palette',
    ],
    howTo: [
      'Type a HEX code or open the picker to choose a base color.',
      'Pick a harmony — analogous, monochromatic, complementary, split, triadic or tetradic — and how many colors you need.',
      'Check each swatch: the HEX code, its OKLCH lightness, and its contrast against white and black.',
      'Copy the palette as CSS variables, a Tailwind block, JSON or a plain HEX list.',
    ],
    sections: [
      {
        heading: 'Why these colors are spaced in OKLCH, not HSL',
        body: 'Almost every palette generator rotates hue and changes lightness in HSL. HSL lightness is not perceptual: `hsl(60 100% 50%)` (yellow) and `hsl(240 100% 50%)` (blue) are both "50% lightness" but one looks far brighter than the other, so an evenly numbered HSL ladder looks uneven.\n\nOKLCH is the cylindrical form of Oklab (CSS Color 4). Its L is perceived lightness, so a step of 0.12 L looks like the same jump in every hue. This tool builds the ladder in OKLCH and shows each swatch’s real L, which is why the light and dark ends of a palette stay related instead of one side turning muddy.',
      },
      {
        heading: 'How the palette is built',
        body: 'The base color is kept exactly as you entered it, as the first swatch. The next colors step ±0.12 L away from it — lighter, darker, lighter, darker — while the hue rotates by the harmony’s offsets: ±15/30° for analogous, 180° for complementary, 150/210° for split-complementary, 120° for triadic, 90° for tetradic, and no rotation at all for monochromatic.\n\nChroma is reduced slightly at the extremes, so highlights do not look fluorescent. If a requested color falls outside sRGB — common with vivid greens and blues at high chroma — chroma is lowered until it fits, instead of the color being clipped channel by channel, which would shift its hue.',
      },
      {
        heading: 'Reading the contrast numbers',
        body: 'WCAG contrast compares relative luminance: (lighter + 0.05) / (darker + 0.05), from 1:1 to 21:1. Normal text needs 4.5:1 for AA and 7:1 for AAA; text 24 px or 18.66 px bold needs 3:1 (the “large” level). Each swatch shows its ratio against white and against black, and the sample “Aa” uses whichever of the two passes better.\n\nA palette for a website usually needs one color dark enough to be text on white (≥ 4.5:1) and one light enough to be a background (≥ 4.5:1 with the text color you use). The two counters above the swatches tell you how many colors could carry normal text on each background.',
      },
    ],
    faq: [
      {
        q: 'How do I make a color palette from one HEX code?',
        a: 'Enter the HEX code as the base color. The generator keeps it as the first swatch and builds the rest by rotating hue with the harmony you chose and stepping OKLCH lightness by 0.12 at a time, so a five-color palette gives you the base plus two lighter and two darker colors at fixed hue offsets.',
      },
      {
        q: 'What is the difference between OKLCH and HSL?',
        a: 'Both describe hue, saturation and lightness, but HSL lightness is a mathematical mix of the RGB channels, not perceived brightness: yellow at 50% HSL lightness looks much brighter than blue at 50%. OKLCH lightness (L) is perceptual and agrees with how the eye sees brightness, so equal steps look equal in every hue. The tool shows each swatch’s OKLCH L so you can check it.',
      },
      {
        q: 'Which contrast ratio do I need?',
        a: 'WCAG 2.2 asks 4.5:1 for normal-size text (AA), 7:1 for AAA, and 3:1 for large text — 24 px, or 18.66 px when bold. Non-text elements such as borders need 3:1. Every swatch here lists its ratio against both white and black, so you can pick the pairing that passes.',
      },
      {
        q: 'Can I use these palettes commercially?',
        a: 'Yes. Color values are not copyrightable and nothing here needs attribution; use the palette in client work, products or print. The generator runs entirely in your browser, so no palette is stored on a server.',
      },
      {
        q: 'How do I get the palette into Tailwind or CSS?',
        a: 'Use the CSS variables button for a `:root` block, the Tailwind button for a `theme.extend.colors.palette` object keyed 1–N, the JSON button for `{ base, harmony, colors }`, or the HEX list for a design ticket. Each option copies to the clipboard in one click.',
      },
      {
        q: 'Why do some swatches lose saturation?',
        a: 'Some hue/chroma combinations cannot be shown in sRGB — very saturated greens and blues at high chroma are the usual case. Instead of clipping each channel (which shifts the hue), the tool reduces chroma until the color fits sRGB, so the swatch stays the hue you asked for and only becomes slightly less vivid.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '컬러 팔레트 생성기 — OKLCH 명도 단계와 WCAG 대비',
    description:
      '기준 색 하나로 팔레트를 만듭니다. OKLCH 명도를 일정 간격으로 배열하고, 색마다 흰색·검정 대비율과 어울리는 글자색을 보여 주며 CSS·Tailwind·JSON으로 복사합니다.',
    h1: '컬러 팔레트 생성기',
    tagline:
      '기준 색 하나로 눈으로 보기에 고른 간격의 팔레트를 만듭니다. 색마다 필요한 글자색과 대비율까지 함께 표시합니다.',
    name: '컬러 팔레트 생성기',
    keywords: [
      '컬러 팔레트 생성기',
      '색상 팔레트',
      '색조합',
      '배색표',
      '색상 조합 추천',
      'oklch 팔레트',
      '웹 색상 팔레트',
    ],
    howTo: [
      'HEX 코드를 입력하거나 색상 선택기로 기준 색을 고르세요.',
      '조화 규칙(유사색·단색·보색·분열보색·삼각·사각)과 색 개수를 고르세요.',
      '각 색의 HEX 코드, OKLCH 명도, 흰색·검정 대비율을 확인하세요.',
      'CSS 변수, Tailwind, JSON, HEX 목록 중 필요한 형식으로 복사하세요.',
    ],
    sections: [
      {
        heading: 'HSL이 아니라 OKLCH로 간격을 잡는 이유',
        body: '대부분의 팔레트 생성기는 HSL에서 색상과 명도를 바꿉니다. 그런데 HSL의 명도는 사람이 느끼는 밝기가 아닙니다. `hsl(60 100% 50%)`(노랑)과 `hsl(240 100% 50%)`(파랑)은 둘 다 명도 50%지만 노랑이 훨씬 밝게 보입니다. 그래서 HSL로 같은 숫자만큼 밝기를 바꾼 팔레트는 실제로는 들쭉날쭉해 보입니다.\n\nOKLCH는 Oklab의 원통형 표기로 CSS Color 4에 들어 있습니다. L이 지각적 명도라서 0.12씩 올리면 어느 색상에서나 눈에 보이는 차이가 비슷합니다. 이 도구는 OKLCH로 단계를 만들고 각 색의 실제 L 값을 보여 주기 때문에, 팔레트의 밝은 끝과 어두운 끝이 서로 이어져 보입니다.',
      },
      {
        heading: '팔레트가 만들어지는 방식',
        body: '입력한 기준 색은 첫 번째 칸에 그대로 유지됩니다. 다음 색들은 기준 색에서 ±0.12 L씩 밝고 어두운 쪽으로 번갈아 이동하면서, 조화 규칙의 각도만큼 색상이 회전합니다. 유사색은 ±15/30°, 보색은 180°, 분열보색은 150/210°, 삼각은 120°, 사각은 90°이고 단색은 회전하지 않습니다.\n\n양 끝에서는 채도를 조금 낮춰 형광색처럼 보이지 않게 합니다. 요청한 색이 sRGB 밖에 있으면(채도가 높은 초록·파랑에서 흔합니다) 각 채널을 잘라내는 대신 채도를 낮춰 sRGB 안으로 넣습니다. 채널을 자르면 색상 자체가 달라지기 때문입니다.',
      },
      {
        heading: '대비 수치 읽는 법',
        body: 'WCAG 대비는 상대 휘도를 비교합니다: (밝은 쪽 + 0.05) / (어두운 쪽 + 0.05). 값은 1:1에서 21:1까지입니다. 본문 크기 글자는 AA 4.5:1, AAA 7:1이 필요하고, 24px 이상(또는 굵은 18.66px 이상) 큰 글자는 3:1이면 됩니다. 각 칸에는 흰색·검정 대비율이 함께 나오고, “Aa” 예시는 그중 더 잘 읽히는 글자색으로 표시됩니다.\n\n웹사이트 팔레트라면 보통 흰 배경 위 글자로 쓸 만큼 어두운 색 하나(4.5:1 이상)와, 배경으로 쓸 만큼 밝은 색 하나가 필요합니다. 칸 위의 두 숫자는 흰색·검정 각각에서 본문 글자를 받을 수 있는 색이 몇 개인지 알려 줍니다.',
      },
    ],
    faq: [
      {
        q: 'HEX 코드 하나로 팔레트를 어떻게 만드나요?',
        a: 'HEX 코드를 기준 색으로 입력하세요. 기준 색은 첫 칸에 그대로 남고, 나머지는 고른 조화 규칙만큼 색상을 회전시키며 OKLCH 명도를 0.12씩 옮겨 만듭니다. 5색 팔레트라면 기준 색과, 정해진 색상 간격에서 밝은 색 2개·어두운 색 2개가 나옵니다.',
      },
      {
        q: 'OKLCH와 HSL은 무엇이 다른가요?',
        a: '둘 다 색상·채도·명도로 색을 표현하지만, HSL의 명도는 RGB 채널을 수학적으로 섞은 값이라 지각적 밝기와 다릅니다. 노랑은 HSL 명도 50%에서도 파랑보다 훨씬 밝게 보입니다. OKLCH의 L은 지각적 밝기라 같은 간격이 어느 색상에서나 비슷하게 보이고, 이 도구는 각 칸에 그 L 값을 표시합니다.',
      },
      {
        q: '대비율은 얼마나 되어야 하나요?',
        a: 'WCAG 2.2 기준으로 본문 크기 글자는 4.5:1(AA), 7:1(AAA), 큰 글자(24px, 굵은 글씨는 18.66px)는 3:1입니다. 테두리 같은 비텍스트 요소는 3:1이 필요합니다. 각 칸에 흰색·검정 대비율이 모두 표시되므로 통과하는 조합을 바로 고를 수 있습니다.',
      },
      {
        q: '이 팔레트를 상업적으로 써도 되나요?',
        a: '네. 색상 값에는 저작권이 없고 출처 표시도 필요하지 않습니다. 클라이언트 작업, 제품, 인쇄물 어디에나 쓰세요. 생성은 전부 브라우저에서 이루어지며 팔레트가 서버에 저장되지 않습니다.',
      },
      {
        q: 'CSS나 Tailwind에 어떻게 넣나요?',
        a: 'CSS 변수 버튼은 `:root` 블록을, Tailwind 버튼은 `theme.extend.colors.palette`에 1~N 키로 들어가는 객체를, JSON 버튼은 `{ base, harmony, colors }`를, HEX 목록 버튼은 쉼표로 구분한 값을 복사합니다. 모두 한 번의 클릭으로 클립보드에 담깁니다.',
      },
      {
        q: '일부 색의 채도가 낮아 보이는 이유는요?',
        a: '일부 색상·채도 조합은 sRGB로 표현할 수 없습니다. 채도가 높은 초록·파랑이 대표적입니다. 이때 채널을 하나씩 잘라내면 색상이 달라지므로, 이 도구는 채도를 낮춰 sRGB 안에 넣습니다. 그래서 색상은 그대로 유지되고 채도만 조금 낮아집니다.',
      },
    ],
    ui: {
      baseLabel: '기준 색',
      baseHint: 'HEX 코드를 입력하거나 색을 고르세요. 첫 번째 칸이 이 색 그대로입니다.',
      basePicker: '기준 색 고르기',
      baseHex: '기준 색 HEX',
      baseBadge: '기준',
      harmonyLabel: '조화 규칙',
      harmonyAnalogous: '유사색',
      harmonyMonochrome: '단색',
      harmonyComplementary: '보색',
      harmonySplit: '분열보색',
      harmonyTriadic: '삼각',
      harmonyTetradic: '사각',
      countLabel: '색 개수',
      swatchText: '예시 글자',
      statAaOnWhite: '흰 배경에서 AA 통과',
      statAaOnBlack: '검은 배경에서 AA 통과',
      statLightnessStep: '명도 간격',
      lightnessStepValue: 'OKLCH L 0.12',
      contrastHint:
        '각 칸 아래 두 수치는 흰색·검정 배경과의 WCAG 대비율입니다. 4.5:1은 본문 AA, 7:1은 AAA, 3:1은 큰 글자 AA입니다. “Aa” 예시는 더 잘 읽히는 글자색으로 표시됩니다.',
      exportHeading: '코드로 복사',
      copyCss: 'CSS 변수',
      copyTailwind: 'Tailwind',
      copyJson: 'JSON',
      copyHex: 'HEX 목록',
      copied: '복사했습니다',
      invalidHex: '#3b82f6처럼 HEX 색상을 입력하세요(3자리 또는 6자리).',
      reset: '초기화',
      savedLocally: '이 브라우저에만 저장됨',
    },
  },
};
