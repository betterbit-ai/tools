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
      },
      ko: {
        title: 'mph km/h 변환 — 속도·러닝 페이스 함께 확인',
        description:
          'mph를 km/h로 입력 즉시 변환합니다. 자동차·스포츠 속도와 m/s·노트·분/km·분/마일 결과를 변환 버튼 없이 한 화면에서 확인하세요.',
        h1: 'mph km/h 변환',
        intro:
          '시속 마일(mph)을 시속 킬로미터(km/h)로 실시간 변환합니다. 60mph는 정확히 96.56064km/h이며 m/s·노트·러닝 페이스도 아래에 함께 표시합니다.',
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
