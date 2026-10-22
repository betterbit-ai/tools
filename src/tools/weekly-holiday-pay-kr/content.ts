import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';
import { WEEKLY_HOLIDAY_PAY_RULES_2026 as rules } from './logic';

const number = (value: number) => value.toLocaleString('en-US');
const minimumWage = number(rules.minimumHourlyWage);
const previousMinimumWage = number(rules.previousYearMinimumHourlyWage);
const monthlyMinimumPay = number(rules.standardMonthlyMinimumPay);
const maximumHolidayPay = number(rules.minimumHourlyWage * rules.maximumHolidayHours);
const fourHourHolidayPay = number(rules.minimumHourlyWage * 4);
const threeHourHolidayPay = number(rules.minimumHourlyWage * 3);

const uiEn = {
  intro: 'Enter contractual hours, not unpaid breaks or occasional overtime. Results update as you type.',
  autosaved: 'Saved in this browser',
  hourlyWageLabel: 'Contractual hourly wage (KRW)',
  hourlyWageHint: `The ${rules.year} Korean minimum wage is KRW ${minimumWage} from ${rules.effectiveFrom} through ${rules.effectiveTo}.`,
  dailyHoursLabel: 'This week’s scheduled hours by day',
  dailyHoursHint: 'Use the hours agreed in your contract or schedule after unpaid breaks.',
  currentWeekTotal: 'Current week',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
  hoursInputLabel: 'scheduled hours',
  reviewWeeksLabel: `Weeks in the ${rules.minimumAverageWeeklyHours}-hour review period`,
  reviewWeeksHint: `Use ${rules.maximumReviewWeeks} weeks, or the actual period if you have worked for fewer than ${rules.maximumReviewWeeks} weeks.`,
  oneWeek: '1 week',
  twoWeeks: '2 weeks',
  threeWeeks: '3 weeks',
  fourWeeks: '4 weeks',
  regularScheduleLabel: 'The same weekly schedule applied throughout this period',
  regularScheduleHint: 'Turn this off to enter each earlier week’s total when your schedule changed.',
  previousWeek1: '1 week ago',
  previousWeek2: '2 weeks ago',
  previousWeek3: '3 weeks ago',
  previousWeekHint: 'Total contractual hours',
  workerTypeLabel: 'Worker type for paid-holiday hours',
  partTimeWorker: 'Part-time worker',
  regularWorker: 'Ordinary worker',
  workerTypeHint:
    'Choose part-time when your weekly hours are shorter than a comparable ordinary worker’s. Otherwise choose ordinary worker.',
  ordinaryWorkerDaysLabel: 'Full-time comparison worker’s scheduled days per week',
  ordinaryWorkerDaysHint:
    'Usually 5. The official part-time formula divides by the workdays of a comparable ordinary worker, not your own number of days.',
  normalWorkdayHoursLabel: 'Hours in a normal scheduled workday',
  normalWorkdayHoursHint:
    'For an ordinary worker, enter the contractual hours of a normal workday. Example: 7 hours for a Mon–Fri 7-hour, Sat 5-hour schedule.',
  attendanceLabel: 'I attended every scheduled workday this week',
  employmentLabel: 'My employment lasted through the end of this seven-day week',
  attendanceHint:
    'Lateness or leaving early is generally not an absence. Leave, shutdowns, and unusual schedules can need individual review.',
  resultsHeading: `${rules.year} weekly holiday pay result`,
  eligibilityLabel: 'Eligibility',
  eligible: 'Eligible',
  notEligible: 'Not eligible',
  eligibleExplanation:
    'Weekly holiday pay is estimated because the average-hours, attendance, and full-week employment checks are all met.',
  reasonUnder15: `No weekly holiday pay: average contractual hours are below ${rules.minimumAverageWeeklyHours} per week for the selected review period.`,
  reasonAbsence: 'No weekly holiday pay for this week: not every scheduled workday was attended.',
  reasonEmploymentEnded:
    'No weekly holiday pay for this week: the employment relationship did not last through the seven-day week.',
  weeklyHolidayPay: 'Weekly holiday pay',
  holidayHours: 'Paid holiday hours',
  weeklyTotalPay: 'Current week total',
  monthlyEstimate: 'Average monthly pay',
  minimumWageBelow: `Below the ${rules.year} minimum hourly wage by`,
  minimumWageEqual: `The hourly wage equals the ${rules.year} minimum of KRW ${minimumWage}.`,
  minimumWageAbove: `Above the ${rules.year} minimum hourly wage by`,
  whyHeading: 'Why this result',
  averageWeeklyHours: 'Average scheduled hours',
  fifteenHourCheck: `${rules.minimumAverageWeeklyHours}-hour threshold`,
  attendanceCheck: 'Attendance requirement',
  employmentCheck: 'Full-week employment',
  met: 'Met',
  notMet: 'Not met',
  holidayHoursFormula: 'Holiday-hours formula',
  weeklyBasePay: 'Current scheduled-hours pay',
  monthlyHolidayPay: 'Average monthly holiday pay',
  monthlyEstimateHint:
    'The monthly figure uses the review-period weekly average × 365 ÷ 7 ÷ 12 and assumes every future week qualifies. Tax, insurance, overtime, night work, and holiday-work premiums are excluded.',
  copyResult: 'Copy result',
  copiedResult: 'Copied',
  reset: 'Reset',
  invalidInput: `Check the wage, seven daily hours (maximum ${rules.maximumDailyInputHours} each and ${rules.maximumWeeklyInputHours} total), prior-week totals, and worker-type field.`,
  won: ' KRW',
  hoursUnit: ' h',
};
export type UI = typeof uiEn;

