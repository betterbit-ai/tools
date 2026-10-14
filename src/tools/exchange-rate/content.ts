import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  intro: 'Enter the quote you were offered — no live-rate request, account, or tracking.',
  autosaved: 'Saved in this browser',
  sourceLabel: 'Source currency label',
  targetLabel: 'Target currency label',
  sourcePlaceholder: 'USD',
  targetPlaceholder: 'KRW',
  swap: 'Reverse currencies and rate',
  amountLabel: 'Amount to exchange',
  amountHint: 'Commas, currency symbols, full-width digits, and “5만 원” are accepted.',
  rateLabel: 'Quoted rate',
  rateHint: 'How many {target} for 1 {source}. Enter the rate from your provider.',
  adjustmentLabel: 'Rate adjustment (%)',
  adjustmentHint: 'Positive is a fee/markup; negative is a discount. Use −100 to 100.',
  fixedFeeLabel: 'Fixed fee ({target})',
  fixedFeeHint: 'A separate fee deducted in the target currency.',
  resultHeading: 'Quote breakdown',
  receiveLabel: 'You receive',
  effectiveRateLabel: 'Effective rate',
  grossLabel: 'Before fees',
  chargesLabel: 'Fees and adjustment',
  noEffectiveRate: '—',
  formula: '{amount} {source} × {rate} = {gross} {target}; after {charges} {target}: {received} {target}',
  invalid: 'Enter a non-negative amount and fixed fee, a rate above 0, and an adjustment from −100% to 100%.',
  copy: 'Copy summary',
  copied: 'Copied',
  copySummary:
    'Quote: {amount} {source} × {rate} {target}/{source}\nBefore fees: {gross} {target}\nFees and adjustment: {charges} {target}\nYou receive: {received} {target}\nEffective rate: {effective} {target}/{source}',
  privacyNotice:
    'Your quote is calculated locally and saved only in this browser. This tool does not fetch a market rate; confirm the final amount with your provider.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Currency Converter — Quote, Fees & Effective Rate',
    description:
      'Calculate a currency conversion from your bank, card, or exchange-counter quote. Add a percentage adjustment and fixed fee to see the effective rate instantly, privately.',
    h1: 'Currency Converter',
    tagline:
      'Turn the rate you were actually quoted into a clear received amount, total charges, and effective rate — right in your browser.',
    name: 'Currency Converter',
    keywords: [
      'currency converter',
      'exchange rate calculator',
      'foreign exchange calculator',
      'effective exchange rate',
      'currency conversion fee calculator',
      'bank exchange rate calculator',
    ],
    howTo: [
      'Enter short labels for the source and target currencies, such as USD and KRW.',
      'Type the amount and the provider’s quoted target-currency amount for 1 source-currency unit.',
      'Add any percentage fee or discount and a separately stated fixed target-currency fee.',
      'Read the received amount, total charges, and effective rate as every input updates.',
      'Copy the breakdown to compare quotes from another provider.',
    ],
    sections: [
      {
        heading: 'Use the rate you were actually offered',
        body: 'A quoted exchange rate is the number of target-currency units received for one source-currency unit. If the quote is 1 USD = 1,350 KRW, converting 100 USD before charges gives 100 × 1,350 = 135,000 KRW. This tool deliberately does not load a “live” rate: enter the rate shown by your bank, card network, remittance provider, or exchange counter, then see what that particular quote produces. That makes it useful even when you are comparing a cash quote, a card quote, and a transfer quote that all use different rates.',
      },
      {
        heading: 'Why the effective rate can differ from the displayed rate',
        body: 'The received amount is calculated as amount × quoted rate − percentage adjustment − fixed fee. A 1% charge on 135,000 KRW is 1,350 KRW; adding a 500 KRW fixed fee leaves 133,150 KRW. The effective rate is then 133,150 ÷ 100 = 1,331.5 KRW per USD. Compare providers on that effective rate and the final received amount, not only on a headline exchange rate. A negative adjustment can represent a stated rate discount or promotion.',
      },
      {
        heading: 'A reference rate is not necessarily your transaction rate',
        body: 'Reference or mid-market rates are useful for orientation, but an actual card, cash-exchange, remittance, or bank transaction can include a spread, a percentage charge, a fixed fee, taxes, or recipient-bank deductions. The Consumer Financial Protection Bureau advises consumers sending money internationally to compare the exchange rate, fees, taxes, and amount delivered. Confirm the provider’s final disclosure before paying or sending money; this calculator only applies the quote and charges you enter.',
      },
    ],
    faq: [
      {
        q: 'How do I calculate a currency conversion?',
        a: 'Multiply the source amount by the quoted rate expressed in target currency per 1 source currency. At 1 USD = 1,350 KRW, 100 USD converts to 100 × 1,350 = 135,000 KRW before any fee or discount.',
      },
      {
        q: 'What is an effective exchange rate?',
        a: 'An effective exchange rate is the final received target amount divided by the source amount after stated charges. If 100 USD produces 133,150 KRW after charges, the effective rate is 1,331.5 KRW per USD even when the displayed rate was 1,350 KRW per USD.',
      },
      {
        q: 'Why is my bank or card conversion different from a market rate?',
        a: 'A bank, card network, exchange counter, or money-transfer provider can apply its own spread, percentage charge, fixed fee, tax, or settlement rule, so its transaction rate can differ from an informational market rate.',
      },
      {
        q: 'Can I enter a discount instead of a fee?',
        a: 'Yes. Enter a negative rate adjustment for a quoted discount; for example, −1 applies a 1% increase to the converted amount before any fixed fee. The calculator accepts adjustments from −100% through 100%.',
      },
      {
        q: 'Does this currency converter fetch live exchange rates or send my quote away?',
        a: 'No. This calculator does not request a live rate and performs the calculation in the browser. Its inputs are stored only in that browser’s local storage so you can reopen the same quote.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '환율 계산기 — 수수료·환율 우대까지 실수령액 계산',
    description:
      '은행·카드·환전소에서 받은 환율로 환전 금액을 계산합니다. 환율 우대, 수수료, 실질 환율까지 입력 즉시 브라우저에서 확인하세요.',
    h1: '환율 계산기',
    tagline: '은행·카드·환전소에서 제시한 환율을 넣으면 수수료를 반영한 실수령액과 실질 환율을 바로 확인합니다.',
    name: '환율 계산기',
    keywords: [
      '환율 계산기',
      '환전 계산기',
      '달러 원화 계산',
      '환전 수수료 계산',
      '환율 우대 계산',
      '실질 환율 계산',
      '외화 환전 계산',
    ],
    howTo: [
      'USD·KRW처럼 바꿀 통화와 받을 통화의 표시 이름을 입력하세요.',
      '환전할 금액과 “보낼 통화 1단위당 받을 통화”로 표시된 환율을 입력하세요.',
      '환율 우대나 가산 수수료를 퍼센트로, 별도 수수료를 받을 통화 기준으로 입력하세요.',
      '입력 즉시 실수령액, 총 수수료·조정액, 실질 환율을 확인하세요.',
      '계산 요약을 복사해 다른 은행·카드·환전소의 조건과 비교하세요.',
    ],
    sections: [
      {
        heading: '고시 환율보다 내가 받은 조건으로 계산하세요',
        body: '환율은 보통 보낼 통화 1단위로 받을 통화를 얼마나 받는지로 표시합니다. 예를 들어 1 USD = 1,350 KRW라면 수수료 전 100달러는 100 × 1,350 = 135,000원입니다. 이 도구는 실시간 환율을 불러오지 않습니다. 은행 앱, 카드사, 송금 서비스, 환전소에서 실제로 본 환율을 입력하면 그 조건의 실수령액을 계산합니다. 현찰 환전·카드 결제·해외 송금처럼 서로 다른 환율을 적용하는 조건을 비교할 때 특히 유용합니다.',
      },
      {
        heading: '실질 환율은 수수료까지 반영한 단가입니다',
        body: '실수령액은 환전 금액 × 제시 환율 − 퍼센트 조정액 − 정액 수수료로 계산합니다. 100달러를 1,350원에 바꾸면 수수료 전 135,000원입니다. 여기에 1% 수수료 1,350원과 정액 수수료 500원을 빼면 133,150원을 받습니다. 이때 실질 환율은 133,150 ÷ 100 = 달러당 1,331.5원입니다. 제시 환율만 보지 말고 실수령액과 실질 환율로 비교해야 조건 차이가 드러납니다. 음수 퍼센트는 환율 우대나 프로모션 할인을 뜻합니다.',
      },
      {
        heading: '기준환율과 실제 적용환율은 다를 수 있습니다',
        body: '매매기준율이나 시장 환율은 비교의 출발점일 뿐, 실제 카드 결제·현찰 환전·송금에는 스프레드, 퍼센트 수수료, 정액 수수료, 세금, 중개은행 공제 등이 붙을 수 있습니다. 미국 소비자금융보호국(CFPB)도 해외 송금 전 환율, 수수료, 세금, 수취 금액을 함께 비교하라고 안내합니다. 결제하거나 송금하기 전에는 해당 금융회사가 고지하는 최종 적용 금액을 반드시 확인하세요. 이 도구는 입력한 조건만 계산합니다.',
      },
    ],
    faq: [
      {
        q: '환율 계산은 어떻게 하나요?',
        a: '환전할 금액에 “보낼 통화 1단위당 받을 통화” 환율을 곱합니다. 1달러가 1,350원일 때 100달러는 수수료 전 100 × 1,350 = 135,000원입니다.',
      },
      {
        q: '실질 환율이란 무엇인가요?',
        a: '실질 환율은 수수료를 뺀 실수령액을 보낸 통화 금액으로 나눈 값입니다. 100달러를 환전해 수수료 후 133,150원을 받으면 실질 환율은 달러당 1,331.5원입니다.',
      },
      {
        q: '은행 환율과 카드 결제 금액이 시장 환율과 다른 이유는 무엇인가요?',
        a: '은행·카드사·환전소·송금 서비스는 각자의 스프레드, 퍼센트 수수료, 정액 수수료, 세금 또는 정산 규칙을 적용할 수 있으므로 실제 거래 환율이 기준환율과 다를 수 있습니다.',
      },
      {
        q: '환율 우대는 어떻게 입력하나요?',
        a: '환율 우대나 프로모션 할인이라면 퍼센트 조정액에 음수를 입력합니다. 예를 들어 −1은 정액 수수료 전 환전 결과를 1% 늘리는 조건이며, 이 계산기는 −100%부터 100%까지 입력할 수 있습니다.',
      },
      {
        q: '이 환율 계산기는 실시간 환율을 불러오거나 입력값을 전송하나요?',
        a: '아니요. 이 도구는 실시간 환율을 요청하지 않고 브라우저에서만 계산합니다. 입력한 금액과 환율은 같은 브라우저의 로컬 저장소에만 저장됩니다.',
      },
    ],
    ui: {
      intro: '실제로 받은 환율을 입력하세요 — 실시간 환율 요청·회원가입·추적 없이 계산합니다.',
      autosaved: '이 브라우저에 저장됨',
      sourceLabel: '보낼 통화 표시',
      targetLabel: '받을 통화 표시',
      sourcePlaceholder: 'USD',
      targetPlaceholder: 'KRW',
      swap: '통화와 환율 뒤집기',
      amountLabel: '환전할 금액',
      amountHint: '쉼표, 통화 기호, 전각 숫자, “5만 원” 형식을 인식합니다.',
      rateLabel: '제시 환율',
      rateHint: '{source} 1단위당 {target} 금액입니다. 금융회사에서 본 환율을 입력하세요.',
      adjustmentLabel: '환율 조정액 (%)',
      adjustmentHint: '양수는 수수료·가산, 음수는 환율 우대입니다. −100~100을 입력하세요.',
      fixedFeeLabel: '정액 수수료 ({target})',
      fixedFeeHint: '받을 통화 기준으로 별도 차감되는 수수료입니다.',
      resultHeading: '환전 조건 정리',
      receiveLabel: '실수령액',
      effectiveRateLabel: '실질 환율',
      grossLabel: '수수료 전 금액',
      chargesLabel: '수수료·조정액',
      noEffectiveRate: '—',
      formula:
        '{amount} {source} × {rate} = {gross} {target}; 수수료·조정액 {charges} {target} 반영 후 {received} {target}',
      invalid: '0 이상 금액·정액 수수료, 0보다 큰 환율, −100%~100% 조정액을 입력하세요.',
      copy: '계산 요약 복사',
      copied: '복사됨',
      copySummary:
        '환전 조건: {amount} {source} × {rate} {target}/{source}\n수수료 전: {gross} {target}\n수수료·조정액: {charges} {target}\n실수령액: {received} {target}\n실질 환율: {effective} {target}/{source}',
      privacyNotice:
        '입력한 환율은 브라우저 안에서만 계산되고 이 브라우저에만 저장됩니다. 이 도구는 시장 환율을 불러오지 않으므로 최종 금액은 금융회사 고지로 확인하세요.',
    },
  },
};
