import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'world-clock',
  category: 'time',
  icon: 'clock',
  added: '2026-10-12',
  updated: '2026-10-12',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'The World Clock Meeting Planner',
      url: 'https://www.theworldclockmeeting.com/',
      weakness:
        'Its planner asks people to work through draggable schedules and export/share controls before its 117-hub timeline becomes useful. Betterbit opens directly to four ticking clocks and a compact 24-hour 09:00–17:00 overlap grid. (Strength: it offers share links, calendar exports, and per-person schedules.)',
    },
    {
      name: 'timeanddate.com World Clock',
      url: 'https://www.timeanddate.com/worldclock/',
      weakness:
        'The page places an “Advertising” slot between its three-city personal clock and the worldwide table, and planning lives on a separate Meeting Planner page. Betterbit has no advertising and shows the selected-city working-hours overlap in the same panel. (Strength: it provides weather, sun, and moon information plus a much larger city directory.)',
    },
    {
      name: 'WorldClock.lol Meeting Planner',
      url: 'https://www.worldclock.lol/meeting-planner',
      weakness:
        'Its planner includes a Google Tag Manager iframe and centers on a drag timeline with calendar export controls. Betterbit keeps chosen cities only in browser storage and exposes a keyboard-operable date field and complete hourly overlap summary without an external tracker. (Strength: it supports a visual scrubber, calendar export, and 1,800+ cities.)',
    },
    {
      name: '나우클락 세계시계',
      url: 'https://nowclock.kr/',
      weakness:
        'Its default view starts with 35 major cities and puts meeting conversion below the long city list, so a small recurring set is not immediately focused. Betterbit opens with four compact city cards, lets users save their own list, and calculates a common working-hours window. (Strength: it offers an embeddable clock and a larger default city list.)',
    },
    {
      name: 'tali 세계 시계와 시차 계산기',
      url: 'https://tali.kr/world-clock',
      weakness:
        'Its page combines a converter with a 78-city, continent-by-continent directory and surrounding site links; the visible conversion flow does not identify a simultaneous 09:00–17:00 working-hours window for selected cities. Betterbit keeps live clocks and that overlap result together. (Strength: it documents UTC, GMT, time-zone names, and DST in unusual depth.)',
    },
    {
      name: 'YOHELP 세계 시간 변환기',
      url: 'https://yohelp.net/time-convert.php',
      weakness:
        'Its Korean-time-based list is a fixed set of country rows and says it updates on page refresh, rather than continuously ticking or retaining a personal group of cities. Betterbit updates each second and saves an editable city set in local browser storage. (Strength: it provides Korea-focused stock-market and travel use-case guidance.)',
    },
  ],
  related: ['time-zone-converter', 'timer', 'countdown', 'stopwatch', 'unix-timestamp', 'online-clock'],
};
