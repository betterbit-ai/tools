import type { ToolMeta } from '../types';

const tabataPreset = { prepSeconds: 5, workSeconds: 20, restSeconds: 10, rounds: 8 };

export const meta: ToolMeta = {
  slug: 'interval-timer',
  category: 'time',
  icon: 'timer',
  added: '2026-10-13',
  updated: '2026-10-13',
  edges: ['usability', 'features', 'accuracy'],
  competitors: [
    {
      name: 'timers.tools Tabata Timer',
      url: 'https://timers.tools/tabata-timer/',
      weakness:
        'Its Tabata page is a general countdown with minute presets and sends users to a separate interval builder for work/rest rounds; Betterbit puts editable work, rest, rounds, phase sound and optional voice cues in its first panel. (Strength: it offers sharing, favourites, printing and full screen.)',
    },
    {
      name: 'Alarm Wake Tabata Timer',
      url: 'https://alarmwake.com/tabata-timer/',
      weakness:
        'Its search result exposes configurable work, rest, rounds, readiness, sound and volume, but no voice-cue control; Betterbit exposes a browser voice-cue toggle alongside the phase controls. (Strength: it lists 60 alarm sounds and says it works offline after loading.)',
    },
    {
      name: 'MyTabata Pro',
      url: 'https://www.mytabata.com/',
      weakness:
        'Its landing page centres a catalogue of 10+ workout cards and calorie estimates before the builder; Betterbit opens directly to a small timer with Tabata, HIIT and boxing presets. (Strength: it provides exercise-specific protocol cards and a custom builder.)',
    },
    {
      name: 'Clock Tani 인터벌 타이머',
      url: 'https://clock-tani.com/ko/interval',
      weakness:
        'Its Korean custom settings document a 5–99 second work/rest range; Betterbit visibly permits a 0-second rest and 1–10,800-second work phase for drills that need no rest or longer rounds. (Strength: it offers 15 selectable alarm sounds, vibration and a screen-wake feature.)',
    },
    {
      name: 'AppErgo 타바타 타이머',
      url: 'https://www.appergo.com/ko/tools/sport/tabata-timer/index.html',
      weakness:
        'Its Korean Tabata page presents fixed short, classic, long and very-long 20/10 formats and directs custom work/rest/round settings to a separate interval timer; Betterbit lets users edit every interval in the same panel. (Strength: it keeps the fixed-format choice especially simple.)',
    },
    {
      name: 'Cronometro 온라인 인터벌 타이머',
      url: 'https://cronometro.online/ko/interval-timer/',
      weakness:
        'Its Korean timer exposes a larger builder with saved workouts, recent sessions, themes, sets, warm-up and cooldown before its audio controls; Betterbit keeps a one-panel workout timer focused on the next phase. (Strength: it offers saved workouts, themes, vibration and sets.)',
    },
  ],
  related: ['timer', 'stopwatch', 'pomodoro-timer', 'countdown', 'metronome'],
  variants: [
    {
      slug: 'tabata',
      preset: tabataPreset,
      content: {
        en: {
          title: 'Tabata Timer — Free 20/10 Interval Timer',
          description:
            'Start the classic 20-second work, 10-second rest Tabata timer for 8 rounds, with optional voice cues and phase sound.',
          h1: 'Tabata Timer',
          intro:
            'The classic 20/10 × 8 Tabata format is ready to start: 4 minutes of intervals after a 5-second get-ready countdown.',
        },
        ko: {
          title: '타바타 타이머 — 20초 운동·10초 휴식 8라운드',
          description:
            '20초 운동과 10초 휴식을 8회 반복하는 4분 타바타 타이머입니다. 음성 안내와 단계 전환음을 선택할 수 있습니다.',
          h1: '타바타 타이머',
          intro:
            '정통 타바타 20초 운동 / 10초 휴식 × 8라운드가 설정되어 있습니다. 5초 준비 시간 뒤 4분 운동을 시작합니다.',
        },
      },
    },
    {
      slug: 'hiit',
      preset: { prepSeconds: 5, workSeconds: 40, restSeconds: 20, rounds: 8 },
      content: {
        en: {
          title: 'HIIT Timer — 40/20 Interval Workout Timer',
          description:
            'Run an 8-minute 40/20 HIIT workout timer with clear phase display, optional voice cues and keyboard controls.',
          h1: '40/20 HIIT Timer',
          intro:
            'This HIIT timer is set to 40 seconds of work and 20 seconds of rest for 8 rounds: 8 minutes after the 5-second get-ready countdown.',
        },
        ko: {
          title: 'HIIT 타이머 — 40초 운동·20초 휴식 인터벌',
          description:
            '40초 운동과 20초 휴식을 8회 반복하는 8분 HIIT 타이머입니다. 음성 안내와 키보드 단축키를 지원합니다.',
          h1: '40/20 HIIT 타이머',
          intro: '40초 운동 / 20초 휴식 × 8라운드로 설정된 HIIT 타이머입니다. 5초 준비 시간 뒤 총 8분 동안 진행됩니다.',
        },
      },
    },
  ],
};
