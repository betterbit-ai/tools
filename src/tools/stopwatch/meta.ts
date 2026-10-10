import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'stopwatch',
  category: 'time',
  icon: 'stopwatch',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['no-ads', 'usability', 'features'],
  competitors: [
    {
      name: 'timeanddate Stopwatch',
      url: 'https://www.timeanddate.com/stopwatch/',
      weakness:
        'Its export dialog offers clipboard output or a text-file download, while Betterbit provides a direct CSV containing lap number, split and total columns. (Strength: it offers configurable alerts and split-label settings.)',
    },
    {
      name: 'W3Schools Online Stopwatch',
      url: 'https://www.w3schools.com/tools/tool_stopwatch.php',
      weakness:
        'The stopwatch page places a “REMOVE ADS” prompt beside its lap controls and documents hundredths-of-a-second display; Betterbit has no ads and shows three millisecond digits with CSV download.',
    },
    {
      name: 'OpenStopwatch',
      url: 'https://openstopwatch.com/',
      weakness:
        'Its public feature list covers keyboard shortcuts, fullscreen, sound, flash alerts and lap recording, but does not list a lap export or refresh-restored session. Betterbit makes CSV download and local session restoration visible in the main tool. (Strength: it includes alert sound choices.)',
    },
    {
      name: 'ReadySetTimer',
      url: 'https://www.rstimer.kr/',
      weakness:
        'The Korean landing page opens on a 25-minute Pomodoro and groups stopwatch work with presentation and note-taking workflows; Betterbit opens directly to a single-purpose stopwatch. (Strength: it supports lap notes, named sessions and presentation timing.)',
    },
    {
      name: 'TheKronometre',
      url: 'https://www.thekronometre.com/ko/',
      weakness:
        'Its Korean FAQ says lap data lives only in the active browser-memory session and is reset on a refresh or tab close unless exported first. Betterbit restores its active or paused session and lap list after refresh. (Strength: it highlights fastest and slowest laps.)',
    },
    {
      name: 'stopwatch-online.com',
      url: 'https://stopwatch-online.com/ko/',
      weakness:
        'Its guide describes an .xlsx lap download and a 1/100-second display; Betterbit offers an interoperable CSV download and visibly shows 1/1,000-second digits. (Strength: it has theme choices and fastest/slowest-lap highlighting.)',
    },
  ],
  related: ['timer', 'word-counter', 'pomodoro-timer', 'countdown'],
};
