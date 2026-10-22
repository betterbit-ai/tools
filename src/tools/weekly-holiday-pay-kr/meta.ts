import type { ToolMeta } from '../types';
import { WEEKLY_HOLIDAY_PAY_RULES_2026 as rules } from './logic';

export const meta: ToolMeta = {
  slug: 'weekly-holiday-pay-kr',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-22',
  updated: '2026-10-22',
  edges: ['accuracy', 'usability'],
  competitors: [
    {
      name: '지팡이 — 주휴수당 계산기',
      url: 'https://jipangi.co.kr/worker/calc/holiday-pay/',
      weakness:
        '열어 본 계산기는 주 소정근로시간 합계와 근무일수를 받지만 요일별 시간이나 직전 3주의 변동 스케줄을 입력받지 않고, 개근을 전제로 계산한다고 명시한다. Betterbit은 요일별 합계, 실제 1~4주 평균, 개근·근로관계 조건을 함께 판정한다. (장점: 주휴수당이 포함된 시급 입력도 지원하고 2026·2027년 선택과 공식 근거·예외 설명이 상세하다.)',
    },
    {
      name: '택스캡 — 주휴수당 계산기',
      url: 'https://taxcap.co.kr/calculators/weekly-holiday-pay',
      weakness: `열어 본 계산기는 동일한 1일 시간×근무일수 또는 주 총시간만 받고 주별 변동시간 입력란과 최저임금 비교 결과가 보이지 않으며, 하단 주의문도 변동 스케줄을 별도 확인 대상으로 남긴다. Betterbit은 주별 합계와 ${rules.year}년 ${rules.minimumHourlyWage.toLocaleString('en-US')}원 비교를 결과에 직접 반영한다. (장점: 주급·월 환산 과정을 표로 선명하게 보여 준다.)`,
    },
    {
      name: 'JIKO — 주휴수당 계산기',
      url: 'https://jiko.kr/calculator/job/holiday-allowance',
      weakness: `${rules.year}년 최신 고시라고 표시하면서 시급 ${rules.previousYearMinimumHourlyWage.toLocaleString('en-US')}원·월 2,096,270원을 사용했는데 이는 ${rules.year - 1}년 금액이다. Betterbit은 ${rules.minimumWageNotice}의 ${rules.year}년 ${rules.minimumHourlyWage.toLocaleString('en-US')}원·월 ${rules.standardMonthlyMinimumPay.toLocaleString('en-US')}원을 적용하고 효력 기간을 밝힌다. (장점: 시간대별 주휴수당 비교표를 한눈에 제공한다.)`,
    },
    {
      name: 'Utilo — Weekly Holiday Pay Calculator (Korea)',
      url: 'https://utilo.co.kr/en/tools/weekly-holiday-pay-calculator/',
      weakness:
        'The opened form accepts one weekly-hours total and full-time workdays, but has no attendance, full-week employment, day-by-day schedule, or prior-week inputs even though its guide mentions the four-week average. Betterbit makes all of those checks calculable and explains each failed condition. (Strength: it offers 2026 and 2027 wage presets and a concise English formula.)',
    },
    {
      name: 'Takehome Korea — Hourly Wage and Weekly Holiday Pay Calculator',
      url: 'https://salary.lumenlab.page/en/hourly/',
      weakness:
        'The opened calculator takes one contractual weekly-hours figure and displays the full-attendance rule without collecting attendance or four-week history. Betterbit accepts seven daily values, variable prior weeks, attendance, and week-end employment. (Strength: it converts both hourly-to-monthly and monthly-to-hourly pay with detailed official sources.)',
    },
    {
      name: 'Seoulstart — Weekly Holiday Pay Calculator',
      url: 'https://seoulstart.com/tools/weekly-holiday-pay',
      weakness:
        'The opened form multiplies one hours-per-day value by selected days and has no fields for variable four-week history or whether employment lasted through the week. Betterbit supports irregular schedules and displays every eligibility reason. (Strength: its English guide clearly covers foreign workers and workplaces with fewer than five workers.)',
    },
  ],
  related: [
    'salary-calculator-kr',
    'severance-pay-kr',
    'unemployment-benefit-kr',
    'hours-calculator',
    'annual-leave-kr',
  ],
};
