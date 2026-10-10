import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'scientific-calculator',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['usability', 'no-ads'],
  competitors: [
    {
      name: 'Calculator.net — Scientific Calculator',
      url: 'https://www.calculator.net/scientific-calculator.html',
      weakness:
        'Its page explicitly supports typing into the display, but it has no calculation history at all — every past result is gone the moment you compute the next one — and calculator.net has a long-running reputation (echoed in app-store and forum reviews of its mobile pages) for heavy ad load. Betterbit keeps the last 30 calculations in a saved history you can tap to reuse, and runs no ads anywhere. (Strength: it is the single best-known free scientific calculator, with very broad brand recognition.)',
    },
    {
      name: 'Desmos Scientific Calculator',
      url: 'https://www.desmos.com/scientific',
      weakness:
        'It is a trimmed-down version of Desmos\'s graphing calculator: a multi-line notebook with a three-tab keypad (main/abc/func) and shortcut syntax (typing "frac", "nthroot", ALT+D for deg/rad) you first have to learn, which is more machinery than most people want for a one-off calculation like sin(30)+sqrt(16). Betterbit is a single-line calculator with a plain keypad — type a full expression or tap keys, no notebook model to learn. (Strength: genuinely powerful for the use cases it targets — complex numbers, lists, user-defined functions — and is used in US state assessments and textbooks.)',
    },
    {
      name: 'Tembrica 온라인 계산기 (ko)',
      url: 'https://tembrica.com/ko/calculator',
      weakness:
        '키보드 입력과 계산 기록(종이테이프)을 이미 지원하지만, 페이지 맨 위에 "프리미엄 · 업그레이드된 Tembrica [프리미엄 받기]" 배너가 항상 보이고 공학용 계산을 쓰려면 "일반"에서 "공학용"으로 모드를 한 번 더 전환해야 한다. Betterbit는 업그레이드 유도가 전혀 없고 공학용 키패드가 항상 그대로 보인다. (장점: 음성 안내 10개 언어, 최대 90px 버튼까지 커지는 접근성 설정을 갖추고 있다.)',
    },
    {
      name: 'Tech Online Tool 웹 공학용 계산기 (ko)',
      url: 'https://techonlinetool.com/ko/',
      weakness:
        '키보드 입력과 Deg/Rad 전환은 되지만 과거 계산을 다시 볼 수 있는 기록 기능이 없어서, 계산할 때마다 이전 값을 직접 다시 입력해야 한다. Betterbit는 최근 30개 계산을 기록에 남기고 탭으로 바로 불러올 수 있다. (장점: 설치 없이 모바일에서 바로 쓸 수 있도록 가볍게 만들어졌다.)',
    },
  ],
  related: ['percentage-calculator', 'date-calculator', 'age-calculator', 'length-converter'],
};
