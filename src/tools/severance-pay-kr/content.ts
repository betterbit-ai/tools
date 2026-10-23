import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  intro: 'Estimate statutory Korean severance from the actual final three months of pay — calculated in this browser.',
  autosaved: 'Saved in this browser',
  employmentHeading: 'Employment and eligibility',
  startDateLabel: 'First day of employment',
  lastWorkingDateLabel: 'Last working day',
  lastWorkingDateHint: 'The retirement date is the following day.',
  weeklyHoursLabel: 'Average prescribed weekly hours',
  weeklyHoursHint: 'Use the applicable four-week average. At least 15 hours is normally required.',
  wagesHeading: 'Wages for the final three months',
  wagesHint: 'Enter gross wage totals from payslips. Include only items that count as wages.',
  wageLabel: 'Wage total {number}',
  extraHeading: 'Items to add when eligible',
  annualBonusLabel: 'Eligible regular bonus in the last 12 months',
  annualBonusHint: 'One quarter (3/12) is added to the average-wage total.',
  annualLeaveLabel: 'Eligible annual-leave pay in the last 12 months',
  annualLeaveHint: 'One quarter (3/12) is added only when it belongs in average wages.',
  ordinaryWageLabel: 'Known daily ordinary wage (optional)',
  ordinaryWageHint: 'Enter 0 if unknown. A higher known amount becomes the statutory floor.',
  resultHeading: 'Estimated statutory severance',
  severancePay: 'Before-tax severance estimate',
  ineligible:
    'The entered service period or weekly hours does not meet the usual 1-year and 15-hour eligibility thresholds, so no statutory amount is shown.',
  eligible:
    'The entered dates and weekly hours meet the usual statutory eligibility thresholds. Confirm exceptional periods before relying on the estimate.',
  serviceDays: 'Days of service',
  averageWageDays: 'Days in wage period',
  averageDailyWage: 'Average daily wage',
  applicableDailyWage: 'Daily wage used',
  retirementDate: 'Retirement date',
  averageWagePeriod: 'Average-wage period',
  dateRangeSeparator: 'to',
  threeMonthWages: 'Three-month wages',
  includedBonus: 'Bonus included (3/12)',
  includedAnnualLeave: 'Leave pay included (3/12)',
  averageWageTotal: 'Total for average wage',
  formulaHeading: 'Calculation',
  formula: '{daily} × 30 × ({serviceDays} ÷ 365) = {severance}',
  invalidInput: 'Enter valid dates, amounts from 0 to 1,000,000,000,000,000, and weekly hours from 0 to 168.',
  copy: 'Copy estimate',
  copied: 'Copied',
  reset: 'Reset',
  resultNotice:
    'This is a pre-tax reference estimate. Excluded periods, wage eligibility, interim settlements, and DB/DC pension arrangements can change the actual payment.',
  won: ' KRW',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Korean Severance Pay Calculator — 2026 Rules and Formula',
    description:
      'Estimate Korean severance from three wage totals, automatic three-month dates, bonuses, leave pay, ordinary wage, and weekly-hours eligibility — all in your browser.',
    h1: 'Korean Severance Pay Calculator',
    tagline:
      'Use your final-three-month wages to check a before-tax Korean severance estimate, average wage, and basic eligibility.',
    name: 'Korean Severance Pay Calculator',
    keywords: [
      'Korean severance pay calculator',
      'Korea retirement allowance calculator',
      'Korea severance calculator',
      'toejikgeum calculator',
      'Korean average wage calculator',
      '퇴직금 계산기',
    ],
    howTo: [
      'Enter the first day of employment and the final day you worked; the calculator sets the retirement date to the next day.',
      'Enter the applicable four-week average of prescribed weekly hours to check the usual 15-hour threshold.',
      'Copy the gross wage totals from pay records for the final three-month average-wage period.',
      'Add only eligible annual regular bonuses, annual-leave pay, and a known daily ordinary wage when applicable.',
      'Review the before-tax estimate, calendar days, daily wage used, and substituted formula, then copy the result if needed.',
    ],
    sections: [
      {
        heading: 'Korean statutory severance formula and the three-month average wage',
        body: 'The statutory reference formula is daily average wage × 30 × total days of continuous service ÷ 365. Under Article 8 of the Employee Retirement Benefit Security Act, an employer must generally provide at least 30 days of average wages for each year of continuous service. Article 2 of the Labor Standards Act defines average wage as the total wages paid during the three calendar months before the reason for calculation arose, divided by the calendar days in that period. This calculator treats the day after the final working day as the retirement date, then automatically finds the preceding three calendar months. That period is normally 89 to 92 calendar days and includes weekends and holidays, not only days actually worked. Sources checked October 23, 2026: Ministry of Employment and Labor, “Severance Pay Calculation” (moel.go.kr/retirementpayCal.do), and the National Law Information Center.',
      },
      {
        heading: 'What to enter as wages, bonus, and annual-leave pay',
        body: 'Enter gross, before-tax wage totals from the final three-month period, including wage items shown in your pay records. Regular bonuses and eligible annual-leave allowance can affect the average wage: the Ministry of Employment and Labor’s official example adds 3/12 of each eligible annual total to the three-month wages. Do not assume every payment with the word “bonus,” meal, expense, or leave is a wage. Its inclusion depends on its payment basis and the applicable rules. Keep the three pay entries separate here so you can compare the total with your pay stubs before using the estimate. Source checked October 23, 2026: Ministry of Employment and Labor, “Severance Pay Calculation” (moel.go.kr/retirementpayCal.do).',
      },
      {
        heading: 'Eligibility, ordinary wage floor, and limits of this estimate',
        body: 'Under Article 4 of the Employee Retirement Benefit Security Act, the statutory retirement-benefit system generally does not apply when continuous service is under one year or prescribed weekly hours average under 15 over four weeks. The Ministry of Employment and Labor calculator also uses a verified daily ordinary wage when it exceeds the calculated average wage. This calculator does not determine excluded average-wage periods, changing-hours service periods, interrupted service, prior interim settlements, wage character, retirement-income tax, or DB/DC pension balances. Sources checked October 23, 2026: National Law Information Center, Article 4; Ministry of Employment and Labor, “Severance Pay Calculation”; and Korea Workers’ Compensation & Welfare Service, Hope Tree vol. 161.',
      },
    ],
    faq: [
      {
        q: 'How is statutory severance pay calculated in South Korea?',
        a: 'The statutory reference calculation is daily average wage × 30 × total continuous-service days ÷ 365. A worker who has at least 365 days of continuous service is generally entitled to at least 30 days of average wage for each service year, subject to the weekly-hours condition and the applicable facts.',
      },
      {
        q: 'Are the final three months counted as workdays only?',
        a: 'No. Average wage uses the total calendar days in the three months before the retirement date, including weekends and holidays. Depending on the calendar, the period is usually 89 to 92 days; this calculator determines that day count from the final working date.',
      },
      {
        q: 'Do bonuses and unused annual-leave pay affect Korean severance pay?',
        a: 'Eligible regular bonuses and eligible annual-leave allowance can be reflected in average wage, commonly by adding 3/12 of the relevant 12-month amount to the final three-month wages. Whether a specific payment is eligible depends on its character and timing, so confirm it against payroll records and the applicable rules.',
      },
      {
        q: 'Is an employee working less than 15 hours a week eligible for severance pay?',
        a: 'A worker whose prescribed weekly hours average less than 15 over four weeks is generally excluded from the statutory retirement-benefit system. The calculator flags the usual threshold but cannot decide service periods with changing hours or employment status.',
      },
      {
        q: 'Is statutory Korean severance owed for less than one year of work?',
        a: 'The statutory retirement-benefit system generally does not apply when continuous service is under one year. An employment contract, collective agreement, or company policy can provide more favorable terms, so check those separately.',
      },
      {
        q: 'Is this severance-pay result the amount that will be deposited?',
        a: 'No. This is a before-tax reference estimate. Retirement-income tax, excluded periods, a higher ordinary wage, interim settlements, pension-plan arrangements, and which payments qualify as wages can change the employer’s final payment.',
      },
      {
        q: 'Does this Korean severance calculator send my pay information to a server?',
        a: 'No. The calculation runs in the browser. The current entries are stored only in that browser to restore your work and are not sent to a server.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '퇴직금 계산법·조건 — 2026 평균임금·재직일수 계산기',
    description:
      '2026년 퇴직금 조건과 계산법을 확인하세요. 퇴직 전 3개월 임금, 상여금·연차수당, 재직일수와 통상임금을 반영해 세전 예상액을 계산합니다.',
    h1: '퇴직금 계산기',
    tagline:
      '퇴직 전 3개월의 실제 임금을 합산해 평균임금·재직일수·통상임금 하한을 함께 확인하고 세전 예상 퇴직금을 계산합니다.',
    name: '퇴직금 계산기',
    keywords: [
      '퇴직금 계산기',
      '퇴직금 계산',
      '퇴직금 평균임금',
      '퇴직금 재직일수',
      '퇴직금 상여금',
      '퇴직급여 계산기',
    ],
    howTo: [
      '입사일과 마지막 근무일을 입력합니다. 퇴직일은 마지막 근무일의 다음 날로 자동 계산됩니다.',
      '해당 근로기간의 4주 평균 주 소정근로시간을 입력해 일반적인 주 15시간 요건을 확인합니다.',
      '자동으로 정해진 퇴직 전 3개월 산정기간의 급여명세서 세전 임금 3건을 입력합니다.',
      '반영 대상인 연간 정기상여금·연차수당과 확인한 1일 통상임금이 있으면 추가합니다.',
      '세전 예상 퇴직금, 재직일수, 평균임금, 적용 1일 임금과 계산식을 확인하고 필요하면 복사합니다.',
    ],
    sections: [
      {
        heading: '퇴직금 기본 산식과 퇴직 전 3개월',
        body: '법정 퇴직금의 일반적인 산식은 1일 평균임금 × 30일 × 총 계속근로일수 ÷ 365일입니다. 「근로자퇴직급여 보장법」 제8조는 계속근로기간 1년에 대해 30일분 이상의 평균임금을 퇴직급여로 정하고, 「근로기준법」 제2조는 평균임금을 산정사유 발생일 이전 3개월 동안 지급된 임금 총액을 그 기간의 총일수로 나눈 금액으로 정의합니다. 마지막 근무일 다음 날이 퇴직일이며, 직전 3개월은 출근일이 아니라 휴일을 포함한 달력상 89~92일입니다. 출처: 고용노동부 「퇴직금 계산」(moel.go.kr/retirementpayCal.do), 국가법령정보센터 「근로자퇴직급여 보장법」·「근로기준법」(2026-10-23 확인).',
      },
      {
        heading: '3개월 임금·상여금·연차수당은 어떻게 넣나요?',
        body: '급여명세서에서 확인한 세전 임금 합계를 퇴직 전 3개월의 세 칸에 나누어 입력합니다. 기본급뿐 아니라 평균임금에 포함되는 수당 등 임금 항목을 확인해야 합니다. 고용노동부 공식 계산 예시는 반영 대상인 연간 상여금과 연차수당 총액의 3/12을 3개월 임금에 더합니다. 다만 이름이 상여금·식대·수당·연차수당이라고 해서 항상 임금으로 포함되는 것은 아니므로 지급 기준과 임금대장을 확인해야 합니다. 평균임금 산정기간에 육아휴직·업무상 재해·사용자 귀책 휴업 등이 있으면 해당 기간과 임금을 빼는 별도 계산이 필요합니다. 출처: 고용노동부 「퇴직금 계산」, 「근로기준법 시행령」 제2조(2026-10-23 확인).',
      },
      {
        heading: '대상 요건과 이 계산으로 판단할 수 없는 경우',
        body: '「근로자퇴직급여 보장법」 제4조에 따라 계속근로기간 1년 미만이거나 4주 평균 1주 소정근로시간이 15시간 미만이면 법정 퇴직급여제도 적용 대상에서 일반적으로 제외됩니다. 따라서 1년 미만 근무는 이 계산기에서 법정 예상액을 0원으로 표시합니다. 산정된 1일 평균임금이 확인한 1일 통상임금보다 낮으면 고용노동부 계산기와 같이 더 높은 통상임금을 적용합니다. 근로시간이 바뀐 기간, 중간정산, 계속근로 단절, DB·DC 퇴직연금과 세금은 별도 확인이 필요합니다. 출처: 국가법령정보센터 「근로자퇴직급여 보장법」 제4조, 근로복지공단 희망나무 161호, 고용노동부 「퇴직금 계산」(2026-10-23 확인).',
      },
    ],
    faq: [
      {
        q: '퇴직금은 어떻게 계산하나요?',
        a: '법정 퇴직금은 일반적으로 1일 평균임금 × 30일 × 총 계속근로일수 ÷ 365일로 계산합니다. 계속근로기간이 365일 이상이고 주 소정근로시간 요건을 충족하면 1년당 30일분 이상의 평균임금이 기준이 됩니다.',
      },
      {
        q: '퇴직 전 3개월은 실제 출근한 날만 세나요?',
        a: '아니요. 평균임금 산정의 3개월은 퇴직일 이전의 달력상 기간이므로 휴일과 휴무일도 포함합니다. 퇴직일에 따라 89일, 90일, 91일 또는 92일이 될 수 있으며, 이 계산기는 마지막 근무일을 기준으로 자동 계산합니다.',
      },
      {
        q: '상여금과 연차수당도 퇴직금에 포함되나요?',
        a: '반영 대상인 정기상여금과 연차수당은 일반적인 평균임금 산정에서 최근 1년 총액의 3/12이 더해질 수 있습니다. 다만 모든 상여금·연차수당이 자동으로 포함되는 것은 아니므로 지급 기준, 발생 시점, 임금대장을 확인해야 합니다.',
      },
      {
        q: '주 15시간 미만 아르바이트도 퇴직금을 받나요?',
        a: '4주를 평균한 1주 소정근로시간이 15시간 미만인 근로자는 일반적으로 법정 퇴직급여제도 적용 대상에서 제외됩니다. 이 도구는 입력한 대표 4주 평균으로 기준을 보여 주지만, 근로시간이 바뀐 전체 기간은 판정하지 않습니다.',
      },
      {
        q: '1년 미만 근무해도 퇴직금을 받나요?',
        a: '「근로자퇴직급여 보장법」 제4조에 따라 계속근로기간이 1년 미만이면 법정 퇴직급여제도 적용 대상에서 일반적으로 제외됩니다. 다만 근로계약·단체협약·회사 규정이 법보다 유리한 별도 지급을 정했다면 그 기준을 확인해야 합니다.',
      },
      {
        q: '계산기 금액이 실제 입금액인가요?',
        a: '아니요. 표시 금액은 퇴직소득세를 빼기 전의 참고 예상액입니다. 평균임금 제외기간, 임금 해당 여부, 통상임금, 중간정산, 퇴직연금 제도와 세금에 따라 실제 지급액은 달라질 수 있습니다.',
      },
      {
        q: '입력한 급여 정보가 서버에 전송되나요?',
        a: '아니요. 퇴직금 계산은 브라우저 안에서 실행됩니다. 입력값은 새로고침 뒤에도 이어서 쓰도록 현재 브라우저 저장소에만 보관하며 서버로 전송하지 않습니다.',
      },
    ],
    ui: {
      intro: '퇴직 전 실제 3개월 임금으로 법정 퇴직금을 추정합니다. 계산은 이 브라우저 안에서만 실행됩니다.',
      autosaved: '입력값은 이 브라우저에 저장됩니다',
      employmentHeading: '재직기간과 대상 요건',
      startDateLabel: '입사일',
      lastWorkingDateLabel: '마지막 근무일',
      lastWorkingDateHint: '퇴직일은 마지막 근무일의 다음 날입니다.',
      weeklyHoursLabel: '주 소정근로시간(해당 4주 평균)',
      weeklyHoursHint: '4주 평균이 일반적으로 주 15시간 이상이어야 합니다. 기간별로 달랐다면 별도 확인하세요.',
      wagesHeading: '퇴직 전 3개월 임금',
      wagesHint: '급여명세서의 세전 임금 합계를 입력합니다. 평균임금에 포함되는 항목만 넣으세요.',
      wageLabel: '임금 합계 {number}',
      extraHeading: '반영 대상인 추가 항목',
      annualBonusLabel: '최근 1년 정기상여금 총액',
      annualBonusHint: '반영 대상이면 3/12을 평균임금 총액에 더합니다.',
      annualLeaveLabel: '최근 1년 연차수당 총액',
      annualLeaveHint: '평균임금 반영 대상일 때만 3/12을 더합니다.',
      ordinaryWageLabel: '확인한 1일 통상임금(선택)',
      ordinaryWageHint: '모르면 0원으로 둡니다. 평균임금보다 높으면 법정 하한으로 적용합니다.',
      resultHeading: '세전 예상 퇴직금',
      severancePay: '예상 퇴직금(세전)',
      ineligible:
        '입력한 재직기간 또는 주 소정근로시간이 일반적인 1년·주 15시간 대상 요건을 충족하지 않아 법정 퇴직금 예상액을 0원으로 표시합니다.',
      eligible:
        '입력한 재직기간과 주 소정근로시간은 일반적인 법정 대상 요건을 충족합니다. 특수기간은 별도로 확인하세요.',
      serviceDays: '계속근로일수',
      averageWageDays: '평균임금 기간 일수',
      averageDailyWage: '1일 평균임금',
      applicableDailyWage: '적용 1일 임금',
      retirementDate: '퇴직일',
      averageWagePeriod: '평균임금 산정기간',
      dateRangeSeparator: '–',
      threeMonthWages: '3개월 임금 합계',
      includedBonus: '상여금 반영액(3/12)',
      includedAnnualLeave: '연차수당 반영액(3/12)',
      averageWageTotal: '평균임금 총액',
      formulaHeading: '계산식',
      formula: '{daily} × 30 × ({serviceDays} ÷ 365) = {severance}',
      invalidInput: '올바른 날짜, 0원 이상 1,000조원 이하의 금액, 0~168시간의 주 소정근로시간을 입력하세요.',
      copy: '예상액 복사',
      copied: '복사됨',
      reset: '초기화',
      resultNotice:
        '이 금액은 퇴직소득세 전 참고 예상액입니다. 평균임금 제외기간, 임금 해당 여부, 중간정산, DB·DC 퇴직연금에 따라 실제 지급액이 달라질 수 있습니다.',
      won: '원',
    },
  },
};
