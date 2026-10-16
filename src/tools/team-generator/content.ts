import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  defaultRoster: 'Alex, 4\nSam, 3\nJordan, 2\nTaylor, 5\nCasey, 1\nMorgan, 4',
  rosterLabel: 'Participants',
  rosterHint: 'Use one line per person. For skill balance, add a relative score after a comma, such as “Alex, 4”.',
  participantCount: '{n} participants · up to {max}',
  maxParticipants: '200',
  restoreSample: 'Restore sample',
  clearRoster: 'Clear list',
  teamCountLabel: 'Number of teams',
  teamCountHint: 'Choose from 2 up to the number of participants.',
  modeLabel: 'Assignment',
  randomMode: 'Random',
  balancedMode: 'Balance skill',
  randomHint: 'Shuffle everyone, then distribute members as evenly as possible.',
  balancedHint: 'Every participant needs a score. Lower total scores receive the next strongest participant.',
  generate: 'Generate teams',
  reshuffle: 'Shuffle again',
  shortcut: 'Shuffle again with',
  shortcutKey: 'R',
  localOnlyNote: 'The roster and settings stay in this browser and are saved here for your next visit.',
  resultHeading: 'Teams',
  waitingResult: 'Add at least two participants to make teams.',
  copyResults: 'Copy teams',
  copied: 'Copied',
  teamLabel: 'Team',
  memberCount: '{n} members',
  skillLabel: 'Skill total',
  skillSpreadLabel: 'Skill-total spread',
  notEnoughParticipantsError: 'Add at least two non-empty participant lines.',
  tooManyParticipantsError: 'Use no more than 200 participants at once.',
  nameTooLongError: 'Keep each participant name to 100 characters or fewer.',
  invalidTeamCountError: 'Choose a whole number of teams from 2 through the number of participants.',
  missingScoresError: 'To balance skill, add a numeric score after a comma for every participant.',
  cryptoError: 'This browser does not provide Web Crypto, so teams cannot be shuffled here.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Random Team Generator — Balance by Skill',
    description:
      'Make random teams from a pasted list, or balance optional skill scores while keeping team sizes within one person. Your roster stays in your browser.',
    h1: 'Random Team Generator',
    tagline: 'Paste a roster and make even teams in one click — use optional scores when a fairer skill mix matters.',
    name: 'Random Team Generator',
    keywords: [
      'random team generator',
      'random group generator',
      'team maker',
      'balanced teams',
      'split names into teams',
    ],
    howTo: [
      'Paste one participant on each line, then choose the number of teams.',
      'Select Random for a fresh shuffle, or add a comma and a relative score after every name and select Balance skill.',
      'Select Generate teams, or press R outside a field to shuffle again.',
      'Review each team’s members and skill total, then copy the result for a chat or document.',
    ],
    sections: [
      {
        heading: 'Random teams with even headcounts',
        body: 'Random assignment shuffles the pasted lines and deals them across the requested number of teams. Each person appears exactly once, and the team sizes differ by no more than one. For example, 11 participants split into 3 teams produce sizes of 4, 4, and 3; no one is left outside a team. You can request from 2 teams through the number of participants, with up to 200 non-empty participant lines in one roster.',
      },
      {
        heading: 'What “Balance skill” does',
        body: 'Use scores only when the group agrees on a relative scale such as 1–5 or 1–10. Enter the score after the last comma on every line, such as “Alex, 4”. The generator considers higher scores first and places each person onto an eligible team with the lowest current score total, while preserving the same one-person maximum difference in team size. It displays each team’s score total and the difference between the highest and lowest totals. This is a transparent greedy balance, not a claim that personal skill can be measured perfectly.',
      },
      {
        heading: 'Keep a reusable roster on this device',
        body: 'The roster, team count, and assignment mode are stored only in this browser so a refresh does not erase setup work. The tool sends no names to a server and creates no public result link. Use Copy teams to place a plain-text list of the generated teams on the clipboard; it includes score totals only when skill balancing is active. Clear or replace the list whenever you want to remove it from this browser’s local storage.',
      },
    ],
    faq: [
      {
        q: 'How evenly does the random team generator split people?',
        a: 'The generator assigns every non-empty participant line exactly once and keeps team sizes within one person. For example, 7 people split into 3 teams become groups of 3, 2, and 2 rather than leaving anyone unassigned.',
      },
      {
        q: 'How do I make balanced teams by skill?',
        a: 'Put a relative numeric score after a comma on every participant line, such as “Alex, 4”, then select Balance skill. The tool assigns higher scores first to the eligible team with the lowest current score total and shows every final total and the total-score spread.',
      },
      {
        q: 'Do all participants need a score?',
        a: 'Yes, Balance skill requires a numeric score on every non-empty line so its team totals mean the same thing. Random assignment accepts names alone and still limits the difference in team size to one person.',
      },
      {
        q: 'Are names sent to a server?',
        a: 'No. Team generation runs in the browser, and the roster plus its settings are saved only in that browser to survive a refresh. You can clear the list at any time; this tool accepts up to 200 participant lines in one roster.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '팀 나누기 — 실력 균형까지 한 번에',
    description:
      '명단을 붙여 넣어 무작위로 팀을 나누거나, 선택 입력한 실력 점수로 팀별 합계를 가깝게 맞추세요. 명단은 브라우저에만 남습니다.',
    h1: '팀 나누기',
    tagline: '명단을 붙여 넣고 팀 수를 고르세요. 실력 점수를 함께 쓰면 인원과 점수 합계를 모두 고려해 나눕니다.',
    name: '팀 나누기',
    keywords: ['팀 나누기', '랜덤 팀 나누기', '조 편성', '랜덤 조 편성', '실력 균형 팀', '팀 생성기'],
    howTo: [
      '참가자를 한 줄에 한 명씩 붙여 넣고 팀 수를 고르세요.',
      '완전 무작위로 섞으려면 랜덤을 고르고, 실력을 맞추려면 모든 이름 뒤에 쉼표와 상대 점수를 넣고 실력 균형을 고르세요.',
      '팀 만들기를 누르거나 입력칸 밖에서 R 키를 눌러 다시 섞으세요.',
      '팀별 명단과 실력 합계를 확인한 뒤 결과 복사로 단체 채팅이나 문서에 붙여 넣으세요.',
    ],
    sections: [
      {
        heading: '인원을 고르게 나누는 랜덤 조 편성',
        body: '랜덤 방식은 붙여 넣은 명단을 섞은 뒤 선택한 팀 수에 차례로 배분합니다. 빈 줄이 아닌 참가자는 정확히 한 번씩만 들어가며, 팀별 인원 차이는 최대 1명입니다. 예를 들어 11명을 3팀으로 나누면 4명·4명·3명이 되고 누구도 팀 밖에 남지 않습니다. 팀 수는 최소 2팀부터 참가자 수까지 고를 수 있고, 한 명단에는 최대 200명을 넣을 수 있습니다.',
      },
      {
        heading: '실력 균형은 어떻게 계산하나요',
        body: '실력을 함께 고려해야 할 때만 모두가 합의한 상대 점수 척도(예: 1~5, 1~10)를 사용하세요. 각 줄의 마지막에 “민지, 4”처럼 쉼표 뒤에 점수를 적으면 됩니다. 이 도구는 높은 점수부터 보고 현재 점수 합계가 가장 낮은, 아직 자리가 있는 팀에 배정합니다. 이때도 팀별 인원 차이는 최대 1명을 넘지 않습니다. 결과에서 팀별 실력 합계와 가장 높은 합계·낮은 합계의 차이를 보여 줍니다. 사람의 실력을 완벽하게 수치화한다는 뜻이 아니라, 공개한 규칙으로 대략적인 균형을 맞추는 방식입니다.',
      },
      {
        heading: '명단은 이 브라우저에만 저장',
        body: '입력한 명단, 팀 수, 나누기 방식은 새로고침 뒤에도 이어서 쓸 수 있도록 현재 브라우저에만 저장합니다. 이름을 서버로 보내거나 공개 결과 링크를 만들지 않습니다. 결과 복사를 누르면 팀별 명단이 일반 텍스트로 클립보드에 복사되며, 실력 균형을 썼을 때만 실력 합계도 포함합니다. 이 브라우저에 남긴 내용을 없애려면 명단을 비우거나 다른 명단으로 바꾸세요.',
      },
    ],
    faq: [
      {
        q: '팀 나누기는 인원을 얼마나 고르게 배분하나요?',
        a: '이 도구는 빈 줄이 아닌 참가자를 정확히 한 번씩만 넣고 팀별 인원 차이를 최대 1명으로 만듭니다. 예를 들어 7명을 3팀으로 나누면 3명·2명·2명으로 배정되어 남는 사람이 없습니다.',
      },
      {
        q: '실력 균형 팀은 어떻게 만드나요?',
        a: '모든 참가자 이름 뒤에 “민지, 4”처럼 쉼표와 상대 점수를 적은 뒤 실력 균형을 고르세요. 높은 점수부터 현재 실력 합계가 가장 낮은 팀에 배정하고, 결과에 각 팀의 합계와 팀 간 합계 차이를 표시합니다.',
      },
      {
        q: '실력 점수를 모두 입력해야 하나요?',
        a: '네. 실력 균형은 모든 빈 줄이 아닌 참가자에게 숫자 점수가 있어야 팀별 합계를 같은 기준으로 비교할 수 있습니다. 랜덤 방식은 이름만으로도 작동하며 팀별 인원 차이를 최대 1명으로 제한합니다.',
      },
      {
        q: '팀 나누기 명단이 서버에 저장되나요?',
        a: '아니요. 팀 나누기는 브라우저에서 실행하며 명단과 설정은 새로고침 뒤에도 이어 쓰도록 현재 브라우저에만 저장합니다. 원하면 명단을 비울 수 있고 한 번에 최대 200명을 넣을 수 있습니다.',
      },
    ],
    ui: {
      defaultRoster: '민지, 4\n서준, 3\n지우, 2\n도윤, 5\n하은, 1\n예준, 4',
      rosterLabel: '참가자 명단',
      rosterHint: '한 줄에 한 명씩 넣으세요. 실력 균형에는 “민지, 4”처럼 이름 뒤에 쉼표와 상대 점수를 붙이세요.',
      participantCount: '{n}명 · 최대 {max}명',
      maxParticipants: '200',
      restoreSample: '예시 복원',
      clearRoster: '명단 비우기',
      teamCountLabel: '팀 수',
      teamCountHint: '2팀부터 참가자 수까지 고를 수 있습니다.',
      modeLabel: '나누기 방식',
      randomMode: '랜덤',
      balancedMode: '실력 균형',
      randomHint: '명단을 섞은 뒤 인원 차이가 최대 1명이 되도록 나눕니다.',
      balancedHint: '모든 참가자에게 점수가 필요합니다. 현재 합계가 낮은 팀부터 높은 점수를 배정합니다.',
      generate: '팀 만들기',
      reshuffle: '다시 섞기',
      shortcut: '다시 섞기',
      shortcutKey: 'R',
      localOnlyNote: '명단과 설정은 이 브라우저에만 저장되어 다음에도 이어서 쓸 수 있습니다.',
      resultHeading: '팀 결과',
      waitingResult: '참가자를 두 명 이상 입력하면 팀을 만들 수 있습니다.',
      copyResults: '결과 복사',
      copied: '복사됨',
      teamLabel: '팀',
      memberCount: '{n}명',
      skillLabel: '실력 합계',
      skillSpreadLabel: '팀 간 실력 합계 차이',
      notEnoughParticipantsError: '빈 줄이 아닌 참가자를 두 명 이상 입력하세요.',
      tooManyParticipantsError: '한 번에 참가자는 200명 이하로 입력하세요.',
      nameTooLongError: '참가자 이름은 100자 이하로 입력하세요.',
      invalidTeamCountError: '팀 수는 2 이상, 참가자 수 이하의 정수로 입력하세요.',
      missingScoresError: '실력 균형을 쓰려면 모든 참가자 이름 뒤에 쉼표와 숫자 점수를 입력하세요.',
      cryptoError: '이 브라우저에서는 Web Crypto를 사용할 수 없어 팀을 섞을 수 없습니다.',
    },
  },
};
