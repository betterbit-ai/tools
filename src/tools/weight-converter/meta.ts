import type { ToolMeta, ToolVariant } from '../types';

const variants: ToolVariant[] = [
  {
    slug: 'kg-to-lbs',
    preset: { from: 'kg', to: 'lb', value: 70 },
    content: {
      en: {
        title: 'KG to LBS Converter — Instant, No Ads',
        description:
          'Convert kilograms to pounds instantly as you type. No "Convert" button, no ads — plus a quick reference table for common body-weight values.',
        h1: 'KG to LBS',
        intro:
          'Kilograms to pounds, live as you type. 1 kg = 2.2046226218 lb exactly (1 lb = 0.45359237 kg) — the result and table below update with every keystroke.',
      },
      ko: {
        title: 'kg 파운드 변환 — 입력 즉시 결과, 광고 없음',
        description:
          'kg를 파운드로 입력하는 즉시 변환합니다. "변환" 버튼과 광고 없이 바로 결과가 나오고, 몸무게에서 자주 쓰는 값의 빠른 참조표도 함께 제공합니다.',
        h1: 'kg 파운드 변환',
        intro:
          '킬로그램을 파운드로 실시간 변환합니다. 1kg는 정확히 2.2046lb입니다. 값을 입력하면 아래 표도 함께 바뀝니다.',
      },
    },
  },
  {
    slug: 'lbs-to-kg',
    preset: { from: 'lb', to: 'kg', value: 150 },
    content: {
      en: {
        title: 'LBS to KG Converter — Instant, No Ads',
        description:
          'Convert pounds to kilograms instantly as you type, no "Convert" button and no ads. Includes a quick reference table for common weights.',
        h1: 'LBS to KG',
        intro:
          'Pounds to kilograms, updated live. 1 lb is exactly 0.45359237 kg — type any value and the table follows along.',
      },
      ko: {
        title: '파운드 kg 변환 — 입력 즉시 결과, 광고 없음',
        description:
          '파운드를 kg로 입력하는 즉시 변환합니다. "변환" 버튼 없이 바로 결과를 보여주고, 빠른 참조표도 함께 제공합니다.',
        h1: '파운드 kg 변환',
        intro: '파운드를 킬로그램으로 실시간 변환합니다. 1파운드는 정확히 0.45359237kg입니다.',
      },
    },
  },
  {
    slug: 'kg-to-stone',
    preset: { from: 'kg', to: 'st', value: 70 },
    content: {
      en: {
        title: 'KG to Stone Converter — Instant, with a Quick Table',
        description:
          'Convert kilograms to stone (and stone to kg) instantly as you type — handy for UK/Ireland body weight. No ads, no sign-up, live results.',
        h1: 'KG to Stone',
        intro:
          'Kilograms to stone, live. 1 stone is exactly 14 lb (6.35029318 kg) — useful for reading a UK or Irish bathroom scale.',
      },
      ko: {
        title: 'kg 스톤(stone) 변환 — 입력 즉시, 영국 몸무게 단위',
        description:
          'kg를 영국·아일랜드에서 쓰는 몸무게 단위 스톤(stone)으로 입력하는 즉시 변환합니다. 광고 없이 바로 결과가 나옵니다.',
        h1: 'kg 스톤 변환',
        intro: '킬로그램을 스톤으로 실시간 변환합니다. 1스톤은 정확히 14파운드(6.35029318kg)입니다.',
      },
    },
  },
  {
    slug: 'don-to-gram',
    preset: { from: 'don', to: 'g', value: 1 },
    content: {
      en: {
        title: 'Don to Gram Converter — Korean Gold Weight Unit',
        description:
          'Convert the Korean traditional gold-weighing unit don (돈) to grams instantly. 1 don = 3.75 g exactly — no ads, live as you type.',
        h1: 'Don to Gram',
        intro:
          'Don (돈), the unit Korean jewelers use to weigh gold, converts to grams at a fixed 1 don = 3.75 g. Type any amount of don and the gram value updates instantly.',
      },
      ko: {
        title: '돈 g 변환 — 금 무게 단위, 입력 즉시 결과',
        description:
          '금은방에서 쓰는 돈을 그램으로 입력하는 즉시 변환합니다. 1돈은 정확히 3.75g이며, 광고 없이 바로 결과가 나옵니다.',
        h1: '돈 g 변환',
        intro: '금 무게를 재는 단위 돈(錢)을 그램으로 실시간 변환합니다. 1돈은 정확히 3.75g, 1냥(10돈)은 37.5g입니다.',
      },
    },
  },
];

