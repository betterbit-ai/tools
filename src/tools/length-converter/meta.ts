import type { ToolMeta, ToolVariant } from '../types';

const variants: ToolVariant[] = [
  {
    slug: 'cm-to-inches',
    preset: { from: 'cm', to: 'in', value: 170 },
    content: {
      en: {
        title: 'CM to Inches Converter — Instant, with a Quick Reference Table',
        description:
          'Convert centimeters to inches instantly as you type. No "Convert" button — plus a quick reference table and a feet+inches height converter.',
        h1: 'CM to Inches',
        intro:
          'Centimeters to inches, live as you type. 1 cm = 0.3937 inch, so 1 inch = 2.54 cm exactly — the result and the table below update with every keystroke.',
        sections: [
          {
            heading: 'Why the cm-to-inch factor is 0.3937007874',
            body: `The international inch has been defined as exactly 2.54 centimetres since the 1959 yard and pound agreement, which makes 1 ÷ 2.54 = 0.3937007874015748 inches per centimetre. Multiply by that number or divide by 2.54 and the answer is the same; this converter divides, so it does not accumulate the error that shows up when a short 0.3937 factor is multiplied repeatedly.

Screen diagonals, photo print sizes, bicycle frames and clothing bought from abroad are still quoted in inches while the physical measurement is in centimetres, so this is the direction you need for a 27-inch monitor (68.58 cm), a 4×6-inch photo (10.16 × 15.24 cm) or a 170 cm height. The diagonal alone does not give width and height — that needs the aspect ratio.`,
            table: {
              caption: 'Centimetres to inches, rounded to two decimals',
              head: ['Centimetres (cm)', 'Inches (in)'],
              rows: [
                ['1', '0.39'],
                ['5', '1.97'],
                ['10', '3.94'],
                ['30', '11.81'],
                ['50', '19.69'],
                ['100', '39.37'],
                ['170', '66.93'],
                ['180', '70.87'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How many inches is 170 cm?',
            a: '170 cm is 66.93 inches, or 5 feet 6.93 inches — usually written as about 5 ft 7 in. Divide by 2.54: 170 ÷ 2.54 = 66.9291…, and 66 inches is 5 ft 6 in, leaving 0.93 in.',
          },
          {
            q: 'Is 1 inch exactly 2.54 cm?',
            a: 'Yes. Since 1959 the international inch is defined as exactly 2.54 cm, so 1 cm is 1 ÷ 2.54 = 0.3937007874 inches. Only rounded tables stop at 0.3937.',
          },
          {
            q: 'Why do monitors and phones use inches instead of centimetres?',
            a: 'The display industry standardised on inches, so a 27-inch panel is sold as 27 inches even where the measurement system is metric. Its diagonal is exactly 68.58 cm; width and height also depend on the aspect ratio.',
          },
        ],
      },
      ko: {
        title: 'cm 인치 변환 — 입력하는 즉시 결과, 빠른 참조표 포함',
        description:
          'cm를 인치로 입력하는 즉시 변환합니다. "변환" 버튼 없이 바로 결과가 나오고, 빠른 참조표와 피트·인치 키 변환기도 함께 제공합니다.',
        h1: 'cm 인치 변환',
        intro:
          '센티미터를 인치로 실시간 변환합니다. 1인치는 정확히 2.54cm이므로, 아래 결과와 표가 입력할 때마다 바로 바뀝니다.',
        sections: [
          {
            heading: 'cm를 인치로 바꿀 때 쓰는 값은 0.3937',
            body: `1959년 국제 야드·파운드 협정 이후 1인치는 정확히 2.54cm로 정의되어 있습니다. 그래서 1cm는 1 ÷ 2.54 = 0.3937007874인치입니다. 0.3937을 곱하는 방식과 2.54로 나누는 방식은 결과가 같지만, 이 계산기는 나누기를 쓰기 때문에 반올림한 0.3937을 여러 번 곱할 때 생기는 오차가 쌓이지 않습니다.

모니터 대각선, 사진 인화 크기, 자전거 프레임, 해외에서 사는 옷은 여전히 인치로 표기되고 실제 치수는 cm로 재는 경우가 많습니다. 27인치 모니터는 대각선 68.58cm, 4×6인치 사진은 10.16×15.24cm입니다. 다만 대각선 길이만으로는 가로·세로 길이를 알 수 없고, 화면 비율을 함께 알아야 합니다.`,
            table: {
              caption: 'cm를 인치로 환산한 값(소수점 둘째 자리 반올림)',
              head: ['센티미터 (cm)', '인치 (in)'],
              rows: [
                ['1', '0.39'],
                ['5', '1.97'],
                ['10', '3.94'],
                ['30', '11.81'],
                ['50', '19.69'],
                ['100', '39.37'],
                ['170', '66.93'],
                ['180', '70.87'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '170cm는 몇 인치인가요?',
            a: '170cm는 66.93인치이고, 피트와 인치로는 약 5피트 6.93인치입니다. 보통 5피트 7인치라고 말합니다. 170 ÷ 2.54 = 66.9291…이고, 66인치는 5피트 6인치이므로 0.93인치가 남습니다.',
          },
          {
            q: '1인치는 정확히 2.54cm인가요?',
            a: '네. 1959년 이후 국제 인치는 정확히 2.54cm로 정의되어 있고, 1cm는 1 ÷ 2.54 = 0.3937007874인치입니다. 0.3937은 반올림한 값입니다.',
          },
          {
            q: '모니터·휴대폰 크기는 왜 cm가 아니라 인치로 표시하나요?',
            a: '디스플레이 업계가 인치를 표준으로 써 왔기 때문입니다. 27인치 모니터의 대각선은 정확히 68.58cm이며, 가로·세로 길이는 화면 비율에 따라 달라집니다.',
          },
        ],
      },
    },
  },
  {
    slug: 'inches-to-cm',
    preset: { from: 'in', to: 'cm', value: 12 },
    content: {
      en: {
        title: 'Inches to CM Converter — Instant, With Reference Table',
        description:
          'Convert inches to centimeters instantly, no "Convert" button needed. Includes a quick reference table and a feet+inches to cm height converter.',
        h1: 'Inches to CM',
        intro:
          'Inches to centimeters, updated live. 1 inch is exactly 2.54 cm — type any value and the table below follows along.',
        sections: [
          {
            heading: 'Multiply by 2.54 — but check which inch you have',
            body: `An inch is 2.54 cm by definition, so 12 inches (one foot) is 30.48 cm and a 6-inch ruler mark is 15.24 cm. Multiply the inch figure by 2.54, or use the feet-and-inches fields below when a height is written as 5 ft 11 in: convert the feet first (5 × 12 = 60 inches) and add the remainder.

Korean traditional units do not match the inch. One 치 is one tenth of a 자, about 3.03 cm, so a 치 is slightly longer than 2.54 cm and the two are not interchangeable in hanbok or furniture measurements. Paper sizes are also metric: A4 is 21.0 × 29.7 cm regardless of how the photo inside it was sized in inches.`,
            table: {
              caption: 'Inches to centimetres, rounded to two decimals',
              head: ['Inches (in)', 'Centimetres (cm)'],
              rows: [
                ['1', '2.54'],
                ['2', '5.08'],
                ['6', '15.24'],
                ['12', '30.48'],
                ['24', '60.96'],
                ['36', '91.44'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How many cm is 12 inches?',
            a: '12 inches is 30.48 cm exactly, because 12 × 2.54 = 30.48. One foot is 12 inches, so this is also the foot-to-centimetre value.',
          },
          {
            q: 'Is a Korean 치 the same as an inch?',
            a: 'No. One 치 is a tenth of a 자, about 3.03 cm, so it is roughly 19% longer than the 2.54 cm inch. Hanbok and traditional furniture sizes use 치 or 자 and should not be converted as inches.',
          },
          {
            q: 'How do I convert 5 ft 11 in to cm?',
            a: 'Convert the feet to inches first: 5 × 12 = 60, then add 11 for 71 inches. Multiply by 2.54 to get 180.34 cm. The feet+inches fields below do the same two steps for any height.',
          },
        ],
      },
      ko: {
        title: '인치 cm 변환 — 입력 즉시 결과, 참조표 포함',
        description:
          '인치를 cm로 입력하는 즉시 변환합니다. "변환" 버튼 없이 바로 결과를 보여주고, 빠른 참조표와 키(피트·인치) 변환기도 함께 제공합니다.',
        h1: '인치 cm 변환',
        intro:
          '인치를 센티미터로 실시간 변환합니다. 1인치는 정확히 2.54cm입니다. 값을 입력하면 아래 표도 함께 바뀝니다.',
        sections: [
          {
            heading: '2.54를 곱하면 되지만, 단위가 같은지 먼저 확인하세요',
            body: `인치는 정의상 2.54cm이므로 12인치(1피트)는 30.48cm, 6인치 자 눈금은 15.24cm입니다. 인치 값에 2.54를 곱하면 되고, 키를 5피트 11인치처럼 적었다면 아래 피트·인치 입력란을 쓰는 편이 빠릅니다. 피트를 먼저 인치로 바꾸고(5 × 12 = 60) 남은 인치를 더한 뒤 2.54를 곱합니다.

한국 전통 단위인 치는 인치와 다릅니다. 1치는 1자의 10분의 1로 약 3.03cm여서 2.54cm인 인치보다 조금 깁니다. 한복이나 전통 가구 치수를 인치로 바꿔 계산하면 오차가 생깁니다. 종이 규격도 미터법이라 A4는 사진 크기와 관계없이 21.0 × 29.7cm입니다.`,
            table: {
              caption: '인치를 cm로 환산한 값(소수점 둘째 자리)',
              head: ['인치 (in)', '센티미터 (cm)'],
              rows: [
                ['1', '2.54'],
                ['2', '5.08'],
                ['6', '15.24'],
                ['12', '30.48'],
                ['24', '60.96'],
                ['36', '91.44'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '12인치는 몇 cm인가요?',
            a: '12인치는 정확히 30.48cm입니다. 12 × 2.54 = 30.48이며, 1피트가 12인치이므로 피트를 cm로 바꿀 때도 같은 값을 씁니다.',
          },
          {
            q: '한국의 치와 인치는 같은 단위인가요?',
            a: '아닙니다. 1치는 1자의 10분의 1로 약 3.03cm여서 2.54cm인 인치보다 약 19% 깁니다. 한복·전통 가구 치수는 인치로 환산하지 말고 치나 자 기준으로 확인해야 합니다.',
          },
          {
            q: '5피트 11인치는 몇 cm인가요?',
            a: '피트를 인치로 바꾸면 5 × 12 = 60인치이고, 11인치를 더하면 71인치입니다. 여기에 2.54를 곱하면 180.34cm입니다. 아래 피트·인치 입력란에서도 같은 계산을 할 수 있습니다.',
          },
        ],
      },
    },
  },
  {
    slug: 'feet-to-meters',
    preset: { from: 'ft', to: 'm', value: 6 },
    content: {
      en: {
        title: 'Feet to Meters Converter — Live, with a Quick Table',
        description:
          'Convert feet to meters instantly as you type, with a quick reference table alongside — no sign-up, no "Convert" button to press.',
        h1: 'Feet to Meters',
        intro: 'Feet to meters, live. 1 foot is exactly 0.3048 meters — the result updates as you type.',
        sections: [
          {
            heading: '0.3048 m per foot, and why 3 feet is not quite a metre',
            body: `The international foot is 0.3048 m exactly, so 3 feet is 0.9144 m — 8.6 cm short of a metre, which is why a "3-foot" shelf and a 1-metre shelf are not the same length. Multiply a feet figure by 0.3048, or divide by 3.28084 to go the other way.

Aviation and marine charts still give altitude and depth in feet, and imported ladders, TV mounts and drone limits are sold that way, while Korean building heights and apartment ceilings are metric. For heights written as feet and inches, convert the inches as well: 5 ft 11 in is (5 × 12 + 11) × 0.0254 = 1.8034 m.`,
            table: {
              caption: 'Feet to metres, rounded to three decimals',
              head: ['Feet (ft)', 'Metres (m)'],
              rows: [
                ['1', '0.305'],
                ['3', '0.914'],
                ['5', '1.524'],
                ['6', '1.829'],
                ['10', '3.048'],
                ['20', '6.096'],
                ['30', '9.144'],
                ['100', '30.480'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How many meters is 6 feet?',
            a: '6 feet is 1.8288 m, usually written as 1.83 m. Multiply 6 by 0.3048; if the height is 6 ft 2 in, add the inches first so the total is 74 inches, then multiply by 0.0254.',
          },
          {
            q: 'Is a foot exactly 0.3048 m?',
            a: 'Yes. The international foot has been exactly 0.3048 m since the 1959 agreement, which means 1 m is 3.280839895 feet. Older US survey feet differ by about two parts per million and are being retired.',
          },
          {
            q: 'How tall is 5 ft 11 in in meters?',
            a: '5 ft 11 in is 71 inches, and 71 × 0.0254 = 1.8034 m, so about 1.80 m. Rounding the feet alone to 1.52 m would understate the height by nearly 28 cm.',
          },
        ],
      },
      ko: {
        title: '피트 미터 변환 — 입력 즉시, 빠른 표 포함',
        description:
          '피트를 미터로 입력하는 즉시 변환합니다. 가입 없이 바로 결과가 나오고, 빠른 참조표도 함께 제공합니다.',
        h1: '피트 미터 변환',
        intro: '피트를 미터로 실시간 변환합니다. 1피트는 정확히 0.3048미터입니다.',
        sections: [
          {
            heading: '1피트는 0.3048m, 그래서 3피트는 1m가 아닙니다',
            body: `국제 피트는 정확히 0.3048m입니다. 3피트는 0.9144m로 1m보다 8.6cm 짧기 때문에, 3피트 선반과 1m 선반은 같은 길이가 아닙니다. 피트 값에 0.3048을 곱하거나, 반대로 미터 값을 3.28084로 나누면 됩니다.

항공 고도, 해상 수심, 수입 사다리·TV 벽걸이 브래킷·드론 고도 제한은 여전히 피트로 표기되고, 한국의 건물 층고나 아파트 천장 높이는 미터법입니다. 키를 5피트 11인치처럼 적은 경우에는 인치까지 함께 환산해야 합니다. (5 × 12 + 11) × 0.0254 = 1.8034m입니다.`,
            table: {
              caption: '피트를 미터로 환산한 값(소수점 셋째 자리)',
              head: ['피트 (ft)', '미터 (m)'],
              rows: [
                ['1', '0.305'],
                ['3', '0.914'],
                ['5', '1.524'],
                ['6', '1.829'],
                ['10', '3.048'],
                ['20', '6.096'],
                ['30', '9.144'],
                ['100', '30.480'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '6피트는 몇 미터인가요?',
            a: '6피트는 1.8288m로 보통 1.83m라고 씁니다. 6에 0.3048을 곱하면 되고, 6피트 2인치라면 인치를 먼저 더해 74인치로 만든 뒤 0.0254를 곱합니다.',
          },
          {
            q: '1피트는 정확히 0.3048m인가요?',
            a: '네. 국제 피트는 1959년 협정 이후 정확히 0.3048m로 정의되어 있고, 1m는 3.280839895피트입니다. 미국 측량용 피트는 약 200만분의 2 차이가 있어 별도로 쓰입니다.',
          },
          {
            q: '5피트 11인치는 몇 미터인가요?',
            a: '5피트 11인치는 71인치이고, 71 × 0.0254 = 1.8034m로 약 1.80m입니다. 피트만 1.52m로 환산하면 28cm 가까이 낮게 계산됩니다.',
          },
        ],
      },
    },
  },
  {
    slug: 'miles-to-km',
    preset: { from: 'mi', to: 'km', value: 5 },
    content: {
      en: {
        title: 'Miles to KM Converter — Instant, for Running & Driving',
        description:
          'Convert miles to kilometers instantly as you type — handy for pace, race distances and road signs, with a quick reference table.',
        h1: 'Miles to KM',
        intro:
          'Miles to kilometers, live. 1 mile is exactly 1.609344 km — useful for converting a 5K, 10K or marathon pace on the fly.',
        sections: [
          {
            heading: 'Race distances and road signs, converted exactly',
            body: `A statute mile is exactly 1.609344 km, so the familiar "1.6" is a rule of thumb about 0.6% short — enough to matter over half a marathon. The standard race distances come straight from this factor: 5K is 3.107 miles, 10K is 6.214 miles, a half marathon is 13.109 miles and a marathon is 26.219 miles (42.195 km).

Pace follows the same conversion. A 9:00-minute mile is 5:36 per kilometre, because 9 minutes ÷ 1.609344 = 5.59 minutes. Do not mix the statute mile with the nautical mile used at sea and in aviation: one nautical mile is 1.852 km, or about 15% longer.`,
            table: {
              caption: 'Common distances in miles and kilometres',
              head: ['Miles (mi)', 'Kilometres (km)'],
              rows: [
                ['1', '1.61'],
                ['3.1 (5K)', '4.99'],
                ['5', '8.05'],
                ['6.2 (10K)', '9.98'],
                ['10', '16.09'],
                ['13.1 (half)', '21.08'],
                ['26.2 (marathon)', '42.16'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How many km is 5 miles?',
            a: '5 miles is 8.04672 km, or 8.05 km rounded. Multiply the miles by 1.609344; using 1.6 would give 8.00 km and lose 47 metres.',
          },
          {
            q: 'How long is a marathon in miles?',
            a: 'A marathon is 42.195 km, which is 26.2188 miles — the 26.2 printed on race medals. A half marathon is 21.0975 km, or 13.1094 miles.',
          },
          {
            q: 'Is a mile the same as a nautical mile?',
            a: 'No. A statute mile is 1.609344 km, while a nautical mile is exactly 1.852 km — the length of one minute of latitude. That makes a nautical mile about 15% longer, which is why boat and aircraft speeds in knots are not the same as mph.',
          },
        ],
      },
      ko: {
        title: '마일 km 변환 — 입력 즉시, 러닝·운전에 유용',
        description:
          '마일을 킬로미터로 입력하는 즉시 변환합니다. 러닝 페이스, 대회 거리, 해외 도로 표지판 환산에 유용합니다.',
        h1: '마일 km 변환',
        intro: '마일을 킬로미터로 실시간 변환합니다. 1마일은 정확히 1.609344km입니다.',
        sections: [
          {
            heading: '대회 거리와 도로 표지판을 정확한 값으로',
            body: `법정 마일(statute mile)은 정확히 1.609344km입니다. 흔히 쓰는 "1.6"은 약 0.6% 작은 어림값이라 하프마라톤 정도 거리에서는 차이가 생깁니다. 대회 거리도 이 값에서 나옵니다. 5km는 3.107마일, 10km는 6.214마일, 하프마라톤은 13.109마일, 마라톤은 26.219마일(42.195km)입니다.

페이스도 같은 방식으로 바꿉니다. 1마일 9분 페이스는 9 ÷ 1.609344 = 5.59분이므로 1km당 5분 36초입니다. 해상·항공에서 쓰는 해리(nautical mile)와 혼동하면 안 됩니다. 1해리는 1.852km로 법정 마일보다 약 15% 깁니다.`,
            table: {
              caption: '자주 쓰는 거리의 마일·킬로미터 환산',
              head: ['마일 (mi)', '킬로미터 (km)'],
              rows: [
                ['1', '1.61'],
                ['3.1 (5K)', '4.99'],
                ['5', '8.05'],
                ['6.2 (10K)', '9.98'],
                ['10', '16.09'],
                ['13.1 (하프)', '21.08'],
                ['26.2 (마라톤)', '42.16'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '5마일은 몇 km인가요?',
            a: '5마일은 8.04672km로, 반올림하면 8.05km입니다. 1.609344를 곱하면 되고, 1.6으로 계산하면 8.00km가 되어 47m 차이가 납니다.',
          },
          {
            q: '마라톤은 몇 마일인가요?',
            a: '마라톤은 42.195km이고, 마일로는 26.2188마일입니다. 완주 메달에 적힌 26.2가 이 값이며, 하프마라톤은 21.0975km(13.1094마일)입니다.',
          },
          {
            q: '마일과 해리는 같은 단위인가요?',
            a: '아닙니다. 법정 마일은 1.609344km이고, 해리는 위도의 1분에 해당하는 정확히 1.852km입니다. 해리가 약 15% 길어서 선박·항공기의 노트(knot) 속도는 mph와 다릅니다.',
          },
        ],
      },
    },
  },
];

export const meta: ToolMeta = {
  slug: 'length-converter',
  category: 'converter',
  icon: 'convert',
  added: '2026-10-11',
  updated: '2026-10-19',
  edges: ['usability'],
  competitors: [
    {
      name: 'RapidTables — CM to Inches Converter',
      url: 'https://www.rapidtables.com/convert/length/cm-to-inch.html',
      weakness:
        'Its cm-to-inch page requires using its Convert control and sends many alternative pairs, such as feet-to-cm and miles-to-km, to separate pages. Betterbit keeps eight common units, a live current-unit reference table, and editable feet+inches↔cm height fields in one immediately updating panel. (Strength: it shows the nearest 1/64-inch fraction alongside decimal and feet+inches results.)',
    },
    {
      name: 'LengthConverter.org — Length and Distance Conversion Tool',
      url: 'https://www.lengthconverter.org/',
      weakness:
        'It displays a feet-and-inches result but does not provide editable feet and inches fields for a two-way height conversion; its height output follows the selected general conversion. Betterbit keeps a direct cm↔feet+inches form below the live length result, so a height can be entered from either convention. (Strength: it covers much smaller and larger units, including nano- and micrometres and nautical miles, and offers copy and formula output.)',
    },
    {
      name: 'EverydayCalcPro — Length Converter',
      url: 'https://www.everydaycalcpro.com/calculators/length-converter.php',
      weakness:
        'Its standard, feet+inches, height and fraction inputs are separate modes, and its results do not appear until its Convert button is pressed. Betterbit leaves the general conversion and editable height fields together and updates them on input. (Strength: it supports fractional-inch entry and an all-unit breakdown.)',
    },
  ],
  related: ['weight-converter', 'temperature-converter', 'area-converter', 'volume-converter'],
  variants,
};
