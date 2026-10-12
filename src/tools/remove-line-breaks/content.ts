import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  inputLabel: 'Text with line breaks',
  inputPlaceholder: 'Paste text copied from a PDF, email, or web page…',
  outputLabel: 'Cleaned text',
  modeLabel: 'Replace joined line breaks with',
  modeSpace: 'Space',
  modeRemove: 'Nothing',
  modeCustom: 'Custom',
  customSeparatorLabel: 'Custom separator',
  customSeparatorPlaceholder: 'For example: , ',
  pdfPreset: 'PDF copy cleanup',
  singleLinePreset: 'Make one line',
  preserveParagraphs: 'Keep blank-line paragraphs',
  preserveListItems: 'Keep list items on their own lines',
  joinHyphenatedWords: 'Rejoin split English words',
  trimLineWhitespace: 'Trim space around each line',
  collapseSpaces: 'Collapse repeated spaces',
  lineBreaksFound: 'Line breaks found',
  lineBreaksRemoved: 'Line breaks removed',
  lineBreaksKept: 'Line breaks kept',
  copy: 'Copy result',
  copied: 'Copied',
  clear: 'Clear',
  autosaved: 'Saved in this browser only',
  copyShortcut: 'Copy shortcut',
  shortcutKey: 'Ctrl/⌘ + Shift + C',
  emptyOutput: 'Paste text to see the cleaned result.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Remove Line Breaks — PDF Copy Cleanup',
    description:
      'Remove line breaks from copied PDF, email and web text as you paste. Keep real paragraphs and lists, repair split English words, and copy the result without uploads.',
    h1: 'Remove Line Breaks',
    tagline: 'Clean pasted PDF text live while keeping paragraphs, lists and split English words intact.',
    name: 'Remove Line Breaks',
    keywords: ['line break remover', 'remove newlines', 'join lines', 'PDF copy cleanup', 'text cleaner'],
    howTo: [
      'Paste the text that has unwanted line breaks.',
      'Leave “PDF copy cleanup” selected to keep blank-line paragraphs and list items.',
      'Choose Space, Nothing, or Custom when each line break needs a different replacement.',
      'Check the live result, then copy it or use Ctrl/⌘ + Shift + C when focus is outside a text field.',
    ],
    sections: [
      {
        heading: 'Why PDF copy-paste creates broken lines',
        body: 'A PDF describes where glyphs appear on a page; it does not always preserve the paragraph structure that a word processor uses. When a reader copies a narrow column, the end of each visible row can arrive as a real line break. Replacing every break with one space restores running prose, but it can also erase intentional paragraph boundaries. This tool treats one or more blank lines as a paragraph boundary when “Keep blank-line paragraphs” is on.\n\nThat rule is deliberately mechanical: if the source PDF has no blank line between its paragraphs, there is no reliable structural signal to recover. Review the live output and insert a paragraph break where the source did not preserve one.',
      },
      {
        heading: 'Use the replacement that matches your destination',
        body: 'Space is the safe default for prose: “first line” followed by “second line” becomes “first line second line”. Nothing is useful for identifiers, phone numbers or URLs that were wrapped in the middle. Custom joins a copied column with a separator such as “, ” or “ | ”. The tool recognizes CRLF (Windows), CR (older Mac), LF (Unix), and Unicode line-separator characters before applying the same rule.\n\nFor PDF copy, the preset also rejoins a hyphen only when a Latin letter before the break is followed by a lowercase Latin letter, so “infor-” plus “mation” becomes “information” while “well-” plus “Known” stays unchanged.',
      },
      {
        heading: 'Lists need different treatment from prose',
        body: 'Bulleted lines and numbered steps use line breaks as their structure. With list protection enabled, a line beginning with -, *, •, or a number followed by . or ) remains on a separate line. A preceding sentence is therefore not accidentally joined to its first list item. This is a pattern check, not document understanding: indented source text, tables and code may need manual review after cleanup.\n\nEverything is transformed in the browser as you type or paste. The optional saved draft lives in this browser’s local storage only; Clear removes it from the tool.',
      },
    ],
    faq: [
      {
        q: 'Does this tool upload my text?',
        a: 'No. Line-break cleanup runs in your browser and the text is not sent to a server. The draft is stored only in this browser’s local storage so it can survive a refresh; Clear removes that saved draft.',
      },
      {
        q: 'How do I remove PDF line breaks but keep paragraphs?',
        a: 'Paste the PDF text and use the PDF copy cleanup preset. It changes single line breaks inside a paragraph to spaces, while one or more blank lines become one blank-line paragraph boundary in the result.',
      },
      {
        q: 'Can I remove every line break without adding spaces?',
        a: 'Yes. Choose Nothing to delete every removable line break. This is appropriate for a number, URL or identifier split over two lines, but ordinary words can run together if their original line ending did not include a space.',
      },
      {
        q: 'Which line endings does the remover recognize?',
        a: 'The remover normalizes Windows CRLF, Unix and modern macOS LF, classic Mac CR, and the Unicode line and paragraph separators before it cleans the text. CRLF counts as one line break, not two.',
      },
      {
        q: 'Will it fix every hyphenated word from a PDF?',
        a: 'It rejoins an end-of-line hyphen only when the next line begins with a lowercase English letter. That safely repairs common splits such as “infor-” plus “mation”, while leaving uppercase continuations and non-Latin text for review.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '줄바꿈 없애기 — PDF 복사 글 문단 유지',
    description:
      'PDF·이메일·웹에서 복사한 글의 줄바꿈을 붙여넣는 즉시 정리합니다. 빈 줄 문단과 목록은 남기고, 영어 하이픈 분리도 이어 붙입니다. 서버 전송 없음.',
    h1: '줄바꿈 없애기',
    tagline: 'PDF에서 복사해 줄마다 끊긴 글을 바로 정리합니다. 문단과 목록은 지킵니다.',
    name: '줄바꿈 없애기',
    keywords: ['줄바꿈 제거', '줄바꿈 없애기', '개행 제거', 'PDF 복사 줄바꿈', '텍스트 줄 이어붙이기'],
    howTo: [
      '줄마다 끊긴 텍스트를 입력창에 붙여넣습니다.',
      'PDF 복사 정리를 그대로 두면 빈 줄 문단과 목록 줄을 보존합니다.',
      '줄바꿈 자리에 공백, 아무것도 없음, 사용자 지정 구분자 중 하나를 고릅니다.',
      '바로 바뀐 결과를 확인하고 복사합니다. 입력창 밖에서는 Ctrl/⌘ + Shift + C로도 복사합니다.',
    ],
    sections: [
      {
        heading: 'PDF에서 복사한 글은 왜 줄마다 끊길까?',
        body: 'PDF는 문단이라는 뜻 단위보다 페이지 위의 글자 위치를 기록하는 형식입니다. 그래서 좁은 지면이나 2단 논문에서 글을 복사하면, 화면의 한 줄 끝이 실제 줄바꿈 문자처럼 따라오는 경우가 있습니다. 단일 줄바꿈을 공백으로 바꾸면 문장은 자연스럽게 이어지지만, 문단 경계까지 지우면 읽기 어려워집니다. 이 도구에서 “빈 줄 문단 유지”를 켜면 빈 줄이 하나 이상인 구간은 문단 경계로 남깁니다.\n\n다만 원본 PDF가 문단 사이에 빈 줄을 넣지 않았다면, 복사된 문자만으로 문단 위치를 확정할 수는 없습니다. 결과를 보면서 필요한 위치에는 엔터를 다시 넣어야 합니다.',
      },
      {
        heading: '용도에 맞는 줄바꿈 처리 방법',
        body: '일반 문장이나 번역기에 넣을 글은 “공백”이 가장 안전합니다. “첫 번째 줄”과 “둘째 줄”이 “첫 번째 줄 둘째 줄”로 이어집니다. 전화번호·URL·상품 코드처럼 중간에서 잘린 값을 붙일 때는 “아무것도 없음”을 쓰면 됩니다. 여러 줄 목록을 한 줄로 만들 때는 “사용자 지정”에 쉼표와 공백(“, ”)이나 파이프(|)를 넣으세요.\n\n이 도구는 Windows의 CRLF, Unix·macOS의 LF, 오래된 Mac의 CR, 유니코드 줄·문단 구분 문자를 먼저 같은 줄바꿈으로 인식합니다. CRLF는 문자 2개여도 줄바꿈 1개로 처리합니다.',
      },
      {
        heading: '목록과 하이픈으로 나뉜 영어 단어',
        body: '목록은 줄바꿈 자체가 구조입니다. 목록 유지가 켜져 있으면 -, *, •, 또는 숫자 뒤의 .·)로 시작하는 줄은 다음 줄과 합치지 않습니다. 본문 아래의 첫 목록 항목도 별도 줄로 남으므로 복사한 안내문이나 메모를 정리할 때 안전합니다. 표, 코드, 들여쓴 시처럼 줄 모양에 의미가 있는 텍스트는 정리 뒤 반드시 결과를 확인하세요.\n\nPDF 복사 정리는 줄 끝의 영문자-하이픈 뒤에 다음 줄이 소문자 영문으로 시작할 때만 붙입니다. 예를 들어 “infor-”와 “mation”은 “information”이 되지만, 대문자나 한글로 시작하는 다음 줄은 자동으로 바꾸지 않습니다.',
      },
    ],
    faq: [
      {
        q: '입력한 텍스트가 서버로 전송되나요?',
        a: '아니요. 줄바꿈 정리는 브라우저 안에서만 실행되고 텍스트는 서버로 전송되지 않습니다. 새로고침 대비용 입력값도 이 브라우저의 로컬 저장소에만 보관되며, 지우기를 누르면 도구에서 삭제됩니다.',
      },
      {
        q: 'PDF 줄바꿈은 없애고 문단은 남기려면 어떻게 하나요?',
        a: '텍스트를 붙여넣은 뒤 PDF 복사 정리를 사용하면 됩니다. 문단 안의 한 줄짜리 줄바꿈은 공백으로 바꾸고, 빈 줄이 하나 이상인 구간은 결과에서 빈 줄 1개가 있는 문단 경계로 유지합니다.',
      },
      {
        q: '줄바꿈을 모두 붙여서 한 줄로 만들 수 있나요?',
        a: '네. “아무것도 없음”을 고르면 제거 가능한 줄바꿈을 삭제합니다. 다만 일반 문장은 단어가 붙을 수 있으므로, 번호·URL·코드처럼 공백 없이 이어져야 하는 값에 사용하는 편이 안전합니다.',
      },
      {
        q: '어떤 줄바꿈 문자를 처리하나요?',
        a: 'Windows CRLF, Unix와 현대 macOS의 LF, 예전 Mac의 CR, 유니코드 줄 구분자와 문단 구분자를 같은 줄바꿈으로 처리합니다. CRLF는 문자 2개로 저장되어도 줄바꿈 1개로 계산합니다.',
      },
      {
        q: 'PDF에서 하이픈으로 나뉜 영어 단어도 붙이나요?',
        a: '줄 끝이 영문자와 하이픈이고 다음 줄이 소문자 영문으로 시작할 때만 붙입니다. “infor-”와 “mation” 같은 흔한 분리는 고치되, 대문자·한글·기호로 시작하는 줄은 원문을 바꾸지 않도록 남깁니다.',
      },
    ],
    ui: {
      inputLabel: '줄바꿈이 있는 텍스트',
      inputPlaceholder: 'PDF, 이메일, 웹에서 복사한 텍스트를 붙여넣으세요…',
      outputLabel: '정리된 텍스트',
      modeLabel: '줄바꿈을 다음으로 바꾸기',
      modeSpace: '공백',
      modeRemove: '아무것도 없음',
      modeCustom: '사용자 지정',
      customSeparatorLabel: '사용자 지정 구분자',
      customSeparatorPlaceholder: '예: , ',
      pdfPreset: 'PDF 복사 정리',
      singleLinePreset: '한 줄로 만들기',
      preserveParagraphs: '빈 줄 문단 유지',
      preserveListItems: '목록 항목은 줄 유지',
      joinHyphenatedWords: '나뉜 영어 단어 붙이기',
      trimLineWhitespace: '각 줄 앞뒤 공백 정리',
      collapseSpaces: '연속 공백 하나로',
      lineBreaksFound: '찾은 줄바꿈',
      lineBreaksRemoved: '제거한 줄바꿈',
      lineBreaksKept: '남긴 줄바꿈',
      copy: '결과 복사',
      copied: '복사됨',
      clear: '지우기',
      autosaved: '이 브라우저에만 저장됨',
      copyShortcut: '복사 단축키',
      shortcutKey: 'Ctrl/⌘ + Shift + C',
      emptyOutput: '텍스트를 붙여넣으면 정리된 결과가 표시됩니다.',
    },
  },
};
