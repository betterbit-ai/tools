import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'scientific-calculator',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-11',
  updated: '2026-10-18',
  edges: ['usability'],
  competitors: [
    {
      name: 'Calculator.net — Scientific Calculator',
      url: 'https://www.calculator.net/scientific-calculator.html',
      weakness:
        'Its current calculator supports typed expressions, an Ans key, reciprocal, cube and EXP keys, but the page exposes only one current calculation and no reusable history tape. Betterbit keeps the latest 30 calculations in saved history and lets you tap any result to continue from it. (Strength: it has dedicated reciprocal, cube, EXP and Ans controls.)',
    },
    {
      name: 'Desmos Scientific Calculator',
      url: 'https://www.desmos.com/scientific',
      weakness:
        'Its current scientific calculator uses a multi-line expression list and separates its keypad into main, abc and func tabs, so reaching advanced functions requires switching context. Betterbit keeps its scientific keys and a one-line live result together on the first screen for quick calculations. (Strength: it supports variables, user-defined functions, lists, complex mode, fraction display and substantial accessibility settings.)',
    },
    {
      name: 'Tembrica 온라인 계산기 (ko)',
      url: 'https://tembrica.com/ko/calculator',
      weakness:
        '키보드 입력과 계산 기록(종이테이프)을 지원하지만, 안내문과 UI가 일반 모드에서 시작한 뒤 공학용 모드로 전환해 삼각함수·로그·거듭제곱 키를 쓰도록 구성되어 있다. Betterbit는 공학용 키패드와 실시간 결과를 처음 화면에서 바로 보여 준다. (장점: 10개 언어 음성 안내, 최대 90px까지 커지는 버튼, 고대비 테마를 제공한다.)',
    },
    {
      name: 'Tech Online Tool 웹 공학용 계산기 (ko)',
      url: 'https://techonlinetool.com/ko/',
      weakness:
        '키보드 입력과 Deg/Rad 전환은 되지만, 페이지 설명상 계산 버튼을 누르면 백엔드 API가 결과를 반환하며 과거 계산을 다시 볼 기록도 없다. Betterbit는 수식을 브라우저에서 계산하고 최근 30개를 기록에 남겨 탭으로 바로 불러올 수 있다. (장점: 역수, 삼각함수의 여함수, 진법 변환, 반올림·내림·올림 키를 갖추고 있다.)',
    },
  ],
  related: [
    'fraction-calculator',
    'number-base-converter',
    'area-converter',
    'temperature-converter',
    'ratio-calculator',
    'average-calculator',
  ],
};
