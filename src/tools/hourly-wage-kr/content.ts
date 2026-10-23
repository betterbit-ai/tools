import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';
import { HOURLY_WAGE_RULES_2026 as rules } from './logic';

const number = (value: number) => value.toLocaleString('en-US');
const minimumWage = number(rules.minimumHourlyWage);
const monthlyMinimumPay = number(rules.officialMonthlyMinimumPay);
const dailyMinimumPay = number(rules.officialEightHourDailyPay);
const businessRate = number(rules.businessWithholdingRate * 100);

const uiEn = {
  intro: `Enter the hourly rate and standard schedule. Every result updates immediately under the ${rules.year} Korean rules.`,
  hourlyWageLabel: 'Hourly wage (KRW)',
  hourlyWageHint: 'Enter the contractual base hourly rate before weekly holiday pay.',
  useMinimumWage: `Use ${rules.year} minimum wage`,
  hoursPerDayLabel: 'Hours per day',
  hoursPerDayHint: 'Exclude unpaid meal and rest breaks.',
  daysPerWeekLabel: 'Days per week',
  daysPerWeekHint: `This standard converter accepts up to ${rules.standardWeeklyHours} scheduled hours a week.`,
  conditionsHeading: 'Weekly holiday pay conditions',
  conditionsHint: 'Turn off a condition that was not met in the week being calculated.',
  attendedLabel: 'Attended every scheduled workday',
  employedLabel: 'Employment lasted through the seven-day week',
  deductionLabel: 'Deduction estimate',
  deductionNone: 'Pre-tax only',
  deductionBusiness: `${businessRate}% business income`,
  deductionHint: `${businessRate}% is not the standard deduction for an employee. Use it only to preview Korean business-income withholding.`,
  resultsHeading: 'Estimated pay',
  monthlyWithHoliday: 'Monthly pay with weekly holiday pay',
  monthlyWithoutHoliday: 'Monthly pay without weekly holiday pay',
  dailyPay: 'Daily pay',
  weeklyBasePay: 'Weekly base pay',
  weeklyHolidayPay: 'Weekly holiday pay',
  weeklyTotalPay: 'Weekly total',
  annualPay: 'Annual conversion',
  eligibilityHeading: 'Why this result?',
  eligible: 'Weekly holiday pay applies',
  notEligible: 'Weekly holiday pay does not apply',
  eligibleExplanation: `The schedule reaches ${rules.minimumHolidayEligibilityHours} hours, all scheduled days were attended, and employment lasted through the week.`,
  reasonUnder15: `The schedule is under ${rules.minimumHolidayEligibilityHours} hours a week.`,
  reasonAbsence: 'Not every scheduled workday was attended.',
  reasonEmploymentEnded: 'Employment did not last through the seven-day week.',
  weeklyHours: 'Scheduled weekly hours',
  holidayHoursFormula: 'Weekly holiday hours',
  monthlyHoursFormula: 'Monthly paid hours',
  minimumWageEqual: `The hourly rate equals the ${rules.year} minimum wage of KRW ${minimumWage}.`,
  minimumWageAbove: `Above the ${rules.year} minimum wage by`,
  minimumWageBelow: `Below the ${rules.year} minimum wage by`,
  businessNotice: `${businessRate}% is a business-income withholding preview, not an employee take-home-pay calculation. Employee payroll can instead include social insurance and wage-income tax.`,
  businessIncomeTax: 'Business income tax (3%)',
  localIncomeTax: 'Local income tax',
  businessWithholding: `Estimated ${businessRate}% withheld`,
  estimatedReceipt: 'Estimated amount after withholding',
  copyResult: 'Copy result',
  copiedResult: 'Copied',
  reset: 'Reset',
  invalidInput: `Enter a positive wage and daily hours, up to ${rules.maximumDailyHours} hours a day, a whole number of days, and no more than ${rules.standardWeeklyHours} scheduled hours a week.`,
  won: 'KRW',
  hoursUnit: 'hours',
  daysUnit: 'days',
};
export type UI = typeof uiEn;

