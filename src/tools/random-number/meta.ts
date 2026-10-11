import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'random-number',
  category: 'calculator',
  icon: 'sparkle',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['no-ads', 'usability', 'features'],
  competitors: [
    {
      name: 'InventiveHQ — Random Number Generator',
      url: 'https://inventivehq.com/tools/random/random-number-generator',
      weakness:
        'The opened page places an “Advertisement” directly above its tool and says it uses Math.random(), explicitly noting that it is not cryptographically secure. Betterbit has no ads and visibly uses crypto.getRandomValues() with unbiased integer sampling. (Strength: it also offers decimal, Gaussian, dice, and base-2/8/16 modes.)',
    },
    {
      name: 'ToolLineup — Random Number Generator',
      url: 'https://toollineup.com/random-number-generator/',
      weakness:
        'Its search result presents the same basic custom range, bulk, and no-repeat controls, so this is not a feature gap. Betterbit keeps those basics in a compact two-column draw-and-copy surface, saves the chosen settings locally, and makes the no-repeat impossibility rule visible as an in-place error. (Strength: it also says it uses the browser’s cryptographically secure random source and works offline after loading.)',
    },
    {
      name: 'Starlight Tools — Random Number Set Generator',
      url: 'https://starlighttools.org/random/number-set-generator',
      weakness:
        'Its opened basic-draw form exposes at least 11 controls before generation, including sets, decimals, endpoint inclusion, grid steps, output format, and preview limit. Betterbit exposes only range, count, no repeats, and ordering for a focused integer draw, while still handling batches up to 10,000. (Strength: it supports multiple sets, decimal grids, downloads, and several export formats.)',
    },
    {
      name: '고고템 — 난수 생성기',
      url: 'https://www.gogotem.com/ko/calculator/random-number-generator',
      weakness:
        'Its Korean result page exposes range, count, sorting, and a no-repeat checkbox, but does not disclose the random source in its visible tool description. Betterbit names crypto.getRandomValues() in the interface and explains its inclusive bounds and impossible no-repeat requests. (장점: 결과 요약과 링크 복사 기능을 함께 제공한다.)',
    },
    {
      name: 'DataChef — 난수 생성기',
      url: 'https://tech-lagoon.com/numberchef/ko/random-number.html',
      weakness:
        'Its opened Korean page caps a batch at 999 values and requires a separate 계산 button after configuring decimal places and duplicate behavior. Betterbit supports up to 10,000 integers per draw, gives an in-place validation message for impossible unique requests, and provides a direct one-click copy result. (장점: 소수점 아래 0~50자리와 매우 큰 정수를 다룬다.)',
    },
    {
      name: 'Oratlas — 난수 생성기',
      url: 'https://www.oratlas.com/random-number-generator-in-korean',
      weakness:
        'Its opened page has only a minimum, maximum, and Generate control, so it cannot make a bulk list, prevent duplicates, sort a result, or copy a newline-separated set. Betterbit adds all four while retaining a simple default 1–100 draw. (장점: 한 숫자만 필요할 때의 화면은 매우 단순하다.)',
    },
  ],
  related: ['percentage-calculator', 'loan-calculator', 'compound-interest', 'bmi-calculator'],
};
