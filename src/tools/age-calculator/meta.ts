import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'age-calculator',
  category: 'time',
  icon: 'cake',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['usability', 'no-ads', 'features'],
  competitors: [
    {
      name: 'Cuemath Age Calculator',
      url: 'https://www.cuemath.com/calculators/age-calculator/',
      weakness:
        'Requires typing both dates and pressing a "Calculate" button before any result appears, the page is wrapped in tutoring-service promotion ("Book a Free Trial Class"), and the only output is a plain years/months/days span — no Korean age conventions or zodiac info. Betterbit updates live as you type with no button and no promotional content. (Strength: it also accepts a non-today comparison date out of the box.)',
    },
    {
      name: 'Omni Calculator — Age Calculator',
      url: 'https://www.omnicalculator.com/everyday-life/age',
      weakness:
        'Its Chinese zodiac and birthstone info live on separate, unrelated calculator pages rather than next to the age result, and the site is well known generally for a heavy display-ad presence across its calculator pages. Betterbit shows age, 띠 and 별자리 together on one ad-free page. (Strength: it breaks age down into extra units like total hours and minutes.)',
    },
    {
      name: 'Calculator.net Age Calculator',
      url: 'https://www.calculator.net/age-calculator.html',
      weakness:
        'A dense, ad-supported layout with sidebar and inline banner ad units is typical of this site, and the result is limited to a Western years/months/weeks/days breakdown with no Korean 만 나이/세는 나이/연 나이 distinction and no zodiac. Betterbit has no ads and adds both Korean age conventions and zodiac signs. (Strength: it lets the comparison date be any past or future date, not just today.)',
    },
    {
      name: 'K-Calc 만 나이 계산기',
      url: 'https://k-calc.com/calculator/age',
      weakness:
        '생년월일을 입력한 뒤 "계산하기" 버튼을 눌러야 결과가 나오고, 페이지 안에 쿠팡 핫딜 등 제휴 광고 영역이 포함되어 있다. Betterbit은 입력하는 즉시 결과가 바뀌고 광고가 전혀 없다. (장점: 결과를 "공유하기" 기능으로 바로 공유할 수 있다.)',
    },
    {
      name: 'boonzero 만나이 계산기',
      url: 'https://boonzero.com/tool/%EB%A7%8C%EB%82%98%EC%9D%B4%EA%B3%84%EC%82%B0%EA%B8%B0',
      weakness:
        '생년월일을 바꾸면 자동으로 결과가 갱신되고 "살아온 일수"도 보여주지만, 다음 생일까지 며칠 남았는지는 전혀 표시하지 않는다. Betterbit은 다음 생일 D-day 카운트다운을 추가로 보여준다. (장점: 해당 나이에서 법적으로 가능한 일/불가능한 일을 항목별로 안내한다.)',
    },
  ],
  related: ['date-calculator', 'countdown', 'timer', 'stopwatch'],
};
