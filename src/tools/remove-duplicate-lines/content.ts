import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  inputLabel: 'Lines to clean',
  inputHint: 'Each line is compared separately. Results update as you type.',
  inputPlaceholder: 'Paste a list, one item per line…',
  outputLabel: 'Unique lines',
  outputHint: 'The retained original spelling and whitespace stay unchanged.',
  emptyOutput: 'Paste lines to see the de-duplicated result.',
  keepLabel: 'Keep occurrence',
  keepFirst: 'First',
  keepLast: 'Last',
  sortLabel: 'Sort result',
  sortOriginal: 'Original order',
  sortAscending: 'A to Z (natural)',
  sortDescending: 'Z to A (natural)',
  caseSensitive: 'Case-sensitive matching',
  trimWhitespace: 'Ignore surrounding whitespace',
  removeEmptyLines: 'Remove empty lines',
  normalizeUnicode: 'Match equivalent Unicode text',
  inputLines: 'Lines in',
  uniqueLines: 'Unique lines',
  duplicatesRemoved: 'Duplicates removed',
  emptyLinesRemoved: 'Empty lines removed',
  copy: 'Copy result',
  copied: 'Copied',
  clear: 'Clear',
  autosaved: 'Saved in this browser only',
  copyShortcut: 'Copy shortcut',
  shortcutKey: 'Ctrl/⌘ + Enter',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Remove Duplicate Lines — Sort & Match Options',
    description:
      'Remove duplicate lines as you paste, with first/last occurrence, whitespace, Unicode and natural-sort controls. Runs locally with no ads or uploads.',
    h1: 'Remove Duplicate Lines',
    tagline: 'Clean a list live, choose exactly what counts as the same line, and keep the result on your device.',
    name: 'Remove Duplicate Lines',
    keywords: ['duplicate line remover', 'deduplicate text', 'remove repeated lines', 'unique lines', 'dedupe list'],
    howTo: [
      'Paste one item per line into the input box.',
      'Choose whether to keep the first or last matching occurrence.',
      'Turn on whitespace, case, empty-line, or Unicode matching options when needed.',
      'Leave the order intact or choose a natural A–Z or Z–A sort.',
      'Review the live result and copy it when it is ready.',
    ],
    sections: [
      {
        heading: 'What counts as the same line?',
        body: 'By default, two lines match only when every character is the same, and the first copy stays in its original position. “Apple”, “apple”, and “apple ” are therefore three different lines. Turn off case-sensitive matching to merge capitalization differences, or turn on surrounding-whitespace matching when copied lists contain accidental spaces or tabs. These options affect comparison only: the retained line keeps its original capitalization and whitespace so the result does not silently rewrite your data.\n\nThe Unicode option compares text after NFC normalization. It catches visually identical text that may be stored differently, such as a Korean syllable pasted as separate jamo characters on one device and as one composed character on another. It is not fuzzy matching: different words, punctuation, and internal spaces remain different.',
      },
      {
        heading: 'Keep order, keep the latest, or sort naturally',
        body: 'Keep First is safest for lists whose early order matters: it removes later repeats without moving the surviving line. Keep Last is useful for pasted exports where the most recent copy should win; the surviving line remains at its last original position. Choose Original order to preserve that position, or sort the already de-duplicated result afterward.\n\nNatural sorting compares number runs as numbers, so “item 2” comes before “item 10” rather than after it. Sorting does not decide which duplicate survives—the keep rule does that first. The counters always describe the current options, including any removed blank lines, so there is no separate run button or stale result to interpret.',
      },
      {
        heading: 'Line endings and privacy',
        body: 'The remover recognizes Windows CRLF, Unix and current macOS LF, classic Mac CR, and Unicode line and paragraph separators as line boundaries. A pasted trailing line break counts as one final empty line; enable Remove empty lines to exclude it along with blank and whitespace-only lines. This is a line tool, so a CSV row or a sentence with commas is still compared as one complete line.\n\nProcessing and the optional saved draft stay in this browser. The page does not upload the text for comparison. Use Clear to remove the saved input from this tool, then copy the cleaned list into a spreadsheet, editor, terminal, or import form.',
      },
    ],
    faq: [
      {
        q: 'Does removing duplicate lines keep the original order?',
        a: 'Yes. With Keep First and Original order selected, the first occurrence of each matching line stays where it appeared and later copies are removed. Keep Last retains each final occurrence at its original final position instead.',
      },
      {
        q: 'Can “Apple” and “apple” be treated as duplicates?',
        a: 'Yes. Turn off Case-sensitive matching to compare uppercase and lowercase forms together. The surviving line keeps the capitalization of the first or last occurrence selected by the keep rule.',
      },
      {
        q: 'Will ignoring whitespace trim my output?',
        a: 'No. Ignore surrounding whitespace changes only the comparison key, so “ apple ” can match “apple” without altering the spacing of the line that remains in the output.',
      },
      {
        q: 'Why are visually identical Korean lines sometimes duplicates?',
        a: 'Korean text can be stored either as a composed syllable or as separate jamo characters. Match equivalent Unicode text applies NFC normalization before comparison, so those two encodings match while the retained output keeps the original characters.',
      },
      {
        q: 'Is my list uploaded or stored on a server?',
        a: 'No. De-duplication runs in the browser and the list is not uploaded for processing. The optional draft survives refreshes only through local browser storage; Clear removes that saved input from this tool.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '중복 줄 제거 — 공백 무시·정렬·한글 비교',
    description:
      '텍스트 중복 줄을 붙여넣는 즉시 제거합니다. 앞뒤 공백, 대소문자, 한글 유니코드 비교와 자연 정렬을 고르고 결과를 브라우저에서만 처리합니다.',
    h1: '중복 줄 제거',
    tagline: '목록을 바로 정리하고, 어떤 줄을 같은 항목으로 볼지 직접 정합니다. 입력값은 서버로 전송하지 않습니다.',
    name: '중복 줄 제거',
    keywords: ['중복 줄 삭제', '텍스트 중복 제거', '중복 줄 제거기', '리스트 중복 제거', '중복 행 제거'],
    howTo: [
      '한 줄에 항목 하나씩 입력창에 붙여넣습니다.',
      '같은 항목이 여러 번 있으면 처음 것 또는 마지막 것 중 남길 줄을 고릅니다.',
      '필요하면 앞뒤 공백 무시, 대소문자, 빈 줄 제거, 유니코드 비교를 설정합니다.',
      '원래 순서를 유지하거나 가나다·A-Z 자연 정렬을 고릅니다.',
      '바로 바뀐 결과를 확인한 뒤 복사합니다.',
    ],
    sections: [
      {
        heading: '어떤 줄을 같은 항목으로 볼까?',
        body: '기본값에서는 모든 문자가 같은 줄만 중복으로 봅니다. 따라서 “Apple”, “apple”, “apple ”은 서로 다른 줄입니다. 영문 대소문자 차이를 하나로 묶으려면 대소문자 구분을 끄고, 엑셀이나 웹에서 복사하면서 앞뒤에 공백·탭이 붙었다면 앞뒤 공백 무시를 켭니다. 이 설정은 비교할 때만 적용됩니다. 결과에 남는 줄의 대소문자와 공백은 원문 그대로라서, 목록 내용을 몰래 고치지 않습니다.\n\n유니코드 비교는 같은 모양의 문자가 다른 방식으로 저장된 경우를 처리합니다. 예를 들어 한글 한 글자가 완성형 음절로 들어온 줄과 자모가 나뉘어 들어온 줄은 화면에서 같아 보여도 문자 배열은 다를 수 있습니다. NFC 정규화를 켜면 이 두 표현을 같은 항목으로 비교하지만, 비슷한 단어를 추측해 합치는 기능은 아닙니다.',
      },
      {
        heading: '원래 순서, 마지막 값, 자연 정렬',
        body: '처음 것 남기기와 원래 순서를 함께 쓰면 각 항목이 처음 나온 위치를 그대로 유지하면서 뒤의 반복만 지웁니다. 최신 내보내기 행처럼 뒤에 나온 값을 남겨야 하면 마지막 것 남기기를 고르세요. 이때 남은 줄은 마지막으로 나타난 위치에 놓입니다. 중복을 정리한 뒤에만 정렬이 적용되므로, 어떤 줄이 남을지는 먼저·마지막 선택이 결정합니다.\n\n자연 정렬은 숫자가 섞인 이름을 사람이 읽는 순서에 가깝게 정렬합니다. 그래서 “항목 2”는 “항목 10”보다 앞에 옵니다. 빈 줄 제거까지 포함한 통계가 설정과 함께 즉시 바뀌므로, 별도 실행 버튼을 누른 뒤 오래된 결과를 확인할 필요가 없습니다.',
      },
      {
        heading: '줄바꿈 형식과 입력값 보호',
        body: '이 도구는 Windows CRLF, Unix·현재 macOS의 LF, 이전 Mac의 CR, 유니코드 줄·문단 구분 문자를 모두 줄 경계로 인식합니다. 마지막에 엔터가 있는 텍스트는 끝의 빈 줄 하나를 포함합니다. 빈 줄 제거를 켜면 이 줄과 공백·탭만 있는 줄을 결과에서 뺍니다. 쉼표가 있는 CSV 행도 이 도구에서는 한 줄 전체가 하나의 비교 단위입니다.\n\n중복 제거와 정렬은 브라우저 안에서 실행되고 텍스트는 비교를 위해 서버로 전송되지 않습니다. 새로고침 대비용 입력값만 현재 브라우저의 로컬 저장소에 보관합니다. 지우기를 누르면 이 도구에 저장된 입력값을 삭제할 수 있습니다.',
      },
    ],
    faq: [
      {
        q: '중복 줄을 지우면 원래 순서가 유지되나요?',
        a: '네. 처음 것 남기기와 원래 순서를 선택하면 각 항목의 첫 번째 위치가 유지되고 뒤의 중복만 제거됩니다. 마지막 것 남기기를 선택하면 각 항목의 마지막 위치와 원문 줄이 남습니다.',
      },
      {
        q: 'Apple과 apple을 같은 줄로 처리할 수 있나요?',
        a: '네. 대소문자 구분을 끄면 대문자와 소문자를 같은 비교값으로 처리합니다. 결과에는 처음 것 또는 마지막 것 설정에 따라 남은 줄의 원래 대소문자가 그대로 표시됩니다.',
      },
      {
        q: '앞뒤 공백 무시는 결과의 공백도 지우나요?',
        a: '아니요. 앞뒤 공백 무시는 중복을 찾는 비교 기준에만 적용합니다. “ apple ”과 “apple”을 같은 항목으로 찾되, 결과에 남는 줄의 공백은 원문 그대로 유지합니다.',
      },
      {
        q: '한글이 똑같아 보이는데 중복이 아닌 경우도 처리하나요?',
        a: '네. 한글은 완성형 음절 또는 분리된 자모로 저장될 수 있습니다. 유니코드 비교를 켜면 NFC 정규화 뒤에 비교하므로 두 표현을 같은 줄로 처리하고, 결과에는 남은 원문의 문자를 유지합니다.',
      },
      {
        q: '입력한 목록이 서버에 저장되나요?',
        a: '아니요. 중복 제거는 브라우저에서만 실행되고 목록은 서버로 전송되지 않습니다. 새로고침 대비용 입력값은 이 브라우저의 로컬 저장소에만 보관되며, 지우기를 누르면 삭제됩니다.',
      },
    ],
    ui: {
      inputLabel: '정리할 줄 목록',
      inputHint: '한 줄씩 비교하며, 입력하는 즉시 결과가 바뀝니다.',
      inputPlaceholder: '한 줄에 항목 하나씩 붙여넣으세요…',
      outputLabel: '중복을 뺀 줄',
      outputHint: '남는 줄의 대소문자와 공백은 원문 그대로 유지합니다.',
      emptyOutput: '줄 목록을 붙여넣으면 중복 제거 결과가 표시됩니다.',
      keepLabel: '남길 항목',
      keepFirst: '처음 것',
      keepLast: '마지막 것',
      sortLabel: '결과 정렬',
      sortOriginal: '원래 순서',
      sortAscending: '가나다·A-Z (자연 정렬)',
      sortDescending: '역순 (자연 정렬)',
      caseSensitive: '대소문자 구분',
      trimWhitespace: '앞뒤 공백 무시',
      removeEmptyLines: '빈 줄 제거',
      normalizeUnicode: '같은 유니코드 문자로 비교',
      inputLines: '입력 줄 수',
      uniqueLines: '고유 줄 수',
      duplicatesRemoved: '제거한 중복 줄',
      emptyLinesRemoved: '제거한 빈 줄',
      copy: '결과 복사',
      copied: '복사됨',
      clear: '지우기',
      autosaved: '이 브라우저에만 저장됨',
      copyShortcut: '복사 단축키',
      shortcutKey: 'Ctrl/⌘ + Enter',
    },
  },
};
