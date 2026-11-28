import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'username-generator',
  category: 'generator',
  icon: 'sparkle',
  added: '2026-11-28',
  updated: '2026-11-28',
  edges: ['features', 'usability'],
  competitors: [
    {
      name: 'Random Username Generator (randomusername.com)',
      url: 'https://www.randomusername.com/',
      weakness:
        'Its page mixes curated names with “fresh ideas suggested by AI (marked with an AI badge)”, which means part of each batch is generated off-device, and it applies only style categories — no platform character limit or allowed-separator rule — so a suggestion can still be rejected by the form. (Strength: eleven themed style categories and keyword steering.)',
    },
    {
      name: 'Unique Username Generator',
      url: 'https://uniqueusername.com/random-username-generator/',
      weakness:
        'It builds twelve names per click and its availability “Check” opens each name’s profile page on Instagram, TikTok, X, YouTube, Twitch, Reddit and GitHub by hand, one platform at a time; it also offers no Korean nickname style and no platform length rule. (Strength: it links each candidate to a profile check.)',
    },
    {
      name: 'PrivacyKit Username Generator',
      url: 'https://privacykit.dev/tools/username-generator/',
      weakness:
        'Its four styles draw on 60 adjectives and 60 nouns — 3,600 base combinations, which its own notes call a limitation — and it has no Korean-style names and no platform character or separator presets, only a names-per-batch slider. (Strength: it is unusually transparent about its pool and uses crypto.getRandomValues.)',
    },
    {
      name: 'kakaoCalc 닉네임 생성기',
      url: 'https://kakao.mobile/tools/korean-nickname-generator/',
      weakness:
        'Its FAQ says English IDs are not supported (“이 도구는 한글 닉네임용입니다”), so one tool cannot produce a handle for an English service and a nickname for a Korean one; character counting ignores platform separator rules and the results are copy-only. (Strength: six Korean styles plus ꧁꧂ and ♡ decorations.)',
    },
    {
      name: '해치움 닉네임 생성기',
      url: 'https://haechium.com/nickname-gen',
      weakness:
        'It generates ten Korean nicknames per press from four moods (1,599 combinations in total) with a character ceiling, but has no English handle style, no per-platform rule such as Instagram’s period rule or GitHub’s hyphen rule, and no way to keep a shortlist. (Strength: it states the exact combination count for each mood and length.)',
    },
  ],
  related: ['password-generator', 'fancy-text', 'random-picker', 'lorem-ipsum'],
};
