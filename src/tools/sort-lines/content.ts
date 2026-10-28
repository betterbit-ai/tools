import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  inputLabel: 'Lines to sort',
  inputPlaceholder: 'Paste one item on each line…',
  outputLabel: 'Sorted lines',
  outputPlaceholder: 'Your sorted list appears here.',
  modeLabel: 'Sort order',
  alphabetical: 'A → Z',
  reverseAlphabetical: 'Z → A',
  reverse: 'Reverse lines',
  shuffle: 'Shuffle',
  optionsLabel: 'Options',
  naturalOrder: 'Natural number order',
  caseSensitive: 'Case-sensitive',
  trimWhitespace: 'Trim whitespace',
  removeEmptyLines: 'Remove empty lines',
  removeDuplicates: 'Remove duplicate lines',
  inputLines: 'Input lines',
  outputLines: 'Output lines',
  removedLines: 'Removed lines',
  copy: 'Copy result',
  copied: 'Copied',
  useResult: 'Use as input',
  clear: 'Clear',
  autosaved: 'Saved in this browser only',
  copyShortcut: 'Copy result',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Sort Lines Alphabetically — Natural Order & Shuffle',
    description:
      'Sort lines alphabetically, in reverse, or at random with natural number order and locale-aware comparison. Clean duplicate lines live; your text stays in this browser.',
    h1: 'Sort Lines Alphabetically',
    tagline: 'Sort a pasted list live with natural number order, locale-aware letters, reverse order, or shuffle.',
    name: 'Sort Lines',
    keywords: ['sort lines alphabetically', 'line sorter', 'alphabetize list', 'natural sort', 'shuffle lines'],
    howTo: [
      'Paste or type one list item on each line in “Lines to sort.”',
      'Choose A → Z, Z → A, Reverse lines, or Shuffle; the result changes immediately.',
      'Leave Natural number order on for names such as “item 2” and “item 10.”',
      'Turn on cleanup options when you want to trim spaces or remove blank and duplicate lines.',
      'Copy the result, or use it as input to sort it again with a different option.',
    ],
    sections: [
      {
        heading: 'Alphabetical order and natural number order answer different questions',
        body: 'Plain alphabetical comparison reads one character at a time, so it places “item 10” before “item 2”: both start with “item ”, then character 1 comes before character 2. Natural number order treats a run of digits as a number instead, producing item 2, item 10, item 100. Leave natural order on for version names, file names, numbered headings, and product lists. Turn it off only when you need a strict character-by-character order.\n\nA → Z and Z → A compare every complete line. Reverse lines does not compare the text at all: it simply flips the current top-to-bottom order. Shuffle uses the Fisher–Yates method, so it is suited to randomizing a list of names, prompts, or speaking order rather than alphabetizing it.',
      },
      {
        heading: 'Korean 가나다순 and other locale-aware letters',
        body: 'The sorter uses the browser’s Intl.Collator with the language of this page. On the Korean page, complete Hangul syllables are compared in Korean collation order, so 가나 comes before 다람쥐 and 하늘. On the English page, accented letters and case are compared with English collation rules. A browser’s language data can place unusual punctuation differently across browser versions, so check a result that must follow a publisher’s house style.\n\nWhen case-sensitive sorting is off, strings that differ only by case compare as equal and keep their input order. When duplicate removal is on, the first matching line is retained. The comparison also normalizes equivalent Unicode spellings, which prevents a composed character and its decomposed form from becoming accidental separate entries.',
      },
      {
        heading: 'Cleanup changes the output only when you ask for it',
        body: 'By default, sorting rearranges complete lines without changing their spelling, whitespace, or blank rows. Turn on Trim whitespace to remove spaces and tabs at the beginning and end of each line before sorting. Turn on Remove empty lines to discard lines that are empty after trimming, and Remove duplicate lines to retain the first line in each matching group. These controls work together: trimming first can turn a spaces-only line into an empty line and can make two differently spaced lines duplicates.\n\nSorting runs in this tab. The latest text and selected options are stored only in this browser so a refresh does not discard a working list. Select Clear to remove the saved input from this browser.',
      },
    ],
    faq: [
      {
        q: 'Why does item 10 sometimes appear before item 2?',
        a: 'Strict alphabetical sorting compares individual characters, so the 1 in item 10 comes before the 2 in item 2. Enable Natural number order to compare digit sequences as numbers and place item 2 before item 10.',
      },
      {
        q: 'Can I sort Korean names in 가나다순?',
        a: 'Yes. On the Korean page, the sorter uses the browser’s Korean collation rules, so complete Hangul syllables sort in 가나다순. A typical name list therefore places 강 before 김, then 박, 이, and 하.',
      },
      {
        q: 'What is the difference between Z → A and Reverse lines?',
        a: 'Z → A sorts every line in descending alphabetical order, while Reverse lines simply makes the last input line first and the first input line last. Reverse lines does not compare letters, numbers, or lengths.',
      },
      {
        q: 'Does removing duplicates ignore uppercase letters?',
        a: 'With Case-sensitive off, duplicate removal treats Apple and apple as the same entry and keeps the first one. With Case-sensitive on, Apple and apple remain two distinct lines.',
      },
      {
        q: 'Is my list uploaded when I sort lines?',
        a: 'No. Sorting and cleanup happen in the current browser tab; the list is not sent to a server. The latest input is stored only in this browser until you select Clear.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '줄 정렬 — 가나다순·자연 정렬·랜덤 섞기',
    description:
      '여러 줄을 가나다·ABC순, 역순 또는 무작위로 바로 정렬합니다. 숫자는 2, 10처럼 자연스럽게 비교하고 중복·빈 줄도 정리하며 입력한 텍스트는 브라우저 밖으로 전송되지 않습니다.',
    h1: '줄 정렬',
    tagline: '목록을 붙여 넣으면 가나다순·자연 정렬·역순·랜덤 섞기 결과가 바로 표시됩니다.',
    name: '줄 정렬',
    keywords: ['줄 정렬', '가나다순 정렬', '텍스트 정렬', '알파벳 순 정렬', '자연 정렬', '줄 랜덤 섞기'],
    howTo: [
      '“정렬할 줄”에 한 줄마다 항목 하나씩 붙여 넣거나 입력합니다.',
      '가→하, 하→가, 줄 순서 뒤집기, 랜덤 섞기 중 하나를 고르면 결과가 즉시 바뀝니다.',
      '사진2, 사진10처럼 숫자가 섞인 항목은 자연 정렬을 켜 둡니다.',
      '필요하면 앞뒤 공백, 빈 줄, 중복 줄 정리 옵션을 켭니다.',
      '결과를 복사하거나 “입력으로 사용”을 눌러 다른 방식으로 다시 정렬합니다.',
    ],
    sections: [
      {
        heading: '가나다순과 자연 정렬은 기준이 다릅니다',
        body: '일반 사전식 정렬은 문자를 하나씩 비교하므로 “사진10”을 “사진2”보다 앞에 놓습니다. 앞부분인 “사진”이 같을 때 문자 1이 문자 2보다 먼저이기 때문입니다. 자연 정렬은 이어진 숫자를 하나의 수로 비교해 사진2, 사진10, 사진100 순서로 놓습니다. 파일명, 버전명, 번호가 붙은 제목이나 상품 목록에는 자연 정렬을 켜 두는 편이 읽기 쉽습니다. 글자 단위 비교가 꼭 필요한 경우에만 끄면 됩니다.\n\n가→하와 하→가는 각 줄의 내용을 비교해 다시 정렬합니다. 반면 “줄 순서 뒤집기”는 글자나 숫자를 비교하지 않고 맨 마지막 줄을 맨 위로, 맨 첫 줄을 맨 아래로 옮깁니다. “랜덤 섞기”는 피셔-예이츠 방식으로 목록의 순서를 무작위로 바꾸므로 발표 순서나 추첨 후보를 섞을 때 쓸 수 있습니다.',
      },
      {
        heading: '한글 가나다순과 유니코드 비교',
        body: '이 도구는 현재 페이지의 언어에 맞춰 브라우저 내장 Intl.Collator로 비교합니다. 한국어 페이지에서는 완성형 한글 음절을 한국어 정렬 규칙으로 비교하므로 가나, 다람쥐, 하늘처럼 가나다순으로 놓입니다. 영문 페이지에서는 영문 정렬 규칙을 사용합니다. 드문 기호의 순서는 브라우저와 언어 데이터 버전에 따라 조금 달라질 수 있으므로, 출판사나 기관의 고유한 정렬 규칙이 있다면 결과를 확인해야 합니다.\n\n대소문자 구분을 끄면 Apple과 apple처럼 대소문자만 다른 줄은 같은 위치로 비교하고 입력 순서를 그대로 유지합니다. 중복 줄 제거를 켠 경우에는 그중 처음 나온 줄만 남깁니다. 같은 글자를 조합형과 완성형처럼 다르게 저장한 경우도 비교 전에 유니코드 정규화하므로 불필요한 중복이 생기지 않습니다.',
      },
      {
        heading: '정리 옵션을 켤 때만 원문이 바뀝니다',
        body: '기본 상태에서는 줄의 글자, 앞뒤 공백, 빈 줄을 그대로 두고 순서만 바꿉니다. “앞뒤 공백 정리”를 켜면 각 줄의 처음과 끝에 있는 공백·탭을 먼저 없앱니다. “빈 줄 제거”는 공백을 정리한 뒤 비어 있는 줄을 빼며, “중복 줄 제거”는 비교 규칙이 같은 항목 가운데 첫 줄을 남깁니다. 따라서 공백 정리와 중복 줄 제거를 함께 켜면 띄어쓰기만 다른 항목도 하나로 정리할 수 있습니다.\n\n정렬과 정리는 현재 브라우저 탭에서 이루어집니다. 새로고침해도 이어서 작업할 수 있도록 최근 입력과 선택한 옵션만 이 브라우저 저장소에 보관합니다. “지우기”를 누르면 저장된 입력도 이 브라우저에서 삭제됩니다.',
      },
    ],
    faq: [
      {
        q: '사진10이 사진2보다 앞에 나오는 이유는 무엇인가요?',
        a: '문자 단위 정렬에서는 숫자 1이 숫자 2보다 먼저라서 사진10이 사진2보다 앞에 옵니다. 자연 정렬을 켜면 숫자 묶음을 값으로 비교하므로 사진2, 사진10 순서가 됩니다.',
      },
      {
        q: '한글 이름을 가나다순으로 정렬할 수 있나요?',
        a: '네. 한국어 페이지는 브라우저의 한국어 정렬 규칙을 사용하므로 완성형 한글 이름을 가나다순으로 정렬합니다. 일반적인 이름 목록은 강, 김, 박, 이, 하 순서처럼 정리됩니다.',
      },
      {
        q: '하→가와 줄 순서 뒤집기는 어떻게 다른가요?',
        a: '하→가는 모든 줄을 내림차순 가나다·ABC 기준으로 다시 정렬합니다. 줄 순서 뒤집기는 비교하지 않고 현재 맨 아래 줄을 맨 위로 보내는 기능이므로, 원래 순서를 정확히 반대로 만들 때 사용합니다.',
      },
      {
        q: '대소문자가 다른 줄도 중복으로 지워지나요?',
        a: '대소문자 구분을 끈 상태에서는 Apple과 apple을 같은 항목으로 보고 먼저 입력한 한 줄만 남깁니다. 대소문자 구분을 켜면 Apple과 apple은 서로 다른 두 줄로 유지됩니다.',
      },
      {
        q: '정렬할 때 입력한 목록이 서버로 전송되나요?',
        a: '아니요. 정렬과 정리는 현재 브라우저에서 처리되며 입력한 목록은 서버로 전송되지 않습니다. 최근 입력은 지우기를 누를 때까지 이 브라우저의 로컬 저장소에만 남습니다.',
      },
    ],
    ui: {
      inputLabel: '정렬할 줄',
      inputPlaceholder: '한 줄에 항목 하나씩 붙여 넣으세요…',
      outputLabel: '정렬 결과',
      outputPlaceholder: '정렬한 목록이 여기에 표시됩니다.',
      modeLabel: '정렬 방식',
      alphabetical: '가 → 하',
      reverseAlphabetical: '하 → 가',
      reverse: '줄 순서 뒤집기',
      shuffle: '랜덤 섞기',
      optionsLabel: '옵션',
      naturalOrder: '자연 정렬',
      caseSensitive: '대소문자 구분',
      trimWhitespace: '앞뒤 공백 정리',
      removeEmptyLines: '빈 줄 제거',
      removeDuplicates: '중복 줄 제거',
      inputLines: '입력 줄 수',
      outputLines: '결과 줄 수',
      removedLines: '제거한 줄 수',
      copy: '결과 복사',
      copied: '복사됨',
      useResult: '입력으로 사용',
      clear: '지우기',
      autosaved: '이 브라우저에만 저장됨',
      copyShortcut: '결과 복사',
    },
  },
};
