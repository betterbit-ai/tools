import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'discount-calculator',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-13',
  updated: '2026-10-13',
  edges: ['usability'],
  competitors: [
    {
      name: 'Calculator.net — Discount Calculator',
      url: 'https://www.calculator.net/discount-calculator.html',
      weakness:
        'Its form requires the visitor to fill any two values and use a separate calculate control, while its own page sends stackable discounts to a different Percent Off Calculator. Betterbit updates live and keeps up to three successive discounts, the intermediate prices, and original-price reverse calculation in one view. (Strength: it supports both percentage and fixed-amount discounts.)',
    },
    {
      name: 'Gizmoop — Discount Calculator',
      url: 'https://gizmoop.com/discount-calculator',
      weakness:
        'Its two modes calculate a sale price or a rate from two prices, and its stack input offers only one optional second discount. Betterbit shows each of up to three discount stages and can also work backward from a final price through the selected discount sequence. (Strength: it includes a helpful explanation of BOGO offers and tax conventions.)',
    },
    {
      name: 'Real Discount Calculator',
      url: 'https://realdiscountcalculator.com/',
      weakness:
        'Its landing calculator exposes a percent-off or fixed-amount toggle, an add-discount control, currency, tax, and rounding before the result, so a quick stacked-price check has more settings to scan. Betterbit puts the three core solve modes first and always shows the exact price after every discount stage. (Strength: it offers 15 currencies, tax, and rounding choices.)',
    },
    {
      name: '마켓랩 — 할인율 / 마진 계산기',
      url: 'https://www.marketlab.co.kr/discountcalculator/',
      weakness:
        'Its discount form only takes list price and sale price, then requires a separate “계산하기” click; it has no consecutive-discount or original-price reverse control. Betterbit recalculates every keystroke and handles a promotion, coupon, and card discount in sequence. (장점: 원가와 판매가로 마진율도 함께 계산한다.)',
    },
    {
      name: 'WooaCalc — 할인가 계산기',
      url: 'https://calckit.wooahouse.com/discount.html',
      weakness:
        'Its visible modes calculate a sale price from list price and rate, or derive the rate from two prices; the page presents one optional extra rate but no original-price reverse mode. Betterbit works backward through up to three successive percentage discounts and lists the price after each stage. (장점: 정액 추가 할인을 별도 입력으로 지원한다.)',
    },
    {
      name: '고고템 — 할인율 계산기',
      url: 'https://www.gogotem.com/ko/calculator/discount-calculator',
      weakness:
        'Its visible calculator combines one percentage rate, one fixed additional discount, and quantity in a single scenario; it does not offer a mode to infer the original price from a final price and a sequence of percentage discounts. Betterbit keeps the percentage-stack math legible by displaying every stage and a dedicated reverse mode. (장점: 수량까지 반영한 총 결제 금액을 보여 준다.)',
    },
  ],
  related: ['percentage-calculator', 'vat-calculator', 'tip-calculator', 'gpa-calculator', 'fraction-calculator'],
};
