import type { ToolMeta, ToolVariant } from '../types';

const variants: ToolVariant[] = [
  {
    slug: 'no-repeats',
    preset: { min: 1, max: 100, count: 10, unique: true, sort: 'draw' },
    content: {
      en: {
        title: 'Random Number Generator Without Repeats — Secure Draw',
        description:
          'Draw 10 different numbers from 1–100 with browser Web Crypto. Change the range or count, keep draw order, and copy the result in one click.',
        h1: 'Random Number Generator Without Repeats',
        intro:
          'This preset draws 10 different numbers from 1–100. Change any setting for a raffle, sample, or list where each number can appear only once.',
      },
      ko: {
        title: '중복 없는 랜덤 숫자 생성기 — 1~100 중 10개 추첨',
        description:
          '1부터 100까지 서로 다른 랜덤 숫자 10개를 브라우저 Web Crypto로 생성합니다. 범위와 개수를 바꾸고 생성 순서를 유지한 채 바로 복사하세요.',
        h1: '중복 없는 랜덤 숫자 생성기',
        intro:
          '1부터 100까지 서로 다른 숫자 10개를 뽑도록 설정되어 있습니다. 추첨·표본 선택처럼 같은 숫자가 한 번만 나와야 할 때 범위와 개수를 바꿔 사용하세요.',
      },
    },
  },
  {
    slug: 'lottery-6-45',
    preset: { min: 1, max: 45, count: 6, unique: true, sort: 'asc' },
    content: {
      en: {
        title: 'Lottery Number Generator — 6 Unique Numbers from 1–45',
        description:
          'Generate six different lottery-style numbers from 1–45 with browser Web Crypto. Results are sorted, generated locally, and ready to copy.',
        h1: 'Lottery Number Generator (6/45)',
        intro:
          'Six different numbers from 1–45 are ready to draw and sort. Generate another local set whenever you need a simple 6/45-style selection.',
      },
      ko: {
        title: '로또 번호 생성기 — 1~45 중 중복 없이 6개',
        description:
          '1부터 45까지 서로 다른 로또 번호 6개를 브라우저 Web Crypto로 생성합니다. 오름차순으로 정리해 바로 복사할 수 있습니다.',
        h1: '로또 번호 생성기 (6/45)',
        intro:
          '1부터 45까지 서로 다른 번호 6개를 오름차순으로 뽑도록 설정되어 있습니다. 간단한 6/45 번호 조합을 만들 때 바로 다시 생성하세요.',
      },
    },
  },
];

export const meta: ToolMeta = {
  slug: 'random-number',
  category: 'calculator',
  icon: 'sparkle',
  added: '2026-10-11',
  updated: '2026-10-18',
  edges: ['usability'],
  competitors: [
    {
      name: 'KuleUI — Random Number Generator',
      url: 'https://www.kuleui.com/tools/dev/random-number-generator',
      weakness:
        'Its opened page leaves the result empty until visitors select Generate and does not expose a keyboard shortcut in the generator. Betterbit opens with a useful draw and visibly supports G to draw again outside form fields. (Strength: it supports decimal output and a separate CSV copy action.)',
    },
    {
      name: 'all the damn tools — Random Number Generator',
      url: 'https://allthedamn.tools/random-number/',
      weakness:
        'Its opened page offers only one sorted-result toggle rather than explicit draw, ascending, and descending result-order choices. Betterbit makes all three orders visible and pairs the generated list with its count and inclusive range. (Strength: it supports exact whole numbers up to 18 digits and comma-separated copy output.)',
    },
    {
      name: 'public.tools — Random Number Generator',
      url: 'https://public.tools/random-number-generator',
      weakness:
        'Its opened page documents up to 1,000 draws at a time, while Betterbit visibly permits up to 10,000 and shows the allowed count beside the input. Betterbit also saves valid settings locally for the next visit. (Strength: it accepts any exact JavaScript safe-integer range and gives a clear explanation of when a draw needs an auditable record.)',
    },
  ],
  related: ['random-picker', 'dice-roller', 'coin-flip', 'uuid-generator', 'lotto-generator'],
  variants,
};