export const meta: ToolMeta = {
  slug: 'weight-converter',
  category: 'converter',
  icon: 'convert',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['no-ads', 'usability', 'features', 'accuracy'],
  competitors: [
    {
      name: 'RapidTables — KG to Pound',
      url: 'https://www.rapidtables.com/convert/weight/kg-to-pound.html',
      weakness:
        'The converter is fixed to one unit pair per URL — converting to stone, ounces or tonnes means following separate pages (ounce-to-pound.html, ton-to-kg.html…) — and there are no Korean traditional units (돈, 냥, 근, 관) anywhere on the site. Betterbit lets you pick any of 12 units, including Korean units, on both sides of a single converter. (Strength: no ads on the page.)',
    },
    {
      name: 'TheCalculatorSite — Kilograms to Pounds (and Ounces)',
      url: 'https://www.thecalculatorsite.com/conversions/common/kg-to-pounds-ounces.php',
      weakness:
        'The page is limited to kg ↔ lb/oz; converting to stone or tonnes requires navigating to a different calculator on their site, and a "popup calculator" overlay and a long related-calculators sidebar compete for attention on mobile. Betterbit keeps every common weight unit, including stone and Korean units, on one page with no overlays.',
    },
    {
      name: 'UnitConverters.net — KG to LBS',
      url: 'https://www.unitconverters.net/weight-and-mass/kg-to-lbs.htm',
      weakness:
        'The page is a static conversion table plus a long list of "dozens" of alternate unit pages (including obscure historical units like the biblical Talent), so finding an uncommon pair like kg to stone means leaving the page; there is no live input-based converter and no Korean units. Betterbit converts any of 12 units live as you type on one page.',
    },
    {
      name: 'jab-guyver 무게 단위 변환 계산기 (kg, g, lb, oz, 근, 돈)',
      url: 'https://jab-guyver.co.kr/pages/%EB%AC%B4%EA%B2%8C-%EB%8B%A8%EC%9C%84-%EB%B3%80%ED%99%98-%EA%B3%84%EC%82%B0%EA%B8%B0-kg-g-lb-oz-%EA%B7%BC-%EB%8F%88-%ED%86%A4%EA%B9%8C%EC%A7%80',
      weakness:
        '728x90·300x250 크기의 광고 배너가 페이지에 포함되어 있고, 입력은 킬로그램(kg) 칸에서만 가능해 파운드나 돈에서 거꾸로 입력해 kg를 구할 수 없으며(단방향), 냥·관 단위는 지원하지 않는다. Betterbit는 광고 없이 12개 단위 중 어느 쪽에도 값을 입력할 수 있다.',
    },
    {
      name: 'calctools.co.kr — 무게 단위 변환기',
      url: 'https://calctools.co.kr/unit/weight-unit',
      weakness:
        '"계산하기" 버튼을 눌러야 결과가 나오며(실시간 아님), FAQ에는 "한약재 1근 = 375g"이라고 직접 설명하면서도 변환기에는 근(斤)을 600g 한 가지 값으로만 제공해 한약재·과일용 375g 근은 선택할 수 없다. Betterbit는 입력 즉시 결과가 바뀌고, 고기용 근(600g)과 한약재·과일용 근(375g)을 서로 다른 단위로 선택할 수 있다.',
    },
    {
      name: 'dacalc.com — 무게 단위 변환 계산기 (mg·g·kg·톤·온스·파운드·돈·냥·근·관)',
      url: 'https://www.dacalc.com/kr/weight-converter/',
      weakness:
        '페이지 제목은 "즉시 환산"이라고 안내하지만 실제로는 값 입력 → 단위 선택 → "변환하기" 버튼 클릭까지 3단계가 필요하고, 실용 팁에서 "한약재 1근 = 375g(약 1냥×10)"이라고 언급하면서도 변환 표에는 근을 600g 한 가지로만 제공한다. Betterbit는 버튼 없이 입력 즉시 변환되고, 두 근 값을 모두 단위로 제공한다.',
    },
  ],
  related: ['length-converter', 'bmi-calculator', 'percentage-calculator', 'scientific-calculator'],
  variants,
};
