import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'mouse-test',
  category: 'device',
  icon: 'mouse',
  added: '2026-10-18',
  updated: '2026-10-24',
  edges: ['usability'],
  competitors: [
    {
      name: 'PixelTest Mouse Test',
      url: 'https://pixeltest.net/en/mouse-test',
      weakness:
        'Its current single grey test area surfaces total clicks, CPS, pointer position and a double-click indicator, but does not show a bounded slow single-click sample, per-button shortest gap or a repeat count to interpret a suspected switch. Betterbit separates the quick all-button check from a 20-press, one-button screen. (Strength: it includes pointer-position feedback in the same compact area.)',
    },
    {
      name: 'MouseBench',
      url: 'https://mousebench.com/',
      weakness:
        'Its current page exposes separate left/right panels, press/release tables, middle-button testing, an 80 ms threshold input and a 300-event log before users complete a basic diagnosis. Betterbit makes the first comparison a fixed, controlled 20-press sample with an immediate progress and repeat summary. (Strength: it offers press/release accuracy, export and substantially deeper event logging.)',
    },
    {
      name: 'ScrollTest Mouse Test',
      url: 'https://www.scrolltest.io/mouse-test',
      weakness:
        'Its page asks users to watch a general button count while single-clicking and combines that with a separate polling-rate measurement; it does not present a bounded per-button single-click sample with a candidate-repeat total. Betterbit puts a 20-press controlled screen next to the basic check. (Strength: it adds a browser polling-rate estimate and links to a dedicated wheel workbench.)',
    },
    {
      name: 'MouseTesterOnline 마우스 테스트',
      url: 'https://mousetesteronline.com/ko/',
      weakness:
        'Its Korean page combines button, wheel, tracking and double-click exercises in one broad surface and asks users to double-click in its dedicated box. Betterbit instead guides slow single presses for one chosen button, reports progress to 20 and shows the shortest same-button gap. (Strength: it also visualizes cursor tracking and horizontal wheel tilt.)',
    },
    {
      name: 'Test My Mouse 더블 클릭 테스트',
      url: 'https://testmymouse.com/ko',
      weakness:
        'Its Korean diagnostic workspace spreads click, double-click, wheel and polling tests across four tabs and exposes a configurable 150–1000 ms threshold around the starting task. Betterbit keeps the first check focused: choose a button, make 20 slow presses and read the fixed screening result. (Strength: it provides separate click, wheel and polling-rate workspaces.)',
    },
    {
      name: 'MouseTester.io 더블클릭 테스트',
      url: 'https://mousetester.io/ko/double-click-test/',
      weakness:
        'Its visible test starts as a single generic click box with defect, double-click and single-click totals plus a log; its instructions do not provide a bounded slow single-click sample or per-button progress. Betterbit provides an explicit 20-press controlled flow for left, middle or right input. (Strength: it pairs the tester with a broader mouse-performance tool directory.)',
    },
  ],
  related: ['keyboard-tester', 'mic-test', 'webcam-test', 'dead-pixel-test'],
};
