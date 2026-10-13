import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'unemployment-benefit-kr',
  category: 'calculator',
  icon: 'calculator',
  added: '2026-10-13',
  updated: '2026-10-13',
  edges: ['accuracy', 'privacy', 'usability'],
  competitors: [
    {
      name: '고용24 — 실업급여 모의계산',
      url: 'https://www.work24.go.kr/cm/c/f/1100/selecSimulate.do?systId=SI00000411',
      weakness:
        'The opened regular-employee flow asks for the first six digits of a resident-registration number and then expands into dates, three wage rows, and several alternative worker-type forms before the estimate. Betterbit asks no birth-date or ID data, restores only the calculation state in local browser storage, and makes the 2026 cap, hourly floor, and three eligibility checks visible together. (Strength: it is the official simulator and covers day workers, artists, labour providers, self-employed people, and early re-employment.)',
    },
    {
      name: '봉급계산소 — 실업급여(구직급여) 계산기',
      url: 'https://moneywatch.kr/calc/unemployment-benefit',
      weakness:
        'The searched result advertises a 2026 estimate from pre-leaving pay, age, and coverage, but its page could not be opened by the web fetcher to inspect the calculation basis or its treatment of part-time hours. Betterbit exposes the exact KRW 68,100 cap and the 80% minimum-wage floor for each 1–8-hour selection in the result itself. (Strength: its Korean landing result is concise.)',
    },
    {
      name: 'CalcTool — 실업급여 계산기',
      url: 'https://calctool.co.kr/unemployment-benefit-calculator',
      weakness:
        'Its opened form starts with daily average wage, daily ordinary wage, daily hours, coverage period, and special-case selection; the official 2026 floor is explained below the hours selector rather than surfaced as an immediate result. Betterbit keeps a shorter standard-employee path and shows the applied floor, wage-rate, or cap beside the total. (Strength: it supports ordinary-wage comparison and selected special cases that Betterbit intentionally sends to the official simulator.)',
    },
    {
      name: 'WorkCal — Korea Unemployment Benefit Calculator',
      url: 'https://workcal.kr/en/retirement-unemployment/unemployment-benefit-calculator/',
      weakness:
        'Its opened English calculator asks for insured days, coverage years, age, daily wage, hours, separation reason, disability status, unemployment, ability, and job-search status as separate inputs. Betterbit groups the three high-level statutory checks and gives a live breakdown without requesting a date of birth. (Strength: it offers more detailed separation-reason choices and a dedicated English methodology page.)',
    },
    {
      name: 'Kmagpie Tools — Korean Unemployment Benefit Calculator',
      url: 'https://www.kmagpie.com/en/tools/unemployment/',
      weakness:
        'Its opened English form accepts only average monthly pay, coverage years and months, age/disability, and daily hours; it does not collect the 180 insured-unit days or high-level separation/job-search checks before presenting a payout. Betterbit places all three checks next to the estimate and accepts the daily wage used by the statutory formula. (Strength: it provides unusually clear English explanations for foreign residents.)',
    },
    {
      name: 'KBG Tools — Korea Unemployment Benefit Calculator',
      url: 'https://kbgtools.com/en/unemployment-benefit-calculator',
      weakness:
        'The English search result identifies a 2026 daily-and-total calculator, but its page returned a cache miss when opened, leaving its inputs and calculation basis unavailable for review. Betterbit makes its 2026 constants and floor/cap application visible directly in the first result. (Strength: unavailable to assess because the opened page did not load.)',
    },
  ],
  related: ['salary-calculator-kr', 'severance-pay-kr', 'hours-calculator'],
};
