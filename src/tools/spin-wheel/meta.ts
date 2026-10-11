import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'spin-wheel',
  category: 'generator',
  icon: 'sparkle',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['no-ads', 'usability', 'features'],
  competitors: [
    {
      name: 'Spin the Wheel Online',
      url: 'https://spinthewheelsonline.com/',
      weakness:
        'Its opened wheel places a live-activity feed, six customization controls, and bulk-paste controls around the primary draw. Betterbit keeps the common paste-and-spin flow in one compact surface and provides an explicit full-screen display. (Strength: it supports up to 300 entries, share links, weighting by duplicate entries, and more wheel controls.)',
    },
    {
      name: 'No Spin Wheel',
      url: 'https://nospinwheel.com/',
      weakness:
        'Its opened FAQ calls the experience “ad-light,” rather than ad-free. Betterbit has no advertising or referral content, while still keeping browser-local saved lists, winner removal, and full-screen mode. (Strength: it encodes the current list into a shareable URL.)',
    },
    {
      name: 'SweepsWheel',
      url: 'https://sweepswheel.com/',
      weakness:
        'The opened page puts four sweepstakes-casino offers and promotional bonus copy immediately below its spinner, and says it earns referral commissions from casinos. Betterbit has no ads or gambling referrals. (Strength: it supports sharing, swipe-to-spin, and preset wheel pages.)',
    },
    {
      name: 'Random Spin App',
      url: 'https://randomspin.app/ko/',
      weakness:
        'Its Korean search result says it skips the roulette animation when drawing more than two people. Betterbit animates every 2–100-entry wheel and keeps the full-screen control visible beside the spin action. (장점: 수업·행사 용도의 전체화면 결과 표시를 안내한다.)',
    },
    {
      name: 'JAY Project 룰렛',
      url: 'https://jay-project.kr/apps/roulette',
      weakness:
        'Its opened FAQ tells users to delete a selected entry from the list and rebuild the wheel to prevent repeat selections. Betterbit removes exactly one winner automatically after each spin when the switch is on. (장점: 점심 메뉴와 숫자 1–10 프리셋을 제공하고 crypto.getRandomValues()를 공개한다.)',
    },
    {
      name: '랜덤독 돌림판 만들기',
      url: 'https://randomdock.com/spin-wheel',
      weakness:
        'Its fetched search result promotes custom entries and automatic winner removal, but does not expose a saved-list or full-screen control in that visible tool description. Betterbit makes both local saving and room-ready full screen part of the primary interface. (장점: 자동 제외 방식의 반복 추첨을 안내한다.)',
    },
  ],
  related: ['random-picker', 'random-number', 'password-generator'],
};
