import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  intro: 'All four calculations update as you type — no button, no ads.',
  autosaved: 'Your numbers are saved in this browser',
  invalidNumberError: 'Enter a valid number.',
  type1Heading: 'Percent of a number',
  type1PercentLabel: 'Percent (%)',
  type1BaseLabel: 'Of this number',
  resultLabel: 'Result',
  type1Formula: '({percent} ÷ 100) × {base} = {result}',
  type2Heading: 'What percent is X of Y',
  type2PartLabel: 'This number',
  type2WholeLabel: 'Out of this number',
  zeroWholeError: 'Enter a number other than 0 for "out of" — dividing by zero has no percentage.',
  resultPercentLabel: 'Percent',
  type2Formula: '{part} ÷ {whole} × 100 = {result}%',
  type3Heading: 'Find the whole from a part and percent',
  type3PartLabel: 'This number',
  type3PercentLabel: 'Is this percent (%)',
  zeroPercentError: "Enter a percent other than 0 — a 0% part can't determine a whole.",
  type3Formula: '{part} ÷ ({percent} ÷ 100) = {result}',
  type4Heading: 'Percent increase or decrease',
  type4FromLabel: 'From',
  type4ToLabel: 'To',
  zeroFromError: 'Enter a starting value other than 0 — percent change from zero cannot be calculated.',
  resultChangeLabel: 'Change',
  resultAbsoluteLabel: 'Difference',
  type4Formula: '({to} − {from}) ÷ {from} × 100 = {result}%',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Percentage Calculator — All 4 Types at Once',
    description:
      'Percent of a number, what percent X is of Y, the whole from a part, and percent increase/decrease — all four update live with the formula shown, no ads.',
    h1: 'Percentage Calculator',
    tagline:
      'All four percentage calculations update as you type, with the formula behind each result — no button, no ads.',
    name: 'Percentage Calculator',
    keywords: [
      'percentage calculator',
      'percent calculator',
      'percentage increase calculator',
      'percentage decrease calculator',
      'percent of a number',
      'what percent is x of y',
      'percentage change calculator',
    ],
    howTo: [
      'Enter a percent and a number in the first box to find the percent of that number.',
      'Enter two numbers in the second box to see what percent one is of the other.',
      'Enter a part and its percent in the third box to find the whole number.',
      'Enter a starting and ending value in the fourth box to see the percent increase or decrease.',
      'Read the worked formula under each result to see exactly how it was calculated.',
    ],
    sections: [
      {
        heading: 'The percentage formula behind each of the four calculators',
        body: 'A percentage is just a fraction of 100, so every box on this page reduces to the same core formula: percent ÷ 100 × base = part. The first calculator applies it directly — multiply a percent by a number. The second calculator rearranges it to solve for the percent: part ÷ whole × 100. The third solves for the whole instead: part ÷ (percent ÷ 100). The fourth, percent change, compares two values with (new − old) ÷ old × 100, which is why it returns a negative number for a decrease and a positive one for an increase — the sign tells you the direction, not just the size, of the change.',
      },
      {
        heading: 'Why a percentage point and a percent are not the same thing',
        body: 'If a rate moves from 20% to 25%, that is a 5 percentage-point increase, but a 25% increase in the rate itself, because (25 − 20) ÷ 20 × 100 = 25. News headlines often blur this distinction, especially for interest rates, tax rates and survey results, so when you read "up 5%" versus "up 5 percentage points," the underlying numbers can differ by several times over. The fourth calculator on this page computes the second kind — the relative percent change — which is almost always what "percentage increase" or "percentage decrease" means in everyday use.',
      },
      {
        heading: 'Rounding and negative numbers',
        body: 'All four calculators accept negative numbers and decimals — useful for comparing losses, temperature changes or any value that can go below zero — and round the final result to six decimal places to avoid the tiny floating-point errors (like 29.999999999999996 instead of 30) that plain JavaScript arithmetic can produce. Dividing by zero has no mathematical answer, so the "what percent" and "find the whole" calculators show a plain-language notice instead of a raw division-by-zero error when the denominator would be zero.',
      },
    ],
    faq: [
      {
        q: 'How do you calculate a percentage of a number?',
        a: 'Divide the percent by 100, then multiply by the number: percent ÷ 100 × number. For example, 20% of 50 is (20 ÷ 100) × 50 = 10, which is exactly what the first calculator on this page computes as you type.',
      },
      {
        q: 'How do I find what percent one number is of another?',
        a: 'Divide the part by the whole, then multiply by 100: part ÷ whole × 100. For example, 10 is (10 ÷ 50) × 100 = 20% of 50 — the second calculator above shows this live for any two numbers you enter.',
      },
      {
        q: 'How do you find the original number from a percentage?',
        a: "Divide the known part by the percent expressed as a decimal: part ÷ (percent ÷ 100). For example, if 10 is 25% of a number, the whole is 10 ÷ (25 ÷ 100) = 40 — that's the third calculator's formula.",
      },
      {
        q: 'What is the formula for percentage increase or decrease?',
        a: 'Subtract the old value from the new value, divide by the old value, then multiply by 100: (new − old) ÷ old × 100. Going from 50 to 75 is a (75 − 50) ÷ 50 × 100 = 50% increase; going from 100 to 80 is a −20% change, a decrease.',
      },
      {
        q: 'Does a percentage increase followed by the same percentage decrease return the original value?',
        a: 'No. Increasing 100 by 20% gives 120, but decreasing 120 by 20% gives 96, not 100 — because the second 20% is taken from a larger base. To exactly undo a percent change you need to divide by (1 + percent/100) rather than apply the opposite percent.',
      },
      {
        q: 'Does this percentage calculator send my numbers anywhere?',
        a: "No. Every calculation runs with plain JavaScript in your browser; the numbers you type are stored only in this browser's local storage so they're still there next time, and are never sent to a server.",
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '퍼센트 계산기 — 4가지 유형 한 번에, 계산식 표시',
    description:
      '숫자의 퍼센트, 몇 퍼센트인지, 전체값 구하기, 증가·감소율까지 네 가지 계산을 입력하는 즉시 한 화면에서 보여주고 계산식도 함께 표시합니다. 버튼 클릭과 광고가 없습니다.',
    h1: '퍼센트 계산기',
    tagline: '네 가지 퍼센트 계산이 입력하는 즉시 모두 갱신되고, 계산식도 함께 보여줍니다 — 버튼과 광고가 없습니다.',
    name: '퍼센트 계산기',
    keywords: [
      '퍼센트 계산기',
      '퍼센트 계산',
      '백분율 계산기',
      '증가율 계산기',
      '감소율 계산기',
      '할인율 계산',
      '몇 퍼센트 계산',
    ],
    howTo: [
      '첫 번째 칸에 퍼센트와 숫자를 입력해 그 숫자의 몇 %인지 바로 확인하세요.',
      '두 번째 칸에 두 숫자를 입력해 한 숫자가 다른 숫자의 몇 퍼센트인지 확인하세요.',
      '세 번째 칸에 부분값과 퍼센트를 입력해 전체값을 구하세요.',
      '네 번째 칸에 이전 값과 이후 값을 입력해 증가율 또는 감소율을 확인하세요.',
      '각 결과 아래의 계산식을 보면 어떤 숫자로 어떻게 계산됐는지 바로 알 수 있습니다.',
    ],
    sections: [
      {
        heading: '네 가지 계산기에 모두 적용되는 퍼센트 공식',
        body: '퍼센트는 결국 100을 기준으로 한 분수이므로, 이 페이지의 네 계산기는 모두 같은 공식 하나에서 출발합니다: 퍼센트 ÷ 100 × 기준값 = 부분값. 첫 번째 계산기는 이 공식을 그대로 적용해 퍼센트와 기준값으로 부분값을 구합니다. 두 번째 계산기는 이를 뒤집어 부분값 ÷ 전체값 × 100으로 퍼센트를 구하고, 세 번째 계산기는 부분값 ÷ (퍼센트 ÷ 100)으로 전체값을 구합니다. 네 번째인 증가·감소율 계산기는 (이후 값 − 이전 값) ÷ 이전 값 × 100으로 두 값을 비교하는데, 감소했을 때는 음수가, 증가했을 때는 양수가 나와 변화의 방향까지 한 번에 알 수 있습니다.',
      },
      {
        heading: '퍼센트포인트(%p)와 퍼센트(%)는 다릅니다',
        body: '금리가 20%에서 25%로 올랐다면 이는 5퍼센트포인트(%p) 상승이지만, 비율 자체로는 (25 − 20) ÷ 20 × 100 = 25%나 오른 것입니다. 기사에서 "5% 상승"과 "5%p 상승"을 섞어 쓰는 경우가 많아 실제 변화량이 몇 배씩 차이 나기도 합니다. 이 페이지의 네 번째 계산기는 "증가·감소율", 즉 상대적인 퍼센트 변화를 계산하며, 일상에서 "몇 퍼센트 늘었다/줄었다"라고 말할 때는 대부분 이 값을 가리킵니다.',
      },
      {
        heading: '음수·소수와 반올림 처리',
        body: '네 계산기 모두 음수와 소수를 그대로 입력할 수 있어 손실액이나 온도 변화처럼 0보다 작아지는 값도 계산할 수 있습니다. 또한 자바스크립트의 부동소수점 연산에서 생기는 29.999999999999996 같은 미세한 오차를 없애기 위해 최종 결과를 소수점 아래 6자리에서 반올림합니다. 0으로 나누는 것은 수학적으로 답이 없으므로, "몇 퍼센트인지"와 "전체값 구하기" 계산기는 분모가 0이 되면 깨진 숫자 표시 대신 알아보기 쉬운 안내 문구를 보여줍니다.',
      },
    ],
    faq: [
      {
        q: '숫자의 퍼센트는 어떻게 계산하나요?',
        a: '퍼센트를 100으로 나눈 뒤 숫자를 곱합니다: 퍼센트 ÷ 100 × 숫자. 예를 들어 50의 20%는 (20 ÷ 100) × 50 = 10이며, 이 계산기의 첫 번째 칸이 입력하는 즉시 이 값을 보여줍니다.',
      },
      {
        q: '한 숫자가 다른 숫자의 몇 퍼센트인지는 어떻게 구하나요?',
        a: '부분값을 전체값으로 나눈 뒤 100을 곱합니다: 부분값 ÷ 전체값 × 100. 예를 들어 10은 50의 (10 ÷ 50) × 100 = 20%이며, 두 번째 계산기에서 어떤 숫자를 넣어도 바로 확인할 수 있습니다.',
      },
      {
        q: '부분값과 퍼센트로 전체값은 어떻게 구하나요?',
        a: '부분값을 퍼센트(소수)로 나눕니다: 부분값 ÷ (퍼센트 ÷ 100). 예를 들어 10이 어떤 수의 25%라면 전체값은 10 ÷ (25 ÷ 100) = 40이며, 이것이 세 번째 계산기의 공식입니다.',
      },
      {
        q: '증가율·감소율은 어떤 공식으로 계산하나요?',
        a: '이후 값에서 이전 값을 뺀 뒤 이전 값으로 나누고 100을 곱합니다: (이후 값 − 이전 값) ÷ 이전 값 × 100. 50에서 75로 늘면 (75 − 50) ÷ 50 × 100 = 50% 증가이고, 100에서 80으로 줄면 −20%, 즉 감소입니다.',
      },
      {
        q: '20% 올린 뒤 다시 20% 내리면 원래 값으로 돌아오나요?',
        a: '아닙니다. 100을 20% 올리면 120이 되지만, 120을 20% 내리면 96이 되어 원래의 100으로 돌아오지 않습니다. 두 번째 20%는 더 커진 120을 기준으로 계산되기 때문입니다. 정확히 되돌리려면 반대 퍼센트를 적용하는 대신 (1 + 퍼센트/100)으로 나눠야 합니다.',
      },
      {
        q: '입력한 숫자가 서버로 전송되나요?',
        a: '아니요. 모든 계산은 브라우저 안에서 자바스크립트로 처리되고, 입력한 숫자는 이 브라우저의 로컬 저장소에만 남아 다시 열어도 유지되며 서버로는 전혀 전송되지 않습니다.',
      },
    ],
    ui: {
      intro: '네 가지 계산이 입력하는 즉시 모두 갱신됩니다 — 버튼도, 광고도 없습니다.',
      autosaved: '입력한 숫자는 이 브라우저에 저장됩니다',
      invalidNumberError: '올바른 숫자를 입력하세요.',
      type1Heading: '숫자의 퍼센트',
      type1PercentLabel: '퍼센트(%)',
      type1BaseLabel: '기준 숫자',
      resultLabel: '결과',
      type1Formula: '({percent} ÷ 100) × {base} = {result}',
      type2Heading: '몇 퍼센트인지 구하기',
      type2PartLabel: '이 숫자',
      type2WholeLabel: '전체 숫자',
      zeroWholeError: '"전체 숫자"에 0이 아닌 값을 입력하세요 — 0으로 나누면 퍼센트를 구할 수 없습니다.',
      resultPercentLabel: '퍼센트',
      type2Formula: '{part} ÷ {whole} × 100 = {result}%',
      type3Heading: '전체값 구하기',
      type3PartLabel: '이 숫자',
      type3PercentLabel: '이 퍼센트(%)',
      zeroPercentError: '0이 아닌 퍼센트를 입력하세요 — 0%로는 전체값을 구할 수 없습니다.',
      type3Formula: '{part} ÷ ({percent} ÷ 100) = {result}',
      type4Heading: '증가·감소율',
      type4FromLabel: '이전 값',
      type4ToLabel: '이후 값',
      zeroFromError: '0이 아닌 이전 값을 입력하세요 — 0에서의 변화율은 정의되지 않습니다.',
      resultChangeLabel: '변화율',
      resultAbsoluteLabel: '변화량',
      type4Formula: '({to} − {from}) ÷ {from} × 100 = {result}%',
    },
  },
};
