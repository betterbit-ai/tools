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
        sections: [
          {
            heading: 'Drawing numbers without repeats',
            body: 'Without replacement, each draw removes the number from the pool, so picking 6 from 45 has 45 × 44 × 43 × 42 × 41 × 40 = 5,864,443,200 ordered results, which is 8,145,060 once the order is ignored. That is why a six-number no-repeat draw always produces six different numbers and why the same set can appear in a different order.\n\nThe mode matters when the numbers are assigned to people or seats, because a repeat would give two people the same slot. For a team draw, set the range to the number of people and the count to the number of groups, then read consecutive groups from the drawn order.',
            table: {
              caption: 'Possible results when drawing without repeats',
              head: ['Pool size', 'Picks', 'Distinct sets'],
              rows: [
                ['45', '6', '8,145,060'],
                ['10', '3', '120'],
                ['20', '5', '15,504'],
                ['100', '10', '1.73 × 10¹³'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'What does no repeats change?',
            a: 'Each number leaves the pool after it is drawn, so it cannot appear twice. With repeats allowed, 6 picks from 45 give 45⁶ = 8.3 billion ordered results instead of 5.9 billion.',
          },
          {
            q: 'How many ways can 6 numbers be drawn from 45?',
            a: '8,145,060 distinct sets. The drawn order does not matter for a lottery ticket, so the tool keeps the numbers in the order they were drawn and the set is what counts.',
          },
          {
            q: 'Can I use it to split people into teams?',
            a: 'Yes. Set the range to the number of people and the count to the number of groups, then take consecutive groups from the drawn order. Because the draw is without replacement, nobody is assigned twice.',
          },
        ],
      },
      ko: {
        title: '중복 없는 랜덤 숫자 생성기 — 1~100 중 10개 추첨',
        description:
          '1부터 100까지 서로 다른 랜덤 숫자 10개를 브라우저 Web Crypto로 생성합니다. 범위와 개수를 바꾸고 생성 순서를 유지한 채 바로 복사하세요.',
        h1: '중복 없는 랜덤 숫자 생성기',
        intro:
          '1부터 100까지 서로 다른 숫자 10개를 뽑도록 설정되어 있습니다. 추첨·표본 선택처럼 같은 숫자가 한 번만 나와야 할 때 범위와 개수를 바꿔 사용하세요.',
        sections: [
          {
            heading: '같은 숫자 없이 뽑기',
            body: '중복 없이 뽑으면 한 번 뽑힌 숫자는 후보에서 빠집니다. 45개에서 6개를 순서대로 뽑는 경우는 45 × 44 × 43 × 42 × 41 × 40 = 5,864,443,200가지이고, 순서를 무시하면 8,145,060가지입니다. 그래서 중복 없는 6개 뽑기는 항상 서로 다른 여섯 숫자가 나오고, 같은 조합이 다른 순서로 나타날 수 있습니다.\n\n숫자를 사람이나 좌석에 배정할 때 이 모드가 중요합니다. 중복이 나오면 두 사람이 같은 자리를 받기 때문입니다. 팀을 나눌 때는 범위를 인원 수로, 개수를 팀 수로 맞춘 뒤 뽑힌 순서대로 연속해서 묶으면 됩니다.',
            table: {
              caption: '중복 없이 뽑을 때 나오는 경우의 수',
              head: ['후보 수', '뽑는 개수', '서로 다른 조합'],
              rows: [
                ['45', '6', '8,145,060'],
                ['10', '3', '120'],
                ['20', '5', '15,504'],
                ['100', '10', '1.73 × 10¹³'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '중복 없이 뽑으면 무엇이 달라지나요?',
            a: '뽑힌 숫자가 후보에서 빠져 같은 숫자가 두 번 나오지 않습니다. 중복을 허용하면 45개에서 6개를 뽑을 때 45⁶ = 83억 가지가 되어 순서까지 다른 결과가 훨씬 많아집니다.',
          },
          {
            q: '45개에서 6개를 뽑는 경우는 몇 가지인가요?',
            a: '서로 다른 조합이 8,145,060가지입니다. 로또 용지에서는 순서가 의미가 없으므로 조합 자체가 결과입니다.',
          },
          {
            q: '팀 나누기에 쓸 수 있나요?',
            a: '됩니다. 범위를 인원 수로, 개수를 팀 수로 맞추고 뽑힌 순서대로 연속해서 묶으세요. 중복이 없으므로 한 사람이 두 번 배정되지 않습니다.',
          },
        ],
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
        sections: [
          {
            heading: 'The odds of a 6/45 draw',
            body: "A 6/45 lottery has 8,145,060 possible combinations, so any one ticket has a 1 in 8,145,060 chance per draw. Two different tickets give 2 chances in that number — it doubles the odds, not the likelihood in any practical sense, and every combination is equally probable.\n\nThe figure is fixed by the game, not by the draw history. Past results do not change the next draw, and a run such as 1-2-3-4-5-6 has exactly the same probability as last week's numbers. What does depend on other players is the prize share: popular combinations are split between more winners, so the expected value of a ticket changes even though its odds do not.",
            table: {
              caption: 'How many combinations a 6/45 draw has',
              head: ['Game', 'Combinations', 'Odds per ticket'],
              rows: [
                ['6 of 45', '8,145,060', '1 in 8,145,060'],
                ['5 of 45', '1,221,759', '1 in 1,221,759'],
                ['6 of 49', '13,983,816', '1 in 13,983,816'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'What are the odds of winning a 6/45 lottery?',
            a: '1 in 8,145,060 per ticket, because that is how many six-number combinations exist. Ten different tickets give 10 chances in 8,145,060.',
          },
          {
            q: 'Do frequently drawn numbers become more likely?',
            a: 'No. Each draw is independent and every combination has the same probability whatever the history shows. A number being due is not a property of a fair draw.',
          },
          {
            q: 'Does the generator produce real lottery results?',
            a: 'No. It produces a random six-number set without repeats in the same shape as a 6/45 draw, for practice or entertainment, and cannot predict an official draw.',
          },
        ],
      },
      ko: {
        title: '로또 번호 생성기 — 1~45 중 중복 없이 6개',
        description:
          '1부터 45까지 서로 다른 로또 번호 6개를 브라우저 Web Crypto로 생성합니다. 오름차순으로 정리해 바로 복사할 수 있습니다.',
        h1: '로또 번호 생성기 (6/45)',
        intro:
          '1부터 45까지 서로 다른 번호 6개를 오름차순으로 뽑도록 설정되어 있습니다. 간단한 6/45 번호 조합을 만들 때 바로 다시 생성하세요.',
        sections: [
          {
            heading: '6/45 추첨의 확률',
            body: '6/45 로또는 조합이 8,145,060가지이므로 한 장의 당첨 확률은 회차마다 8,145,060분의 1입니다. 서로 다른 두 장을 사면 그 확률이 두 배가 되지만, 어떤 조합이든 확률은 같습니다.\n\n이 숫자는 추첨 이력이 아니라 게임 규칙이 정합니다. 지난 결과는 다음 회차에 영향을 주지 않고, 1-2-3-4-5-6도 지난주 당첨 번호와 확률이 같습니다. 다만 당첨금 배분은 다른 참가자에 따라 달라집니다. 인기 조합은 당첨자가 많아 나눠 갖게 되므로 기대값은 확률과 별개로 달라집니다.',
            table: {
              caption: '6/45 추첨의 조합 수',
              head: ['게임', '조합 수', '한 장당 확률'],
              rows: [
                ['45개 중 6개', '8,145,060', '8,145,060분의 1'],
                ['45개 중 5개', '1,221,759', '1,221,759분의 1'],
                ['49개 중 6개', '13,983,816', '13,983,816분의 1'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '6/45 로또 당첨 확률은?',
            a: '한 장에 8,145,060분의 1입니다. 여섯 숫자 조합이 그만큼 있기 때문이며, 서로 다른 열 장을 사면 그 확률이 열 배가 됩니다.',
          },
          {
            q: '자주 나온 번호가 더 유리한가요?',
            a: '아닙니다. 매 회차는 독립이고 어떤 조합이든 확률이 같습니다. 어떤 번호가 나올 차례라는 것은 공정한 추첨의 성질이 아닙니다.',
          },
          {
            q: '이 생성기가 실제 당첨 번호를 알려 주나요?',
            a: '아닙니다. 6/45와 같은 형태로 중복 없는 여섯 숫자를 무작위로 만들 뿐이며, 공식 추첨을 예측하거나 영향을 줄 수 없습니다.',
          },
        ],
      },
    },
  },
];

export const meta: ToolMeta = {
  slug: 'random-number',
  category: 'calculator',
  icon: 'sparkle',
  added: '2026-10-11',
  updated: '2026-11-23',
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
