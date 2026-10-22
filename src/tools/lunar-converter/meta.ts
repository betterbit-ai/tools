import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'lunar-converter',
  category: 'time',
  icon: 'calendar',
  added: '2026-10-22',
  updated: '2026-10-22',
  edges: ['usability'],
  competitors: [
    {
      name: '한국천문연구원 월별음양력',
      url: 'https://astro.kasi.re.kr/kor/life/pageView/5',
      weakness:
        '월 단위 양력→음력 표는 공식 기준을 확인하기 좋지만 한 날짜의 역방향 변환과 같은 음력 생일의 2026·2027 날짜를 한 결과에서 비교할 수 없다. Betterbit는 날짜를 바꾸는 즉시 양방향 결과와 두 해의 생일을 함께 표시한다. (Strength: 기원전 59년부터 2050년까지의 공식 월별 대조표와 율리우스력도 제공한다.)',
    },
    {
      name: 'WebToolBox 음력 양력 변환기',
      url: 'https://www.webtoolbox.co.kr/tools/lunar-solar-converter',
      weakness:
        '양력→음력과 음력→양력이 좌우의 별도 패널과 각각의 변환 버튼으로 나뉘며, 변환 결과에 같은 음력 생일의 올해·내년 날짜가 없다. Betterbit는 방향 하나를 고른 뒤 입력 즉시 결과와 2026·2027 생일을 갱신한다. (Strength: 1900~2100 범위를 표방하고 요일과 윤달을 제공한다.)',
    },
    {
      name: 'moamoang 양력 음력 변환기',
      url: 'https://www.moamoang.co.kr/lunar-calendar-converter/',
      weakness:
        '일반 변환과 음력 생일 10년 표가 서로 다른 모드라 변환한 날짜의 올해·내년 생일을 보려면 모드를 다시 선택해야 한다. Betterbit는 모든 변환 아래에 2026·2027 날짜와 윤달·소월 조정 이유를 바로 붙인다. (Strength: 별도 생일 모드에서 10년 날짜를 제공한다.)',
    },
    {
      name: 'Korean Lunar Calendar — modules.kr',
      url: 'https://tools.modules.kr/calendar/en/index.php',
      weakness:
        'Its English result is a month calendar centered on solar dates; it does not accept a lunar date for reverse conversion or pair the same lunar birthday across 2026 and 2027. Betterbit does both in one live panel. (Strength: it adds Korean public holidays and solar terms to the month view.)',
    },
    {
      name: 'KBG Tools Korean Lunar Calendar Converter',
      url: 'https://kbgtools.com/en/lunar-calendar-converter',
      weakness:
        'Birthday dates live in a separate multi-tab workflow alongside calendar and solar-term modes. Betterbit keeps the direct conversion, leap-month explanation, and the two immediately relevant birthday years in one compact result. (Strength: it exports calendar files and can list 10, 20, or 30 birthday years.)',
    },
    {
      name: 'Dogu Sangja Korean Lunar Calendar Converter',
      url: 'https://tools.sotaneum.com/en/calc/korean-lunar-calendar',
      weakness:
        'Direct conversion and the 10-year birthday list are separate modes, with a full month calendar added below. Betterbit automatically places the 2026–2027 birthday pair and adjustment reason under every conversion. (Strength: it offers a month view and a longer 10-year birthday forecast.)',
    },
  ],
  related: ['date-calculator', 'age-calculator', 'countdown'],
};
