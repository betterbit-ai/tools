import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'ladder-game',
  category: 'generator',
  icon: 'sparkle',
  added: '2026-10-18',
  updated: '2026-10-18',
  edges: ['accuracy', 'usability'],
  competitors: [
    {
      name: 'Giggleus Ladder Game',
      url: 'https://www.giggleus.com/tools/ladder-game',
      weakness:
        'Its opened English tool limits the game to 2–10 players and its fairness answer says freshly placed rungs make all match-ups equiprobable, without describing an assignment-first method. Betterbit supports 2–20 players and securely shuffles the complete one-to-one assignment before constructing the visible rungs. (Strength: it includes coffee, cleaning, order, and one-winner presets plus a direct share action.)',
    },
    {
      name: 'DropRandom Ladder Game',
      url: 'https://www.droprandom.com/ladder',
      weakness:
        'The opened English page asks for a player count, names, results, and Start, then promotes image saving, result links, embeds, and display-ad funding. Its shared-link note says the link redraws the same list next time rather than showing a copied completed mapping. Betterbit keeps setup, per-person path reveal, all-result reveal, and a copyable player-to-outcome record in one focused surface. (Strength: it supports image saving, embeddable games, and URL sharing.)',
    },
    {
      name: 'sadari.party Ghost Leg',
      url: 'https://sadari.party/en/',
      weakness:
        'Its opened English game exposes modes, winner count, complexity, individual and group reveal, sound, covered-link sharing, and a six-second GIF save before and after a draw. Betterbit has a smaller setup with paired fields retained while participant count changes, an explicit assignment-first fairness explanation, and immediate text copying for an in-person result. (Strength: it supports up to 30 players, group-chat covered links, multiple modes, sound, and GIF export.)',
    },
    {
      name: '사다리타기 게임',
      url: 'https://apps.ojj.kr/ladder/',
      weakness:
        'The opened Korean tool supports 2–30 people, but its FAQ says both changing the participant count and applying a new count clear the entered names, outcomes, and ladder. Betterbit retains the rows that remain when a participant is added or removed, and offers a copied complete result list. (장점: 최대 30명과 각 참가자별 GO, 전체 확인을 지원한다.)',
    },
    {
      name: 'RandomPick 사다리타기',
      url: 'https://randompick.kr/',
      weakness:
        'The opened Korean page requires every top and bottom field to be filled before starting, saves up to 30 presets locally, and explains that a path animation only reveals a fixed result. Its visible controls do not include a whole-result copy action or an assignment-first fairness explanation. Betterbit adds both while keeping the 2–20 paired setup on one screen. (장점: 최대 20명과 최대 30개의 기기 내 프리셋을 지원한다.)',
    },
    {
      name: '후니소프트 사다리타기 게임',
      url: 'https://www.jhnsoft.co.kr/ladder-game/',
      weakness:
        'Its opened Korean page supports 2–10 participants and lets users choose ladder length before creating the rungs. Betterbit supports 20 participants and bases every result on a cryptographically shuffled assignment, so visual rung density does not affect the chance of an outcome. (장점: 사다리 길이 선택과 한 명씩 또는 전체 결과 확인을 제공한다.)',
    },
  ],
  related: ['random-picker', 'spin-wheel', 'team-generator'],
};
