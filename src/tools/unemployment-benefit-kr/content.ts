import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  intro: 'For standard employees who separate in 2026. No date of birth or ID number is needed.',
  autosaved: 'Saved in this browser only',
  wageHeading: 'Pay and working hours',
  averageDailyWageLabel: 'Average daily wage before leaving (KRW)',
  averageDailyWageHint: 'Use the average daily wage on your employment-separation confirmation when available.',
  ordinaryDailyWageLabel: 'Daily ordinary wage, if known (KRW)',
  ordinaryDailyWageHint: 'Enter 0 if unknown. A higher ordinary wage is used as the statutory base.',
  hoursLabel: 'Contracted hours per day',
  hoursHint: 'The 2026 statutory floor is 80% of ₩10,320 × these hours.',
  coverageHeading: 'Employment Insurance record',
  insuranceMonthsLabel: 'Qualifying coverage (whole months)',
  insuranceMonthsHint:
    'Enter coverage counted for this claim; earlier benefit claims and gaps over 3 years can change it.',
  insuredDaysLabel: 'Insured-unit days in the look-back period',
  insuredDaysHint: '180 paid-base days are required; this is not always six calendar months.',
  ageLabel: 'Age or disability at separation',
  under50: 'Under 50',
  over50OrDisabled: '50+ or disabled',
  eligibilityHeading: 'High-level eligibility checks',
  eligibleSeparation: 'My separation reason is not disqualifying',
  seekingWork: 'I am unemployed, able to work, and actively seeking work',
  resultsHeading: '2026 estimated job-seeker’s allowance',
  total: 'Estimated total if eligible',
  dailyBenefit: 'Daily benefit',
  benefitDays: 'Prescribed benefit days',
  floor: '2026 daily floor',
  cap: '2026 daily cap',
  wageRate: '60% of applicable daily base',
  likelyEligible:
    'The three high-level checks you entered are met. Confirm the final decision with Employment Insurance.',
  notLikelyEligible:
    'At least one high-level condition is not met. The amount below is only the amount that would apply if eligibility is recognized.',
  insuredDaysMet: '180 insured-unit days entered',
  insuredDaysNotMet: 'Fewer than 180 insured-unit days entered',
  separationMet: 'Non-disqualifying separation selected',
  separationNotMet: 'Separation reason needs official review',
  seekingWorkMet: 'Unemployed and seeking-work condition selected',
  seekingWorkNotMet: 'Unemployed and seeking-work condition not selected',
  formulaHeading: 'Calculation basis',
  dailyFormula: 'Applicable daily base {base} × 60% = {rate} → floor {floor} → cap {cap}',
  totalFormula: '{daily} × {days} days = {total}',
  floorApplied: 'The 2026 hourly minimum-wage floor is applied.',
  wageApplied: '60% of the applicable daily base is applied.',
  capApplied: 'The 2026 statutory daily cap is applied.',
  estimateNotice:
    'Reference estimate for ordinary employees only. Day workers, artists, labour providers, self-employed people, justified voluntary resignations, and special waiting periods need the official Work24 simulator or an Employment Center.',
  invalidInput:
    'Enter positive whole numbers: 1–8 daily hours, 0–1,200 coverage months, and 0–10,000 insured-unit days.',
  copy: 'Copy estimate',
  copied: 'Copied',
  reset: 'Reset',
  won: ' KRW',
  days: ' days',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Korea Unemployment Benefit Calculator — 2026 Rules and Eligibility',
    description:
      'Estimate 2026 Korean job-seeker’s allowance with the ₩68,100 daily cap, hourly floor, benefit days, and key eligibility checks. No ID number or upload.',
    h1: 'Korea Unemployment Benefit Calculator',
    tagline:
      'Check the 2026 daily floor, ₩68,100 cap, benefit days, and basic eligibility—without entering a birth date.',
    name: 'Korea Unemployment Benefit Calculator',
    keywords: [
      'Korea unemployment benefit calculator',
      'Korean job seeker allowance',
      '실업급여 계산기',
      '구직급여 계산',
    ],
    howTo: [
      'Enter the daily average wage from your employment-separation confirmation or final three-month records, plus a known daily ordinary wage if it is higher.',
      'Set the daily contracted hours used to calculate the part-time statutory floor.',
      'Enter qualifying Employment Insurance coverage and insured-unit days, then choose the age/disability group.',
      'Confirm the three high-level eligibility checks and read the daily amount, prescribed days, and total estimate.',
    ],
    sections: [
      {
        heading: '2026 daily amount: 60%, a floor, and a cap',
        body: 'For an ordinary employee, the Employment Insurance Act sets the job-seeker’s daily benefit at 60% of the applicable daily base. A verified daily ordinary wage replaces a lower average daily wage, while the 2026 daily base itself is capped at ₩113,500. The resulting benefit has a ₩68,100 daily cap for people who separate on or after January 1, 2026. The 2026 minimum wage is ₩10,320 per hour, so the daily floor is 80% × ₩10,320 × contracted hours: ₩66,048 at 8 hours and ₩33,024 at 4 hours. Sources checked October 23, 2026: Ministry of Employment and Labor’s December 16, 2025 Employment Insurance Enforcement Decree release, August 5, 2025 minimum-wage notice, and July 10, 2026 MOEL 1350 guidance.',
      },
      {
        heading: 'How many days can be paid?',
        body: 'The prescribed benefit period depends on Employment Insurance coverage and age at separation. Under 50, it is 120 days below 1 year, 150 days for 1–3 years, 180 days for 3–5 years, 210 days for 5–10 years, and 240 days for 10 years or more. For people aged 50 or over, or registered disabled people, the same bands are 120, 180, 210, 240, and 270 days. Even when prescribed days remain, payment generally must be received within 12 months after separation. Sources checked October 23, 2026: Employment Insurance Act Articles 48 and 50 and Appendix 1, and the Ministry of Government Legislation’s Easy Law guide to job-seeker’s allowance.',
      },
      {
        heading: 'What this estimate cannot decide',
        body: 'A general estimate cannot approve eligibility. Employment Insurance Act Article 40 requires at least 180 insured-unit days in the usual 18-month look-back period, unemployment despite ability and willingness to work, a non-disqualifying separation reason, and active re-employment effort. Paid-base days are not automatically the same as six calendar months. Earlier coverage is generally combined when the next insured job starts within three years, unless benefits were already paid for that earlier period. Sources checked October 23, 2026: Employment Insurance Act Articles 40 and 50, the Easy Law guide, and the official Work24 benefit simulator (work24.go.kr).',
      },
    ],
    faq: [
      {
        q: 'What is the Korean unemployment benefit maximum in 2026?',
        a: 'For an ordinary employee who leaves in 2026, the statutory maximum job-seeker’s allowance is ₩68,100 per day. The calculator applies this cap after calculating 60% of the applicable daily base and comparing it with the statutory minimum; earlier separation years have different caps.',
      },
      {
        q: 'What is the 2026 minimum unemployment benefit in Korea?',
        a: 'The 2026 daily minimum is 80% of ₩10,320 times the daily contracted hours: ₩66,048 for 8 hours and ₩33,024 for 4 hours. The amount can differ for special employment types and individual official determinations.',
      },
      {
        q: 'Do six months of work guarantee Korean unemployment benefit?',
        a: 'No. The ordinary requirement is at least 180 insured-unit days in the applicable look-back period, not simply six calendar months. Unpaid days and the exact paid-base record can mean six months does not reach 180 days.',
      },
      {
        q: 'How long is Korean unemployment benefit paid?',
        a: 'Ordinary employees receive 120 to 270 prescribed benefit days depending on qualifying Employment Insurance coverage and whether they are under 50 or are 50 or over or registered disabled. The payment period normally starts after a 7-day waiting period and must be used within the statutory benefit period.',
      },
      {
        q: 'Does this calculator send my wage or eligibility information to a server?',
        a: 'No. The calculator runs in your browser and stores its optional restore state only in that browser. It does not ask for a birth date, resident-registration number, or account and does not send your entries to Betterbit.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '실업급여 조건·계산법 — 2026 상한액·하한액·수급기간',
    description:
      '2026년 실업급여 조건과 계산법을 확인하세요. 1일 상한액 68,100원, 소정근로시간별 하한액, 가입기간·연령별 수급기간을 바로 계산합니다.',
    h1: '실업급여 계산기',
    tagline: '2026년 상한액·하한액, 예상 수급일수와 기본 수급 요건을 주민번호 없이 바로 확인합니다.',
    name: '실업급여 계산기',
    keywords: ['실업급여 계산', '구직급여 계산기', '실업급여 수급일수', '실업급여 상한액', '고용보험 실업급여'],
    howTo: [
      '이직확인서 또는 퇴직 전 3개월 자료에서 확인한 1일 평균임금을 입력하고, 더 높은 1일 통상임금을 알고 있으면 함께 입력합니다.',
      '이직 당시 1일 소정근로시간을 선택해 단시간 근로자 하한액을 반영합니다.',
      '합산 가능한 고용보험 가입기간과 피보험단위기간을 입력하고 연령·장애 구분을 고릅니다.',
      '세 가지 기본 수급 요건을 확인한 뒤 1일 금액, 소정급여일수, 총 예상액과 적용 근거를 봅니다.',
    ],
    sections: [
      {
        heading: '2026년 실업급여 1일 금액: 60%, 하한액, 상한액',
        body: '일반 근로자의 구직급여일액은 적용 1일 기초금액의 60%입니다. 확인한 1일 통상임금이 평균임금보다 높으면 통상임금을 쓰되, 2026년 1월 1일 이후 이직자는 기초일액을 최대 113,500원으로 제한해 1일 상한액이 68,100원입니다. 2026년 최저임금 10,320원의 80%에 1일 소정근로시간을 곱한 하한액은 1~8시간 순서대로 8,256원, 16,512원, 24,768원, 33,024원, 41,280원, 49,536원, 57,792원, 66,048원입니다. 출처: 고용노동부 2025-12-16 「고용보험법 시행령 등 국무회의 의결」, 2025-08-05 「2026년 적용 최저임금 시간급 10,320원」, 고용노동부 1350의 2026-07-10 안내(2026-10-23 확인).',
      },
      {
        heading: '소정급여일수는 가입기간과 연령으로 정해집니다',
        body: '50세 미만은 고용보험 가입기간이 1년 미만이면 120일, 1~3년 미만 150일, 3~5년 미만 180일, 5~10년 미만 210일, 10년 이상 240일입니다. 50세 이상 또는 장애인은 같은 구간에서 120일, 180일, 210일, 240일, 270일입니다. 이직 다음 날부터 12개월이 지나면 소정급여일수가 남아도 받을 수 없습니다. 이전 피보험자격 상실 후 3년 이내에 다시 취득하면 이전 기간을 합산하되, 그 기간으로 구직급여를 받았다면 제외합니다. 출처: 「고용보험법」 제48조·제50조·별표 1, 법제처 찾기쉬운 생활법령 「구직급여」, 고용노동부 1350의 2026-07-10 안내(2026-10-23 확인).',
      },
      {
        heading: '계산기로 확정할 수 없는 수급자격',
        body: '「고용보험법」 제40조의 일반 요건은 통상 이직 전 18개월 기준기간의 피보험단위기간 180일 이상, 근로 의사·능력이 있으나 미취업 상태, 제한 사유에 해당하지 않는 이직 사유, 적극적인 재취업 노력입니다. 피보험단위기간은 보수 지급의 기초가 된 날을 합산하므로 달력상 6개월과 같지 않을 수 있습니다. 일용근로자·예술인·노무제공자·자영업자, 정당한 자발적 퇴사와 대기기간 특례는 별도 기준이 적용됩니다. 출처: 「고용보험법」 제40조, 고용24 공식 「실업급여 모의계산」(work24.go.kr, 2026-10-23 확인).',
      },
    ],
    faq: [
      {
        q: '2026년 실업급여 1일 상한액은 얼마인가요?',
        a: '2026년 이직한 일반 근로자의 구직급여 1일 상한액은 68,100원입니다. 이 계산기는 적용 1일 기초금액의 60%와 하한액을 비교한 뒤 68,100원을 넘지 않도록 계산합니다. 이전 연도 이직자는 상한액이 다릅니다.',
      },
      {
        q: '2026년 실업급여 하한액은 얼마인가요?',
        a: '2026년 일반 근로자의 1일 하한액은 시간당 최저임금 10,320원의 80%에 이직 당시 1일 소정근로시간을 곱한 금액입니다. 8시간 기준 66,048원이고, 4시간 기준 33,024원입니다.',
      },
      {
        q: '6개월 일하면 실업급여를 받을 수 있나요?',
        a: '단순히 달력상 6개월을 일했다고 자동으로 수급자격이 생기지는 않습니다. 일반적으로 이직 전 기준기간에 피보험단위기간을 합산해 180일 이상이어야 하며, 무급휴일 등을 제외한 실제 피보험단위기간을 고용보험 기록으로 확인해야 합니다.',
      },
      {
        q: '실업급여는 며칠 동안 받을 수 있나요?',
        a: '일반 근로자의 소정급여일수는 고용보험 가입기간과 이직 당시 연령·장애 여부에 따라 120~270일입니다. 다만 이직 다음 날부터 12개월 안에 받아야 하며, 그 뒤에는 남은 소정급여일수가 있어도 지급되지 않습니다.',
      },
      {
        q: '입력한 임금이나 수급 정보가 서버로 전송되나요?',
        a: '아니요. 계산은 브라우저 안에서 실행되고 입력값은 새로고침 뒤에도 이어서 쓸 수 있도록 현재 브라우저 저장소에만 보관됩니다. 주민등록번호·생년월일·계정은 받지 않으며 입력값을 Betterbit 서버로 전송하지 않습니다.',
      },
    ],
    ui: {
      intro: '2026년에 이직한 일반 근로자용 참고 계산입니다. 생년월일·주민등록번호를 입력하지 않습니다.',
      autosaved: '이 브라우저에만 저장됨',
      wageHeading: '임금과 근로시간',
      averageDailyWageLabel: '이직 전 1일 평균임금(원)',
      averageDailyWageHint: '가능하면 이직확인서에 기재된 1일 평균임금을 입력합니다.',
      ordinaryDailyWageLabel: '확인한 1일 통상임금(원)',
      ordinaryDailyWageHint: '모르면 0을 입력합니다. 평균임금보다 높으면 통상임금을 기초로 사용합니다.',
      hoursLabel: '이직 당시 1일 소정근로시간',
      hoursHint: '2026년 하한액은 10,320원 × 80% × 입력 시간으로 계산합니다.',
      coverageHeading: '고용보험 가입 이력',
      insuranceMonthsLabel: '합산 대상 가입기간(개월)',
      insuranceMonthsHint: '이번 수급에 합산되는 기간을 입력합니다. 이전 수급 이력·3년 이상 공백은 달라질 수 있습니다.',
      insuredDaysLabel: '기준기간 피보험단위기간(일)',
      insuredDaysHint: '180일 이상이 필요하며, 달력상 6개월과 항상 같지는 않습니다.',
      ageLabel: '이직 당시 연령·장애 구분',
      under50: '50세 미만',
      over50OrDisabled: '50세 이상·장애인',
      eligibilityHeading: '기본 수급 요건 확인',
      eligibleSeparation: '이직 사유가 수급 제한 사유에 해당하지 않음',
      seekingWork: '미취업 상태이며 근로 의사·능력과 재취업 노력이 있음',
      resultsHeading: '2026년 구직급여 예상액',
      total: '수급자격 인정 시 총 예상액',
      dailyBenefit: '1일 구직급여',
      benefitDays: '소정급여일수',
      floor: '2026년 1일 하한액',
      cap: '2026년 1일 상한액',
      wageRate: '적용 1일 기초금액의 60%',
      likelyEligible: '입력한 세 가지 기본 요건은 충족합니다. 최종 수급자격은 고용보험에서 확인해야 합니다.',
      notLikelyEligible:
        '입력한 기본 요건 중 충족하지 않은 항목이 있습니다. 아래 금액은 수급자격이 인정되는 경우의 참고 예상액입니다.',
      insuredDaysMet: '피보험단위기간 180일 이상 입력',
      insuredDaysNotMet: '피보험단위기간 180일 미만 입력',
      separationMet: '제한 사유 없는 이직으로 선택',
      separationNotMet: '이직 사유를 공식 기준으로 확인해야 함',
      seekingWorkMet: '미취업·구직활동 요건으로 선택',
      seekingWorkNotMet: '미취업·구직활동 요건을 선택하지 않음',
      formulaHeading: '계산 근거',
      dailyFormula: '적용 1일 기초금액 {base} × 60% = {rate} → 하한액 {floor} → 상한액 {cap}',
      totalFormula: '{daily} × {days}일 = {total}',
      floorApplied: '2026년 최저임금 연동 하한액을 적용했습니다.',
      wageApplied: '적용 1일 기초금액의 60%를 적용했습니다.',
      capApplied: '2026년 법정 1일 상한액을 적용했습니다.',
      estimateNotice:
        '일반 근로자용 참고 계산입니다. 일용근로자·예술인·노무제공자·자영업자, 정당한 자발적 퇴사, 대기기간 특례는 고용24 모의계산 또는 관할 고용센터에서 확인하세요.',
      invalidInput:
        '1일 소정근로시간은 1~8시간의 정수, 가입기간은 0~1,200개월, 피보험단위기간은 0~10,000일의 정수로 입력하세요.',
      copy: '예상액 복사',
      copied: '복사됨',
      reset: '초기화',
      won: '원',
      days: '일',
    },
  },
};
