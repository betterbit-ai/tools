import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';
import { SOCIAL_INSURANCE_RULES_2026 as rules, calculateSocialInsurance } from './logic';

const comma = (value: number) => Math.round(value).toLocaleString('en-US');
const percent = (rate: number, digits = 4) =>
  `${(rate * 100).toLocaleString('en-US', { maximumFractionDigits: digits })}%`;
const koDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return `${year}년 ${month}월 ${day}일`;
};
const firstHalf = rules.pension.firstHalf;
const secondHalf = rules.pension.secondHalf;
const healthEmployeeMinimum = rules.health.totalPremiumMinimum / 2;
const healthEmployeeMaximum = rules.health.totalPremiumMaximum / 2;
const sample = calculateSocialInsurance({
  pay: 3_000_000,
  payPeriod: 'monthly',
  monthlyNonTaxable: 0,
  pensionPeriod: 'second-half',
  workplaceSize: 'under150',
  industrialAccidentRatePercent: 0,
  coverage: { pension: true, health: true, employment: true },
})!;
const firstHalfHigh = calculateSocialInsurance({
  pay: rules.maximumMonthlyPayInput,
  payPeriod: 'monthly',
  monthlyNonTaxable: 0,
  pensionPeriod: 'first-half',
  workplaceSize: 'under150',
  industrialAccidentRatePercent: 0,
  coverage: { pension: true, health: true, employment: true },
})!;
const secondHalfHigh = calculateSocialInsurance({
  pay: rules.maximumMonthlyPayInput,
  payPeriod: 'monthly',
  monthlyNonTaxable: 0,
  pensionPeriod: 'second-half',
  workplaceSize: 'under150',
  industrialAccidentRatePercent: 0,
  coverage: { pension: true, health: true, employment: true },
})!;

