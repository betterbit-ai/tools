import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'hours-calculator',
  category: 'time',
  icon: 'clock',
  added: '2026-10-13',
  updated: '2026-10-13',
  edges: ['features', 'usability'],
  competitors: [
    {
      name: 'WorkCalcs Work Hours Calculator',
      url: 'https://workcalcs.com/work-hours-calculator/',
      weakness:
        'Its opened page calculates one shift and directs users to a separate time-card calculator to total seven days; Betterbit keeps seven daily entries, daily net results, and the weekly total in one panel. (Strength: it includes detailed country-specific break and overtime reading that Betterbit intentionally does not provide.)',
    },
    {
      name: 'ClockTotals Work Hours Calculator',
      url: 'https://clocktotals.com/work-hours-calculator/',
      weakness:
        'Its page explicitly says it does not save the week and sends users to a separate weekly-timesheet page for saving; Betterbit restores the current seven-day calculation in browser-local storage. (Strength: it offers an optional hourly rate and a separate printable regular/overtime card.)',
    },
    {
      name: 'PublicSoftTools Hours Calculator',
      url: 'https://www.publicsofttools.com/tools/hours-calculator',
      weakness:
        'Its interface adds at most four unnamed shifts to a day, so a weekly total requires treating days as shifts; Betterbit presents Monday through Sunday separately and shows the net result for every day. (Strength: it supports split shifts within one day and quick single-shift presets.)',
    },
    {
      name: '계산페이지 주간 근무시간 계산기',
      url: 'https://calculatepage.com/calculators/work-hours.html',
      weakness:
        'Its overnight records require choosing “다음 날 퇴근” manually and its guidance says entries disappear on refresh; Betterbit detects an earlier end time as overnight and restores the week in browser-local storage. (장점: 최대 21개 구간, 겹침 경고, CSV 저장을 제공한다.)',
    },
    {
      name: '툴나루 근무시간 계산기',
      url: 'https://toolnaru.com/ko/time/timesheet-calculator',
      weakness:
        'Its first record starts with separate start/end date fields and an empty row, while Betterbit opens as a ready-to-check Monday–Friday 09:00–18:00 week and keeps the basic time arithmetic visible. (장점: 시간대·서머타임, 휴게 구간, 반올림 방식을 세밀하게 설정할 수 있다.)',
    },
    {
      name: '툴쏙 근무시간 계산기',
      url: 'https://toolssok.com/work-hours-calculator/',
      weakness:
        'Its summary combines basic time tracking with night-period, 40-hour comparison, and estimated-pay figures; Betterbit keeps gross time, deducted breaks, net time, and decimal hours together for a concise timesheet check. (장점: 야간 시간대와 시급 기준 예상 급여를 함께 보여준다.)',
    },
  ],
  related: ['timer', 'stopwatch', 'date-calculator', 'time-zone-converter', 'severance-pay-kr'],
};
