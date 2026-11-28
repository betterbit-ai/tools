import type { ToolMeta, ToolVariant } from '../types';

/**
 * "N minute timer" queries are among the highest-volume tool searches.
 * Each variant opens the timer pre-set to that length, with use-case copy
 * specific to the duration (not just the number swapped).
 */
interface DurationUse {
  en: string;
  ko: string;
  /** Concrete things that take about this long, used in the page's body copy. */
  planEn: string;
  planKo: string;
}

const USES: Record<number, DurationUse> = {
  1: {
    en: 'Perfect for a one-minute plank, a quick speaking drill or timing an egg-boiling check.',
    ko: '1분 플랭크, 1분 스피치 연습, 컵라면 뜸 들이기 막바지 확인에 딱 맞습니다.',
    planEn:
      'Sixty seconds is short enough that you cannot multitask through it. A one-minute plank, a single breathing round of 4-4-4-4, one page of a speech read aloud at a normal pace (about 130 words) or a last check on boiling eggs all fit exactly, and the countdown leaves no room to lose track of the start.',
    planKo:
      '60초는 다른 일을 섞을 수 없을 만큼 짧습니다. 1분 플랭크, 4-4-4-4 호흡 한 세트, 보통 속도로 읽는 원고 한 장(약 130단어), 달걀 삶기 마지막 확인이 정확히 들어가고, 시작 시점을 놓칠 여지도 없습니다.',
  },
  3: {
    en: 'The classic length for instant noodles, steeping black tea and brushing your teeth properly.',
    ko: '컵라면, 홍차 우리기, 제대로 된 양치 시간으로 가장 많이 쓰는 길이입니다.',
    planEn:
      'Three minutes is the length most food and hygiene timings assume: instant noodles stand for about three minutes after boiling water, black tea steeps in three to five, and a proper brush is two full minutes. It is also the shortest block that still lets you finish a paragraph or a short reply without rushing.',
    planKo:
      '3분은 음식과 위생 관련 시간이 가장 많이 가정하는 길이입니다. 컵라면은 뜨거운 물을 부은 뒤 약 3분, 홍차는 3~5분 우리고, 제대로 된 양치는 2분입니다. 짧은 답장이나 문단 하나를 서두르지 않고 끝낼 수 있는 최소 단위이기도 합니다.',
  },
  5: {
    en: 'Great for a short break, a timed brainstorm, a 5-minute stand-up or a quick tidy-up sprint.',
    ko: '짧은 휴식, 5분 브레인스토밍, 스탠드업 미팅, 빠른 정리 정돈에 좋습니다.',
    planEn:
      'Five minutes is the standard short break in the Pomodoro rhythm and the usual length of a daily stand-up. It is long enough to stand up, walk, and come back with attention restored, and short enough that a brainstorm or a tidy-up sprint stays focused: write down everything you have in five, then stop.',
    planKo:
      '5분은 뽀모도로 리듬의 표준 휴식이자 데일리 스탠드업에 흔히 쓰는 길이입니다. 자리에서 일어나 걷고 돌아오기에 충분하고, 브레йн스토밍이나 정리 정돈을 한 가지에 집중시키기에도 알맞습니다. 5분 동안 떠오르는 것을 모두 적고 멈추면 됩니다.',
  },
  10: {
    en: 'Use it for a power nap, a classroom activity, a meditation session or a 10-minute workout.',
    ko: '쪽잠, 수업 활동, 명상, 10분 홈트레이닝에 활용하세요.',
    planEn:
      'Ten minutes covers a power nap short enough to wake up clear, a guided meditation, a ten-minute workout circuit, or a classroom activity with a visible end. As a work block it is the smallest interval that still produces something usable — read one section closely or draft one short message.',
    planKo:
      '10분은 개운하게 깨는 쪽잠, 안내 명상을 따라 하는 시간, 10분 홈트 서킷, 끝이 보이는 수업 활동에 맞습니다. 작업 블록으로 쓰면 결과물이 남는 가장 작은 단위여서, 한 절을 정독하거나 짧은 메시지 하나를 초안으로 쓰기에 적당합니다.',
  },
  15: {
    en: 'Common for quizzes, short meetings, focused reading sessions and soft-boiled-to-hard-boiled egg timing.',
    ko: '쪽지 시험, 짧은 회의, 집중 독서, 완숙 달걀 삶기에 자주 쓰입니다.',
    planEn:
      'Fifteen minutes is a quarter of an hour, the length of a short quiz, a focused meeting agenda item or a reading sprint. In the kitchen it separates a soft-boiled egg from a hard-boiled one: about six and a half minutes for soft, ten to twelve for hard, so fifteen also works as a safety margin after the water boils.',
    planKo:
      '15분은 1시간의 4분의 1로, 짧은 쪽지 시험, 회의 안건 하나, 집중 독서 한 라운드에 맞습니다. 주방에서는 반숙과 완숙을 가르는 시간이기도 합니다. 반숙은 약 6분 30초, 완숙은 10~12분이므로 물이 끓은 뒤 15분은 여유 시간으로도 쓸 수 있습니다.',
  },
  20: {
    en: 'A good length for a nap that avoids grogginess, a HIIT session or a timed writing exercise.',
    ko: '개운하게 깨는 낮잠, HIIT 운동, 시간 제한 글쓰기 연습에 알맞습니다.',
    planEn:
      'Twenty minutes is the nap length that keeps you in light sleep, so waking up does not leave you groggy, and it is also a full HIIT session with warm-up and cool-down. As a writing block it is long enough to produce a rough draft of a short text and short enough to stop perfectionism at the timer.',
    planKo:
      '20분은 얕은 잠에 머무는 낮잠 길이여서 깼을 때 몽롱하지 않고, 준비운동과 정리운동을 포함한 HIIT 한 세션과도 맞습니다. 글쓰기 블록으로 쓰면 짧은 글의 초안을 끝낼 수 있고, 완벽주의를 타이머에서 멈추게 할 수 있습니다.',
  },
  30: {
    en: 'Ideal for study blocks, workouts, timed exams and most oven recipes.',
    ko: '공부 블록, 운동, 모의고사, 오븐 요리에 알맞은 시간입니다.',
    planEn:
      'Thirty minutes is a standard study block, a full workout, half of a one-hour exam, and a very common oven time. It splits neatly: two fifteen-minute halves with a ten-second pause in between make a long task feel finite, and a 30-minute block is short enough to schedule into a lunch break.',
    planKo:
      '30분은 공부 블록, 운동 한 세션, 1시간 시험의 절반, 오븐 요리에서 흔한 시간입니다. 15분 두 구간으로 나눠 중간에 10초만 쉬어도 긴 작업이 유한하게 느껴지고, 점심시간에 넣을 수 있을 만큼 짧습니다.',
  },
  60: {
    en: 'For deep-work sessions, full-length exams, and long bakes or roasts.',
    ko: '딥워크 세션, 실전 시험 연습, 오래 굽는 요리에 사용하세요.',
    planEn:
      'An hour is two Pomodoro focus sessions with the short break between them, a full mock exam section, or the time a roast or a long bake actually needs. Because an hour is easy to lose, use the full-screen display or the +1 min button instead of restarting the timer every time something overruns.',
    planKo:
      '1시간은 5분 휴식을 사이에 둔 뽀모도로 두 세션이고, 모의시험 한 영역이며, 로스트나 오래 굽는 요리가 실제로 필요로 하는 시간입니다. 1시간은 쉽게 흘러가므로, 일이 늦어질 때마다 타이머를 다시 시작하기보다 전체화면 표시나 +1분 버튼을 쓰세요.',
  },
};

