import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  intro: 'Name the two outcomes, then flip once to decide. Your tally and latest 12 results stay in this browser.',
  headsLabel: 'First side',
  tailsLabel: 'Second side',
  choiceHint: 'Up to 80 characters',
  headsDefault: 'Heads',
  tailsDefault: 'Tails',
  flip: 'Flip the coin',
  shortcut: 'Flip again with',
  shortcutKey: 'Space',
  cryptoNote: 'Each flip uses your browser’s crypto.getRandomValues() source. Nothing is sent from this tool.',
  cryptoError: 'Your browser does not provide Web Crypto, so a fair flip cannot be generated here.',
  resultHeading: 'Result',
  landed: 'Landed on',
  ready: 'Ready to flip',
  readyValue: '—',
  total: 'Total',
  historyHeading: 'Recent flips',
  reset: 'Reset tally',
  noHistory: 'Flip the coin to start a local tally.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Flip a Coin — Local Tally and Recent Results',
    description:
      'Flip a coin for a fast 50/50 decision. Name both sides, use Space to flip again, and keep a browser-local tally with your latest 12 results.',
    h1: 'Flip a Coin',
    tagline: 'A quick two-choice decision with a persistent local tally and recent results.',
    name: 'Coin Flip',
    keywords: ['flip a coin', 'coin flip', 'heads or tails', 'coin toss', 'online coin flipper', '50/50 decision'],
    howTo: [
      'Keep Heads and Tails, or type your own two choices.',
      'Select Flip the coin to get one result.',
      'Press Space to flip again without using the pointer.',
      'Read the local tally and the 12 most recent results; select Reset tally to clear them.',
    ],
    sections: [
      {
        heading: 'How this coin flip stays 50/50',
        body: 'Each flip reads one unsigned 32-bit value from the browser Web Crypto API. Values from 0 through 2,147,483,647 select the first side; values from 2,147,483,648 through 4,294,967,295 select the second. That gives each side exactly 2,147,483,648 possible values, without using a remainder operation that could introduce modulo bias. The result is a software random choice, not proof for legal, gambling, prize, or other high-stakes decisions.',
      },
      {
        heading: 'Why streaks are normal',
        body: 'A fair flip has no memory: the chance of Heads is still 1 in 2 after any prior sequence. A specified run of five Heads has probability (1/2)^5 = 1/32, or 3.125%. A tally does not need to be exactly even to be fair; in 100 independent 50/50 flips, exactly 50 first-side results occur only about 7.96% of the time.',
      },
      {
        heading: 'What is saved',
        body: 'The two labels, current tally, and latest 12 results are saved only in this browser’s local storage so a refresh does not erase a decision session. Reset tally removes the results. Browser-private mode or cleared site data can prevent or remove that saved state.',
      },
    ],
    faq: [
      {
        q: 'Is this online coin flip fair?',
        a: 'Each flip divides the 4,294,967,296 possible unsigned 32-bit Web Crypto values into two equal sets of 2,147,483,648, so both outcomes have a 50% chance when the browser random source is working correctly.',
      },
      {
        q: 'Does a streak change the next coin flip?',
        a: 'No. Every result is generated independently, so the next flip remains 50% for each side even after several identical results in a row.',
      },
      {
        q: 'How many coin flips does this tool remember?',
        a: 'This tool keeps the 12 most recent flips and their cumulative tally in local browser storage until you select Reset tally or clear the site’s browser data.',
      },
      {
        q: 'Can I use choices other than heads and tails?',
        a: 'Yes. Enter any two short labels, such as Yes and No or two meal choices, and the tool applies the same 50/50 selection to them.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '동전 던지기 — 앞뒤 통계와 최근 결과 저장',
    description:
      '동전을 던져 둘 중 하나를 바로 정합니다. 앞·뒤 문구를 바꾸고 스페이스바로 다시 던지며, 최근 12회와 누적 통계를 이 브라우저에 저장합니다.',
    h1: '동전 던지기',
    tagline: '둘 중 하나를 빠르게 정하고, 이 브라우저에만 쌓이는 통계를 확인합니다.',
    name: '동전 던지기',
    keywords: ['동전 던지기', '온라인 동전 던지기', '앞면 뒷면', '동전 앞뒤', '랜덤 선택', '동전 토스'],
    howTo: [
      '앞면·뒷면을 그대로 쓰거나 두 선택지를 직접 입력합니다.',
      '동전 던지기 버튼을 눌러 한 번 던집니다.',
      '마우스 없이 다시 던지려면 스페이스바를 누릅니다.',
      '최근 12회와 누적 통계를 확인하고, 필요하면 통계 초기화를 누릅니다.',
    ],
    sections: [
      {
        heading: '50:50으로 정하는 방법',
        body: '동전을 한 번 던질 때 브라우저 Web Crypto API의 부호 없는 32비트 값 하나를 읽습니다. 0~2,147,483,647은 첫 번째 면, 2,147,483,648~4,294,967,295는 두 번째 면으로 정합니다. 각 면에 정확히 2,147,483,648개 값이 배정되어 나머지 연산에서 생길 수 있는 편향이 없습니다. 이 결과는 소프트웨어 난수 선택이므로 법률, 도박, 경품 등 중요한 판단의 증거로 쓰면 안 됩니다.',
      },
      {
        heading: '같은 면이 연속으로 나와도 정상입니다',
        body: '공정한 동전은 이전 결과를 기억하지 않으므로 앞면이 여러 번 나와도 다음 번 앞면 확률은 여전히 2분의 1입니다. 특정 면이 5번 연속 나올 확률은 (1/2)^5 = 1/32, 약 3.125%입니다. 100번 던졌을 때 앞면이 정확히 50번일 확률도 약 7.96%뿐이므로, 누적 횟수가 딱 반반이 아니어도 이상한 결과가 아닙니다.',
      },
      {
        heading: '저장되는 정보',
        body: '입력한 두 문구, 누적 통계, 최근 12회 결과는 새로고침 후에도 이어서 볼 수 있도록 이 브라우저의 로컬 저장소에만 저장합니다. 통계 초기화를 누르면 결과가 지워집니다. 시크릿 모드나 사이트 데이터 삭제 상태에서는 저장되지 않거나 사라질 수 있습니다.',
      },
    ],
    faq: [
      {
        q: '온라인 동전 던지기는 공정한가요?',
        a: '브라우저 Web Crypto의 부호 없는 32비트 값 4,294,967,296개를 각 면에 2,147,483,648개씩 똑같이 나누므로, 브라우저 난수원이 정상 동작하면 두 결과의 확률은 각각 50%입니다.',
      },
      {
        q: '같은 면이 연속으로 나오면 다음 결과가 바뀌나요?',
        a: '아닙니다. 매번 독립적으로 결과를 만들기 때문에 같은 면이 여러 번 이어져도 다음 동전 던지기의 확률은 앞면과 뒷면 각각 50%입니다.',
      },
      {
        q: '동전 던지기 결과는 몇 번까지 저장되나요?',
        a: '최근 12회 결과와 누적 통계가 통계 초기화를 누르거나 브라우저 사이트 데이터를 지울 때까지 이 브라우저에 저장됩니다.',
      },
      {
        q: '앞면과 뒷면 대신 다른 선택지를 넣을 수 있나요?',
        a: '네. 예·아니오, 짜장면·짬뽕처럼 짧은 문구 두 개를 입력하면 같은 50:50 방식으로 둘 중 하나를 정합니다.',
      },
    ],
    ui: {
      intro: '두 결과의 이름을 정한 뒤 한 번 던지세요. 누적 통계와 최근 12회 결과는 이 브라우저에 저장됩니다.',
      headsLabel: '첫 번째 면',
      tailsLabel: '두 번째 면',
      choiceHint: '최대 80자',
      headsDefault: '앞면',
      tailsDefault: '뒷면',
      flip: '동전 던지기',
      shortcut: '다시 던지기',
      shortcutKey: 'Space',
      cryptoNote: '각 결과는 브라우저 crypto.getRandomValues()로 만듭니다. 이 도구에서 정보가 전송되지는 않습니다.',
      cryptoError: '이 브라우저는 Web Crypto를 제공하지 않아 공정한 동전 던지기를 만들 수 없습니다.',
      resultHeading: '결과',
      landed: '나온 면',
      ready: '던질 준비 완료',
      readyValue: '—',
      total: '누적',
      historyHeading: '최근 결과',
      reset: '통계 초기화',
      noHistory: '동전을 던지면 이 브라우저에 통계가 쌓입니다.',
    },
  },
};
