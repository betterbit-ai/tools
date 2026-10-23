import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  uploadTitle: 'Drop an image, or choose a file',
  uploadHint: 'PNG, JPG, WebP, GIF, AVIF, BMP, or a pasted screenshot',
  shortcut: 'Paste a screenshot',
  ctrlKey: 'Ctrl',
  commandKey: '⌘',
  vKey: 'V',
  loading: 'Reading the image and extracting its palette…',
  unreadable: 'This image could not be read by this browser. Try PNG, JPG, or WebP.',
  imageDetails: '{name} · {width} × {height} px',
  clear: 'Remove image',
  imageTitle: 'Image color picker',
  imageInstruction: 'Click or tap a pixel. Use arrow keys to move one source pixel; hold Shift to move 10.',
  selectedTitle: 'Selected pixel',
  selectedPosition: 'Source pixel {x}, {y}',
  hex: 'HEX',
  rgb: 'RGB',
  hsl: 'HSL',
  copy: 'Copy',
  copied: 'Copied',
  paletteTitle: 'Dominant palette',
  paletteHint:
    'Representative colors are sampled at up to 256 px on the longest side. Transparent pixels below 50% opacity are excluded.',
  paletteSize: 'Colors',
  coverage: '{percent}% of sampled pixels',
  copyCss: 'Copy CSS variables',
  historyTitle: 'Recent picks',
  historyHint: 'Saved only in this browser',
  clearHistory: 'Clear picks',
  emptyHistory: 'Picked HEX codes appear here.',
  swatchLabel: 'Color {hex}',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Color Picker from Image — Exact Pixel & Palette',
    description:
      'Pick an exact original-image pixel and extract a deterministic dominant-color palette at once. Copy HEX, RGB, HSL, or CSS variables; processing stays in your browser.',
    h1: 'Color Picker from Image',
    tagline:
      'Drop or paste an image, pick an exact source pixel with mouse, touch, or keyboard, and get a ready-to-copy palette immediately.',
    name: 'Image Color Picker',
    keywords: [
      'color picker from image',
      'image color picker',
      'image color extractor',
      'pick hex color from image',
      'image palette',
    ],
    howTo: [
      'Drop an image, choose a file, or paste a screenshot with Ctrl or ⌘ plus V.',
      'Click or tap the image to sample its exact source pixel.',
      'Use the arrow keys on the image for one-pixel adjustments, or Shift plus an arrow key for 10 pixels.',
      'Copy HEX, RGB, or HSL, then copy the automatically extracted palette as CSS variables when needed.',
    ],
    sections: [
      {
        heading: 'The picked code comes from the original image pixel',
        body: 'The preview can be smaller than the uploaded image, but a pick is mapped back to the original image coordinates before its RGB value is read. This avoids using a blurred or interpolated preview pixel. The coordinate shown beside the result is zero-based: the top-left pixel is 0, 0.\n\nHEX writes each 8-bit red, green, and blue channel as two base-16 digits. For example, #3B82F6 is rgb(59 130 246). Each channel has 256 integer values, from 0 through 255, so an opaque 24-bit RGB image can represent 16,777,216 combinations.',
      },
      {
        heading: 'How the dominant palette is made',
        body: 'For fast palette extraction, this tool samples a canvas whose longest side is at most 256 pixels. It groups similar 8-bit RGB values deterministically, then assigns all sampled pixels to the nearest displayed representative color. The percentage beside every swatch is its share of those sampled visible pixels, and the displayed percentages add to 100%.\n\nPixels below 50% opacity are excluded from the palette because their apparent color depends on the background behind them. A tiny logo detail may not become a dominant swatch; click that detail in the image to get its exact HEX, RGB, and HSL values instead.',
      },
      {
        heading: 'Choose the color notation that fits the job',
        body: 'Use HEX such as #3B82F6 for CSS, tokens, and design handoff. Use rgb(59 130 246) when working with channel values or canvas code. HSL writes the same sRGB color as hue in degrees plus saturation and lightness percentages, which can be convenient for a quick manual adjustment.\n\nA palette is a starting point, not a contrast guarantee. Before using a color for text, test it against the actual background and type size. The related Color Converter checks the WCAG contrast ratio against white and black.',
      },
    ],
    faq: [
      {
        q: 'How do I get a HEX color code from an image?',
        a: 'Add an image, then click or tap the pixel you need. This tool reads that original image pixel and shows its normalized six-digit HEX code, such as #3B82F6, alongside RGB and HSL values.',
      },
      {
        q: 'Does the image color picker upload my image?',
        a: 'No. Image decoding, exact-pixel sampling, palette extraction, and recent-pick storage run in the current browser. The image file and its pixels are not sent to a server by this tool.',
      },
      {
        q: 'Why is a small color missing from the automatic palette?',
        a: 'The palette represents the largest areas of a compact 256-pixel-long-side sample, so a tiny accent can be outweighed by a background. Click the small area directly to retrieve its exact original-pixel color code.',
      },
      {
        q: 'Can I select image colors using only a keyboard?',
        a: 'Yes. Focus the image preview, move the selection one original pixel with an arrow key, or 10 pixels with Shift plus an arrow key. The selected HEX, RGB, and HSL values update after each move.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '이미지 색상 추출 — 픽셀 컬러코드·팔레트',
    description:
      '사진·로고·스크린샷에서 원본 픽셀의 HEX·RGB·HSL 색상 코드를 뽑고 대표 색상 팔레트를 즉시 만듭니다. 이미지는 브라우저에서만 처리됩니다.',
    h1: '이미지 색상 추출',
    tagline: '이미지를 넣고 원하는 지점을 누르면 원본 픽셀의 컬러코드와 대표 색상 팔레트를 바로 확인할 수 있습니다.',
    name: '이미지 색상 추출',
    keywords: [
      '이미지 색상 추출',
      '사진 색상 추출',
      '색상 코드 추출',
      '이미지 컬러피커',
      '사진 HEX 코드',
      '이미지 팔레트',
    ],
    howTo: [
      '사진·로고·스크린샷을 끌어놓거나 파일을 선택하고, Ctrl 또는 ⌘와 V로 붙여넣습니다.',
      '이미지에서 색을 알고 싶은 픽셀을 클릭하거나 터치합니다.',
      '이미지에 포커스를 둔 뒤 방향키로 원본 픽셀 1칸, Shift와 방향키로 10칸씩 이동합니다.',
      'HEX·RGB·HSL 값을 복사하고, 필요하면 자동 추출한 팔레트를 CSS 변수로 한 번에 복사합니다.',
    ],
    sections: [
      {
        heading: '선택한 색상은 축소 미리보기가 아닌 원본 픽셀에서 읽습니다',
        body: '화면의 미리보기는 원본보다 작게 보일 수 있지만, 클릭 위치를 원본 이미지 좌표로 다시 계산한 뒤 해당 픽셀의 RGB 값을 읽습니다. 그래서 미리보기 축소 과정에서 섞인 색이 아니라 원본 픽셀의 색상 코드를 확인할 수 있습니다. 표시하는 좌표는 0부터 시작하므로 왼쪽 위 픽셀은 0, 0입니다.\n\nHEX는 8비트 빨강·초록·파랑 채널을 각각 16진수 두 자리로 적는 표기입니다. #3B82F6은 rgb(59 130 246)과 같습니다. 각 채널은 0부터 255까지 256개 정수 중 하나이므로, 불투명 24비트 RGB 색은 256³, 즉 16,777,216가지입니다.',
      },
      {
        heading: '대표 색상 팔레트는 어떻게 뽑나요?',
        body: '속도를 위해 긴 변이 최대 256픽셀이 되도록 줄인 분석용 Canvas에서 색을 셉니다. 비슷한 8비트 RGB 값을 정해진 방식으로 묶고, 모든 표본 픽셀을 가장 가까운 대표색에 다시 배정합니다. 따라서 같은 이미지와 같은 색상 수에서는 같은 팔레트가 나오며, 각 색상 옆 비율의 합은 표본의 100%입니다.\n\n투명도가 50% 미만인 픽셀은 뒤 배경에 따라 보이는 색이 달라져 팔레트에서 제외합니다. 작은 로고 장식처럼 면적이 작은 색은 대표색에 없을 수 있으니, 해당 지점을 직접 눌러 정확한 HEX·RGB·HSL 값을 확인합니다.',
      },
      {
        heading: '웹과 디자인 작업에서는 표기를 목적에 맞게 고릅니다',
        body: 'CSS·디자인 토큰에는 #3B82F6 같은 HEX가 편리하고, Canvas 코드나 채널 값을 다룰 때는 rgb(59 130 246)가 알맞습니다. HSL은 색상 각도와 채도·명도 백분율로 같은 sRGB 색을 적으므로 수동으로 약간 조정할 때 유용합니다.\n\n대표 팔레트가 곧 글자 가독성을 보장하지는 않습니다. 텍스트에 쓸 색은 실제 배경과 글자 크기에서 확인해야 하며, 관련 색상 변환기에서 흰색·검은색 배경의 WCAG 대비율을 점검할 수 있습니다.',
      },
    ],
    faq: [
      {
        q: '사진에서 HEX 색상 코드는 어떻게 찾나요?',
        a: '사진이나 스크린샷을 넣고 원하는 픽셀을 클릭하거나 터치하면 됩니다. 이 도구는 원본 픽셀을 읽어 #3B82F6처럼 정규화한 6자리 HEX 코드와 RGB·HSL 값을 함께 표시합니다.',
      },
      {
        q: '이미지를 서버에 업로드하나요?',
        a: '아니요. 이미지 디코딩, 원본 픽셀 읽기, 팔레트 계산, 최근 선택 색상 저장은 현재 브라우저에서 수행됩니다. 이 도구는 이미지 파일과 픽셀 데이터를 서버로 전송하지 않습니다.',
      },
      {
        q: '자동 팔레트에 작은 색상이 나오지 않는 이유는 무엇인가요?',
        a: '대표 팔레트는 긴 변 최대 256픽셀 표본에서 넓은 면적을 차지하는 색을 우선하므로 작은 강조색은 배경색에 밀릴 수 있습니다. 필요한 작은 부분을 직접 누르면 원본 픽셀의 정확한 색상 코드를 얻을 수 있습니다.',
      },
      {
        q: '키보드만으로 이미지 색상을 고를 수 있나요?',
        a: '네. 이미지 미리보기에 포커스를 둔 뒤 방향키로 원본 픽셀을 1칸씩, Shift와 방향키로 10칸씩 이동할 수 있습니다. 이동할 때마다 선택한 HEX·RGB·HSL 값이 갱신됩니다.',
      },
    ],
    ui: {
      uploadTitle: '이미지를 끌어놓거나 파일을 선택하세요',
      uploadHint: 'PNG, JPG, WebP, GIF, AVIF, BMP 또는 붙여넣은 스크린샷',
      shortcut: '스크린샷 붙여넣기',
      ctrlKey: 'Ctrl',
      commandKey: '⌘',
      vKey: 'V',
      loading: '이미지를 읽고 대표 색상 팔레트를 추출하는 중입니다…',
      unreadable: '이 브라우저에서 이 이미지를 읽을 수 없습니다. PNG, JPG 또는 WebP로 다시 시도하세요.',
      imageDetails: '{name} · {width} × {height} px',
      clear: '이미지 제거',
      imageTitle: '이미지 색상 선택기',
      imageInstruction: '원하는 픽셀을 클릭하거나 터치하세요. 방향키로 원본 픽셀 1칸, Shift와 함께 10칸씩 이동합니다.',
      selectedTitle: '선택한 픽셀',
      selectedPosition: '원본 픽셀 {x}, {y}',
      hex: 'HEX',
      rgb: 'RGB',
      hsl: 'HSL',
      copy: '복사',
      copied: '복사됨',
      paletteTitle: '대표 색상 팔레트',
      paletteHint: '긴 변 최대 256픽셀 표본에서 대표색을 뽑습니다. 투명도 50% 미만 픽셀은 제외합니다.',
      paletteSize: '색상 수',
      coverage: '표본 픽셀의 {percent}%',
      copyCss: 'CSS 변수 복사',
      historyTitle: '최근 선택 색상',
      historyHint: '이 브라우저에만 저장됨',
      clearHistory: '선택 색상 지우기',
      emptyHistory: '선택한 HEX 코드가 여기에 표시됩니다.',
      swatchLabel: '{hex} 색상',
    },
  },
};