const variants: ToolVariant[] = Object.entries(USES).map(([minStr, use]) => {
  const n = Number(minStr);
  const enLabel = n === 60 ? '1 Hour' : `${n} Minute`;
  const koLabel = n === 60 ? '1시간' : `${n}분`;
  const seconds = n * 60;
  const pomodoroShare = (n / 25).toFixed(n === 25 ? 0 : 2).replace(/\.?0+$/, '');
  return {
    slug: n === 60 ? '1-hour' : `${n}-minutes`,
    preset: { minutes: n },
    content: {
      en: {
        title: `${enLabel} Timer — Free Online Countdown with Alarm`,
        description: `Set a ${enLabel.toLowerCase()} timer instantly. Clean countdown with alarm, full screen and keyboard shortcuts — keeps running if you refresh.`,
        h1: `${enLabel} Timer`,
        intro: `A ${enLabel.toLowerCase()} countdown, ready to go — press Start or Space. ${use.en}`,
        sections: [
          {
            heading: `What fits in ${enLabel.toLowerCase()}`,
            body: `${use.planEn}

The countdown stores an end time rather than counting ticks, so it shows the correct remaining time after a background tab, a phone lock or a refresh. The tab title carries the remaining time while you are elsewhere, Space starts and pauses, R resets to ${n === 60 ? '60 minutes' : `${n} minutes`}, and +1 min adds time without restarting. Browsers can delay audio in a locked phone, so for anything safety-critical use the device's own clock app.`,
            table: {
              caption: `${enLabel} in other units`,
              head: ['Measure', 'Value'],
              rows: [
                ['Length', `${seconds.toLocaleString('en-US')} seconds`],
                ['Fraction of an hour', `${(n / 60).toFixed(2).replace(/\.?0+$/, '')} hour${n === 60 ? '' : 's'}`],
                ['Pomodoro focus blocks (25 min)', pomodoroShare],
                ['Halfway point', `${Math.floor(seconds / 120)} min ${seconds % 120 === 0 ? '0' : '30'} s`],
              ],
            },
          },
        ],
        faq: [
          {
            q: `How do I start a ${enLabel.toLowerCase()} timer?`,
            a: `Press Start, or the Space bar, and the ${seconds} seconds begin counting down. R resets it to ${n === 60 ? '60 minutes' : `${n} minutes`}, F switches to full screen, and +1 min extends the current countdown without starting over.`,
          },
          {
            q: `Does a ${enLabel.toLowerCase()} timer keep running in another tab?`,
            a: 'Yes. The timer compares the clock against a stored end time, so switching tabs, locking the phone or refreshing the page shows the correct remaining time when you return. Browsers may delay the alarm sound while the device is asleep.',
          },
          {
            q: `Can I run several ${enLabel.toLowerCase()} rounds in a row?`,
            a: `Yes, press R after the alarm and start again, or use +1 min between rounds. Each round is the same fixed length, which makes ${n === 60 ? 'hourly' : `${n}-minute`} check-ins easier to keep than a free-running stopwatch.`,
          },
        ],
      },
      ko: {
        title: `${koLabel} 타이머 — 알람 되는 온라인 ${koLabel} 카운트다운`,
        description: `바로 시작하는 ${koLabel} 타이머. 알람, 전체화면, 단축키를 지원하고 새로고침해도 시간이 유지됩니다.`,
        h1: `${koLabel} 타이머`,
        intro: `${koLabel}으로 맞춰진 타이머입니다. 시작 버튼이나 스페이스바를 누르세요. ${use.ko}`,
        sections: [
          {
            heading: `${koLabel} 안에 할 수 있는 일`,
            body: `${use.planKo}

이 타이머는 남은 시간을 1초씩 세지 않고 끝나는 시각을 저장하므로, 다른 탭으로 옮기거나 휴대폰을 잠그거나 새로고침해도 돌아왔을 때 정확한 남은 시간이 표시됩니다. 자리를 비운 동안에는 탭 제목에 남은 시간이 보이고, 스페이스바로 시작·일시정지, R키로 ${koLabel} 초기화, +1분 버튼으로 현재 카운트다운을 끊지 않고 연장할 수 있습니다. 휴대폰이 잠기면 브라우저가 알람 소리를 늦출 수 있으니, 안전이 중요한 용도에는 기기 기본 시계 앱을 쓰세요.`,
            table: {
              caption: `${koLabel}을 다른 단위로 본 값`,
              head: ['기준', '값'],
              rows: [
                ['길이', `${seconds.toLocaleString('ko-KR')}초`],
                ['1시간 대비', `${(n / 60).toFixed(2).replace(/\.?0+$/, '')}시간`],
                ['뽀모도로 집중 블록(25분)', `${pomodoroShare}회`],
                ['중간 지점', `${Math.floor(seconds / 120)}분 ${seconds % 120 === 0 ? '0' : '30'}초`],
              ],
            },
          },
        ],
        faq: [
          {
            q: `${koLabel} 타이머는 어떻게 시작하나요?`,
            a: `시작 버튼이나 스페이스바를 누르면 ${seconds}초가 줄어들기 시작합니다. R키는 ${koLabel}으로 초기화하고, F키는 전체화면, +1분 버튼은 카운트다운을 멈추지 않고 1분을 더합니다.`,
          },
          {
            q: `${koLabel} 타이머는 다른 탭으로 옮겨도 계속 돌아가나요?`,
            a: '네. 끝나는 시각을 저장해 기기 시계와 비교하므로 탭 전환, 휴대폰 잠금, 새로고침 뒤에도 남은 시간이 정확합니다. 다만 기기가 잠든 동안에는 브라우저가 알람 소리를 늦출 수 있습니다.',
          },
          {
            q: `${koLabel}을 연속으로 여러 번 돌릴 수 있나요?`,
            a: `가능합니다. 알람이 울린 뒤 R키로 초기화해 다시 시작하거나, 구간 사이에 +1분을 쓰면 됩니다. 매 회차가 같은 길이여서 ${n === 60 ? '1시간마다' : `${n}분마다`} 확인하는 습관을 만들기에 스톱워치보다 편합니다.`,
          },
        ],
      },
    },
  };
});

