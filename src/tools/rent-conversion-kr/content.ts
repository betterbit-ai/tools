import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiKo = {
  intro: '만원 단위로 입력하면 계약 조건과 법정 상한을 반영해 즉시 환산합니다.',
  autosaved: '입력값은 이 브라우저에 저장됩니다',
  directionLabel: '전환 방향',
  jeonseToMonthly: '전세 → 월세',
  monthlyToJeonse: '월세 → 전세',
  contractContextLabel: '계약 조건',
  existingContract: '기존·갱신 계약',
  newContract: '신규 계약',
  existingContractHint: '보증금을 월세로 바꾸는 기존·갱신 계약에는 법정 상한을 자동 적용합니다.',
  newContractHint: '처음 정하는 보증금·월세에는 입력 전환율을 그대로 적용하고 법정 상한은 비교 기준으로만 표시합니다.',
  jeonseDepositLabel: '현재 전세보증금(만원)',
  jeonseDepositHint: '예: 3억원은 30000',
  monthlyDepositLabel: '전환 후 월세보증금(만원)',
  monthlyDepositHint: '현재 전세보증금보다 작게 입력하세요.',
  currentMonthlyDepositLabel: '현재 월세보증금(만원)',
  currentMonthlyDepositHint: '예: 1억원은 10000',
  monthlyRentLabel: '월세(만원)',
  monthlyRentHint: '관리비를 제외한 월 차임입니다.',
  rateLabel: '적용할 연 전환율(%)',
  rateHint: '0~100 사이 숫자입니다. 2026년 10월 27일 확인 법정 상한은 연 5.00%입니다.',
  offeredRentLabel: '집주인이 제시한 월세(만원, 선택)',
  offeredRentHint: '입력하면 실제 제안의 역산 전환율과 법정 상한 초과액을 확인합니다.',
  resultsHeading: '환산 결과',
  reset: '초기화',
  invalidInput:
    '금액과 전환율을 확인하세요. 전세→월세에서는 전세보증금이 0보다 크고 전환 후 보증금보다 커야 하며, 월세→전세에서는 전환율이 0보다 커야 합니다.',
  convertedMonthlyRent: '환산 월세',
  equivalentJeonseDeposit: '환산 전세보증금',
  convertedDeposit: '월세로 바꾸는 보증금',
  additionalDeposit: '월세 대신 더할 보증금',
  appliedRate: '실제 계산 전환율',
  legalCap: '2026 법정 상한',
  requestedRate: '입력 전환율',
  capAppliedNotice: '입력한 연 {requested}%가 법정 상한 연 {cap}%를 넘어 {cap}%로 낮춰 계산했습니다.',
  withinCapNotice: '입력한 연 {requested}%가 법정 상한 연 {cap}% 이하여서 그대로 계산했습니다.',
  newContractNotice:
    '신규 계약은 입력한 연 {requested}%로 계산했습니다. 연 {cap}%는 기존 보증금을 월세로 전환할 때의 법정 상한이며 신규 계약 가격을 자동 제한하지 않습니다.',
  reverseNotice:
    '월세→전세는 입력 전환율로 구한 비교용 환산액입니다. 주택임대차보호법 제7조의2의 상한은 보증금→월세 전환에 적용됩니다.',
  calculationHeading: '계산 근거',
  forwardFormula: '({jeonse} − {deposit}) × {rate}% ÷ 12 = 월 {result}',
  reverseFormula: '{deposit} + ({rent} × 12 ÷ {rate}%) = {result}',
  ruleBasis:
    '상한 = min(연 10%, 한국은행 기준금리 3.00% + 연 2%p) = 연 5.00% · 기준금리 2026-08-27 시행 · 2026-10-27 확인',
  offerHeading: '제시 조건 확인',
  impliedRate: '제시 월세의 역산 전환율',
  legalMaximumRent: '법정 상한 월세',
  excessMonthlyRent: '월 초과액',
  offerAboveCap:
    '기존·갱신 계약이라면 제시 월세는 법정 상한보다 월 {excess} 높습니다. 주택임대차보호법 제10조의2는 초과 지급액의 반환 청구를 규정합니다.',
  offerWithinCap: '기존·갱신 계약 기준으로 제시 월세가 법정 상한 이내입니다.',
  offerNewContract:
    '신규 계약에는 법정 상한을 자동 적용하지 않습니다. 역산 전환율과 연 {cap}%를 협상 비교 기준으로 확인하세요.',
  copyResult: '결과 복사',
  copied: '복사됨',
  copyFailed: '복사하지 못했습니다. 결과를 직접 선택해 복사하세요.',
  wonSuffix: '원',
  percentSuffix: '%',
};
export type UI = typeof uiKo;

