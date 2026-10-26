import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'rent-conversion-kr',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-27',
  updated: '2026-10-27',
  edges: ['accuracy', 'features', 'usability'],
  competitors: [
    {
      name: 'Calc Tani — Rent Conversion Calculator',
      url: 'https://calc-tani.com/en/rent-conversion',
      weakness:
        'The English calculator requires a Calculate click and still labels 4.75% (a 2.75% base rate) as its August 2026 default, although the Bank of Korea rate has been 3.00% since August 27, 2026. Betterbit uses the verified 5.00% ceiling, applies it only in the legally relevant direction and contract context, and updates without a submit step. (Strength: its long guide also covers deposit-return risk and loan comparisons.)',
    },
    {
      name: 'Calqu — Jeonse–Monthly Rent Converter',
      url: 'https://calqu.kr/en/finance/jeonse-monthly/',
      weakness:
        'The live English form defaults its rate field to 4.5% while the explanatory table on the same page calls 5.0% the calculator default, and a Calculate click is required. Betterbit keeps one official 2026 rules object, caps an entered 6% automatically for an existing lease, and explains the exact substituted formula. (Strength: Calqu provides worked examples and a useful base-rate/cap table.)',
    },
    {
      name: 'Oiyo — Jeonse ↔ Monthly Rent Converter',
      url: 'https://blog.oiyo.net/en/jeonse-monthly-converter/',
      weakness:
        'Its interactive default is 5.5% and its legal note only says the rate is “within base rate + 2%p,” without a current official effective date or contract-context control. Betterbit verifies the 3.00% base rate and 5.00% ceiling, distinguishes existing from new leases, and checks a quoted rent’s implied rate and excess. (Strength: it offers six languages and a simple favorable/unfavorable comparison.)',
    },
    {
      name: '부동산셈 — 전월세 전환 계산기',
      url: 'https://budongsansem.com/calculator/jeonse-monthly',
      weakness:
        '페이지와 입력 기본값이 2026년 법정 상한을 약 2.5%로 안내해, 2026년 8월 27일부터 기준금리 3.00%에 2%p를 더한 현행 5.00%와 맞지 않으며 계산하기 버튼도 눌러야 한다. Betterbit는 공식 5.00%를 즉시 적용하고 적용 이유와 제시 월세 초과액을 함께 보여준다. (장점: 임대수익률·전세 대 월세 등 부동산 관련 계산기로 바로 이어진다.)',
    },
    {
      name: '랜드토커 — 전월세 전환 계산기',
      url: 'https://landtalker.kr/tools/jeonse-to-monthly',
      weakness:
        '입력 전환율 결과와 법정 상한 결과를 나란히 보여주지만 별도 “전환 계산하기”를 눌러야 하고, 기존·갱신 계약과 신규 계약을 입력에서 구분해 상한을 자동 적용하지 않는다. Betterbit는 계약 조건을 고르면 상한 적용 여부가 자동으로 바뀌고 결과·근거가 입력 즉시 갱신된다. (장점: 입력 전환율과 법정 상한의 금액 차이를 표로 비교한다.)',
    },
    {
      name: 'fincalc — 전월세 전환 계산기',
      url: 'https://fincalc.kr/jeonse/',
      weakness:
        '현행 5.00%와 역방향의 법적 차이를 정확히 설명하지만, 계산기 입력에서는 집주인이 제시한 월세를 넣어 역산 전환율과 기존 계약 기준 월 초과액을 한 번에 판정할 수 없다. Betterbit는 제시 월세를 선택 입력으로 받아 연 6.00% 같은 숨은 조건과 원 단위 초과액을 즉시 풀이한다. (장점: 법령 출처, HUG 환산율, 지역별 시장 전환율의 용도를 상세히 구분한다.)',
    },
  ],
  related: ['loan-calculator', 'compound-interest'],
};
