import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  deviceCheck: 'Button and wheel check',
  deviceCheckHint: 'Press each available mouse button and roll the wheel inside the test area.',
  resetCheck: 'Reset check',
  deviceCheckPrompt: 'Click, hold, and scroll here',
  deviceCheckHelp:
    'Totals stay cumulative until reset. A button’s number grows while it is held, and wheel movement is counted by direction.',
  browserUnsupported: 'This browser does not expose Pointer Events, so it cannot run the mouse test.',
  buttonLeft: 'Left button',
  buttonMiddle: 'Middle button',
  buttonRight: 'Right button',
  buttonBack: 'Back button',
  buttonForward: 'Forward button',
  wheelUp: 'Wheel up',
  wheelDown: 'Wheel down',
  shortestGap: 'Shortest gap',
  screenedRepeats: 'Screened repeats',
  milliseconds: 'ms',
  unavailable: '—',
  guidedTest: 'Guided double-click screen',
  guidedTestHint: 'Make 20 deliberate single presses, about one second apart. Do not intentionally double-click.',
  restartSample: 'Restart sample',
  testButton: 'Button to test',
  samplePrompt: 'Make slow single {button} presses here',
  sampleHelp:
    'This screen compares only the selected button. It marks a repeat below 80 ms for you to inspect; it is not a hardware verdict.',
  sampleProgress: 'Sample presses',
  sampleStatus: 'Sample status',
  sampleDone: 'Complete',
  sampleInProgress: 'In progress',
  sampleReady: 'Ready. Make a slow single {button} press to begin.',
  sampleCollecting: 'Keep making deliberate single presses until the 20-press sample is complete.',
  sampleClean:
    'No sub-80 ms repeats appeared in this 20-press browser sample. Repeat on another computer if the symptom persists.',
  sampleSuspect:
    'A sub-80 ms repeat appeared. Repeat the controlled sample and compare on another computer before deciding the switch is faulty.',
  localOnly:
    'Pointer events and results stay in this browser tab. This page observes browser input; it cannot certify mouse hardware.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Mouse Test — guided double-click screen',
    description:
      'Test mouse buttons and wheel, then run a guided 20-press double-click screen with per-button timing. Events stay in your browser tab.',
    h1: 'Mouse Test',
    tagline:
      'Check every browser-visible button, then make 20 slow single presses to screen double-click patterns without relying on a raw counter.',
    name: 'Mouse Test',
    keywords: [
      'mouse test',
      'test my mouse',
      'mouse button test',
      'double click test',
      'mouse double clicking',
      'mouse wheel test',
    ],
    howTo: [
      'Press each available button and roll the wheel inside Button and wheel check.',
      'Choose Left, Middle or Right in Guided double-click screen.',
      'Make slow, intentional single presses about one second apart until the sample reaches 20.',
      'If a repeat is screened, run a fresh sample and compare the mouse on another computer before treating it as a hardware fault.',
    ],
    sections: [
      {
        heading: 'What this double-click screen measures',
        body: 'This page records browser-observed pointer presses, not the electrical signal inside a switch. It compares each press only with the preceding press of the same selected button. A gap below 80 ms is marked for review because the controlled instructions ask for slow single presses. The 80 ms value is this page’s screening rule, not a universal definition of a failed mouse or a replacement for a manufacturer diagnostic.',
      },
      {
        heading: 'Why the guided sample uses 20 slow presses',
        body: 'A deliberate pace makes the result easier to interpret than clicking as fast as possible: a count that jumps or a very short same-button gap is visible in a bounded sample. Twenty browser-observed presses are enough to repeat the same short check after changing a USB port, battery, receiver or computer. A clean sample does not prove that an intermittent fault is absent; repeat it when the real symptom occurs.',
      },
      {
        heading: 'Browser button limits to expect',
        body: 'Pointer events expose standard button codes: main (usually left) is 0, middle is 1, secondary (usually right) is 2, back is 3 and forward is 4. Button assignments can change for left-handed settings or vendor software. Side buttons mapped to macros may never reach a browser, and a browser may still reserve their back or forward action. This test therefore reports what the browser receives, rather than declaring every unreported physical button broken.',
      },
    ],
    faq: [
      {
        q: 'How do I test whether my mouse double-clicks on one press?',
        a: 'Choose the affected button, then make 20 slow single presses about one second apart in the guided screen. A same-button gap below 80 ms is marked for review. Repeat the sample and test the mouse on another computer before concluding that the switch is faulty, because this page observes browser input rather than internal hardware signals.',
      },
      {
        q: 'Does a sub-80 ms repeat prove my mouse switch is broken?',
        a: 'No. A sub-80 ms repeat is a screening result under this page’s deliberately slow test instructions, not a hardware diagnosis. Repeat the 20-press sample, check the wireless battery or receiver and compare another computer or application before deciding whether to repair or replace the mouse.',
      },
      {
        q: 'Why do my mouse side buttons not appear in the test?',
        a: 'Browsers receive side-button presses only when the operating system or mouse driver exposes them as standard Back (3) or Forward (4) inputs. A macro, DPI-shift or vendor-specific mapping may not reach the page, so an unchanged counter does not by itself show that the physical button is broken.',
      },
      {
        q: 'Can I use this mouse test on a touchscreen or trackpad?',
        a: 'The button and wheel counters are intended for a physical mouse. Pointer events can also come from touch or a pen, so this page ignores non-mouse pointer input in its test pads. A trackpad may expose only a primary click and cannot verify the wheel, middle or side buttons of a mouse.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '마우스 테스트 — 더블클릭 20회 점검',
    description:
      '마우스 버튼과 휠을 확인하고, 버튼별 시간 간격으로 더블클릭 오작동을 20회 점검합니다. 입력 기록은 브라우저 탭 안에만 남습니다.',
    h1: '마우스 테스트',
    tagline:
      '모든 버튼과 휠을 먼저 확인하고, 20번의 천천한 단일 클릭으로 더블클릭 의심 신호를 숫자만 보고 추측하지 않게 돕습니다.',
    name: '마우스 테스트',
    keywords: [
      '마우스 테스트',
      '마우스 더블클릭 테스트',
      '더블클릭 오류 테스트',
      '마우스 버튼 테스트',
      '마우스 휠 테스트',
      '마우스 채터링 확인',
    ],
    howTo: [
      '버튼·휠 확인 영역 안에서 사용할 수 있는 각 버튼을 누르고 휠을 굴립니다.',
      '더블클릭 20회 점검에서 왼쪽, 가운데 또는 오른쪽 버튼을 고릅니다.',
      '일부러 더블클릭하지 말고 약 1초 간격으로 천천히 단일 클릭을 20회 합니다.',
      '의심 신호가 나오면 새 점검을 하고 다른 컴퓨터에서도 비교한 뒤 하드웨어 고장 여부를 판단합니다.',
    ],
    sections: [
      {
        heading: '더블클릭 점검이 실제로 보는 것',
        body: '이 도구는 스위치 내부의 전기 신호가 아니라 브라우저가 받은 포인터 누름 이벤트를 기록합니다. 선택한 버튼의 이전 누름과만 시간 간격을 비교합니다. 천천히 단일 클릭하라는 조건에서 80ms보다 짧은 간격은 다시 확인할 신호로 표시합니다. 80ms는 이 페이지의 점검 기준일 뿐이며, 마우스 고장을 확정하는 범용 기준이나 제조사 진단을 대신하지 않습니다.',
      },
      {
        heading: '왜 천천히 20번 누르나요?',
        body: '빠르게 연타하는 대신 일정한 속도로 누르면 한 번 눌렀는데 카운터가 건너뛰거나 같은 버튼의 간격이 유난히 짧은지 더 쉽게 읽을 수 있습니다. 브라우저가 기록한 20회는 USB 포트, 무선 배터리·리시버 또는 컴퓨터를 바꾼 뒤 같은 조건으로 비교하기에도 알맞은 짧은 표본입니다. 깨끗한 결과가 간헐적 문제의 부재를 보장하지는 않으므로 증상이 날 때 다시 점검합니다.',
      },
      {
        heading: '브라우저에서 보이는 버튼의 한계',
        body: '포인터 이벤트의 표준 버튼 코드는 주 버튼(보통 왼쪽) 0, 가운데 1, 보조 버튼(보통 오른쪽) 2, 뒤로 3, 앞으로 4입니다. 왼손잡이 설정이나 제조사 프로그램은 이 배치를 바꿀 수 있습니다. 매크로·DPI 전환으로 지정한 사이드 버튼은 브라우저까지 오지 않을 수 있고, 뒤로·앞으로 기능은 브라우저가 먼저 처리할 수도 있습니다. 따라서 이 도구는 물리 버튼의 정상 여부가 아니라 브라우저가 받은 입력을 표시합니다.',
      },
    ],
    faq: [
      {
        q: '한 번 클릭했는데 더블클릭되는지 어떻게 확인하나요?',
        a: '문제가 있는 버튼을 고른 뒤 약 1초 간격으로 단일 클릭 20회를 합니다. 같은 버튼에서 80ms 미만 간격이 기록되면 다시 확인할 신호로 표시합니다. 이 도구는 브라우저 입력을 관찰하므로, 새 표본을 만들고 다른 컴퓨터에서도 비교한 뒤 스위치 불량 여부를 판단합니다.',
      },
      {
        q: '80ms 미만이 나오면 마우스 스위치가 고장인가요?',
        a: '아니요. 80ms 미만은 천천히 누르라는 이 페이지의 조건에서 다시 확인할 신호일 뿐 하드웨어 진단 결과는 아닙니다. 20회 점검을 반복하고 무선 마우스의 배터리·리시버를 확인한 뒤 다른 컴퓨터나 앱에서도 비교합니다.',
      },
      {
        q: '사이드 버튼이 테스트에 표시되지 않는 이유는 무엇인가요?',
        a: '운영체제나 마우스 드라이버가 사이드 버튼을 표준 뒤로(3)·앞으로(4) 입력으로 전달할 때만 브라우저가 받을 수 있습니다. 매크로, DPI 전환, 제조사 전용 기능으로 지정한 버튼은 페이지에 오지 않을 수 있으므로 카운터가 0이라고 해서 물리 버튼 고장이라고 단정할 수 없습니다.',
      },
      {
        q: '터치스크린이나 트랙패드로도 마우스 테스트를 할 수 있나요?',
        a: '버튼과 휠 확인은 물리 마우스를 기준으로 합니다. 포인터 이벤트에는 터치나 펜 입력도 있을 수 있어 이 테스트 영역은 마우스 입력만 기록합니다. 트랙패드는 보통 주 버튼 클릭만 제공하므로 휠 클릭이나 사이드 버튼까지 확인할 수 없습니다.',
      },
    ],
    ui: {
      deviceCheck: '버튼·휠 확인',
      deviceCheckHint: '테스트 영역 안에서 사용할 수 있는 각 마우스 버튼을 누르고 휠을 굴립니다.',
      resetCheck: '확인 초기화',
      deviceCheckPrompt: '여기에서 클릭·길게 누르기·스크롤',
      deviceCheckHelp:
        '초기화할 때까지 누적 횟수를 유지합니다. 누르고 있는 버튼의 숫자는 크게 표시하고 휠 움직임은 방향별로 셉니다.',
      browserUnsupported: '이 브라우저는 포인터 이벤트를 제공하지 않아 마우스 테스트를 실행할 수 없습니다.',
      buttonLeft: '왼쪽 버튼',
      buttonMiddle: '가운데 버튼',
      buttonRight: '오른쪽 버튼',
      buttonBack: '뒤로 버튼',
      buttonForward: '앞으로 버튼',
      wheelUp: '휠 위',
      wheelDown: '휠 아래',
      shortestGap: '가장 짧은 간격',
      screenedRepeats: '점검된 반복',
      milliseconds: 'ms',
      unavailable: '—',
      guidedTest: '더블클릭 20회 점검',
      guidedTestHint: '약 1초 간격으로 의도적인 단일 클릭을 20회 합니다. 일부러 더블클릭하지 않습니다.',
      restartSample: '점검 다시 시작',
      testButton: '점검할 버튼',
      samplePrompt: '여기에서 {button}을 천천히 한 번씩 누릅니다',
      sampleHelp:
        '선택한 버튼만 비교합니다. 80ms 미만 반복은 확인할 신호로 표시할 뿐 하드웨어 고장을 확정하지 않습니다.',
      sampleProgress: '표본 클릭 수',
      sampleStatus: '표본 상태',
      sampleDone: '완료',
      sampleInProgress: '진행 중',
      sampleReady: '준비됨. {button}을 천천히 한 번 눌러 시작합니다.',
      sampleCollecting: '20회 표본이 끝날 때까지 의도적인 단일 클릭을 계속합니다.',
      sampleClean:
        '이 20회 브라우저 표본에서는 80ms 미만 반복이 없었습니다. 증상이 계속되면 다른 컴퓨터에서도 반복합니다.',
      sampleSuspect:
        '80ms 미만 반복이 기록되었습니다. 통제된 표본을 다시 만들고 다른 컴퓨터와 비교한 뒤 스위치 고장을 판단합니다.',
      localOnly:
        '포인터 이벤트와 결과는 이 브라우저 탭 안에만 남습니다. 이 페이지는 브라우저 입력을 관찰하며 마우스 하드웨어를 인증할 수는 없습니다.',
    },
  },
};
