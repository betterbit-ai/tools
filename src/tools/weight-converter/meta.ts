import type { ToolMeta, ToolVariant } from '../types';

const variants: ToolVariant[] = [
  {
    slug: 'kg-to-lbs',
    preset: { from: 'kg', to: 'lb', value: 70 },
    content: {
      en: {
        title: 'KG to LBS Converter — Instant, With Weight Chart',
        description:
          'Convert kilograms to pounds instantly as you type. No "Convert" button — plus a quick reference table for common body-weight values.',
        h1: 'KG to LBS',
        intro:
          'Kilograms to pounds, live as you type. 1 kg = 2.2046226218 lb exactly (1 lb = 0.45359237 kg) — the result and table below update with every keystroke.',
        sections: [
          {
            heading: 'Kilograms to pounds, exactly',
            body: 'One kilogram is 2.20462262 pounds, defined through the 0.45359237 kg international pound, so 70 kg is 154.32 lb and 100 kg is 220.46 lb. The 2.2 shortcut is about 0.2% low, which is 300 g on a 70 kg figure — enough to matter against a baggage allowance.\n\nBody weight, gym plates and baggage limits are the usual reasons to convert. A 23 kg airline allowance is 50.7 lb, so a 50 lb suitcase stays under it, and 225 lb on a bar is 102.06 kg.',
            table: {
              caption: 'Kilograms to pounds',
              head: ['Kilograms (kg)', 'Pounds (lb)'],
              rows: [
                ['50', '110.23'],
                ['60', '132.28'],
                ['70', '154.32'],
                ['80', '176.37'],
                ['90', '198.42'],
                ['100', '220.46'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How many pounds is 70 kg?',
            a: '70 kg is 154.32 lb. Multiply by 2.20462262; the 2.2 rule gives 154.0 lb, which is 0.3 lb short.',
          },
          {
            q: 'How many pounds is 23 kg?',
            a: '23 kg is 50.71 lb, the usual airline checked-baggage limit. A 50 lb bag is 22.68 kg and stays under it.',
          },
          {
            q: 'Is a pound exactly 0.45359237 kg?',
            a: 'Yes. The international avoirdupois pound has been exactly 0.45359237 kg since 1959, which makes 1 kg exactly 2.2046226218 lb.',
          },
        ],
      },
      ko: {
        title: 'kg 파운드 변환 — 입력 즉시 결과, 참조표 포함',
        description:
          'kg를 파운드로 입력하는 즉시 변환합니다. "변환" 버튼 없이 바로 결과가 나오고, 몸무게에서 자주 쓰는 값의 빠른 참조표도 함께 제공합니다.',
        h1: 'kg 파운드 변환',
        intro:
          '킬로그램을 파운드로 실시간 변환합니다. 1kg는 정확히 2.2046lb입니다. 값을 입력하면 아래 표도 함께 바뀝니다.',
        sections: [
          {
            heading: '킬로그램에서 파운드로, 정확한 값',
            body: '1kg은 2.20462262파운드이고, 이는 0.45359237kg인 국제 파운드에서 나온 값입니다. 70kg은 154.32lb, 100kg은 220.46lb입니다. 2.2를 곱하는 요령은 약 0.2% 작아서 70kg에서 300g 차이가 나며, 위탁 수하물 한도 앞에서는 무시할 수 없는 차이입니다.\n\n체중, 헬스 플레이트, 수하물 한도가 주된 환산 이유입니다. 항공사 위탁 한도 23kg은 50.7lb이므로 50lb 캐리는 한도 안에 들어가고, 바벨 225lb는 102.06kg입니다.',
            table: {
              caption: '킬로그램을 파운드로',
              head: ['킬로그램 (kg)', '파운드 (lb)'],
              rows: [
                ['50', '110.23'],
                ['60', '132.28'],
                ['70', '154.32'],
                ['80', '176.37'],
                ['90', '198.42'],
                ['100', '220.46'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '70kg은 몇 파운드인가요?',
            a: '154.32lb입니다. 2.20462262를 곱하세요. 2.2를 곱하면 154.0lb로 0.3lb 부족합니다.',
          },
          {
            q: '23kg은 몇 파운드인가요?',
            a: '50.71lb로 흔한 항공사 위탁 수하물 한도입니다. 50lb 가방은 22.68kg이어서 한도 안에 들어갑니다.',
          },
          {
            q: '1파운드는 정확히 0.45359237kg인가요?',
            a: '네. 국제 상형 파운드는 1959년부터 정확히 0.45359237kg이고, 그래서 1kg은 정확히 2.2046226218lb입니다.',
          },
        ],
      },
    },
  },
  {
    slug: 'lbs-to-kg',
    preset: { from: 'lb', to: 'kg', value: 150 },
    content: {
      en: {
        title: 'LBS to KG Converter — Instant, With Weight Chart',
        description:
          'Convert pounds to kilograms instantly as you type, no "Convert" button needed. Includes a quick reference table for common weights.',
        h1: 'LBS to KG',
        intro:
          'Pounds to kilograms, updated live. 1 lb is exactly 0.45359237 kg — type any value and the table follows along.',
        sections: [
          {
            heading: 'Pounds to kilograms, exactly',
            body: 'A pound is 0.45359237 kg, so 150 lb is 68.04 kg, 200 lb is 90.72 kg and a 45 lb plate is 20.41 kg. Dividing by 2.2046 is the same operation; multiplying by 0.45, the common shortcut, is about 0.8% low and loses 500 g on a 150 lb figure.\n\nUS gym plates, body-weight figures and shipping weights are in pounds while Korean scales show kilograms. A 100 kg barbell is 220.46 lb, and a "two plate" US lift — a 45 lb bar plus four 45 lb plates — is 225 lb, or 102.06 kg.',
            table: {
              caption: 'Pounds to kilograms',
              head: ['Pounds (lb)', 'Kilograms (kg)'],
              rows: [
                ['100', '45.36'],
                ['120', '54.43'],
                ['150', '68.04'],
                ['180', '81.65'],
                ['200', '90.72'],
                ['250', '113.40'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How many kg is 150 lb?',
            a: '150 lb is 68.04 kg. Multiply by 0.45359237; the 0.45 shortcut gives 67.5 kg, half a kilogram light.',
          },
          {
            q: 'How many kg is 225 lb?',
            a: '225 lb is 102.06 kg — the usual two-plates-a-side barbell in a US gym: a 45 lb bar plus four 45 lb plates.',
          },
          {
            q: 'Why do US gym plates not match metric plates?',
            a: 'US plates are made in pounds (45 lb is about 20.41 kg) while metric plates are 20 kg or 25 kg, so the same number of plates is not the same weight in the two systems.',
          },
        ],
      },
      ko: {
        title: '파운드 kg 변환 — 입력 즉시 결과, 참조표 포함',
        description:
          '파운드를 kg로 입력하는 즉시 변환합니다. "변환" 버튼 없이 바로 결과를 보여주고, 빠른 참조표도 함께 제공합니다.',
        h1: '파운드 kg 변환',
        intro: '파운드를 킬로그램으로 실시간 변환합니다. 1파운드는 정확히 0.45359237kg입니다.',
        sections: [
          {
            heading: '파운드에서 킬로그램으로, 정확한 값',
            body: '1파운드는 0.45359237kg이므로 150lb는 68.04kg, 200lb는 90.72kg, 45lb 원판은 20.41kg입니다. 2.2046으로 나누는 것과 같은 계산이고, 0.45를 곱하는 요령은 약 0.8% 작아 150lb에서 500g이 빠집니다.\n\n미국 헬스장 원판과 체중, 배송 무게는 파운드이고 한국 체중계는 킬로그램입니다. 100kg 바벨은 220.46lb이고, 미국식 "양쪽 두 장" 리프트(45lb 바 1개 + 45lb 원판 4개)는 225lb, 즉 102.06kg입니다.',
            table: {
              caption: '파운드를 킬로그램으로',
              head: ['파운드 (lb)', '킬로그램 (kg)'],
              rows: [
                ['100', '45.36'],
                ['120', '54.43'],
                ['150', '68.04'],
                ['180', '81.65'],
                ['200', '90.72'],
                ['250', '113.40'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '150lb는 몇 kg인가요?',
            a: '68.04kg입니다. 0.45359237을 곱하세요. 0.45를 쓰면 67.5kg으로 0.5kg 부족합니다.',
          },
          {
            q: '225lb는 몇 kg인가요?',
            a: '102.06kg입니다. 미국 헬스장의 양쪽 두 장 리프트(45lb 바와 45lb 원판 4개)에 해당합니다.',
          },
          {
            q: '미국 원판과 미터 원판이 왜 다른가요?',
            a: '미국 원판은 파운드 단위(45lb는 약 20.41kg)로, 미터 원판은 20kg이나 25kg으로 만들어집니다. 같은 장수라도 무게가 같지 않습니다.',
          },
        ],
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
          'Convert kilograms to stone (and stone to kg) instantly as you type — handy for UK/Ireland body weight. No sign-up, live results.',
        h1: 'KG to Stone',
        intro:
          'Kilograms to stone, live. 1 stone is exactly 14 lb (6.35029318 kg) — useful for reading a UK or Irish bathroom scale.',
        sections: [
          {
            heading: 'Kilograms to stone, and where stone is still used',
            body: 'One stone is 14 pounds, or 6.35029318 kg, so 70 kg is 11.02 stone and 80 kg is 12.6 stone. Stone is still the everyday body-weight unit in the UK and Ireland, usually written as stone and pounds: 70 kg is 11 st 0.3 lb.\n\nThe single stone figure hides the pounds part, which is how UK scales and conversations present weight. Multiply kilograms by 0.157473 to get stone, then take the decimal part and multiply it by 14 for the pounds.',
            table: {
              caption: 'Kilograms to stone and pounds',
              head: ['Kilograms (kg)', 'Stone (st)', 'Stone and pounds'],
              rows: [
                ['50', '7.87', '7 st 12.2 lb'],
                ['60', '9.45', '9 st 6.3 lb'],
                ['70', '11.02', '11 st 0.3 lb'],
                ['80', '12.60', '12 st 8.4 lb'],
                ['90', '14.17', '14 st 2.4 lb'],
                ['100', '15.75', '15 st 10.5 lb'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How many stone is 70 kg?',
            a: '70 kg is 11.02 stone, or 11 stone 0.3 pounds. Multiply by 0.157473 to get stone and use the remainder for pounds.',
          },
          {
            q: 'Why is stone still used?',
            a: 'The UK and Ireland use stone for body weight in everyday speech while official and medical records use kilograms, so a UK bathroom scale often shows both.',
          },
          {
            q: 'How many kg is 12 stone?',
            a: '12 stone is 168 pounds, or 76.20 kg, since one stone is 6.35029318 kg.',
          },
        ],
      },
      ko: {
        title: 'kg 스톤(stone) 변환 — 입력 즉시, 영국 몸무게 단위',
        description: 'kg를 영국·아일랜드에서 쓰는 몸무게 단위 스톤(stone)으로 입력하는 즉시 변환합니다.',
        h1: 'kg 스톤 변환',
        intro: '킬로그램을 스톤으로 실시간 변환합니다. 1스톤은 정확히 14파운드(6.35029318kg)입니다.',
        sections: [
          {
            heading: '킬로그램에서 스톤으로, 지금도 쓰이는 곳',
            body: '1스톤은 14파운드, 즉 6.35029318kg입니다. 70kg은 11.02스톤, 80kg은 12.6스톤입니다. 영국과 아일랜드에서는 체중을 여전히 스톤으로 말하며, 보통 스톤과 파운드를 함께 적어 70kg을 11st 0.3lb로 씁니다.\n\n스톤 하나로 표시하면 파운드 부분이 숨는다는 점이 특징입니다. kg에 0.157473을 곱해 스톤을 얻고, 소수 부분에 14를 곱해 파운드를 구합니다.',
            table: {
              caption: '킬로그램을 스톤·파운드로',
              head: ['킬로그램 (kg)', '스톤 (st)', '스톤·파운드'],
              rows: [
                ['50', '7.87', '7 st 12.2 lb'],
                ['60', '9.45', '9 st 6.3 lb'],
                ['70', '11.02', '11 st 0.3 lb'],
                ['80', '12.60', '12 st 8.4 lb'],
                ['90', '14.17', '14 st 2.4 lb'],
                ['100', '15.75', '15 st 10.5 lb'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '70kg은 몇 스톤인가요?',
            a: '11.02스톤, 즉 11스톤 0.3파운드입니다. 0.157473을 곱해 스톤을 구하고 남은 소수로 파운드를 계산합니다.',
          },
          {
            q: '스톤은 왜 아직 쓰이나요?',
            a: '영국과 아일랜드에서 일상적으로 체중을 스톤으로 말하고, 공식·의료 기록은 킬로그램을 씁니다. 영국 체중계는 두 단위를 함께 보여 주는 경우가 많습니다.',
          },
          {
            q: '12스톤은 몇 kg인가요?',
            a: '12스톤은 168파운드이고 76.20kg입니다. 1스톤이 6.35029318kg이기 때문입니다.',
          },
        ],
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
          'Convert the Korean traditional gold-weighing unit don (돈) to grams instantly. 1 don = 3.75 g exactly — live as you type.',
        h1: 'Don to Gram',
        intro:
          'Don (돈), the unit Korean jewelers use to weigh gold, converts to grams at a fixed 1 don = 3.75 g. Type any amount of don and the gram value updates instantly.',
        sections: [
          {
            heading: 'The Korean don, nyang and gwan in grams',
            body: 'One 돈 is exactly 3.75 g, one 냥 is ten 돈 (37.5 g) and one 관 is 100 냥 (3.75 kg). The units come from the traditional Korean and Japanese weight system and are still used for gold, silver and herbal medicine, so a 1돈 gold ring means 3.75 g of metal rather than the total weight of the finished ring.\n\nJewellery prices quote per 돈 and per gram, and the two do not always include the same making charge. When comparing, convert the quoted weight to grams first: 0.5돈 is 1.875 g, 2돈 is 7.5 g and 10돈 is 37.5 g.',
            table: {
              caption: 'Korean weight units in grams',
              head: ['Unit', 'Grams'],
              rows: [
                ['1 돈', '3.75'],
                ['1 냥 (10돈)', '37.5'],
                ['1 관 (100냥)', '3,750'],
                ['0.5 돈', '1.875'],
                ['2 돈', '7.5'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How many grams is 1돈?',
            a: '3.75 g exactly. That is the standard for gold and silver in Korea, so a 1돈 ring contains 3.75 g of metal before any making charge or setting.',
          },
          {
            q: 'How many grams is 1냥?',
            a: '37.5 g, because one 냥 is ten 돈 of 3.75 g. Herbal medicine and traditional markets still quote 냥.',
          },
          {
            q: 'Does the 3.75 g include the ring?',
            a: 'No. The 3.75 g refers to the metal content, so a ring sold as 1돈 may weigh more once the setting is included. Check whether the price is per metal weight or total weight.',
          },
        ],
      },
      ko: {
        title: '돈 g 변환 — 금 무게 단위, 입력 즉시 결과',
        description: '금은방에서 쓰는 돈을 그램으로 입력하는 즉시 변환합니다. 1돈은 정확히 3.75g입니다.',
        h1: '돈 g 변환',
        intro: '금 무게를 재는 단위 돈(錢)을 그램으로 실시간 변환합니다. 1돈은 정확히 3.75g, 1냥(10돈)은 37.5g입니다.',
        sections: [
          {
            heading: '한국 돈·냥·관을 그램으로',
            body: '1돈은 정확히 3.75g, 1냥은 10돈(37.5g), 1관은 100냥(3.75kg)입니다. 이 단위는 전통적인 한국·일본식 무게 체계에서 왔고 금·은·한약에 지금도 쓰입니다. 그래서 금 1돈 반지는 완성품 무게가 아니라 금속 3.75g을 뜻합니다.\n\n주얼리 가격은 돈 단위와 g 단위로 함께 안내되며, 두 값이 항상 같은 공임을 포함하지는 않습니다. 비교할 때는 먼저 g으로 환산하세요. 0.5돈은 1.875g, 2돈은 7.5g, 10돈은 37.5g입니다.',
            table: {
              caption: '한국 무게 단위와 그램',
              head: ['단위', '그램'],
              rows: [
                ['1돈', '3.75'],
                ['1냥 (10돈)', '37.5'],
                ['1관 (100냥)', '3,750'],
                ['0.5돈', '1.875'],
                ['2돈', '7.5'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '금 1돈은 몇 그램인가요?',
            a: '정확히 3.75g입니다. 한국에서 금·은의 기준이며, 1돈 반지는 공임과 장식 제외한 금속이 3.75g이라는 뜻입니다.',
          },
          {
            q: '1냥은 몇 그램인가요?',
            a: '37.5g입니다. 1냥이 3.75g짜리 10돈이기 때문이며, 한약과 전통 시장에서 아직 냥을 씁니다.',
          },
          {
            q: '3.75g에 반지 무게도 포함되나요?',
            a: '아닙니다. 3.75g은 금속 함량이라 장식까지 붙은 완성품은 더 무겁습니다. 가격이 금속 무게 기준인지 총중량 기준인지 확인하세요.',
          },
        ],
      },
    },
  },
];

export const meta: ToolMeta = {
  slug: 'weight-converter',
  category: 'converter',
  icon: 'convert',
  added: '2026-10-11',
  updated: '2026-11-28',
  edges: ['usability', 'features', 'accuracy'],
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
        '728x90·300x250 크기의 광고 배너가 페이지에 포함되어 있고, 입력은 킬로그램(kg) 칸에서만 가능해 파운드나 돈에서 거꾸로 입력해 kg를 구할 수 없으며(단방향), 냥·관 단위는 지원하지 않는다. Betterbit는 12개 단위 중 어느 쪽에도 값을 입력할 수 있다.',
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
  related: [
    'length-converter',
    'bmi-calculator',
    'percentage-calculator',
    'scientific-calculator',
    'temperature-converter',
    'calorie-calculator',
    'area-converter',
    'volume-converter',
    'shoe-size-converter',
  ],
  variants,
};