const uiEn = {
  intro: `Compare the employee deduction and employer cost with the official ${rules.year} rates and limits.`,
  autosaved: 'Saved in this browser',
  payPeriodLabel: 'Pay input',
  monthly: 'Monthly pay',
  annual: 'Annual salary',
  monthlyPayLabel: 'Monthly gross pay (KRW)',
  annualPayLabel: 'Annual gross salary (KRW)',
  payHint: 'Enter contractual gross pay before employee deductions. Annual salary is divided evenly by 12.',
  nonTaxableLabel: 'Monthly non-taxable pay (KRW)',
  nonTaxableHint: 'Enter only the amount excluded from social-insurance remuneration on your payslip.',
  pensionPeriodLabel: 'Pension contribution period',
  firstHalf: `Jan–Jun ${rules.year}`,
  secondHalf: `Jul–Dec ${rules.year}`,
  pensionPeriodHint: `The National Pension income floor and ceiling changed on ${secondHalf.effectiveFrom}.`,
  workplaceSizeLabel: 'Workplace size for employment insurance',
  workplaceSizeHint: 'This changes the employer-only employment stability and skills-development contribution.',
  under150: `Under ${rules.employment.workplaceEmployeeThresholds.firstBandExclusive} employees`,
  priority150Plus: `${rules.employment.workplaceEmployeeThresholds.firstBandExclusive}+ (priority-support company)`,
  from150To999: `${rules.employment.workplaceEmployeeThresholds.firstBandExclusive}–${rules.employment.workplaceEmployeeThresholds.topBandMinimum - 1} (non-priority)`,
  atLeast1000: `${comma(rules.employment.workplaceEmployeeThresholds.topBandMinimum)}+ or government`,
  industrialRateLabel: 'Industrial accident rate (%)',
  industrialRateHint: 'Enter the rate on the employer notice, including the commuting-accident rate; use 0 if unknown.',
  coverageHeading: 'Insurance enrollment',
  coverageHint:
    'Keep all on for a standard enrolled employee. Turn off a line only when the agency or employer confirms an exemption.',
  includePension: 'Include National Pension',
  includeHealth: 'Include Health and Long-term Care',
  includeEmployment: 'Include Employment Insurance',
  resultsHeading: 'Estimated monthly contributions',
  employeeTotal: 'Employee contribution',
  employerTotal: 'Employer contribution',
  employeePayAfterInsurance: 'Pay after employee insurance',
  employerLaborCost: 'Pay + employer contribution',
  taxNotice:
    'This is social insurance only. Income tax, local income tax, support subsidies, and settlement adjustments are not included.',
  copyResult: 'Copy result',
  copiedResult: 'Copied',
  invalidInput:
    'Enter positive pay, non-taxable pay no greater than monthly gross pay, and an accident rate from 0% to 100%.',
  item: 'Item',
  employee: 'Employee',
  employer: 'Employer',
  nationalPension: 'National Pension',
  healthInsurance: 'Health Insurance',
  longTermCare: 'Long-term Care',
  employmentInsurance: 'Employment Insurance',
  employmentStability: 'Employment stability & skills',
  industrialAccident: 'Industrial Accident Insurance',
  total: 'Total',
  notApplicable: '—',
  whyHeading: 'Why this result',
  basisSummary:
    'Monthly gross {gross} − excluded pay = {base} contribution base. Employee insurance is {rate} of gross pay in this estimate.',
  reasonAnnualConverted: 'Annual salary was divided by 12, giving monthly gross pay of {gross}.',
  reasonNonTaxable: '{amount} of monthly non-taxable pay was removed, so the contribution base is {base}.',
  reasonPensionThousandFloor: `National Pension drops amounts below KRW ${comma(rules.pension.incomeRoundingUnit)} from reported income; the pension base is {pensionBase}.`,
  reasonPensionMinimum:
    'The reported pension income is below the selected-period floor, so the {minimum} minimum base applies.',
  reasonPensionMaximum:
    'The reported pension income exceeds the selected-period ceiling, so the {maximum} maximum base applies.',
  reasonPensionExcluded: 'National Pension is zero because its enrollment switch is off.',
  reasonHealthMinimum: `The calculated Health Insurance amount is below the ${rules.year} workplace minimum, so the employee minimum applies.`,
  reasonHealthMaximum: `The calculated Health Insurance amount exceeds the ${rules.year} workplace maximum, so the employee maximum applies.`,
  reasonHealthExcluded: 'Health and Long-term Care are zero because their enrollment switch is off.',
  reasonEmploymentExcluded: 'Employment Insurance is zero because its enrollment switch is off.',
  reasonEmployerSize: 'The employer-only employment stability and skills contribution uses the selected {rate} rate.',
  reasonIndustrialEntered: 'Industrial Accident Insurance is employer-only and uses the entered {accidentRate} rate.',
  reasonIndustrialMissing:
    'Industrial Accident Insurance is shown as zero because no industry rate was entered; the employer still owes the applicable notified rate.',
  won: ' KRW',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: `Korea Social Insurance Calculator — ${rules.year} Rates`,
    description: `Calculate ${rules.year} Korean social insurance from monthly pay or annual salary, with employee/employer shares, official limits, and a line-by-line explanation.`,
    h1: 'Korea Social Insurance Calculator',
    tagline: `Calculate employee deductions and employer costs with both ${rules.year} pension periods, benefit limits, and optional industry rates.`,
    name: 'Korea Social Insurance Calculator',
    keywords: [
      'Korea social insurance calculator',
      'Korean four major insurance calculator',
      'Korea payroll contribution calculator',
      `${rules.year} Korean social insurance rates`,
      'employee employer insurance Korea',
      '4 major insurance Korea',
    ],
    howTo: [
      'Choose monthly pay or annual salary and enter the gross amount before employee deductions.',
      'Enter the monthly pay that your payslip treats as non-taxable for social-insurance purposes.',
      `Choose Jan–Jun or Jul–Dec ${rules.year} so the correct National Pension floor and ceiling apply.`,
      'Choose the workplace-size band and enter the employer’s notified Industrial Accident Insurance rate if known.',
      'Keep the enrollment switches on for a standard employee, or turn off a confirmed exemption.',
      'Compare the employee and employer columns, then read why each limit or zero amount was applied.',
    ],
    sections: [
      {
        heading: `Official Korean social-insurance rates for ${rules.year}`,
        body: `National Pension is ${percent(rules.pension.totalRate)} in ${rules.year}, split ${percent(rules.pension.employeeRate)} each between employee and employer. The National Pension Service applies a KRW ${comma(firstHalf.minimumBase)}–${comma(firstHalf.maximumBase)} standard-income band from ${firstHalf.effectiveFrom} through ${firstHalf.effectiveTo}, and KRW ${comma(secondHalf.minimumBase)}–${comma(secondHalf.maximumBase)} from ${secondHalf.effectiveFrom} through ${secondHalf.effectiveTo}. Workplace Health Insurance is ${percent(rules.health.totalRate)}, split ${percent(rules.health.employeeRate)} each. Long-term Care is calculated as the Health premium × ${percent(rules.longTermCare.incomeRate)} ÷ ${percent(rules.health.totalRate)}, which is approximately ${percent(rules.longTermCare.healthPremiumRatio, 2)} of Health Insurance. Employment Insurance for unemployment benefits is ${percent(rules.employment.unemploymentEmployeeRate)} each, and the employer adds ${Object.values(
          rules.employment.stabilityRates,
        )
          .map((rate) => percent(rate))
          .join(
            ', ',
          )} for employment stability and skills development. Sources and effective dates: ${rules.sources.pensionRate.authority} rate effective ${rules.sources.pensionRate.effectiveFrom} and income-base notice published ${rules.sources.pensionIncomeBase.publishedOn}; ${rules.sources.healthAndLongTermCare.authority} premium notice effective ${rules.sources.healthAndLongTermCare.effectiveFrom}; and ${rules.sources.employment.authority} insurance-rate guidance current from ${rules.sources.employment.currentFrom}.`,
      },
      {
        heading: 'Who should use the enrollment switches?',
        body: `The default models an ordinary workplace employee enrolled in National Pension, Health and Long-term Care, Employment, and Industrial Accident Insurance. Coverage is not identical for every worker. National Pension normally covers workplace employees under age ${rules.coverageGuidance.pensionMaximumAgeExclusive}; short-time and daily-worker tests can use contract duration, ${rules.coverageGuidance.monthlyHoursThreshold} monthly hours, ${rules.coverageGuidance.dailyWorkerDaysThreshold} workdays, and a notified income threshold. Workplace Health Insurance generally excludes a worker employed for less than ${rules.coverageGuidance.minimumEmploymentMonths} month and a short-time worker below ${rules.coverageGuidance.monthlyHoursThreshold} monthly hours. Employment Insurance generally excludes less than ${rules.coverageGuidance.monthlyHoursThreshold} monthly hours or ${rules.coverageGuidance.weeklyHoursThreshold} weekly hours, with exceptions including a person employed continuously for ${rules.coverageGuidance.continuousEmploymentExceptionMonths} months and a daily worker. Foreign nationals can also be affected by visa class, reciprocity, or a social-security agreement. These are eligibility rules, not simple rate calculations, so confirm the actual enrollment with the relevant agency and switch off only the confirmed line.`,
      },
      {
        heading: 'Limits, rounding, and why a payslip can differ',
        body: `The calculator removes monthly non-taxable remuneration, rounds the National Pension income base down below KRW ${comma(rules.pension.incomeRoundingUnit)}, applies the selected floor or ceiling, and drops premium amounts below KRW ${comma(rules.premiumRoundingUnit)}. The ${rules.year} total workplace Health Insurance premium has a KRW ${comma(rules.health.totalPremiumMinimum)} floor and KRW ${comma(rules.health.totalPremiumMaximum)} ceiling, so the employee half is KRW ${comma(healthEmployeeMinimum)} to KRW ${comma(healthEmployeeMaximum)} before Long-term Care. Industrial Accident Insurance is fully employer-paid and varies by industry and workplace record; enter the rate shown on the employer notice rather than assuming the national ${rules.year} average of ${percent(rules.industrialAccidentAverageRate)}. Actual bills can differ because agencies use reported prior-period remuneration, mid-month qualification dates, annual settlement, multiple workplaces, Duru-nuri support, or an individually adjusted accident rate. Official references are ${rules.sources.healthAndLongTermCare.limitNotice}, effective ${rules.sources.healthAndLongTermCare.effectiveFrom}, and ${rules.sources.industrialAccident.authority} ${rules.sources.industrialAccident.notice}, effective ${rules.sources.industrialAccident.effectiveFrom}.`,
      },
    ],
    faq: [
      {
        q: `What are the employee social-insurance rates in Korea for ${rules.year}?`,
        a: `For a standard workplace employee in ${rules.year}, the employee pays National Pension ${percent(rules.pension.employeeRate)}, Health Insurance ${percent(rules.health.employeeRate)}, Long-term Care using Health premium × ${percent(rules.longTermCare.incomeRate)} ÷ ${percent(rules.health.totalRate)}, and Employment Insurance ${percent(rules.employment.unemploymentEmployeeRate)}. Pension and Health limits can change the effective percentage.`,
      },
      {
        q: `What is the National Pension cap in Korea in ${rules.year}?`,
        a: `The National Pension standard monthly income ceiling is KRW ${comma(firstHalf.maximumBase)} through ${firstHalf.effectiveTo} and KRW ${comma(secondHalf.maximumBase)} from ${secondHalf.effectiveFrom}. The corresponding employee maximum at ${percent(rules.pension.employeeRate)}, after dropping amounts below KRW ${comma(rules.premiumRoundingUnit)}, is KRW ${comma(firstHalfHigh.employee.pension)} or KRW ${comma(secondHalfHigh.employee.pension)} per month.`,
      },
      {
        q: 'Does a Korean employer pay the same social insurance as the employee?',
        a: `The employer matches National Pension, Health, Long-term Care, and the ${percent(rules.employment.unemploymentEmployerRate)} unemployment-benefit contribution, then additionally pays ${percent(Math.min(...Object.values(rules.employment.stabilityRates)))}–${percent(Math.max(...Object.values(rules.employment.stabilityRates)))} for employment stability and skills development plus the full industry-specific Industrial Accident Insurance premium.`,
      },
      {
        q: 'Are part-time workers required to join Korea’s four social insurances?',
        a: `Coverage depends on the insurance and facts such as contract duration, monthly or weekly hours, workdays, income, age, and worker type. A worker below ${rules.coverageGuidance.monthlyHoursThreshold} monthly hours can be excluded from some lines, but daily workers, continuous employment, or income tests create exceptions; confirm each enrollment instead of switching off all insurance automatically.`,
      },
      {
        q: 'Why is the calculated amount different from my Korean payslip?',
        a: 'A payslip can differ because National Pension and Health Insurance may use remuneration reported from an earlier period, while qualification dates, annual settlement, several workplaces, subsidies, and agency rounding also matter. Compare the calculator’s contribution base with the base recorded on the bill.',
      },
      {
        q: 'Does this calculator include Korean income tax?',
        a: 'No. The pay-after-insurance figure subtracts only the selected employee social-insurance contributions. Income tax and local income tax depend on taxable pay, dependents, children, and withholding elections; use the related Korea salary calculator for estimated take-home pay.',
      },
      {
        q: 'Is Industrial Accident Insurance deducted from an employee’s salary?',
        a: `No. Industrial Accident Insurance is fully paid by the employer. The ${rules.year} national average rate is ${percent(rules.industrialAccidentAverageRate)}, but the applicable rate varies by industry and can be adjusted by workplace record, so this calculator uses the rate entered from the employer notice.`,
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: `4대보험 계산기 — ${rules.year}년 요율·근로자 사업주 부담`,
    description: `${rules.year}년 4대보험 요율로 월급·연봉의 근로자 공제액과 사업주 부담을 계산합니다. 상·하한과 비과세, 사업장 규모를 반영하고 산출 이유도 보여줍니다.`,
    h1: '4대보험 계산기',
    tagline: `${rules.year}년 상·하반기 국민연금 기준과 건강보험 상·하한을 적용해 근로자·사업주 부담과 계산 이유를 함께 확인합니다.`,
    name: '4대보험 계산기',
    keywords: [
      '4대보험 계산기',
      `4대보험 요율 ${rules.year}`,
      '4대보험료 계산기',
      '월급 4대보험 계산',
      '사업주 4대보험 계산기',
      '알바 4대보험 계산기',
      '4대보험 요율표',
    ],
    howTo: [
      '월급 또는 연봉을 고르고 근로자 공제 전 세전 금액을 입력합니다.',
      '급여명세서에서 사회보험 보수에 포함되지 않는 월 비과세 금액을 입력합니다.',
      `보험료를 맞춰 볼 달에 따라 ${rules.year}년 1~6월 또는 7~12월 국민연금 기준을 고릅니다.`,
      '사업장 규모를 고르고 사업주 고지서의 산재보험료율을 알면 입력합니다.',
      '일반 직장가입자는 가입 스위치를 모두 켜고, 공단에서 적용 제외를 확인한 항목만 끕니다.',
      '근로자·사업주 항목별 금액과 상한·하한 또는 0원이 적용된 이유를 확인합니다.',
    ],
    sections: [
      {
        heading: `${rules.year}년 4대보험 요율과 적용 기간`,
        body: `${rules.year}년 국민연금 보험료율은 총 ${percent(rules.pension.totalRate)}로 근로자와 사용자가 각각 ${percent(rules.pension.employeeRate)}를 부담합니다. ${rules.sources.pensionIncomeBase.authorityKo}이 ${koDate(rules.sources.pensionIncomeBase.publishedOn)} 안내한 기준소득월액은 ${koDate(firstHalf.effectiveTo)}까지 하한 ${comma(firstHalf.minimumBase)}원·상한 ${comma(firstHalf.maximumBase)}원, ${koDate(secondHalf.effectiveFrom)}부터 ${koDate(secondHalf.effectiveTo)}까지 하한 ${comma(secondHalf.minimumBase)}원·상한 ${comma(secondHalf.maximumBase)}원입니다. 건강보험은 ${koDate(rules.sources.healthAndLongTermCare.effectiveFrom)}부터 총 ${percent(rules.health.totalRate)}, 근로자·사용자 각각 ${percent(rules.health.employeeRate)}입니다. 장기요양보험은 건강보험료 × ${percent(rules.longTermCare.incomeRate)} ÷ ${percent(rules.health.totalRate)}로 계산하며 건강보험료 대비 표시 요율은 약 ${percent(rules.longTermCare.healthPremiumRatio, 2)}입니다. 고용보험 실업급여분은 근로자·사업주 각각 ${percent(rules.employment.unemploymentEmployeeRate)}이고, 사업주는 고용안정·직업능력개발사업 ${Object.values(
          rules.employment.stabilityRates,
        )
          .map((rate) => percent(rate))
          .join(
            '·',
          )} 중 사업장 규모에 맞는 요율을 더 냅니다. 출처와 시행일은 ${rules.sources.pensionRate.authorityKo} 보험료 안내(${koDate(rules.sources.pensionRate.effectiveFrom)}), ${rules.sources.healthAndLongTermCare.authorityKo} 보험료율 안내(${koDate(rules.sources.healthAndLongTermCare.effectiveFrom)}), ${rules.sources.employment.authorityKo} 고용보험료 안내(${koDate(rules.sources.employment.currentFrom)}부터 현행)입니다.`,
      },
      {
        heading: '알바·단시간·일용근로자도 4대보험에 가입하나요?',
        body: `기본값은 네 보험에 가입한 일반 직장근로자입니다. 보험마다 적용 조건이 같지는 않습니다. 국민연금은 원칙적으로 ${rules.coverageGuidance.pensionMaximumAgeExclusive}세 미만 사업장 근로자가 대상이며, 단시간·일용근로자는 ${rules.coverageGuidance.minimumEmploymentMonths}개월 근로 여부와 월 ${rules.coverageGuidance.monthlyHoursThreshold}시간, 월 ${rules.coverageGuidance.dailyWorkerDaysThreshold}일, 고시 소득기준 등으로 판단합니다. 건강보험 직장가입은 ${rules.coverageGuidance.minimumEmploymentMonths}개월 미만 일용근로자나 월 ${rules.coverageGuidance.monthlyHoursThreshold}시간 미만 단시간근로자 등이 제외될 수 있습니다. 고용보험은 ${rules.year}년 기준 월 소정근로시간 ${rules.coverageGuidance.monthlyHoursThreshold}시간 미만 또는 주 ${rules.coverageGuidance.weeklyHoursThreshold}시간 미만이면 원칙적으로 제외되지만, ${rules.coverageGuidance.continuousEmploymentExceptionMonths}개월 이상 계속 근로하거나 일용근로자인 경우 같은 예외가 있습니다. 산재보험은 근로자 부담 없이 사업주가 전액 부담합니다. 나이·계약·근로시간·체류자격·다른 공적연금에 따라 결론이 달라지므로 공단이나 회사에서 실제 가입 항목을 확인한 뒤 해당 스위치만 끕니다.`,
      },
      {
        heading: '계산 방법과 급여명세서가 다른 이유',
        body: `월 세전 급여에서 사회보험 보수에 포함되지 않는 비과세 금액을 뺀 뒤 항목별 요율을 적용합니다. 국민연금 기준소득월액은 ${comma(rules.pension.incomeRoundingUnit)}원 미만을 버리고 선택한 기간의 상·하한을 적용하며, 보험료는 ${comma(rules.premiumRoundingUnit)}원 미만을 버립니다. ${rules.sources.healthAndLongTermCare.limitNoticeKo}(${koDate(rules.sources.healthAndLongTermCare.effectiveFrom)} 시행)에 따른 직장가입자 건강보험료 총액은 월 최저 ${comma(rules.health.totalPremiumMinimum)}원·최고 ${comma(rules.health.totalPremiumMaximum)}원이므로 근로자 몫은 ${comma(healthEmployeeMinimum)}원~${comma(healthEmployeeMaximum)}원입니다. 산재보험은 ${rules.sources.industrialAccident.noticeKo}(${koDate(rules.sources.industrialAccident.effectiveFrom)} 시행)의 업종별 요율과 사업장별 개별실적요율이 있어 고지서 요율을 직접 넣어야 하며, ${rules.year}년 전체 평균 ${percent(rules.industrialAccidentAverageRate)}는 참고값일 뿐입니다. 실제 고지액은 전년도 보수로 정한 기준, 입·퇴사월, 보수총액 정산, 복수 사업장, 두루누리 지원 때문에 달라질 수 있습니다.`,
      },
    ],
    faq: [
      {
        q: `${rules.year}년 4대보험 근로자 부담률은 얼마인가요?`,
        a: `${rules.year}년 일반 직장가입자는 국민연금 ${percent(rules.pension.employeeRate)}, 건강보험 ${percent(rules.health.employeeRate)}, 장기요양보험은 건강보험료 × ${percent(rules.longTermCare.incomeRate)} ÷ ${percent(rules.health.totalRate)}, 고용보험 실업급여분 ${percent(rules.employment.unemploymentEmployeeRate)}를 부담합니다. 상·하한이 적용되지 않는 구간의 합계는 약 ${percent(rules.pension.employeeRate + rules.health.employeeRate + rules.health.employeeRate * rules.longTermCare.healthPremiumRatio + rules.employment.unemploymentEmployeeRate, 3)}입니다.`,
      },
      {
        q: `${rules.year}년 국민연금 상한액과 하한액은 얼마인가요?`,
        a: `${rules.year}년 1~6월 기준소득월액은 ${comma(firstHalf.minimumBase)}원~${comma(firstHalf.maximumBase)}원이고, 7월부터는 ${comma(secondHalf.minimumBase)}원~${comma(secondHalf.maximumBase)}원입니다. 근로자 최고 부담액은 ${percent(rules.pension.employeeRate)}를 적용하고 ${comma(rules.premiumRoundingUnit)}원 미만을 버려 상반기 ${comma(firstHalfHigh.employee.pension)}원, 하반기 ${comma(secondHalfHigh.employee.pension)}원입니다.`,
      },
      {
        q: `월급 300만 원이면 ${rules.year}년 4대보험은 얼마인가요?`,
        a: `비과세가 없고 ${rules.year}년 하반기 일반 직장가입자라면 근로자 부담은 국민연금 ${comma(sample.employee.pension)}원, 건강보험 ${comma(sample.employee.health)}원, 장기요양 ${comma(sample.employee.longTermCare)}원, 고용보험 ${comma(sample.employee.employment)}원으로 합계 ${comma(sample.employee.total)}원입니다. 소득세와 지방소득세는 별도입니다.`,
      },
      {
        q: '사업주 4대보험 부담이 근로자보다 큰 이유는 무엇인가요?',
        a: `사업주는 국민연금·건강보험·장기요양·고용보험 실업급여분을 근로자와 나눠 내고, 여기에 고용안정·직업능력개발사업 ${percent(Math.min(...Object.values(rules.employment.stabilityRates)))}~${percent(Math.max(...Object.values(rules.employment.stabilityRates)))}와 업종별 산재보험료를 전액 추가 부담하기 때문입니다.`,
      },
      {
        q: '알바도 4대보험에 가입해야 하나요?',
        a: `알바라는 이름만으로 가입 여부가 정해지지는 않습니다. 보험별로 계약기간, 월 ${rules.coverageGuidance.monthlyHoursThreshold}시간 또는 주 ${rules.coverageGuidance.weeklyHoursThreshold}시간, 월 근로일수, 월 소득, 나이 등을 따지며 ${rules.coverageGuidance.continuousEmploymentExceptionMonths}개월 이상 계속 근로자와 일용근로자에는 예외도 있으므로 각 공단의 실제 자격을 확인해야 합니다.`,
      },
      {
        q: '4대보험 계산기 결과와 급여명세서가 왜 다른가요?',
        a: '공단은 국민연금·건강보험에 전년도 신고 보수를 적용할 수 있고, 입·퇴사일, 보수총액 정산, 복수 사업장, 두루누리 지원, 회사의 끝수 처리도 실제 금액을 바꿉니다. 계산 결과의 보수월액과 고지서의 기준금액부터 비교합니다.',
      },
      {
        q: '산재보험료도 근로자 월급에서 공제하나요?',
        a: `산재보험료는 사업주가 전액 부담하므로 근로자 급여에서 공제하지 않습니다. ${rules.year}년 평균 산재보험료율은 ${percent(rules.industrialAccidentAverageRate)}지만 업종과 개별실적에 따라 달라지므로 사업주 고지서에 적힌 실제 요율을 입력해야 합니다.`,
      },
      {
        q: '두루누리 지원을 계산 결과에 반영하나요?',
        a: `이 계산기는 두루누리 지원 전 보험료를 보여줍니다. ${rules.year}년 국민연금공단 안내 기준으로 ${rules.coverageGuidance.durunuriEmployeeCountExclusive}명 미만 사업장의 월평균보수 ${comma(rules.coverageGuidance.durunuriMonthlyPayExclusive)}원 미만 신규 가입근로자는 소득·재산 요건 등을 충족하면 국민연금과 고용보험료의 최대 ${percent(rules.coverageGuidance.durunuriMaximumSupportRate, 0)}를 지원받을 수 있습니다.`,
      },
    ],
    ui: {
      intro: `${rules.year}년 공식 요율과 상·하한으로 근로자 공제액과 사업주 부담을 비교합니다.`,
      autosaved: '입력값은 이 브라우저에 저장됩니다',
      payPeriodLabel: '급여 입력 방식',
      monthly: '월급',
      annual: '연봉',
      monthlyPayLabel: '세전 월급(원)',
      annualPayLabel: '세전 연봉(원)',
      payHint: '근로자 공제 전 계약상 총급여를 입력합니다. 연봉은 12개월로 똑같이 나눕니다.',
      nonTaxableLabel: '월 비과세 급여(원)',
      nonTaxableHint: '급여명세서에서 사회보험 보수에 포함되지 않는 금액만 입력합니다.',
      pensionPeriodLabel: '국민연금 적용 기간',
      firstHalf: `${rules.year}년 1~6월`,
      secondHalf: `${rules.year}년 7~12월`,
      pensionPeriodHint: `국민연금 기준소득월액 상·하한은 ${koDate(secondHalf.effectiveFrom)}에 바뀌었습니다.`,
      workplaceSizeLabel: '고용보험 사업장 규모',
      workplaceSizeHint: '사업주만 내는 고용안정·직업능력개발사업 보험료율이 달라집니다.',
      under150: `${rules.employment.workplaceEmployeeThresholds.firstBandExclusive}명 미만`,
      priority150Plus: `${rules.employment.workplaceEmployeeThresholds.firstBandExclusive}명 이상 우선지원대상기업`,
      from150To999: `${rules.employment.workplaceEmployeeThresholds.firstBandExclusive}~${rules.employment.workplaceEmployeeThresholds.topBandMinimum - 1}명 비우선지원기업`,
      atLeast1000: `${comma(rules.employment.workplaceEmployeeThresholds.topBandMinimum)}명 이상·국가·지자체`,
      industrialRateLabel: '산재보험료율(%)',
      industrialRateHint: '출퇴근재해 요율을 포함한 사업주 고지서 요율을 입력합니다. 모르면 0으로 둡니다.',
      coverageHeading: '보험 가입 항목',
      coverageHint: '일반 직장가입자는 모두 켭니다. 공단이나 회사가 적용 제외를 확인한 항목만 끕니다.',
      includePension: '국민연금 포함',
      includeHealth: '건강보험·장기요양 포함',
      includeEmployment: '고용보험 포함',
      resultsHeading: '월 예상 4대보험료',
      employeeTotal: '근로자 부담',
      employerTotal: '사업주 부담',
      employeePayAfterInsurance: '4대보험 공제 후 급여',
      employerLaborCost: '월급 + 사업주 부담',
      taxNotice: '4대보험만 계산한 금액입니다. 소득세·지방소득세, 보험료 지원과 정산액은 포함하지 않습니다.',
      copyResult: '결과 복사',
      copiedResult: '복사됨',
      invalidInput: `급여는 0보다 크게, 월 비과세액은 월급 이하로, 산재보험료율은 0~${rules.maximumIndustrialAccidentRatePercent}%로 입력해야 합니다.`,
      item: '항목',
      employee: '근로자',
      employer: '사업주',
      nationalPension: '국민연금',
      healthInsurance: '건강보험',
      longTermCare: '장기요양보험',
      employmentInsurance: '고용보험 실업급여',
      employmentStability: '고용안정·직업능력개발',
      industrialAccident: '산재보험',
      total: '합계',
      notApplicable: '—',
      whyHeading: '이 금액이 나온 이유',
      basisSummary:
        '월 세전 {gross} − 제외 금액 = 보수월액 {base}입니다. 이 계산의 근로자 보험료는 세전 월급의 {rate}입니다.',
      reasonAnnualConverted: '연봉을 12개월로 나눠 월 세전 급여 {gross}을 적용했습니다.',
      reasonNonTaxable: '월 비과세 {amount}을 빼서 보험료 보수월액은 {base}입니다.',
      reasonPensionThousandFloor: `국민연금 신고소득의 ${comma(rules.pension.incomeRoundingUnit)}원 미만을 버려 기준소득월액 {pensionBase}을 적용했습니다.`,
      reasonPensionMinimum:
        '국민연금 신고소득이 선택한 기간의 하한보다 낮아 최소 기준소득월액 {minimum}을 적용했습니다.',
      reasonPensionMaximum: '국민연금 신고소득이 선택한 기간의 상한을 넘어 최대 기준소득월액 {maximum}을 적용했습니다.',
      reasonPensionExcluded: '국민연금 가입 스위치를 꺼서 국민연금은 0원입니다.',
      reasonHealthMinimum: `계산한 건강보험료가 ${rules.year}년 직장가입자 하한보다 낮아 근로자 최저 보험료를 적용했습니다.`,
      reasonHealthMaximum: `계산한 건강보험료가 ${rules.year}년 직장가입자 상한을 넘어 근로자 최고 보험료를 적용했습니다.`,
      reasonHealthExcluded: '건강보험·장기요양 가입 스위치를 꺼서 두 항목은 0원입니다.',
      reasonEmploymentExcluded: '고용보험 가입 스위치를 꺼서 고용보험은 0원입니다.',
      reasonEmployerSize: '사업주 고용안정·직업능력개발 보험료는 선택한 사업장 규모의 {rate}를 적용했습니다.',
      reasonIndustrialEntered: '산재보험은 사업주 전액 부담이며 입력한 {accidentRate} 요율을 적용했습니다.',
      reasonIndustrialMissing:
        '업종별 산재보험료율을 입력하지 않아 0원으로 표시했습니다. 실제 적용 요율은 사업주가 별도로 부담합니다.',
      won: '원',
    },
  },
};
