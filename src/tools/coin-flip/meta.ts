import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'coin-flip',
  category: 'generator',
  icon: 'sparkle',
  added: '2026-10-16',
  updated: '2026-10-16',
  edges: ['usability', 'design'],
  competitors: [
    {
      name: 'Try Flip A Coin',
      url: 'https://tryflipacoin.com/',
      weakness:
        'Its opened page puts mode switching, batch-count controls, coin colour, sound, image uploads, a global counter, and a configuration panel around the basic toss. Betterbit keeps two editable choices, the one-tap action, local tally, and recent results in one compact keyboard-accessible surface. (Strength: it offers batch flips, a global live count, images, sound, and theme controls.)',
    },
    {
      name: 'Go Flip Coin',
      url: 'https://goflipcoin.com/',
      weakness:
        'Its opened page has a direct one-click toss and running Heads/Tails totals, but its visible tool has fixed Heads/Tails labels and no recent-result list. Betterbit lets users name both outcomes and keeps the latest 12 labelled results beside the cumulative local tally. (Strength: it has a very focused single-toss screen and an on-page sound option.)',
    },
    {
      name: 'Flip a Coin.com',
      url: 'https://flip-a-coin.com/',
      weakness:
        'Its opened page mixes a beta betting game, coin/background pickers, sound and music controls, country coin lists, decision coins, and up-to-100,000 batch tosses into the primary area. Betterbit makes a two-way decision, Space-key repeat flip, cumulative local statistics, and 12-result history visible without navigating that broader feature set. (Strength: it offers custom images, numerous coin types, batch flips, and result verification.)',
    },
    {
      name: '담다툴즈 동전 던지기',
      url: 'https://damdatools.com/coin-flip/',
      weakness:
        'Its indexed Korean result supports custom choices plus 10- and 100-flip batch statistics, but its result-history description is not visible in the tool summary. Betterbit keeps the latest 12 named outcomes and the cumulative tally together on the primary screen, with Space for repeat flips. (장점: 10회·100회 연속 던지기와 결과 복사를 제공한다.)',
    },
    {
      name: '툴집 동전 던지기',
      url: 'https://tooljip.com/coin-flip/',
      weakness:
        'Its indexed Korean page offers fixed 앞·뒤 results and batch presets from 10 to 10,000, but does not expose custom side labels in its visible tool summary. Betterbit turns a two-choice decision into directly editable labels while retaining local counts, a recent-result record, and keyboard-only repeat flips. (장점: 10,000회까지 한꺼번에 던지고 연속 기록을 보여 준다.)',
    },
    {
      name: 'QuickKit 랜덤 추첨기·주사위·동전 던지기',
      url: 'https://tools.quickkit.net/tools/random-picker',
      weakness:
        'Its indexed Korean result combines list drawing, dice, and coin flipping in tabs, and describes only the most recent 20 coin results. Betterbit is a dedicated two-choice tool with named outcomes, a cumulative tally, and a Space-key flip available without changing modes. (장점: 목록 추첨과 D4~D20 주사위까지 한 페이지에서 제공한다.)',
    },
  ],
  related: ['dice-roller', 'random-number', 'random-picker', 'spin-wheel'],
};
