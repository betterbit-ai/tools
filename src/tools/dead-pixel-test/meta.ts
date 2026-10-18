import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'dead-pixel-test',
  category: 'device',
  icon: 'display',
  added: '2026-10-18',
  updated: '2026-10-18',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'DeadPixelTest.pro',
      url: 'https://www.deadpixeltest.pro/test/',
      weakness:
        'Its published tester provides seven fields and a fixed three-second auto cycle; Betterbit exposes nine fields, including cyan, magenta and yellow, with a user-selectable 2, 3, 5 or 10-second cycle and Arrow/Space controls. (Strength: it provides device-specific pages and a separate stuck-pixel-fix guide.)',
    },
    {
      name: 'Ultimate Design Tools Dead Pixel Test',
      url: 'https://ultimatedesigntools.com/tools/dead-pixel-test/',
      weakness:
        'Its published test has a broad set of colour and pattern checks, but presents auto mode as a single timed setting before entering the display; Betterbit keeps the nine colour field, adjustable dwell time and previous/next keyboard actions together in one compact launch panel. (Strength: it also offers a custom colour, gray ramp and 1-pixel grid.)',
    },
    {
      name: 'Polyatic Dead Pixel Test',
      url: 'https://www.polyatic.com/dead-pixel-test/',
      weakness:
        'Its visible flow advances one screen at a time with click, tap, swipe, Space or arrow keys and does not offer an automatic colour cycle; Betterbit adds a pauseable automatic 2–10 second cycle while retaining previous/next keys. (Strength: it includes backlight-bleed, gray-ramp and 1-pixel-grid tests plus a stuck-pixel helper.)',
    },
    {
      name: 'CalcLab 모니터 불량 화소 테스트',
      url: 'https://koilab.co.kr/tools/dead-pixel-checker',
      weakness:
        'Its Korean tool describes manual previous/next colour changes and explicitly omits automatic flashing; Betterbit adds a pauseable automatic cycle with four dwell times, while keeping manual Arrow and Space controls. (Strength: its focused page explains that it does not measure uniformity or refresh rate.)',
    },
    {
      name: 'Toolbase 데드픽셀 테스트',
      url: 'https://toolbase.cc/ko/media/devices/dead_pixel_test',
      weakness:
        'Its published Korean page centres on five fields—black, white, red, green and blue—whereas Betterbit includes gray plus cyan, magenta and yellow and can cycle all nine automatically. (Strength: it gives a clear Korean explanation of dead, stuck, bright and dark pixel terms.)',
    },
    {
      name: 'PiliApp 불량화소 테스트',
      url: 'https://kr.piliapp.com/test/screen/',
      weakness:
        'Its Korean page offers six fields and states that its colours fill only the page while browser bars remain; Betterbit requests the browser Fullscreen API, falls back to the full browser window, and adds three secondary-colour fields with a controllable cycle. (Strength: it also reports browser-visible display metrics such as pixel ratio and refresh rate.)',
    },
  ],
  related: ['mic-test', 'webcam-test', 'keyboard-tester', 'mouse-test'],
};
