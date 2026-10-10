import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  valueLabel: 'Value',
  fromLabel: 'From',
  toLabel: 'To',
  swap: 'Swap units',
  resultLabel: 'Result',
  autosaved: 'Saved automatically',
  quickTableTitle: 'Quick reference',
  unitMg: 'Milligrams (mg)',
  unitG: 'Grams (g)',
  unitKg: 'Kilograms (kg)',
  unitT: 'Metric tons (t)',
  unitOz: 'Ounces (oz)',
  unitLb: 'Pounds (lb)',
  unitSt: 'Stone (st)',
  unitDon: 'Don (돈)',
  unitNyang: 'Nyang (냥)',
  unitGeunMeat: 'Geun, meat (근, 600 g)',
  unitGeunProduce: 'Geun, produce/herbal (근, 375 g)',
  unitGwan: 'Gwan (관)',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Weight Converter — KG to LBS, Stone, and Korean Units',
    description:
      'Convert kg, lbs, oz, stone, mg, tons and Korean units (don, nyang, geun, gwan) instantly as you type — no ads, no "Convert" button, with a quick reference table.',
    h1: 'Weight Converter',
    tagline: 'Kilograms, pounds, stone and more — converted live, including Korean don, nyang, geun and gwan.',
    name: 'Weight Converter',
    keywords: [
      'kg to lbs',
      'lbs to kg',
      'kg to stone',
      'weight conversion',
      'don to gram',
      'geun to kg',
      'ounces to grams',
      'kilograms to pounds',
    ],
    howTo: [
      'Type a value and pick the units to convert from and to.',
      'Press the swap button to flip the two units instantly.',
      'Check the quick reference table for common values in your chosen units.',
      'Pick "Geun, meat" or "Geun, produce/herbal" depending on what you are weighing — they are different units.',
    ],
    sections: [
      {
        heading: 'Exact conversion factors',
        body: 'This converter uses exact definitions, not rounded approximations: 1 lb = 0.45359237 kg exactly (the 1959 international avoirdupois pound), so 1 kg = 2.2046226218 lb and 1 oz (1/16 lb) = 28.349523125 g. 1 stone = 14 lb = 6.35029318 kg, the unit UK and Irish bathroom scales still show. Because the factors are exact, results stay accurate whether you convert 0.5 mg or 50,000 kg.',
      },
      {
        heading: 'Korean traditional units: don, nyang, geun, gwan',
        body: 'Korean jewelers still price gold by the don (돈): 1 don = 3.75 g exactly, and 1 nyang (냥) = 10 don = 37.5 g. The confusing part is 근 (geun): meat and most goods use 1 geun = 16 nyang = 600 g, the modern legal standard at butcher shops, but produce and herbal medicine traditionally use a separate 10-nyang geun = 375 g. This converter lists them as two distinct units — "Geun, meat" and "Geun, produce/herbal" — so you never apply the wrong one. 1 gwan (관) = 1,000 don = 3.75 kg.',
      },
    ],
    faq: [
      {
        q: 'How many pounds is 1 kg?',
        a: 'One kilogram equals exactly 2.2046226218 pounds, since 1 pound is defined as exactly 0.45359237 kg.',
      },
      {
        q: 'How many kg is 1 stone?',
        a: 'One stone equals exactly 6.35029318 kg (14 pounds) — the unit still used for body weight in the UK and Ireland.',
      },
      {
        q: 'How many grams is 1 don (돈)?',
        a: 'One don is exactly 3.75 grams. It is the unit Korean jewelers use to price and weigh gold, with 1 nyang (냥) equal to 10 don, or 37.5 g.',
      },
      {
        q: 'Is 1 geun (근) always 600 grams?',
        a: 'No. Meat and most everyday goods use 1 geun = 600 g (16 nyang), the modern legal standard at Korean butcher shops, but produce and herbal medicine traditionally use a separate 1 geun = 375 g (10 nyang). This converter offers both as separate units so you pick the right one.',
      },
      {
        q: 'How many grams is 1 gwan (관)?',
        a: 'One gwan equals exactly 3,750 grams (3.75 kg), since 1 gwan is defined as 1,000 don.',
      },
      {
        q: 'Is this weight converter accurate?',
        a: 'Yes. It uses exact definitions (1 lb = 0.45359237 kg, 1 don = 3.75 g) rather than rounded approximations, and it is one of the few converters to separate the 600 g meat geun from the 375 g produce/herbal geun instead of only offering one.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '무게 변환기 — kg 파운드, 스톤, 근·돈 변환',
    description:
      'kg, 파운드, 온스, 스톤, mg, 톤은 물론 돈·냥·근·관까지 입력하는 즉시 변환합니다. 광고와 "변환" 버튼 없이 바로 결과가 나오고, 빠른 참조표도 함께 제공합니다.',
    h1: '무게 변환기',
    tagline: 'kg, 파운드, 스톤부터 돈·냥·근·관까지, 입력하는 즉시 변환됩니다.',
    name: '무게 변환기',
    keywords: [
      'kg 파운드 변환',
      '파운드 kg 변환',
      'kg 스톤 변환',
      '무게 단위 변환',
      '돈 그램 변환',
      '근 kg 변환',
      '온스 그램 변환',
      '킬로그램 파운드',
    ],
    howTo: [
      '값을 입력하고 변환할 단위와 결과 단위를 선택하세요.',
      '단위 바꾸기 버튼을 누르면 두 단위가 즉시 서로 바뀝니다.',
      '빠른 참조표에서 자주 찾는 값의 변환 결과를 바로 확인하세요.',
      '재는 대상에 맞게 "근(고기)"와 "근(채소·한약재)" 중 올바른 단위를 선택하세요 — 두 값이 다릅니다.',
    ],
    sections: [
      {
        heading: '정확한 변환 비율',
        body: '1파운드는 정확히 0.45359237kg(1959년 국제 야드-파운드 협정 기준)으로 정의되어, 1kg는 정확히 2.2046226218lb, 1온스(1/16파운드)는 28.349523125g입니다. 1스톤은 14파운드, 즉 6.35029318kg로 영국·아일랜드에서 체중계에 여전히 쓰입니다. 반올림 없는 정확한 값을 쓰기 때문에 0.5mg처럼 작은 값이나 50,000kg처럼 큰 값을 변환해도 오차가 쌓이지 않습니다.',
      },
      {
        heading: '한국 전통 단위: 돈·냥·근·관',
        body: '금은방에서는 지금도 금을 돈 단위로 거래합니다. 1돈은 정확히 3.75g, 1냥(냥)은 10돈, 즉 37.5g입니다. 헷갈리기 쉬운 것은 근(斤)인데, 고기나 대부분의 물건은 1근 = 16냥 = 600g을 쓰는 것이 현재 시장의 기준이지만, 과일과 한약재는 전통적으로 10냥 기준의 별도 근 = 375g을 씁니다. 이 변환기는 "근(고기)"과 "근(채소·한약재)"을 서로 다른 단위로 나눠 제공해 혼동 없이 올바른 값을 고를 수 있습니다. 1관은 1,000돈, 즉 3.75kg입니다.',
      },
    ],
    faq: [
      {
        q: '1kg는 몇 파운드인가요?',
        a: '1kg는 정확히 2.2046226218파운드입니다. 1파운드가 정확히 0.45359237kg로 정의되기 때문입니다.',
      },
      {
        q: '1스톤은 몇 kg인가요?',
        a: '1스톤은 정확히 6.35029318kg(14파운드)입니다. 영국과 아일랜드에서 지금도 체중을 나타낼 때 쓰는 단위입니다.',
      },
      {
        q: '1돈은 몇 그램인가요?',
        a: '1돈은 정확히 3.75그램입니다. 금은방에서 금 무게와 가격을 매길 때 쓰는 단위이며, 1냥은 10돈, 즉 37.5g입니다.',
      },
      {
        q: '1근은 항상 600g인가요?',
        a: '아닙니다. 고기나 대부분의 물건은 1근 = 600g(16냥)을 쓰는 것이 현재 시장의 기준이지만, 과일과 한약재는 전통적으로 1근 = 375g(10냥)이라는 별도 기준을 씁니다. 이 변환기는 두 근을 서로 다른 단위로 제공해 올바른 값을 고를 수 있게 합니다.',
      },
      {
        q: '1관은 몇 그램인가요?',
        a: '1관은 정확히 3,750그램(3.75kg)입니다. 1관은 1,000돈으로 정의됩니다.',
      },
      {
        q: '이 무게 변환기는 정확한가요?',
        a: '네. 1파운드=0.45359237kg, 1돈=3.75g처럼 반올림 없는 정확한 정의를 쓰며, 600g 고기용 근과 375g 채소·한약재용 근을 하나로 뭉뚱그리지 않고 따로 선택할 수 있는 거의 유일한 변환기입니다.',
      },
    ],
    ui: {
      valueLabel: '값',
      fromLabel: '변환할 단위',
      toLabel: '결과 단위',
      swap: '단위 바꾸기',
      resultLabel: '결과',
      autosaved: '자동 저장됨',
      quickTableTitle: '빠른 참조표',
      unitMg: '밀리그램 (mg)',
      unitG: '그램 (g)',
      unitKg: '킬로그램 (kg)',
      unitT: '톤 (t)',
      unitOz: '온스 (oz)',
      unitLb: '파운드 (lb)',
      unitSt: '스톤 (st)',
      unitDon: '돈',
      unitNyang: '냥',
      unitGeunMeat: '근, 고기 (600g)',
      unitGeunProduce: '근, 채소·한약재 (375g)',
      unitGwan: '관',
    },
  },
};
