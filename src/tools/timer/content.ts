import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  start: 'Start',
  pause: 'Pause',
  resume: 'Resume',
  restart: 'Restart',
  reset: 'Reset',
  plusMinute: '+1 min',
  fullscreen: 'Full screen',
  presets: 'Presets',
  custom: 'Custom time',
  h: 'Hours',
  m: 'Minutes',
  s: 'Seconds',
  minutesShort: '{n} min',
  timesUp: 'Time’s up!',
  sound: 'Alarm sound',
  testSound: 'Test sound',
  fullscreenUnavailable: 'Full screen is unavailable in this browser.',
  keyStart: 'Start / pause',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Online Timer — Free Countdown Timer with Alarm',
    description:
      'A clean, ad-free online countdown timer with alarm, full screen mode and keyboard shortcuts. Keeps running if you refresh the page. Set any time up to 99 hours.',
    h1: 'Online Timer',
    tagline: 'A big, clear countdown with an alarm — no ads, survives a page refresh.',
    name: 'Timer',
    keywords: ['countdown', 'countdown timer', 'alarm', 'kitchen timer', 'pomodoro', 'minute timer'],
    howTo: [
      'Pick a preset or type hours, minutes and seconds.',
      'Press Start (or the Space bar).',
      'Switch tabs freely — the remaining time is shown in the tab title.',
      'Optional: press Test sound. When time is up, the enabled alarm plays for 30 seconds.',
    ],
    sections: [
      {
        heading: 'Why this timer stays accurate',
        body: 'Browsers slow down background tabs to save battery, which makes timers that count “ticks” drift by seconds or even minutes. This timer stores the exact moment it should finish and compares against your device clock whenever the browser runs it, so the display catches up after a background tab, sleep or refresh instead of adding delayed ticks. Its precision is limited by your device clock; do not use a browser timer for safety-critical deadlines.',
      },
      {
        heading: 'Keyboard shortcuts',
        body: 'Space starts and pauses. R resets to the last duration. F toggles full screen, which is handy for classrooms, presentations and workouts where the timer needs to be readable from across the room. Shortcuts are ignored while you are typing in the time fields, and “+1 min” adds a minute without stopping the countdown.',
      },
      {
        heading: 'Popular timer lengths',
        body: '1–3 minutes: brushing teeth, steeping tea, a plank. 5 minutes: a short break or a quick stand-up. 10–15 minutes: power naps and classroom activities. 25 minutes: one Pomodoro focus session. 30–60 minutes: exams, workouts and cooking.',
      },
    ],
    faq: [
      {
        q: 'Will the alarm sound if the tab is in the background?',
        a: 'After you press Start in the current browser session, the timer can play its alarm while the tab is in the background. Browsers may delay or mute background audio when a phone is locked or a device sleeps, so use the built-in clock app for a critical alarm. The tab title changes to “Time’s up!” when the page runs again.',
      },
      {
        q: 'What happens if I refresh or close the page?',
        a: 'A running or paused timer is saved in your browser. Reopen the page and it continues from the correct remaining time.',
      },
      {
        q: 'Can I run the timer full screen?',
        a: 'Yes. Click Full screen or press F. The numbers scale to fill the screen so they can be read from a distance.',
      },
      {
        q: 'What is the longest timer I can set?',
        a: 'Up to 99 hours, 59 minutes and 59 seconds.',
      },
      {
        q: 'Does the timer work offline?',
        a: 'Once the page has loaded, the timer runs entirely in your browser and does not need an internet connection.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '온라인 타이머 — 알람 되는 무료 카운트다운 타이머',
    description:
      '광고 없는 깔끔한 온라인 타이머. 알람, 전체화면, 키보드 단축키를 지원하고 새로고침해도 시간이 유지됩니다. 최대 99시간까지 설정할 수 있습니다.',
    h1: '온라인 타이머',
    tagline: '크고 선명한 카운트다운과 알람. 광고 없이, 새로고침해도 그대로.',
    name: '타이머',
    keywords: ['카운트다운', '스톱워치', '알람', '뽀모도로', '공부 타이머', '분 타이머', 'timer'],
    howTo: [
      '프리셋을 고르거나 시·분·초를 직접 입력합니다.',
      '시작 버튼(또는 스페이스바)을 누릅니다.',
      '다른 탭으로 이동해도 탭 제목에 남은 시간이 표시됩니다.',
      '필요하면 “소리 테스트”를 누릅니다. 시간이 끝나면 켜져 있는 알람이 30초 동안 울립니다.',
    ],
    sections: [
      {
        heading: '탭을 옮겨도 정확한 이유',
        body: '브라우저는 배터리를 아끼려고 백그라운드 탭의 동작을 느리게 만듭니다. 그래서 1초씩 세는 방식의 타이머는 몇 초에서 몇 분까지 밀릴 수 있습니다. 이 타이머는 끝나는 시각을 저장하고 브라우저가 실행될 때 기기 시계와 비교하므로, 백그라운드 탭·절전·새로고침 뒤에도 밀린 횟수를 더하지 않고 남은 시간을 바로잡습니다. 정확도는 기기 시계에 좌우되므로 안전이 중요한 마감에는 브라우저 타이머를 사용하지 마세요.',
      },
      {
        heading: '키보드 단축키',
        body: '스페이스바로 시작·일시정지, R로 초기화, F로 전체화면을 켜고 끕니다. 수업, 발표, 운동처럼 멀리서도 시간을 봐야 할 때 전체화면을 활용하세요. 시간 입력칸에 입력 중일 때는 단축키가 동작하지 않으며, “+1분” 버튼은 카운트다운을 멈추지 않고 1분을 더합니다.',
      },
      {
        heading: '자주 쓰는 시간',
        body: '1~3분: 양치, 차 우리기, 플랭크. 5분: 짧은 휴식, 회의 발언 시간. 10~15분: 낮잠, 수업 활동. 25분: 뽀모도로 집중 1세트. 30~60분: 시험, 운동, 요리.',
      },
    ],
    faq: [
      {
        q: '다른 탭을 보고 있어도 알람이 울리나요?',
        a: '현재 브라우저 세션에서 시작 버튼을 한 번 누른 뒤에는 다른 탭을 보고 있어도 알람을 재생할 수 있습니다. 다만 휴대폰 화면이 잠기거나 기기가 절전 상태이면 브라우저가 소리를 지연하거나 끌 수 있으므로, 중요한 알람은 기기 기본 시계 앱을 사용하세요. 페이지가 다시 실행되면 탭 제목이 “시간 종료!”로 바뀝니다.',
      },
      {
        q: '새로고침하거나 창을 닫으면 어떻게 되나요?',
        a: '실행 중이거나 일시정지된 타이머는 브라우저에 저장됩니다. 페이지를 다시 열면 정확한 남은 시간부터 이어집니다.',
      },
      {
        q: '전체화면으로 쓸 수 있나요?',
        a: '네. “전체화면” 버튼이나 F 키를 누르면 숫자가 화면 가득 커져 멀리서도 잘 보입니다.',
      },
      {
        q: '최대 몇 시간까지 설정할 수 있나요?',
        a: '최대 99시간 59분 59초까지 설정할 수 있습니다.',
      },
      {
        q: '인터넷이 끊겨도 작동하나요?',
        a: '페이지가 한 번 열리면 타이머는 브라우저 안에서만 동작하므로 인터넷 연결이 필요 없습니다.',
      },
    ],
    ui: {
      start: '시작',
      pause: '일시정지',
      resume: '계속',
      restart: '다시 시작',
      reset: '초기화',
      plusMinute: '+1분',
      fullscreen: '전체화면',
      presets: '프리셋',
      custom: '직접 설정',
      h: '시간',
      m: '분',
      s: '초',
      minutesShort: '{n}분',
      timesUp: '시간 종료!',
      sound: '알람 소리',
      testSound: '소리 테스트',
      fullscreenUnavailable: '이 브라우저에서는 전체화면을 사용할 수 없습니다.',
      keyStart: '시작 / 일시정지',
    },
  },
};
