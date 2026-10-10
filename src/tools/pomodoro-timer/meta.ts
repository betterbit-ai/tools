import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'pomodoro-timer',
  category: 'time',
  icon: 'timer',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['features', 'usability', 'no-signup'],
  competitors: [
    {
      name: 'Bentodoro',
      url: 'https://www.bentodoro.com/',
      weakness:
        'Its landing page says that signing in is required to save study history; Betterbit keeps the selected task and newest 100 completed focus sessions locally with no account. (Strength: it supports a Reverse mode for earning breaks.)',
    },
    {
      name: 'openpomodoro',
      url: 'https://www.openpomodoro.com/',
      weakness:
        'Its initial timer exposes a single “main focus” field and a daily-session summary, while Betterbit visibly provides an editable multi-task list and a timestamped task-linked focus-session log. (Strength: it includes useful 45/15 and 50/10 presets.)',
    },
    {
      name: 'ManyHand Timer',
      url: 'https://manyhand.com/timer/',
      weakness:
        'Its Pomodoro panel shows focus and break inputs plus a completed-session number, but not a task list or a history of completed sessions. Betterbit keeps both controls and local session records in the primary view. (Strength: it combines countdown, stopwatch and Pomodoro modes.)',
    },
    {
      name: 'Motitory Timer',
      url: 'https://motitory.com/ko/tools/timer',
      weakness:
        'Its Korean FAQ says closing the page stops the timer and that nothing is saved. Betterbit restores an active or paused Pomodoro and keeps its newest 100 completed focus records in this browser. (Strength: it puts remaining time in the tab title.)',
    },
    {
      name: 'Pomodoro Focus',
      url: 'https://pomodoro-focus-timer.io/ko',
      weakness:
        'Its Korean tool places a sound mixer, Spotify and many external music choices before the task workflow. Betterbit keeps its main interface to timer, task list, settings and session log. (Strength: it offers ambient-audio mixing, music and study rooms.)',
    },
    {
      name: 'Pomodoro Timers',
      url: 'https://pomodoro-timers.com/ko',
      weakness:
        'Its Korean timer exposes focus, short-break and long-break controls with start, reset and skip, but no visible editable task list or timestamped session log. Betterbit makes both available alongside its timer. (Strength: it offers dedicated 30-minute and study-timer pages.)',
    },
  ],
  related: ['timer', 'stopwatch', 'word-counter', 'countdown', 'date-calculator'],
};
