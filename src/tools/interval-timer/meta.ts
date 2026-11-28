import type { ToolMeta } from '../types';

const tabataPreset = { prepSeconds: 5, workSeconds: 20, restSeconds: 10, rounds: 8 };

export const meta: ToolMeta = {
  slug: 'interval-timer',
  category: 'time',
  icon: 'timer',
  added: '2026-10-13',
  updated: '2026-11-28',
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
          sections: [
            {
              heading: 'What the 20/10 Tabata protocol actually is',
              body: `Tabata is a fixed format, not a general interval setting: 20 seconds of maximal work, 10 seconds of rest, repeated eight times, which is 8 × 30 = 240 seconds or exactly 4 minutes. It was designed for one exercise per four-minute block at an intensity most people cannot hold for the full set, so the eight rounds are meant to be hard rather than comfortable.

The preset includes the rest after the eighth work interval so the timer ends at a full 4:00. A 40/20 workout or a set of boxing rounds is HIIT, but it is not Tabata — the name belongs to this 20/10 pattern. If you string several blocks together, take a one-minute break between blocks and count each block separately.`,
              table: {
                caption: 'Tabata rounds at a glance',
                head: ['Phase', 'Duration'],
                rows: [
                  ['Get ready', '5 s'],
                  ['Work × 8', '20 s each (160 s)'],
                  ['Rest between rounds × 8', '10 s each (80 s)'],
                  ['Total', '4 min (plus the 5 s countdown)'],
                ],
              },
            },
          ],
          faq: [
            {
              q: 'How long is a full Tabata session?',
              a: 'Four minutes: eight rounds of 20 seconds of work plus 10 seconds of rest is 240 seconds. With the 5-second get-ready countdown the timer runs 4:05 from the moment you start.',
            },
            {
              q: 'How hard should the 20-second work interval be?',
              a: 'Tabata is designed as maximal effort for the work interval — the kind of intensity you could not hold for the whole four minutes. If you can finish all eight rounds comfortably, the exercise is too easy for the protocol.',
            },
            {
              q: 'Can I change the Tabata intervals?',
              a: 'Yes. Every field is editable, so the same timer can run 30/15 or 40/20, but a changed pattern is a general HIIT interval workout rather than the original Tabata protocol. Use the HIIT preset if you want 40/20 to start.',
            },
          ],
        },
        ko: {
          title: '타바타 타이머 — 20초 운동·10초 휴식 8라운드',
          description:
            '20초 운동과 10초 휴식을 8회 반복하는 4분 타바타 타이머입니다. 음성 안내와 단계 전환음을 선택할 수 있습니다.',
          h1: '타바타 타이머',
          intro:
            '정통 타바타 20초 운동 / 10초 휴식 × 8라운드가 설정되어 있습니다. 5초 준비 시간 뒤 4분 운동을 시작합니다.',
          sections: [
            {
              heading: '20/10 타바타는 정해진 형식입니다',
              body: `타바타는 일반적인 인터벌 설정이 아니라 정해진 형식입니다. 20초 최대 강도 운동, 10초 휴식을 8회 반복하면 8 × 30 = 240초, 정확히 4분입니다. 네 분 동안 한 가지 운동을 최대 강도로 수행하도록 설계된 형식이라, 8라운드는 편안하게 끝낼 수 있는 강도가 아닙니다.

이 프리셋은 8번째 운동 뒤의 휴식까지 포함해 정확히 4분에서 끝납니다. 40/20 운동이나 복싱 라운드는 HIIT이지만 타바타는 아닙니다. 타바타라는 이름은 이 20/10 패턴에만 해당합니다. 여러 블록을 이어서 할 때는 블록 사이에 1분을 쉬고, 블록마다 따로 세세요.`,
              table: {
                caption: '타바타 라운드 구성',
                head: ['단계', '시간'],
                rows: [
                  ['준비', '5초'],
                  ['운동 × 8회', '회당 20초 (160초)'],
                  ['라운드 사이 휴식 × 8회', '회당 10초 (80초)'],
                  ['합계', '4분 (준비 5초 별도)'],
                ],
              },
            },
          ],
          faq: [
            {
              q: '타바타 한 세션은 몇 분인가요?',
              a: '4분입니다. 20초 운동과 10초 휴식을 8회 반복하면 240초이고, 5초 준비 시간을 더하면 시작부터 4분 5초 동안 진행됩니다.',
            },
            {
              q: '20초 운동 구간은 얼마나 세게 해야 하나요?',
              a: '타바타의 운동 구간은 4분 내내 유지할 수 없는 수준의 최대 강도를 전제로 합니다. 8라운드를 편안하게 끝낼 수 있다면 그 운동은 이 형식에 비해 너무 가벼운 것입니다.',
            },
            {
              q: '타바타 간격을 바꿔도 되나요?',
              a: '모든 값을 바꿀 수 있어 30/15이나 40/20으로도 돌릴 수 있습니다. 다만 바꾼 패턴은 정통 타바타가 아니라 일반 HIIT 인터벌입니다. 40/20으로 시작하려면 HIIT 프리셋을 쓰세요.',
            },
          ],
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
          sections: [
            {
              heading: '40/20 is the work-to-rest ratio, not a fixed protocol',
              body: `A 40/20 interval means 40 seconds of hard work followed by 20 seconds of recovery, repeated eight times: 8 × 60 = 480 seconds, or 8 minutes after the 5-second countdown. The 2:1 work-to-rest ratio keeps heart rate high while leaving enough recovery to hold form across all eight rounds.

HIIT is a category rather than one protocol, so the numbers are a starting point: 30/15, 45/15 and 60/30 are common alternatives, and the timer takes any of them in the same panel. Keep the work interval at an effort you could not sustain continuously, and stop the set if form breaks rather than pushing through the remaining rounds.`,
              table: {
                caption: '40/20 HIIT structure',
                head: ['Phase', 'Duration'],
                rows: [
                  ['Get ready', '5 s'],
                  ['Work × 8', '40 s each (320 s)'],
                  ['Rest between rounds × 8', '20 s each (160 s)'],
                  ['Total', '8 min (plus the 5 s countdown)'],
                ],
              },
            },
          ],
          faq: [
            {
              q: 'How long is an 8-round 40/20 HIIT session?',
              a: 'Eight minutes: eight work intervals of 40 seconds plus eight 20-second rests is 480 seconds, and the 5-second get-ready countdown runs before it.',
            },
            {
              q: 'Is 40/20 the same as Tabata?',
              a: 'No. Tabata is specifically 20 seconds of work and 10 seconds of rest for eight rounds. 40/20 is a lower-intensity HIIT pattern with a 2:1 work-to-rest ratio, and it is not the original Tabata protocol.',
            },
            {
              q: 'How many rounds should a beginner do?',
              a: 'Fewer than eight if form breaks. The timer accepts any round count, so start with four to six and add rounds as the 40-second interval becomes sustainable at the same effort.',
            },
          ],
        },
        ko: {
          title: 'HIIT 타이머 — 40초 운동·20초 휴식 인터벌',
          description:
            '40초 운동과 20초 휴식을 8회 반복하는 8분 HIIT 타이머입니다. 음성 안내와 키보드 단축키를 지원합니다.',
          h1: '40/20 HIIT 타이머',
          intro: '40초 운동 / 20초 휴식 × 8라운드로 설정된 HIIT 타이머입니다. 5초 준비 시간 뒤 총 8분 동안 진행됩니다.',
          sections: [
            {
              heading: '40/20은 운동과 휴식의 비율입니다',
              body: `40초 고강도 운동 뒤 20초 회복을 8회 반복하는 형식입니다. 8 × 60 = 480초, 준비 5초 뒤 8분 동안 진행됩니다. 운동 대 휴식이 2:1이라 심박수를 높게 유지하면서도 8라운드 내내 자세를 유지할 만큼의 회복을 남깁니다.

HIIT는 하나의 정해진 프로토콜이 아니라 범주이므로 이 숫자는 출발점입니다. 30/15, 45/15, 60/30도 흔히 쓰이며 같은 화면에서 바꿀 수 있습니다. 운동 구간은 연속으로 유지할 수 없는 강도로 하고, 자세가 무너지면 남은 라운드를 채우기보다 세트를 멈추세요.`,
              table: {
                caption: '40/20 HIIT 구성',
                head: ['단계', '시간'],
                rows: [
                  ['준비', '5초'],
                  ['운동 × 8회', '회당 40초 (320초)'],
                  ['라운드 사이 휴식 × 8회', '회당 20초 (160초)'],
                  ['합계', '8분 (준비 5초 별도)'],
                ],
              },
            },
          ],
          faq: [
            {
              q: '40/20 HIIT 8라운드는 몇 분인가요?',
              a: '8분입니다. 40초 운동 8회와 20초 휴식 8회를 합치면 480초이고, 그 앞에 준비 5초가 먼저 진행됩니다.',
            },
            {
              q: '40/20도 타바타인가요?',
              a: '아닙니다. 타바타는 20초 운동·10초 휴식 8라운드로 정해져 있습니다. 40/20은 운동 대 휴식이 2:1인 HIIT 패턴이며 정통 타바타와 다릅니다.',
            },
            {
              q: '초보자는 몇 라운드가 적당한가요?',
              a: '자세가 무너지면 8라운드보다 적게 하세요. 라운드 수를 자유롭게 넣을 수 있으므로 4~6라운드로 시작해 같은 강도로 40초를 유지할 수 있게 되면 늘리는 편이 좋습니다.',
            },
          ],
        },
      },
    },
  ],
};
