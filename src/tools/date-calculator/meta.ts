import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'date-calculator',
  category: 'time',
  icon: 'calendar',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['features', 'usability', 'no-ads'],
  competitors: [
    {
      name: 'Calculator.net Date Calculator',
      url: 'https://www.calculator.net/date-calculator.html',
      weakness:
        'Business-day exclusion only presets US federal holidays; any other country’s holidays must be typed in one by one through 16+ repeated month/day dropdowns, which clutters the page. Betterbit switches a Korea or US holiday calendar on with one selector and applies it immediately. (Strength: lets users fully customize an arbitrary holiday list, which Betterbit does not.)',
    },
    {
      name: 'DatesCalculator.org',
      url: 'https://datescalculator.org/',
      weakness:
        'Its business-day mode only offers to exclude US federal holidays; there is no selector for any other country, so a Korean or non-US user cannot get an accurate business-day count without manual adjustment. (Strength: shows a month-by-month weekday breakdown that Betterbit does not.)',
    },
    {
      name: 'timeanddate.com Date Calculator',
      url: 'https://www.timeanddate.com/date/duration.html',
      weakness:
        'A large, well-known reference site that is ad-supported and requires picking a specific country/region page to get that country’s holiday list applied, rather than a single page with a holiday-country switch. (Strength: covers holiday calendars for far more countries than Betterbit’s two.)',
    },
    {
      name: '올웨이즈 날짜 계산기 (alwayscorp.co.kr)',
      url: 'https://alwayscorp.co.kr/tools/date-calc',
      weakness:
        '달력상의 모든 날을 포함해서만 계산한다고 스스로 밝히고 있어 주말이나 공휴일을 제외하는 영업일 계산 기능이 전혀 없다. Betterbit은 주말과 선택한 국가의 공휴일을 자동으로 제외해 영업일을 바로 보여준다. (장점: 날짜 더하기 결과를 링크로 공유할 수 있다.)',
    },
    {
      name: 'Toolify 날짜 계산기 (toolify.kr)',
      url: 'https://toolify.kr/tools/date-calculator/',
      weakness:
        '평일(근무일) 계산이 토요일·일요일만 제외하며, 자체 안내에도 "한국 공휴일은 포함되지 않습니다"라고 명시되어 있어 실제 영업일과 차이가 난다. Betterbit은 선택 시 한국 공휴일과 대체공휴일까지 제외해 더 정확한 영업일 수를 보여준다. (장점: 날짜 목록 보기, 요일 개수 세기 등 기능이 더 많다.)',
    },
    {
      name: 'K-Calc 디데이 계산기',
      url: 'https://k-calc.com/calculator/dday',
      weakness:
        '디데이와 날짜 차이만 계산하며 영업일·공휴일 제외는 지원하지 않아 별도의 영업일 계산기로 이동해야 한다고 안내한다. 쿠팡 핫딜 등 제휴 광고 영역도 있다. Betterbit은 한 화면에서 날짜 차이, 날짜 더하기/빼기, 공휴일 제외 영업일 계산을 모두 처리하고 광고가 없다. (장점: 당일 포함/제외 방식을 명확히 구분해서 보여준다.)',
    },
  ],
  related: ['countdown', 'timer', 'stopwatch', 'pomodoro-timer', 'age-calculator', 'percentage-calculator'],
};
