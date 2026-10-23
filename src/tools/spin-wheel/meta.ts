import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'spin-wheel',
  category: 'generator',
  icon: 'sparkle',
  added: '2026-10-11',
  updated: '2026-10-23',
  edges: ['usability'],
  competitors: [
    {
      name: 'Spin the Wheel Online',
      url: 'https://spinthewheelsonline.com/',
      weakness:
        'Its opened wheel places bulk paste, six customization controls, a live-activity feed, sharing, and wheel-directory links around the primary draw. Betterbit keeps the common paste-and-spin flow, default winner removal, result, and recent draws in one compact surface. (Strength: it supports up to 300 entries, 20 saved results, share links, configurable spin duration, sound, and confetti.)',
    },
    {
      name: 'Random Spin App',
      url: 'https://randomspin.app/ko/',
      weakness:
        'Its opened Korean tool exposes list splitting, shuffle, duplicate removal, multiple-winner selection, local-file saving, sharing, and a broad customization set before the draw. Betterbit starts with one paste area, an explicit removal switch, a direct full-screen action, and keyboard shortcuts. (장점: 여러 명 동시 추첨, 목록 섞기, 파일 저장·불러오기, 공유, 테마·소리·회전 시간을 지원한다.)',
    },
    {
      name: 'Wheel and Names',
      url: 'https://www.wheelandnames.com/',
      weakness:
        'Its opened tool puts importing and exporting, up to eight saved wheels, weights, multiple winners, 20-step undo, customizable appearance, and audio settings around a standard draw. Betterbit makes a one-list draw immediately legible: paste, choose whether to remove winners, spin, and see the recent result. (Strength: it supports 2–200 entries, weighted odds, CSV/JSON import and export, backups, share/embed links, and up to 100 saved results.)',
    },
  ],
  related: ['random-picker', 'team-generator', 'coin-flip', 'ladder-game'],
};
