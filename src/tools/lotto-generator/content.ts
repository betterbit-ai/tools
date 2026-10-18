import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  intro:
    'Make one to five Lotto 6/45 lines. Select any fixed or excluded balls first, or draw a fresh quick pick immediately.',
  selectionHeading: 'Choose fixed or excluded numbers',
  selectionHint: 'Click a ball: unselected → fixed → excluded → unselected.',
  fixed: 'Fixed',
  excluded: 'Excluded',
  unselected: 'Unselected',
  fixedCount: 'Fixed balls',
  excludedCount: 'Excluded balls',
  clearSelections: 'Clear selections',
  gameCountLabel: 'How many lines?',
  gameCountHint: 'Each line has 6 different numbers from 1–45.',
  generate: 'Generate Lotto numbers',
  shortcut: 'Generate with',
  shortcutKey: 'G',
  resultHeading: 'Your Lotto 6/45 lines',
  gameLabel: 'Line {n}',
  copy: 'Copy',
  copied: 'Copied',
  possibleLabel: 'Possible combinations',
  lineCountLabel: 'Lines',
  cryptoNote: 'Generated locally with crypto.getRandomValues(); selections and results are not sent to a server.',
  probabilityNote:
    'Fixed and excluded numbers change the combinations shown, not the chance that any one valid line wins.',
  errorInvalidSelection: 'Selections must be different whole numbers from 1 through 45.',
  errorGameCount: 'Choose from 1 to 5 Lotto lines.',
  errorTooManyFixed: 'A Lotto 6/45 line can contain at most 6 fixed numbers.',
  errorNotEnoughAvailable: 'Leave at least 6 numbers available after exclusions.',
  errorCrypto: 'Your browser does not provide Web Crypto, so secure numbers cannot be generated here.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Lotto Number Generator — 6/45 Fixed & Excluded Picks',
    description:
      'Generate one to five local Lotto 6/45 number lines with fixed and excluded balls. Every line uses browser Web Crypto, is sorted, and can be copied instantly.',
    h1: 'Lotto Number Generator',
    tagline:
      'Generate sorted Lotto 6/45 lines with the numbers you want to keep or leave out, entirely in your browser.',
    name: 'Lotto Number Generator',
    keywords: [
      'lotto number generator',
      'lottery number generator',
      'Lotto 6/45 generator',
      'quick pick generator',
      'lucky number generator',
      'fixed number lottery generator',
    ],
    howTo: [
      'Leave every ball unselected for a quick pick, or click a ball once to make it fixed in every line.',
      'Click a fixed ball again to exclude it; click an excluded ball once more to clear that choice.',
      'Choose 1 to 5 lines. Each line contains 6 different numbers from 1 through 45.',
      'Select “Generate Lotto numbers” or press G outside an input, then copy the formatted lines if needed.',
    ],
    sections: [
      {
        heading: 'What Lotto 6/45 requires',
        body: 'South Korea’s Lotto 6/45 uses six selected numbers from 1 through 45; the official Donghaeng Lottery introduction lists 1,000 won per game and a first-prize probability of 1 in 8,145,060. That denominator is “45 choose 6”: there are 8,145,060 distinct unordered six-number combinations. This generator follows that format by producing six different numbers and sorting them from low to high. A bonus ball is not generated because it is drawn separately after the six main winning numbers and is not one of the six numbers chosen for a line.',
      },
      {
        heading: 'What fixed and excluded numbers do',
        body: 'A fixed ball is included in every generated line. An excluded ball is removed from the pool before the remaining positions are drawn. For example, fixing 7 and 21 leaves four positions to fill; excluding 1, 2, and 3 prevents those values from appearing. These controls are for expressing your own choices, not for predicting a draw: lottery draws are independent, so filtering past-looking patterns or excluding “unlikely” numbers does not make an individual valid line more likely to win. The possible-combinations total shows how many lines remain under your current choices.',
      },
      {
        heading: 'Local, unbiased number drawing',
        body: 'The tool uses the browser’s crypto.getRandomValues() source instead of Math.random(). It samples without replacement, so a number cannot repeat within one six-number line. To avoid modulo bias, it discards the tiny remainder of 32-bit source values that cannot be divided evenly by the current candidate count, then draws again. Your ball choices and generated lines stay in this browser; only the current settings are saved locally so they can be restored after a refresh. A browser-generated line is not an official ticket, recorded draw, or guarantee of a prize.',
      },
    ],
    faq: [
      {
        q: 'How do I generate Lotto 6/45 numbers?',
        a: 'Leave the 45 balls unselected for a full quick pick, choose 1 to 5 lines, and select Generate Lotto numbers. Each generated line contains 6 different numbers from 1 through 45 in ascending order, ready to copy to a Lotto 6/45 slip.',
      },
      {
        q: 'What is the first-prize probability for Lotto 6/45?',
        a: 'The official Donghaeng Lottery introduction gives a Lotto 6/45 first-prize probability of 1 in 8,145,060 for one line matching all 6 main numbers. That is the number of possible six-number combinations from a pool of 45, so every valid individual line has the same first-prize probability.',
      },
      {
        q: 'Do fixed or excluded numbers improve lottery odds?',
        a: 'No. Fixed and excluded numbers only limit which valid lines this generator displays; they do not change the chance that a particular valid six-number line matches a random Lotto 6/45 draw. They are useful for keeping personal numbers or avoiding numbers you do not want to play.',
      },
      {
        q: 'Why does this generator not include a bonus ball?',
        a: 'A Lotto 6/45 entry contains only 6 chosen main numbers. The official draw selects the 6 winning numbers and then a separate bonus number, so players do not choose a bonus ball when filling out one Lotto 6/45 line.',
      },
      {
        q: 'Are my Lotto number choices sent to a server?',
        a: 'No. The browser generates each line locally with crypto.getRandomValues(), and neither your fixed numbers, excluded numbers, nor generated lines are sent by this tool to a server. The current settings can be saved only in this browser’s local storage for the next visit.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '로또 번호 생성기 — 고정수·제외수로 6/45 조합 만들기',
    description:
      '고정수와 제외수를 정해 로또 6/45 번호를 1~5게임 생성합니다. 모든 번호는 브라우저 Web Crypto로 뽑고 오름차순으로 정리해 바로 복사할 수 있습니다.',
    h1: '로또 번호 생성기',
    tagline: '고정할 번호와 뺄 번호를 직접 정해 로또 6/45 조합을 브라우저에서 바로 만듭니다.',
    name: '로또 번호 생성기',
    keywords: [
      '로또 번호 생성기',
      '로또 번호 추천',
      '로또 자동 번호',
      '로또 6/45 번호',
      '로또 번호 뽑기',
      '로또 고정수 제외수',
    ],
    howTo: [
      '아무 번호도 고르지 않으면 완전 자동 번호를 만들 수 있고, 공을 한 번 누르면 모든 게임에 들어갈 고정수가 됩니다.',
      '고정수를 한 번 더 누르면 제외수로 바뀌고, 제외수를 한 번 더 누르면 선택이 해제됩니다.',
      '게임 수를 1~5게임 중에서 고르세요. 한 게임에는 1~45 중 서로 다른 번호 6개가 들어갑니다.',
      '“로또 번호 생성”을 누르거나 입력칸 밖에서 G 키를 누른 뒤, 필요하면 결과를 복사하세요.',
    ],
    sections: [
      {
        heading: '로또6/45의 번호 규칙과 조합 수',
        body: '동행복권의 로또6/45 안내에 따르면 한 게임은 1,000원이며, 1부터 45까지 중 6개 숫자를 선택합니다. 1등 확률은 8,145,060분의 1인데, 이는 45개 중 6개를 고르는 서로 다른 조합이 정확히 8,145,060개이기 때문입니다. 이 도구도 같은 형식으로 서로 겹치지 않는 숫자 6개를 만들고 작은 수부터 정렬합니다. 보너스 번호는 본인이 고르는 번호가 아니라 6개 당첨번호 뒤에 별도로 추첨하므로 생성 결과에 포함하지 않습니다.',
      },
      {
        heading: '고정수와 제외수는 조합을 고르는 조건입니다',
        body: '고정수는 생성하는 모든 게임에 반드시 넣는 번호이고, 제외수는 남은 번호를 뽑는 후보에서 빼는 번호입니다. 예를 들어 7과 21을 고정하면 남은 4자리를 뽑고, 1·2·3을 제외하면 그 번호는 결과에 나오지 않습니다. 이 기능은 좋아하는 번호를 반영하거나 피하고 싶은 번호를 정하기 위한 기능이지 당첨번호를 예측하는 방법은 아닙니다. 매 회차 추첨은 독립적이므로 과거 패턴처럼 보이는 조건을 걸어도 한 게임의 당첨 확률은 높아지지 않습니다. 화면의 가능한 조합 수는 현재 조건에서 만들 수 있는 서로 다른 게임 수를 보여 줍니다.',
      },
      {
        heading: '브라우저에서 편향 없이 번호를 뽑습니다',
        body: 'Math.random() 대신 브라우저의 crypto.getRandomValues()로 난수를 받아 한 게임 안에서는 비복원 추첨을 하므로 같은 번호가 두 번 나오지 않습니다. 후보 수로 32비트 난수를 나눌 때 일부 숫자가 아주 조금 더 자주 나올 수 있는 나머지 값은 버리고 다시 뽑아 편향도 막습니다. 고정수·제외수와 생성 결과는 이 도구에서 서버로 전송하지 않으며, 현재 설정만 이 브라우저의 로컬 저장소에 남겨 새로고침 뒤에도 복원할 수 있습니다. 여기서 만든 번호는 공식 복권이나 공인 추첨 기록, 당첨 보증이 아닙니다.',
      },
    ],
    faq: [
      {
        q: '로또 6/45 번호는 어떻게 생성하나요?',
        a: '45개 공을 모두 선택하지 않은 상태에서 게임 수를 1~5게임으로 고르고 로또 번호 생성을 누르면 됩니다. 결과는 1부터 45까지 중 서로 다른 숫자 6개를 오름차순으로 정리한 한 줄이며, 복사해 로또6/45 용지에 수동으로 표시할 수 있습니다.',
      },
      {
        q: '로또6/45 1등 확률은 얼마인가요?',
        a: '동행복권 로또6/45 안내의 1등 당첨확률은 한 게임 기준 8,145,060분의 1입니다. 45개 숫자 중 6개를 고르는 조합이 8,145,060개이므로, 조건을 만족하는 개별 번호 조합은 모두 같은 1등 확률을 가집니다.',
      },
      {
        q: '고정수나 제외수를 쓰면 당첨 확률이 높아지나요?',
        a: '아니요. 고정수와 제외수는 이 도구가 보여 주는 유효한 조합의 범위만 바꿉니다. 무작위 로또6/45 추첨에서 특정 유효 조합 한 게임이 6개 당첨번호와 일치할 확률은 고정수·제외수를 사용해도 높아지지 않으며, 개인 번호를 넣거나 원하지 않는 번호를 피할 때 쓰는 설정입니다.',
      },
      {
        q: '왜 보너스 번호는 생성하지 않나요?',
        a: '로또6/45 한 게임에는 본인이 고르는 숫자 6개만 들어갑니다. 공식 추첨에서 6개 당첨번호를 뽑은 뒤 별도의 보너스 번호 1개를 추가로 뽑으므로, 로또 용지에 적을 번호를 만드는 이 도구는 보너스 번호를 생성하지 않습니다.',
      },
      {
        q: '고른 번호나 결과가 서버로 전송되나요?',
        a: '아니요. 이 도구는 브라우저의 crypto.getRandomValues()로 번호를 생성하며, 고정수·제외수·생성 결과를 서버로 전송하지 않습니다. 현재 선택한 설정만 이 브라우저의 로컬 저장소에 보관해 다음 방문이나 새로고침 뒤에 복원할 수 있습니다.',
      },
    ],
    ui: {
      intro: '로또 6/45 번호를 1~5게임 생성합니다. 고정수와 제외수를 정하거나, 바로 자동 번호를 뽑으세요.',
      selectionHeading: '고정수·제외수 선택',
      selectionHint: '공을 누를 때마다 선택 안 함 → 고정수 → 제외수 → 선택 안 함 순으로 바뀝니다.',
      fixed: '고정수',
      excluded: '제외수',
      unselected: '선택 안 함',
      fixedCount: '고정수',
      excludedCount: '제외수',
      clearSelections: '선택 초기화',
      gameCountLabel: '게임 수',
      gameCountHint: '한 게임은 1~45 중 서로 다른 번호 6개입니다.',
      generate: '로또 번호 생성',
      shortcut: '단축키',
      shortcutKey: 'G',
      resultHeading: '생성된 로또 6/45 번호',
      gameLabel: '{n}게임',
      copy: '복사',
      copied: '복사됨',
      possibleLabel: '가능한 조합',
      lineCountLabel: '게임 수',
      cryptoNote: 'crypto.getRandomValues()로 브라우저에서 생성하며, 선택한 번호와 결과를 서버로 전송하지 않습니다.',
      probabilityNote: '고정수·제외수는 결과 조합만 바꾸며, 유효한 한 게임의 당첨 확률을 높이지는 않습니다.',
      errorInvalidSelection: '선택한 번호는 1~45의 서로 다른 정수여야 합니다.',
      errorGameCount: '게임 수는 1~5게임 중에서 선택하세요.',
      errorTooManyFixed: '로또6/45 한 게임에는 고정수를 최대 6개까지 넣을 수 있습니다.',
      errorNotEnoughAvailable: '제외수 뒤에도 뽑을 수 있는 번호를 최소 6개 남겨야 합니다.',
      errorCrypto: '이 브라우저에서는 Web Crypto를 사용할 수 없어 안전한 난수를 생성할 수 없습니다.',
    },
  },
};
