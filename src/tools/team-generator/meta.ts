import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'team-generator',
  category: 'generator',
  icon: 'sparkle',
  added: '2026-10-16',
  updated: '2026-10-16',
  edges: ['features'],
  competitors: [
    {
      name: 'PickerToolbox Team Generator',
      url: 'https://www.pickertoolbox.com/team-generator',
      weakness:
        'Its opened tool exposes a names box, a 2–20 team-count field, and Generate; its documented split balances headcount only and has no per-person score input or team skill-total display. Betterbit adds optional relative skill scores and shows the final team totals. (Strength: it describes a cryptographically fair Fisher–Yates shuffle and has no stated roster limit.)',
    },
    {
      name: 'RandomTeamGenerator.io',
      url: 'https://randomteamgenerator.io/',
      weakness:
        'Its opened guide offers leader markers, keep-together groups, creative names, export, and sharing, but its skill guidance is limited to marking a few strongest people as leaders; it does not provide a numeric score input or show comparable team score totals. Betterbit makes the score syntax, balancing rule, and total-score spread visible in the primary tool. (Strength: it supports keep-together groups, leaders, CSV export, and share links.)',
    },
    {
      name: 'Random Team Picker',
      url: 'https://www.randomteampicker.com/',
      weakness:
        'Its opened page puts saved-list controls, two split modes, team-name options, repeat-pairing avoidance, captains, reveal animation, and a constraints panel around the core assignment before results. Betterbit is a smaller focused surface for a pasted roster: one team-count field, an explicit score format, score totals, a copied text result, and R to reshuffle outside inputs. (Strength: it includes keep-together/apart rules, saved lists, custom names, printing, sharing, and repeat-pairing avoidance.)',
    },
    {
      name: '데일리툴즈 랜덤 선택기',
      url: 'https://www.devbegin.com/tools/random',
      weakness:
        'Its opened Korean result combines two-choice, team-splitting, and order-draw modes; the team description accepts names and a team count but does not expose per-person skill scores or team score totals. Betterbit keeps team generation separate and adds an explicit numeric balance mode. (장점: 2지선다와 순서 뽑기를 한 도구에서 함께 제공한다.)',
    },
    {
      name: 'tvinghub 팀 나누기',
      url: 'https://tvinghub.co.kr/tools/team-divider/',
      weakness:
        'Its fetched Korean tool description explicitly says there is no skill-balance algorithm; it offers even random allocation, optional leaders, and reshuffling instead. Betterbit accepts relative scores for every participant and displays each team’s total plus the final spread. (장점: 팀별 리더 뽑기와 홀수 인원 처리 방식을 안내한다.)',
    },
    {
      name: 'ImposterGames 랜덤 팀 나누기',
      url: 'https://impostergames.org/ko/team-generator',
      weakness:
        'Its opened Korean tool supports team count or size, local saving, and together/apart rules, but its visible input is a name list and it does not offer a numeric skill-score field or team-score totals. Betterbit adds that focused balance workflow. (장점: 같은 팀·다른 팀 규칙, 팀 이름 변경, 공유를 지원한다.)',
    },
  ],
  related: ['random-picker', 'spin-wheel', 'random-number', 'ladder-game'],
};