const uiKo: UI = {
  intro: '휴게시간과 일시적 연장근로를 뺀 소정근로시간을 입력하면 결과가 바로 바뀝니다.',
  autosaved: '이 브라우저에 자동 저장',
  hourlyWageLabel: '약정 시급(원)',
  hourlyWageHint: `${rules.year}년 최저임금은 ${rules.effectiveFrom}부터 ${rules.effectiveTo}까지 시간당 ${minimumWage}원입니다.`,
  dailyHoursLabel: '이번 주 요일별 소정근로시간',
  dailyHoursHint: '근로계약서나 근무표에 정한 시간에서 무급 휴게시간을 빼고 입력하세요.',
  currentWeekTotal: '이번 주 합계',
  monday: '월요일',
  tuesday: '화요일',
  wednesday: '수요일',
  thursday: '목요일',
  friday: '금요일',
  saturday: '토요일',
  sunday: '일요일',
  hoursInputLabel: '소정근로시간',
  reviewWeeksLabel: `주 ${rules.minimumAverageWeeklyHours}시간 판단 기간`,
  reviewWeeksHint: `원칙은 ${rules.maximumReviewWeeks}주이며, 근로기간이 ${rules.maximumReviewWeeks}주보다 짧으면 실제 근로한 기간을 선택하세요.`,
  oneWeek: '1주',
  twoWeeks: '2주',
  threeWeeks: '3주',
  fourWeeks: '4주',
  regularScheduleLabel: '선택한 기간 내내 이번 주와 같은 근무표였습니다',
  regularScheduleHint: '주마다 시간이 달랐다면 끄고 직전 주별 소정근로시간 합계를 입력하세요.',
  previousWeek1: '1주 전',
  previousWeek2: '2주 전',
  previousWeek3: '3주 전',
  previousWeekHint: '주 소정근로시간 합계',
  workerTypeLabel: '주휴시간 산정 근로자 유형',
  partTimeWorker: '단시간근로자',
  regularWorker: '통상근로자',
  workerTypeHint:
    '같은 업무 통상근로자보다 주 소정근로시간이 짧으면 단시간근로자, 그렇지 않으면 통상근로자를 선택하세요.',
  ordinaryWorkerDaysLabel: '통상근로자의 주 소정근로일수',
  ordinaryWorkerDaysHint:
    '보통 5일입니다. 단시간근로자 주휴시간은 본인의 출근일수가 아니라 같은 업무 통상근로자의 소정근로일수로 나눕니다.',
  normalWorkdayHoursLabel: '통상적인 1일 소정근로시간',
  normalWorkdayHoursHint: '통상근로자는 보통 근무일의 소정근로시간을 입력하세요. 예: 월~금 7시간·토 5시간이면 7시간.',
  attendanceLabel: '이번 주 소정근로일을 모두 개근했습니다',
  employmentLabel: '7일로 된 이번 주가 끝날 때까지 근로관계가 유지됐습니다',
  attendanceHint:
    '지각·조퇴만으로는 일반적으로 결근이 아닙니다. 휴가·휴업·특수한 근무표는 개별 사실관계를 확인해야 합니다.',
  resultsHeading: `${rules.year}년 주휴수당 계산 결과`,
  eligibilityLabel: '발생 여부',
  eligible: '발생',
  notEligible: '미발생',
  eligibleExplanation: `${rules.maximumReviewWeeks}주 평균 시간, 개근, 1주간 근로관계 조건을 모두 충족해 주휴수당이 발생하는 것으로 계산했습니다.`,
  reasonUnder15: `주휴수당 미발생: 선택한 기간의 1주 평균 소정근로시간이 ${rules.minimumAverageWeeklyHours}시간 미만입니다.`,
  reasonAbsence: '이번 주 주휴수당 미발생: 소정근로일을 모두 개근하지 않았습니다.',
  reasonEmploymentEnded: '이번 주 주휴수당 미발생: 7일로 된 1주가 끝나기 전에 근로관계가 종료됐습니다.',
  weeklyHolidayPay: '1주 주휴수당',
  holidayHours: '주휴시간',
  weeklyTotalPay: '이번 주 주급 합계',
  monthlyEstimate: '월 평균 환산액',
  minimumWageBelow: `${rules.year}년 최저시급보다 부족한 시간당 금액`,
  minimumWageEqual: `입력 시급은 ${rules.year}년 최저임금 ${minimumWage}원과 같습니다.`,
  minimumWageAbove: `${rules.year}년 최저시급보다 높은 시간당 금액`,
  whyHeading: '왜 이렇게 계산됐나요?',
  averageWeeklyHours: '평균 주 소정근로시간',
  fifteenHourCheck: `주 ${rules.minimumAverageWeeklyHours}시간 조건`,
  attendanceCheck: '소정근로일 개근 조건',
  employmentCheck: '1주간 근로관계 조건',
  met: '충족',
  notMet: '미충족',
  holidayHoursFormula: '주휴시간 계산',
  weeklyBasePay: '이번 주 소정근로 임금',
  monthlyHolidayPay: '월 평균 주휴수당',
  monthlyEstimateHint:
    '월 환산액은 선택 기간의 주 평균액 × 365 ÷ 7 ÷ 12로 계산하고 매주 요건 충족을 가정합니다. 세금·4대보험과 연장·야간·휴일근로 가산수당은 포함하지 않습니다.',
  copyResult: '결과 복사',
  copiedResult: '복사됨',
  reset: '초기화',
  invalidInput: `시급, 요일별 시간(하루 최대 ${rules.maximumDailyInputHours}시간·주 최대 ${rules.maximumWeeklyInputHours}시간), 이전 주 합계와 근로자 유형별 항목을 확인하세요.`,
  won: '원',
  hoursUnit: '시간',
};

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: `Weekly Holiday Pay Korea Calculator — ${rules.year} Rules`,
    description: `Calculate Korean weekly holiday pay from each day’s hours, the ${rules.maximumReviewWeeks}-week average, attendance, and ${rules.year} minimum wage, with a clear reason for the result.`,
    h1: 'Weekly Holiday Pay Calculator (Korea)',
    tagline: `Check the ${rules.minimumAverageWeeklyHours}-hour rule, attendance, weekly allowance, and monthly estimate from your real day-by-day schedule.`,
    name: 'Korea Weekly Holiday Pay',
    keywords: [
      'weekly holiday pay Korea',
      'Korea holiday pay calculator',
      'juhyu sudang calculator',
      'Korea part time pay calculator',
      'Korea 15 hour rule',
      `${rules.year} Korea minimum wage`,
    ],
    howTo: [
      'Enter the contractual hourly wage before weekly holiday pay.',
      'Enter scheduled hours for Monday through Sunday after unpaid breaks.',
      `Select ${rules.maximumReviewWeeks} review weeks, or the actual shorter period for a newer worker.`,
      'Turn off the same-schedule switch and enter earlier weekly totals if hours varied.',
      'Choose the worker type, then confirm attendance and full-week employment.',
      'Read the eligibility reason, holiday hours, weekly pay, monthly estimate, and minimum-wage check.',
    ],
    sections: [
      {
        heading: `Who qualifies for weekly holiday pay in Korea in ${rules.year}?`,
        body: `A worker generally qualifies when contractual hours average at least ${rules.minimumAverageWeeklyHours} per week over ${rules.maximumReviewWeeks} weeks (or the actual period if employed for fewer than ${rules.maximumReviewWeeks} weeks), every scheduled workday in the relevant week was attended, and the employment relationship lasted through that seven-day week. Labor Standards Act Article 18(3) excludes workers below the ${rules.minimumAverageWeeklyHours}-hour average from Article 55, and Enforcement Decree Article 30 requires full attendance on scheduled workdays. Article 55(1) also applies to workplaces with four or fewer workers through Enforcement Decree attached Table 1. These provisions were checked in the statutes effective ${rules.laborStandardsActEffectiveFrom}; the Ministry of Employment and Labor 1350 guidance was checked on ${rules.verifiedOn}.`,
      },
      {
        heading: 'The correct formula depends on worker type',
        body: `For a part-time worker, Labor Standards Act Enforcement Decree Article 9 and attached Table 2 divide total contractual hours over ${rules.maximumReviewWeeks} weeks by the comparable ordinary worker’s total scheduled workdays in that period. With a ${rules.defaultOrdinaryWorkerDaysPerWeek}-day comparison schedule, a 20-hour weekly average gives 20 ÷ ${rules.defaultOrdinaryWorkerDaysPerWeek} = 4 paid holiday hours. For an ordinary worker, Ministry guidance uses the contractual hours of a normal workday: a Mon–Fri 7-hour and Sat 5-hour schedule therefore receives 7 hours, not 40 ÷ 6. Weekly holiday pay is the applicable hours × hourly wage, capped here at ${rules.maximumHolidayHours} hours for this standard adult calculation.`,
      },
      {
        heading: `What changed in ${rules.year}: the minimum wage, not the eligibility test`,
        body: `Ministry of Employment and Labor Notice ${rules.minimumWageNotice} set the ${rules.year} minimum wage at KRW ${minimumWage} per hour, effective ${rules.effectiveFrom} through ${rules.effectiveTo}. That is KRW ${number(rules.minimumWageIncrease)}, or ${rules.minimumWageIncreasePercent}%, above the ${rules.year - 1} rate of KRW ${previousMinimumWage}. The official full-time monthly figure is KRW ${monthlyMinimumPay} for ${rules.standardMonthlyPaidHours} paid hours, including ${rules.maximumHolidayHours} weekly holiday hours. The ${rules.minimumAverageWeeklyHours}-hour average and attendance tests did not change for ${rules.year}. The Ministry’s ${rules.minimumWageAnnouncementDate} announcement and Minimum Wage Commission table were verified on ${rules.verifiedOn}.`,
      },
      {
        heading: 'What this estimate includes and leaves out',
        body: `Use contractual hours, not building time, unpaid meal breaks, or unplanned overtime. This standard-schedule tool accepts up to ${rules.maximumDailyInputHours} contractual hours per day and ${rules.maximumWeeklyInputHours} per week, then estimates base pay plus the weekly paid holiday for an adult worker. The monthly number averages a year with 365 ÷ 7 ÷ 12, about 4.345 weeks per month; an actual pay period can differ. It does not calculate tax, social insurance, overtime, night-work or holiday-work premiums, youth limits, flexible schedules, surveillance or intermittent-worker approvals, or disputes over whether leave counts as attendance. Check the contract and wage statement, and call the Ministry of Employment and Labor at 1350 for an individual case.`,
      },
    ],
    faq: [
      {
        q: 'Do part-time and foreign workers get weekly holiday pay in Korea?',
        a: `Part-time, temporary, and foreign workers can receive Korean weekly holiday pay when their contractual hours average at least ${rules.minimumAverageWeeklyHours} per week over the review period, they attend every scheduled workday in the relevant week, and employment lasts through that seven-day week. The rule also applies at workplaces with fewer than five workers.`,
      },
      {
        q: `Does exactly ${rules.minimumAverageWeeklyHours} hours a week qualify for weekly holiday pay?`,
        a: `Exactly ${rules.minimumAverageWeeklyHours} average contractual hours per week meets the threshold. A worker below that ${rules.maximumReviewWeeks}-week average is excluded; for a part-time worker at a standard ${rules.defaultOrdinaryWorkerDaysPerWeek}-day workplace, a ${rules.minimumAverageWeeklyHours}-hour average produces 3 paid holiday hours before multiplying by the hourly wage.`,
      },
      {
        q: 'What if my work hours change every week?',
        a: `Add the contractual hours for the latest ${rules.maximumReviewWeeks}-week review period and divide by ${rules.maximumReviewWeeks}. If employment has lasted fewer than ${rules.maximumReviewWeeks} weeks, average the actual shorter period. This calculator accepts each earlier weekly total instead of asking for an imprecise “normal week.”`,
      },
      {
        q: 'Do lateness or early departure cancel weekly holiday pay?',
        a: 'Lateness or leaving early is generally distinguished from an absence, so it does not automatically break the attendance condition. An unexcused absence on a scheduled workday does. Paid leave, shutdowns, and an entire week away can require a case-specific review.',
      },
      {
        q: 'Do I need to be scheduled to work the following week?',
        a: `No. Ministry of Employment and Labor guidance effective ${rules.nextDayWorkInterpretationEffectiveFrom} says work on the eighth day does not have to be scheduled. The employment relationship must still last through the relevant seven-day week and every scheduled workday in that week must be attended.`,
      },
      {
        q: `What is weekly holiday pay at the ${rules.year} Korean minimum wage?`,
        a: `At the ${rules.year} minimum wage of KRW ${minimumWage}, ${rules.maximumHolidayHours} paid holiday hours equal KRW ${maximumHolidayPay}, 4 hours equal KRW ${fourHourHolidayPay}, and 3 hours equal KRW ${threeHourHolidayPay}. The applicable hours depend on worker type and are capped at ${rules.maximumHolidayHours} in this standard adult calculation.`,
      },
      {
        q: 'Is weekly holiday pay already included in a monthly salary?',
        a: `A monthly salary often already includes weekly paid-holiday time. The official ${rules.year} full-time minimum monthly figure of KRW ${monthlyMinimumPay} uses ${rules.standardMonthlyPaidHours} hours, which includes ${rules.standardWeeklyScheduledHours} scheduled hours plus ${rules.maximumHolidayHours} paid holiday hours per week converted to a monthly basis. Check the contract and wage statement before adding the allowance again.`,
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: `주휴수당 계산기 — ${rules.year} 지급조건·월급 계산`,
    description: `요일별 근무시간과 최근 ${rules.maximumReviewWeeks}주 평균, 개근 여부로 ${rules.year}년 주휴수당 조건·금액·월 환산액을 계산하고 미발생 이유와 최저임금 미달 여부까지 보여줍니다.`,
    h1: '주휴수당 계산기',
    tagline: `요일별 소정근로시간을 넣으면 주 ${rules.minimumAverageWeeklyHours}시간·개근 조건과 주휴수당, 주급, 월 환산액을 근거와 함께 확인합니다.`,
    name: '주휴수당 계산기',
    keywords: [
      '주휴수당 계산기',
      '주휴수당 조건',
      '주휴수당 계산법',
      '알바 주휴수당',
      `주 ${rules.minimumAverageWeeklyHours}시간 주휴수당`,
      `${rules.year} 주휴수당`,
      '주휴수당 월급 계산',
      '퇴사 주 주휴수당',
    ],
    howTo: [
      '주휴수당을 뺀 약정 시급을 원 단위로 입력하세요.',
      '월요일부터 일요일까지 휴게시간을 뺀 소정근로시간을 입력하세요.',
      `원칙적으로 ${rules.maximumReviewWeeks}주를 선택하고, 근로기간이 ${rules.maximumReviewWeeks}주 미만이면 실제 기간을 선택하세요.`,
      '주마다 근무시간이 달랐다면 같은 근무표 스위치를 끄고 직전 주 합계를 입력하세요.',
      '근로자 유형을 선택하고 개근·1주간 근로관계 여부를 확인하세요.',
      '주휴 발생 또는 미발생 이유와 주휴시간·주급·월 환산액·최저임금 비교를 확인하세요.',
    ],
    sections: [
      {
        heading: `${rules.year}년 주휴수당 지급조건`,
        body: `일반적으로 ① ${rules.maximumReviewWeeks}주 평균 1주 소정근로시간이 ${rules.minimumAverageWeeklyHours}시간 이상이고(근로기간이 ${rules.maximumReviewWeeks}주 미만이면 그 기간 평균), ② 해당 주 소정근로일을 개근했으며, ③ 7일로 된 그 1주 동안 근로관계가 유지돼야 주휴수당이 발생합니다. 근로기준법 제18조 제3항은 평균 주 ${rules.minimumAverageWeeklyHours}시간 미만 근로자에게 제55조를 적용하지 않고, 시행령 제30조는 소정근로일 개근을 요구합니다. 시행령 별표 1에 따라 상시 4명 이하 사업장에도 제55조 제1항은 적용됩니다. 국가법령정보센터의 ${rules.laborStandardsActEffectiveFrom} 시행 법령과 고용노동부 1350 안내를 ${rules.verifiedOn} 확인했습니다.`,
      },
      {
        heading: '근로자 유형에 따른 주휴수당 계산 방법',
        body: `단시간근로자는 근로기준법 시행령 제9조·별표 2에 따라 ${rules.maximumReviewWeeks}주 소정근로시간 합계를 같은 기간 통상근로자의 총 소정근로일수로 나눕니다. 통상근로자가 주 ${rules.defaultOrdinaryWorkerDaysPerWeek}일인 사업장에서 평균 주 20시간이면 20 ÷ ${rules.defaultOrdinaryWorkerDaysPerWeek} = 주휴 4시간입니다. 단시간근로자가 아닌 통상근로자는 고용노동부 안내에 따라 통상적인 1일 소정근로시간을 씁니다. 월~금 7시간·토 5시간이면 주 40시간을 6일로 나눈 6.67시간이 아니라 7시간입니다. 주휴수당은 해당 주휴시간 × 시급이며 이 표준 성인 계산에서는 최대 ${rules.maximumHolidayHours}시간입니다.`,
      },
      {
        heading: `${rules.year}년에 바뀐 것은 최저임금입니다`,
        body: `${rules.minimumWageNotice}는 ${rules.year}년 최저임금을 시간당 ${minimumWage}원으로 정했고 적용기간은 ${rules.effectiveFrom}~${rules.effectiveTo}입니다. ${rules.year - 1}년 ${previousMinimumWage}원보다 ${number(rules.minimumWageIncrease)}원, ${rules.minimumWageIncreasePercent}% 올랐습니다. 주 ${rules.standardWeeklyScheduledHours}시간·유급주휴 ${rules.maximumHolidayHours}시간을 포함한 공식 월 환산액은 ${rules.standardMonthlyPaidHours}시간 기준 ${monthlyMinimumPay}원입니다. 주 ${rules.minimumAverageWeeklyHours}시간 평균과 개근이라는 주휴 발생 조건은 ${rules.year}년에 바뀌지 않았습니다. 고용노동부 ${rules.minimumWageAnnouncementDate} 보도자료와 최저임금위원회 연도별 현황을 ${rules.verifiedOn} 다시 확인했습니다.`,
      },
      {
        heading: '계산에 넣을 시간과 실제 급여의 차이',
        body: `소정근로시간은 근로계약서나 근무표에서 일하기로 정한 시간입니다. 무급 식사·휴게시간, 갑자기 더 일한 연장근로, 단순 체류시간은 빼야 합니다. 이 계산기는 표준 근무표를 대상으로 하루 ${rules.maximumDailyInputHours}시간·주 ${rules.maximumWeeklyInputHours}시간까지 입력받습니다. 월 환산액은 주 평균 금액 × 365 ÷ 7 ÷ 12(약 4.345주)로 계산한 평균이며 달력상 실제 지급주기와 다를 수 있습니다. 세금·4대보험, 연장·야간·휴일근로 가산수당, 연소자, 탄력·선택근로, 감시·단속적 근로 승인, 휴가의 개근 처리 같은 개별 예외는 반영하지 않습니다. 중요한 지급 판단은 근로계약서와 임금명세서를 대조하고 고용노동부 1350에 확인하세요.`,
      },
    ],
    faq: [
      {
        q: '주휴수당은 누가 받을 수 있나요?',
        a: `고용형태와 관계없이 ${rules.maximumReviewWeeks}주 평균 주 소정근로시간이 ${rules.minimumAverageWeeklyHours}시간 이상이고, 해당 주 소정근로일을 개근했으며, 그 7일 동안 근로관계가 유지된 근로자는 일반적으로 주휴수당 대상입니다. 상시 5인 미만 사업장과 아르바이트에도 적용됩니다.`,
      },
      {
        q: `주 ${rules.minimumAverageWeeklyHours}시간 딱 일해도 주휴수당이 나오나요?`,
        a: `${rules.maximumReviewWeeks}주 평균 소정근로시간이 정확히 주 ${rules.minimumAverageWeeklyHours}시간이면 기준을 충족합니다. 단시간근로자이고 통상근로자가 주 ${rules.defaultOrdinaryWorkerDaysPerWeek}일인 사업장에서는 주휴시간이 ${rules.minimumAverageWeeklyHours} ÷ ${rules.defaultOrdinaryWorkerDaysPerWeek} = 3시간이고, ${rules.year}년 최저시급 ${minimumWage}원을 적용하면 1주 주휴수당은 ${threeHourHolidayPay}원입니다.`,
      },
      {
        q: `근무시간이 매주 다르면 주 ${rules.minimumAverageWeeklyHours}시간을 어떻게 계산하나요?`,
        a: `최근 ${rules.maximumReviewWeeks}주의 소정근로시간을 모두 더해 ${rules.maximumReviewWeeks}로 나눕니다. 근로기간이 ${rules.maximumReviewWeeks}주 미만이면 실제 근로한 기간의 평균을 씁니다. 실제로 더 일한 연장시간이 아니라 계약상 정한 시간을 기준으로 하며, 이 계산기에는 직전 주별 합계를 따로 입력할 수 있습니다.`,
      },
      {
        q: '지각이나 조퇴를 하면 주휴수당을 못 받나요?',
        a: '지각·조퇴는 일반적으로 결근과 구분되므로 그 사실만으로 개근 조건이 곧바로 깨지지는 않습니다. 소정근로일에 무단결근했다면 그 주의 주휴수당은 발생하지 않습니다. 연차·휴업·병가나 한 주 전체 휴가는 구체적인 사정을 따로 확인해야 합니다.',
      },
      {
        q: '퇴사하는 주에도 주휴수당을 받을 수 있나요?',
        a: `다음 주인 8일째에 출근할 예정일 필요는 없습니다. ${rules.nextDayWorkInterpretationEffectiveFrom}부터 적용된 고용노동부 행정해석은 해당 7일 동안 근로관계가 유지되고 소정근로일을 개근했다면 주휴수당이 발생한다고 봅니다. 1주가 끝나기 전에 퇴직했다면 이 조건을 충족하지 못할 수 있습니다.`,
      },
      {
        q: `${rules.year}년 최저시급으로 주휴수당은 얼마인가요?`,
        a: `${rules.year}년 최저시급 ${minimumWage}원 기준으로 주휴 ${rules.maximumHolidayHours}시간은 ${maximumHolidayPay}원, 4시간은 ${fourHourHolidayPay}원, 3시간은 ${threeHourHolidayPay}원입니다. 실제 주휴시간은 근로자 유형에 맞는 공식 산식으로 계산하며 표준 성인 계산에서는 최대 ${rules.maximumHolidayHours}시간입니다.`,
      },
      {
        q: '월급제도 주휴수당을 따로 받아야 하나요?',
        a: `월급제는 주휴수당이 월급에 이미 포함된 경우가 많습니다. ${rules.year}년 주 ${rules.standardWeeklyScheduledHours}시간 최저임금 월 환산액 ${monthlyMinimumPay}원은 소정근로 ${rules.standardWeeklyScheduledHours}시간과 유급주휴 ${rules.maximumHolidayHours}시간을 월 ${rules.standardMonthlyPaidHours}시간으로 환산한 금액입니다. 중복 또는 누락 여부는 근로계약서와 임금명세서의 산정시간을 확인해야 합니다.`,
      },
      {
        q: `${rules.year}년 주휴수당 조건이 달라졌나요?`,
        a: `${rules.year}년에 주 ${rules.minimumAverageWeeklyHours}시간 평균과 개근이라는 기본 조건은 바뀌지 않았습니다. 금액에 영향을 주는 최저임금이 ${rules.year - 1}년 ${previousMinimumWage}원에서 ${rules.year}년 ${minimumWage}원으로 ${number(rules.minimumWageIncrease)}원(${rules.minimumWageIncreasePercent}%) 올랐고, 적용기간은 ${rules.effectiveFrom}부터 ${rules.effectiveTo}까지입니다.`,
      },
    ],
    ui: uiKo,
  },
};
