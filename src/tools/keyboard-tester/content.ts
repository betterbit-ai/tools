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
  rolloverHigh: '10 or more keys registered together. This confirms at least 10-key rollover, not full NKRO by itself.',
  rolloverPartial:
    '2–9 keys registered together. This only confirms at least that many; try more of your usual key combinations.',
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
      'Test all 104 keys on a full-size ANSI keyboard, check observed rollover, and catch stuck or chattering keys — local only, with no upload.',
    h1: 'Keyboard Tester',
    tagline:
      'Test a full-size 104-key layout, check how many keys register together, and catch stuck or double-firing keys.',
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
      'Click away from the layout controls, then press a key — it lights up on the 104-key diagram below.',
      'Hold several keys together to see how many register at once (NKRO/rollover).',
      'Switch Layout to Korean to check the 2-set jamo printed on a Korean keyboard.',
      'Watch for a red warning if a key double-fires (chatters) or stays stuck.',
      'Select Reset to clear the session and test a different keyboard.',
    ],
    sections: [
      {
        heading: 'What rollover (NKRO) actually means',
        body: 'Rollover is the number of keys a keyboard reports at the same time. Some keyboard matrices block particular combinations; true ghosting is different, because it reports a key you did not press. Full N-key rollover (NKRO) means every key can be reported independently. This page records the largest combination the browser received, so a result of 10 proves at least 10-key rollover — it does not by itself prove full NKRO. Try combinations that matter to you, such as Shift+Ctrl+W+A+S+D, and watch whether every intended key lights up.',
      },
      {
        heading: 'Why some keys never make it to the browser',
        body: 'Browsers and operating systems intercept certain keys before a web page ever sees them. Cmd+Tab, Alt+Tab, F11 fullscreen, browser-tab shortcuts and some media keys are handled at the OS or browser level, so they may not register here even on a fully working keyboard. That is a known limit of any browser-based keyboard tester, not a sign your key is broken — if a letter, number or punctuation key stays grey here, that is the more reliable signal of a real hardware problem.',
      },
      {
        heading: 'Stuck keys and chattering switches',
        body: 'A key that stays highlighted long after you lift your finger can point to a stuck switch or debris under the keycap; this page flags any key still reported as held after 5 seconds. A key that registers twice from one tap can be switch chatter. This tester marks a quick press-release-press sequence within 60 milliseconds as a clue, not a hardware diagnosis — test the key several times before cleaning or replacing a switch.',
      },
      {
        heading: 'Matching a real Korean 2-set keyboard',
        body: 'The Korean option relabels the letter positions in this full-size ANSI diagram with standard 2-set (두벌식) jamo such as ㅂ, ㅈ, ㄷ, ㄱ and ㅅ. That lets you confirm that an alphanumeric key reports its expected physical position even if your operating system input language is different. ISO, compact and laptop keyboards can have a different physical shape, and Fn or media keys often never reach the browser, so this diagram cannot test those keys.',
      },
    ],
    faq: [
      {
        q: 'Does this keyboard test record or upload anything I type?',
        a: "No. Key presses are read directly by this page's JavaScript and never leave your browser tab — nothing is logged, uploaded or saved after you close or reload the page.",
      },
      {
        q: "What is NKRO and why does the 'max simultaneous' number matter?",
        a: "NKRO (N-key rollover) means a keyboard can report all intended simultaneous keys independently. The 'Max simultaneous' value is only the largest combination this browser received: a result of 6 proves at least six keys registered, while a result of 10 proves at least 10. Test several real combinations because one successful combination cannot certify full NKRO.",
      },
      {
        q: "Why didn't Cmd+Tab, Alt+Tab or F11 register?",
        a: 'Those combinations are captured by the operating system or browser before any webpage can see them, so no browser-based keyboard tester — including this one — can detect them. It does not indicate a hardware fault.',
      },
      {
        q: 'A key stays lit even after I let go — is my keyboard broken?',
        a: 'This page marks any supported key still reported as held after 5 seconds as possibly stuck. Try the key again and test it several times; a repeating result can point to a jammed or faulty switch, while losing browser focus can also interrupt key events.',
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
      '104키 풀사이즈 ANSI 배열을 테스트하고, 확인된 동시 입력 수와 끼임·채터링 키를 살펴보세요. 브라우저에서만 동작하며 업로드하지 않습니다.',
    h1: '키보드 테스트',
    tagline: '104키 풀사이즈 배열에서 키 반응, 동시 입력 수, 끼이거나 이중 입력되는 키를 확인합니다.',
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
      '레이아웃 조작 영역 밖을 클릭한 뒤 키보드의 키를 눌러보세요. 아래 104키 다이어그램에 불이 켜집니다.',
      '여러 키를 동시에 눌러 몇 개까지 한 번에 인식되는지(동시 입력, NKRO) 확인합니다.',
      '레이아웃을 한글로 바꾸면 두벌식 자판에 새겨진 자음·모음으로 표시됩니다.',
      '키가 이중으로 눌리거나(채터링) 손을 떼도 계속 눌린 채로 남으면 빨간 경고가 표시됩니다.',
      '초기화를 눌러 기록을 지우고 다른 키보드로 다시 테스트합니다.',
    ],
    sections: [
      {
        heading: '동시 입력(NKRO)이 의미하는 것',
        body: '동시 입력(롤오버)은 키보드가 한 번에 인식해 전달하는 키의 개수입니다. 특정 조합에서 입력이 막히는 현상과, 누르지 않은 키까지 입력되는 고스팅은 구분해야 합니다. 완전한 NKRO는 모든 키를 독립적으로 전달하는 기능입니다. 이 도구의 최대 동시 입력은 브라우저가 받은 가장 큰 조합을 보여주므로, 10이 나오면 최소 10키 동시 입력은 확인한 셈이지만 완전한 NKRO를 증명하지는 않습니다. Shift+Ctrl+W+A+S+D처럼 실제로 쓰는 조합을 여러 개 눌러 각 키가 모두 켜지는지 확인하세요.',
      },
      {
        heading: '일부 키가 브라우저까지 전달되지 않는 이유',
        body: 'Cmd+Tab, Alt+Tab, F11 전체화면, 브라우저 탭 전환, 일부 미디어 키는 웹페이지에 도달하기 전에 운영체제나 브라우저가 먼저 가로챕니다. 이는 키보드가 정상이어도 생기는, 브라우저 기반 테스트 도구 전체의 공통된 한계이며 고장의 증거가 아닙니다. 반대로 문자·숫자·기호 키가 계속 회색으로 남아 반응이 없다면 그것이 실제 하드웨어 문제를 가리키는 더 믿을 만한 신호입니다.',
      },
      {
        heading: '끼인 키와 채터링(이중 입력) 구분하기',
        body: '손을 뗀 뒤에도 한참 눌린 채로 표시되는 키는 스위치가 끼었거나 이물질에 걸린 신호일 수 있으며, 이 도구는 5초 넘게 눌린 키를 표시합니다. 한 번 눌렀는데 두 번 입력되는 채터링은 같은 키가 해제된 뒤 60밀리초 안에 다시 눌린 것으로 표시합니다. 이는 하드웨어 진단 확정이 아니라 점검 신호이므로, 여러 번 반복해 본 뒤 스위치 청소나 교체를 결정하세요.',
      },
      {
        heading: '실제 두벌식 한글 키보드와 맞춰보기',
        body: '한글 레이아웃은 이 풀사이즈 ANSI 다이어그램의 영문 키 위치를 두벌식 표준 자모(ㅂ, ㅈ, ㄷ, ㄱ, ㅅ 등)로 바꿔 보여줍니다. 운영체제의 입력 언어와 관계없이 영숫자 키가 기대한 물리 위치로 인식되는지 확인할 수 있습니다. ISO, 노트북, 미니 키보드는 물리 모양이 다를 수 있고 Fn·미디어 키는 브라우저에 전달되지 않는 경우가 많아 이 다이어그램으로 확인할 수 없습니다.',
      },
    ],
    faq: [
      {
        q: '이 키보드 테스트가 입력한 내용을 저장하거나 전송하나요?',
        a: '아니요. 키 입력은 이 페이지의 자바스크립트가 직접 읽을 뿐 브라우저 탭 밖으로 나가지 않으며, 페이지를 닫거나 새로고침하면 기록이 남지 않습니다.',
      },
      {
        q: "동시 입력(NKRO)의 '최대 동시 입력' 수치는 무슨 뜻인가요?",
        a: "NKRO는 의도한 모든 동시 키 입력을 각각 인식하는 기능입니다. '최대 동시 입력'은 이 브라우저가 받은 가장 큰 조합일 뿐입니다. 6이 나오면 최소 6키, 10이 나오면 최소 10키가 인식된 것은 확인되지만, 한 조합만으로 완전한 NKRO를 확정할 수는 없습니다.",
      },
      {
        q: 'Cmd+Tab이나 Alt+Tab, F11은 왜 반응하지 않나요?',
        a: '이런 조합키는 웹페이지가 보기도 전에 운영체제나 브라우저가 먼저 처리하기 때문에, 이 도구를 포함한 어떤 브라우저 기반 키보드 테스트도 감지할 수 없습니다. 키보드 고장과는 관련이 없습니다.',
      },
      {
        q: '손을 뗐는데도 키가 계속 눌린 것으로 나와요. 고장인가요?',
        a: '지원되는 키가 5초 넘게 눌린 것으로 표시되면 스위치가 끼었을 수 있습니다. 같은 키를 여러 번 다시 눌러 확인하세요. 반복된다면 스위치 청소나 교체가 필요할 수 있지만, 브라우저 포커스를 잃으면 키 해제 이벤트가 끊길 수도 있습니다.',
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
      rolloverHigh:
        '10개 이상의 키가 동시에 인식되었습니다. 최소 10키 동시 입력을 확인한 것이며, 이것만으로 완전한 NKRO를 증명하지는 않습니다.',
      rolloverPartial:
        '2~9개 키가 동시에 인식되었습니다. 해당 수 이상을 확인한 것일 뿐이니, 평소 쓰는 조합을 더 눌러 확인하세요.',
      rolloverSingle: '몇 개의 키를 함께 눌러 동시에 몇 개까지 인식되는지 확인해 보세요.',
      chatterWarning: '채터링 의심: {keys}. 같은 키가 수십 밀리초 안에 두 번 눌린 것으로 인식되었습니다.',
      stuckWarning: '계속 눌린 상태로 표시됨: {keys}. 손을 뗐다면 스위치가 끼었을 수 있습니다.',
      privacyHint: '키 입력은 이 브라우저 탭 안에서만 읽으며, 업로드되거나 저장되지 않습니다.',
    },
  },
};
