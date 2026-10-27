import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  testArea: 'Click speed test',
  testAreaHint: 'Choose a length, then click or tap the pad. Your first press starts the timer and counts.',
  reset: 'Reset',
  startPad: 'Click or tap to start',
  runningPad: 'Keep clicking',
  donePad: 'Click to try again',
  cps: 'CPS',
  clicks: 'Clicks',
  timeLeft: 'Time left',
  seconds: 's',
  fastestSecond: 'Fastest second',
  readyHint: 'Ready for a {seconds}-second test. The first press starts the clock.',
  runningHint: 'Keep pressing until the timer reaches zero. Presses after the selected time do not count.',
  resultHint: 'Result: {formula}',
  formula: '{clicks} clicks ÷ {seconds} seconds = {cps} CPS',
  duration: 'Test length',
  durationOption: '{n}s',
  personalBest: 'Personal best',
  personalBestHint: 'Saved only in this browser for each test length.',
  unavailable: '—',
  pace: 'Pace by second',
  paceChart: 'Accepted clicks in each second of the current test',
  paceHint: 'Bars show accepted clicks in each complete second; the highest bar is your fastest second.',
  secondLabel: 'Second {n}',
  keyboardShortcuts: 'Keyboard controls',
  tabKey: 'Tab',
  spaceKey: 'Space',
  enterKey: 'Enter',
  focusPad: 'Focus the test pad',
  pressPad: 'Start or count a press',
  localOnly:
    'Clicks and personal bests stay in this browser. This test measures repeated presses, not reaction time or aiming skill.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'CPS Test — click speed with local bests',
    description:
      'Measure clicks per second in 1, 5, 10, 30 or 60 seconds. Start on the first click, use Space or Enter, and keep private bests in your browser.',
    h1: 'CPS Test',
    tagline:
      'Test click speed with mouse, touch, Space or Enter, then compare a clear fixed-time CPS score and your local best.',
    name: 'CPS Test',
    keywords: [
      'cps test',
      'click speed test',
      'click test',
      'clicks per second test',
      'mouse click speed test',
      'click counter',
    ],
    howTo: [
      'Choose 1, 5, 10, 30 or 60 seconds; use the same length when comparing results.',
      'Click or tap the large pad once. That first press starts the timer and counts as one click.',
      'Keep pressing the pad until Time left reaches 0.0 seconds.',
      'Read CPS, total clicks and the fastest one-second burst, then compare the personal best saved for that length.',
      'For keyboard input, press Tab until the pad is focused, then use Space or Enter; holding a key does not add repeated presses.',
    ],
    sections: [
      {
        heading: 'How CPS is calculated',
        body: 'CPS means clicks per second. This page uses a fixed denominator: CPS = accepted clicks ÷ selected test length in seconds. For example, 37 accepted clicks in a 5-second test is 37 ÷ 5 = 7.40 CPS. The timer begins on the first accepted press, and that press is included. A press at or after the selected finish time is excluded, so a 10-second score is always calculated over 10 seconds rather than the time it happened to take the screen to redraw. Compare results only from the same test length: a one-second burst and a 60-second effort answer different questions.',
      },
      {
        heading: 'What this test measures — and what it does not',
        body: 'A CPS test measures repeated presses on one target. It does not measure visual reaction time, mouse aiming, game latency or the electrical condition inside a mouse switch. Your result can change with technique, hand fatigue, mouse or trackpad feel, touch input and how the browser receives input. The pace bars separate a short burst from sustained speed by showing accepted clicks in each second. Use the same device and input method for a useful personal comparison, and use the Mouse Test if you are investigating unexpected double-clicks rather than trying to measure speed.',
      },
      {
        heading: 'Mouse, touch and keyboard input',
        body: 'The large pad accepts a primary mouse press or a touchscreen tap. It also works from the keyboard: focus the pad with Tab, then press Space or Enter. Held-key auto-repeat is ignored, so each keyboard count represents a distinct key press rather than the operating system repeating a held key. Right-clicks are not scored because their browser context menu would interrupt the test. Scores and the best result for each of the five lengths are stored only in this browser, which makes it easy to practise without creating an account or publishing a result.',
      },
    ],
    faq: [
      {
        q: 'What does CPS mean in a click speed test?',
        a: 'CPS means clicks per second: the number of accepted presses divided by the selected test length. A result of 42 clicks in 5 seconds is 8.40 CPS because 42 ÷ 5 = 8.40.',
      },
      {
        q: 'Does the first click count in this CPS test?',
        a: 'Yes. The first accepted click, tap, Space press or Enter press starts the timer and counts as click number one. The score uses the full selected length of 1, 5, 10, 30 or 60 seconds.',
      },
      {
        q: 'Can I use this click speed test with a keyboard or phone?',
        a: 'Yes. A touchscreen tap counts on the large pad. For keyboard use, focus the pad with Tab and press Space or Enter; repeated keydown events from holding a key are ignored so only distinct presses count.',
      },
      {
        q: 'Why is my CPS score different on another device or test length?',
        a: 'CPS can change with input hardware, browser event handling, finger fatigue and the selected duration. A 1-second result is a short burst while 30 or 60 seconds tests sustained pressing, so compare runs made with the same duration and input method.',
      },
      {
        q: 'Are my click speed results uploaded or shared?',
        a: 'No. This tool keeps the current run and personal best scores in the browser you use. It does not require an account or send a score to a leaderboard.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'CPS 테스트 — 클릭 속도와 개인 최고 기록',
    description:
      '1·5·10·30·60초 CPS 테스트로 클릭 속도를 확인하세요. 첫 클릭부터 측정하고 Space·Enter도 지원하며, 개인 최고 기록은 브라우저에만 저장합니다.',
    h1: '클릭 속도 테스트',
    tagline: '마우스·터치·Space·Enter로 초당 클릭 수를 재고, 정해진 시간 기준의 CPS와 내 최고 기록을 바로 비교합니다.',
    name: '클릭 속도 테스트',
    keywords: [
      'CPS 테스트',
      '클릭 속도 테스트',
      '초당 클릭 수',
      '클릭 테스트',
      '마우스 클릭 속도',
      '마우스 연타 테스트',
    ],
    howTo: [
      '1·5·10·30·60초 중 시간을 고릅니다. 기록을 비교할 때는 같은 시간을 선택합니다.',
      '큰 패드를 한 번 클릭하거나 터치합니다. 첫 입력부터 시간이 시작되고 이 입력도 1회로 셉니다.',
      '남은 시간이 0.0초가 될 때까지 패드를 계속 누릅니다.',
      'CPS, 총 클릭 수, 가장 빨랐던 1초 구간을 확인하고 해당 시간의 개인 최고 기록과 비교합니다.',
      '키보드는 Tab으로 패드에 초점을 맞춘 뒤 Space 또는 Enter를 누릅니다. 키를 길게 눌러 생기는 자동 반복은 세지 않습니다.',
    ],
    sections: [
      {
        heading: 'CPS 계산 방법',
        body: 'CPS는 Clicks Per Second, 즉 초당 클릭 수입니다. 이 도구는 정해진 시간을 분모로 계산합니다. CPS = 인정된 클릭 수 ÷ 선택한 시간(초)입니다. 예를 들어 5초 테스트에서 37번이 인정되면 37 ÷ 5 = 7.40 CPS입니다. 첫 입력에서 시간이 시작되고 그 입력도 포함합니다. 선택한 종료 시점 이후의 입력은 빼므로, 화면이 갱신되는 속도와 관계없이 10초 테스트는 항상 10초를 기준으로 계산합니다. 1초의 순간 연타와 60초의 지속 연타는 다른 능력을 보므로, 기록은 반드시 같은 시간끼리 비교합니다.',
      },
      {
        heading: '이 테스트가 재는 것과 재지 않는 것',
        body: 'CPS 테스트는 한 위치를 반복해서 누르는 속도를 잽니다. 화면 신호를 보고 반응하는 시간, 마우스 에임, 게임 지연 시간, 마우스 스위치 내부의 전기적 상태를 재는 도구는 아닙니다. 누르는 방법, 손의 피로, 마우스·트랙패드의 감각, 터치 입력, 브라우저가 입력을 받는 방식에 따라 결과가 달라질 수 있습니다. 초별 막대는 순간적으로 빠른 구간과 꾸준한 속도를 구분해 보여 줍니다. 내 기록을 비교할 때는 같은 기기와 입력 방식을 쓰고, 의도치 않은 더블클릭이 의심되면 속도 대신 마우스 테스트로 확인합니다.',
      },
      {
        heading: '마우스·터치·키보드로 측정하기',
        body: '큰 패드에서는 기본 마우스 버튼 클릭과 터치스크린 탭을 셉니다. 키보드도 사용할 수 있습니다. Tab으로 패드에 초점을 맞춘 뒤 Space나 Enter를 누릅니다. 키를 계속 누를 때 운영체제가 만드는 자동 반복 입력은 무시하므로, 키보드 점수도 각각 구분된 누름만 반영합니다. 우클릭은 브라우저의 메뉴를 열 수 있어 점수에 넣지 않습니다. 5개 시간별 최고 기록과 현재 결과는 이 브라우저 안에만 저장하므로, 계정을 만들거나 점수를 공개하지 않고 연습할 수 있습니다.',
      },
    ],
    faq: [
      {
        q: 'CPS 테스트에서 CPS는 무엇인가요?',
        a: 'CPS는 초당 클릭 수이며, 인정된 입력 횟수를 선택한 시간으로 나눈 값입니다. 5초에 42번 클릭하면 42 ÷ 5 = 8.40 CPS입니다.',
      },
      {
        q: '첫 클릭도 CPS 점수에 포함되나요?',
        a: '네. 첫 클릭·터치·Space·Enter 입력이 타이머를 시작하면서 동시에 첫 번째 클릭으로 인정됩니다. 점수는 1·5·10·30·60초 중 고른 전체 시간을 기준으로 계산합니다.',
      },
      {
        q: '휴대폰이나 키보드로도 클릭 속도 테스트를 할 수 있나요?',
        a: '네. 휴대폰에서는 큰 패드를 터치하면 됩니다. 키보드는 Tab으로 패드에 초점을 맞춘 뒤 Space 또는 Enter를 누릅니다. 키를 길게 눌러 발생하는 반복 keydown은 빼므로 구분된 누름만 점수에 들어갑니다.',
      },
      {
        q: '기기나 테스트 시간에 따라 CPS가 달라지는 이유는 무엇인가요?',
        a: '입력 장치, 브라우저 이벤트 처리, 손의 피로, 선택한 시간에 따라 CPS가 달라질 수 있습니다. 1초는 순간 연타, 30초와 60초는 지속 속도를 보기 때문에 같은 시간과 입력 방식으로 한 기록끼리 비교해야 합니다.',
      },
      {
        q: '클릭 속도 기록이 서버에 올라가거나 공유되나요?',
        a: '아니요. 현재 테스트와 시간별 개인 최고 기록은 사용하는 브라우저에만 남습니다. 계정을 만들거나 랭킹에 점수를 보내지 않아도 됩니다.',
      },
    ],
    ui: {
      testArea: '클릭 속도 테스트',
      testAreaHint: '시간을 고른 뒤 패드를 클릭하거나 터치합니다. 첫 입력부터 시간이 시작되고 이 입력도 1회로 셉니다.',
      reset: '초기화',
      startPad: '클릭하거나 터치해 시작',
      runningPad: '계속 클릭',
      donePad: '클릭해 다시 시작',
      cps: 'CPS',
      clicks: '클릭 수',
      timeLeft: '남은 시간',
      seconds: '초',
      fastestSecond: '가장 빠른 1초',
      readyHint: '{seconds}초 테스트 준비됨. 첫 입력부터 시간이 시작됩니다.',
      runningHint: '남은 시간이 0이 될 때까지 계속 누릅니다. 선택한 시간이 지난 입력은 세지 않습니다.',
      resultHint: '결과: {formula}',
      formula: '{clicks}회 ÷ {seconds}초 = {cps} CPS',
      duration: '테스트 시간',
      durationOption: '{n}초',
      personalBest: '개인 최고 기록',
      personalBestHint: '시간별 기록을 이 브라우저에만 저장합니다.',
      unavailable: '—',
      pace: '초별 클릭 속도',
      paceChart: '현재 테스트의 초별 인정 클릭 수',
      paceHint: '각 막대는 초마다 인정된 클릭 수이며, 가장 높은 막대가 가장 빠른 1초 구간입니다.',
      secondLabel: '{n}초',
      keyboardShortcuts: '키보드 조작',
      tabKey: 'Tab',
      spaceKey: 'Space',
      enterKey: 'Enter',
      focusPad: '테스트 패드에 초점 맞추기',
      pressPad: '시작 또는 1회 입력',
      localOnly:
        '클릭과 개인 최고 기록은 이 브라우저에만 남습니다. 이 테스트는 반복 입력 속도를 재며 반응속도나 에임 실력을 재지는 않습니다.',
    },
  },
};