export const meta: ToolMeta = {
  slug: 'timer',
  category: 'time',
  icon: 'timer',
  added: '2026-10-07',
  updated: '2026-10-19',
  edges: ['accuracy', 'usability', 'design'],
  competitors: [
    {
      name: 'vClock Timer',
      url: 'https://vclock.com/timer/',
      weakness:
        'Its timer opens with holiday lists and a settings panel before the edit dialog, while Betterbit keeps the countdown, presets, custom time and sound test in one visible panel. (Strength: it offers selectable sounds, repeat-on-zero, a message, shared preset links and embeds.)',
    },
    {
      name: 'Online-Stopwatch',
      url: 'https://www.online-stopwatch.com/',
      weakness:
        'Its countdown page promotes a paid ad-free upgrade and premium account alongside a site-wide menu of themed tools; Betterbit has no account prompt and opens directly to a focused countdown. (Strength: it offers many themed classroom and specialty timers.)',
    },
    {
      name: 'timeanddate Timer',
      url: 'https://www.timeanddate.com/timer/',
      weakness:
        'Its timer page places the editor beneath a large global navigation and supporter pitch for ad-free browsing; Betterbit opens directly to its controls with no account prompt. (Strength: it supports multiple named timers and selectable end alarms.)',
    },
  ],
  related: [
    'stopwatch',
    'pomodoro-timer',
    'countdown',
    'alarm-clock',
    'interval-timer',
    'hours-calculator',
    'online-clock',
    'metronome',
  ],
  variants,
};
