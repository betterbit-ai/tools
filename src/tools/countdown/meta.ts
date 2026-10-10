import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'countdown',
  category: 'time',
  icon: 'clock',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['usability', 'privacy'],
  competitors: [
    {
      name: 'ShortCalc Date Countdown Calculator',
      url: 'https://date-countdown.shortcalc.com/',
      weakness:
        'Its countdown view is a multi-result date-difference calculator with weekday filters and a “Show all 10 results” control, rather than a continuously updating event display with a named share URL. (Strength: it offers working-day and custom-weekday counts.)',
    },
    {
      name: 'Tickward',
      url: 'https://tickward.com/',
      weakness:
        'Its shared timers are server-backed public links that can be revoked, and cross-device sync requires an account or restore key. Betterbit encodes the name, date and time directly in a shareable URL without creating an account or server-side event. (Strength: it supports time zones, embeds and recurring timers.)',
    },
    {
      name: 'I Love Timers Countdown To Date',
      url: 'https://www.ilovetimers.com/countdown-to-date/',
      weakness:
        'Its quick targets are Tomorrow, +7 days and +30 days, and its page describes no saved event management. Betterbit gives named annual-event buttons and keeps the selected event in both local storage and the URL. (Strength: it provides copy, share and fullscreen actions.)',
    },
    {
      name: 'DamdaTools D-day Calculator',
      url: 'https://damdatools.com/dday/',
      weakness:
        'It clearly compares inclusive and exclusive D-day counting and stores events locally, but its visible input has a date only: it does not offer a live hours/minutes/seconds countdown or a URL that opens a selected event. (Strength: it also calculates 100-day and anniversary dates.)',
    },
    {
      name: 'Numsmith Date Calculator',
      url: 'https://numsmith.com/tools/d-day',
      weakness:
        'Its Korean D-day tool combines date differences, date addition and anniversaries behind a calculation action; the result description does not provide a live event clock. Betterbit updates one named countdown every second and keeps its exact date/time in the URL. (Strength: it includes calendar-month and business-day calculations.)',
    },
    {
      name: 'WikiTool D-day Calculator',
      url: 'https://wikitool.co.kr/tools/dday',
      weakness:
        'Its FAQ states that it ignores hours and minutes and does not save events, so it cannot show time remaining to a specific moment or reopen a selected event from a link. Betterbit includes optional local time and a URL-based event state. (Strength: its date-only explanation is concise.)',
    },
  ],
  related: ['timer', 'stopwatch', 'pomodoro-timer'],
};
