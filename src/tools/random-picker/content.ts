import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  defaultEntries: 'Alex\nSam\nJordan\nTaylor',
  entriesLabel: 'Names or choices',
  entriesHint: 'Paste one entry per line. Repeated entries count as separate tickets.',
  entryCount: '{n} entries · up to {max}',
  maxEntries: '1,000',
  restoreSample: 'Restore sample',
  clear: 'Clear list',
  removeWinner: 'Remove each winner after drawing',
  removeWinnerHint: 'Turn this off when the same entry may be picked again.',
  pick: 'Pick a name',
  picking: 'Picking…',
  shortcut: 'Draw again with',
  shortcutKey: 'R',
  resultHeading: 'Draw result',
  waitingResult: 'Your result will appear here',
  copyResult: 'Copy result',
  copied: 'Copied',
  entriesRemainingLabel: 'Entries remaining',
  drawnLabel: 'Draws this session',
  cryptoNote: 'The draw uses crypto.getRandomValues() in your browser. Your list is not sent to a server.',
  historyHeading: 'Recent draws',
  clearHistory: 'Clear history',
  noHistory: 'No names have been picked yet.',
  shareWinner: 'Winner',
  shareParticipants: 'Entries in draw',
  shareTime: 'Drawn',
  notEnoughEntriesError: 'Add at least two non-empty entries before drawing.',
  tooManyEntriesError: 'Use no more than 1,000 entries in one draw.',
  entryTooLongError: 'Keep each entry to 200 characters or fewer.',
  cryptoError: 'This browser does not provide Web Crypto, so a fair draw cannot be made here.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Random Name Picker — Private, Ad-Free Draws',
    description:
      'Paste a list and pick a random name in one click. Draws use browser Web Crypto, remove winners automatically, and copy a shareable result without ads or sign-up.',
    h1: 'Random Name Picker',
    tagline:
      'Paste a list, watch the quick draw animation, and copy the result — all in your browser with no ads or account.',
    name: 'Random Name Picker',
    keywords: ['random name picker', 'wheel of names', 'random picker', 'raffle winner picker', 'random choice maker'],
    howTo: [
      'Paste names, tasks, or choices with one entry on each line.',
      'Leave “Remove each winner after drawing” on to draw without replacement, or turn it off to allow repeats.',
      'Select Pick a name, or press R when you are outside a text field.',
      'Copy the result summary to share the picked name, number of entries, and draw time.',
    ],
    sections: [
      {
        heading: 'How this random draw stays fair',
        body: 'Each draw starts with the browser Web Crypto API, crypto.getRandomValues(), rather than a predictable counter or a fixed animation endpoint. The tool maps its unsigned 32-bit values to the current list with rejection sampling: values in the small incomplete remainder are discarded before a list index is chosen. That avoids giving an early entry a slightly different chance when the list length does not divide 2³² evenly. The animation only reveals the already selected entry; changing its timing does not change the outcome. Every non-empty line has one ticket, so repeated lines deliberately give that label multiple tickets.',
      },
      {
        heading: 'Drawing without repeats',
        body: 'Enable removal when you need a sequence of distinct winners for a classroom, giveaway, speaking order, or chore rotation. After a result appears, this tool removes exactly that one line from the editable list, even if another line has the same wording. It keeps the 10 most recent results on the page for the current session and shows the number of entries left. Turn removal off for choices that may fairly reappear, such as a coin-style prompt. A list must have at least 2 non-empty entries, each entry may contain up to 200 characters, and a draw can use up to 1,000 entries.',
      },
      {
        heading: 'Private results you can still share',
        body: 'Names and choices stay in this browser: the picker has no upload, account, or public result page. Your list and the removal preference are stored only in this browser so an accidental refresh does not erase setup work. The Copy result action places a compact text record on your clipboard with the winner, the entry count at the draw, and the local draw time. Paste it into a group chat, document, or event record when you need to communicate the result without publishing the participant list in a URL. Clear the list or recent-draw history at any time.',
      },
    ],
    faq: [
      {
        q: 'Is the random name picker really random?',
        a: 'Yes. Each result is selected from the current non-empty lines with crypto.getRandomValues() and rejection sampling, so every one-line ticket has the same chance in that draw. The short cycling animation reveals a result already chosen by that source.',
      },
      {
        q: 'Can I stop the same name being picked twice?',
        a: 'Yes. “Remove each winner after drawing” is on by default and removes exactly one selected line immediately after each result. With it enabled, keep drawing until fewer than 2 entries remain; turn it off when repeats are allowed.',
      },
      {
        q: 'Are names sent to a server?',
        a: 'No. The list, result animation, and random selection run in the browser. This picker sends no names to a server; it keeps the list locally in the current browser so it can survive a refresh until you clear or replace it.',
      },
      {
        q: 'How many names can I enter?',
        a: 'One draw can contain from 2 through 1,000 non-empty lines, and each line can be up to 200 characters. Empty lines are ignored, while duplicate lines intentionally count as separate tickets for weighted-by-repetition draws.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '제비뽑기 — 광고 없이 바로 하는 랜덤 뽑기',
    description:
      '명단을 붙여 넣고 한 번에 랜덤으로 뽑으세요. 브라우저 난수로 추첨하고 당첨자를 자동 제외하며, 광고·가입 없이 결과를 복사해 공유할 수 있습니다.',
    h1: '제비뽑기',
    tagline: '명단을 붙여 넣고 빠른 추첨 연출로 한 명을 뽑은 뒤 결과를 복사하세요 — 광고·가입이 없습니다.',
    name: '제비뽑기',
    keywords: ['제비뽑기', '랜덤 뽑기', '이름 뽑기', '당첨자 추첨', '랜덤 룰렛'],
    howTo: [
      '이름, 순서, 선택지를 한 줄에 하나씩 붙여 넣으세요.',
      '중복 당첨을 막으려면 당첨자 자동 제외를 켜 두고, 반복 추첨이 필요하면 끄세요.',
      '이름 뽑기를 누르거나 입력칸 밖에서 R 키를 눌러 추첨하세요.',
      '결과 복사를 눌러 당첨자·참가 항목 수·추첨 시각을 메시지나 기록에 붙여 넣으세요.',
    ],
    sections: [
      {
        heading: '공정한 랜덤 뽑기 방식',
        body: '이 도구는 미리 정한 애니메이션의 끝점이나 예측하기 쉬운 숫자가 아니라 브라우저 Web Crypto API의 crypto.getRandomValues()에서 추첨값을 만듭니다. 그 뒤 32비트 난수를 현재 명단의 인덱스로 바꿀 때 남는 구간은 버리는 방식으로 처리합니다. 명단 길이가 2³²를 나누지 못해도 앞쪽 항목이 아주 조금 더 자주 뽑히는 모듈로 편향을 피하기 위해서입니다. 화면에서 빠르게 바뀌는 이름은 이미 고른 결과를 보여 주는 연출이며, 회전 시간이나 입력 순서는 결과를 바꾸지 않습니다. 빈 줄은 제외되고 같은 이름을 여러 줄에 넣으면 각각 한 장의 제비로 계산합니다.',
      },
      {
        heading: '중복 없는 당첨자 추첨',
        body: '수업 발표자, 경품 당첨자, 진행 순서, 청소 당번처럼 같은 사람이 다시 뽑히면 안 되는 경우에는 당첨자 자동 제외를 켜세요. 추첨이 끝나면 당첨된 줄 하나만 입력 명단에서 즉시 지웁니다. 같은 이름이 두 줄에 있어도 선택된 제비 한 장만 사라집니다. 최근 결과는 이번 세션에서 최대 10개까지 확인할 수 있고, 남은 항목 수도 함께 표시됩니다. 반복 선택이 가능한 질문이나 벌칙이라면 자동 제외를 끄면 됩니다. 한 번에 2개 이상 1,000개 이하의 항목을 넣을 수 있으며, 한 줄은 최대 200자입니다.',
      },
      {
        heading: '명단은 기기에 두고 결과만 공유',
        body: '입력한 이름과 선택지는 업로드하거나 공개 링크로 만들지 않고 현재 브라우저에서만 처리합니다. 실명이 있는 명단도 서버로 보내지 않으며, 새로고침으로 준비한 명단이 사라지지 않도록 목록과 자동 제외 설정은 이 브라우저에만 저장합니다. 결과 복사를 누르면 당첨자, 추첨 당시의 항목 수, 기기 현지 시각이 짧은 텍스트로 클립보드에 복사됩니다. 이를 단체 채팅, 행사 기록, 회의 문서에 붙여 넣으면 전체 명단을 공개하지 않고도 결과를 전달할 수 있습니다. 필요할 때 명단과 최근 결과를 직접 지울 수 있습니다.',
      },
    ],
    faq: [
      {
        q: '제비뽑기는 정말 무작위인가요?',
        a: '네. 현재 명단의 빈 줄이 아닌 각 줄은 crypto.getRandomValues()와 편향을 줄이는 거절 표본추출 방식으로 같은 확률을 갖습니다. 빠르게 바뀌는 이름 연출은 이미 브라우저에서 선택한 결과를 보여 줄 뿐입니다.',
      },
      {
        q: '같은 사람이 두 번 뽑히지 않게 할 수 있나요?',
        a: '네. 기본으로 켜진 당첨자 자동 제외는 결과가 나온 직후 선택된 줄 하나를 명단에서 제거합니다. 이 설정을 켜면 항목이 2개 미만으로 남을 때까지 중복 없이 계속 추첨할 수 있고, 반복을 허용하려면 설정을 끄면 됩니다.',
      },
      {
        q: '입력한 이름이 서버에 저장되나요?',
        a: '아니요. 명단, 추첨 연출, 결과 선택은 모두 브라우저에서 처리하며 이름을 서버로 전송하지 않습니다. 새로고침 뒤에도 준비한 명단을 이어 쓸 수 있도록 현재 브라우저에만 저장되고, 원하면 목록을 비워 지울 수 있습니다.',
      },
      {
        q: '몇 명까지 이름 뽑기에 넣을 수 있나요?',
        a: '한 번의 추첨에는 빈 줄을 제외하고 최소 2개부터 최대 1,000개까지 넣을 수 있으며, 항목 한 줄은 200자까지입니다. 같은 이름을 여러 줄에 넣으면 중복 오류가 아니라 그 수만큼의 제비가 들어간 것으로 처리합니다.',
      },
    ],
    ui: {
      defaultEntries: '민지\n서준\n지우\n도윤',
      entriesLabel: '이름 또는 선택지',
      entriesHint: '한 줄에 하나씩 붙여 넣으세요. 같은 항목을 여러 줄에 넣으면 제비 수만큼 계산합니다.',
      entryCount: '{n}개 항목 · 최대 {max}개',
      maxEntries: '1,000',
      restoreSample: '예시 복원',
      clear: '명단 비우기',
      removeWinner: '추첨 뒤 당첨자 자동 제외',
      removeWinnerHint: '같은 항목의 반복 추첨을 허용하려면 끄세요.',
      pick: '이름 뽑기',
      picking: '추첨 중…',
      shortcut: '다시 뽑기',
      shortcutKey: 'R',
      resultHeading: '추첨 결과',
      waitingResult: '결과가 여기에 표시됩니다',
      copyResult: '결과 복사',
      copied: '복사됨',
      entriesRemainingLabel: '남은 항목',
      drawnLabel: '이번 세션 추첨',
      cryptoNote: '브라우저의 crypto.getRandomValues()로 추첨하며 명단은 서버로 전송되지 않습니다.',
      historyHeading: '최근 추첨',
      clearHistory: '기록 지우기',
      noHistory: '아직 뽑은 이름이 없습니다.',
      shareWinner: '당첨자',
      shareParticipants: '추첨 항목 수',
      shareTime: '추첨 시각',
      notEnoughEntriesError: '추첨하려면 빈 줄이 아닌 항목을 두 개 이상 넣으세요.',
      tooManyEntriesError: '한 번에 1,000개 이하의 항목만 넣을 수 있습니다.',
      entryTooLongError: '한 항목은 200자 이하로 입력하세요.',
      cryptoError: '이 브라우저에서는 Web Crypto를 사용할 수 없어 공정한 추첨을 할 수 없습니다.',
    },
  },
};
