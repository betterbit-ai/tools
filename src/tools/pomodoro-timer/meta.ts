import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'pomodoro-timer',
  category: 'time',
  icon: 'timer',
  added: '2026-10-11',
  updated: '2026-10-16',
  edges: ['features', 'usability', 'no-signup'],
  competitors: [
    {
      name: 'Bentodoro',
      url: 'https://www.bentodoro.com/',
      weakness:
        'Its site says signing in is required to save study history, while Betterbit keeps up to 100 tasks and the newest 100 focus sessions locally without an account. (Strength: it offers Reverse mode, a review calendar and a mini Picture-in-Picture timer.)',
    },
    {
      name: 'Pomodoro Timer',
      url: 'https://free-pomodoro-timer.github.io/',
      weakness:
        'Its first screen puts optional music and ambience controls ahead of task and settings overlays, while Betterbit keeps the timer, task list, settings and session log together in the primary view. (Strength: it supports projects, Flow mode and CSV/JSON backup import.)',
    },
    {
      name: 'PomodoroTimers',
      url: 'https://pomodorotimers.com/',
      weakness:
        'Its task editor is a separate Tasks panel after a focus-room setup flow, while Betterbit exposes the selected task, timer settings and task-linked session log together. (Strength: it offers task metadata, streaks, focus rituals and ambient soundscapes.)',
    },
  ],
  related: ['timer', 'stopwatch', 'interval-timer', 'alarm-clock'],
};
