import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  defaultEntries: 'Alex\nSam\nJordan\nTaylor',
  entriesLabel: 'Wheel entries',
  entriesHint: 'Paste one name or choice per line. Repeated lines are separate tickets.',
  entryCount: '{n} entries · up to {max}',
  restoreSample: 'Restore sample',
  clear: 'Clear list',
  presets: 'Quick lists',
  yesNo: 'Yes / No',
  numbers: 'Numbers 1–10',
  lunch: 'Lunch ideas',
  yesNoEntries: 'Yes\nNo',
  numberEntries: '1\n2\n3\n4\n5\n6\n7\n8\n9\n10',
  lunchEntries: 'Sandwich\nSalad\nNoodles\nRice bowl\nSoup\nPizza',
  removeWinner: 'Remove winner after each spin',
  removeWinnerHint: 'Keep this on to draw a fair order without repeats.',
  spin: 'Spin the wheel',
  spinning: 'Spinning…',
  fullscreen: 'Full screen',
  spinShortcut: 'Spin with',
  fullscreenShortcut: 'Full screen with',
  wheelLabel: 'Random selection wheel',
  resultHeading: 'Selected entry',
  waitingResult: 'Your result will appear here',
  entriesRemaining: 'Entries remaining',
  spinsThisSession: 'Spins this session',
  cryptoNote: 'Each spin uses crypto.getRandomValues() in your browser. Your entries are not sent to a server.',
  historyHeading: 'Recent results',
  clearHistory: 'Clear history',
  noHistory: 'Spin the wheel to start a result history.',
  notEnoughEntriesError: 'Add at least two non-empty entries before spinning.',
  tooManyEntriesError: 'Use no more than 100 entries in one wheel.',
  entryTooLongError: 'Keep each entry to 80 characters or fewer.',
  cryptoError: 'This browser does not provide Web Crypto, so a fair spin cannot be made here.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Spin the Wheel — Private, Ad-Free Random Picker',
    description:
      'Spin a saved list of names or choices in a clean full-screen wheel. Every result uses browser Web Crypto, with automatic winner removal and no ads or sign-up.',
    h1: 'Spin the Wheel',
    tagline: 'Paste a list, spin a clean full-screen wheel, and keep your entries in this browser.',
    name: 'Spin the Wheel',
    keywords: ['spin the wheel', 'wheel spinner', 'wheel of names', 'random wheel', 'decision wheel', 'name picker'],
    howTo: [
      'Paste names, prizes, or choices with one entry on each line.',
      'Keep winner removal on when each entry should be chosen only once.',
      'Select Spin the wheel, or press Space outside a text field.',
      'Read the selected entry, then spin again or press Full screen for a room-sized display.',
    ],
    sections: [
      {
        heading: 'How each spin chooses a fair segment',
        body: 'When you spin, the tool selects an entry before the wheel animation starts. It reads a 32-bit value from the browser Web Crypto API, crypto.getRandomValues(), and uses rejection sampling to map that value to the current list. The small unfinished part of the 2³² range is discarded instead of using a simple remainder, so no early slice receives an extra chance. The animation then lands on the already selected segment. Each non-empty line is one ticket; adding the same text twice intentionally gives it two equal slices.',
      },
      {
        heading: 'Draw an order without repeats',
        body: 'Leave “Remove winner after each spin” on for a class roster, raffle, speaking order, chores, or elimination game. Once the wheel stops, exactly the selected line is removed from the saved list. If a label appears twice, only one of those two tickets is removed. Turn the setting off when repeats are valid, such as a yes-or-no decision. A wheel needs 2 to 100 non-empty entries, and each entry can contain up to 80 characters.',
      },
      {
        heading: 'Saved locally, ready for the room',
        body: 'The current list and winner-removal setting are stored only in this browser, so a refresh does not undo setup work. Use Full screen or press F to make the wheel the focus for a classroom, stream, meeting, or party; press F again to leave full screen. The recent-results list is intentionally session-only, while the editable list remains available on this device until you replace or clear it.',
      },
    ],
    faq: [
      {
        q: 'Is this spin-the-wheel result really random?',
        a: 'Yes. Every spin reads crypto.getRandomValues() in the browser and maps a 32-bit random value to the current entries with rejection sampling, so every ticket has the same chance in that spin. The wheel animation reveals a result that was already selected.',
      },
      {
        q: 'Can I stop the same name from being selected twice?',
        a: 'Yes. “Remove winner after each spin” is on by default and deletes exactly one selected line when the wheel stops. With it enabled, no ticket can repeat until you add it again or restore the list.',
      },
      {
        q: 'Are my names or choices uploaded?',
        a: 'No. The list, random selection, animation, and saved settings run in the browser. Your entries are stored locally in this browser and are not sent to a server.',
      },
      {
        q: 'How many entries can a wheel have?',
        a: 'A wheel can contain 2 through 100 non-empty entries, with up to 80 characters per entry. Empty lines are ignored, and duplicate lines count as separate tickets.',
      },
      {
        q: 'Can I show the wheel full screen?',
        a: 'Yes. Select Full screen or press F outside a text field to expand the wheel for a classroom, meeting, stream, or party. Press F again or use your browser’s exit-full-screen control to return.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '돌림판 — 저장되는 무료 랜덤 룰렛',
    description:
      '이름·선택지를 저장해 바로 돌리는 광고 없는 돌림판입니다. 브라우저 난수, 당첨자 자동 제외, 전체화면을 지원하며 가입할 필요가 없습니다.',
    h1: '돌림판',
    tagline: '명단을 붙여 넣고, 전체화면 룰렛으로 공정하게 뽑으세요. 목록은 이 브라우저에 저장됩니다.',
    name: '돌림판',
    keywords: ['돌림판', '룰렛 돌리기', '랜덤 룰렛', '이름 뽑기', '랜덤 추첨', '점심 메뉴 룰렛'],
    howTo: [
      '이름, 경품, 선택지를 한 줄에 하나씩 붙여 넣습니다.',
      '한 번 뽑힌 항목을 빼려면 당첨자 자동 제외를 켜 둡니다.',
      '돌리기를 누르거나 입력칸 밖에서 스페이스바를 누릅니다.',
      '당첨 항목을 확인한 뒤 다시 돌리거나 전체화면으로 크게 보여 줍니다.',
    ],
    sections: [
      {
        heading: '공정한 룰렛 추첨 방식',
        body: '돌리기를 누르면 애니메이션보다 먼저 당첨 항목을 고릅니다. 브라우저 Web Crypto API의 crypto.getRandomValues()로 32비트 난수를 만들고, 이를 현재 항목 수에 맞추는 과정에서 남는 구간은 버립니다. 2³²를 항목 수로 나누었을 때 단순 나머지 연산으로 앞쪽 칸에 아주 작은 편향이 생기는 것을 막기 위한 방식입니다. 원판 회전은 이미 고른 결과를 보여 주는 연출이며 결과를 바꾸지 않습니다. 빈 줄은 제외하고, 같은 항목을 여러 줄에 넣으면 각각 한 장의 추첨권으로 계산합니다.',
      },
      {
        heading: '중복 없는 순서·당첨자 뽑기',
        body: '수업 발표 순서, 경품 추첨, 청소 당번, 벌칙 대상처럼 한 번 뽑힌 항목이 다시 나오면 안 될 때는 당첨자 자동 제외를 켜세요. 룰렛이 멈추면 선택된 줄 하나만 저장된 명단에서 지웁니다. 같은 이름이 두 줄에 있어도 뽑힌 한 장만 제외됩니다. 같은 결과가 다시 나와도 되는 점심 메뉴나 복불복이라면 설정을 끄면 됩니다. 항목은 빈 줄을 제외하고 2개 이상 100개 이하, 한 줄은 최대 80자까지 넣을 수 있습니다.',
      },
      {
        heading: '명단은 기기에 저장하고 전체화면으로 보여 주기',
        body: '현재 명단과 당첨자 자동 제외 설정은 이 브라우저에만 저장하므로 새로고침해도 준비한 항목이 사라지지 않습니다. 전체화면 버튼이나 F 키를 누르면 수업, 회의, 방송, 파티에서 룰렛을 크게 보여 줄 수 있고, 다시 F 키를 누르면 원래 화면으로 돌아옵니다. 최근 결과는 현재 세션에서만 보관하며, 편집한 명단은 직접 바꾸거나 지울 때까지 이 기기에 남습니다.',
      },
    ],
    faq: [
      {
        q: '돌림판 결과는 정말 무작위인가요?',
        a: '네. 매번 브라우저의 crypto.getRandomValues()에서 난수를 만들고, 남는 난수 구간을 버리는 방식으로 현재 항목에 연결하므로 각 추첨권의 확률이 같습니다. 회전 애니메이션은 이미 선택된 결과를 보여 줍니다.',
      },
      {
        q: '같은 이름이 다시 뽑히지 않게 할 수 있나요?',
        a: '네. 기본으로 켜진 당첨자 자동 제외는 룰렛이 멈춘 뒤 선택된 줄 하나를 바로 지웁니다. 이 설정을 켜면 해당 항목을 다시 추가하거나 목록을 복원하기 전까지 같은 추첨권은 다시 나오지 않습니다.',
      },
      {
        q: '입력한 이름과 선택지는 서버로 전송되나요?',
        a: '아니요. 명단 입력, 난수 추첨, 원판 애니메이션, 저장은 모두 브라우저 안에서 처리합니다. 입력한 항목은 서버로 전송하지 않고 현재 브라우저에만 저장합니다.',
      },
      {
        q: '돌림판에 항목을 몇 개까지 넣을 수 있나요?',
        a: '빈 줄을 제외하고 2개부터 100개까지 넣을 수 있으며, 항목 하나는 최대 80자입니다. 빈 줄은 무시하고 같은 항목을 여러 줄에 넣으면 각각 별도의 추첨권으로 계산합니다.',
      },
      {
        q: '전체화면 돌림판을 쓸 수 있나요?',
        a: '네. 전체화면 버튼을 누르거나 입력칸 밖에서 F 키를 누르면 수업, 회의, 방송, 파티에서 보기 좋게 크게 표시됩니다. F 키를 다시 누르거나 브라우저의 전체화면 종료 기능을 쓰면 원래 화면으로 돌아갑니다.',
      },
    ],
    ui: {
      defaultEntries: '민지\n준서\n서연\n도윤',
      entriesLabel: '돌림판 항목',
      entriesHint: '이름이나 선택지를 한 줄에 하나씩 붙여 넣으세요. 같은 줄은 별도의 추첨권으로 계산합니다.',
      entryCount: '{n}개 항목 · 최대 {max}개',
      restoreSample: '예시 복원',
      clear: '목록 지우기',
      presets: '빠른 목록',
      yesNo: '예 / 아니요',
      numbers: '숫자 1–10',
      lunch: '점심 메뉴',
      yesNoEntries: '예\n아니요',
      numberEntries: '1\n2\n3\n4\n5\n6\n7\n8\n9\n10',
      lunchEntries: '김치찌개\n비빔밥\n국밥\n돈까스\n칼국수\n샐러드',
      removeWinner: '돌린 뒤 당첨자 자동 제외',
      removeWinnerHint: '중복 없이 공정한 순서를 정하려면 켜 두세요.',
      spin: '돌리기',
      spinning: '돌리는 중…',
      fullscreen: '전체화면',
      spinShortcut: '돌리기',
      fullscreenShortcut: '전체화면',
      wheelLabel: '랜덤 추첨 돌림판',
      resultHeading: '당첨 항목',
      waitingResult: '여기에 결과가 표시됩니다',
      entriesRemaining: '남은 항목',
      spinsThisSession: '이번 세션 추첨',
      cryptoNote: '매번 브라우저의 crypto.getRandomValues()로 추첨합니다. 입력한 항목은 서버로 전송되지 않습니다.',
      historyHeading: '최근 결과',
      clearHistory: '결과 지우기',
      noHistory: '돌리기를 누르면 최근 결과가 쌓입니다.',
      notEnoughEntriesError: '돌리기 전에 비어 있지 않은 항목을 두 개 이상 넣으세요.',
      tooManyEntriesError: '한 번에 최대 100개 항목까지 넣을 수 있습니다.',
      entryTooLongError: '항목 하나는 80자 이하로 입력하세요.',
      cryptoError: '이 브라우저는 Web Crypto를 지원하지 않아 공정한 추첨을 할 수 없습니다.',
    },
  },
};
