import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  defaultParticipants: 'Alex\nSam\nJordan\nTaylor',
  defaultOutcomes: 'Buys coffee\nSafe\nSafe\nSafe',
  setupHeading: 'Set up the draw',
  setupHint: 'Keep the same number of participants and outcomes. Existing entries stay when you add or remove a row.',
  removePlayer: 'Remove',
  addPlayer: 'Add',
  playerCount: '{n} players',
  participantLabel: 'Player {n}',
  outcomeLabel: 'Outcome {n}',
  participantPlaceholder: 'Player {n}',
  outcomePlaceholder: 'Outcome {n}',
  build: 'Build ladder',
  rebuild: 'Build a new ladder',
  shortcut: 'Build with',
  fairnessHeading: 'A fair assignment first',
  fairnessText: 'Every player is shuffled to one different outcome before the ladder is drawn to show that assignment.',
  playerStat: 'Players',
  outcomeStat: 'Outcomes',
  cryptoNote: 'The draw uses crypto.getRandomValues() in this browser. Names and outcomes are not sent to a server.',
  invalidPlayerCount: 'Use the same number of participants and outcomes, from 2 through 20.',
  emptyLabel: 'Fill in every participant and outcome before building the ladder.',
  labelTooLong: 'Keep each participant and outcome to 80 characters or fewer.',
  cryptoError: 'This browser does not provide Web Crypto, so a fair ladder cannot be made here.',
  ladderHeading: 'Ladder draw',
  ladderHint: 'Choose a player to trace one path, or reveal every assignment at once.',
  waitingLadder: 'Build a ladder to reveal the paths.',
  revealAll: 'Reveal all',
  copyResults: 'Copy results',
  copied: 'Copied',
  ladderGraphicLabel: 'Ladder game board',
  hiddenOutcome: '?',
  participantsToReveal: 'Players to reveal',
  selectParticipant: 'Choose a player to trace their path.',
  allRevealed: 'Every assignment is revealed.',
  allResultsLabel: 'All assignments',
  resultSeparator: '→',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Ladder Game — Fair Ghost Leg Draw',
    description:
      'Make a fair Ghost Leg ladder game for 2–20 people. Every assignment is securely shuffled before animated paths reveal the results, which you can copy to share.',
    h1: 'Ladder Game',
    tagline:
      'Set the names and outcomes, then trace an animated Ghost Leg path with a securely shuffled one-to-one result.',
    name: 'Ladder Game',
    keywords: ['ladder game', 'ghost leg', 'amidakuji', 'random assignment', 'coffee bet', 'chore picker'],
    howTo: [
      'Enter a participant at the top of each pair and one outcome beside it.',
      'Add or remove rows until there are 2 to 20 equal participant and outcome slots.',
      'Select Build ladder, or press L while outside a text field.',
      'Select a participant to animate that path, or use Reveal all to show every match.',
      'Copy results to paste the complete player-to-outcome list into a group chat.',
    ],
    sections: [
      {
        heading: 'Why the assignments are fair',
        body: 'A drawn ladder is a sequence of neighboring swaps, so it always connects every starting line to a different ending line. Randomly placing a small number of rungs, however, can favor some nearby destinations. This tool first creates a uniformly shuffled one-to-one assignment with the browser Web Crypto API, crypto.getRandomValues(), using Fisher–Yates shuffling and rejection sampling. It then builds rungs that produce exactly that already-fair assignment. With N participants, every participant therefore has a 1-in-N chance of each distinct outcome before the animation begins.',
      },
      {
        heading: 'Reveal paths without changing the result',
        body: 'Building the ladder fixes the full assignment before anyone selects a name. Selecting one player only draws that player’s existing route; Reveal all displays the same complete mapping at once. A horizontal rung always connects two adjacent vertical lines, and no two rungs that touch the same line are drawn on the same row, so each crossing has one unambiguous direction. Use a repeated outcome such as “Safe” in several slots when several people may receive the same text; the ladder still assigns each individual slot exactly once.',
      },
      {
        heading: 'Built for an in-person group',
        body: 'The board supports 2 through 20 participant/outcome pairs, including Korean names, emoji, and other Unicode text. Longer boards scroll horizontally rather than squeezing the paths into unreadable columns. Existing rows are retained when the group size changes, and the current setup is saved only in the browser so a refresh does not erase names. Copy results produces a plain player → outcome list after the draw; no public URL or account is required to pass the result into a chat or event note.',
      },
    ],
    faq: [
      {
        q: 'Is this ladder game truly fair?',
        a: 'Yes. Before any rungs are drawn, this tool uses crypto.getRandomValues() to make a uniformly shuffled one-to-one assignment. For N participants, each participant has a 1-in-N chance of each individual outcome slot; the ladder only visualizes that completed assignment.',
      },
      {
        q: 'Can two people get the same result?',
        a: 'Each of the 2–20 bottom slots is connected to exactly one participant, so one individual slot cannot be assigned twice. To allow several people to get the same result, enter identical outcome text in more than one slot, such as three “Safe” slots.',
      },
      {
        q: 'Does revealing a path change the result?',
        a: 'No. The full set of player-to-outcome assignments is fixed when Build ladder is selected. Choosing a player animates only the route that was already determined, and Reveal all shows those same paths together.',
      },
      {
        q: 'Are participant names uploaded or shared in a link?',
        a: 'No. Names, outcomes, random selection, and animation stay in the current browser. The setup is stored only in that browser for refresh recovery, while Copy results copies a plain text summary only when you choose it.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '사다리 타기 — 공정한 결과 추첨과 경로 공개',
    description:
      '2~20명 사다리 타기를 바로 만드세요. 결과를 먼저 공정하게 섞은 뒤 경로를 애니메이션으로 보여 주고, 전체 결과를 복사해 공유할 수 있습니다.',
    h1: '사다리 타기',
    tagline: '참가자와 결과를 넣고 공정하게 섞인 사다리를 만든 뒤, 한 명씩 경로를 따라가며 결과를 확인합니다.',
    name: '사다리 타기',
    keywords: ['사다리 타기', '사다리게임', '사다리 게임', '사다리타기', '커피 내기', '벌칙 뽑기'],
    howTo: [
      '각 줄에 참가자 이름과 도착 결과를 한 쌍씩 입력합니다.',
      '참가자와 결과가 같은 수가 되도록 2명부터 20명까지 행을 추가하거나 줄입니다.',
      '사다리 만들기를 누르거나 입력칸 밖에서 L 키를 누릅니다.',
      '참가자 이름을 눌러 한 명의 경로를 확인하거나 전체 공개로 모든 결과를 봅니다.',
      '결과 복사를 눌러 참가자 → 결과 목록을 단체 채팅이나 기록에 붙여 넣습니다.',
    ],
    sections: [
      {
        heading: '결과를 먼저 섞어 공정하게 만듭니다',
        body: '사다리는 이웃한 세로줄 두 개를 맞바꾸는 가로선의 연속이므로, 각 출발점은 서로 다른 도착점 하나에 연결됩니다. 하지만 가로선을 적은 수만 무작위로 놓으면 가까운 위치로 갈 가능성이 커질 수 있습니다. 이 도구는 가로선을 먼저 뽑지 않습니다. 브라우저 Web Crypto API의 crypto.getRandomValues()와 Fisher–Yates 셔플, 거절 표본추출을 사용해 참가자와 결과의 1:1 연결을 먼저 균등하게 섞고, 그 결과가 나오도록 사다리선을 만듭니다. 따라서 참가자가 N명이면 각 참가자는 각각의 결과 칸에 1/N 확률로 연결됩니다.',
      },
      {
        heading: '경로 공개는 결과를 바꾸지 않습니다',
        body: '사다리 만들기를 누른 순간 모든 참가자와 결과의 연결은 이미 정해집니다. 이름을 눌러 보이는 애니메이션은 그 사람에게 정해진 경로를 보여 주는 연출일 뿐 결과를 다시 뽑지 않습니다. 전체 공개를 눌러도 같은 연결이 한 번에 나타납니다. 가로선은 항상 인접한 두 세로줄만 잇고, 같은 줄에 닿는 가로선은 같은 높이에 그리지 않아 진행 방향이 모호하지 않습니다. 여러 사람이 같은 결과를 받아도 된다면 “통과”처럼 같은 결과 문구를 여러 칸에 넣으면 됩니다.',
      },
      {
        heading: '모임 자리에서 바로 쓰기 좋게',
        body: '한글 이름, 이모지 등 유니코드 문자를 포함해 참가자와 결과를 2쌍부터 20쌍까지 넣을 수 있습니다. 인원이 많을 때는 사다리 그림을 억지로 줄이지 않고 가로로 밀어 볼 수 있습니다. 인원을 늘리거나 줄여도 남아 있는 행의 입력값은 유지하며, 새로고침 뒤에도 준비한 명단을 이어 쓸 수 있도록 현재 브라우저에만 저장합니다. 결과 복사는 추첨 후 참가자 → 결과 목록을 일반 텍스트로 만들기 때문에 공개 링크 없이 단체 채팅이나 행사 기록에 전달할 수 있습니다.',
      },
    ],
    faq: [
      {
        q: '사다리 타기 결과는 정말 공정한가요?',
        a: '네. 이 도구는 가로선을 무작위로 먼저 놓는 대신 crypto.getRandomValues()로 참가자와 결과의 1:1 연결을 먼저 균등하게 섞습니다. 참가자가 N명이면 각 참가자는 각 결과 칸에 1/N 확률을 가지며, 사다리는 그 연결을 보여 줍니다.',
      },
      {
        q: '두 명이 같은 결과를 받을 수 있나요?',
        a: '2~20개의 결과 칸은 각각 한 명에게만 연결되므로 같은 결과 칸에 두 명이 도착하지는 않습니다. 여러 명에게 같은 결과를 주려면 “통과”처럼 같은 문구를 결과 칸 여러 개에 반복해서 입력하면 됩니다.',
      },
      {
        q: '한 명씩 경로를 확인하면 결과가 바뀌나요?',
        a: '아니요. 사다리 만들기를 누른 시점에 참가자와 결과의 전체 연결이 이미 결정됩니다. 이름을 누르는 동작은 정해진 경로를 애니메이션으로 보여 줄 뿐이며, 전체 공개도 같은 결과를 한 번에 표시합니다.',
      },
      {
        q: '참가자 이름이 서버나 공유 링크로 전송되나요?',
        a: '아니요. 이름, 결과, 무작위 배정, 경로 애니메이션은 모두 현재 브라우저에서 처리합니다. 새로고침 복구용 명단은 이 브라우저에만 저장하며, 결과 복사를 눌렀을 때만 일반 텍스트 결과를 직접 공유할 수 있습니다.',
      },
    ],
    ui: {
      defaultParticipants: '민지\n서준\n지우\n도윤',
      defaultOutcomes: '커피 사기\n통과\n통과\n통과',
      setupHeading: '게임 준비',
      setupHint: '참가자와 결과 수를 같게 맞추세요. 인원을 늘리거나 줄여도 남아 있는 입력값은 유지됩니다.',
      removePlayer: '인원 줄이기',
      addPlayer: '인원 추가',
      playerCount: '{n}명',
      participantLabel: '참가자 {n}',
      outcomeLabel: '결과 {n}',
      participantPlaceholder: '참가자 {n}',
      outcomePlaceholder: '결과 {n}',
      build: '사다리 만들기',
      rebuild: '새 사다리 만들기',
      shortcut: '단축키',
      fairnessHeading: '결과를 먼저 공정하게 섞습니다',
      fairnessText:
        '가로선을 그리기 전에 참가자마다 다른 결과를 먼저 균등하게 배정하고, 그 배정을 보여 주는 사다리를 만듭니다.',
      playerStat: '참가자',
      outcomeStat: '결과',
      cryptoNote: '브라우저의 crypto.getRandomValues()로 추첨하며 이름과 결과는 서버로 전송되지 않습니다.',
      invalidPlayerCount: '참가자와 결과를 같은 수로, 2명 이상 20명 이하로 맞추세요.',
      emptyLabel: '사다리를 만들기 전에 모든 참가자와 결과를 입력하세요.',
      labelTooLong: '참가자와 결과는 각각 80자 이하로 입력하세요.',
      cryptoError: '이 브라우저에서는 Web Crypto를 사용할 수 없어 공정한 사다리를 만들 수 없습니다.',
      ladderHeading: '사다리 게임판',
      ladderHint: '참가자를 눌러 한 명의 경로를 보거나 전체 공개로 모든 연결을 확인하세요.',
      waitingLadder: '사다리를 만들면 경로가 표시됩니다.',
      revealAll: '전체 공개',
      copyResults: '결과 복사',
      copied: '복사됨',
      ladderGraphicLabel: '사다리 게임판',
      hiddenOutcome: '?',
      participantsToReveal: '경로를 확인할 참가자',
      selectParticipant: '참가자를 눌러 경로를 확인하세요.',
      allRevealed: '모든 결과를 공개했습니다.',
      allResultsLabel: '전체 결과',
      resultSeparator: '→',
    },
  },
};
