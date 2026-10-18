import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'dice-roller',
  category: 'generator',
  icon: 'sparkle',
  added: '2026-10-16',
  updated: '2026-10-16',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'Roller Dice — Online Dice Roller',
      url: 'https://www.roller-dice.com/',
      weakness:
        'Its opened page supports one die type at a time and limits a roll to 10 dice; the visible settings have no modifier, mixed-dice expression, or keep-high/keep-low control. Betterbit accepts expressions such as 2d6+d8−1 and 4d6kh3, up to 100 dice, with R to re-roll. (Strength: it provides custom d2–d1000, sound, and session statistics.)',
    },
    {
      name: 'RollQuest — Free Online Dice Roller',
      url: 'https://www.rollquest.io/dice',
      weakness:
        'Its opened roller says users click a die to add it and right-click to remove it, a pointer-specific way to edit a roll; it retains only the last five results on screen. Betterbit gives the editable notation field equal keyboard access, D&D quick-roll presets, copyable results, and a browser-local 10-roll history. (Strength: it provides 3D dice, mixed dice, a modifier, and advantage/disadvantage.)',
    },
    {
      name: 'Dice Roll Online — Dice Roller',
      url: 'https://www.dicerollonline.com/index.html',
      weakness:
        'Its opened page offers one selected die type from d4 through d100 and 1–10 dice; its visible flow has no custom-side, modifier, mixed-group, or keep rule. Betterbit supports d2–d1000, mixed expressions, numeric modifiers, and D&D keep-high/keep-low notation. (Strength: its basic d4–d100 selector is especially direct.)',
    },
    {
      name: 'Acrafto — 온라인 주사위 굴리기',
      url: 'https://acrafto.com/ko/dice-roller/',
      weakness:
        'Its opened Korean page says roll history exists only on screen and disappears on refresh. Betterbit keeps a compact latest-10 history in local browser storage, pairs it with an R shortcut and a copy action, and still makes excluded dice visible. (장점: 시드 기반 검증과 최대 1,000개·10,000면 굴림, 다양한 유지·제외 옵션을 제공한다.)',
    },
    {
      name: 'BellRiver Lab — 주사위 굴리기',
      url: 'https://bellriver.kr/dice',
      weakness:
        'Its indexed Korean result describes press-and-hold and drag gestures to control a 3D throw, adding a gesture layer to a quick result. Betterbit makes the primary action a labelled button and the R key, with an editable text expression that works without a pointer gesture. (장점: 3D 물리 표현, 개별 주사위 고정·재굴림, 확률 분포를 제공한다.)',
    },
    {
      name: '후니소프트 — 주사위 굴리기',
      url: 'https://www.jhnsoft.co.kr/random-dice/',
      weakness:
        'Its opened Korean page documents one shared die type per roll, D4–D100, 1–20 dice, and notation limited to same-kind dice plus a ±1,000 modifier. Betterbit permits different groups in the same expression, d2–d1000, up to 100 dice, and 4d6kh3/2d20kl1 keep rules. (장점: 개별 재굴림, D6 빈도 통계, 설정 공유를 제공한다.)',
    },
  ],
  related: ['random-number', 'random-picker', 'spin-wheel', 'coin-flip', 'lotto-generator'],
};
