import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'lotto-generator',
  category: 'generator',
  icon: 'sparkle',
  added: '2026-10-18',
  updated: '2026-10-18',
  edges: ['privacy', 'usability'],
  competitors: [
    {
      name: 'National-Lottery.com — Lotto Number Generator',
      url: 'https://www.national-lottery.com/lotto/generator',
      weakness:
        'Its opened generator is for the UK Lotto format—six numbers from 1–59—and exposes only a line-count dropdown and Generate action. It has no visible fixed-number or excluded-number controls for a Korean Lotto 6/45 pick. Betterbit starts in the 1–45, six-number format and lets every ball cycle through fixed and excluded states. (Strength: it directly explains the UK game’s separate Bonus Ball.)',
    },
    {
      name: 'CalculatorSoup — Lottery Number Generator',
      url: 'https://www.calculatorsoup.com/calculators/games/lottery-number-generator.php',
      weakness:
        'Its opened page lists Lotto 6/45 Korea as a six-from-45 game with one automatic play, while its documented optional control is only favorite numbers to include. Betterbit makes both fixed and excluded balls visible in the primary 6/45 interface and shows the remaining combination count before drawing. (Strength: it covers a much wider list of international lottery formats and special-ball rules.)',
    },
    {
      name: 'Lotto.net — UK Lotto Number Generator',
      url: 'https://www.lotto.net/uk-lotto/number-generator',
      weakness:
        'Its opened page generates six numbers from 1–59, supports up to four lines, and states that generated numbers are lost on refresh or when leaving the page. Betterbit retains only the current local fixed/excluded settings after refresh and provides a direct copy action for 1–5 Lotto 6/45 lines. (Strength: it pairs the UK generator with current jackpot and draw information.)',
    },
    {
      name: '해줌로또 — 로또 번호 생성기',
      url: 'https://lotto.haejum.com/',
      weakness:
        'Its opened generator asks for a nickname and says nicknames plus generated numbers are stored for its public hall of fame; it also filters every result through 19 historical-data conditions. Betterbit does not ask for an identity or send generated lines to a tool server, and makes the user’s fixed/excluded choices explicit instead of presenting historical filters as the main flow. (장점: 1,234회차 분석과 생성 조합의 적중 실적을 함께 제공한다.)',
    },
    {
      name: 'lotto-gen.com — 로또 번호 생성기',
      url: 'https://lotto-gen.com/',
      weakness:
        'Its opened guide combines trend badges, recent-draw filters, nickname publication, a hall of fame, and an option-validation view around the basic generation flow. Betterbit keeps the core choice to fixed/excluded balls and 1–5 lines in one browser-local surface, without requesting a nickname. (장점: 최근 100회차 기준 옵션 검증과 추첨 뒤 자동 확인을 안내한다.)',
    },
    {
      name: '로또한장 — 로또 번호 생성기',
      url: 'https://lottohanjang.com/',
      weakness:
        'Its opened page offers fixed and excluded numbers alongside several history-based recommendation switches and an optional Google login for automatic post-draw checking. Betterbit focuses on a smaller local 6/45 generator: each ball’s three-state selection is visible at once, the valid-combination count updates before generating, and no account field is part of the draw. (장점: 추첨 뒤 저장 번호 자동 확인, 공유, 백업과 다양한 과거회차 기반 추천 방식을 제공한다.)',
    },
  ],
  related: ['random-number', 'random-picker', 'dice-roller', 'spin-wheel'],
};
