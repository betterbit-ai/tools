import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  intro: 'A standard 9–6 week with a one-hour unpaid lunch is ready to check.',
  standardWeek: 'Use standard week',
  clearWeek: 'Clear week',
  day: 'Day',
  start: 'Start',
  end: 'End',
  break: 'Break (min)',
  dailyTotal: 'Net hours',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
  inputLabel: '{day} {field}',
  overnightHint: 'An end time earlier than its start is calculated as an overnight shift.',
  invalid: 'Check row',
  empty: '—',
  invalidNotice: '{n} row(s) are incomplete or have a break longer than the shift. They are not included in the total.',
  netHours: 'Net hours',
  decimalHours: 'Decimal hours',
  grossHours: 'Time on clock',
  breakTotal: 'Unpaid breaks',
  workedDays: 'Days included',
  copy: 'Copy weekly summary',
  copied: 'Copied',
  copyTemplate: 'Hours worked: {net} ({decimal} decimal hours)\nTime on clock: {gross}\nUnpaid breaks: {break}',
  calculationLabel: 'Calculation',
  calculationHint: 'Only enter unpaid breaks. Paid breaks remain part of work time.',
  formula: 'Net time = time on clock − unpaid breaks',
  saved: 'Your week is saved in this browser only.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Hours Calculator — Weekly Work Hours With Breaks',
    description:
      'Calculate weekly work hours from daily start, end and unpaid-break times. See net time, decimal hours and weekly totals live in your browser, with no ads.',
    h1: 'Hours Calculator',
    tagline: 'Add a week of shifts, deduct unpaid breaks, and get accurate hours and decimals immediately.',
    name: 'Hours Calculator',
    keywords: [
      'work hours calculator',
      'weekly hours calculator',
      'time card calculator',
      'hours worked',
      'lunch break calculator',
    ],
    howTo: [
      'Review the ready-made Monday–Friday 9–6 schedule, or enter your own start and end time for each day.',
      'Enter each day’s unpaid break in minutes; leave it at 0 when no time should be deducted.',
      'Read each daily net time and the weekly total in hours and minutes or decimal hours.',
      'Copy the weekly summary when you need to paste it into a timesheet or message.',
    ],
    sections: [
      {
        heading: 'How weekly work hours are calculated',
        body: 'For each completed row, net work time = (end time − start time) − unpaid breaks. The calculator adds the exact integer minutes from every valid day first, then converts the weekly total to decimal hours. This prevents the rounding differences that come from adding daily decimal values.\n\nIf an end time is earlier than its start time, it is treated as a next-day finish. For example, 22:00–06:00 is 8 hours on the clock; with a 30-minute unpaid break, the net result is 7 hours 30 minutes (7.50 decimal hours). Equal start and end times count as 0 hours.',
      },
      {
        heading: 'Hours and minutes are not decimal hours',
        body: 'A decimal hour is minutes divided by 60, not a clock-style display. 15 minutes is 0.25 hours, 30 minutes is 0.50 hours, and 45 minutes is 0.75 hours. That means 8 hours 30 minutes is 8.50 hours, not 8.30.\n\nUse the hours-and-minutes total to check a time record and the decimal total when a payroll, invoice, or spreadsheet asks for a number of hours.',
      },
      {
        heading: 'What this calculator does and does not decide',
        body: 'Enter only breaks that should be deducted from paid work time. Whether a meal, rest break, on-call period, training, travel, overtime, or rounding rule counts as paid time depends on your workplace rules and applicable law.\n\nThis tool performs time arithmetic only. It does not determine overtime eligibility, premiums, pay, legal break entitlement, or payroll rounding. Check your employer’s policy or a qualified local adviser for those decisions.',
      },
    ],
    faq: [
      {
        q: 'How do I calculate hours worked with a lunch break?',
        a: 'Subtract the unpaid lunch from the elapsed shift time. A 09:00–18:00 shift is 9 hours on the clock; subtracting a 60-minute unpaid lunch gives 8 hours, or 8.00 decimal hours.',
      },
      {
        q: 'How are overnight shifts calculated?',
        a: 'When the end time is earlier than the start time, this calculator treats it as the following day. A 22:00–06:00 shift spans 8 hours before any unpaid break is deducted.',
      },
      {
        q: 'What is 7 hours 45 minutes in decimal hours?',
        a: 'Seven hours 45 minutes is 7.75 decimal hours because 45 divided by 60 equals 0.75. The calculator displays both formats so you do not need to convert it manually.',
      },
      {
        q: 'Are my work times uploaded or stored online?',
        a: 'No. Calculations run in your browser, and the week is saved only in that browser’s local storage to survive a refresh. It is not sent to Betterbit or any payroll service.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '근무시간 계산기 — 휴게시간 제외 주간 합계',
    description:
      '출퇴근 시각과 무급 휴게시간으로 주간 근무시간을 계산합니다. 일별 실근무시간, 시·분 합계와 소수 시간까지 입력 즉시 확인하세요. 광고 없이 브라우저에서만 처리합니다.',
    h1: '근무시간 계산기',
    tagline: '출퇴근 시각과 휴게시간을 넣으면 일별 실근무시간과 주간 합계를 바로 계산합니다.',
    name: '근무시간 계산기',
    keywords: ['근무시간 계산', '근무시간 계산기', '출퇴근 시간 계산', '주간 근무시간', '실근무시간', '휴게시간 계산'],
    howTo: [
      '기본으로 채워진 월~금 09:00~18:00 근무표를 확인하거나 요일별 출퇴근 시각을 입력합니다.',
      '실근무시간에서 뺄 무급 휴게시간을 분 단위로 입력합니다. 차감할 시간이 없으면 0분으로 둡니다.',
      '각 요일의 실근무시간과 오른쪽 주간 합계를 시·분 및 소수 시간으로 확인합니다.',
      '근무시간 요약 복사를 눌러 근태 메모나 메시지에 붙여넣습니다.',
    ],
    sections: [
      {
        heading: '실근무시간 계산식',
        body: '하루 실근무시간은 (퇴근 시각 − 출근 시각) − 무급 휴게시간으로 계산합니다. 유효한 모든 요일의 분 단위 값을 먼저 합산한 뒤, 주간 합계를 소수 시간으로 바꿉니다. 하루별 소수 시간을 반올림해 더할 때 생기는 차이를 피할 수 있습니다.\n\n퇴근 시각이 출근 시각보다 이르면 다음 날 퇴근한 야간 근무로 계산합니다. 예를 들어 22:00~06:00은 체류 8시간이며, 무급 휴게 30분을 빼면 실근무 7시간 30분(7.50시간)입니다. 출퇴근 시각이 같으면 0시간으로 계산합니다.',
      },
      {
        heading: '8시간 30분은 8.30시간이 아닙니다',
        body: '소수 시간은 분을 60으로 나눈 값입니다. 15분은 0.25시간, 30분은 0.50시간, 45분은 0.75시간입니다. 따라서 8시간 30분은 8.30시간이 아니라 8.50시간입니다.\n\n근태 기록을 확인할 때는 시·분 표기를, 급여·정산표에 숫자로 입력해야 할 때는 소수 시간 표기를 사용하면 됩니다.',
      },
      {
        heading: '계산 범위',
        body: '실근무시간에서 제외할 무급 휴게시간만 입력합니다. 휴게, 대기, 교육, 이동 시간이 유급인지와 연장·야간·휴일근로, 수당, 사업장의 절사 규칙은 근로계약과 적용 기준에 따라 달라질 수 있습니다.\n\n이 도구는 입력한 시각의 산술 합계만 보여주며 법정 근로시간, 수당, 휴게 부여 의무나 임금 지급액을 판정하지 않습니다.',
      },
    ],
    faq: [
      {
        q: '점심시간을 빼면 근무시간은 어떻게 계산하나요?',
        a: '09:00 출근, 18:00 퇴근은 체류 9시간입니다. 여기에서 무급 점심시간 60분을 빼면 실근무시간은 8시간, 소수 시간으로는 8.00시간입니다.',
      },
      {
        q: '야간 근무처럼 자정을 넘기면 어떻게 되나요?',
        a: '퇴근 시각이 출근 시각보다 이르면 다음 날 퇴근으로 계산합니다. 22:00 출근, 다음 날 06:00 퇴근은 휴게시간을 빼기 전 8시간입니다.',
      },
      {
        q: '7시간 45분은 소수 시간으로 얼마인가요?',
        a: '7시간 45분은 7.75시간입니다. 45분을 60으로 나누면 0.75이므로 7시간에 더해 7.75가 됩니다.',
      },
      {
        q: '입력한 출퇴근 기록이 서버에 저장되나요?',
        a: '아니요. 계산은 브라우저 안에서만 이루어지고 입력값은 Betterbit이나 급여 서비스로 전송되지 않습니다. 새로고침 대비용으로 현재 브라우저의 로컬 저장소에만 보관됩니다.',
      },
    ],
    ui: {
      intro: '월~금 09:00~18:00, 무급 점심 1시간 근무표가 기본으로 준비되어 있습니다.',
      standardWeek: '기본 근무표',
      clearWeek: '전체 비우기',
      day: '요일',
      start: '출근',
      end: '퇴근',
      break: '휴게(분)',
      dailyTotal: '실근무',
      monday: '월',
      tuesday: '화',
      wednesday: '수',
      thursday: '목',
      friday: '금',
      saturday: '토',
      sunday: '일',
      inputLabel: '{day}요일 {field}',
      overnightHint: '퇴근 시각이 출근 시각보다 이르면 자정을 넘긴 근무로 계산합니다.',
      invalid: '입력 확인',
      empty: '—',
      invalidNotice: '{n}개 행의 입력이 비어 있거나 휴게시간이 근무시간보다 깁니다. 합계에서 제외했습니다.',
      netHours: '실근무 합계',
      decimalHours: '소수 시간',
      grossHours: '총 체류시간',
      breakTotal: '무급 휴게 합계',
      workedDays: '계산한 일수',
      copy: '근무시간 요약 복사',
      copied: '복사됨',
      copyTemplate: '실근무시간: {net} ({decimal}시간)\n총 체류시간: {gross}\n무급 휴게시간: {break}',
      calculationLabel: '계산식',
      calculationHint: '실근무에서 빼야 하는 무급 휴게시간만 입력합니다. 유급 휴게는 빼지 않습니다.',
      formula: '실근무시간 = 체류시간 − 무급 휴게시간',
      saved: '입력한 근무표는 이 브라우저에만 저장됩니다.',
    },
  },
};
