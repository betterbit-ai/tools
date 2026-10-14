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
      },
      ko: {
        title: '컵 mL 변환 — 한국·미국·미터법 컵 기준 구분',
        description:
          '컵을 mL로 입력 즉시 변환합니다. 한국 200mL, 미국 일반·영양표시, 미터법, 영국식 컵을 구분해 레시피 기준을 헷갈리지 않습니다.',
        h1: '컵 mL 변환',
        intro:
          '컵을 mL로 실시간 변환합니다. 한국 계량컵 200mL, 미국 일반 컵 236.5882365mL, 미국 영양표시 컵 240mL, 미터법 컵 250mL 중 레시피에 맞는 기준을 선택하세요.',
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
          'Convert mL to US, metric, Korean, legal, or imperial cups instantly. Compare the standards in one ad-free result instead of assuming every cup is 240 mL.',
        h1: 'mL to Cups Converter',
        intro:
          'Millilitres to cups, live as you type. 500 mL is about 2.11 US customary cups, exactly 2 metric cups, or 2.5 Korean cooking cups — select the recipe’s standard first.',
      },
      ko: {
        title: 'mL 컵 변환 — 레시피 기준별 컵 수 바로 확인',
        description:
          'mL를 한국·미국·미터법·영국식 컵으로 입력 즉시 변환합니다. 200mL와 236.588mL, 250mL 기준을 한 화면에서 비교하세요.',
        h1: 'mL 컵 변환',
        intro:
          'mL를 컵으로 실시간 변환합니다. 500mL는 한국 계량컵 2.5컵, 미국 일반 컵 약 2.11컵, 미터법 컵 정확히 2컵입니다. 레시피의 국가와 기준을 먼저 확인하세요.',
      },
    },
  },
];

export const meta: ToolMeta = {
  slug: 'volume-converter',
  category: 'converter',
  icon: 'convert',
  added: '2026-10-14',
  updated: '2026-10-14',
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