const uiEn: UI = {
  intro: 'Enter Korean lease amounts in KRW 10,000 units for an instant, legally scoped conversion.',
  autosaved: 'Saved in this browser',
  directionLabel: 'Conversion direction',
  jeonseToMonthly: 'Jeonse → monthly',
  monthlyToJeonse: 'Monthly → jeonse',
  contractContextLabel: 'Contract context',
  existingContract: 'Existing or renewal',
  newContract: 'New contract',
  existingContractHint: 'The statutory ceiling is applied automatically when an existing deposit is converted to rent.',
  newContractHint: 'Newly negotiated terms use your rate; the statutory ceiling is shown only as a reference.',
  jeonseDepositLabel: 'Current jeonse deposit (₩10K)',
  jeonseDepositHint: 'Example: enter 30000 for ₩300 million.',
  monthlyDepositLabel: 'New monthly-rent deposit (₩10K)',
  monthlyDepositHint: 'Enter an amount below the current jeonse deposit.',
  currentMonthlyDepositLabel: 'Current monthly-rent deposit (₩10K)',
  currentMonthlyDepositHint: 'Example: enter 10000 for ₩100 million.',
  monthlyRentLabel: 'Monthly rent (₩10K)',
  monthlyRentHint: 'Enter rent only, excluding maintenance fees.',
  rateLabel: 'Annual conversion rate (%)',
  rateHint: 'Enter 0–100. The statutory ceiling verified on October 27, 2026 is 5.00% a year.',
  offeredRentLabel: 'Landlord’s quoted rent (₩10K, optional)',
  offeredRentHint: 'Enter a quote to reverse-calculate its implied rate and any excess over the ceiling.',
  resultsHeading: 'Conversion result',
  reset: 'Reset',
  invalidInput:
    'Check the amounts and rate. For jeonse → monthly, the jeonse deposit must be above zero and greater than the new deposit; for monthly → jeonse, the rate must be above zero.',
  convertedMonthlyRent: 'Converted monthly rent',
  equivalentJeonseDeposit: 'Equivalent jeonse deposit',
  convertedDeposit: 'Deposit converted to rent',
  additionalDeposit: 'Deposit replacing the rent',
  appliedRate: 'Rate used',
  legalCap: '2026 statutory ceiling',
  requestedRate: 'Entered rate',
  capAppliedNotice:
    'The entered {requested}% exceeds the {cap}% statutory ceiling, so the calculation was capped at {cap}%.',
  withinCapNotice: 'The entered {requested}% is at or below the {cap}% statutory ceiling and was used unchanged.',
  newContractNotice:
    'This new contract uses the entered {requested}%. The {cap}% ceiling governs conversion of an existing deposit, not the initial price of a new lease.',
  reverseNotice:
    'Monthly → jeonse is a comparison using your rate. Article 7-2 of the Housing Lease Protection Act caps deposit → rent conversion, not this reverse estimate.',
  calculationHeading: 'Calculation basis',
  forwardFormula: '({jeonse} − {deposit}) × {rate}% ÷ 12 = {result}/month',
  reverseFormula: '{deposit} + ({rent} × 12 ÷ {rate}%) = {result}',
  ruleBasis:
    'Ceiling = min(10% a year, Bank of Korea base rate 3.00% + 2 percentage points) = 5.00% · base rate effective August 27, 2026 · verified October 27, 2026',
  offerHeading: 'Check the quoted terms',
  impliedRate: 'Quote’s implied annual rate',
  legalMaximumRent: 'Rent at the statutory ceiling',
  excessMonthlyRent: 'Monthly excess',
  offerAboveCap:
    'For an existing or renewed lease, the quote is {excess} per month above the ceiling. Article 10-2 permits a tenant to claim repayment of excess rent already paid.',
  offerWithinCap: 'For an existing or renewed lease, the quoted rent is within the statutory ceiling.',
  offerNewContract:
    'The ceiling does not automatically price a new contract. Compare the implied rate with the {cap}% existing-contract ceiling when negotiating.',
  copyResult: 'Copy result',
  copied: 'Copied',
  copyFailed: 'Could not copy. Select the result and copy it manually.',
  wonSuffix: 'KRW',
  percentSuffix: '%',
};

