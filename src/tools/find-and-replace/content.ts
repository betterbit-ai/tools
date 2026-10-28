import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  inputLabel: 'Original text',
  inputHint: 'Paste or type the text you want to edit.',
  inputPlaceholder: 'Paste text here…',
  outputLabel: 'Preview',
  outputHint: 'The original stays unchanged until you apply the preview.',
  outputPlaceholder: 'Your replacement preview appears here.',
  findLabel: 'Find',
  replacementLabel: 'Replace with',
  literalFindHint: 'Plain text is matched exactly; punctuation is safe.',
  regexFindHint: 'Use JavaScript regular-expression syntax.',
  literalReplacementHint: 'A $ is inserted as a normal dollar sign.',
  regexReplacementHint: 'Use $1, $2, or $& to insert matched groups.',
  regex: 'Use regular expression',
  caseSensitive: 'Match case',
  wholeWord: 'Whole words only',
  invalidPattern: 'This regular expression is invalid: {error}',
  matches: 'Matches',
  history: 'Undo steps',
  apply: 'Use preview as input',
  undo: 'Undo',
  copy: 'Copy preview',
  copied: 'Copied',
  clear: 'Clear',
  autosaved: 'Saved in this browser only',
  applyHint: 'Applying saves one undo step. The preview itself never overwrites your text.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Find and Replace Text — Regex Preview & Undo',
    description:
      'Find and replace text instantly with literal, case-sensitive, whole-word or regex matching. Preview every change, keep an undo history, and copy locally.',
    h1: 'Find and Replace Text',
    tagline:
      'Replace text live with safe literal matching, regex options, and a preview that never overwrites the original.',
    name: 'Find and Replace',
    keywords: ['find and replace text', 'text replacer', 'replace words', 'regex replace', 'search and replace online'],
    howTo: [
      'Paste or type text in “Original text.”',
      'Enter the text to find and its replacement; the preview and match count update immediately.',
      'Turn on Match case, Whole words only, or Use regular expression when needed.',
      'Copy the preview, or choose “Use preview as input” to continue editing it.',
      'Choose Undo to restore any of the last 10 applied versions during this visit.',
    ],
    sections: [
      {
        heading: 'Plain text is the safe default',
        body: 'With “Use regular expression” turned off, the Find field is literal. A period in a.b finds the three characters a, period, b; it does not match axb. The replacement is literal too, so replacing a price with $5 inserts a dollar sign rather than interpreting $5 as a capture group. This is the right mode for names, product terms, URLs and repeated typos.\n\nWhole-word matching uses Unicode letters and numbers, not JavaScript’s ASCII-only \\b shortcut. For example, finding 가 as a whole word matches 가 between spaces but does not change the first character in 가나다. It also avoids treating the é in café as a word boundary.',
      },
      {
        heading: 'Regular expressions use your browser’s JavaScript engine',
        body: 'Turn on regular expressions when a pattern matters more than exact spelling. For example, find (\\d{4})-(\\d{2})-(\\d{2}) and replace it with $3/$2/$1 to change 2026-10-28 into 28/10/2026. Parentheses create numbered capture groups: $1 is the first group and $& is the entire match. Use $$ for a literal dollar sign in a regex replacement.\n\nThe tool validates a pattern before changing the preview. JavaScript regular expressions are not PCRE: syntax such as \\A and possessive quantifiers is not supported. Very complex patterns can also take a long time in any JavaScript page, so check the match count and preview before applying a broad pattern.',
      },
      {
        heading: 'Preview first, then apply only when it looks right',
        body: 'The source editor and preview are separate. Typing a search term never edits the source, and copying the preview does not change it either. “Use preview as input” is for a deliberate next pass and retains up to 10 applied source versions in this tab, so Undo can step back through the changes.\n\nAll replacement happens in the browser. The tool saves the text, find term, replacement and options in this browser’s local storage so a refresh does not lose a draft. Clear removes those saved values from this tool; no text is sent to a server.',
      },
    ],
    faq: [
      {
        q: 'How do I replace text without treating punctuation as a regular expression?',
        a: 'Leave “Use regular expression” turned off. Plain-text mode escapes characters such as ., *, ?, (, ), [, and ] automatically, so searching for a.b matches only the literal text a.b.',
      },
      {
        q: 'How do I swap parts of a date with find and replace?',
        a: 'Turn on regular expressions, find (\\d{4})-(\\d{2})-(\\d{2}), and replace it with $3/$2/$1. For 2026-10-28, the three capture groups produce 28/10/2026.',
      },
      {
        q: 'What does Whole words only do with Korean text?',
        a: 'Whole words only treats Unicode letters and numbers as part of a word. Searching for 가 matches a standalone 가 but does not replace the 가 inside 가나다, which avoids the ASCII-only word-boundary behavior that can split Korean or accented words incorrectly.',
      },
      {
        q: 'Can I undo a find-and-replace?',
        a: 'Yes. The live preview does not alter the source at all. After choosing “Use preview as input,” Undo restores up to 10 applied versions for the current browser tab.',
      },
      {
        q: 'Is my text uploaded when I use find and replace?',
        a: 'No. Find and replace runs in the browser and text is not sent to a server. The latest draft is stored only in this browser’s local storage until it is cleared.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '텍스트 찾아 바꾸기 — 정규식·미리보기·되돌리기',
    description:
      '텍스트를 붙여넣으면 찾아 바꾸기 결과와 개수를 즉시 미리 봅니다. 정규식·대소문자·단어 단위 옵션과 10단계 되돌리기를 브라우저에서 제공합니다.',
    h1: '텍스트 찾아 바꾸기',
    tagline: '일반 문자열과 정규식 치환을 바로 미리 보고, 원문을 바꾸기 전 결과를 확인합니다.',
    name: '찾아 바꾸기',
    keywords: ['텍스트 찾아 바꾸기', '단어 일괄 바꾸기', '문자열 치환', '정규식 바꾸기', '글자 바꾸기'],
    howTo: [
      '“원문 텍스트”에 수정할 글을 붙여넣거나 입력합니다.',
      '찾을 내용과 바꿀 내용을 입력해 결과와 일치 개수를 바로 확인합니다.',
      '필요하면 대소문자 구분, 단어 전체, 정규식 사용을 켭니다.',
      '결과를 복사하거나 “미리보기를 원문으로 사용”을 눌러 다음 치환을 이어 갑니다.',
      '이번 탭에서 적용한 결과는 최대 10단계까지 되돌릴 수 있습니다.',
    ],
    sections: [
      {
        heading: '일반 문자열 모드는 기호를 그대로 찾습니다',
        body: '“정규식 사용”을 끄면 찾을 내용은 글자 그대로 처리합니다. 예를 들어 a.b를 찾으면 a, 마침표, b가 이어진 경우만 찾고 axb는 찾지 않습니다. 바꿀 내용의 $도 그룹 참조가 아니라 달러 기호로 들어가므로 제품명, URL, 금액, 반복 오타를 고칠 때 안전합니다.\n\n“단어 전체만”은 자바스크립트의 영문 중심 \\b 경계 대신 유니코드 글자와 숫자를 기준으로 판단합니다. 그래서 가를 단어 전체로 찾으면 띄어쓴 가는 바꾸지만 가나다 속의 가는 바꾸지 않으며, café처럼 악센트가 있는 단어도 중간에서 끊지 않습니다.',
      },
      {
        heading: '정규식에서는 캡처 그룹으로 형식을 바꿉니다',
        body: '날짜나 코드처럼 규칙이 있는 값은 정규식을 켭니다. (\\d{4})-(\\d{2})-(\\d{2})를 찾아 $3/$2/$1로 바꾸면 2026-10-28이 28/10/2026으로 바뀝니다. 괄호로 묶은 순서대로 $1, $2처럼 참조하고, 전체 일치는 $&로 넣습니다. 정규식 모드에서 달러 기호 자체가 필요하면 $$를 씁니다.\n\n이 도구는 브라우저의 JavaScript 정규식 문법을 사용합니다. PCRE의 \\A 같은 문법이나 possessive quantifier는 지원하지 않습니다. 잘못된 패턴은 결과를 바꾸지 않고 오류를 표시하므로, 넓은 패턴을 적용하기 전에 일치 개수와 미리보기를 확인할 수 있습니다.',
      },
      {
        heading: '원문과 결과를 분리해 실수를 줄입니다',
        body: '찾을 내용을 입력하는 동안 원문은 바뀌지 않습니다. 미리보기를 복사해도 원문은 그대로이고, “미리보기를 원문으로 사용”을 눌렀을 때만 다음 작업용 원문이 바뀝니다. 적용할 때마다 현재 탭에서 최대 10개 원문을 기억하므로 되돌리기로 이전 상태를 확인할 수 있습니다.\n\n치환은 모두 브라우저 안에서 처리됩니다. 새로고침해도 작업을 이어 갈 수 있도록 원문, 찾을 내용, 바꿀 내용과 옵션을 이 브라우저의 로컬 저장소에만 보관합니다. 초기화를 누르면 이 도구가 저장한 값도 지웁니다.',
      },
    ],
    faq: [
      {
        q: '특수문자가 있는 문구를 그대로 찾아 바꾸려면 어떻게 하나요?',
        a: '“정규식 사용”을 끈 일반 문자열 모드를 쓰면 됩니다. 이 모드에서는 ., *, ?, (, ), [, ] 같은 정규식 기호를 자동으로 문자 그대로 처리하므로 a.b를 찾을 때 axb는 바꾸지 않습니다.',
      },
      {
        q: '정규식으로 날짜 순서를 바꾸려면 어떻게 하나요?',
        a: '정규식을 켜고 (\\d{4})-(\\d{2})-(\\d{2})를 찾은 뒤 $3/$2/$1로 바꾸면 됩니다. 2026-10-28은 세 캡처 그룹을 이용해 28/10/2026으로 바뀝니다.',
      },
      {
        q: '단어 전체만 옵션은 한글에도 적용되나요?',
        a: '적용됩니다. 단어 전체만은 유니코드 글자와 숫자를 기준으로 하므로 가만 있는 가는 바꾸고 가나다 안의 가는 바꾸지 않습니다. 영문 ASCII 경계만 쓰는 방식보다 한글과 악센트 문자의 중간 일치를 줄입니다.',
      },
      {
        q: '찾아 바꾸기를 되돌릴 수 있나요?',
        a: '미리보기는 원문을 전혀 바꾸지 않습니다. “미리보기를 원문으로 사용”을 눌러 적용한 뒤에는 현재 브라우저 탭에서 최대 10단계까지 되돌릴 수 있습니다.',
      },
      {
        q: '붙여넣은 글이 서버로 전송되나요?',
        a: '아닙니다. 찾아 바꾸기는 브라우저에서 실행되고 텍스트를 서버로 보내지 않습니다. 마지막 작업 내용은 초기화할 때까지 이 브라우저의 로컬 저장소에만 보관됩니다.',
      },
    ],
    ui: {
      inputLabel: '원문 텍스트',
      inputHint: '수정할 글을 붙여넣거나 입력합니다.',
      inputPlaceholder: '여기에 텍스트를 붙여넣습니다…',
      outputLabel: '결과 미리보기',
      outputHint: '미리보기는 원문을 바꾸지 않습니다.',
      outputPlaceholder: '치환 결과가 여기에 표시됩니다.',
      findLabel: '찾을 내용',
      replacementLabel: '바꿀 내용',
      literalFindHint: '일반 문자열은 기호까지 그대로 찾습니다.',
      regexFindHint: 'JavaScript 정규식 문법을 사용합니다.',
      literalReplacementHint: '$는 일반 달러 기호로 들어갑니다.',
      regexReplacementHint: '일치한 그룹은 $1, $2, $&로 넣습니다.',
      regex: '정규식 사용',
      caseSensitive: '대소문자 구분',
      wholeWord: '단어 전체만',
      invalidPattern: '정규식 패턴이 올바르지 않습니다: {error}',
      matches: '일치 개수',
      history: '되돌리기 단계',
      apply: '미리보기를 원문으로 사용',
      undo: '되돌리기',
      copy: '미리보기 복사',
      copied: '복사됨',
      clear: '초기화',
      autosaved: '이 브라우저에만 저장됨',
      applyHint: '적용할 때마다 되돌리기 1단계가 저장됩니다. 미리보기만으로는 원문이 바뀌지 않습니다.',
    },
  },
};
