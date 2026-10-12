import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'online-clock',
  category: 'time',
  icon: 'clock',
  added: '2026-10-13',
  updated: '2026-10-13',
  edges: ['privacy', 'usability', 'design'],
  competitors: [
    {
      name: 'Clock Online',
      url: 'https://www.clock-online.com/',
      weakness:
        'Its landing view puts a full alarm form, quick-alarm links, a timer and a city directory around the clock; Betterbit opens directly to a readable clock, copy action and one-key full screen. (Strength: it offers alarm snooze, names and sound choices.)',
    },
    {
      name: 'Free Online Clock',
      url: 'https://free-onlineclock.com/online-clock',
      weakness:
        'Its clock page loads a Yandex resource and starts with a broad navigation directory plus a city search; Betterbit has no third-party tracking, location request or surrounding directory and retains only display preferences in browser storage. (Strength: it offers analog and flip-clock faces plus sunrise and sunset.)',
    },
    {
      name: 'The Digital Clock',
      url: 'https://www.thedigitalclock.com/',
      weakness:
        'Its initial display is surrounded by navigation to several clock styles and productivity tools, and its colour change is hidden behind a left-click hint; Betterbit keeps the current time, format settings and full-screen control visible in one compact panel. (Strength: it offers flip and ambient clock styles.)',
    },
    {
      name: 'True Time — 대한민국의 현재 시간',
      url: 'https://ko.true-time.com/kr/',
      weakness:
        'Its Korea page places country facts, exchange rates, many city links and international time-difference links around the current clock; Betterbit is a focused local wall-clock display with its date, time-zone name and UTC offset kept together. (Strength: it provides a large country and city directory.)',
    },
    {
      name: '똑딱 온라인 시계',
      url: 'https://webclock.kr/',
      weakness:
        'Its compact page still starts with a multi-tool header and a “popular tools” block, while its help directs users to a separate server-time tab for accuracy-critical use; Betterbit shows the local device-clock limitation and UTC offset beside the display without promising an unverified server time. (Strength: it offers a separate server-time tool.)',
    },
    {
      name: 'stopwatch-online.com 온라인 시계',
      url: 'https://stopwatch-online.com/ko/clock/',
      weakness:
        'Its Korean clock begins with an expandable settings flow for digital or analog mode, hundredths and format choices; Betterbit makes its two most useful display choices and the copy/full-screen actions immediately keyboard-operable in the first panel. (Strength: it synchronizes from its server and offers analog mode and hundredths.)',
    },
  ],
  related: ['timer', 'stopwatch', 'alarm-clock', 'world-clock'],
};
