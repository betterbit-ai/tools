import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  intro: 'Split a bill exactly, down to the last cent or won.',
  autosaved: 'Saved in this browser',
  countryLabel: 'Where are you paying?',
  countryUs: 'United States (USD)',
  countryCa: 'Canada (CAD)',
  countryUk: 'United Kingdom (GBP)',
  countryKr: 'South Korea (KRW)',
  countryJp: 'Japan (JPY)',
  countryNoteUs: 'Restaurant tips of 18–20% are a common US starting point.',
  countryNoteCa: 'Restaurant tips of 15–20% are common; 18% is the preset.',
  countryNoteUk: 'Check the receipt for a service charge before adding a tip.',
  countryNoteKr: 'Tipping is not customary; the preset starts at 0%.',
  countryNoteJp: 'Tipping is not customary; the preset starts at 0%.',
  billLabel: 'Bill before tip',
  billHint: 'Paste a receipt amount; commas and currency symbols are accepted.',
  billPlaceholder: '50.00',
  tipLabel: 'Tip (%)',
  tipHint: 'Choose a preset or enter any rate from 0 to 1,000%.',
  percentPlaceholder: '0',
  tip15: '15%',
  tip18: '18%',
  tip20: '20%',
  serviceChargeLabel: 'Service charge (%)',
  serviceChargeHint: 'Add a charge already listed on the receipt, if any.',
  peopleLabel: 'People',
  peopleHint: 'Up to 100 people.',
  peoplePlaceholder: '1',
  resultsHeading: 'Your payment',
  copy: 'Copy summary',
  copied: 'Copied',
  invalidInput: 'Enter a non-negative bill, valid percentages, and a whole number of people from 1 to 100.',
  tipResultLabel: 'Tip',
  serviceChargeResultLabel: 'Service charge',
  totalLabel: 'Total',
  perPersonLabel: 'Highest share',
  equalSplit: 'Everyone pays {amount}; the shares add back to the exact total.',
  unevenSplit:
    '{higherCount} pay {higherAmount}; {lowerCount} pay {lowerAmount}. Every currency unit is accounted for.',
  formula: 'Total = {bill} + ({bill} × {tip}% ÷ 100) + ({bill} × {service}% ÷ 100)',
  serviceChargeNotice: 'A service charge may already cover gratuity. Check the receipt before adding another tip.',
  copySummary: 'Tip: {tip}\nTotal: {total}\nPer person: up to {each}',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Tip Calculator — Exact Bill Split, Country Presets',
    description:
      'Calculate a tip, service charge, total, and exact per-person shares for USD, CAD, GBP, KRW, or JPY. Every cent or won is accounted for.',
    h1: 'Tip Calculator',
    tagline:
      'Calculate the tip and split the exact total without losing a cent or won — with country-aware starting rates.',
    name: 'Tip Calculator',
    keywords: [
      'tip calculator',
      'bill split calculator',
      'gratuity calculator',
      'restaurant tip calculator',
      'split bill',
      'calculate tip',
    ],
    howTo: [
      'Choose the country and currency that match the bill.',
      'Enter the amount before tip, then choose or type a tip percentage.',
      'Add a listed service charge only when it is separate from the amount you entered.',
      'Enter the number of people to see the total and the exact amounts that add back to it.',
      'Copy the payment summary to share it with the group.',
    ],
    sections: [
      {
        heading: 'How the tip and total are calculated',
        body: 'This calculator keeps the bill, tip, and any separate service charge distinct: tip = bill × tip rate ÷ 100; service charge = bill × service-charge rate ÷ 100; total = bill + tip + service charge. Each amount is rounded to the smallest currency unit before the final total is split. That matters for a $10.01 bill split three ways: showing everyone $3.34 would collect $10.02, while showing everyone $3.33 would collect only $9.99. This tool instead tells you exactly how many people pay each amount.',
      },
      {
        heading: 'Why the split can differ by one minor currency unit',
        body: 'US dollars, Canadian dollars, and British pounds are normally divided into 100 minor units, while the Korean won and Japanese yen are handled here as whole units. When a total does not divide evenly, one or more people must pay one minor unit more than the others. For example, ₩55,000 split three ways becomes ₩18,334 for one person and ₩18,333 for two people. Those shares total exactly ₩55,000; no rounding residue is hidden.',
      },
      {
        heading: 'Country presets are starting points, not a rule',
        body: 'Tipping customs depend on the country, venue, and whether the receipt already includes a service charge. The United States preset starts at 20% and Canada at 18% because restaurant tipping is common there. The United Kingdom preset starts at 10% but first prompts you to check the bill for an included service charge. South Korea and Japan start at 0% because tipping is generally not customary. Read the receipt and follow local practice rather than treating any preset as mandatory.',
      },
    ],
    faq: [
      {
        q: 'How do I calculate a tip?',
        a: 'Multiply the bill by the tip percentage and divide by 100. For example, a 20% tip on a $50 bill is $50 × 20 ÷ 100 = $10, making the total $60 before any separate service charge.',
      },
      {
        q: 'How does the calculator split a bill without losing cents?',
        a: 'The calculator converts the total to integer minor units before dividing it. If $10.01 is split among three people, one person pays $3.34 and two people pay $3.33, which adds back to exactly $10.01.',
      },
      {
        q: 'Should I add a tip when a service charge is already on the bill?',
        a: 'Check the receipt wording and local practice before adding another amount. A listed service charge is already part of the total, so this calculator keeps it on a separate line to make an additional tip visible rather than silently adding both together.',
      },
      {
        q: 'Should a tip be calculated before or after tax?',
        a: 'Both methods are used, but this calculator applies the percentage to the bill amount you enter. Enter a pre-tax subtotal to tip before tax, or enter the tax-included total if that is the amount you want to use as the tip base.',
      },
      {
        q: 'Do people tip in South Korea or Japan?',
        a: 'Tipping is generally not customary in South Korea or Japan, so this calculator starts both presets at 0%. A venue may have its own charge or policy, so check the receipt or ask when unsure.',
      },
      {
        q: 'Does this tip calculator send my bill anywhere?',
        a: 'No. Calculations run in the browser, and the saved inputs stay in this browser’s local storage. The bill, rates, and split are not sent to a server.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '팁 계산기 — 더치페이와 국가별 기본값',
    description:
      '팁, 서비스 요금, 최종 금액과 1인당 결제액을 바로 계산합니다. 원·엔·달러 등 통화의 최소 단위까지 정확히 나누고, 국가별 팁 기본값도 확인하세요.',
    h1: '팁 계산기',
    tagline: '팁과 더치페이를 최소 통화 단위까지 정확히 나누고, 국가별 팁 관행에 맞는 시작값도 확인합니다.',
    name: '팁 계산기',
    keywords: ['팁 계산기', '팁 계산', '더치페이 계산기', '해외여행 팁', '식당 팁 계산', 'n빵 계산기'],
    howTo: [
      '결제할 국가와 영수증 통화를 선택하세요.',
      '팁을 제외한 금액을 입력하고 팁 비율을 선택하거나 직접 입력하세요.',
      '영수증에 별도로 적힌 서비스 요금이 있으면 해당 비율을 입력하세요.',
      '인원수를 입력해 합계와 정확한 1인당 결제액을 확인하세요.',
      '결제 요약을 복사해 일행과 공유하세요.',
    ],
    sections: [
      {
        heading: '팁·서비스 요금·최종 금액 계산식',
        body: '이 계산기는 금액, 팁, 서비스 요금을 섞지 않고 따로 계산합니다. 팁 = 금액 × 팁 비율 ÷ 100, 서비스 요금 = 금액 × 서비스 요금 비율 ÷ 100, 최종 금액 = 금액 + 팁 + 서비스 요금입니다. 각 금액을 통화의 최소 단위에서 먼저 반올림한 뒤 인원수로 나누므로, 10.01달러를 3명이 나눌 때 모두 3.34달러를 내서 10.02달러가 되거나 모두 3.33달러를 내서 9.99달러가 되는 문제가 없습니다. 이 도구는 누가 얼마를 내야 합계와 정확히 맞는지 보여줍니다.',
      },
      {
        heading: '더치페이 금액이 1원 또는 1센트씩 다른 이유',
        body: '미국·캐나다 달러와 영국 파운드는 보통 100개의 최소 단위로 나뉘고, 이 계산기에서는 한국 원과 일본 엔을 정수 단위로 처리합니다. 최종 금액이 인원수로 나누어떨어지지 않으면 일부 인원은 최소 단위 1만큼 더 내야 합니다. 예를 들어 55,000원을 3명이 나누면 한 명은 18,334원, 두 명은 18,333원을 내며 합계는 정확히 55,000원입니다. 반올림 차액이 사라지지 않습니다.',
      },
      {
        heading: '국가별 기본값은 참고용입니다',
        body: '팁 관행은 국가, 업장, 영수증에 서비스 요금이 포함되었는지에 따라 달라집니다. 미국은 20%, 캐나다는 18%로 시작하지만 강제 기준은 아닙니다. 영국은 서비스 요금이 이미 적혀 있는지 먼저 확인하도록 10%를 시작값으로 두었습니다. 한국과 일본은 팁 문화가 일반적이지 않아 0%부터 시작합니다. 기본값보다 영수증 표기와 현지 관행을 우선하세요.',
      },
    ],
    faq: [
      {
        q: '팁은 어떻게 계산하나요?',
        a: '금액에 팁 비율을 곱한 뒤 100으로 나누면 됩니다. 예를 들어 50달러의 20% 팁은 50 × 20 ÷ 100 = 10달러이고, 별도 서비스 요금이 없다면 최종 금액은 60달러입니다.',
      },
      {
        q: '더치페이할 때 1원이나 1센트를 잃지 않으려면 어떻게 하나요?',
        a: '최종 금액을 최소 통화 단위의 정수로 바꾼 뒤 나누면 됩니다. 10.01달러를 3명이 나누면 한 명은 3.34달러, 두 명은 3.33달러를 내어 합계가 정확히 10.01달러가 됩니다.',
      },
      {
        q: '영수증에 서비스 요금이 있으면 팁을 또 내야 하나요?',
        a: '영수증 표기와 현지 관행을 먼저 확인하세요. 서비스 요금은 이미 총액에 포함되는 항목이므로, 이 계산기는 서비스 요금과 추가 팁을 별도 줄로 보여 두 금액을 함께 더하는지 분명히 알 수 있게 합니다.',
      },
      {
        q: '팁은 세전 금액과 세후 금액 중 어디에 계산하나요?',
        a: '두 방식 모두 쓰이지만, 이 계산기는 입력한 금액을 기준으로 계산합니다. 세전 소계를 입력하면 세전 기준 팁이 되고, 세금이 포함된 결제 금액을 입력하면 그 금액 기준 팁이 됩니다.',
      },
      {
        q: '한국이나 일본에서도 팁을 내나요?',
        a: '한국과 일본에서는 일반적으로 팁을 내는 문화가 아니므로 이 계산기의 두 국가 기본값은 0%입니다. 업장별 요금이나 정책이 있을 수 있으므로 영수증을 확인하거나 직원에게 물어보세요.',
      },
      {
        q: '입력한 금액이 서버로 전송되나요?',
        a: '아니요. 계산은 브라우저 안에서만 이루어지고, 저장되는 입력값도 현재 브라우저의 로컬 저장소에만 남습니다. 금액, 팁 비율, 인원수는 서버로 전송되지 않습니다.',
      },
    ],
    ui: {
      intro: '1원·1센트까지 남김없이 나눕니다.',
      autosaved: '이 브라우저에 저장됨',
      countryLabel: '결제 국가',
      countryUs: '미국 (USD)',
      countryCa: '캐나다 (CAD)',
      countryUk: '영국 (GBP)',
      countryKr: '대한민국 (KRW)',
      countryJp: '일본 (JPY)',
      countryNoteUs: '미국 식당에서는 18~20%가 흔한 시작 기준입니다.',
      countryNoteCa: '캐나다 식당에서는 15~20%가 흔하며, 기본값은 18%입니다.',
      countryNoteUk: '팁을 더하기 전에 영수증의 서비스 요금을 확인하세요.',
      countryNoteKr: '한국에서는 팁이 일반적이지 않아 기본값은 0%입니다.',
      countryNoteJp: '일본에서는 팁이 일반적이지 않아 기본값은 0%입니다.',
      billLabel: '팁 제외 금액',
      billHint: '영수증 금액을 붙여 넣어도 됩니다. 쉼표와 통화 기호를 인식합니다.',
      billPlaceholder: '50000',
      tipLabel: '팁 비율(%)',
      tipHint: '기본값을 고르거나 0~1,000% 사이의 비율을 직접 입력하세요.',
      percentPlaceholder: '0',
      tip15: '15%',
      tip18: '18%',
      tip20: '20%',
      serviceChargeLabel: '서비스 요금(%)',
      serviceChargeHint: '영수증에 별도로 적힌 요금이 있을 때만 입력하세요.',
      peopleLabel: '인원수',
      peopleHint: '최대 100명까지 입력할 수 있습니다.',
      peoplePlaceholder: '1',
      resultsHeading: '결제 금액',
      copy: '요약 복사',
      copied: '복사됨',
      invalidInput: '0 이상의 금액과 올바른 비율, 1~100 사이의 정수 인원수를 입력하세요.',
      tipResultLabel: '팁',
      serviceChargeResultLabel: '서비스 요금',
      totalLabel: '최종 금액',
      perPersonLabel: '1인 최대 결제액',
      equalSplit: '모두 {amount}씩 내면 합계와 정확히 일치합니다.',
      unevenSplit:
        '{higherCount}명은 {higherAmount}, {lowerCount}명은 {lowerAmount}을 내면 모든 최소 단위까지 맞습니다.',
      formula: '최종 금액 = {bill} + ({bill} × {tip}% ÷ 100) + ({bill} × {service}% ÷ 100)',
      serviceChargeNotice: '서비스 요금에 팁이 포함될 수 있습니다. 팁을 추가하기 전에 영수증을 확인하세요.',
      copySummary: '팁: {tip}\n최종 금액: {total}\n1인당: 최대 {each}',
    },
  },
};
