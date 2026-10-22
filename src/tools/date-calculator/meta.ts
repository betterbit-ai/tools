import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'date-calculator',
  category: 'time',
  icon: 'calendar',
  added: '2026-10-11',
  updated: '2026-10-14',
  edges: ['usability'],
  competitors: [
    {
      name: 'Calculator.net Date Calculator',
      url: 'https://www.calculator.net/date-calculator.html',
      weakness:
        'Its business-day settings are mainly geared to US holidays; another country’s holidays require manually filling repeated name/month/day fields before calculating. Betterbit applies the US or South Korea calendar immediately with one selector. (Strength: it lets users define an arbitrary holiday list, which Betterbit does not.)',
    },
    {
      name: 'timeanddate.com Business Days Calculator',
      url: 'https://www.timeanddate.com/date/workdays.html',
      weakness:
        'It separates date-to-date, business-day, and add/subtract calculations into different tools, and its help acknowledges a known issue where changing country or state deletes the entered dates. Betterbit keeps both calculation modes and the holiday selector in one immediately updating panel. (Strength: it covers many more country and state holiday calendars.)',
    },
    {
      name: 'utilo.kr 날짜 계산기',
      url: 'https://utilo.kr/date/',
      weakness:
        'Its holiday-calendar mode covers South Korea only, so US federal holidays are not an option. Betterbit lets a user switch between Korean and US holiday calendars without leaving the calculation. (Strength: it has a separate D-Day mode and explains its holiday sources and coverage in more detail.)',
    },
  ],
  related: ['age-calculator', 'countdown', 'hours-calculator', 'unix-timestamp', 'annual-leave-kr'],
};
