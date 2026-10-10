import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  intro: 'Change any value to update the projection, annual chart, and schedule instantly.',
  autosaved: 'Saved in this browser',
  principalLabel: 'Starting amount',
  principalHint: 'Use any currency consistently; results keep the same unit.',
  monthlyContributionLabel: 'Monthly contribution',
  monthlyContributionHint: 'Enter 0 for a one-time deposit only.',
  rateLabel: 'Annual interest rate (%)',
  rateHint: 'A constant nominal annual rate from 0% to 100%.',
  yearsLabel: 'Years',
  yearsHint: 'Whole years from 1 to 100.',
  frequencyLabel: 'Compounding frequency',
  frequencyHint: 'How often the stated annual rate compounds.',
  annual: 'Annually',
  quarterly: 'Quarterly',
  monthly: 'Monthly',
  daily: 'Daily',
  timingLabel: 'Monthly contribution timing',
  timingHint: 'Choose when each monthly contribution reaches the account.',
  beginningOfMonth: 'Beginning',
  endOfMonth: 'End',
  invalidInput:
    'Enter non-negative amounts, an annual rate from 0% to 100%, and a whole number of years from 1 to 100.',
  resultsHeading: 'Projected value',
  finalBalance: 'Final balance',
  totalInterest: 'Interest earned',
  totalContributions: 'Total contributed',
  effectiveAnnualRate: 'Effective annual rate',
  chartHeading: 'Annual growth chart',
  chartDescription: 'Bar chart of the projected balance at the end of each year.',
  assumption:
    'Estimate only: assumes a constant rate and monthly deposits. Taxes, fees, changing returns, and account rounding are not included.',
  scheduleHeading: 'Annual projection',
  scheduleHint: 'Compare the balance, your deposits, and accumulated interest at every year-end.',
  showSchedule: 'Show all {count} years',
  hideSchedule: 'Hide projection',
  year: 'Year',
  balance: 'Balance',
  contributions: 'Contributed',
  interest: 'Interest',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Compound Interest Calculator — Monthly Growth Chart',
    description:
      'Project compound growth from a starting amount and monthly contributions. See the final balance, annual chart, and full schedule update instantly in your browser.',
    h1: 'Compound Interest Calculator',
    tagline:
      'See a starting amount and monthly savings grow together, with a live annual chart and schedule—without sending your numbers anywhere.',
    name: 'Compound Interest Calculator',
    keywords: [
      'compound interest calculator',
      'compound interest with monthly contributions',
      'investment growth calculator',
      'monthly savings calculator',
      'compound growth chart',
      'future value calculator',
    ],
    howTo: [
      'Enter the amount already saved or invested as the starting amount.',
      'Enter the amount you plan to add each month, or enter 0 for a lump sum.',
      'Set a constant annual rate, number of whole years, and compounding frequency.',
      'Choose whether monthly contributions arrive at the beginning or end of each month.',
      'Review the final balance, interest earned, annual chart, and year-by-year projection as they update.',
    ],
    sections: [
      {
        heading: 'Compound interest formula and monthly contributions',
        body: 'For a single starting amount, the standard nominal-rate formula is A = P × (1 + r ÷ n)^(n × t). P is the starting amount, r is the annual rate as a decimal, n is the number of compounding periods in a year, and t is the number of years. A 5% nominal rate compounded monthly has a monthly multiplier of 1 + 0.05 ÷ 12. This calculator applies the matching monthly growth factor to every balance, so a monthly contribution added earlier has more time to grow than one added near the end. It reports the final balance, total amount contributed, and the difference as projected interest.',
      },
      {
        heading: 'Annual rate, compounding frequency, and effective rate',
        body: 'The annual interest rate in this calculator is a nominal annual rate. Its effective annual rate is (1 + r ÷ n)^n − 1, where n is the selected compounding frequency. At the same 5% nominal rate, annual compounding has a 5.00% effective rate while monthly compounding is about 5.12%. The difference is real but usually much smaller than the effect of the rate itself, regular saving, and time. Daily compounding here uses 365 compounding periods per year; a bank may use a different daily-balance convention.',
      },
      {
        heading: 'How to read a compound-growth estimate',
        body: 'A projection is a scenario, not a guarantee. This tool holds the rate constant and assumes that every planned monthly contribution is made. It does not subtract tax, account fees, fund expenses, withdrawals, inflation, or changes in investment value. Choose Beginning when the deposit reaches the account at the start of each month and End when it arrives after that month’s growth; the beginning option gives each deposit one additional month of growth. Compare more than one rate and contribution amount before using a result for a financial decision, then check the actual account’s terms and crediting method.',
      },
    ],
    faq: [
      {
        q: 'What is the compound interest formula?',
        a: 'For a starting amount with a nominal annual rate, the compound-interest formula is A = P × (1 + r ÷ n)^(n × t), where P is the starting amount, r is the annual rate as a decimal, n is compounds per year, and t is years. Monthly contributions are separate deposits that begin growing when they are added.',
      },
      {
        q: 'Does monthly compounding pay more than annual compounding?',
        a: 'At the same positive nominal annual rate, monthly compounding produces a slightly higher effective annual rate than annual compounding. For example, 5% compounded annually stays 5.00% effective, while 5% compounded monthly is about 5.12% effective before taxes and fees.',
      },
      {
        q: 'Should I use beginning or end of month for contributions?',
        a: 'Use Beginning when each contribution reaches the account before that month’s growth and End when it arrives after the month’s growth. Beginning-of-month deposits receive one additional month of modeled growth, so their projected final balance is higher at any positive rate.',
      },
      {
        q: 'Does this calculator account for tax, inflation, or fees?',
        a: 'No. This calculator uses a constant gross rate and excludes tax, inflation, account fees, fund expenses, withdrawals, and rate changes. Those factors can materially reduce or change a real account’s outcome, so the result is an estimate rather than financial advice.',
      },
      {
        q: 'Are my savings figures sent to a server?',
        a: 'No. The projection runs in your browser. The numbers are saved only in that browser’s local storage so the form can be restored when you return; they are not sent to a server.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '복리 계산기 — 월 적립식·성장 그래프',
    description:
      '초기 투자금과 매월 적립금을 넣어 복리 수익을 계산하세요. 최종 금액, 연도별 성장 그래프, 적립·이자 내역이 입력 즉시 브라우저에서 갱신됩니다.',
    h1: '복리 계산기',
    tagline:
      '초기 투자금과 월 적립금을 함께 계산하고, 연도별 자산 성장 그래프와 적립·이자 내역을 바로 확인합니다. 입력값은 기기 밖으로 전송되지 않습니다.',
    name: '복리 계산기',
    keywords: [
      '복리 계산기',
      '적립식 복리 계산기',
      '월복리 계산기',
      '월 적립식 투자 계산기',
      '복리 수익 계산',
      '자산 성장 시뮬레이션',
    ],
    howTo: [
      '처음 넣을 금액을 초기 투자금에 입력합니다.',
      '매달 추가할 금액을 월 적립금에 입력하고, 일시 투자라면 0을 입력합니다.',
      '연 수익률, 투자 기간, 이자가 붙는 주기를 선택합니다.',
      '매달 납입하는 시점이 월초인지 월말인지 고릅니다.',
      '최종 금액, 복리 수익, 성장 그래프, 연도별 내역을 입력 즉시 확인합니다.',
    ],
    sections: [
      {
        heading: '복리 계산식과 월 적립금',
        body: '초기 투자금만 있을 때 명목 연이율 기준 복리 계산식은 A = P × (1 + r ÷ n)^(n × t)입니다. P는 초기 투자금, r은 소수로 바꾼 연이율, n은 1년 동안 이자가 붙는 횟수, t는 기간(년)입니다. 예를 들어 연 5%를 월복리로 계산하면 한 달 성장 배수는 1 + 0.05 ÷ 12입니다. 이 계산기는 매달 넣는 금액도 납입된 시점부터 같은 월간 성장 배수를 적용하므로 먼저 넣은 적립금일수록 더 오래 복리 효과를 받습니다. 최종 금액에서 내가 넣은 총액을 빼면 예상 이자·수익입니다.',
      },
      {
        heading: '연이율·복리 주기·실효 연수익률',
        body: '이 도구의 연이율은 명목 연이율입니다. 실효 연수익률은 (1 + r ÷ n)^n − 1로 계산하며, n은 선택한 복리 주기입니다. 같은 연 5%라도 연복리의 실효 연수익률은 5.00%, 월복리는 약 5.12%입니다. 다만 복리 주기 차이보다 수익률 자체, 매달 넣는 금액, 투자 기간이 결과에 미치는 영향이 더 큰 경우가 많습니다. 일복리는 1년을 365회로 가정하며, 실제 금융상품은 일수 계산 방식이나 이자 지급일이 다를 수 있습니다.',
      },
      {
        heading: '복리 시뮬레이션 결과 읽는 법',
        body: '복리 계산 결과는 일정한 조건을 둔 예상치이며 수익을 보장하지 않습니다. 이 도구는 수익률이 기간 내내 같고 매달 계획한 금액을 빠짐없이 납입한다고 가정합니다. 세금, 수수료, 펀드 보수, 인출, 물가, 금리 변동, 투자 손실은 반영하지 않습니다. 월초 납입은 그 달 성장 전에 돈이 들어오는 경우, 월말 납입은 그 달 성장 뒤에 들어오는 경우로 선택합니다. 양의 수익률에서는 월초 납입이 매달 한 달씩 더 운용되므로 결과가 더 커집니다. 실제 상품을 비교할 때는 약관의 이자 계산 방식과 비용을 함께 확인해야 합니다.',
      },
    ],
    faq: [
      {
        q: '복리 계산은 어떻게 하나요?',
        a: '초기 투자금의 복리 계산식은 A = P × (1 + r ÷ n)^(n × t)입니다. P는 초기 투자금, r은 소수 연이율, n은 연간 복리 횟수, t는 연수입니다. 월 적립금은 매달 별도로 들어와 납입된 뒤부터 복리로 늘어나므로 먼저 납입한 금액이 더 오래 성장합니다.',
      },
      {
        q: '월복리와 연복리는 얼마나 차이 나나요?',
        a: '같은 양의 명목 연이율이라면 월복리가 연복리보다 실효 연수익률이 조금 높습니다. 예를 들어 연 5%는 연복리일 때 5.00%지만 월복리일 때 약 5.12%입니다. 다만 투자 기간, 수익률, 월 적립금이 최종 금액에 더 크게 작용할 수 있습니다.',
      },
      {
        q: '월초 납입과 월말 납입은 무엇을 골라야 하나요?',
        a: '월초 납입은 적립금이 그 달의 성장 전에 계좌에 들어오는 경우이고, 월말 납입은 그 달의 성장 후에 들어오는 경우입니다. 양의 수익률에서는 월초 납입금이 매달 한 달 더 운용되므로 같은 조건이면 월말 납입보다 최종 금액이 더 큽니다.',
      },
      {
        q: '복리 계산기에 세금과 수수료도 반영되나요?',
        a: '아니요. 이 계산기는 일정한 세전 수익률만 적용하며 세금, 수수료, 펀드 보수, 물가, 인출, 손실, 금리 변동은 반영하지 않습니다. 실제 예금·적금·투자 상품의 수령액은 이 비용과 상품별 이자 계산 방식에 따라 달라질 수 있습니다.',
      },
      {
        q: '입력한 투자금과 적립금이 서버로 전송되나요?',
        a: '아니요. 계산은 모두 브라우저에서 이뤄집니다. 입력값은 다시 방문했을 때 복원할 수 있도록 현재 브라우저의 로컬 저장소에만 저장되며 서버로 전송되지 않습니다.',
      },
    ],
    ui: {
      intro: '값을 바꾸면 예상 금액, 연도별 그래프, 적립 내역이 즉시 다시 계산됩니다.',
      autosaved: '입력값은 이 브라우저에 저장됩니다',
      principalLabel: '초기 투자금',
      principalHint: '원 단위로 입력하세요. 결과도 같은 단위로 표시됩니다.',
      monthlyContributionLabel: '월 적립금',
      monthlyContributionHint: '일시 투자만 계산하려면 0을 입력하세요.',
      rateLabel: '연 수익률(%)',
      rateHint: '0%부터 100%까지의 일정한 명목 연이율입니다.',
      yearsLabel: '투자 기간(년)',
      yearsHint: '1년부터 100년까지의 정수를 입력하세요.',
      frequencyLabel: '복리 주기',
      frequencyHint: '입력한 연이율에 이자가 붙는 횟수입니다.',
      annual: '연복리',
      quarterly: '분기복리',
      monthly: '월복리',
      daily: '일복리',
      timingLabel: '월 적립 시점',
      timingHint: '매달 적립금이 계좌에 들어오는 시점을 고르세요.',
      beginningOfMonth: '월초',
      endOfMonth: '월말',
      invalidInput: '금액은 0 이상, 연 수익률은 0%~100% 사이, 투자 기간은 1~100년의 정수로 입력하세요.',
      resultsHeading: '예상 자산',
      finalBalance: '최종 금액',
      totalInterest: '예상 이자·수익',
      totalContributions: '총 납입액',
      effectiveAnnualRate: '실효 연수익률',
      chartHeading: '연도별 성장 그래프',
      chartDescription: '매년 말 예상 잔액을 막대로 나타낸 그래프입니다.',
      assumption:
        '예상치입니다. 일정한 수익률과 월 적립을 가정하며 세금, 수수료, 수익률 변동, 상품별 반올림은 반영하지 않습니다.',
      scheduleHeading: '연도별 예상 내역',
      scheduleHint: '매년 말 기준 잔액, 내가 납입한 금액, 누적 이자·수익을 비교하세요.',
      showSchedule: '전체 {count}년 내역 보기',
      hideSchedule: '내역 닫기',
      year: '연도',
      balance: '예상 잔액',
      contributions: '누적 납입액',
      interest: '누적 이자·수익',
    },
  },
};
