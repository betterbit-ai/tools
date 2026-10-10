import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'time-zone-converter',
  category: 'time',
  icon: 'clock',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['no-ads', 'privacy', 'usability', 'accuracy'],
  competitors: [
    {
      name: 'timezoneconverter.co',
      url: 'https://www.timezoneconverter.co/',
      weakness:
        'Its converter opens with “Your time zone” and India, while its first visible result area does not expose the exact IANA names or both UTC offsets. Betterbit keeps the selected IANA zone, both date/time results, both offsets and date change together. (Strength: it also has a multi-city meeting planner and calendar links.)',
    },
    {
      name: 'NowZones',
      url: 'https://nowzones.com/convert',
      weakness:
        'Its converter starts from Bangalore and Bangkok and presents one worked pair at a time; the page copy does not provide a city-alias search for Korean names or a warning for skipped/repeated DST clock times. Betterbit searches Korean and English city aliases and makes both DST edge cases visible. (Strength: it explains why ambiguous abbreviations should be avoided.)',
    },
    {
      name: 'TimesZoneConverter.com',
      url: 'https://timeszoneconverter.com/',
      weakness:
        'Its visible converter is a multi-city comparison grid with 12/24-hour controls, but the landing page does not show a source date/time field or a skipped/repeated-local-time warning. Betterbit starts with a precise source date/time conversion and identifies both DST edge cases. (Strength: it includes a world clock, meeting finder and forex session tracker.)',
    },
    {
      name: 'modatrip 시차 계산기',
      url: 'https://modatrip.com/time-zone-calculator/',
      weakness:
        'Its main flow fixes the source at Korea and offers 30 destination cities. Betterbit permits either city as the source, accepts IANA identifiers, and searches Korean and English city aliases. (Strength: it adds Korea-focused family-call, jet-lag and arrival-planning modes.)',
    },
    {
      name: '계산기랩 시차 계산기',
      url: 'https://calculab.net/time-diff/',
      weakness:
        'It supports 40 cities and adds Korean-time US stock-market hours, but its city selector does not expose an IANA-zone entry or a repeated/skipped-local-time warning in the conversion flow. Betterbit shows the chosen IANA zone, exact offset and DST edge cases. (Strength: it includes useful Korea-based market-hour context.)',
    },
    {
      name: 'Toolbase 시차 계산기',
      url: 'https://toolbase.cc/ko/datetime/clock/timezone',
      weakness:
        'Its form requires a separate “변환” action and renders the destination as a template result; the visible interface does not surface a date-change label or DST-transition warning. Betterbit updates results live and shows both of those scheduling checks. (Strength: it offers a multilingual IANA-zone reference.)',
    },
  ],
  related: ['timer', 'stopwatch', 'countdown', 'pomodoro-timer'],
};
