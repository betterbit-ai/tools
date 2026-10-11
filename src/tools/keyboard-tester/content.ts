import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  layout: 'Layout',
  layoutEn: 'English',
  layoutKo: 'Korean (2-set)',
  reset: 'Reset',
  visualHidden:
    'A live keyboard diagram highlights each key you press. The stats and warnings below report the same information in text.',
  currentlyHeld: 'Currently held',
  maxSimultaneous: 'Max simultaneous',
  coverage: 'Keys tested',
  lastKey: 'Last key',
  none: '—',
  spaceKeyLabel: 'Space',
  rolloverFull: '10 or more keys held together without any being dropped — a strong sign of full NKRO.',
  rolloverPartial:
    'Limited rollover so far — many budget keyboards cap around 6 keys (USB 6KRO). Hold more to see if yours goes further.',
  rolloverSingle: 'Press and hold a few keys together to test how many register at once.',
  chatterWarning: 'Possible chattering on: {keys}. The same key registered twice within milliseconds of itself.',
  stuckWarning: 'Still reported as held: {keys}. If you have released it, the switch may be stuck.',
  privacyHint: 'Key presses are read in this browser tab only and are never uploaded or saved.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Keyboard Tester — NKRO rollover, ghosting and layout check',
    description:
      'Press any key to see it light up, find how many keys register at once (NKRO/rollover), and catch stuck or chattering keys — local only, no ads, no upload.',
    h1: 'Keyboard Tester',
    tagline:
      'Press any key to see it light up, check how many register at once, and catch stuck or double-firing keys.',
    name: 'Keyboard Tester',
    keywords: [
      'keyboard test',
      'key tester',
      'nkro test',
      'key rollover test',
      'ghosting test',
      'stuck key test',
      'online keyboard checker',
    ],
    howTo: [
      'Click anywhere on this page, then press any key — it lights up on the diagram below.',
      'Hold several keys together to see how many register at once (NKRO/rollover).',
      'Switch Layout to Korean to check the 2-set jamo printed on a Korean keyboard.',
      'Watch for a red warning if a key double-fires (chatters) or stays stuck.',
      'Select Reset to clear the session and test a different keyboard.',
    ],
    sections: [
      {
        heading: 'What rollover (NKRO) actually means',
        body: 'Every keyboard has a rollover limit: the number of keys it can register at the same time. Cheap keyboards with a simple key-matrix can "ghost" past 2–3 simultaneous keys, where extra presses are dropped or the wrong key appears. Full N-key rollover (NKRO) means every key you hold is reported independently, which matters for gaming combos and fast typing. This page tracks the highest number of keys you held down together this session, so you can find your own rollover limit by holding combinations like Shift+Ctrl+W+A+S+D.',
      },
      {
        heading: 'Why some keys never make it to the browser',
        body: 'Browsers and operating systems intercept certain keys before a web page ever sees them. Cmd+Tab, Alt+Tab, F11 fullscreen, browser-tab shortcuts and some media keys are handled at the OS or browser level, so they may not register here even on a fully working keyboard. That is a known limit of any browser-based keyboard tester, not a sign your key is broken — if a letter, number or punctuation key stays grey here, that is the more reliable signal of a real hardware problem.',
      },
      {
        heading: 'Stuck keys and chattering switches',
        body: 'A key that stays highlighted long after you lift your finger usually means a stuck switch or debris trapped under the keycap; this page flags any key still reported as held after 5 seconds. A key that registers twice from a single tap — chatter, or double-firing — is common on worn or dirty mechanical switches, and shows up here as the same key reporting a new press within milliseconds of its last one. Cleaning or replacing the switch is the usual fix for either problem.',
      },
      {
        heading: 'Matching a real Korean 2-set keyboard',
        body: "Korean keyboards use the same physical ANSI shape as US keyboards — the keycaps just carry Hangul jamo instead of letters, following the 2-set (두벌식) standard layout used on virtually every Korean keyboard sold today. Switching Layout to Korean relabels each key with its printed jamo (ㅂ, ㅈ, ㄷ, ㄱ, ㅅ and so on), so you can confirm a Korean keyboard's labels line up with the physical key it actually reports — useful when buying a used or imported board.",
      },
    ],
    faq: [
      {
        q: 'Does this keyboard test record or upload anything I type?',
        a: "No. Key presses are read directly by this page's JavaScript and never leave your browser tab — nothing is logged, uploaded or saved after you close or reload the page.",
      },
      {
        q: "What is NKRO and why does the 'max simultaneous' number matter?",
        a: "NKRO (N-key rollover) describes how many keys a keyboard can report at once without dropping or confusing presses. If holding more than 5–6 keys together here never raises the 'Max simultaneous' stat past a low number, your keyboard likely has limited rollover (6KRO or less) rather than full NKRO.",
      },
      {
        q: "Why didn't Cmd+Tab, Alt+Tab or F11 register?",
        a: 'Those combinations are captured by the operating system or browser before any webpage can see them, so no browser-based keyboard tester — including this one — can detect them. It does not indicate a hardware fault.',
      },
      {
        q: 'A key stays lit even after I let go — is my keyboard broken?',
        a: "This page marks any key still reported as held after 5 seconds as likely stuck, which usually points to a jammed or faulty switch rather than a browser issue. Try pressing the same physical key again; if it still won't release here, the switch may need cleaning or replacing.",
      },
      {
        q: 'Does the Korean layout show the real shifted symbols too?',
        a: 'It shows the primary jamo printed on each key in the standard 2-set (두벌식) layout used on nearly all Korean keyboards. Shifted double consonants such as ㄲ and ㅆ use those same physical keys with Shift held, exactly as on a real keyboard.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '키보드 테스트 — 동시 입력(NKRO)·고스팅·레이아웃 확인',
    description:
      '아무 키나 눌러 불이 켜지는지 보고, 동시에 몇 개까지 인식되는지(NKRO)와 끼임·채터링 키를 찾아보세요. 브라우저에서만 동작하며 광고와 업로드가 없습니다.',
    h1: '키보드 테스트',
    tagline:
      '키를 누르면 바로 불이 켜지고, 동시에 몇 개까지 인식되는지, 끼이거나 이중 입력되는 키는 없는지 확인합니다.',
    name: '키보드 테스트',
    keywords: [
      '키보드 테스트',
      '키보드 동시입력 테스트',
      '고스팅 테스트',
      '키 눌림 테스트',
      '두벌식 자판 테스트',
      '키보드 채터링 테스트',
    ],
    howTo: [
      '페이지를 클릭한 뒤 키보드의 아무 키나 눌러보세요. 아래 다이어그램에 불이 켜집니다.',
      '여러 키를 동시에 눌러 몇 개까지 한 번에 인식되는지(동시 입력, NKRO) 확인합니다.',
      '레이아웃을 한글로 바꾸면 두벌식 자판에 새겨진 자음·모음으로 표시됩니다.',
      '키가 이중으로 눌리거나(채터링) 손을 떼도 계속 눌린 채로 남으면 빨간 경고가 표시됩니다.',
      '초기화를 눌러 기록을 지우고 다른 키보드로 다시 테스트합니다.',
    ],
    sections: [
      {
        heading: '동시 입력(NKRO)이 의미하는 것',
        body: '모든 키보드에는 동시에 인식할 수 있는 키의 개수, 즉 동시입력(롤오버) 한계가 있습니다. 회로 설계가 단순한 저가형 키보드는 2~3개를 넘기면 일부 입력이 사라지거나 엉뚱한 키가 눌리는 "고스팅" 현상이 나타납니다. 완전한 NKRO는 누르고 있는 모든 키를 각각 독립적으로 인식한다는 뜻으로, 게임 조합키나 빠른 타이핑에서 중요합니다. 이 도구는 이번 세션에서 동시에 누른 최대 키 개수를 계속 추적하므로 Shift+Ctrl+W+A+S+D 같은 조합으로 직접 한계를 확인할 수 있습니다.',
      },
      {
        heading: '일부 키가 브라우저까지 전달되지 않는 이유',
        body: 'Cmd+Tab, Alt+Tab, F11 전체화면, 브라우저 탭 전환, 일부 미디어 키는 웹페이지에 도달하기 전에 운영체제나 브라우저가 먼저 가로챕니다. 이는 키보드가 정상이어도 생기는, 브라우저 기반 테스트 도구 전체의 공통된 한계이며 고장의 증거가 아닙니다. 반대로 문자·숫자·기호 키가 계속 회색으로 남아 반응이 없다면 그것이 실제 하드웨어 문제를 가리키는 더 믿을 만한 신호입니다.',
      },
      {
        heading: '끼인 키와 채터링(이중 입력) 구분하기',
        body: '손을 뗀 뒤에도 한참 눌린 채로 표시되는 키는 보통 스위치가 끼었거나 이물질에 걸린 경우이며, 이 도구는 5초 넘게 눌린 키를 자동으로 표시합니다. 한 번만 눌렀는데 눌림이 두 번 등록되는 현상(채터링)은 오래되었거나 먼지가 낀 기계식 스위치에서 흔히 나타나며, 같은 키가 수십 밀리초 안에 다시 눌린 것으로 감지됩니다. 두 경우 모두 스위치를 청소하거나 교체하면 대부분 해결됩니다.',
      },
      {
        heading: '실제 두벌식 한글 키보드와 맞춰보기',
        body: '한국어 키보드는 미국 키보드와 같은 ANSI 물리 배열을 쓰며, 자리마다 영문 대신 한글 자모가 새겨져 있을 뿐입니다. 거의 모든 한글 키보드가 따르는 두벌식(2-set) 표준 자판을 기준으로, 레이아웃을 한글로 바꾸면 ㅂㅈㄷㄱㅅ 같은 자모가 각 키 위치에 그대로 표시됩니다. 중고 키보드나 해외 구매 제품의 자판 각인이 실제 눌리는 위치와 맞는지 확인할 때 유용합니다.',
      },
    ],
    faq: [
      {
        q: '이 키보드 테스트가 입력한 내용을 저장하거나 전송하나요?',
        a: '아니요. 키 입력은 이 페이지의 자바스크립트가 직접 읽을 뿐 브라우저 탭 밖으로 나가지 않으며, 페이지를 닫거나 새로고침하면 기록이 남지 않습니다.',
      },
      {
        q: "동시 입력(NKRO)의 '최대 동시 입력' 수치는 무슨 뜻인가요?",
        a: "NKRO는 키보드가 한 번에 왜곡 없이 인식할 수 있는 키의 개수를 뜻합니다. 5~6개 이상을 동시에 눌러도 '최대 동시 입력' 값이 낮게 멈춰 있다면 완전한 NKRO가 아니라 제한된 롤오버(6KRO 이하)일 가능성이 큽니다.",
      },
      {
        q: 'Cmd+Tab이나 Alt+Tab, F11은 왜 반응하지 않나요?',
        a: '이런 조합키는 웹페이지가 보기도 전에 운영체제나 브라우저가 먼저 처리하기 때문에, 이 도구를 포함한 어떤 브라우저 기반 키보드 테스트도 감지할 수 없습니다. 키보드 고장과는 관련이 없습니다.',
      },
      {
        q: '손을 뗐는데도 키가 계속 눌린 것으로 나와요. 고장인가요?',
        a: '5초 넘게 계속 눌린 것으로 표시되는 키는 스위치가 끼었을 가능성이 높으며, 브라우저 문제가 아닙니다. 같은 키를 다시 눌러보고도 반응이 똑같다면 스위치 청소나 교체가 필요할 수 있습니다.',
      },
      {
        q: '한국어 레이아웃에서 쌍자음(ㄲ, ㅆ 등)은 어떻게 표시되나요?',
        a: '거의 모든 한글 키보드가 쓰는 두벌식 표준 자판의 기본 자모를 보여주며, ㄲ·ㅆ 같은 쌍자음은 실제 키보드와 똑같이 같은 키를 Shift와 함께 누르면 입력됩니다.',
      },
    ],
    ui: {
      layout: '레이아웃',
      layoutEn: '영문',
      layoutKo: '한글(두벌식)',
      reset: '초기화',
      visualHidden:
        '누른 키가 실시간으로 켜지는 키보드 다이어그램입니다. 아래 통계와 경고에도 같은 정보가 글로 표시됩니다.',
      currentlyHeld: '현재 누른 키',
      maxSimultaneous: '최대 동시 입력',
      coverage: '테스트한 키',
      lastKey: '마지막 입력',
      none: '—',
      spaceKeyLabel: '스페이스',
      rolloverFull:
        '10개 이상의 키를 동시에 눌러도 빠짐없이 인식되었습니다. 완전한 동시 입력(NKRO)일 가능성이 높습니다.',
      rolloverPartial:
        '아직 동시 입력 범위가 넓지 않습니다. 저가형 키보드는 보통 6개(6KRO)에서 한계에 부딪히니, 더 많은 키를 함께 눌러 한계를 확인해 보세요.',
      rolloverSingle: '몇 개의 키를 함께 눌러 동시에 몇 개까지 인식되는지 확인해 보세요.',
      chatterWarning: '채터링 의심: {keys}. 같은 키가 수십 밀리초 안에 두 번 눌린 것으로 인식되었습니다.',
      stuckWarning: '계속 눌린 상태로 표시됨: {keys}. 손을 뗐다면 스위치가 끼었을 수 있습니다.',
      privacyHint: '키 입력은 이 브라우저 탭 안에서만 읽으며, 업로드되거나 저장되지 않습니다.',
    },
  },
};
