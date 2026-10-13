import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  intro: 'See the price after every coupon — calculations stay in this browser.',
  autosaved: 'Saved in this browser',
  modeLabel: 'What do you want to find?',
  modeApply: 'Final price',
  modeRate: 'Discount rate',
  modeOriginal: 'Original price',
  originalLabel: 'Original price',
  originalHint: 'Commas, currency symbols, and full-width digits are accepted.',
  finalLabel: 'Final price paid',
  finalHint: 'Enter the price after all percentage discounts.',
  pricePlaceholder: '100.00',
  firstDiscountLabel: 'First discount (%)',
  secondDiscountLabel: 'Coupon discount (%)',
  thirdDiscountLabel: 'Card or member discount (%)',
  firstDiscountHint: 'Required. Enter a rate from 0 to 100.',
  laterDiscountHint: 'Optional. Each rate is applied to the previous price.',
  ratePlaceholder: '20',
  resultHeading: 'Result',
  finalPriceLabel: 'Final price',
  savedLabel: 'You save',
  effectiveRateLabel: 'Effective discount',
  discountRateLabel: 'Discount rate',
  originalPriceLabel: 'Original price',
  afterDiscount: 'After {rate}% discount',
  formulaApply: '{original} × {remaining} = {final}',
  formulaRate: '({original} − {final}) ÷ {original} × 100 = {rate}%',
  formulaOriginal: '{final} ÷ {remaining} = {original}',
  invalidPrice:
    'Enter valid non-negative prices. Use digits, a decimal point, and optional commas or currency symbols.',
  invalidRate: 'Enter a first discount and keep every discount rate between 0% and 100%.',
  rateImpossible: 'The final price cannot be higher than the original price when finding a discount.',
  originalImpossible: 'An original price cannot be recovered through a 100% discount.',
  copy: 'Copy summary',
  copied: 'Copied',
  copyApply: 'Original price: {original}\nFinal price: {final}\nYou save: {saved}\nEffective discount: {rate}%',
  copyRate: 'Original price: {original}\nFinal price: {final}\nDiscount rate: {rate}%',
  copyOriginal: 'Final price: {final}\nOriginal price: {original}\nEffective discount: {rate}%',
  privacyNotice: 'Your prices are calculated locally and are not sent to a server.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Discount Calculator — Stacked & Reverse Price',
    description:
      'Calculate a sale price, true stacked discount, or original price from a final price. See each coupon stage update live in your browser, with no account needed.',
    h1: 'Discount Calculator',
    tagline:
      'Work out a final price, actual percent off, or original price — including up to three successive discounts shown step by step.',
    name: 'Discount Calculator',
    keywords: [
      'discount calculator',
      'percent off calculator',
      'sale price calculator',
      'stacked discount calculator',
      'original price calculator',
      'coupon calculator',
    ],
    howTo: [
      'Choose whether to find the final price, discount rate, or original price.',
      'Enter the known price or prices; pasted commas, currency symbols, and full-width digits are accepted.',
      'For a stacked offer, enter the promotion, coupon, and card discounts in the order they apply.',
      'Read the price after every stage, total savings, and effective discount rate as the inputs change.',
      'Copy the result summary when you need to compare or share an offer.',
    ],
    sections: [
      {
        heading: 'Successive discounts multiply instead of add',
        body: 'A second percentage discount is normally taken from the already reduced price, not the original price. The price after successive rates d₁, d₂, and d₃ is original price × (1 − d₁ ÷ 100) × (1 − d₂ ÷ 100) × (1 − d₃ ÷ 100). For example, 20% off followed by 10% off leaves 100 × 0.80 × 0.90 = 72, so the effective discount is 28%, not 30%. The stage-by-stage results make the order and base for each coupon visible.',
      },
      {
        heading: 'How to reverse a sale price to its original price',
        body: 'To find the original price, divide the final price by the fraction left after every discount. A $72 final price after 20% and then 10% off has an original price of 72 ÷ (0.80 × 0.90) = $100. An offer that includes a 100% discount cannot be reversed: every original price becomes zero after that rate, so the original price is not uniquely knowable. This calculator accepts up to three percentage stages for that reverse calculation.',
      },
      {
        heading: 'Compare checkout totals on the same basis',
        body: 'A percentage headline alone does not establish the better deal. Compare the final price for the same item, quantity, tax treatment, shipping, and eligibility rules. This calculator models percentage reductions only; it does not add sales tax, shipping, store credit, fixed-amount coupons, or retailer-specific rounding. Check whether a coupon applies to an already reduced price and whether its terms exclude sale items before relying on the result at checkout.',
      },
    ],
    faq: [
      {
        q: 'How do I calculate a discount price?',
        a: 'Multiply the original price by one minus the discount rate divided by 100. For example, 25% off $80 gives $80 × (1 − 25 ÷ 100) = $60, so the saving is $20.',
      },
      {
        q: 'Is 20% off plus another 10% off the same as 30% off?',
        a: 'No. A 20% discount followed by 10% off applies the second rate to 80% of the original price: 100 × 0.80 × 0.90 = 72. The combined saving is therefore 28%, not 30%.',
      },
      {
        q: 'How do I find the discount percentage from two prices?',
        a: 'Subtract the final price from the original price, divide by the original price, and multiply by 100. A drop from $80 to $60 is (80 − 60) ÷ 80 × 100 = 25% off.',
      },
      {
        q: 'How do I find the original price before a discount?',
        a: 'Divide the final price by the fraction remaining after the discount. A $72 price after 20% and then 10% off is $72 ÷ (0.80 × 0.90) = $100 before the discounts.',
      },
      {
        q: 'Can a 100% discount be reversed to an original price?',
        a: 'No. A 100% discount turns every non-negative original price into $0, so a $0 final price does not contain enough information to identify one original price.',
      },
      {
        q: 'Does this discount calculator send my prices to a server?',
        a: 'No. The calculator runs in the browser and saves its inputs only in that browser’s local storage, so the prices and rates are not sent to a server.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '할인율 계산기 — 중복 할인·정가 역산',
    description:
      '할인가, 실제 할인율, 정가를 바로 계산합니다. 쿠폰·카드 중복 할인은 단계별 금액과 실질 할인율까지 브라우저에서 즉시 확인하세요.',
    h1: '할인율 계산기',
    tagline: '할인가·할인율·정가를 계산하고, 쿠폰과 카드의 중복 할인도 각 단계 금액까지 바로 확인합니다.',
    name: '할인율 계산기',
    keywords: ['할인율 계산기', '할인 계산기', '할인가 계산', '정가 역산', '중복 할인 계산', '쿠폰 할인 계산'],
    howTo: [
      '할인가, 할인율, 정가 중 무엇을 구할지 선택하세요.',
      '알고 있는 가격을 입력하세요. 쉼표, 통화 기호, 전각 숫자, “5만 원” 형식을 인식합니다.',
      '중복 할인이라면 행사, 쿠폰, 카드 할인을 실제 적용 순서대로 입력하세요.',
      '입력과 동시에 각 할인 단계 뒤 금액, 총 절약액, 실질 할인율을 확인하세요.',
      '계산 요약을 복사해 다른 상품이나 판매처와 비교하세요.',
    ],
    sections: [
      {
        heading: '중복 할인율은 더하지 않고 차례로 곱합니다',
        body: '두 번째 할인율은 보통 정가가 아니라 첫 번째 할인이 적용된 금액에 붙습니다. 할인율 d₁, d₂, d₃을 순서대로 적용한 가격은 정가 × (1 − d₁ ÷ 100) × (1 − d₂ ÷ 100) × (1 − d₃ ÷ 100)입니다. 예를 들어 20% 할인 뒤 추가 10% 할인은 100 × 0.80 × 0.90 = 72가 되어 실질 할인율이 28%입니다. 30%가 아닙니다. 이 계산기는 각 쿠폰 뒤의 금액을 보여 주므로 어느 기준에서 할인됐는지 확인할 수 있습니다.',
      },
      {
        heading: '할인가와 할인율로 정가를 역산하는 법',
        body: '정가를 구할 때는 할인가를 모든 할인 뒤에 남는 비율로 나눕니다. 20% 할인 뒤 10% 할인을 적용한 할인가가 72,000원이면 정가는 72,000 ÷ (0.80 × 0.90) = 100,000원입니다. 단, 100% 할인은 역산할 수 없습니다. 어떤 정가에 100%를 할인해도 결과가 0원이므로 한 가지 정가를 정할 정보가 남지 않습니다. 이 도구는 최대 세 단계의 퍼센트 할인을 역산합니다.',
      },
      {
        heading: '할인 문구보다 같은 조건의 최종 결제액을 비교하세요',
        body: '할인율 숫자만으로 더 좋은 조건을 판단할 수는 없습니다. 같은 상품·수량을 기준으로 세금 포함 여부, 배송비, 사용 조건까지 맞춰 최종 가격을 비교해야 합니다. 이 계산기는 퍼센트 할인만 계산하며 배송비, 부가세, 적립금, 정액 쿠폰, 판매처별 반올림 방식은 더하지 않습니다. 쿠폰이 할인가에도 적용되는지, 세일 상품이 제외되는지는 결제 전에 판매처 조건을 확인하세요.',
      },
    ],
    faq: [
      {
        q: '할인가는 어떻게 계산하나요?',
        a: '정가에 1에서 할인율을 100으로 나눈 값을 뺀 수를 곱하면 됩니다. 정가 80,000원을 25% 할인하면 80,000 × (1 − 25 ÷ 100) = 60,000원이고, 절약액은 20,000원입니다.',
      },
      {
        q: '20% 할인 후 추가 10% 할인은 30% 할인인가요?',
        a: '아닙니다. 20% 할인 뒤 10% 할인은 100 × 0.80 × 0.90 = 72가 되므로 실제 할인율은 28%입니다. 두 번째 할인은 정가가 아닌 20% 할인 뒤 금액에 적용됩니다.',
      },
      {
        q: '정가와 할인가로 할인율을 어떻게 구하나요?',
        a: '정가에서 할인가를 뺀 뒤 정가로 나누고 100을 곱합니다. 정가 80,000원에서 60,000원이 되었다면 (80,000 − 60,000) ÷ 80,000 × 100 = 25% 할인입니다.',
      },
      {
        q: '할인가와 할인율로 정가를 역산할 수 있나요?',
        a: '할인가를 할인 뒤 남는 비율로 나누면 됩니다. 20%와 10%를 순서대로 할인해 72,000원이 됐다면 72,000 ÷ (0.80 × 0.90) = 100,000원이 원래 정가입니다.',
      },
      {
        q: '100% 할인된 가격으로 정가를 구할 수 있나요?',
        a: '아니요. 100% 할인 뒤에는 모든 정가가 0원이 되므로, 0원이라는 결과만으로 하나의 정가를 정할 수 없습니다.',
      },
      {
        q: '입력한 가격이 서버로 전송되나요?',
        a: '아니요. 계산은 브라우저 안에서 수행되고 입력값은 현재 브라우저의 로컬 저장소에만 저장됩니다. 가격과 할인율은 서버로 전송되지 않습니다.',
      },
    ],
    ui: {
      intro: '쿠폰마다 남는 금액을 확인합니다 — 계산은 브라우저에서만 수행됩니다.',
      autosaved: '이 브라우저에 저장됨',
      modeLabel: '무엇을 계산할까요?',
      modeApply: '할인가',
      modeRate: '할인율',
      modeOriginal: '정가 역산',
      originalLabel: '정가',
      originalHint: '쉼표, 통화 기호, 전각 숫자를 입력할 수 있습니다.',
      finalLabel: '최종 할인가',
      finalHint: '모든 퍼센트 할인이 적용된 뒤 가격을 입력하세요.',
      pricePlaceholder: '100000',
      firstDiscountLabel: '첫 할인율(%)',
      secondDiscountLabel: '쿠폰 할인율(%)',
      thirdDiscountLabel: '카드·회원 할인율(%)',
      firstDiscountHint: '필수 항목입니다. 0~100 사이의 비율을 입력하세요.',
      laterDiscountHint: '선택 항목입니다. 이전 할인 뒤 금액에 적용됩니다.',
      ratePlaceholder: '20',
      resultHeading: '계산 결과',
      finalPriceLabel: '최종 할인가',
      savedLabel: '총 절약액',
      effectiveRateLabel: '실질 할인율',
      discountRateLabel: '할인율',
      originalPriceLabel: '정가',
      afterDiscount: '{rate}% 할인 적용 후',
      formulaApply: '{original} × {remaining} = {final}',
      formulaRate: '({original} − {final}) ÷ {original} × 100 = {rate}%',
      formulaOriginal: '{final} ÷ {remaining} = {original}',
      invalidPrice: '0 이상의 올바른 가격을 입력하세요. 숫자, 소수점, 쉼표 또는 통화 기호를 사용할 수 있습니다.',
      invalidRate: '첫 할인율을 입력하고 모든 할인율을 0~100% 사이로 입력하세요.',
      rateImpossible: '할인율을 구할 때 최종 할인가는 정가보다 클 수 없습니다.',
      originalImpossible: '100% 할인 후 가격만으로는 정가를 역산할 수 없습니다.',
      copy: '요약 복사',
      copied: '복사됨',
      copyApply: '정가: {original}\n최종 할인가: {final}\n총 절약액: {saved}\n실질 할인율: {rate}%',
      copyRate: '정가: {original}\n최종 할인가: {final}\n할인율: {rate}%',
      copyOriginal: '최종 할인가: {final}\n정가: {original}\n실질 할인율: {rate}%',
      privacyNotice: '입력한 가격은 브라우저에서만 계산되며 서버로 전송되지 않습니다.',
    },
  },
};
