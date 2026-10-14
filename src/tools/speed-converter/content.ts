import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  modeLabel: 'Conversion type',
  speedMode: 'Speed',
  paceMode: 'Running pace',
  valueLabel: 'Speed',
  speedHint: 'Results update as you type.',
  fromLabel: 'From',
  toLabel: 'To',
  swap: 'Swap',
  resultLabel: 'Result in {unit}',
  allResultsTitle: 'All speed and pace results',
  quickTableTitle: 'Quick reference',
  paceMinutesLabel: 'Minutes',
  paceSecondsLabel: 'Seconds',
  paceDistanceLabel: 'Pace distance',
  paceHint: 'Enter a running pace as minutes and seconds.',
  secondsHint: '0–59',
  paceKm: 'Per kilometre (min/km)',
  paceMi: 'Per mile (min/mi)',
  paceKmResult: 'Pace (min/km)',
  paceMiResult: 'Pace (min/mi)',
  autosaved: 'Saved in this browser',
  copy: 'Copy all results',
  copied: 'Copied',
  unitKmh: 'Kilometres per hour (km/h)',
  unitMph: 'Miles per hour (mph)',
  unitMs: 'Metres per second (m/s)',
  unitKnot: 'Knots (kn)',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'MPH to KMH Converter — Speed & Running Pace',
    description:
      'Convert mph, km/h, m/s and knots instantly. See all speed units plus min/km and min/mi running pace together, with no Convert button.',
    h1: 'Speed Converter',
    tagline: 'Convert mph, km/h, m/s and knots, then compare the equivalent running pace in min/km and min/mi.',
    name: 'Speed Converter',
    keywords: [
      'mph to kmh',
      'mph to kph',
      'kmh to mph',
      'km h to mph',
      'm/s to km/h',
      'knots to kmh',
      'running pace converter',
      'min per km to mph',
    ],
    howTo: [
      'Choose Speed to convert a road, weather, scientific, or marine speed, then enter its value and source unit.',
      'Choose the result unit or use Swap to reverse the selected direction; all other units update at the same time.',
      'Choose Running pace to enter a minutes-and-seconds pace per kilometre or mile and see its speed immediately.',
      'Copy all results when you need the speed and both pace forms together.',
    ],
    sections: [
      {
        heading: 'Exact mph, km/h, m/s and knot conversions',
        body: 'One statute mile is exactly 1,609.344 metres, so 1 mph is exactly 1.609344 km/h and exactly 0.44704 m/s. To change mph to km/h, multiply by 1.609344; 60 mph is 96.56064 km/h. In the reverse direction, multiply km/h by 0.6213711922. A kilometre per hour is exactly 1/3.6 m/s, so 72 km/h is exactly 20 m/s. One knot is one nautical mile per hour; because a nautical mile is exactly 1,852 metres, 1 kn is exactly 1.852 km/h.',
      },
      {
        heading: 'Speed and running pace are reciprocals',
        body: 'Speed says how far you travel in a fixed time; pace says how long one fixed distance takes. For a kilometre pace, speed in km/h is 60 divided by the pace in minutes per kilometre. A 5:00 min/km pace is therefore 12 km/h. The same effort is about 8:03 min/mi because one mile is 1.609344 km. Pace is not meaningful at zero speed, so the pace cards show a dash until the input is above zero.',
      },
      {
        heading: 'Use the unit that matches the measurement',
        body: 'Road signs and vehicle displays commonly use km/h or mph. Metres per second is the SI derived unit and is frequent in physics, engineering, and wind reports. Knots are used for marine and aviation navigation. A Mach value is deliberately not included here: Mach is a ratio to local sound speed, which changes with temperature and altitude, unlike the fixed factors used for the four units in this converter.',
      },
    ],
    faq: [
      {
        q: 'How do I convert mph to km/h?',
        a: 'Multiply mph by exactly 1.609344. For example, 60 mph × 1.609344 = 96.56064 km/h. To convert km/h back to mph, multiply by 0.6213711922.',
      },
      {
        q: 'How fast is 5 minutes per kilometre?',
        a: 'A 5:00 min/km pace is exactly 12 km/h. It equals about 7.45645 mph and rounds to 8:03 min/mi because one mile is 1.609344 kilometres.',
      },
      {
        q: 'How many km/h is one knot?',
        a: 'One knot is exactly 1.852 km/h and 0.514444… m/s. A knot means one nautical mile per hour, and the nautical mile is exactly 1,852 metres.',
      },
      {
        q: 'Why is there no Mach conversion?',
        a: 'Mach is not a fixed speed: Mach 1 depends on the local speed of sound, which varies with air temperature and altitude. The mph, km/h, m/s, and knot factors in this converter are fixed definitions.',
      },
      {
        q: 'Are my latest speed and pace values saved?',
        a: 'Your latest values and choices are stored only in this browser so they survive a refresh. They are not sent to a server, and clearing this site’s browser data removes them.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'mph km/h 변환 — 속도·러닝 페이스 한 번에',
    description:
      'mph, km/h, m/s, 노트를 입력 즉시 변환합니다. 시속 결과와 러닝 페이스(분/km·분/마일)를 한 화면에서 함께 확인하고 변환 버튼 없이 사용하세요.',
    h1: '속도 변환',
    tagline: 'mph·km/h·m/s·노트를 바로 환산하고, 같은 속도의 러닝 페이스(분/km·분/마일)까지 함께 확인합니다.',
    name: '속도 변환',
    keywords: [
      '속도 변환',
      'mph kmh 변환',
      '마일 시속 변환',
      '시속 마일 변환',
      'km/h mph 변환',
      'm/s km/h 변환',
      '노트 km/h 변환',
      '러닝 페이스 변환',
      '분 킬로미터 변환',
    ],
    howTo: [
      '속도를 선택한 뒤 도로·날씨·과학·항해에서 쓰는 값을 입력하고 기준 단위를 고르세요.',
      '결과 단위를 선택하거나 단위 바꾸기를 누르면 반대 방향으로 즉시 환산합니다. 다른 단위 결과도 함께 바뀝니다.',
      '러닝 페이스를 선택하면 km 또는 마일당 분·초를 입력해 시속과 반대 페이스를 바로 확인할 수 있습니다.',
      '속도와 두 페이스 값을 함께 써야 하면 결과 모두 복사를 사용하세요.',
    ],
    sections: [
      {
        heading: 'mph·km/h·m/s·노트의 정확한 환산값',
        body: '법정마일 1마일은 정확히 1,609.344m이므로 1mph는 정확히 1.609344km/h, 정확히 0.44704m/s입니다. mph를 km/h로 바꿀 때는 1.609344를 곱하므로 60mph는 96.56064km/h입니다. 반대로 km/h에 0.6213711922를 곱하면 mph가 됩니다. 1km/h는 정확히 1/3.6m/s이므로 72km/h는 정확히 20m/s입니다. 1노트(kn)는 1시간에 1해리를 가는 속도이며, 해리 1개가 정확히 1,852m라서 1kn는 정확히 1.852km/h입니다.',
      },
      {
        heading: '시속과 러닝 페이스의 관계',
        body: '시속은 일정 시간에 이동한 거리를, 페이스는 일정 거리에 걸린 시간을 나타냅니다. 분/km 페이스가 x분이면 시속은 60 ÷ x km/h입니다. 따라서 5:00분/km는 정확히 12km/h입니다. 같은 속도는 1마일이 1.609344km이므로 약 8:03분/마일입니다. 멈춘 상태에서는 페이스를 정할 수 없으므로 속도가 0이면 페이스 결과는 대시로 표시합니다.',
      },
      {
        heading: '측정 환경에 맞는 단위를 고르세요',
        body: '자동차 계기판과 도로 표지에는 km/h 또는 mph가 흔합니다. m/s는 SI 유도 단위로 물리·공학·풍속 자료에서 많이 쓰며, 노트는 선박과 항공 항법에서 사용합니다. 이 도구에는 마하를 넣지 않았습니다. 마하는 현지 음속의 비율이라 기온과 고도에 따라 값이 달라지고, 여기서 쓰는 네 단위처럼 고정된 환산값이 아니기 때문입니다.',
      },
    ],
    faq: [
      {
        q: 'mph를 km/h로 어떻게 바꾸나요?',
        a: 'mph에 정확히 1.609344를 곱하면 됩니다. 예를 들어 60mph × 1.609344 = 96.56064km/h입니다. 반대로 km/h를 mph로 바꿀 때는 0.6213711922를 곱합니다.',
      },
      {
        q: '5분/km 페이스는 시속 몇 km인가요?',
        a: '5:00분/km는 정확히 12km/h입니다. 약 7.45645mph이며, 1마일이 1.609344km이므로 약 8:03분/마일과 같습니다.',
      },
      {
        q: '1노트는 시속 몇 km인가요?',
        a: '1노트는 정확히 1.852km/h, 0.514444…m/s입니다. 노트는 시간당 1해리의 속도이고, 해리 1개는 정확히 1,852m입니다.',
      },
      {
        q: '마하 변환은 왜 없나요?',
        a: '마하는 고정된 속도가 아니라 현지 음속과 비교한 비율입니다. 음속은 기온과 고도에 따라 달라집니다. 이 도구의 mph·km/h·m/s·노트는 모두 고정된 정의값으로 환산합니다.',
      },
      {
        q: '마지막으로 입력한 속도와 페이스가 저장되나요?',
        a: '마지막 값과 단위 선택은 새로고침 후에도 쓸 수 있도록 이 브라우저에만 저장합니다. 서버로 전송하지 않으며, 이 사이트의 브라우저 데이터를 지우면 함께 삭제됩니다.',
      },
    ],
    ui: {
      modeLabel: '변환 방식',
      speedMode: '속도',
      paceMode: '러닝 페이스',
      valueLabel: '속도',
      speedHint: '값을 입력하면 결과가 바로 바뀝니다.',
      fromLabel: '변환할 단위',
      toLabel: '결과 단위',
      swap: '바꾸기',
      resultLabel: '결과 ({unit})',
      allResultsTitle: '모든 속도·페이스 결과',
      quickTableTitle: '빠른 참조표',
      paceMinutesLabel: '분',
      paceSecondsLabel: '초',
      paceDistanceLabel: '페이스 거리',
      paceHint: '달리기 페이스를 분과 초로 입력하세요.',
      secondsHint: '0–59',
      paceKm: '킬로미터당 (분/km)',
      paceMi: '마일당 (분/마일)',
      paceKmResult: '페이스 (분/km)',
      paceMiResult: '페이스 (분/마일)',
      autosaved: '이 브라우저에 저장됨',
      copy: '결과 모두 복사',
      copied: '복사됨',
      unitKmh: '시속 킬로미터 (km/h)',
      unitMph: '시속 마일 (mph)',
      unitMs: '초속 미터 (m/s)',
      unitKnot: '노트 (kn)',
    },
  },
};
