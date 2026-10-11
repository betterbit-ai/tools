import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'loan-calculator',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'The Calculator Site — Loan Calculator With Extra Payments',
      url: 'https://www.thecalculatorsite.com/finance/calculators/loancalculator.php',
      weakness:
        'Its instructions require completing the fields and clicking “Calculate” before it shows the regular payment, total interest, payoff date, and schedule. Betterbit recalculates every result as a value changes and lets you switch among equal-payment, equal-principal, and interest-only schedules without a submit step. (Strength: it supports recurring extra payments, fees, a start date, and balloon payments.)',
    },
    {
      name: 'CalculatorSoup — Loan Calculator',
      url: 'https://www.calculatorsoup.com/calculators/financial/loan-calculator.php',
      weakness:
        'Its primary form asks the visitor to choose one calculation and returns a single monthly-payment answer; its published formula and schedule assume monthly compounding, while alternative compounding needs a separate Advanced Loan Calculator. Betterbit keeps the three common repayment structures and their complete monthly schedules in one live tool. (Strength: it can also solve for the loan amount, term, or interest rate.)',
    },
    {
      name: 'Bankrate — Loan Calculator',
      url: 'https://www.bankrate.com/loans/loan-calculator/',
      weakness:
        'Its calculator requires a “Calculate” action and focuses on one amortizing payment plan; extra payments and fees are optional configuration before the result table. Betterbit makes the structural difference between equal-payment, equal-principal, and interest-only repayment immediately switchable with no calculation button. (Strength: it models extra-payment frequency, origination fees, and other fees.)',
    },
    {
      name: '상담모아 — 대출이자계산기',
      url: 'https://sangdammoa.com/calculator/loan',
      weakness:
        '대출금·금리·기간·상환방식을 입력한 뒤 별도의 “계산하기”를 눌러야 하며, 페이지에서 원리금균등·원금균등·만기일시의 공식을 설명하지만 입력에 따라 갱신되는 월별 원금·이자 표는 노출하지 않는다. Betterbit는 입력 즉시 상환 결과를 갱신하고 선택한 방식의 전체 상환표를 연다. (장점: 거치기간을 별도로 입력할 수 있다.)',
    },
    {
      name: '스마트계산기 — 대출 이자 계산기',
      url: 'https://smartcalcs.net/ko/loan/repayment',
      weakness:
        '원리금균등·원금균등·만기일시를 제공하지만 상환방식이 하나의 드롭다운이며, 결과 영역에 “차트를 불러오는 중” 상태가 먼저 나타난다. Betterbit는 세 방식을 짧은 선택 버튼으로 바로 바꾸고 차트 대기 없이 원금·이자·잔액 표를 표시한다. (장점: 거치기간과 대출기간 단위를 함께 설정할 수 있다.)',
    },
    {
      name: '아는자산 — 대출이자 계산기',
      url: 'https://knowingasset.com/app/calculator/loan',
      weakness:
        '대출 종류, 금액, 기간, 금리, 거치기간을 고른 뒤 “대출 계산하기”를 눌러야 결과가 나온다. Betterbit는 필수 네 값과 상환방식만으로 첫 달·마지막 달·총이자·총상환액을 즉시 보여주고, 각 회차의 원금·이자를 확인할 수 있다. (장점: 주택담보·전월세·신용 등 대출 종류별 빠른 선택과 금리 설명을 제공한다.)',
    },
  ],
  related: ['percentage-calculator', 'bmi-calculator', 'salary-calculator-kr', 'compound-interest', 'random-number'],
};
