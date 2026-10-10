import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'percentage-calculator',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['usability', 'no-ads'],
  competitors: [
    {
      name: 'Calculator.net — Percentage Calculator',
      url: 'https://www.calculator.net/percent-calculator.html',
      weakness:
        'Each of its three modes needs two values typed in and a separate "Calculate" button pressed before anything appears — nothing updates as you type — and a user review of the site specifically calls out mobile ads "getting heavy." Betterbit shows all four calculation types updating live with no button and no ads. (Strength: it also offers a symmetric "percentage difference" mode, which this calculator treats as a specialized case rather than a separate tool.)',
    },
    {
      name: 'CalculatorSoup — Percentage Calculator',
      url: 'https://www.calculatorsoup.com/calculators/math/percentage.php',
      weakness:
        'Its worked formulas use generic placeholder letters, such as "(X / Y) * 100 = P%", instead of substituting the actual numbers you type, so you still have to do that substitution yourself to check the math, and the site is widely reported in reviews as carrying a lot of ads across its pages. Betterbit\'s formula line plugs in your real numbers automatically and has no ads. (Strength: its written walkthroughs explain the underlying fraction/decimal conversion in more depth.)',
    },
    {
      name: 'Omni Calculator — Percentage Calculator',
      url: 'https://www.omnicalculator.com/math/percentage',
      weakness:
        'Omni Calculator is itself used by Google as a public AdSense case study (google.com/ads/publisher/stories/omni_calculator), confirming the site runs Google-served display ads alongside its calculators, including this one. Betterbit has no ads anywhere on the page. (Strength: its four calculators load right at the top of the page, and it also explains percentage points and basis points as related but distinct concepts.)',
    },
    {
      name: '상담모아 퍼센트 계산기',
      url: 'https://sangdammoa.com/calculator/percent',
      weakness:
        '여러 계산 유형을 한 화면에 나열하지만 "초기화" 버튼이 중심인 UI여서 입력 즉시 자동으로 결과가 갱신되는지 불명확하고, 부가세·증여세·부동산 중개 수수료 등 무관한 카테고리 메뉴와 뒤섞여 있어 모바일에서 원하는 계산기를 찾기까지 탐색이 길다. Betterbit는 퍼센트 계산만 다루며 입력 즉시 네 가지 결과가 모두 갱신된다. (장점: 부가세·양도세 등 다른 세금 계산기로 바로 이동할 수 있다.)',
    },
    {
      name: 'OurCalc 퍼센트 계산기',
      url: 'https://ourcalc.com/percent-calculator/',
      weakness:
        '네 가지 유형을 한 화면에 보여주지만 계산식이 "기준값 × (1 - 할인율)"처럼 짧은 수식 한 줄로만 표기돼 내가 입력한 숫자가 어디에 대입됐는지 바로 보이지 않고, 용도가 불분명한 "Payment options" 섹션이 계산기 사이에 끼어 있다. Betterbit는 입력한 숫자를 그대로 대입한 계산식을 각 결과 아래에 보여준다. (장점: 할인가 계산을 같은 화면에서 바로 이어서 보여준다.)',
    },
  ],
  related: ['date-calculator', 'age-calculator', 'word-counter', 'bmi-calculator', 'loan-calculator'],
};
