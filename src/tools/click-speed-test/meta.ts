import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'click-speed-test',
  category: 'device',
  icon: 'mouse',
  added: '2026-10-27',
  updated: '2026-10-27',
  edges: ['no-signup', 'usability'],
  competitors: [
    {
      name: 'CPS Test',
      url: 'https://cpstest.app/5-seconds/',
      weakness:
        'Its current 5-second page puts live and local leaderboards, a name field, a sign-in action, country competition, and links to mobile apps and a Chrome extension around the test. Betterbit keeps a private per-length best in one compact test panel and makes Space and Enter count after the pad is focused. (Strength: it has 1–900-second routes, a live chart, published aggregate statistics and competitive modes.)',
    },
    {
      name: 'Check CPS',
      url: 'https://checkcps.com/',
      weakness:
        'Its current English flow tells a guest that scores will not be saved to global rankings and presents Log In and Register actions before competing. Betterbit saves a personal best locally for each of its five lengths without an account, while keeping the fixed-duration calculation visible in the result. (Strength: it has global rankings, a previous-record table and dedicated spacebar, typing, reaction and aim tests.)',
    },
    {
      name: 'Human Benchmark Click Speed',
      url: 'https://humanbenchmark.now/tests/click-speed',
      weakness:
        'Its current click-speed test is a single five-second standard round; the visible test surface offers no duration selector or keyboard operation note. Betterbit lets users compare 1, 5, 10, 30 and 60-second runs and supports Tab, Space and Enter directly on the test pad. (Strength: it clearly distinguishes repeated clicking from reaction time and aiming, and links to a public leaderboard.)',
    },
    {
      name: '캔통 클릭 속도 테스트',
      url: 'https://cantong.app/apps/cps/',
      weakness:
        'Its current Korean page offers 5-second and 10-second choices, with leaderboard registration limited to the 10-second mode. Betterbit adds 1, 30 and 60-second modes, keeps every personal best on the device, and offers mouse, touch and focused keyboard input in the same pad. (Strength: it shows a live CPS value and the fastest one-second burst, plus an optional public ranking.)',
    },
    {
      name: 'Check CPS CPS 테스트',
      url: 'https://checkcps.com/ko',
      weakness:
        'Its current Korean page tells guests to log in or sign up to save and compete in global rankings, while the central test is surrounded by ranking and recent-test sections. Betterbit stores a per-duration personal best in the browser without a profile and exposes the score formula beside the result. (Strength: it supports 1, 5, 10, 30 and 60-second modes, score history and a broader game-test directory.)',
    },
    {
      name: 'CPS King CPS 테스트',
      url: 'https://cpsking.com/ko',
      weakness:
        'Its current Korean result opens a broad configuration surface with custom time, rounds, pad size, sound, effects, contrast and left-handed settings around the first run. Betterbit makes the quick path only five duration choices, one test pad, clear fixed-time results and Tab/Space/Enter operation. (Strength: it offers custom durations up to 600 seconds, input modes, many visual settings and shareable challenges.)',
    },
  ],
  related: ['mouse-test', 'keyboard-tester', 'typing-test', 'reaction-time-test'],
};
