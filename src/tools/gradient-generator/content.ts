import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  previewAlt: 'Gradient preview',
  typeLabel: 'Gradient type',
  typeLinear: 'Linear',
  typeRadial: 'Radial',
  typeConic: 'Conic',
  angleLabel: 'Angle',
  angleHint: '0° points up, 90° right, 180° down. For conic it is the starting angle.',
  angleHiddenHint: 'A radial gradient spreads from the centre, so it has no angle.',
  interpolationLabel: 'Blend in',
  interpolationHint: 'OKLCH keeps the middle of a gradient bright; sRGB is the older default.',
  interpolationOklch: 'OKLCH',
  interpolationSrgb: 'sRGB',
  stopsHeading: 'Color stops',
  addStop: 'Add stop',
  removeStop: 'Remove stop',
  stopColor: 'Stop color',
  stopHex: 'Stop HEX',
  stopPosition: 'Stop position (%)',
  stopsHint: 'Two stops at the same position make a hard edge — that is how stripes and pie slices are drawn.',
  comparisonSrgb: 'sRGB blend (older definition)',
  comparisonOklch: 'OKLCH blend (copied CSS)',
  comparisonHint:
    'Both strips are the same colors and stops. The top one is what a browser without CSS Color 4 interpolation shows, and what most generators still give you.',
  cssHeading: 'CSS',
  copyCss: 'Copy CSS',
  copyValue: 'Copy gradient value',
  copied: 'Copied',
  presetsLabel: 'Presets',
  presetLoad: 'Load preset',
  savedLocally: 'Saved in this browser only',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'CSS Gradient Generator — Linear, Radial, Conic in OKLCH',
    description:
      'Build a linear, radial or conic gradient, blend it in OKLCH so the middle stays bright, and copy CSS that includes a pre-blended fallback line. No sign-up, no uploads.',
    h1: 'CSS Gradient Generator',
    tagline:
      'Pick colors and stops, see what OKLCH interpolation does to the middle of the gradient, and copy CSS that works in new and old browsers.',
    name: 'CSS Gradient Generator',
    keywords: [
      'css gradient generator',
      'linear gradient generator',
      'radial gradient css',
      'conic gradient',
      'oklch gradient',
      'gradient css code',
      'background gradient',
    ],
    howTo: [
      'Choose linear, radial or conic, and set the angle (radial gradients have none).',
      'Set each color stop and its position; add up to 10 stops.',
      'Compare the sRGB strip with the OKLCH strip and keep the blend you want.',
      'Press Copy CSS — the block includes a solid fallback, a pre-blended sRGB line and the modern line.',
    ],
    sections: [
      {
        heading: 'What “in oklch” changes about a gradient',
        body: 'Until recently, CSS mixed gradient stops in sRGB, channel by channel. That is why red to green passes through olive and blue to yellow looks washed out: the straight line between two sRGB colors often goes through a duller color. CSS Color 4 adds an interpolation method — `linear-gradient(135deg in oklch, …)` — that mixes in OKLCH instead, where lightness, chroma and hue stay meaningful and the midpoint keeps its brightness.\n\nThe comparison strips on this page are the same stops drawn both ways, so you can judge it before you copy anything.',
      },
      {
        heading: 'Why two background-image lines',
        body: 'Browsers that understand the interpolation method use the last declaration; older ones drop it as invalid and keep the previous one. So the copied block is: a solid `background-color`, then a pre-blended sRGB gradient whose 13 stops were sampled from the OKLCH ramp (not from the sRGB blend), then the `in oklch` version. An old browser shows an approximation with the right brightness instead of a gradient that suddenly looks different.\n\nIf you choose the sRGB blend, the block is two lines: the solid color and one `background-image` that every browser reads the same way.',
      },
      {
        heading: 'Angles, shapes and what each type is for',
        body: '`linear-gradient` measures its angle clockwise from the top: 0° runs bottom to top, 90° left to right, 180° top to bottom, and 135° is the usual diagonal for hero sections. `radial-gradient(circle at 50% 50%, …)` spreads from a point — a spotlight, a glow or a vignette — and has no angle because it is symmetric. `conic-gradient(from 45deg at 50% 50%, …)` sweeps around the centre like a clock hand, which is how color wheels, pie charts and progress rings are built.\n\nA gradient is an image: it belongs in `background-image` (or the `background` shorthand), not `background-color`. Text on top keeps its own `color`; if the gradient is behind text, check the contrast at the lightest point, not just at the average color.',
      },
    ],
    faq: [
      {
        q: 'Why does a blue-to-yellow gradient look grey in the middle?',
        a: 'Because sRGB mixes the channels directly, and a straight line between blue and yellow passes through low-chroma colors. Choosing the OKLCH blend (or `in oklab`) makes the middle keep its saturation and brightness. Every browser released since 2023 supports it, and the copied CSS includes an sRGB fallback for older ones.',
      },
      {
        q: 'Which angle should I use for a diagonal gradient?',
        a: '135deg runs from the top-left corner toward the bottom-right, which is the common hero-section look. CSS measures angles clockwise from the top: 0deg is bottom-to-top, 90deg left-to-right, 180deg top-to-bottom, 270deg right-to-left.',
      },
      {
        q: 'How do I make stripes or a pie chart?',
        a: 'Put two stops at the same position — `#f00 25%, #00f 25%` — and the color changes abruptly there. Repeat the pattern around the circle with conic stops (`#f00 0% 25%, #00f 25% 50%, …`) to draw pie slices, since conic-gradient rotates around the centre.',
      },
      {
        q: 'Does a gradient make my page slower?',
        a: 'No. A CSS gradient is painted by the browser at render time, so it costs no download and stays sharp at any size. A 200 KB background photo with a gradient overlay does cost bandwidth; replacing the photo with a gradient does not.',
      },
      {
        q: 'Can I use the gradient on text or a border?',
        a: 'Yes. For text: set `background-image` to the gradient, add `background-clip: text` (and `-webkit-background-clip: text` for older Safari) and `color: transparent`. For a border: use the same gradient in `border-image` with `border-image-slice: 1`, or an inner box that covers the middle of a padded gradient.',
      },
      {
        q: 'How many color stops can I use?',
        a: 'CSS itself allows any number; this tool caps the editor at 10 because a gradient with more colors usually looks muddy rather than smooth. If you need a repeat, use `repeating-linear-gradient` with positions in px instead of %.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'CSS 그라데이션 생성기 — 선형·원형·원뿔형, OKLCH 보간',
    description:
      '선형·원형·원뿔형 그라데이션을 만들고 OKLCH로 섞어 중간색이 탁해지지 않게 합니다. 구형 브라우저용 대체 코드까지 포함한 CSS를 바로 복사합니다.',
    h1: 'CSS 그라데이션 생성기',
    tagline:
      '색과 위치를 정하고, OKLCH 보간이 중간색을 어떻게 바꾸는지 비교한 뒤 새 브라우저와 옛 브라우저 모두에서 동작하는 CSS를 복사하세요.',
    name: 'CSS 그라데이션 생성기',
    keywords: [
      '그라데이션 생성기',
      'css 그라데이션',
      'linear-gradient',
      '원형 그라데이션',
      'oklch 그라데이션',
      '배경 그라데이션 코드',
      '그라디언트 만들기',
    ],
    howTo: [
      '선형·원형·원뿔형 중에서 고르고 각도를 정하세요(원형은 각도가 없습니다).',
      '색상 지점과 위치를 정하세요. 최대 10개까지 추가할 수 있습니다.',
      'sRGB 띠와 OKLCH 띠를 비교하고 원하는 쪽을 고르세요.',
      'CSS 복사를 누르면 단색 대체, 미리 섞은 sRGB 줄, 최신 브라우저용 줄이 한 번에 복사됩니다.',
    ],
    sections: [
      {
        heading: '“in oklch”가 그라데이션을 바꾸는 방식',
        body: '최근까지 CSS는 그라데이션 지점을 sRGB에서 채널 단위로 섞었습니다. 그래서 빨강에서 초록으로 가는 그라데이션은 중간에 올리브색을 지나고, 파랑에서 노랑으로 가면 중간이 탁해 보입니다. 두 sRGB 색을 잇는 직선이 채도가 낮은 색을 지나기 때문입니다. CSS Color 4는 보간 방식을 지정하는 문법(`linear-gradient(135deg in oklch, …)`)을 추가했습니다. OKLCH에서 섞으면 밝기·채도·색상이 각각 의미를 유지하므로 중간색이 살아 있습니다.\n\n이 페이지의 비교 띠는 같은 지점을 두 방식으로 그린 것입니다. 복사하기 전에 차이를 직접 확인하세요.',
      },
      {
        heading: 'background-image 줄이 두 개인 이유',
        body: '보간 방식을 이해하는 브라우저는 마지막 선언을 쓰고, 모르는 브라우저는 그 줄을 무효로 보고 앞의 선언을 유지합니다. 그래서 복사되는 코드는 단색 `background-color`, OKLCH 램프에서 13개 지점을 뽑아 만든 sRGB 그라데이션, 그리고 `in oklch` 줄 순서입니다. 옛 브라우저에서도 밝기가 비슷한 근사값이 보이지, 갑자기 다른 색의 그라데이션이 보이지는 않습니다.\n\nsRGB 보간을 고르면 단색과 `background-image` 한 줄, 두 줄만 나옵니다. 어느 브라우저에서나 같은 결과입니다.',
      },
      {
        heading: '각도와 종류별 쓰임',
        body: '`linear-gradient`의 각도는 위쪽을 기준으로 시계 방향입니다. 0°는 아래에서 위로, 90°는 왼쪽에서 오른쪽, 180°는 위에서 아래로 향하고, 히어로 영역에서는 대각선인 135°를 가장 많이 씁니다. `radial-gradient(circle at 50% 50%, …)`는 한 점에서 퍼지므로 스포트라이트·글로우·비네트에 쓰고 대칭이라 각도가 없습니다. `conic-gradient(from 45deg at 50% 50%, …)`는 시계침처럼 중심을 돌며 칠해져 색상환·파이 차트·진행 링을 만들 때 씁니다.\n\n그라데이션은 이미지이므로 `background-color`가 아니라 `background-image`(또는 `background` 축약)에 넣습니다. 위에 올리는 글자는 별도의 `color`를 쓰며, 글자가 그라데이션 위에 온다면 평균색이 아니라 가장 밝은 지점에서 대비를 확인하세요.',
      },
    ],
    faq: [
      {
        q: '파랑에서 노랑으로 가는 그라데이션 중간이 왜 회색처럼 보이나요?',
        a: 'sRGB가 채널을 그대로 섞기 때문입니다. 파랑과 노랑을 잇는 직선은 채도가 낮은 색을 지납니다. OKLCH(또는 OKLab) 보간을 고르면 중간색의 채도와 밝기가 유지됩니다. 2023년 이후 브라우저는 모두 지원하고, 복사하는 CSS에는 옛 브라우저용 대체 줄도 함께 들어갑니다.',
      },
      {
        q: '대각선 그라데이션 각도는 몇 도가 좋나요?',
        a: '135deg가 왼쪽 위에서 오른쪽 아래로 향해 히어로 영역에서 흔히 쓰입니다. CSS 각도는 위쪽 기준 시계 방향이라 0deg는 아래→위, 90deg는 왼쪽→오른쪽, 180deg는 위→아래, 270deg는 오른쪽→왼쪽입니다.',
      },
      {
        q: '줄무늬나 파이 차트는 어떻게 만드나요?',
        a: '같은 위치에 지점 두 개를 두면(`#f00 25%, #00f 25%`) 그 자리에서 색이 딱 바뀝니다. 원형으로 돌려 파이 조각을 만들려면 `conic-gradient`에서 `#f00 0% 25%, #00f 25% 50%, …`처럼 위치를 두 개씩 쓰세요.',
      },
      {
        q: '그라데이션을 쓰면 페이지가 느려지나요?',
        a: '아니요. CSS 그라데이션은 브라우저가 그리는 이미지라 다운로드가 없고 어떤 크기에서도 선명합니다. 다만 200KB짜리 배경 사진을 그라데이션으로 바꾸면 오히려 전송량이 줄어듭니다.',
      },
      {
        q: '글자나 테두리에 그라데이션을 넣을 수 있나요?',
        a: '가능합니다. 글자는 `background-image`에 그라데이션을 넣고 `background-clip: text`(옛 Safari용 `-webkit-background-clip: text`도 함께)와 `color: transparent`를 쓰면 됩니다. 테두리는 `border-image`에 같은 그라데이션을 넣고 `border-image-slice: 1`을 지정하거나, 안쪽 박스로 가운데를 덮는 방법을 씁니다.',
      },
      {
        q: '색상 지점은 몇 개까지 쓸 수 있나요?',
        a: 'CSS 자체에는 제한이 없지만, 이 도구는 편집을 10개까지로 제한합니다. 색이 너무 많으면 부드럽기보다 탁해 보이기 때문입니다. 반복 패턴이 필요하면 `repeating-linear-gradient`에 % 대신 px 위치를 쓰세요.',
      },
    ],
    ui: {
      previewAlt: '그라데이션 미리보기',
      typeLabel: '그라데이션 종류',
      typeLinear: '선형',
      typeRadial: '원형',
      typeConic: '원뿔형',
      angleLabel: '각도',
      angleHint: '0°는 위쪽, 90°는 오른쪽, 180°는 아래쪽입니다. 원뿔형에서는 시작 각도입니다.',
      angleHiddenHint: '원형 그라데이션은 중심에서 퍼지므로 각도가 없습니다.',
      interpolationLabel: '보간 방식',
      interpolationHint: 'OKLCH는 중간색을 살리고, sRGB는 기존 기본값입니다.',
      interpolationOklch: 'OKLCH',
      interpolationSrgb: 'sRGB',
      stopsHeading: '색상 지점',
      addStop: '지점 추가',
      removeStop: '지점 삭제',
      stopColor: '지점 색',
      stopHex: '지점 HEX',
      stopPosition: '지점 위치(%)',
      stopsHint: '같은 위치에 지점을 두 개 두면 그 자리에서 색이 끊깁니다. 줄무늬와 파이 조각을 이렇게 만듭니다.',
      comparisonSrgb: 'sRGB 보간(예전 방식)',
      comparisonOklch: 'OKLCH 보간(복사할 CSS)',
      comparisonHint:
        '두 띠는 색과 위치가 같습니다. 위쪽은 CSS Color 4 보간을 모르는 브라우저가 보여 주는 결과이며, 대부분의 생성기가 아직 내놓는 값입니다.',
      cssHeading: 'CSS',
      copyCss: 'CSS 복사',
      copyValue: '그라데이션 값 복사',
      copied: '복사했습니다',
      presetsLabel: '프리셋',
      presetLoad: '프리셋 불러오기',
      savedLocally: '이 브라우저에만 저장됨',
    },
  },
};
