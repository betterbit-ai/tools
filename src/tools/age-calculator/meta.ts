import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'age-calculator',
  category: 'time',
  icon: 'cake',
  added: '2026-10-11',
  updated: '2026-10-13',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'Cuemath Age Calculator',
      url: 'https://www.cuemath.com/calculators/age-calculator/',
      weakness:
        'Requires entering both dates and pressing “Calculate”; its result is a years/months/days age span and does not show Korean counting age, year age, zodiac or star sign. Betterbit updates as either date changes and shows those Korean age conventions together. (Strength: it supports a chosen comparison date.)',
    },
    {
      name: 'Omni Calculator — Age Calculator',
      url: 'https://www.omnicalculator.com/everyday-life/age',
      weakness:
        'Its age calculator focuses on elapsed time and does not show Korean counting age, year age, Chinese zodiac or a star sign next to the result. Betterbit makes those Korean conventions and date-based facts visible at once. (Strength: it can include a time of birth and express the result in units from milliseconds through years.)',
    },
    {
      name: 'Calculator.net Age Calculator',
      url: 'https://www.calculator.net/age-calculator.html',
      weakness:
        'Requires a calculation action and presents a dense, ad-supported result page without Korean counting age, year age, Chinese zodiac or star sign. Betterbit updates immediately and keeps those Korean age conventions in a single panel. (Strength: it reports elapsed weeks, hours, minutes and seconds in addition to calendar years, months and days.)',
    },
  ],
  related: ['date-calculator', 'countdown', 'bmi-calculator', 'pregnancy-calculator'],
};
