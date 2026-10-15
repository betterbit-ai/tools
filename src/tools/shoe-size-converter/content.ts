import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  systemLabel: 'Size system you know',
  systemHint: 'Choose the label printed on your shoe or its size chart.',
  sizeLabel: 'Size',
  sizeHint: 'Adult reference range: {min}–{max}',
  systemKr: 'Korea (mm)',
  systemJp: 'Japan (cm)',
  systemUsMen: 'US men',
  systemUsWomen: 'US women',
  systemUk: 'UK',
  systemEu: 'EU',
  resultsTitle: 'Closest reference sizes',
  resultPlaceholder: 'Enter a size in the supported adult range to see the reference row.',
  outOfRange:
    'That value is outside this adult reference chart. Check the range below the field or use the brand’s chart.',
  copy: 'Copy sizes',
  copied: 'Copied',
  brandLabel: 'Brand check',
  brandHint: 'Use the brand’s own chart as the final purchase reference.',
  brandNone: 'No brand selected',
  brandNike: 'Nike',
  brandAdidas: 'adidas',
  brandNewBalance: 'New Balance',
  nikeNotice:
    'Nike notes that the CM size printed on a shoe box or label is different from measured foot length. Compare this baseline with the product’s own chart.',
  adidasNotice:
    'adidas charts include EU third sizes and a heel-to-toe centimetre measurement. Match the product chart rather than assuming every EU label is interchangeable.',
  newBalanceNotice:
    'New Balance publishes width guidance as well as length. Check the width choice with the brand chart, not only the length conversion.',
  baselineNotice:
    'These are general adult reference sizes. Measure both feet and use the longer measurement; the brand, model, width, socks, and intended fit can change the final choice.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Shoe Size Converter — US, UK, EU, KR & Japan Chart',
    description:
      'Convert adult shoe sizes across Korea mm, Japan cm, US men’s and women’s, UK, and EU instantly. Compare a brand-specific sizing reminder in one reference chart.',
    h1: 'Shoe Size Converter',
    tagline:
      'Enter one adult size to compare Korea, Japan, US, UK and EU labels at once — then check the brand’s own fit chart.',
    name: 'Shoe Size Converter',
    keywords: [
      'shoe size conversion',
      'shoe size chart',
      'US to EU shoe size',
      'Korean shoe size mm',
      'Japan shoe size cm',
      'US women to men shoe size',
    ],
    howTo: [
      'Choose the country or size system printed on the shoe you know.',
      'Enter the size to show its closest row in the adult reference chart.',
      'Compare the Korea mm and Japan cm values with your measured longer foot.',
      'Choose a brand reminder, then check that product’s official size chart before ordering.',
      'Copy the complete set of size labels if you need to save or share it.',
    ],
    sections: [
      {
        heading: 'Use measured foot length as the anchor',
        body: 'Korean shoe labels commonly use millimetres and Japanese labels use centimetres, so they are useful starting points because they refer to a physical length: 260 mm equals 26.0 cm. Measure while standing on paper with your heel against a wall, mark the longest toe, and measure both feet. Use the longer measurement. The result is a general adult reference row, not a promise that every shoe will fit: a last, toe-box shape, width, socks, orthotics, and intended activity can all change the best choice. When a brand chart conflicts with a regional label, use the product’s official chart and its measurement instructions.',
      },
      {
        heading: 'Why brand charts can differ from a general conversion',
        body: 'US men’s and women’s labels are separate scales, while EU and UK labels have their own step sizes; converting by simply adding or subtracting a number can therefore hide a rounding difference. Official brand charts also use their own conventions. Nike says the CM figure on a box or label is not the same as measured foot length. adidas publishes heel-to-toe centimetres and EU labels in one-third increments. New Balance publishes width guidance in addition to length. This tool shows a transparent baseline across six common adult labels and puts those brand checks next to the result, so the conversion is useful for comparison without presenting a generic chart as a guaranteed fit.',
      },
    ],
    faq: [
      {
        q: 'What is Korean shoe size 260 in US and EU sizes?',
        a: 'In this general adult reference chart, Korean 260 mm maps to Japan 26.0 cm, US men’s 8, US women’s 9.5, UK 7.5, and EU 40.5. A brand or model can use a different last, so confirm against its product chart before buying.',
      },
      {
        q: 'Is Japanese shoe size the same as centimetres?',
        a: 'Japanese shoe labels commonly express a centimetre length, so 26.0 cm corresponds to 260 mm. A shoe-box CM label may use a maker’s internal convention, however, so compare a measured foot with that brand’s published chart rather than relying on the number alone.',
      },
      {
        q: 'Why are US men’s and women’s shoe sizes different?',
        a: 'US men’s and women’s footwear use different numerical labels for a similar length. In this reference chart, US men’s 8 and US women’s 9.5 both align with the 260 mm row; the exact offset can vary by brand and product category.',
      },
      {
        q: 'How should I measure my feet for shoes?',
        a: 'Stand with your heel against a wall on a sheet of paper, mark the tip of the longest toe, and measure from the wall to the mark in millimetres. Measure both feet while standing and use the longer result; then compare it with the product’s official chart.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '신발 사이즈 표 — 한국·미국·유럽·영국·일본 변환',
    description:
      '한국 mm, 일본 cm, 미국 남녀, 유럽 EU, 영국 UK 신발 사이즈를 입력 즉시 비교합니다. 브랜드별 공식 사이즈표를 확인할 때의 기준과 함께 보여줍니다.',
    h1: '신발 사이즈 변환',
    tagline:
      '한 가지 성인 신발 사이즈를 입력하면 한국·일본·미국·유럽·영국 표기를 한눈에 비교하고, 브랜드별 확인 사항도 함께 안내합니다.',
    name: '신발 사이즈',
    keywords: [
      '신발 사이즈 표',
      '신발 사이즈 변환',
      '미국 신발 사이즈',
      '유럽 신발 사이즈',
      '신발 사이즈 260',
      '해외 신발 사이즈',
    ],
    howTo: [
      '알고 있는 신발 안쪽 표기나 사이즈표의 국가·체계를 선택합니다.',
      '사이즈를 입력해 성인 기준 환산표의 가장 가까운 행을 확인합니다.',
      '한국 mm와 일본 cm를 직접 잰 긴 발의 길이와 비교합니다.',
      '브랜드 확인 항목을 고른 뒤 구매할 상품의 공식 사이즈표를 확인합니다.',
      '필요하면 모든 표기 결과를 복사해 저장하거나 공유합니다.',
    ],
    sections: [
      {
        heading: 'mm 실측값을 기준으로 비교하세요',
        body: '한국 신발 표기는 보통 발 길이를 mm로 적고, 일본 표기는 cm를 사용합니다. 따라서 260mm는 26.0cm처럼 실제 길이로 비교할 수 있어 해외 직구의 출발점으로 유용합니다. 종이를 벽에 붙이고 뒤꿈치를 벽에 댄 채 선 다음 가장 긴 발가락 끝을 표시해 재세요. 양발을 모두 재서 더 긴 쪽을 기준으로 합니다. 이 도구의 결과는 성인용 일반 환산 기준이며, 발볼·양말·깔창·구두골 모양·운동 목적에 따라 실제 선택은 달라질 수 있습니다. 상품 페이지의 공식 실측표가 일반 표기와 다르면 공식 표기를 우선하세요.',
      },
      {
        heading: '브랜드별 사이즈표를 마지막 기준으로 삼아야 하는 이유',
        body: '미국 남성·여성 사이즈는 같은 숫자라도 서로 다른 체계이고, EU와 UK도 한 단계의 간격이 다릅니다. 그래서 숫자만 더하거나 빼면 반 사이즈 차이를 놓칠 수 있습니다. 제조사도 각자 표기 기준을 둡니다. Nike는 박스나 라벨의 CM 표기가 실측 발 길이와 다를 수 있다고 안내합니다. adidas는 뒤꿈치부터 발가락까지의 cm와 3분의 1 단위 EU 표기를 함께 제공합니다. New Balance는 길이뿐 아니라 발볼 너비 안내도 제공합니다. 이 도구로 여섯 가지 성인 표기를 빠르게 대조한 뒤, 구매하려는 모델의 공식 사이즈표와 발볼 정보를 확인하세요.',
      },
    ],
    faq: [
      {
        q: '한국 신발 260은 미국과 유럽 사이즈로 몇인가요?',
        a: '이 성인 기준표에서 한국 260mm는 일본 26.0cm, 미국 남성 8, 미국 여성 9.5, 영국 7.5, 유럽 EU 40.5에 해당합니다. 브랜드와 모델의 구두골이 다를 수 있으므로 구매 전 공식 상품 사이즈표를 확인해야 합니다.',
      },
      {
        q: '일본 신발 사이즈 cm는 한국 mm와 같은 뜻인가요?',
        a: '일본 신발 표기는 보통 cm 길이를 쓰므로 26.0cm는 260mm와 같은 길이입니다. 다만 신발 박스의 CM 표기는 제조사 기준일 수 있으므로, 발 실측값과 해당 브랜드의 공식 사이즈표를 함께 비교하는 것이 안전합니다.',
      },
      {
        q: '미국 남성·여성 신발 사이즈는 왜 다른가요?',
        a: '미국 남성과 여성 신발은 비슷한 발 길이에도 서로 다른 숫자 체계를 사용합니다. 이 기준표에서는 미국 남성 8과 여성 9.5가 모두 260mm 행에 해당하지만, 정확한 차이는 브랜드와 신발 종류에 따라 달라질 수 있습니다.',
      },
      {
        q: '신발 사이즈는 어떻게 재야 하나요?',
        a: '종이를 벽에 붙이고 뒤꿈치를 벽에 댄 채 서서 가장 긴 발가락 끝을 표시한 뒤, 벽부터 표시까지를 mm로 잽니다. 양발을 모두 재서 긴 발을 기준으로 하고, 최종 선택 전에는 상품의 공식 실측표를 확인합니다.',
      },
    ],
    ui: {
      systemLabel: '알고 있는 사이즈 체계',
      systemHint: '신발 안쪽이나 사이즈표에 적힌 표기를 선택합니다.',
      sizeLabel: '사이즈',
      sizeHint: '성인 기준 범위: {min}–{max}',
      systemKr: '한국 (mm)',
      systemJp: '일본 (cm)',
      systemUsMen: '미국 남성',
      systemUsWomen: '미국 여성',
      systemUk: '영국 (UK)',
      systemEu: '유럽 (EU)',
      resultsTitle: '가까운 기준 사이즈',
      resultPlaceholder: '지원하는 성인 범위의 사이즈를 입력하면 기준 행을 보여줍니다.',
      outOfRange: '입력값이 이 성인 기준표 범위를 벗어났습니다. 필드 아래 범위나 브랜드 공식 사이즈표를 확인하세요.',
      copy: '사이즈 복사',
      copied: '복사됨',
      brandLabel: '브랜드 확인',
      brandHint: '구매 전에는 브랜드의 공식 사이즈표를 최종 기준으로 사용합니다.',
      brandNone: '브랜드 선택 안 함',
      brandNike: 'Nike',
      brandAdidas: 'adidas',
      brandNewBalance: 'New Balance',
      nikeNotice:
        'Nike는 신발 상자나 라벨의 CM 표기가 발 실측 길이와 다를 수 있다고 안내합니다. 이 결과를 해당 상품의 공식 표와 비교하세요.',
      adidasNotice:
        'adidas는 3분의 1 단위 EU 표기와 뒤꿈치부터 발가락까지의 cm를 함께 안내합니다. 일반 EU 숫자만 보지 말고 상품 표를 비교하세요.',
      newBalanceNotice:
        'New Balance는 길이뿐 아니라 발볼 너비 안내도 제공합니다. 길이 환산 결과만 보지 말고 공식 표에서 너비도 확인하세요.',
      baselineNotice:
        '이 결과는 일반 성인 기준입니다. 양발을 재서 긴 발을 사용하고, 브랜드·모델·발볼·양말·원하는 착화감에 따라 최종 선택이 달라질 수 있습니다.',
    },
  },
};
