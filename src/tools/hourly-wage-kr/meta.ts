import type { ToolMeta } from '../types';
import { HOURLY_WAGE_RULES_2026 as rules } from './logic';

export const meta: ToolMeta = {
  slug: 'hourly-wage-kr',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-23',
  updated: '2026-10-23',
  edges: ['features', 'accuracy', 'usability'],
  competitors: [
    {
      name: 'Utilo — Hourly ↔ Monthly Wage Converter (Korea)',
      url: 'https://utilo.co.kr/en/tools/wage-converter/',
      weakness:
        'The opened form switches only between fixed 209-hour and 174-hour bases; it does not take a real days-and-hours schedule, test attendance or full-week employment, explain a failed holiday-pay condition, or preview 3.3% business-income withholding. Betterbit does all four live. (Strength: it supports hourly-to-monthly and monthly-to-hourly conversion and already offers a 2027 preset.)',
    },
    {
      name: 'BellRiver Lab — Hourly ↔ Monthly Wage Calculator',
      url: 'https://bellriver.kr/en/calc/wage',
      weakness:
        'The opened calculator takes one weekly-hours total and an include-holiday switch that assumes every agreed workday was attended; there is no attendance or week-end employment input and no 3.3% preview. Betterbit turns those legal conditions into visible inputs and gives every non-eligibility reason. (Strength: it converts in both directions and has concise English formula text.)',
    },
    {
      name: 'CalcHub — Hourly Wage to Monthly Salary Calculator',
      url: 'https://calc.pe.kr/en/calculators/hourly-wage',
      weakness: `The opened page accepts hourly wage, daily hours and days but does not collect attendance or full-week employment and states that ${rules.minimumHourlyWage.toLocaleString('en-US')} × the 4.345-week calculation is about KRW 2,152,457 before separately citing the official KRW ${rules.officialMonthlyMinimumPay.toLocaleString('en-US')} figure. Betterbit uses the official ${rules.officialMonthlyPaidHours}-hour conversion in the result and explains eligibility. (Strength: its English examples cover full-time, part-time and sub-15-hour schedules.)`,
    },
    {
      name: 'Numsmith — 2026 월급 계산기',
      url: 'https://numsmith.com/tools/hourly-to-monthly',
      weakness:
        '열어 본 도구는 입력 뒤 “계산하기”를 눌러야 하며 주휴수당 계산에서 개근과 1주간 근로관계 유지 여부를 입력받지 않고, 결과가 세전에서 끝난다. Betterbit은 입력 즉시 갱신하고 지급조건별 이유와 사업소득 3.3% 단순 예상액을 함께 보여 준다. (장점: 월급→시급 역산, 시나리오 비교, PDF 저장과 상세한 공식 근거를 제공한다.)',
    },
    {
      name: 'LBtools — 시급 계산기',
      url: 'https://lbtools.co.kr/hourly-wage',
      weakness:
        '열어 본 계산기는 개근 여부를 판단하지 않는다고 직접 밝히며 1일 시간×주 근무일수만으로 주휴수당을 더하고, 세금·4대보험 공제 전 금액만 표시한다. Betterbit은 개근·근로관계 조건을 입력받아 미발생 이유를 표시하고 선택형 3.3% 사업소득 예상을 분리한다. (장점: 엑셀 다운로드와 근무 패턴별 월급표가 있다.)',
    },
    {
      name: 'WorkCal — 시급 계산기',
      url: 'https://workcal.kr/salary/hourly-monthly-converter/',
      weakness:
        '열어 본 도구는 주휴수당 스위치를 켜면 지급요건 충족을 가정한다고 안내하고, 개근·근로관계 조건이나 3.3% 사업소득 공제 선택은 제공하지 않는다. Betterbit은 조건을 직접 확인해 왜 발생하거나 빠졌는지 결과 안에서 설명한다. (장점: 시급→급여와 월급→시급을 한 화면에서 지원하고 시간·분 입력이 가능하다.)',
    },
  ],
  related: ['weekly-holiday-pay-kr', 'salary-calculator-kr', 'social-insurance-kr', 'hours-calculator'],
};
