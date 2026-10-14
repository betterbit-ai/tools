import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  valueLabel: 'Volume',
  fromLabel: 'From',
  toLabel: 'To',
  swap: 'Swap units',
  resultLabel: 'Result in {unit}',
  otherUnitsTitle: 'Also in these cooking measures',
  quickTableTitle: 'Quick reference',
  factorHint: 'Choose the cup standard printed by the recipe. Results update as you type.',
  autosaved: 'Saved in this browser',
  copy: 'Copy all results',
  copied: 'Copied',
  unitMilliliter: 'Millilitres (mL)',
  unitLiter: 'Litres (L)',
  unitKoreanCup: 'Korean cooking cup (200 mL)',
  unitUsCup: 'US customary cup (236.588 mL)',
  unitUsLegalCup: 'US legal cup (240 mL)',
  unitMetricCup: 'Metric cup (250 mL)',
  unitImperialCup: 'Imperial cup (284.131 mL)',
  unitUsFluidOunce: 'US fluid ounces (fl oz)',
  unitUsTablespoon: 'US tablespoons (tbsp)',
  unitUsTeaspoon: 'US teaspoons (tsp)',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Cups to mL & Volume Converter — US, Metric, Korean',
    description:
      'Convert cups to mL, L, tablespoons, teaspoons and fluid ounces instantly. Choose US, metric, Korean 200 mL, legal or imperial cups instead of guessing.',
    h1: 'Volume Converter',
    tagline:
      'Convert cups, mL, L, spoons and fluid ounces live — with the recipe’s exact cup standard clearly selected.',
    name: 'Volume Converter',
    keywords: [
      'cups to ml',
      'ml to cups',
      'cup converter',
      'cooking measurement converter',
      'US cup to ml',
      'metric cup to ml',
      'tablespoon to ml',
      'teaspoon to ml',
    ],
    howTo: [
      'Enter the volume you have and select its unit under From.',
      'Choose the unit you need under To; the result changes immediately.',
      'For a recipe that says “cup,” select its country or standard rather than assuming a universal cup size.',
      'Use the other-measures cards and quick table to compare the same amount before measuring.',
    ],
    sections: [
      {
        heading: 'How many mL are in a cup?',
        body: 'A cup is not one worldwide volume. This converter keeps five common standards separate: a Korean cooking cup is 200 mL; a US customary cup is exactly 236.5882365 mL; a US legal cup used on nutrition labels is 240 mL; a metric cup is 250 mL; and a historical imperial cup is 284.130625 mL. For example, 2 US customary cups are 473.176473 mL, while 2 metric cups are exactly 500 mL. Use the standard used by the recipe author, particularly for baking.',
      },
      {
        heading: 'US cups, fluid ounces, tablespoons and teaspoons',
        body: 'A US customary cup equals 8 US fluid ounces, 16 US tablespoons, and 48 US teaspoons. This tool derives those values from the US cup factor, keeping full precision internally: 1 US tablespoon is 14.78676478125 mL and 1 US teaspoon is 4.92892159375 mL. NIST’s Metric Kitchen guide gives practical home-cooking equivalents of 240 mL for 1 cup, 15 mL for 1 tablespoon, and 5 mL for 1 teaspoon; those are useful rounded measures, not the same as the exact US customary definitions shown here.',
      },
      {
        heading: 'Volume is not ingredient weight',
        body: 'Millilitres, cups and spoons measure volume. They cannot be converted to grams without knowing the ingredient and how it was measured: 1 cup of water and 1 cup of flour take up the same volume but do not have the same mass. For precise baking, follow the recipe’s gram weight when it provides one. For a liquid measure, place a transparent cup on a level surface and read the bottom of the meniscus at eye level.',
      },
    ],
    faq: [
      {
        q: 'How many mL is 1 US cup?',
        a: 'One US customary cup is exactly 236.5882365 mL, commonly rounded to 237 mL. A US legal cup on a nutrition label is a different convention of 240 mL, so select the one that matches the recipe or label.',
      },
      {
        q: 'How many mL is a metric cup?',
        a: 'One metric cup is exactly 250 mL. It is 13.4117635 mL larger than a US customary cup, a difference of about 5.67% for each cup in the recipe.',
      },
      {
        q: 'How many mL is 1 Korean cup?',
        a: 'A Korean cooking measuring cup is 200 mL. It is different from a common disposable paper cup, whose capacity varies by product and is often described as about 180 mL.',
      },
      {
        q: 'How many US tablespoons are in a cup?',
        a: 'One US customary cup contains exactly 16 US tablespoons, and each US tablespoon contains 3 US teaspoons. The exact US tablespoon is 14.78676478125 mL.',
      },
      {
        q: 'Does this volume converter save my values?',
        a: 'The latest value and unit choices are stored only in this browser to make a refresh convenient. They are not sent to a server, and clearing the site data removes them.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '컵 mL 변환·부피 변환기 — 한국·미국·미터법 구분',
    description:
      '컵, mL, L, 큰술, 작은술, 미국 액량온스를 입력 즉시 변환합니다. 한국 200mL·미국·미터법·영국식 컵을 구분해 요리 계량 실수를 줄입니다.',
    h1: '부피 변환',
    tagline: '컵·mL·L·큰술·작은술·액량온스를 실시간 변환하고, 레시피의 컵 기준을 분명하게 구분합니다.',
    name: '부피 변환',
    keywords: [
      '컵 ml 변환',
      '1컵 몇 ml',
      '미국 컵 ml',
      '한국 계량컵 ml',
      'ml 컵 변환',
      '큰술 ml',
      '작은술 ml',
      '요리 계량 변환',
    ],
    howTo: [
      '변환할 양을 입력하고 변환 전 단위를 선택하세요.',
      '변환 후 단위를 고르면 결과가 바로 바뀝니다.',
      '레시피에 컵이라고만 쓰였다면 작성 국가와 계량 기준을 확인해 알맞은 컵을 고르세요.',
      '다른 요리 계량 결과와 빠른 참조표를 함께 확인한 뒤 계량하세요.',
    ],
    sections: [
      {
        heading: '1컵은 몇 mL인가요?',
        body: '컵은 전 세계에서 같은 부피가 아닙니다. 이 도구는 다섯 기준을 따로 표시합니다. 한국 요리 계량컵은 200mL, 미국 일반 컵(US customary cup)은 정확히 236.5882365mL, 미국 영양성분표 컵(US legal cup)은 240mL, 미터법 컵은 250mL, 과거 영국식 컵은 284.130625mL입니다. 예를 들어 미국 일반 컵 2컵은 473.176473mL이지만 미터법 컵 2컵은 정확히 500mL입니다. 특히 베이킹은 레시피 작성자가 쓴 기준을 유지하세요.',
      },
      {
        heading: '미국 컵·액량온스·큰술·작은술의 관계',
        body: '미국 일반 컵 1컵은 미국 액량온스 8fl oz, 미국 큰술 16tbsp, 미국 작은술 48tsp입니다. 이 도구는 미국 컵 기준값에서 계산하므로 미국 큰술은 14.78676478125mL, 미국 작은술은 4.92892159375mL를 사용합니다. NIST Metric Kitchen은 가정 요리를 위한 편의값으로 1컵 240mL, 1큰술 15mL, 1작은술 5mL를 제시합니다. 편의 반올림값과 미국 일반 단위의 정확한 정의는 같지 않습니다.',
      },
      {
        heading: '부피와 무게는 바꿔 쓸 수 없습니다',
        body: 'mL, 컵, 큰술은 부피 단위입니다. 재료와 담는 방식이 다르면 같은 부피라도 무게가 달라서 재료 정보 없이 g으로 변환할 수 없습니다. 물 1컵과 밀가루 1컵은 같은 부피지만 같은 무게가 아닙니다. 정밀한 베이킹은 레시피에 그램이 있다면 그램을 따르세요. 액체는 투명한 계량컵을 평평한 곳에 놓고 눈높이에서 액면의 가장 낮은 부분을 읽어야 합니다.',
      },
    ],
    faq: [
      {
        q: '미국 1컵은 몇 mL인가요?',
        a: '미국 일반 컵 1컵은 정확히 236.5882365mL이며 보통 237mL로 반올림합니다. 영양성분표의 미국 법정 컵은 별도 기준인 240mL이므로 레시피나 표시의 용도를 확인해야 합니다.',
      },
      {
        q: '미터법 1컵은 몇 mL인가요?',
        a: '미터법 컵 1컵은 정확히 250mL입니다. 미국 일반 컵보다 13.4117635mL, 즉 컵마다 약 5.67% 더 큽니다.',
      },
      {
        q: '한국 계량컵 1컵은 몇 mL인가요?',
        a: '한국 요리 계량컵 1컵은 200mL입니다. 제품마다 용량이 다른 일회용 종이컵과는 다른 기준이며 종이컵은 흔히 약 180mL로 설명됩니다.',
      },
      {
        q: '미국 컵 1컵은 큰술 몇 숟가락인가요?',
        a: '미국 일반 컵 1컵은 정확히 미국 큰술 16큰술이고, 미국 큰술 1큰술은 미국 작은술 3작은술입니다. 미국 큰술의 정확한 부피는 14.78676478125mL입니다.',
      },
      {
        q: '입력한 값이 저장되나요?',
        a: '마지막으로 입력한 값과 단위는 새로고침 후에도 사용할 수 있도록 이 브라우저에만 저장합니다. 서버로 전송하지 않으며 브라우저에서 사이트 데이터를 지우면 함께 삭제됩니다.',
      },
    ],
    ui: {
      valueLabel: '부피',
      fromLabel: '변환 전',
      toLabel: '변환 후',
      swap: '단위 바꾸기',
      resultLabel: '{unit} 결과',
      otherUnitsTitle: '다른 요리 계량 단위로 보기',
      quickTableTitle: '빠른 참조표',
      factorHint: '레시피에 적힌 컵 기준을 선택하세요. 값을 입력하면 결과가 바로 바뀝니다.',
      autosaved: '이 브라우저에 저장됨',
      copy: '모든 결과 복사',
      copied: '복사됨',
      unitMilliliter: '밀리리터 (mL)',
      unitLiter: '리터 (L)',
      unitKoreanCup: '한국 계량컵 (200mL)',
      unitUsCup: '미국 일반 컵 (236.588mL)',
      unitUsLegalCup: '미국 영양표시 컵 (240mL)',
      unitMetricCup: '미터법 컵 (250mL)',
      unitImperialCup: '영국식 컵 (284.131mL)',
      unitUsFluidOunce: '미국 액량온스 (fl oz)',
      unitUsTablespoon: '미국 큰술 (tbsp)',
      unitUsTeaspoon: '미국 작은술 (tsp)',
    },
  },
};
