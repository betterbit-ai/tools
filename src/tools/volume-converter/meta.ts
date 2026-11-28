import type { ToolMeta, ToolVariant } from '../types';

const variants: ToolVariant[] = [
  {
    slug: 'cups-to-ml',
    preset: { from: 'usCup', to: 'milliliter', value: 1 },
    content: {
      en: {
        title: 'Cups to mL Converter — US, Metric & Korean Cups',
        description:
          'Convert cups to mL instantly and choose the exact cup standard: US customary, US legal, metric, imperial, or Korean 200 mL. No guessing or Convert button.',
        h1: 'Cups to mL Converter',
        intro:
          'Convert cups to millilitres as you type. Choose US customary (236.5882365 mL), US legal (240 mL), metric (250 mL), imperial (284.130625 mL), or Korean cooking cups (200 mL) before you measure.',
        sections: [
          {
            heading: 'Which cup are you converting?',
            body: 'A US customary cup is 236.588 mL, the US legal cup used on nutrition labels is 240 mL, a metric cup is 250 mL, and a 계량컵 sold in Korea for home baking is commonly 200 mL. The gap between 200 mL and 236.6 mL is 18% — enough to change a batter — so match the cup named in the recipe instead of assuming one standard.\n\nA US fluid ounce is 29.5735 mL and eight of them make the 236.588 mL cup. For flour and sugar, weighing in grams removes the ambiguity: the same cup can hold 120 g or 150 g depending on how it is scooped.',
            table: {
              caption: 'Cups in millilitres, by cup standard',
              head: ['Cups', 'US customary (mL)', 'Metric (mL)', 'Korean 계량컵 (mL)'],
              rows: [
                ['1', '236.6', '250', '200'],
                ['0.5', '118.3', '125', '100'],
                ['2', '473.2', '500', '400'],
                ['3', '709.8', '750', '600'],
                ['4', '946.4', '1,000', '800'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How many mL is 1 cup?',
            a: '236.588 mL for a US customary cup, 240 mL for a US nutrition-label cup, 250 mL for a metric cup and about 200 mL for the 계량컵 sold in Korea. Check which one the recipe means.',
          },
          {
            q: 'Does the cup standard matter in baking?',
            a: 'It can. A 200 mL Korean measuring cup holds 18% less than a 236.6 mL US cup, so a recipe written in US cups comes out dry when converted with the smaller cup. Weighing in grams avoids the problem.',
          },
          {
            q: 'How many mL is 8 fl oz?',
            a: '236.588 mL, exactly one US cup. A UK fluid ounce is 28.413 mL, so a British 8 fl oz measure is 227.3 mL.',
          },
        ],
      },
      ko: {
        title: '컵 mL 변환 — 한국·미국·미터법 컵 기준 구분',
        description:
          '컵을 mL로 입력 즉시 변환합니다. 한국 200mL, 미국 일반·영양표시, 미터법, 영국식 컵을 구분해 레시피 기준을 헷갈리지 않습니다.',
        h1: '컵 mL 변환',
        intro:
          '컵을 mL로 실시간 변환합니다. 한국 계량컵 200mL, 미국 일반 컵 236.5882365mL, 미국 영양표시 컵 240mL, 미터법 컵 250mL 중 레시피에 맞는 기준을 선택하세요.',
        sections: [
          {
            heading: '어떤 컵을 기준으로 하나요',
            body: '미국 관습 단위 컵은 236.588mL, 미국 영양표시용 컵은 240mL, 미터법 컵은 250mL이고, 한국에서 가정용으로 파는 계량컵은 보통 200mL입니다. 200mL와 236.6mL는 18% 차이라 반죽 결과가 달라질 만큼 큽니다. 레시피에 적힌 컵이 어느 기준인지 먼저 확인하세요.\n\n미국 액량 온스는 29.5735mL이고 이것이 8개 모여 236.588mL 컵이 됩니다. 밀가루와 설탕은 g으로 재는 편이 안전합니다. 같은 컵이라도 떠내는 방식에 따라 120g에서 150g까지 차이가 납니다.',
            table: {
              caption: '컵 기준별 밀리리터',
              head: ['컵', '미국 관습 (mL)', '미터법 (mL)', '한국 계량컵 (mL)'],
              rows: [
                ['1', '236.6', '250', '200'],
                ['0.5', '118.3', '125', '100'],
                ['2', '473.2', '500', '400'],
                ['3', '709.8', '750', '600'],
                ['4', '946.4', '1,000', '800'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '1컵은 몇 mL인가요?',
            a: '미국 관습 컵 236.588mL, 영양표시용 240mL, 미터법 250mL, 한국 계량컵 약 200mL입니다. 레시피가 어느 기준인지 확인하세요.',
          },
          {
            q: '베이킹에서 컵 기준이 중요한가요?',
            a: '중요합니다. 200mL 계량컵은 236.6mL 컵보다 18% 적어, 미국 컵 기준 레시피를 작은 컵으로 환산하면 반죽이 뻑뻑해집니다. g으로 재면 문제가 없습니다.',
          },
          {
            q: '8 fl oz는 몇 mL인가요?',
            a: '236.588mL로 정확히 미국 1컵입니다. 영국 액량 온스는 28.413mL여서 영국식 8 fl oz는 227.3mL입니다.',
          },
        ],
      },
    },
  },
  {
    slug: 'ml-to-cups',
    preset: { from: 'milliliter', to: 'usCup', value: 500 },
    content: {
      en: {
        title: 'mL to Cups Converter — Pick the Recipe’s Cup Standard',
        description:
          'Convert mL to US, metric, Korean, legal, or imperial cups instantly. Compare the standards in one result instead of assuming every cup is 240 mL.',
        h1: 'mL to Cups Converter',
        intro:
          'Millilitres to cups, live as you type. 500 mL is about 2.11 US customary cups, exactly 2 metric cups, or 2.5 Korean cooking cups — select the recipe’s standard first.',
        sections: [
          {
            heading: 'Millilitres back into cups',
            body: 'Dividing millilitres by 236.588 gives US customary cups, by 250 gives metric cups and by 200 gives Korean 계량컵 cups. 500 mL is 2.11 US cups, 2 metric cups or 2.5 Korean measuring cups — three answers from one volume, which is why the standard has to be chosen before converting.\n\nUS nutrition labels use a 240 mL legal cup, so a 240 mL serving is exactly one labelled cup. For liquids the volume is unambiguous; for flour and sugar the weight depends on packing, and a kitchen scale is the reliable route.',
            table: {
              caption: 'Millilitres in cups, by cup standard',
              head: ['Millilitres (mL)', 'US cup', 'Metric cup (250 mL)'],
              rows: [
                ['100', '0.42', '0.4'],
                ['200', '0.85', '0.8'],
                ['240', '1.01', '0.96'],
                ['500', '2.11', '2'],
                ['1,000', '4.23', '4'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How many cups is 500 mL?',
            a: '2.11 US cups, 2 metric cups or 2.5 Korean 200 mL measuring cups. Choose the cup standard the recipe was written with before measuring.',
          },
          {
            q: 'How many cups is 240 mL?',
            a: 'About 1.01 US customary cups, and exactly one US nutrition-label cup, which is defined as 240 mL rather than 236.588 mL.',
          },
          {
            q: 'Is a cup of flour the same weight everywhere?',
            a: 'No. A US cup of all-purpose flour is about 120 g when spooned and about 150 g when scooped, a 25% difference, so use grams when the recipe gives them.',
          },
        ],
      },
      ko: {
        title: 'mL 컵 변환 — 레시피 기준별 컵 수 바로 확인',
        description:
          'mL를 한국·미국·미터법·영국식 컵으로 입력 즉시 변환합니다. 200mL와 236.588mL, 250mL 기준을 한 화면에서 비교하세요.',
        h1: 'mL 컵 변환',
        intro:
          'mL를 컵으로 실시간 변환합니다. 500mL는 한국 계량컵 2.5컵, 미국 일반 컵 약 2.11컵, 미터법 컵 정확히 2컵입니다. 레시피의 국가와 기준을 먼저 확인하세요.',
        sections: [
          {
            heading: '밀리리터를 컵으로 되돌리기',
            body: '밀리리터를 236.588로 나누면 미국 관습 컵, 250으로 나누면 미터법 컵, 200으로 나누면 한국 계량컵입니다. 500mL는 미국 컵 2.11, 미터법 컵 2, 한국 계량컵 2.5로 같은 부피가 세 가지 답이 됩니다. 그래서 환산 전에 기준을 먼저 정해야 합니다.\n\n미국 영양표시는 240mL를 1컵으로 정의하므로 240mL는 라벨 기준 정확히 1컵입니다. 액체는 부피가 분명하지만, 가루류는 담는 방식에 따라 무게가 달라져 주방 저울이 더 믿을 만합니다.',
            table: {
              caption: '컵 기준별 밀리리터 환산',
              head: ['밀리리터 (mL)', '미국 컵', '미터법 컵 (250mL)'],
              rows: [
                ['100', '0.42', '0.4'],
                ['200', '0.85', '0.8'],
                ['240', '1.01', '0.96'],
                ['500', '2.11', '2'],
                ['1,000', '4.23', '4'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '500mL는 몇 컵인가요?',
            a: '미국 컵 2.11, 미터법 컵 2, 한국 200mL 계량컵 2.5입니다. 레시피가 어떤 컵으로 쓰였는지 먼저 확인하세요.',
          },
          {
            q: '240mL는 몇 컵인가요?',
            a: '미국 관습 컵으로 1.01, 미국 영양표시 기준으로는 정확히 1컵입니다. 영양표시용 컵은 236.588mL가 아니라 240mL로 정의됩니다.',
          },
          {
            q: '밀가루 한 컵의 무게가 항상 같은가요?',
            a: '아닙니다. 미국식 중력분 한 컵은 숟가락으로 담으면 약 120g, 퍼 담으면 약 150g으로 25% 차이가 납니다. 레시피에 g이 적혀 있으면 그 값을 쓰세요.',
          },
        ],
      },
    },
  },
];

export const meta: ToolMeta = {
  slug: 'volume-converter',
  category: 'converter',
  icon: 'convert',
  added: '2026-10-14',
  updated: '2026-11-19',
  edges: ['usability', 'features', 'accuracy'],
  competitors: [
    {
      name: 'MoneyDeck — Cups to ML Converter',
      url: 'https://moneydeck.io/tools/cups-to-ml',
      weakness:
        'Its cup selector lists US customary, US nutrition-label, metric, imperial, and Japanese cups, but not the 200 mL Korean cooking cup; its result surface is centred on the selected cup pair. Betterbit adds the Korean standard and shows every supported cooking measure beside the chosen result. (Strength: it includes a Japanese-cup option and a printable reference chart.)',
    },
    {
      name: 'CupConverter — Cups to ML Converter',
      url: 'https://cupconverter.net/cups-to-ml-converter',
      weakness:
        'Its live selector exposes US, UK, and metric cups, but not Korean 200 mL or US legal 240 mL cups, and the page is dedicated to the cup/mL pair. Betterbit keeps those distinct cup standards with mL, L, fluid ounces, tablespoons, and teaspoons in one live result panel. (Strength: it gives a detailed regional decision guide and fraction shortcuts.)',
    },
    {
      name: 'letmecalc — Cups to mL Converter',
      url: 'https://letmecalc.com/cooking/cups-to-ml',
      weakness:
        'Its calculator offers only US customary and metric cup choices, so Korean 200 mL, US legal 240 mL, and imperial 284.130625 mL recipes require another source. Betterbit exposes all five cup standards directly and updates without a Convert button. (Strength: it explains the US-versus-metric choice concisely.)',
    },
    {
      name: 'ZEKILO — 부피 변환기',
      url: 'https://zekilo.com/ko/volume-converter/',
      weakness:
        'Its all-unit result lists Korean 200 mL cups and US cups but does not list a separate 250 mL metric cup or 240 mL US legal cup. Betterbit makes both standards selectable, preventing a recipe’s “cup” from being silently treated as another standard. (Strength: it also covers traditional Korean 되·홉·말 units.)',
    },
    {
      name: 'Toolu — 컵↔mL 변환기',
      url: 'https://toolu.dev/ko/tools/cups-to-ml/',
      weakness:
        'Its visible calculator choices are US cup, metric cup, mL, tablespoons, and teaspoons; it describes a Korean paper cup as about 180 mL but does not offer the Korean 200 mL cooking cup as a selectable standard. Betterbit separates Korean cooking cups from all recipe cup standards in the conversion controls. (Strength: it includes a useful fraction reference table.)',
    },
    {
      name: '도구스 — 부피 단위 변환기',
      url: 'https://dogus.co.kr/unit/volume',
      weakness:
        'Its page supports Korean 200 mL cups and US volume units, but its FAQ rounds the U.S. recipe cup to 240 mL, blending it with the separate US legal-cup convention. Betterbit preserves 236.5882365 mL US customary and 240 mL US legal cups as separate choices. (Strength: it includes traditional Korean units in its all-unit list.)',
    },
  ],
  related: ['weight-converter', 'temperature-converter', 'length-converter'],
  variants,
};