const uiKo: UI = {
  intro: `시급과 근무조건을 입력하면 ${rules.year}년 기준 일급·주급·월급과 주휴수당이 바로 바뀝니다.`,
  hourlyWageLabel: '시급(원)',
  hourlyWageHint: '주휴수당을 제외한 근로계약상 기본 시급을 입력하세요.',
  useMinimumWage: `${rules.year}년 최저시급 적용`,
  hoursPerDayLabel: '1일 근무시간',
  hoursPerDayHint: '무급 식사시간과 휴게시간은 빼고 입력하세요.',
  daysPerWeekLabel: '1주 근무일수',
  daysPerWeekHint: `표준 환산 범위는 1주 소정근로시간 ${rules.standardWeeklyHours}시간까지입니다.`,
  conditionsHeading: '주휴수당 지급조건',
  conditionsHint: '계산할 주에 충족하지 못한 조건은 끄세요.',
  attendedLabel: '소정근로일을 모두 개근함',
  employedLabel: '7일로 된 1주 동안 근로관계가 유지됨',
  deductionLabel: '공제 예상',
  deductionNone: '세전 금액',
  deductionBusiness: `사업소득 ${businessRate}%`,
  deductionHint: `${businessRate}%는 근로자의 일반 급여 공제가 아닙니다. 사업소득 원천징수액을 단순 비교할 때만 선택하세요.`,
  resultsHeading: '예상 급여',
  monthlyWithHoliday: '주휴수당 포함 월급',
  monthlyWithoutHoliday: '주휴수당 제외 월급',
  dailyPay: '일급',
  weeklyBasePay: '기본 주급',
  weeklyHolidayPay: '1주 주휴수당',
  weeklyTotalPay: '주급 합계',
  annualPay: '연봉 환산',
  eligibilityHeading: '왜 이렇게 계산됐나요?',
  eligible: '주휴수당 발생',
  notEligible: '주휴수당 미발생',
  eligibleExplanation: `주 ${rules.minimumHolidayEligibilityHours}시간 이상, 소정근로일 개근, 1주간 근로관계 조건을 모두 충족했습니다.`,
  reasonUnder15: `1주 소정근로시간이 ${rules.minimumHolidayEligibilityHours}시간 미만입니다.`,
  reasonAbsence: '소정근로일을 모두 개근하지 않았습니다.',
  reasonEmploymentEnded: '7일로 된 1주가 끝날 때까지 근로관계가 유지되지 않았습니다.',
  weeklyHours: '주 소정근로시간',
  holidayHoursFormula: '주휴시간',
  monthlyHoursFormula: '월 유급시간',
  minimumWageEqual: `입력 시급은 ${rules.year}년 최저임금 ${minimumWage}원과 같습니다.`,
  minimumWageAbove: `${rules.year}년 최저시급보다 높은 시간당 금액`,
  minimumWageBelow: `${rules.year}년 최저시급보다 부족한 시간당 금액`,
  businessNotice: `${businessRate}%는 사업소득 원천징수 예상치이며 근로자의 세후 월급 계산이 아닙니다. 근로자는 4대보험과 근로소득세 등이 별도로 적용될 수 있습니다.`,
  businessIncomeTax: '사업소득세(3%)',
  localIncomeTax: '지방소득세',
  businessWithholding: `예상 ${businessRate}% 공제액`,
  estimatedReceipt: '공제 후 예상액',
  copyResult: '결과 복사',
  copiedResult: '복사됨',
  reset: '초기화',
  invalidInput: `시급과 1일 근무시간은 0보다 크고 하루 ${rules.maximumDailyHours}시간 이하인지, 근무일수는 정수인지, 주 ${rules.standardWeeklyHours}시간 이하인지 확인하세요.`,
  won: '원',
  hoursUnit: '시간',
  daysUnit: '일',
};

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: `Korea Hourly Wage Calculator — ${rules.year} Pay & ${businessRate}%`,
    description: `Convert an hourly wage to Korean daily, weekly, and monthly pay with ${rules.year} minimum-wage checks, holiday-pay reasons, and an optional ${businessRate}% preview.`,
    h1: 'Korea Hourly Wage Calculator',
    tagline:
      'See daily, weekly, and monthly pay with the weekly holiday allowance—and the exact reason it applies or does not.',
    name: 'Korea Hourly Wage Calculator',
    keywords: [
      'hourly to monthly wage Korea',
      'Korea hourly wage calculator',
      'Korea part time salary calculator',
      'Korea minimum wage 2026',
      'Korea weekly holiday pay',
      'Korea 3.3 percent withholding',
    ],
    howTo: [
      'Enter the contractual hourly wage before the weekly holiday allowance.',
      'Enter paid work hours per day and scheduled days per week, excluding unpaid breaks.',
      'Confirm whether every scheduled day was attended and employment lasted through the week.',
      `Choose pre-tax pay or the optional ${businessRate}% business-income withholding preview.`,
      'Compare daily, weekly, monthly, and annual pay and read the eligibility explanation.',
    ],
    sections: [
      {
        heading: `Official ${rules.year} Korean minimum wage`,
        body: `The Minimum Wage Commission lists KRW ${minimumWage} per hour, KRW ${dailyMinimumPay} for an eight-hour day, and KRW ${monthlyMinimumPay} for ${rules.officialMonthlyPaidHours} paid hours a month. Ministry of Employment and Labor Notice ${rules.minimumWageNotice} applies from ${rules.effectiveFrom} through ${rules.effectiveTo}; the rate was officially announced on ${rules.minimumWageDecisionDate}. The commission’s Korean and English annual-rate tables were checked on ${rules.verifiedOn}. This calculator compares the contractual base hourly rate—not a rate inflated by adding the weekly holiday allowance—with that legal floor.`,
      },
      {
        heading: 'When the Korean weekly holiday allowance is included',
        body: `Under the standard schedule used here, paid weekly holiday time applies when scheduled hours reach ${rules.minimumHolidayEligibilityHours} a week, every scheduled workday in the relevant week was attended, and employment lasted through that seven-day week. The Ministry of Employment and Labor gives the part-time example (weekly hours ÷ ${rules.standardWeeklyHours}) × ${rules.maximumHolidayHours}; a 20-hour week therefore earns 4 paid holiday hours. The tool shows every failed condition instead of silently assuming eligibility. Irregular four-week schedules and workplaces whose comparable full-time schedule is not 40 hours over five days need the dedicated weekly-holiday-pay calculator or an individual review.`,
      },
      {
        heading: `Why ${rules.officialMonthlyPaidHours} hours produces the official monthly wage`,
        body: `A standard 40-hour week plus ${rules.maximumHolidayHours} paid holiday hours gives 48 paid hours. Multiplying by 365 ÷ 7 ÷ 12 gives about 208.57 hours, rounded to ${rules.officialMonthlyPaidHours}; KRW ${minimumWage} × ${rules.officialMonthlyPaidHours} = KRW ${monthlyMinimumPay}. This tool applies the same whole-hour conversion to other standard schedules and displays both the result with and without holiday pay. It is an average monthly conversion, not a count of shifts in a particular calendar month, and it excludes overtime, night and holiday-work premiums, bonuses, severance, social insurance, and employee income tax.`,
      },
      {
        heading: `What the ${businessRate}% option actually means in ${rules.year}`,
        body: `The National Tax Service’s “Simplified Payment Statement (Resident Business Income)” guidance says payers withhold ${businessRate}% from qualifying business income, including local income tax. Its separate business-income guide identifies ${rules.businessIncomeTaxRate * 100}% national income tax, while local income tax is ${rules.localIncomeTaxShareOfIncomeTax * 100}% of that income-tax amount. The tool calculates the two taxes separately and, under Article 47 of the National Treasury Funds Management Act effective ${rules.treasuryRoundingEffectiveFrom}, truncates each amount below KRW ${rules.taxTruncationUnit} before adding them. Those official pages and the statute were checked on ${rules.verifiedOn}. The amount is a prepayment reconciled in the annual comprehensive income-tax return, not a final tax bill. A person who is legally an employee does not become an independent contractor merely because a contract or payslip subtracts ${businessRate}%, so use the preview only for genuine business income and check the actual working relationship when status is disputed.`,
      },
    ],
    faq: [
      {
        q: `What is Korea’s minimum hourly wage in ${rules.year}?`,
        a: `Korea’s ${rules.year} minimum wage is KRW ${minimumWage} per hour from ${rules.effectiveFrom} through ${rules.effectiveTo}. The official eight-hour daily amount is KRW ${dailyMinimumPay}, and the standard ${rules.officialMonthlyPaidHours}-hour monthly amount is KRW ${monthlyMinimumPay}.`,
      },
      {
        q: `How much is KRW ${minimumWage} per hour per month?`,
        a: `At 8 hours a day and 5 days a week, KRW ${minimumWage} becomes KRW ${monthlyMinimumPay} a month before deductions when ${rules.maximumHolidayHours} weekly holiday hours are included. Without the weekly holiday allowance, the ${rules.officialMonthlyPaidHours}-hour official conversion does not apply.`,
      },
      {
        q: `Does exactly ${rules.minimumHolidayEligibilityHours} hours a week qualify for weekly holiday pay?`,
        a: `Exactly ${rules.minimumHolidayEligibilityHours} scheduled hours meets the hours threshold. Under the standard five-day comparison schedule it produces 3 paid holiday hours, but the worker must also attend every scheduled workday and remain employed through that seven-day week.`,
      },
      {
        q: `Should a Korean employee subtract ${businessRate}% from hourly pay?`,
        a: `No. The ${businessRate}% figure is withholding on qualifying business income, not the standard employee payroll deduction. Employees can instead have social-insurance contributions and wage-income tax withheld, and the exact take-home amount depends on monthly pay and personal conditions.`,
      },
      {
        q: 'Do workers at workplaces with fewer than five employees receive weekly holiday pay?',
        a: `Yes, the paid weekly-holiday rule generally also applies at workplaces with fewer than five employees when the ${rules.minimumHolidayEligibilityHours}-hour, attendance, and full-week employment conditions are met. Overtime premium rules are a separate question.`,
      },
      {
        q: 'Are overtime, night work, and social insurance included?',
        a: 'No. The calculator covers standard scheduled wages and the weekly holiday allowance only. It excludes overtime, night and holiday-work premiums, four social insurances, employee income tax, bonuses, and severance pay.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: `시급 계산기 — ${rules.year} 알바 월급·주휴수당·${businessRate}%`,
    description: `시급과 근무시간으로 일급·주급·월급을 계산하고 ${rules.year} 최저시급, 주휴수당 포함·제외 금액과 발생 이유, 사업소득 ${businessRate}% 공제 예상액을 확인합니다.`,
    h1: '시급 계산기',
    tagline: '시급을 넣으면 알바 일급·주급·월급과 주휴수당 발생 여부를 계산식과 함께 바로 확인합니다.',
    name: '시급 계산기',
    keywords: [
      '시급 계산기',
      '알바 월급 계산기',
      '시급 월급 계산',
      `최저시급 ${rules.year}`,
      '주휴수당 포함 월급',
      '알바 3.3 계산기',
      '일급 주급 계산기',
    ],
    howTo: [
      '주휴수당을 뺀 근로계약상 시급을 원 단위로 입력하세요.',
      '무급 휴게시간을 제외한 1일 근무시간과 1주 근무일수를 입력하세요.',
      '계산할 주의 소정근로일 개근과 1주간 근로관계 유지 여부를 확인하세요.',
      `세전 금액 또는 사업소득 ${businessRate}% 공제 예상을 선택하세요.`,
      '일급·주급·월급과 주휴수당 발생 또는 미발생 이유를 확인하세요.',
    ],
    sections: [
      {
        heading: `${rules.year}년 최저시급·일급·월급 공식 금액`,
        body: `최저임금위원회의 연도별 결정현황에 따르면 ${rules.year}년 최저임금은 시급 ${minimumWage}원, 8시간 일급 ${dailyMinimumPay}원, 월 ${rules.officialMonthlyPaidHours}시간 기준 ${monthlyMinimumPay}원입니다. ${rules.minimumWageNotice}에 따른 적용기간은 ${rules.effectiveFrom}부터 ${rules.effectiveTo}까지이며 결정고시일은 ${rules.minimumWageDecisionDate}입니다. 최저임금위원회 국문·영문 공식 표를 ${rules.verifiedOn} 확인했습니다. 이 계산기는 주휴수당을 더해 부풀린 금액이 아니라 근로계약상 기본 시급을 ${minimumWage}원과 비교합니다.`,
      },
      {
        heading: '주휴수당 조건과 미발생 이유',
        body: `표준 근무표에서는 1주 소정근로시간이 ${rules.minimumHolidayEligibilityHours}시간 이상이고, 해당 주 소정근로일을 개근했으며, 7일로 된 그 1주 동안 근로관계가 유지되면 유급 주휴를 반영합니다. 고용노동부 안내의 단시간근로자 예시는 ‘주 근로시간 ÷ ${rules.standardWeeklyHours}시간 × ${rules.maximumHolidayHours}시간’이므로 주 20시간이면 주휴 4시간입니다. 이 계산기는 세 조건을 직접 받고, 주휴수당이 0원이면 주 ${rules.minimumHolidayEligibilityHours}시간 미만·결근·1주 전 근로관계 종료 중 해당 이유를 모두 표시합니다. 최근 4주 근무시간이 다르거나 통상근로자 근무표가 주 40시간·5일이 아닌 사업장은 주휴수당 계산기에서 별도로 확인해야 합니다.`,
      },
      {
        heading: `월 ${rules.officialMonthlyPaidHours}시간 계산법과 월급 차이`,
        body: `주 40시간에 유급주휴 ${rules.maximumHolidayHours}시간을 더한 48시간에 365 ÷ 7 ÷ 12를 곱하면 약 208.57시간이고, 이를 월 ${rules.officialMonthlyPaidHours}시간으로 환산합니다. ${minimumWage}원 × ${rules.officialMonthlyPaidHours}시간 = ${monthlyMinimumPay}원이 공식 최저임금 월 환산액입니다. 이 도구는 다른 표준 근무시간에도 같은 방식으로 월 시간을 원 단위 급여 계산에 쓸 정수 시간으로 환산하고 주휴 포함·제외 금액을 나란히 보여줍니다. 특정 달의 실제 출근일을 센 월급이 아니라 평균 환산액이며, 연장·야간·휴일 가산수당, 상여, 퇴직금, 4대보험과 근로소득세는 포함하지 않습니다.`,
      },
      {
        heading: `${rules.year}년 ${businessRate}% 공제는 언제 적용하나요?`,
        body: `국세청 ‘간이지급명세서(거주자의 사업소득)’ 안내는 원천징수대상 사업소득 지급 시 지방소득세를 포함한 ${businessRate}%를 원천징수한다고 설명합니다. 국세청 사업소득 안내의 소득세율은 ${rules.businessIncomeTaxRate * 100}%이고 지방소득세는 그 소득세액의 ${rules.localIncomeTaxShareOfIncomeTax * 100}%입니다. 이 도구는 두 세액을 따로 계산하고 ${rules.treasuryRoundingEffectiveFrom} 시행 국고금 관리법 제47조에 따라 각각 ${rules.taxTruncationUnit}원 미만을 버린 뒤 합산합니다. 두 공식 페이지와 법령을 ${rules.verifiedOn} 확인했습니다. ${businessRate}%는 다음 해 종합소득세 신고에서 정산할 선납세액이지 최종 세금이 아닙니다. 실제로 지휘·감독을 받는 근로자는 계약서에 프리랜서라고 쓰거나 ${businessRate}%를 뗐다는 이유만으로 사업자가 되지 않으므로, 이 옵션은 진짜 사업소득의 단순 공제 예상에만 사용해야 합니다.`,
      },
    ],
    faq: [
      {
        q: `${rules.year}년 최저시급은 얼마인가요?`,
        a: `${rules.year}년 최저임금은 ${rules.effectiveFrom}부터 ${rules.effectiveTo}까지 시간당 ${minimumWage}원입니다. 공식 8시간 일급은 ${dailyMinimumPay}원이고, 주 40시간·유급주휴 ${rules.maximumHolidayHours}시간을 반영한 월 ${rules.officialMonthlyPaidHours}시간 금액은 ${monthlyMinimumPay}원입니다.`,
      },
      {
        q: `최저시급 ${minimumWage}원으로 하루 8시간, 주 5일 일하면 월급은 얼마인가요?`,
        a: `주휴수당 지급조건을 충족하면 ${rules.year}년 최저시급 ${minimumWage}원 × 월 ${rules.officialMonthlyPaidHours}시간 = 세전 ${monthlyMinimumPay}원입니다. 주휴수당, 4대보험·세금, 연장근로 여부에 따라 실제 명세서 금액은 달라질 수 있습니다.`,
      },
      {
        q: `주 ${rules.minimumHolidayEligibilityHours}시간 딱 일하면 주휴수당이 나오나요?`,
        a: `1주 소정근로시간이 정확히 ${rules.minimumHolidayEligibilityHours}시간이면 시간 조건은 충족합니다. 표준 주 5일 비교 근무표에서는 주휴 3시간이지만, 해당 주 소정근로일 개근과 7일간 근로관계 유지 조건도 충족해야 합니다.`,
      },
      {
        q: `알바 월급에서 무조건 ${businessRate}%를 빼나요?`,
        a: `아닙니다. ${businessRate}%는 원천징수대상 사업소득에 적용하는 비율이지 근로자의 일반적인 급여 공제율이 아닙니다. 근로자는 월급과 가입조건에 따라 4대보험과 근로소득세 등이 적용되므로 사업소득 ${businessRate}%와 구분해야 합니다.`,
      },
      {
        q: '5인 미만 사업장도 주휴수당을 받나요?',
        a: `상시근로자 5인 미만 사업장에도 유급 주휴 규정은 일반적으로 적용됩니다. 주 ${rules.minimumHolidayEligibilityHours}시간 이상, 소정근로일 개근, 1주간 근로관계 유지 조건을 충족해야 하며 연장근로 가산수당 적용 여부는 별도 문제입니다.`,
      },
      {
        q: '야간수당·연장수당과 4대보험도 계산되나요?',
        a: '이 계산기는 소정근로시간의 기본 임금과 주휴수당만 환산합니다. 연장·야간·휴일근로 가산수당, 4대보험, 근로소득세, 상여금과 퇴직금은 결과에 포함하지 않습니다.',
      },
    ],
    ui: uiKo,
  },
};
