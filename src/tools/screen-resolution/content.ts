import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  resultsTitle: 'Your browser display report',
  liveHint: 'Updates when this window, orientation, or visual viewport changes.',
  refresh: 'Refresh',
  refreshShortcut: 'to refresh',
  screen: 'Screen',
  available: 'Available screen',
  layoutViewport: 'Layout viewport',
  visualViewport: 'Visual viewport',
  devicePixelRatio: 'Device pixel ratio (DPR)',
  visualViewportScale: 'Visual viewport scale',
  aspectRatio: 'Aspect ratio',
  colorDepth: 'Color depth',
  activeBreakpoint: 'Active CSS breakpoint',
  browserCssPixels: 'browser-reported CSS px',
  cssPixels: 'CSS px',
  bit: 'bit',
  standardHd: 'HD',
  standardFullHd: 'Full HD',
  standardQhd: 'QHD',
  standardWqhd: 'WQHD',
  standard4k: '4K UHD',
  standard5k: '5K',
  standard8k: '8K UHD',
  accuracyNotice:
    'These are browser-exposed values, not a guaranteed panel-native resolution or physical screen size. Scaling, page zoom, remote desktops, and browser privacy settings can change what a page receives.',
  visualViewportUnavailable:
    'This browser does not expose the Visual Viewport API. Visual viewport size and scale are unavailable.',
  copy: 'Copy report and CSS query',
  copied: 'Copied',
  copyError: 'Could not copy the report. Allow clipboard access or select and copy the values manually.',
  cssSnippet: 'CSS media query',
  unavailable: 'Unavailable',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'What Is My Screen Resolution? Viewport, DPR & Zoom',
    description:
      'Check your browser-reported screen resolution, layout and visual viewport, DPR, zoom scale, and active CSS breakpoint live. Copy a clear report and media query.',
    h1: 'What Is My Screen Resolution?',
    tagline:
      'See the browser’s screen, viewport, DPR, and zoom readings side by side—without confusing CSS pixels with a panel’s native resolution.',
    name: 'Screen Resolution Checker',
    keywords: [
      'what is my screen resolution',
      'screen resolution checker',
      'screen size in pixels',
      'viewport size checker',
      'device pixel ratio checker',
      'browser zoom checker',
      'screen resolution test',
      'CSS breakpoint checker',
    ],
    howTo: [
      'Open this page to read the current browser-reported screen and viewport values.',
      'Resize the browser window, rotate a device, or pinch-zoom to watch the relevant readings update.',
      'Use the layout viewport and active CSS breakpoint when reproducing a responsive-layout issue.',
      'Select Copy report and CSS query to paste the values and current media-query range into a bug report or test note.',
    ],
    sections: [
      {
        heading: 'Screen, layout viewport, and visual viewport are different rectangles',
        body: 'A browser exposes more than one size. Screen width and height describe the screen area the browser exposes; available screen removes space reserved by the operating system where that information is available. The layout viewport is the coordinate area used to lay out a page, so CSS width media queries respond to it—not to the monitor’s advertised pixel count. The visual viewport is the part of that layout currently visible. On a phone or when magnified, it can be smaller than the layout viewport. Current Chrome, Safari, and Firefox expose the Visual Viewport API; if another browser omits it, this tool shows those readings as unavailable instead of substituting layout values. CSSOM View defines these API dimensions in CSS pixels and allows browsers to reduce the screen information they expose for privacy, so this report deliberately labels the source instead of claiming a hardware measurement.',
      },
      {
        heading: 'DPR and zoom explain why the same device can show different numbers',
        body: 'Device pixel ratio (DPR) relates device pixels to CSS pixels used for layout. A DPR of 2 commonly lets one 100 × 100 CSS-pixel box use a 200 × 200 device-pixel drawing area, which is why high-density displays can look sharp without doubling every CSS dimension. Page zoom can change DPR, while pinch zoom is represented by the visual viewport scale and can shrink the visible viewport without changing the layout viewport. Moving a window between displays, operating-system scaling, browser zoom, remote-desktop sessions, and anti-fingerprinting protections can all affect a browser reading. Multiplying values is therefore useful for rendering context, but it cannot prove a monitor’s native panel grid.',
      },
      {
        heading: 'Use the copied media query for a reproducible responsive test',
        body: 'The breakpoint card uses the common 640, 768, 1024, 1280, and 1536 CSS-pixel thresholds. It reports the current layout viewport range and copies a bounded query such as @media (min-width: 1024px) and (max-width: 1279.98px). That range is more useful for a web-layout report than saying only “1920 × 1080”, because browser chrome, split-screen mode, and sidebars can make the layout viewport much narrower than the exposed screen. The query is a starting point for reproducing the same width range; a real component may also depend on height, container queries, font loading, or browser-specific behavior.',
      },
    ],
    faq: [
      {
        q: 'Why does this screen-resolution checker show a smaller value than my monitor specification?',
        a: 'Browser screen APIs usually report CSS-pixel dimensions, which can be lower than a monitor’s physical panel grid when operating-system scaling or high-DPI rendering is active. Compare the DPR, browser zoom, and operating-system display setting before assuming the monitor is using the wrong resolution.',
      },
      {
        q: 'What is the difference between screen resolution and viewport size?',
        a: 'Screen resolution here is the CSS-pixel screen area exposed to the browser, while the layout viewport is the CSS-pixel area used by the current browser window to lay out the page. CSS width media queries use the layout viewport, which can be much smaller than the screen in a non-maximized or split window.',
      },
      {
        q: 'What does a device pixel ratio of 2 mean?',
        a: 'A device pixel ratio of 2 means the browser maps one CSS pixel to roughly 2 × 2 device pixels for drawing, or about 4 device pixels by area. It improves rendering detail but does not alone identify the display’s native resolution because zoom and operating-system scaling can change the relationship.',
      },
      {
        q: 'Can a website determine my monitor size in inches or its native resolution?',
        a: 'A normal webpage cannot reliably determine a monitor’s physical diagonal in inches or prove its native panel resolution. Browser APIs report web-exposed CSS-pixel values that can be altered by scaling, zoom, remote-desktop software, and privacy protections; use the monitor specification or operating-system display settings for hardware confirmation.',
      },
      {
        q: 'Why is the visual viewport smaller than the layout viewport?',
        a: 'The visual viewport is the portion of the laid-out page currently visible. Pinch zoom, on-screen browser controls, and mobile keyboard or magnification behavior can make it smaller than the layout viewport even when the page layout itself still uses the larger CSS-pixel width.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '화면 해상도 확인 — 뷰포트·DPR·브라우저 배율',
    description:
      '내 화면 해상도와 레이아웃·시각 뷰포트, DPR, 브라우저 배율, 현재 CSS 중단점을 실시간으로 확인하세요. 보고서와 미디어 쿼리를 바로 복사합니다.',
    h1: '화면 해상도 확인',
    tagline:
      '브라우저가 보고한 화면·뷰포트·DPR·배율을 한눈에 확인하고, CSS 픽셀과 모니터의 실제 패널 해상도를 구분합니다.',
    name: '화면 해상도 확인',
    keywords: [
      '내 화면 해상도 확인',
      '모니터 해상도 확인',
      '화면 해상도 확인 사이트',
      '화면 크기 픽셀 확인',
      '뷰포트 크기 확인',
      'DPR 확인',
      '브라우저 배율 확인',
      'CSS 브레이크포인트 확인',
    ],
    howTo: [
      '페이지를 열어 현재 브라우저가 보고한 화면과 뷰포트 값을 확인합니다.',
      '창 크기를 바꾸거나 기기를 회전하거나 손가락으로 확대해 관련 값이 바뀌는지 확인합니다.',
      '반응형 화면 문제를 재현할 때는 레이아웃 뷰포트와 현재 CSS 중단점을 기준으로 삼습니다.',
      '오류 보고나 테스트 메모에 붙여 넣을 때는 보고서 및 CSS 쿼리 복사를 누릅니다.',
    ],
    sections: [
      {
        heading: '화면·레이아웃 뷰포트·시각 뷰포트는 서로 다른 영역입니다',
        body: '브라우저는 한 가지 크기만 알려 주지 않습니다. 화면 너비와 높이는 브라우저에 공개된 화면 영역이고, 사용 가능 화면은 운영체제가 예약한 영역을 제외해 제공할 수 있는 값입니다. 레이아웃 뷰포트는 웹페이지를 배치하는 좌표 영역이므로 CSS의 width 미디어 쿼리는 모니터에 적힌 해상도가 아니라 이 값을 기준으로 동작합니다. 시각 뷰포트는 그 레이아웃 중 현재 실제로 보이는 부분입니다. 휴대폰에서 확대하면 레이아웃 뷰포트보다 작아질 수 있습니다. 현재 Chrome·Safari·Firefox는 시각 뷰포트 API를 제공하며, 다른 브라우저에서 이 API가 없으면 레이아웃 값으로 대체하지 않고 확인 불가로 표시합니다. CSSOM View 규격은 이 API 값의 단위를 CSS 픽셀로 정하며, 브라우저는 개인정보 보호를 위해 화면 정보를 줄여서 제공할 수도 있으므로 이 도구는 하드웨어 측정값이라고 단정하지 않습니다.',
      },
      {
        heading: 'DPR과 확대 배율이 같은 기기에서 다른 숫자를 만드는 이유',
        body: '기기 픽셀 비율(DPR)은 레이아웃에 쓰는 CSS 픽셀과 기기 픽셀의 관계입니다. DPR이 2이면 보통 100 × 100 CSS 픽셀 상자가 가로세로 각각 약 200개의 기기 픽셀로 그려져 고밀도 화면에서 더 선명하게 보일 수 있습니다. 페이지 확대는 DPR을 바꿀 수 있지만, 핀치 확대는 시각 뷰포트 배율로 나타나며 레이아웃 뷰포트 너비를 바꾸지 않을 수 있습니다. 다른 모니터로 창을 옮기기, 운영체제 배율, 브라우저 확대, 원격 데스크톱, 지문 추적 방지 기능도 브라우저가 주는 값에 영향을 줍니다. 따라서 곱셈 결과는 렌더링 상황을 이해하는 데 쓰되, 모니터 패널의 네이티브 격자를 증명하는 값으로 보면 안 됩니다.',
      },
      {
        heading: '복사한 미디어 쿼리로 반응형 문제를 다시 확인하세요',
        body: '중단점 카드는 널리 쓰는 640·768·1024·1280·1536 CSS 픽셀 기준을 적용합니다. 현재 레이아웃 뷰포트가 속한 범위를 보여 주고, 예를 들어 @media (min-width: 1024px) and (max-width: 1279.98px)처럼 상한을 포함한 쿼리를 복사합니다. 브라우저 도구막대, 화면 분할, 사이드바 때문에 레이아웃 뷰포트는 화면 해상도보다 훨씬 좁을 수 있으므로, 단순히 1920 × 1080이라고 전달하는 것보다 이 범위가 웹 레이아웃 문제 재현에 더 직접적입니다. 실제 컴포넌트는 높이, 컨테이너 쿼리, 글꼴 로딩, 브라우저별 동작에도 영향을 받을 수 있습니다.',
      },
    ],
    faq: [
      {
        q: '모니터 사양보다 화면 해상도가 작게 나오는 이유는 무엇인가요?',
        a: '브라우저의 화면 API는 운영체제 배율이나 고밀도 렌더링이 적용된 CSS 픽셀 값을 보고할 수 있으므로 모니터의 물리 패널 해상도보다 작게 보일 수 있습니다. 모니터가 잘못된 해상도로 동작한다고 판단하기 전에 DPR, 브라우저 확대, 운영체제 디스플레이 설정을 함께 확인해야 합니다.',
      },
      {
        q: '화면 해상도와 뷰포트 크기는 무엇이 다른가요?',
        a: '이 도구의 화면 해상도는 브라우저에 공개된 CSS 픽셀 화면 영역이고, 레이아웃 뷰포트는 현재 브라우저 창이 페이지를 배치하는 CSS 픽셀 영역입니다. CSS width 미디어 쿼리는 레이아웃 뷰포트를 사용하므로 창을 최대화하지 않거나 화면을 분할하면 화면 해상도보다 훨씬 작을 수 있습니다.',
      },
      {
        q: 'DPR이 2라는 것은 무슨 뜻인가요?',
        a: 'DPR이 2이면 브라우저가 CSS 픽셀 1개를 그릴 때 가로세로 각각 약 2개의 기기 픽셀, 즉 면적으로 약 4개의 기기 픽셀을 쓴다는 뜻입니다. 다만 확대와 운영체제 배율이 관계를 바꿀 수 있으므로 DPR 하나만으로 모니터의 네이티브 해상도를 알 수는 없습니다.',
      },
      {
        q: '웹사이트에서 모니터 인치나 실제 네이티브 해상도를 알 수 있나요?',
        a: '일반 웹페이지는 모니터의 실제 대각선 인치나 패널의 네이티브 해상도를 신뢰성 있게 알아낼 수 없습니다. 브라우저 API 값은 배율, 확대, 원격 데스크톱, 개인정보 보호 설정의 영향을 받을 수 있으므로 하드웨어 사양은 모니터 제품 정보나 운영체제 디스플레이 설정으로 확인해야 합니다.',
      },
      {
        q: '시각 뷰포트가 레이아웃 뷰포트보다 작은 이유는 무엇인가요?',
        a: '시각 뷰포트는 배치가 끝난 페이지 중 현재 화면에 실제로 보이는 부분입니다. 핀치 확대, 모바일 브라우저의 화면 제어 영역, 가상 키보드와 확대 동작 때문에 페이지 레이아웃은 더 큰 CSS 픽셀 너비를 유지해도 시각 뷰포트는 더 작아질 수 있습니다.',
      },
    ],
    ui: {
      resultsTitle: '브라우저 화면 정보',
      liveHint: '이 창의 크기, 기기 방향 또는 시각 뷰포트가 바뀌면 값도 갱신됩니다.',
      refresh: '새로 고침',
      refreshShortcut: '키로 새로 고침',
      screen: '화면',
      available: '사용 가능 화면',
      layoutViewport: '레이아웃 뷰포트',
      visualViewport: '시각 뷰포트',
      devicePixelRatio: '기기 픽셀 비율(DPR)',
      visualViewportScale: '시각 뷰포트 배율',
      aspectRatio: '화면 비율',
      colorDepth: '색 심도',
      activeBreakpoint: '현재 CSS 중단점',
      browserCssPixels: '브라우저 보고 CSS px',
      cssPixels: 'CSS px',
      bit: '비트',
      standardHd: 'HD',
      standardFullHd: 'Full HD',
      standardQhd: 'QHD',
      standardWqhd: 'WQHD',
      standard4k: '4K UHD',
      standard5k: '5K',
      standard8k: '8K UHD',
      accuracyNotice:
        '이 값은 브라우저에 공개된 정보이며 패널의 네이티브 해상도나 실제 화면 크기를 보장하지 않습니다. 운영체제 배율, 페이지 확대, 원격 데스크톱, 브라우저 개인정보 보호 설정에 따라 페이지가 받는 값이 달라질 수 있습니다.',
      visualViewportUnavailable:
        '이 브라우저는 시각 뷰포트 API를 제공하지 않아 시각 뷰포트 크기와 배율을 확인할 수 없습니다.',
      copy: '보고서와 CSS 쿼리 복사',
      copied: '복사됨',
      copyError: '보고서를 복사하지 못했습니다. 클립보드 접근을 허용하거나 값을 직접 선택해 복사하세요.',
      cssSnippet: 'CSS 미디어 쿼리',
      unavailable: '확인 불가',
    },
  },
};
