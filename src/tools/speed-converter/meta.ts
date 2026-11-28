import type { ToolMeta, ToolVariant } from '../types';

const variants: ToolVariant[] = [
  {
    slug: 'mph-to-kmh',
    preset: { mode: 'speed', from: 'mph', to: 'kmh', value: 60 },
    content: {
      en: {
        title: 'MPH to KMH Converter — Speed & Pace Results',
        description:
          'Convert mph to km/h instantly. Enter any road, sports, or vehicle speed, then see m/s, knots, min/km and min/mi together with no Convert button.',
        h1: 'MPH to KMH Converter',
        intro:
          'Convert miles per hour to kilometres per hour as you type. 60 mph is exactly 96.56064 km/h; the same speed’s m/s, knots and running pace are shown below.',
        sections: [
          {
            heading: 'Miles per hour to kilometres per hour',
            body: 'One mile per hour is exactly 1.609344 km/h, so 60 mph is 96.56 km/h and 70 mph is 112.65 km/h. The factor comes straight from the mile: a mile is 1.609344 km, and speed is distance over the same hour.\n\nUS and UK road signs are in mph while Korean and most European limits are in km/h, so converting a limit is the common case: 30 mph is 48.3 km/h, just under a 50 km/h limit, and 70 mph is 112.7 km/h, above a 110 km/h motorway limit. Boats and aircraft use knots, where one knot is 1.852 km/h — about 15% faster than 1 mph — so this factor does not apply to them.',
            table: {
              caption: 'Miles per hour to kilometres per hour',
              head: ['Miles per hour (mph)', 'Kilometres per hour (km/h)'],
              rows: [
                ['30', '48.28'],
                ['50', '80.47'],
                ['60', '96.56'],
                ['65', '104.61'],
                ['70', '112.65'],
                ['80', '128.75'],
                ['100', '160.93'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How fast is 60 mph in km/h?',
            a: '60 mph is 96.56 km/h. Multiply by 1.609344; the mental rule of adding 60% gives 96, close enough for a speedometer check but not for a legal limit.',
          },
          {
            q: 'Is 1 mph exactly 1.6 km/h?',
            a: 'No. One mile per hour is exactly 1.609344 km/h, so 1.6 is about 0.6% low. The error is small for one mile but grows with distance: 100 miles is 160.93 km, not 160.',
          },
          {
            q: 'How do knots compare with mph?',
            a: 'One knot is 1.852 km/h, about 1.1508 mph, so a knot is roughly 15% faster than a mile per hour. Boats and aircraft use knots and this mph figure does not apply to them.',
          },
        ],
      },
      ko: {
        title: 'mph km/h 변환 — 속도·러닝 페이스 함께 확인',
        description:
          'mph를 km/h로 입력 즉시 변환합니다. 자동차·스포츠 속도와 m/s·노트·분/km·분/마일 결과를 변환 버튼 없이 한 화면에서 확인하세요.',
        h1: 'mph km/h 변환',
        intro:
          '시속 마일(mph)을 시속 킬로미터(km/h)로 실시간 변환합니다. 60mph는 정확히 96.56064km/h이며 m/s·노트·러닝 페이스도 아래에 함께 표시합니다.',
        sections: [
          {
            heading: '시속 마일에서 시속 킬로미터로',
            body: '1mph는 정확히 1.609344km/h이므로 60mph는 96.56km/h, 70mph는 112.65km/h입니다. 이 계수는 마일 자체에서 나옵니다. 1마일이 1.609344km이고 속도는 같은 1시간 동안의 거리이기 때문입니다.\n\n미국·영국 도로 표지판은 mph이고 한국과 유럽 대부분의 제한속도는 km/h입니다. 그래서 속도보다 제한속도를 바꾸는 일이 흔합니다. 30mph는 48.3km/h로 50km/h 제한보다 조금 낮고, 70mph는 112.7km/h로 110km/h 제한을 넘습니다. 선박과 항공기는 노트를 쓰며 1노트는 1.852km/h로 1mph보다 약 15% 빠르므로 이 계수를 적용할 수 없습니다.',
            table: {
              caption: '시속 마일을 시속 킬로미터로',
              head: ['시속 마일 (mph)', '시속 킬로미터 (km/h)'],
              rows: [
                ['30', '48.28'],
                ['50', '80.47'],
                ['60', '96.56'],
                ['65', '104.61'],
                ['70', '112.65'],
                ['80', '128.75'],
                ['100', '160.93'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '60mph는 몇 km/h인가요?',
            a: '96.56km/h입니다. 1.609344를 곱하세요. 60%를 더하는 요령은 96이 나와 계기판 확인에는 충분하지만 법정 속도 판단에는 부족합니다.',
          },
          {
            q: '1mph는 정확히 1.6km/h인가요?',
            a: '아닙니다. 정확히 1.609344km/h이므로 1.6은 약 0.6% 작습니다. 100마일이 160.93km인 것처럼 거리가 길어질수록 차이가 커집니다.',
          },
          {
            q: '노트와 mph는 어떻게 다른가요?',
            a: '1노트는 1.852km/h로 약 1.1508mph입니다. 노트가 mph보다 약 15% 빠르며, 선박과 항공기는 노트를 쓰므로 이 변환 계수를 쓸 수 없습니다.',
          },
        ],
      },
    },
  },
];

export const meta: ToolMeta = {
  slug: 'speed-converter',
  category: 'converter',
  icon: 'convert',
  added: '2026-10-14',
  updated: '2026-10-19',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'UnitConverters.net — Convert mph to kph',
      url: 'https://www.unitconverters.net/speed/mph-to-kph.htm',
      weakness:
        'The page is fixed to the mph↔km/h pair and then sends visitors into separate links for m/s, knots, feet per second and many other pairs; its visible calculator has no running-pace input or min/km/min/mi result. Betterbit keeps four common speed units and a two-way running-pace mode in one live panel. (Strength: it documents the exact 1.609344 factor and provides a detailed table.)',
    },
    {
      name: 'CalcOpenly — mph to km/h Converter',
      url: 'https://www.calcopenly.com/conversion/mph-to-kmh',
      weakness:
        'Its dedicated page centres on just the mph-to-km/h pair, a chart and worked calculation; it has no m/s, knot, min/km or min/mi result alongside the answer. Betterbit puts those practical comparison results in the same live view. (Strength: it cites NIST and BIPM sources and exposes a high-precision display.)',
    },
    {
      name: 'UnitConvert — MPH to KMH Converter',
      url: 'https://unitconvert.top/mph-to-kmh/',
      weakness:
        'The visible tool starts as a mph-to-km/h page; “Show more results” adds speed-unit comparisons but not a pace input or a min/km/min/mi running result. Betterbit lets a runner enter a minutes-and-seconds pace directly, as well as starting with a speed. (Strength: it can reveal more speed-unit results from the converter.)',
    },
    {
      name: 'Live Speed Tracker — 속도 변환',
      url: 'https://livespeedtracker.com/ko/speed-converter/',
      weakness:
        'Its converter exposes km/h, mph, m/s and knots with quick reference tables, but its visible conversion flow has no minutes-and-seconds running-pace input or min/km/min/마일 result. Betterbit adds a dedicated pace mode while retaining those four speed units. (Strength: it also provides a browser GPS speedometer.)',
    },
    {
      name: 'ThousandTools — mph to km/h',
      url: 'https://www.thousandtools.com/unit-converters/speed/mile-per-hour-to-kilometer-per-hour/',
      weakness:
        'The localized mph-to-km/h page can show m/s, km/h, mph, knots and ft/s, but its visible interface does not offer a running pace in min/km or min/마일, nor a minutes-and-seconds pace input. Betterbit keeps the road and running conversion paths on the same panel. (Strength: it lists a useful all-speed-unit result block.)',
    },
    {
      name: '도구몽 — 속도 변환기',
      url: 'https://www.dogumong.com/tools/speed-converter',
      weakness:
        'Its speed-only flow supports km/h, mph, m/s, knots, Mach and light-speed ratios, but it explicitly does not calculate distance or time and has no running pace control. Betterbit makes the reciprocal speed/pace relationship directly usable with min/km and min/마일 fields. (Strength: it clearly states its sea-level Mach assumption and keeps calculations in the browser.)',
    },
  ],
  related: ['length-converter', 'temperature-converter', 'scientific-calculator'],
  variants,
};
