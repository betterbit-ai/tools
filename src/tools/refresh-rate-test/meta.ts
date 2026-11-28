import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'refresh-rate-test',
  category: 'device',
  icon: 'display',
  added: '2026-11-28',
  updated: '2026-11-28',
  edges: ['features', 'usability'],
  competitors: [
    {
      name: 'UFO Test — Refresh Rate',
      url: 'https://ufotest.org/refreshrate/',
      weakness:
        'Its page reports average, minimum and maximum FPS, frame time, jitter and an interval histogram, but no dropped-frame count, no nearest-standard verdict and nothing to copy into a support note; there is no moving pattern to compare smoothness by eye. (Strength: the histogram shows the full interval distribution at a glance.)',
    },
    {
      name: 'HzChecker',
      url: 'https://hzchecker.com/',
      weakness:
        'Its page asks for a reference Hz, a run name and the test conditions before it will show the result, and offers 10- or 30-second windows with saved history — a lot of form-filling for the single question “what Hz is my screen?”. (Strength: it keeps a history so repeated runs can be compared.)',
    },
    {
      name: 'PC테스트킷 주사율 테스트',
      url: 'https://pctestkit.com/refresh-rate-test/',
      weakness:
        'Its 3-second run reports a median rate and a dropped-frame count, but no fastest/slowest range, no stability share and no copyable report; when a run is broken by a hidden tab it simply restarts instead of telling you the sample was invalid. (Strength: it explains the Windows 11 and macOS refresh-rate settings in Korean.)',
    },
    {
      name: 'ScreenTester Refresh Rate Test',
      url: 'https://screentester.tools/refresh-rate-test/',
      weakness:
        'It is one page in a large screen-testing suite, so five preparation steps come before the measurement and the page offers no report to copy or run-to-run comparison; only the median rate and a stability verdict are reported. (Strength: it links straight to dead-pixel, motion-blur and flicker tests.)',
    },
    {
      name: 'cv.cm 주사율 테스트',
      url: 'https://cv.cm/ko/refresh-rate/',
      weakness:
        'Its Korean page shows a moving block and counts skipped frames, but the result is a single Hz figure with no jitter, no ±10% stability share, no nearest-standard tolerance and no report to copy. (Strength: the moving block makes judder visible immediately.)',
    },
  ],
  related: ['screen-resolution', 'dead-pixel-test', 'reaction-time-test', 'mic-test'],
};
