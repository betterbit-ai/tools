import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'alarm-clock',
  category: 'time',
  icon: 'clock',
  added: '2026-10-12',
  updated: '2026-10-28',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'Online Alarm Clock',
      url: 'https://onlinealarmclock.co/en',
      weakness:
        'Its setup combines 12/24-hour choice, four repeat presets, individual weekday buttons and sound choices before the alarm list; Betterbit keeps one 24-hour local-time field, a label and visible per-alarm enable switch together. (Strength: it offers eight sounds, gentle wake, screen wake lock and configurable repeat days.)',
    },
    {
      name: 'Free Online Clock',
      url: 'https://free-onlineclock.com/',
      weakness:
        'Its page loads a Yandex tracking resource and pushes a large directory of separate half-hour alarm pages before the main setup; Betterbit has no tracking or ads and keeps multiple saved alarms on one focused page. (Strength: it provides many pre-set time landing pages and a flip-clock display.)',
    },
    {
      name: 'OnlineAlarmClock.io',
      url: 'https://onlinealarmclock.io/en/',
      weakness:
        'Its search-leading page opens as a catalogue for 16+ time tools and links onward to the alarm, while Betterbit opens directly to the alarm controls and next-alarm list. (Strength: it advertises 15 sounds and unlimited simultaneous alarms.)',
    },
    {
      name: 'kClock',
      url: 'https://www.kclock.kr/',
      weakness:
        'Its Korean alarm setup exposes sound testing, custom audio and display customization, but its main page labels its saved area as a recent-alarm list rather than a visible concurrent enabled-alarm list; Betterbit shows and toggles each active alarm together. (Strength: it supports custom audio and display-font settings.)',
    },
    {
      name: 'AlarmClockOnline.com',
      url: 'https://www.alarmclockonline.com/ko',
      weakness:
        'Its Korean page interleaves alarm creation with clock, stopwatch, timer, city-time and converter sections; Betterbit keeps setting, testing, next-alarm status and saved alarms inside one compact tool panel. (Strength: it offers several alarm sounds and repeat options.)',
    },
    {
      name: 'EazyTimer Alarm Clock',
      url: 'https://eazytimer.org/alarm-clock/',
      weakness:
        'Its Korean tool presents one time input and one “set alarm” action, and its FAQ says it is funded by advertising; Betterbit visibly manages up to 12 labeled alarms. (Strength: it gives a concise Korean explanation of the open-tab and sleep limitations.)',
    },
  ],
  related: ['timer', 'stopwatch', 'pomodoro-timer', 'countdown', 'online-clock'],
};
