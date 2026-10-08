import type { ToolMeta, ToolVariant } from '../types';

/**
 * "N minute timer" queries are among the highest-volume tool searches.
 * Each variant opens the timer pre-set to that length, with use-case copy
 * specific to the duration (not just the number swapped).
 */
const USES: Record<number, { en: string; ko: string }> = {
  1: {
    en: 'Perfect for a one-minute plank, a quick speaking drill or timing an egg-boiling check.',
    ko: '1분 플랭크, 1분 스피치 연습, 컵라면 뜸 들이기 막바지 확인에 딱 맞습니다.',
  },
  3: {
    en: 'The classic length for instant noodles, steeping black tea and brushing your teeth properly.',
    ko: '컵라면, 홍차 우리기, 제대로 된 양치 시간으로 가장 많이 쓰는 길이입니다.',
  },
  5: {
    en: 'Great for a short break, a timed brainstorm, a 5-minute stand-up or a quick tidy-up sprint.',
    ko: '짧은 휴식, 5분 브레인스토밍, 스탠드업 미팅, 빠른 정리 정돈에 좋습니다.',
  },
  10: {
    en: 'Use it for a power nap, a classroom activity, a meditation session or a 10-minute workout.',
    ko: '쪽잠, 수업 활동, 명상, 10분 홈트레이닝에 활용하세요.',
  },
  15: {
    en: 'Common for quizzes, short meetings, focused reading sessions and soft-boiled-to-hard-boiled egg timing.',
    ko: '쪽지 시험, 짧은 회의, 집중 독서, 완숙 달걀 삶기에 자주 쓰입니다.',
  },
  20: {
    en: 'A good length for a nap that avoids grogginess, a HIIT session or a timed writing exercise.',
    ko: '개운하게 깨는 낮잠, HIIT 운동, 시간 제한 글쓰기 연습에 알맞습니다.',
  },
  30: {
    en: 'Ideal for study blocks, workouts, timed exams and most oven recipes.',
    ko: '공부 블록, 운동, 모의고사, 오븐 요리에 알맞은 시간입니다.',
  },
  60: {
    en: 'For deep-work sessions, full-length exams, and long bakes or roasts.',
    ko: '딥워크 세션, 실전 시험 연습, 오래 굽는 요리에 사용하세요.',
  },
};

const variants: ToolVariant[] = Object.entries(USES).map(([minStr, use]) => {
  const n = Number(minStr);
  const enLabel = n === 60 ? '1 Hour' : `${n} Minute`;
  const koLabel = n === 60 ? '1시간' : `${n}분`;
  return {
    slug: n === 60 ? '1-hour' : `${n}-minutes`,
    preset: { minutes: n },
    content: {
      en: {
        title: `${enLabel} Timer — Free Online Countdown with Alarm`,
        description: `Set a ${enLabel.toLowerCase()} timer instantly. Ad-free countdown with alarm, full screen and keyboard shortcuts — keeps running if you refresh.`,
        h1: `${enLabel} Timer`,
        intro: `A ${enLabel.toLowerCase()} countdown, ready to go — press Start or Space. ${use.en}`,
      },
      ko: {
        title: `${koLabel} 타이머 — 알람 되는 온라인 ${koLabel} 카운트다운`,
        description: `바로 시작하는 ${koLabel} 타이머. 광고 없이 알람, 전체화면, 단축키를 지원하고 새로고침해도 시간이 유지됩니다.`,
        h1: `${koLabel} 타이머`,
        intro: `${koLabel}으로 맞춰진 타이머입니다. 시작 버튼이나 스페이스바를 누르세요. ${use.ko}`,
      },
    },
  };
});

export const meta: ToolMeta = {
  slug: 'timer',
  category: 'time',
  icon: 'timer',
  added: '2026-10-07',
  updated: '2026-10-07',
  edges: ['no-ads', 'accuracy', 'usability', 'design'],
  competitors: [
    {
      name: 'vClock Timer',
      url: 'https://vclock.com/timer/',
      weakness: 'Ad-supported layout; the countdown shares the screen with ad slots and settings clutter.',
    },
    {
      name: 'Online-Stopwatch',
      url: 'https://www.online-stopwatch.com/',
      weakness: 'Ad-supported, busy page; many themed timers but the plain countdown is not the focus.',
    },
    {
      name: 'Google search timer',
      url: 'https://www.google.com/search?q=timer',
      weakness: 'Lost when the tab is closed or refreshed; no keyboard shortcuts; no tab-title countdown.',
    },
  ],
  related: ['word-counter', 'image-resizer', 'image-compressor'],
  variants,
};
