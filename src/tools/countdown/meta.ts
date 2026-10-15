import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'countdown',
  category: 'time',
  icon: 'clock',
  added: '2026-10-11',
  updated: '2026-10-14',
  edges: ['usability', 'privacy'],
  competitors: [
    {
      name: 'Tickward',
      url: 'https://tickward.com/',
      weakness:
        'Its public timer links can be revoked and cross-device sync needs an account or restore key. Betterbit stores a one-off event entirely in the browser and in a share link fragment, with no remotely managed timer. (Strength: it supports event time zones, embeds, recurring timers and cross-device sync.)',
    },
    {
      name: 'timeanddate.com Countdown',
      url: 'https://www.timeanddate.com/countdown/create',
      weakness:
        'Its creation page presents 30+ themed designs, a city-based event location and a large site-wide navigation before the event fields, plus advertising. Betterbit opens directly to a compact event form with annual-event presets. (Strength: it supports selected-location DST handling, design themes and a seconds field.)',
    },
    {
      name: 'timer.ly',
      url: 'https://www.timer.ly/',
      weakness:
        'Its target-date flow requires choosing date, hours, minutes and a time zone from long option lists. Betterbit needs only a date (and an optional native time input) for a local event, then updates its share link as you edit. (Strength: it offers duration and past-date timers, explicit time zones, and country holiday calendars.)',
    },
  ],
  related: ['timer', 'stopwatch', 'date-calculator', 'time-zone-converter'],
};
