import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'metronome',
  category: 'time',
  icon: 'timer',
  added: '2026-10-13',
  updated: '2026-10-24',
  edges: ['accuracy', 'usability'],
  competitors: [
    {
      name: 'Metronome Online',
      url: 'https://www.metronomeonline.com/',
      weakness:
        'Its initial tool view combines time-signature, sound-style, A440 reference, current-time and daily-total controls with the beat settings. Betterbit keeps the immediately needed BPM, tap, start and bar-count controls in one focused panel. (Strength: it exposes more sound and tuning options.)',
    },
    {
      name: 'Metron.me',
      url: 'https://metron.me/',
      weakness:
        'Its metronome opens beneath navigation for Tuner, Drone, Practice and more, then puts tap, reset and a separate settings row around the BPM control. Betterbit makes play/stop, a counted two-tap tempo input and the four common time signatures visible together. (Strength: it supports polyrhythm, subdivisions and more time signatures.)',
    },
    {
      name: 'Metronome-Online.org',
      url: 'https://metronome-online.org/',
      weakness:
        'Its page includes advertisement markup and presents many subdivisions, accent patterns, sound types and pitch choices before its large explanatory content. Betterbit keeps the repeat-practice controls to one small panel. (Strength: it supports custom accents, visual pendulum mode and a wider 1/1–32/32 signature range.)',
    },
    {
      name: '온라인 메트로놈',
      url: 'https://onlinemetronome.io/ko/',
      weakness:
        'Its Korean tap-tempo prompt requires at least three taps and its first settings area includes multiple sounds, visualizations, eight subdivisions and timer setup. Betterbit computes an initial BPM after two taps and presents only tempo, volume and common metre choices. (Strength: it provides many rhythms, sounds and a practice timer.)',
    },
    {
      name: 'moamoang 온라인 메트로놈',
      url: 'https://www.moamoang.co.kr/metronome/',
      weakness:
        'Its Korean page loads Google AdSense and adds per-beat accent editing, grouping and subdivision controls around the core click. Betterbit gives a simple saved BPM, first-beat accent and tap-tempo workflow. (Strength: it supports odd metres, per-beat accents and detailed grouping.)',
    },
  ],
  related: ['timer', 'stopwatch', 'interval-timer', 'pomodoro-timer'],
};
