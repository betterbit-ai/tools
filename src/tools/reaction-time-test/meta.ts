import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'reaction-time-test',
  category: 'device',
  icon: 'zap',
  added: '2026-10-28',
  updated: '2026-10-28',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'ReactionTests',
      url: 'https://reactiontests.co/',
      weakness:
        'Its current five-attempt reaction page visibly reports an average and best time, but not a median, session spread, or a stated research-reference percentile. Betterbit puts all four measures in the finished five-round summary and labels the percentile as a laboratory reference rather than a site ranking. (Strength: it has a large gaming-test library and a daily challenge.)',
    },
    {
      name: 'ReactionBench',
      url: 'https://reactionbench.com/tests',
      weakness:
        'Its current classic test listing describes a five-round median result, while the main choice is a directory of 13 separate test formats. Betterbit opens straight into the classic visual test and combines average, median, fastest-to-slowest spread, and a qualified reference percentile in one result. (Strength: it has sound, choice, driving and sport-specific reaction tests.)',
    },
    {
      name: 'Altto Reaction Time Test',
      url: 'https://altto.co.uk/reaction-time-test',
      weakness:
        'Its current five-round page shows average, fastest and slowest results plus several other modes, but the visible result summary does not provide a median, calculated session spread, or a cited laboratory-reference percentile. Betterbit exposes those measures together and explains their calculation below the tool. (Strength: it offers sound, choice and aim modes and score challenges.)',
    },
    {
      name: 'PlayMinute 반응속도 테스트',
      url: 'https://playminute.kr/games/reaction-time/',
      weakness:
        'Its current Korean flow automatically starts with a three-second countdown and reports three rounds, an average and one best time. Betterbit lets the user deliberately start each of five randomized rounds and adds median, spread and a clearly qualified research-reference percentile. (Strength: it explains that its score bands are only game guidance and keeps a browser-only personal best.)',
    },
    {
      name: '해치움 반응속도 테스트',
      url: 'https://haechium.com/reaction-time',
      weakness:
        'Its current Korean page presents a five-round average, fastest and slowest result and backup/export actions, but the visible summary does not show a median, calculated spread, or a stated research-reference percentile. Betterbit keeps the first-run summary compact and explains the reference model before any comparison claim. (Strength: it offers browser-data backup, restore and spreadsheet export.)',
    },
    {
      name: 'A2Z Studio 반응속도 테스트',
      url: 'https://a2z-studio.com/tools/reaction',
      weakness:
        'Its current Korean page compares a five-round average with age-based guidance and warns about device latency, but its entry result description does not include a session median or fastest-to-slowest spread. Betterbit shows both alongside the average and labels its separate research percentile as only a laboratory reference. (Strength: it foregrounds an age-oriented explanation and practical same-device comparison advice.)',
    },
  ],
  related: ['click-speed-test', 'mouse-test', 'keyboard-tester'],
};
