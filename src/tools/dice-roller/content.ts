import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  intro: 'Roll standard dice, mix groups, and use D&D notation in one compact roller.',
  expressionLabel: 'Dice expression',
  expressionHint: 'Examples: 2d6, d20+5, 4d6kh3, 2d6+d8−1. Up to 100 dice and d1000.',
  presetsLabel: 'Quick rolls',
  presetD6: 'd6',
  preset2D6: '2d6',
  presetD20: 'd20',
  presetAdvantage: 'Advantage',
  presetDisadvantage: 'Disadvantage',
  presetAbility: 'Ability score',
  roll: 'Roll dice',
  shortcut: 'Roll with',
  shortcutKey: 'R',
  resultHeading: 'Latest roll',
  totalLabel: 'Total',
  diceLabel: 'Dice rolled',
  modifierLabel: 'Modifier',
  kept: 'kept',
  dropped: 'dropped',
  copy: 'Copy',
  copied: 'Copied',
  cryptoNote: 'Each roll uses your browser’s crypto.getRandomValues() source with unbiased sampling.',
  historyHeading: 'Roll history',
  clearHistory: 'Clear history',
  noHistory: 'Your latest 10 rolls are kept in this browser.',
  errorEmpty: 'Enter a dice expression such as 2d6 or d20+5.',
  errorInvalid: 'Use dice notation such as 2d6+d8−1. Dice groups cannot be subtracted.',
  errorTooManyDice: 'Use no more than 100 dice in one roll.',
  errorTooManySides: 'Each die needs 2 to 1,000 sides.',
  errorModifierTooLarge: 'Use a total modifier from −10,000 to 10,000.',
  errorInvalidKeep: 'The number kept must be from 1 up to the number of dice rolled.',
  errorCrypto: 'Your browser does not provide Web Crypto, so fair rolls cannot be generated here.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Roll Dice — D&D Dice, Notation, and History',
    description:
      'Roll dice from d4 to d1000 with D&D notation, mixed groups, keep-high or keep-low rules, a keyboard shortcut, and a local 10-roll history.',
    h1: 'Roll Dice',
    tagline: 'Roll d4 to d1000, combine dice in one expression, and keep the latest results at hand.',
    name: 'Dice Roller',
    keywords: [
      'roll dice',
      'dice roller',
      'online dice',
      'D&D dice roller',
      'd20 roller',
      'virtual dice',
      'dice notation',
    ],
    howTo: [
      'Enter a dice expression such as 2d6, d20+5, or 2d6+d8−1.',
      'Choose a quick roll for a d6, 2d6, d20, advantage, disadvantage, or a D&D ability score.',
      'Select Roll dice or press R when you are not typing in a field.',
      'Read each die and the total; parentheses mark dice excluded by a keep rule.',
      'Copy the latest result, or revisit the 10 most recent rolls stored in this browser.',
    ],
    sections: [
      {
        heading: 'Dice notation: groups, modifiers, and keep rules',
        body: 'The notation NdM means roll N dice with M sides: 2d6 rolls two six-sided dice and d20 means one twenty-sided die. Add different groups with +, as in 2d6+d8, then add or subtract one numeric modifier, as in d20+5. For D&D-style ability scores, 4d6kh3 rolls four d6 and keeps the highest three; 2d20kh1 is advantage and 2d20kl1 is disadvantage. This roller accepts up to 100 dice in one expression and 2 to 1,000 sides per die.',
      },
      {
        heading: 'How a browser roll stays evenly distributed',
        body: 'Every individual die uses crypto.getRandomValues(), the browser Web Crypto API that MDN describes as cryptographically strong. The roller uses rejection sampling instead of a direct remainder when mapping a 32-bit random value onto a die’s sides. That avoids the tiny modulo bias that would otherwise occur whenever the number of possible source values is not divisible by the number of sides. A local result is still not a certified or independently auditable draw.',
      },
      {
        heading: 'd20 and 3d6 have different probability shapes',
        body: 'A fair d20 gives each result from 1 to 20 a 5% chance. Three d6 have the same broad middle range of 3 to 18 but do not behave like a d20: 10 and 11 each occur in 27 of 216 outcomes, or 12.5%, while a 3 or 18 occurs in only 1 of 216 outcomes, about 0.46%. Multiple dice tend to cluster around their average, which matters when choosing a game rule or demonstrating probability.',
      },
    ],
    faq: [
      {
        q: 'How do I roll multiple types of dice at once?',
        a: 'Enter each group with a plus sign, such as 2d6+d8 or d20+2d6. The roller evaluates every group in one result, shows each die separately, and adds all kept dice plus one final numeric modifier.',
      },
      {
        q: 'What does 4d6kh3 mean?',
        a: '4d6kh3 means roll four six-sided dice and keep the highest three values. It is a common D&D ability-score method; the excluded lowest die is shown in parentheses so the total can be checked.',
      },
      {
        q: 'How do advantage and disadvantage work in this dice roller?',
        a: 'Use 2d20kh1 for advantage to keep the higher d20, or 2d20kl1 for disadvantage to keep the lower d20. Add a character modifier once after the expression, for example 2d20kh1+5.',
      },
      {
        q: 'Are the dice rolls random and fair?',
        a: 'Each die is generated locally with the browser crypto.getRandomValues() API and rejection sampling, so every face from 1 through the chosen number of sides has the same chance in a roll. The result is suitable for casual games, but it is not an independently certified draw.',
      },
      {
        q: 'Does this dice roller save or send my rolls?',
        a: 'The latest 10 roll summaries are saved only in this browser so they survive a refresh. No roll or dice expression is sent to a server, and Clear history removes the locally saved summaries.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '주사위 굴리기 — D&D 다면체·표기법·기록',
    description:
      'D4부터 D1000까지 주사위를 굴리세요. TRPG 표기법, 여러 종류 동시 굴림, 높은·낮은 눈 선택, 최근 10회 기록과 단축키를 지원합니다.',
    h1: '주사위 굴리기',
    tagline: 'D4부터 D1000까지 굴리고, TRPG 주사위식을 한 번에 계산해 최근 결과까지 확인합니다.',
    name: '주사위 굴리기',
    keywords: ['주사위 굴리기', '온라인 주사위', '랜덤 주사위', 'D&D 주사위', 'TRPG 주사위', 'd20 굴리기', '주사위식'],
    howTo: [
      '2d6, d20+5, 2d6+d8−1처럼 주사위식을 입력하세요.',
      'D6, 2D6, D20, 유리한 판정, 불리한 판정, 능력치 굴림 중 빠른 굴림을 고르세요.',
      '입력 중이 아닐 때 주사위 굴리기를 누르거나 R 키를 누르세요.',
      '각 주사위 눈과 합계를 확인하세요. 유지 규칙에서 제외된 눈은 괄호로 표시합니다.',
      '최신 결과를 복사하거나 이 브라우저에 저장된 최근 10회 굴림을 다시 확인하세요.',
    ],
    sections: [
      {
        heading: '주사위식: 여러 종류, 보정치, 높은·낮은 눈 유지',
        body: 'NdM은 M면체 주사위를 N개 굴린다는 뜻입니다. 2d6은 6면체 2개, d20은 20면체 1개입니다. 2d6+d8처럼 +로 다른 주사위를 한 식에 넣고, d20+5처럼 숫자 보정치를 더하거나 뺄 수 있습니다. D&D 능력치 굴림에 쓰는 4d6kh3은 D6 네 개를 굴려 높은 3개만 더한다는 뜻입니다. 2d20kh1은 유리한 판정, 2d20kl1은 불리한 판정입니다. 한 식에는 최대 100개, 한 주사위에는 2면부터 1,000면까지 입력할 수 있습니다.',
      },
      {
        heading: '브라우저에서 각 눈이 고르게 나오는 방식',
        body: '각 주사위 눈은 브라우저 Web Crypto의 crypto.getRandomValues()로 만들며, MDN은 이 API가 암호학적으로 강한 무작위 값을 제공한다고 설명합니다. 32비트 난수를 주사위 면수에 맞출 때 단순 나머지 연산을 쓰면 아주 작은 편향이 생길 수 있으므로, 이 도구는 나누어떨어지지 않는 나머지 구간을 다시 뽑는 거절 표본추출 방식을 사용합니다. 단, 브라우저에서 만든 결과는 공인 추첨이나 제3자 검증 기록은 아닙니다.',
      },
      {
        heading: 'D20 한 개와 3D6은 같은 범위라도 확률이 다릅니다',
        body: '공정한 D20은 1부터 20까지 각각 5% 확률로 나옵니다. 3D6은 3부터 18까지의 합이 나오지만 분포는 다릅니다. 10과 11은 각각 216가지 중 27가지, 즉 12.5%이고 3과 18은 각각 216가지 중 1가지, 약 0.46%입니다. 여러 주사위를 더하면 평균 근처에 결과가 모이므로 게임 규칙을 고르거나 확률을 설명할 때 차이를 알아두면 좋습니다.',
      },
    ],
    faq: [
      {
        q: '서로 다른 주사위를 한 번에 굴리려면 어떻게 하나요?',
        a: '2d6+d8 또는 d20+2d6처럼 주사위 묶음 사이에 +를 입력하면 됩니다. 이 도구는 모든 묶음을 한 결과에서 굴려 각 눈을 보여 주고, 유지된 주사위와 마지막 숫자 보정치를 더합니다.',
      },
      {
        q: '4d6kh3은 무슨 뜻인가요?',
        a: '4d6kh3은 6면체 주사위 4개를 굴린 뒤 높은 눈 3개만 더한다는 뜻입니다. D&D 능력치 굴림에서 자주 쓰며, 제외된 가장 낮은 눈은 괄호로 표시되어 합계를 확인할 수 있습니다.',
      },
      {
        q: '유리한 판정과 불리한 판정은 어떻게 굴리나요?',
        a: '유리한 판정은 2d20kh1을 입력해 D20 두 개 중 높은 눈을 유지하고, 불리한 판정은 2d20kl1을 입력해 낮은 눈을 유지합니다. 캐릭터 보정치는 2d20kh1+5처럼 식 끝에 한 번 더합니다.',
      },
      {
        q: '온라인 주사위 결과는 공정한가요?',
        a: '각 주사위 눈은 브라우저 crypto.getRandomValues() API와 거절 표본추출 방식으로 기기 안에서 생성하므로 1부터 선택한 면수까지 각 눈의 확률이 같습니다. 일반 게임에는 쓸 수 있지만 제3자가 인증한 추첨 결과는 아닙니다.',
      },
      {
        q: '주사위 굴림 기록이 서버로 전송되나요?',
        a: '아니요. 최근 10회 굴림 요약은 새로고침 뒤에도 볼 수 있도록 이 브라우저에만 저장하며, 주사위식과 결과는 서버로 전송하지 않습니다. 기록 지우기를 누르면 로컬에 저장한 요약도 삭제됩니다.',
      },
    ],
    ui: {
      intro: '일반 주사위부터 여러 종류를 섞은 TRPG 주사위식까지 한 화면에서 굴립니다.',
      expressionLabel: '주사위식',
      expressionHint: '예: 2d6, d20+5, 4d6kh3, 2d6+d8−1. 최대 100개, D1000까지 지원합니다.',
      presetsLabel: '빠른 굴림',
      presetD6: 'D6',
      preset2D6: '2D6',
      presetD20: 'D20',
      presetAdvantage: '유리한 판정',
      presetDisadvantage: '불리한 판정',
      presetAbility: '능력치 굴림',
      roll: '주사위 굴리기',
      shortcut: '단축키',
      shortcutKey: 'R',
      resultHeading: '이번 굴림',
      totalLabel: '합계',
      diceLabel: '굴린 주사위',
      modifierLabel: '보정치',
      kept: '유지',
      dropped: '제외',
      copy: '복사',
      copied: '복사됨',
      cryptoNote: '각 굴림은 브라우저 crypto.getRandomValues()와 편향 없는 표본추출로 만듭니다.',
      historyHeading: '굴림 기록',
      clearHistory: '기록 지우기',
      noHistory: '최근 10회 굴림을 이 브라우저에 저장합니다.',
      errorEmpty: '2d6 또는 d20+5처럼 주사위식을 입력하세요.',
      errorInvalid: '2d6+d8−1처럼 입력하세요. 주사위 묶음은 뺄 수 없습니다.',
      errorTooManyDice: '한 번에 주사위는 최대 100개까지 굴릴 수 있습니다.',
      errorTooManySides: '주사위 면 수는 2부터 1,000까지 입력하세요.',
      errorModifierTooLarge: '전체 보정치는 −10,000부터 10,000까지 입력하세요.',
      errorInvalidKeep: '유지할 개수는 1개 이상, 굴린 주사위 개수 이하여야 합니다.',
      errorCrypto: '이 브라우저는 Web Crypto를 제공하지 않아 공정한 주사위를 만들 수 없습니다.',
    },
  },
};
