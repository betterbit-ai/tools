import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'average-calculator',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-29',
  updated: '2026-10-29',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'CalculatorSoup — Mean Calculator',
      url: 'https://www.calculatorsoup.com/calculators/statistics/average.php',
      weakness:
        'Its visible result gives average, count, and sum only; median and mode are linked as a separate calculator, and standard deviation is absent from this page. Betterbit shows mean, median, mode, and selectable sample or population standard deviation from the same pasted list. (Strength: it documents many accepted input formats in detail.)',
    },
    {
      name: 'DQYDJ — Average Calculator',
      url: 'https://dqydj.com/average-calculator/',
      weakness:
        'Its described live result includes median, mode, range, sum, and count, but standard deviation and variance are separate related calculators rather than part of its average result. Betterbit includes the spread measures and an explicit sample/population choice alongside the central values. (Strength: it accepts fractions as well as decimals and negative values.)',
    },
    {
      name: 'Pearson — Average Calculator',
      url: 'https://www.pearson.com/channels/calculators/average-calculator',
      weakness:
        'Its page asks the visitor to choose among mean, weighted average, and average rate of change, then click Calculate for the chosen task. Betterbit updates a single pasted list immediately and keeps mean, median, mode, and standard deviation visible together. (Strength: it provides weighted-average and rate-of-change modes.)',
    },
    {
      name: '생활계산기 — 평균·표준편차 계산기',
      url: 'https://calculator.it.kr/statistics/',
      weakness:
        'Its visible summary lists average, standard deviation/variance, median, minimum, maximum, count, and sum, but does not list a mode result. Betterbit adds one or more modes to the same live result and makes the sample versus population divisor an immediately visible choice. (장점: 산술·기하·가중·조화평균의 용도 차이를 자세히 안내한다.)',
    },
    {
      name: '다계산 — 평균 계산기',
      url: 'https://www.dacalc.com/kr/average/',
      weakness:
        'Its visible calculator advertises arithmetic, weighted, geometric, and harmonic means with median and mode, but its page does not provide standard deviation or a sample/population variance choice in that result. Betterbit keeps the basic descriptive statistics and both standard-deviation conventions together. (장점: 기하·조화평균과 가중평균도 계산한다.)',
    },
    {
      name: 'avgcalc — 평균 계산기',
      url: 'https://avgcalc.com/ko/',
      weakness:
        'Its visible result includes mean, median, mode, sum, count, and sample standard deviation, but the page exposes only sample standard deviation rather than a population option. Betterbit lets the visitor switch the divisor between n − 1 and n while preserving the same pasted data. (장점: 입력 열을 붙여넣는 사용법과 최빈값의 뜻을 친절하게 설명한다.)',
    },
  ],
  related: ['percentage-calculator', 'scientific-calculator', 'gpa-calculator', 'ratio-calculator'],
};
