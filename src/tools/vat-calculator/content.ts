import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  intro: 'Add VAT or extract it from an inclusive total instantly — no account needed.',
  autosaved: 'Your settings stay in this browser',
  modeLabel: 'Calculation direction',
  modeHint: 'Choose what the amount you have represents.',
  addMode: 'Add VAT',
  removeMode: 'Extract VAT',
  presetLabel: 'Standard-rate preset',
  presetHint: 'A starting point only; use Custom rate when your transaction differs.',
  krRate: 'South Korea — 10%',
  ukRate: 'United Kingdom — 20%',
  deRate: 'Germany — 19%',
  frRate: 'France — 20%',
  ieRate: 'Ireland — 23%',
  dkRate: 'Denmark — 25%',
  customRate: 'Custom rate',
  netInputLabel: 'Amount before VAT',
  grossInputLabel: 'Amount including VAT',
  amountHint: 'Use the currency and decimal precision of your own document.',
  rateLabel: 'VAT rate (%)',
  rateHint: 'Enter 0 to 100; decimals are allowed.',
  resultsHeading: 'Breakdown',
  netLabel: 'Net (before VAT)',
  taxLabel: 'VAT amount',
  grossLabel: 'Gross (including VAT)',
  rateResultLabel: 'Rate used',
  formulaHeading: 'Calculation',
  addFormula: '{amount} + ({amount} × {rate}%) = {gross}; VAT = {tax}',
  removeFormula: '{amount} ÷ (1 + {rate}%) = {net}; VAT = {tax}',
  invalidInput: 'Enter an amount from 0 to 1,000,000,000,000,000 and a rate from 0% to 100%.',
  copy: 'Copy breakdown',
  copied: 'Copied',
  reset: 'Reset',
  taxNotice: 'This is a transaction breakdown, not a tax return. Check the applicable rate and invoice rounding rules.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'VAT Calculator — Add or Extract VAT by Rate',
    description:
      'Add VAT to a net price or extract it from a tax-inclusive total with verified standard-rate presets, a custom rate, and a live formula.',
    h1: 'VAT Calculator',
    tagline:
      'Add VAT or work backward from an inclusive total with standard-rate presets, a custom rate, and the formula shown.',
    name: 'VAT Calculator',
    keywords: [
      'vat calculator',
      'reverse vat calculator',
      'extract vat',
      'vat inclusive calculator',
      'gst calculator',
      'remove vat',
    ],
    howTo: [
      'Choose Add VAT when your amount is before tax, or Extract VAT when the amount already includes tax.',
      'Select a standard-rate preset or choose Custom rate and enter the percentage that applies to the transaction.',
      'Enter the amount using the same currency and decimal precision as the document you are checking.',
      'Read the net, VAT, and gross amounts as they update, then copy the breakdown if needed.',
    ],
    sections: [
      {
        heading: 'Adding VAT and extracting VAT use different operations',
        body: 'To add VAT to a net amount, multiply it by 1 + rate ÷ 100. At 20%, a net price of 100 becomes 100 × 1.20 = 120, with 20 of VAT. To extract VAT from a gross amount, divide by that same multiplier: 120 ÷ 1.20 = 100 net, then subtract the net amount to get 20 VAT. Subtracting 20% directly from a tax-inclusive total would give 96, which is wrong because the 20% was originally calculated from the smaller net amount. The calculator always keeps net + VAT equal to gross before displaying the breakdown.',
      },
      {
        heading: 'What the standard-rate presets mean',
        body: "The presets are standard rates, not a decision about what your particular supply must use. South Korea's National Tax Service describes the ordinary taxpayer rate as 10%. The UK government lists a 20% standard VAT rate. The European Commission's current rate table lists Germany at 19%, France at 20%, Ireland at 23%, and Denmark at 25%. Each jurisdiction can have reduced, zero, exempt, regional, or industry-specific treatments, and rates can change. Confirm the applicable rate with the tax authority or a qualified adviser before issuing an invoice or filing a return.",
      },
      {
        heading: 'Decimals, currency, and invoice rounding',
        body: 'This calculator does not attach a currency symbol because the arithmetic is the same for any currency: enter amounts in the units shown on your receipt or invoice. Results display up to two decimal places, while the calculation keeps extra precision so that the three figures remain consistent. Tax rules and accounting systems can specify a different moment for rounding — per line, per invoice, or to a smallest currency unit — so a real invoice can differ by a minor unit. Use the exact rounding policy required for your transaction when a legally binding amount is needed.',
      },
    ],
    faq: [
      {
        q: 'How do I remove VAT from a price that already includes it?',
        a: 'Divide the tax-inclusive price by 1 + the VAT rate expressed as a decimal, then subtract the result from the inclusive price. For example, at 20%, 120 ÷ 1.20 = 100 net and 120 − 100 = 20 VAT; subtracting 20% from 120 would incorrectly give 96.',
      },
      {
        q: 'What is the VAT amount in a 10% VAT-inclusive total?',
        a: 'For a total that includes 10% VAT, the VAT portion is one eleventh of the total and the net amount is ten elevenths. A total of 110 therefore contains 10 VAT and 100 net, because 110 ÷ 1.10 = 100.',
      },
      {
        q: 'Can I use this VAT calculator for GST or another percentage tax?',
        a: 'Yes. The calculation is the same for any percentage-based tax: add tax with net × (1 + rate ÷ 100), or extract tax with gross ÷ (1 + rate ÷ 100). You must enter the rate that actually applies to your jurisdiction, product, and transaction.',
      },
      {
        q: 'Are the country rate presets always correct for every purchase?',
        a: 'No. The presets are standard national rates checked against official sources, but reduced, zero, exempt, regional, and sector-specific rates can apply. Confirm the rate and the invoice rounding rule with the relevant tax authority before relying on a figure for compliance.',
      },
      {
        q: 'Does this calculator send my prices or rates to a server?',
        a: 'No. The VAT arithmetic runs in the browser. Your chosen amount, rate, and direction are saved only in that browser so you can resume the calculation, and they are not sent to a server.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '부가세 계산기 — 포함가 역산·국가별 기본 세율',
    description:
      '공급가액에 부가세를 더하거나 포함된 합계금액에서 공급가액과 세액을 역산합니다. 한국·영국·EU 기본 세율과 직접 입력을 즉시 계산하고 계산식도 보여줍니다.',
    h1: '부가세 계산기',
    tagline: '공급가액·부가세·합계금액을 즉시 계산하고, 포함가에서 역산하는 공식까지 함께 확인합니다.',
    name: '부가세 계산기',
    keywords: ['부가세 계산기', '부가세 포함 계산', '부가세 역산', '공급가액 계산', '부가세 빼기', 'vat calculator'],
    howTo: [
      '세금이 붙기 전 금액이면 「부가세 더하기」를, 이미 포함된 합계라면 「포함가에서 역산」을 선택합니다.',
      '국가별 기본 세율을 고르거나 실제 거래에 적용되는 세율을 직접 입력합니다.',
      '영수증이나 견적서와 같은 통화·소수 단위로 금액을 입력합니다.',
      '공급가액, 부가세, 합계금액과 계산식을 확인하고 필요하면 결과를 복사합니다.',
    ],
    sections: [
      {
        heading: '부가세 더하기와 포함가 역산의 공식',
        body: '공급가액에 부가세를 더할 때는 공급가액 × (1 + 세율 ÷ 100)으로 합계금액을 구합니다. 세율 10%에서 공급가액 100,000원이라면 부가세는 10,000원, 합계는 110,000원입니다. 반대로 부가세가 포함된 합계금액에서 공급가액을 구할 때는 합계금액을 같은 수로 나눕니다. 110,000원 ÷ 1.1 = 100,000원이므로 부가세는 10,000원입니다. 포함가에서 단순히 10%를 빼면 99,000원이 되어 틀립니다. 10%는 더 작은 공급가액을 기준으로 붙은 금액이기 때문입니다.',
      },
      {
        heading: '국가별 기본 세율은 출발점일 뿐입니다',
        body: '이 계산기의 한국 10% 프리셋은 국세청이 안내하는 일반과세자 세율을 기준으로 합니다. 영국의 일반 VAT 세율은 정부 안내 기준 20%이며, 유럽연합 집행위원회의 세율표에는 독일 19%, 프랑스 20%, 아일랜드 23%, 덴마크 25%가 일반 세율로 표시됩니다. 다만 이 수치는 품목·용역·지역·거래 상대방·사업자 유형에 따라 달라질 수 있습니다. 영세율, 면세, 경감세율, 간이과세자 계산이나 실제 신고·납부세액을 이 도구가 판정하지는 않으므로, 세금계산서 발급과 신고 전에는 관할 세무당국의 최신 기준을 확인해야 합니다.',
      },
      {
        heading: '원 단위 차이가 생길 수 있는 이유',
        body: '이 도구는 어떤 통화에도 같은 산식을 적용하므로 원, 달러, 유로 등 영수증에 적힌 단위 그대로 입력하면 됩니다. 화면에는 소수점 둘째 자리까지 보여 주되, 계산 중에는 더 많은 자릿수를 유지해 공급가액·세액·합계가 서로 맞도록 합니다. 실제 세금계산서나 결제 시스템은 항목별, 청구서 전체, 또는 통화의 최소 단위에서 반올림·절사할 수 있어 1원 또는 최소 화폐 단위 차이가 생길 수 있습니다. 실제 청구 금액에는 해당 거래의 법정 단수 처리와 계약상 반올림 기준을 적용해야 합니다.',
      },
    ],
    faq: [
      {
        q: '부가세 포함 금액에서 부가세를 어떻게 빼나요?',
        a: '포함 금액을 1 + 세율 ÷ 100으로 나눈 뒤, 포함 금액에서 그 공급가액을 뺍니다. 예를 들어 10%가 포함된 110,000원은 110,000 ÷ 1.1 = 100,000원이 공급가액이고, 부가세는 10,000원입니다.',
      },
      {
        q: '부가세 10%가 포함된 금액의 세액은 왜 10분의 1이 아닌가요?',
        a: '10%는 합계금액이 아니라 공급가액을 기준으로 붙으므로, 10% 포함 합계에서 부가세는 합계의 10분의 1이 아니라 11분의 1입니다. 110,000원에는 10,000원의 부가세가 포함되어 있으며 110,000 ÷ 11 = 10,000으로 확인할 수 있습니다.',
      },
      {
        q: '간이과세자도 이 계산기로 실제 납부세액을 알 수 있나요?',
        a: '아니요. 이 도구는 금액 한 건의 세전·세액·세후 금액을 나누는 계산기입니다. 간이과세자의 납부세액은 업종별 부가가치율, 공제세액 등 별도 규칙이 적용되므로 국세청 안내와 실제 신고 기준으로 확인해야 합니다.',
      },
      {
        q: '국가별 기본 세율을 그대로 사용해도 되나요?',
        a: '국가 프리셋은 확인한 일반 세율의 빠른 출발점일 뿐입니다. 품목, 서비스, 지역, 면세·영세율 여부에 따라 세율이 달라질 수 있으므로 실제 거래에는 관할 세무당국의 최신 세율과 반올림 규칙을 확인해야 합니다.',
      },
      {
        q: '입력한 견적 금액이 서버로 전송되나요?',
        a: '아니요. 부가세 계산은 브라우저 안에서만 실행됩니다. 입력한 금액, 세율, 방향은 다시 열 때 이어서 쓸 수 있도록 현재 브라우저의 저장소에만 보관되며 서버로 전송되지 않습니다.',
      },
    ],
    ui: {
      intro: '공급가액에 부가세를 더하거나, 부가세 포함 합계에서 바로 역산합니다 — 로그인이 필요 없습니다.',
      autosaved: '입력값은 이 브라우저에 저장됩니다',
      modeLabel: '계산 방식',
      modeHint: '현재 가진 금액이 세전인지, 부가세 포함인지 선택합니다.',
      addMode: '부가세 더하기',
      removeMode: '포함가에서 역산',
      presetLabel: '국가별 기본 세율',
      presetHint: '일반 세율의 출발점입니다. 거래에 맞는 세율은 직접 입력하세요.',
      krRate: '대한민국 — 10%',
      ukRate: '영국 — 20%',
      deRate: '독일 — 19%',
      frRate: '프랑스 — 20%',
      ieRate: '아일랜드 — 23%',
      dkRate: '덴마크 — 25%',
      customRate: '직접 입력',
      netInputLabel: '공급가액(세전)',
      grossInputLabel: '합계금액(부가세 포함)',
      amountHint: '영수증이나 견적서에 적힌 통화와 소수 단위로 입력하세요.',
      rateLabel: '부가세율(%)',
      rateHint: '0%~100% 사이의 소수 세율도 입력할 수 있습니다.',
      resultsHeading: '계산 결과',
      netLabel: '공급가액(세전)',
      taxLabel: '부가세',
      grossLabel: '합계금액(포함)',
      rateResultLabel: '적용 세율',
      formulaHeading: '계산식',
      addFormula: '{amount} + ({amount} × {rate}%) = {gross}; 부가세 = {tax}',
      removeFormula: '{amount} ÷ (1 + {rate}%) = {net}; 부가세 = {tax}',
      invalidInput: '금액은 0~1,000,000,000,000,000, 세율은 0%~100% 사이로 입력하세요.',
      copy: '결과 복사',
      copied: '복사됨',
      reset: '초기화',
      taxNotice:
        '이 결과는 한 건의 금액 분해용입니다. 실제 신고 세액은 적용 세율과 세금계산서 단수 처리 기준을 확인하세요.',
    },
  },
};
