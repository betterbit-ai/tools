import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  intro: 'Change a number to update the payment estimate and repayment schedule instantly.',
  autosaved: 'Saved in this browser',
  principalLabel: 'Loan amount',
  principalHint: 'Use any currency consistently; results use the same unit.',
  rateLabel: 'Annual interest rate (%)',
  rateHint: 'Nominal annual rate, divided by 12 for monthly payments.',
  termLabel: 'Repayment term (months)',
  termHint: '1 to 600 months.',
  methodLabel: 'Repayment method',
  amortized: 'Equal payment',
  equalPrincipal: 'Equal principal',
  bullet: 'Interest-only',
  invalidInput:
    'Enter a loan amount above 0, an annual rate from 0% to 100%, and a whole number of months from 1 to 600.',
  resultsHeading: 'Estimated repayment',
  firstPayment: 'First monthly payment',
  lastPayment: 'Final monthly payment',
  totalInterest: 'Total interest',
  totalPayment: 'Total repayment',
  calculationAssumption:
    'Monthly schedule using annual rate ÷ 12. Lender rounding, fees, and daily interest rules can change the actual amount.',
  scheduleHeading: 'Repayment schedule',
  showSchedule: 'Show all {count} payments',
  hideSchedule: 'Hide schedule',
  scheduleHint: 'Each row separates the payment into principal and interest.',
  month: 'Month',
  payment: 'Payment',
  principal: 'Principal',
  interest: 'Interest',
  balance: 'Balance',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Loan Calculator — 3 Repayment Methods + Schedule',
    description:
      'Estimate monthly payments, total interest, and a repayment schedule for equal-payment, equal-principal, or interest-only loans. Updates instantly in your browser.',
    h1: 'Loan Calculator',
    tagline:
      'Compare three repayment methods and see each payment split into principal and interest — instantly, without sending your figures anywhere.',
    name: 'Loan Calculator',
    keywords: [
      'loan calculator',
      'monthly payment calculator',
      'loan repayment calculator',
      'amortization calculator',
      'loan interest calculator',
      'payment schedule',
      'equal principal loan calculator',
    ],
    howTo: [
      'Enter the amount you plan to borrow in your chosen currency.',
      'Enter the nominal annual interest rate and the repayment term in whole months.',
      'Choose Equal payment, Equal principal, or Interest-only repayment.',
      'Review the first payment, final payment, total interest, and total repayment as they update.',
      'Open the repayment schedule to inspect the principal, interest, and remaining balance for every month.',
    ],
    sections: [
      {
        heading: 'How the monthly loan payment is calculated',
        body: 'For an equal-payment loan, the monthly payment is P × r ÷ (1 − (1 + r)^−n), where P is the opening principal, r is the monthly rate (annual rate ÷ 12 ÷ 100), and n is the number of monthly payments. The payment stays almost constant, but its makeup changes: interest is calculated from the remaining balance, so the interest share falls and the principal share rises over time. At a 0% rate, the calculation simply divides the principal by the number of months.',
      },
      {
        heading: 'Equal payment, equal principal, and interest-only repayment',
        body: 'Equal payment (often called amortizing repayment) makes budgeting simpler because the regular payment is level. Equal principal repays the same principal amount every month, so payments start higher and fall as interest drops; with the same positive rate and term, it produces less total interest because the balance falls faster. Interest-only repayment keeps the principal unchanged during the term, so each regular payment is interest only and the whole principal is due in the final month. At a positive rate, it produces the highest total interest of these three methods and requires planning for the final lump sum. At 0%, all three methods have zero interest.',
      },
      {
        heading: 'Why your lender’s figure can differ',
        body: 'This calculator uses a monthly rate equal to the stated annual rate divided by 12 and does not include fees, insurance, taxes, prepayment charges, or rate changes. Lenders can instead accrue interest by actual days in a month, use 30/360 conventions, round each monthly payment to the smallest currency unit, or apply a different first-payment date. Use the schedule to compare offers, then check the lender’s disclosure and loan agreement for the contractual payment and annual percentage rate (APR).',
      },
    ],
    faq: [
      {
        q: 'What is the formula for a monthly loan payment?',
        a: 'For a standard equal-payment loan, the monthly payment is P × r ÷ (1 − (1 + r)^−n): P is the loan amount, r is the annual rate ÷ 12 ÷ 100, and n is the number of monthly payments. A $10,000 loan at 6% for 12 months has a calculated payment of about $860.66 before lender-specific rounding or fees.',
      },
      {
        q: 'Which repayment method has the lowest total interest?',
        a: 'For the same principal, positive fixed rate, and term, equal-principal repayment has the lowest total interest among these three methods because it reduces the balance by the same amount from the first month. Interest-only repayment has the highest total interest because the principal remains unchanged until the final payment. At a 0% rate, all three methods have zero interest.',
      },
      {
        q: 'Does an interest-only loan pay off the principal?',
        a: 'An interest-only loan pays no principal during its regular interest-only period, so the original balance remains due in the final month in this calculator. For example, a $10,000 loan at 6% costs $50 in monthly interest, then requires $10,050 in the final month of a 12-month term.',
      },
      {
        q: 'Why is my lender’s monthly payment different from this estimate?',
        a: 'A lender may calculate interest by actual days, round each instalment, include fees or insurance, set a nonstandard first payment date, or change a variable rate. This calculator uses annual rate ÷ 12 and excludes those charges, so its result is an estimate rather than a loan offer.',
      },
      {
        q: 'Does this loan calculator store or send my financial information?',
        a: 'No. The calculation runs in your browser and the amount, rate, term, and selected method are saved only in this browser’s local storage for convenience; they are not sent to a server.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '대출 이자 계산기 — 3가지 상환방식·상환표',
    description:
      '원리금균등·원금균등·만기일시 상환의 월 납입액, 총이자, 월별 상환표를 입력 즉시 계산합니다. 입력값은 브라우저 안에서만 처리됩니다.',
    h1: '대출 이자 계산기',
    tagline:
      '원리금균등·원금균등·만기일시 상환을 바꿔 보며 월 납입액과 원금·이자 상환표를 즉시 확인하세요. 입력값은 기기 밖으로 전송되지 않습니다.',
    name: '대출 이자 계산기',
    keywords: [
      '대출 이자 계산기',
      '대출 계산기',
      '대출 상환 계산기',
      '원리금균등 계산기',
      '원금균등 계산기',
      '만기일시상환 계산기',
      '대출 상환표',
      '월 상환액 계산',
    ],
    howTo: [
      '빌릴 금액을 원 단위로 입력하세요.',
      '연 이자율과 상환 기간(개월)을 입력하세요.',
      '원리금균등, 원금균등, 만기일시 중 상환 방식을 고르세요.',
      '첫 달·마지막 달 납입액, 총이자, 총상환액을 바로 확인하세요.',
      '상환표를 열어 매달 원금과 이자가 각각 얼마인지, 잔액이 얼마나 남는지 확인하세요.',
    ],
    sections: [
      {
        heading: '원리금균등상환의 월 납입액 공식',
        body: '원리금균등상환의 월 납입액은 원금 P × 월이율 r ÷ (1 − (1 + r)^−n)으로 계산합니다. 여기서 P는 대출원금, r은 연이율 ÷ 12 ÷ 100으로 구한 월이율, n은 총 상환 개월 수입니다. 매월 내는 금액은 거의 같지만 잔액에 이자가 붙으므로 초반에는 이자 비중이 크고, 시간이 갈수록 원금 비중이 커집니다. 금리가 0%이면 원금을 개월 수로 단순히 나눕니다.',
      },
      {
        heading: '원리금균등·원금균등·만기일시의 차이',
        body: '원리금균등은 매달 납입액이 일정해 생활비 계획을 세우기 편합니다. 원금균등은 매달 갚는 원금이 같아 초반 납입액은 더 크지만, 잔액이 더 빨리 줄어 같은 원금·양의 금리·기간에서는 총이자가 가장 적습니다. 만기일시는 기간 중 이자만 내고 마지막 달에 원금을 한 번에 갚으므로 월 부담은 작아 보이지만, 양의 금리에서는 세 방식 중 총이자가 가장 크고 만기 원금을 따로 준비해야 합니다. 금리가 0%이면 세 방식 모두 이자가 0원입니다.',
      },
      {
        heading: '은행 계산과 차이가 날 수 있는 이유',
        body: '이 계산기는 연이율을 12로 나눈 월이율과 월 단위 납입을 기준으로 하며, 취급수수료·보증료·인지세·중도상환수수료·보험료·변동금리는 넣지 않습니다. 실제 금융회사는 실제 일수, 30/360 방식, 납입일, 월별 원 단위 반올림을 적용할 수 있어 몇 원 이상 차이가 날 수 있습니다. 대출 비교에는 이 상환표를 쓰되, 계약 전에는 금융회사가 제공한 상환스케줄과 대출약정서의 금리·수수료를 확인하세요.',
      },
    ],
    faq: [
      {
        q: '대출 원리금균등상환은 어떻게 계산하나요?',
        a: '원리금균등상환의 월 납입액은 원금 P × 월이율 r ÷ (1 − (1 + r)^−n)입니다. 월이율은 연이율 ÷ 12 ÷ 100, n은 상환 개월 수입니다. 예를 들어 1,000만 원을 연 6%로 12개월 빌리면 월 납입액은 약 860,664원이며, 금융회사별 원 단위 반올림에 따라 실제 금액은 달라질 수 있습니다.',
      },
      {
        q: '원리금균등과 원금균등 중 총이자가 더 적은 것은 무엇인가요?',
        a: '같은 대출원금·양의 고정금리·기간이라면 원금을 더 빨리 줄이는 원금균등상환의 총이자가 가장 적습니다. 대신 첫 달 납입액이 원리금균등보다 크고, 매월 납입액이 점차 줄어듭니다. 금리가 0%이면 세 방식의 총이자는 모두 0원입니다.',
      },
      {
        q: '만기일시상환은 마지막에 무엇을 내나요?',
        a: '만기일시상환은 기간 중에는 원금에 대한 이자만 내고, 마지막 달에는 그 달 이자와 대출원금 전액을 함께 냅니다. 예를 들어 1,000만 원을 연 6%로 12개월 빌리면 매월 이자는 5만 원이고 마지막 달 납입액은 1,005만 원입니다.',
      },
      {
        q: '계산기 결과와 은행의 대출 상환액이 다른 이유는 무엇인가요?',
        a: '은행은 실제 일수 또는 30/360 방식, 납입일, 원 단위 반올림, 취급수수료, 보증료, 보험료, 변동금리 등을 적용할 수 있습니다. 이 계산기는 연이율 ÷ 12의 월이율과 수수료 없는 고정금리만 가정하므로 비교용 추정치로 사용해야 합니다.',
      },
      {
        q: '입력한 대출 정보가 서버로 전송되나요?',
        a: '아니요. 계산은 모두 브라우저에서 이뤄지고, 대출금·금리·기간·상환방식은 다시 열 때 편하도록 이 브라우저의 로컬 저장소에만 저장됩니다. 입력값은 서버로 전송되지 않습니다.',
      },
    ],
    ui: {
      intro: '숫자를 바꾸면 월 납입액과 상환표가 즉시 다시 계산됩니다.',
      autosaved: '입력값은 이 브라우저에 저장됩니다',
      principalLabel: '대출금액(원)',
      principalHint: '원 단위로 입력하세요.',
      rateLabel: '연 이자율(%)',
      rateHint: '연이율을 12로 나눠 월이율로 계산합니다.',
      termLabel: '상환 기간(개월)',
      termHint: '1개월부터 600개월까지 입력할 수 있습니다.',
      methodLabel: '상환 방식',
      amortized: '원리금균등',
      equalPrincipal: '원금균등',
      bullet: '만기일시',
      invalidInput: '대출금액은 0보다 크게, 연 이자율은 0%~100% 사이로, 상환 기간은 1~600개월의 정수로 입력하세요.',
      resultsHeading: '예상 상환 결과',
      firstPayment: '첫 달 납입액',
      lastPayment: '마지막 달 납입액',
      totalInterest: '총이자',
      totalPayment: '총상환액',
      calculationAssumption:
        '연이율 ÷ 12의 월이율 기준입니다. 금융회사별 일수 계산, 원 단위 반올림, 수수료에 따라 실제 금액은 달라질 수 있습니다.',
      scheduleHeading: '월별 상환표',
      showSchedule: '전체 {count}회 상환표 보기',
      hideSchedule: '상환표 닫기',
      scheduleHint: '매달 납입액 중 원금과 이자, 남은 잔액을 확인하세요.',
      month: '회차',
      payment: '납입액',
      principal: '원금',
      interest: '이자',
      balance: '잔액',
    },
  },
};
