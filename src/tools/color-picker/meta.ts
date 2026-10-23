import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'color-picker',
  category: 'color',
  icon: 'palette',
  added: '2026-10-23',
  updated: '2026-10-23',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'ImageColor Pro — Color Picker from Image',
      url: 'https://imagecolorpro.io/',
      weakness:
        'The opened picker offers fixed 1 px, 3×3, and 5×5 samples and a five-color palette, while its 3–10-color palette workflow is linked as a separate tool. Betterbit opens one image into a single exact-original-pixel picker with keyboard movement, a 3–8-color deterministic palette, percentage coverage, and a CSS-variable copy action. (Strength: it also exposes CMYK and OKLCH values and an 11×11 magnifier.)',
    },
    {
      name: 'PaletteTools — Color Picker from Image',
      url: 'https://www.palettetools.com/color-picker-from-image/',
      weakness:
        'Its opened page limits input to JPG, PNG, and WebP files up to 10 MB, and its visible picker output is HEX, RGB, HSL, and recent colors; palette generation is linked as a different tool. Betterbit combines original-pixel picking with an automatic representative palette and CSS-variable export in the same view. (Strength: it has a desktop magnifier and stores up to eight recent picks.)',
    },
    {
      name: 'WAZA TOOLS — Image Color Picker',
      url: 'https://waza.tools/en/tools/image-color-picker/',
      weakness:
        'The opened tool exposes a 5–8-color palette control and “Copy All,” but does not show keyboard pixel navigation, per-swatch sampled-pixel coverage, or a CSS-variable export in its visible interface. Betterbit provides arrow-key source-pixel selection plus both percentage coverage and CSS variables. (Strength: it additionally supports a browser screen eyedropper and HEIC on supported browsers.)',
    },
    {
      name: 'Newtil — 이미지 색상 추출',
      url: 'https://newtil.com/image-color-extractor',
      weakness:
        'Its opened Korean result presents a main-color HEX palette that requires a separate “색상 추출” action after choosing a file; no direct image-pixel picker is shown in that flow. Betterbit automatically produces the palette while also letting users click or use arrow keys to read a precise original pixel. (장점: 대표색 추출 원리와 활용처를 한국어로 간결하게 안내한다.)',
    },
    {
      name: 'JHN Soft — 컬러피커·HTML 색상표',
      url: 'https://www.jhnsoft.co.kr/color-picker/',
      weakness:
        'Its opened image mode is part of a broad color workspace with direct-code inputs, alpha, RGB/HSL controls, saved colors, harmonies, and exports; the visible image instructions describe click or touch selection but not original-pixel arrow-key movement. Betterbit makes a focused image-first workflow with one-pixel and 10-pixel keyboard nudges available as soon as an image opens. (장점: RGBA, HSV, CMYK, CSS 색상명 등 훨씬 많은 색상 표기를 다룬다.)',
    },
    {
      name: '디마툴즈 — 색상 코드 추출',
      url: 'https://dima.tools/color_theme_picker/',
      weakness:
        'Its opened page asks the user to select a color count and press “색상 추출”; it returns palette colors but its own FAQ says an exact point should be approximated by increasing palette size. Betterbit reads the clicked original pixel exactly and still extracts a deterministic 3–8-color palette automatically. (장점: HEX 목록, CSS 변수, JSON의 세 가지 팔레트 내보내기 형식을 제공한다.)',
    },
  ],
  related: ['color-converter', 'image-cropper', 'image-compressor'],
};