export const content: Record<Locale, ToolContent<UI>> = {
  ko: {
    title: '전월세 전환율 계산기 — 2026 법정 상한 자동 적용',
    description:
      '전세를 월세로, 월세를 전세로 즉시 환산합니다. 2026년 법정 전환율 상한 5.00%를 계약 조건에 맞게 자동 적용하고 제시 월세의 초과액까지 풀이합니다.',
    h1: '전월세 전환율 계산기',
    tagline:
      '기존·갱신 계약에는 2026년 법정 상한을 자동 적용하고, 집주인이 제시한 월세의 역산 전환율과 계산 근거까지 확인합니다.',
    name: '전월세 전환율 계산기',
    keywords: [
      '전월세 전환율',
      '전세 월세 전환',
      '전세 월세 전환 계산기',
      '월세 전세 환산',
      '법정 전월세 전환율 2026',
      '반전세 계산기',
      '보증금 월세 전환',
    ],
    howTo: [
      '전세→월세 또는 월세→전세를 고르세요.',
      '보증금과 월세를 만원 단위로 입력하세요.',
      '전세→월세라면 기존·갱신 계약인지 신규 계약인지 고르세요.',
      '연 전환율을 입력하고 즉시 바뀌는 환산액과 적용 전환율을 확인하세요.',
      '집주인이 제시한 월세가 있으면 입력해 역산 전환율과 법정 상한 초과액을 확인하세요.',
    ],
    sections: [
      {
        heading: '전세를 월세로, 월세를 전세로 바꾸는 계산 방법',
        body: '전세→월세는 「(현재 전세보증금 − 전환 후 보증금) × 연 전환율 ÷ 12」입니다. 전세 3억원을 보증금 1억원으로 낮추면 월세로 바뀌는 금액은 2억원입니다. 연 5.00%를 적용한 연 차임은 1,000만원이고, 월 단위로 나눈 법정 상한은 원 단위에서 넘지 않도록 버림한 833,333원입니다. 월세→전세는 「월세보증금 + 월세 × 12 ÷ 전환율」로 비교용 전세보증금을 구합니다.',
      },
      {
        heading: '2026년 법정 전월세 전환율 상한은 연 5.00%',
        body: '주택임대차보호법 제7조의2와 시행령 제9조는 보증금을 월 차임으로 전환할 때 연 10%와 「한국은행 기준금리 + 연 2%p」 중 낮은 비율을 상한으로 정합니다. 한국은행 금융통화위원회가 2026년 8월 27일부터 기준금리를 3.00%로 정했으므로 2026년 10월 27일 확인 상한은 min(10%, 3.00% + 2%p) = 연 5.00%입니다. 출처: 국가법령정보센터 주택임대차보호법(2026-01-02 시행)·시행령(2026-07-01 시행, 연 2% 조항은 2020-09-29 시행), 한국은행 통화정책방향(2026-08-27).',
      },
      {
        heading: '법정 상한이 적용되는 조건과 적용되지 않는 경우',
        body: '법정 상한은 주거용 임대차에서 기존 보증금의 전부 또는 일부를 월세로 전환할 때 적용됩니다. 계약 기간 중 합의해 바꾸거나 갱신하면서 전세를 반전세·월세로 바꾸는 경우가 대표적입니다. 처음 맺는 신규 계약의 보증금과 월세를 정하거나 월세를 전세보증금으로 역산할 때는 이 상한이 계약 가격을 자동 결정하지 않습니다. 그래서 계산기는 기존·갱신 계약의 전세→월세에만 상한을 적용하고, 신규 계약과 역방향은 입력 전환율을 유지합니다.',
      },
      {
        heading: '제시 월세가 비싼 이유를 역산해서 확인',
        body: '제시 월세의 역산 전환율은 「월세 × 12 ÷ 전환되는 보증금 × 100」입니다. 전세 3억원을 보증금 1억원·월세 100만원으로 바꾸자는 제안은 2억원에 연 6.00%를 적용한 조건입니다. 기존·갱신 계약의 2026년 상한 월세 833,333원보다 월 166,667원 높습니다. 주택임대차보호법 제10조의2는 제7조의2 산정률을 초과해 지급한 월세 상당액의 반환을 청구할 수 있다고 규정하지만, 실제 분쟁은 계약일·계약 형태 등 개별 사실관계를 확인해야 합니다.',
      },
    ],
    faq: [
      {
        q: '2026년 전월세 전환율 법정 상한은 몇 퍼센트인가요?',
        a: '2026년 10월 27일 확인 법정 상한은 연 5.00%입니다. 주택임대차보호법 시행령 제9조의 연 10%와 한국은행 기준금리 3.00%에 연 2%p를 더한 5.00% 중 낮은 값입니다. 기준금리 3.00%는 2026년 8월 27일부터 적용됐으며, 이후 기준금리가 바뀌면 상한도 바뀝니다.',
      },
      {
        q: '전세 3억을 보증금 1억 월세로 바꾸면 얼마인가요?',
        a: '전세 3억원에서 보증금 1억원을 남기면 2억원이 월세로 전환됩니다. 2026년 법정 상한 연 5.00%를 적용하면 2억원 × 5% ÷ 12 = 월 833,333.33원이므로, 원 단위에서 상한을 넘지 않게 버림한 월세는 833,333원입니다.',
      },
      {
        q: '법정 전월세 전환율은 신규 계약에도 적용되나요?',
        a: '주택임대차보호법 제7조의2의 상한은 기존 보증금의 전부 또는 일부를 월세로 전환하는 경우에 적용됩니다. 계약 기간 중 전환이나 갱신 전환이 대표적이며, 처음 맺는 신규 계약의 보증금과 월세를 정하는 규정은 아닙니다. 신규 계약에서는 5.00%를 협상 비교 기준으로 사용할 수 있지만 계약 가격을 자동 제한하지 않습니다.',
      },
      {
        q: '월세를 전세로 환산할 때도 5% 상한이 강제되나요?',
        a: '아닙니다. 월세→전세 환산은 「월세보증금 + 월세 × 12 ÷ 전환율」로 구한 비교용 금액이며, 주택임대차보호법 제7조의2는 보증금을 월세로 전환하는 방향을 제한합니다. 따라서 역방향 계산에는 비교하려는 시장 전환율이나 협의 전환율을 직접 입력해야 합니다.',
      },
      {
        q: '법정 상한보다 많은 월세를 이미 냈다면 어떻게 되나요?',
        a: '주택임대차보호법 제10조의2는 제7조의2의 월차임 산정률을 초과해 지급한 경우 초과 지급한 월세 상당액의 반환을 청구할 수 있다고 규정합니다. 다만 상한 적용 대상인지, 전환 시점과 계약 형태가 무엇인지는 개별 계약서와 사실관계로 판단해야 합니다.',
      },
    ],
    ui: uiKo,
  },
  en: {
    title: 'Jeonse to Monthly Rent Calculator — 2026 Cap',
    description:
      'Convert Korean jeonse to monthly rent or back. Applies the verified 2026 legal ceiling to existing leases and explains a quoted rent’s implied rate and excess.',
    h1: 'Jeonse to Monthly Rent Calculator',
    tagline:
      'Convert Korean deposits both ways, apply the 2026 statutory ceiling in the right contract context, and check a landlord’s quoted rent.',
    name: 'Korea Rent Conversion Calculator',
    keywords: [
      'jeonse to monthly rent korea',
      'jeonse monthly rent calculator',
      'wolse calculator',
      'Korea rent deposit conversion',
      'jeonse conversion rate 2026',
      'ban jeonse calculator',
    ],
    howTo: [
      'Choose Jeonse → monthly or Monthly → jeonse.',
      'Enter the deposit and rent amounts in units of KRW 10,000.',
      'For jeonse → monthly, choose whether this changes an existing or renewed lease or prices a new contract.',
      'Enter an annual conversion rate and review the amount and rate used immediately.',
      'Optionally enter a landlord’s rent quote to see its implied rate and any excess over the statutory ceiling.',
    ],
    sections: [
      {
        heading: 'How to convert jeonse to monthly rent and back',
        body: 'For jeonse → monthly, use (current jeonse deposit − new deposit) × annual conversion rate ÷ 12. Reducing a KRW 300 million jeonse deposit to KRW 100 million converts KRW 200 million. At 5.00%, annual rent is KRW 10 million and the whole-won monthly ceiling is KRW 833,333 after rounding down so it does not exceed the cap. For monthly → jeonse, use monthly-rent deposit + monthly rent × 12 ÷ conversion rate.',
      },
      {
        heading: 'Korea’s statutory conversion ceiling is 5.00% in 2026',
        body: 'Article 7-2 of the Housing Lease Protection Act and Article 9 of its Enforcement Decree set the ceiling at the lower of 10% a year or the Bank of Korea base rate plus 2 percentage points. The Bank of Korea raised the base rate to 3.00% effective August 27, 2026, so the ceiling verified October 27, 2026 is min(10%, 3.00% + 2%p) = 5.00%. Official sources: Korean Law Information Center, Housing Lease Protection Act (effective January 2, 2026) and Enforcement Decree (effective July 1, 2026; the 2% provision took effect September 29, 2020); Bank of Korea Monetary Policy Decision dated August 27, 2026.',
      },
      {
        heading: 'When the legal ceiling applies',
        body: 'The ceiling governs conversion of all or part of an existing residential deposit into monthly rent, commonly during a lease or at renewal. It does not automatically price the deposit and rent first agreed in a new lease, and the statute does not cap the reverse monthly → jeonse estimate. The calculator therefore caps only existing-or-renewal jeonse → monthly calculations; new contracts and reverse comparisons retain the rate you enter.',
      },
      {
        heading: 'Reverse-calculate a landlord’s rent quote',
        body: 'A quote’s implied rate is monthly rent × 12 ÷ converted deposit × 100. A proposal to change KRW 300 million jeonse into a KRW 100 million deposit plus KRW 1 million monthly rent implies 6.00% on the KRW 200 million difference. That is KRW 166,667 per month above the 2026 existing-lease ceiling of KRW 833,333. Article 10-2 permits a tenant to claim repayment of rent paid above the Article 7-2 ceiling, but the dates and form of an individual contract still matter.',
      },
    ],
    faq: [
      {
        q: 'What is Korea’s legal jeonse-to-monthly conversion rate in 2026?',
        a: 'The ceiling verified on October 27, 2026 is 5.00% a year. It is the lower of 10% and the Bank of Korea base rate of 3.00% plus 2 percentage points. The 3.00% base rate took effect on August 27, 2026; a later base-rate change would also change the ceiling.',
      },
      {
        q: 'How much rent is a KRW 300 million jeonse with a KRW 100 million deposit?',
        a: 'The converted portion is KRW 200 million. At the 2026 statutory ceiling of 5.00%, KRW 200 million × 5% ÷ 12 equals KRW 833,333.33, so the whole-won monthly ceiling is KRW 833,333 after rounding down.',
      },
      {
        q: 'Does the statutory conversion ceiling apply to a new Korean lease?',
        a: 'Article 7-2 limits conversion of an existing deposit into monthly rent, such as a change during the lease or at renewal. It does not automatically set the initial deposit and rent in a new contract. For a new lease, 5.00% can be a negotiation benchmark rather than an automatic price limit.',
      },
      {
        q: 'Is the 5% ceiling mandatory when converting monthly rent back to jeonse?',
        a: 'No. Monthly → jeonse is a comparison calculated as deposit + monthly rent × 12 ÷ conversion rate. Article 7-2 limits deposit → rent conversion, so enter the market or negotiated rate you want to use for the reverse estimate.',
      },
      {
        q: 'Can a tenant recover rent paid above the legal conversion ceiling?',
        a: 'Article 10-2 of Korea’s Housing Lease Protection Act permits a tenant to claim repayment of rent paid above the Article 7-2 conversion ceiling. Whether the ceiling applies depends on the date and form of the individual lease change, so the contract facts should be checked.',
      },
    ],
    ui: uiEn,
  },
};
