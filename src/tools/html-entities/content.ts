import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  inputLabel: 'Text',
  inputPlaceholder: 'Type or paste text here…',
  outputLabel: 'Result',
  outputPlaceholder: 'The converted text appears here.',
  directionLabel: 'Direction',
  encode: 'Encode',
  decode: 'Decode',
  levelLabel: 'Characters to encode',
  levelHint: 'Minimal escapes the five HTML characters. Non-ASCII also escapes letters such as é and 한.',
  levelMinimal: 'Five characters',
  levelNonAscii: 'Non-ASCII too',
  levelAll: 'Everything',
  formatLabel: 'Reference style',
  formatNamed: 'Named',
  formatDecimal: 'Decimal',
  formatHex: 'Hex',
  lineBreaks: 'Write line breaks as &#10;',
  clear: 'Clear',
  copy: 'Copy result',
  copied: 'Copied',
  swap: 'Use result as input',
  decodeAgain: 'Decode once more',
  unknownNotice: '{count} name(s) here are not HTML entities, so they were left as written: {list}',
  invalidNotice: '{count} number reference(s) pointed outside Unicode and became the replacement character.',
  remainingNotice:
    'The result still holds {count} reference(s). The text was probably encoded twice — decode once more.',
  replaced: 'References replaced',
  characters: 'Characters',
  autosaved: 'Saved in this browser only',
  tableTitle: 'Common references',
  tableChar: 'Character',
  tableNamed: 'Name',
  tableDecimal: 'Decimal',
  namedCount: 'Named references decoded here: {count} of the HTML 5 table.',
};

export type UI = typeof uiEn;

const uiKo = {
  inputLabel: '텍스트',
  inputPlaceholder: '여기에 텍스트를 입력하거나 붙여넣으세요…',
  outputLabel: '결과',
  outputPlaceholder: '변환된 텍스트가 여기에 표시됩니다.',
  directionLabel: '변환 방향',
  encode: '인코딩',
  decode: '디코딩',
  levelLabel: '변환할 문자',
  levelHint: '기본은 HTML에서 뜻이 있는 다섯 문자만 바꿉니다. ASCII 밖 문자를 고르면 é, 한글까지 숫자 참조로 바뀝니다.',
  levelMinimal: '다섯 문자',
  levelNonAscii: 'ASCII 밖 포함',
  levelAll: '모든 문자',
  formatLabel: '표기 방식',
  formatNamed: '이름',
  formatDecimal: '10진수',
  formatHex: '16진수',
  lineBreaks: '줄바꿈을 &#10;으로 표기',
  clear: '지우기',
  copy: '결과 복사',
  copied: '복사됨',
  swap: '결과를 입력으로',
  decodeAgain: '한 번 더 디코딩',
  unknownNotice: 'HTML 엔티티가 아닌 이름 {count}개는 그대로 두었습니다: {list}',
  invalidNotice: '유니코드 범위를 벗어난 숫자 참조 {count}개는 대체 문자()로 바꿨습니다.',
  remainingNotice:
    '결과에 아직 참조가 {count}개 남아 있습니다. 두 번 인코딩된 텍스트일 수 있으니 한 번 더 디코딩하세요.',
  replaced: '바꾼 참조',
  characters: '글자 수',
  autosaved: '이 브라우저에만 저장됩니다',
  tableTitle: '자주 쓰는 엔티티',
  tableChar: '문자',
  tableNamed: '이름',
  tableDecimal: '10진수',
  namedCount: '여기서 읽는 이름 엔티티: HTML5 표 {count}개 전체.',
};

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'HTML Entity Encoder & Decoder — Named, Decimal, Hex',
    description:
      'Encode or decode HTML entities as you type. Named, decimal or hex output, the full HTML 5 name table, and a report of names that are not entities. Nothing is uploaded.',
    h1: 'HTML Entity Encoder / Decoder',
    tagline: 'Escape markup characters and every HTML 5 named reference in both directions, live, on your device.',
    name: 'HTML Entities',
    keywords: [
      'html encode',
      'html decode',
      'escape html',
      'unescape html',
      'html special characters',
      'html entity converter',
    ],
    howTo: [
      'Paste text into the “Text” box. The result updates as you type.',
      'Choose Encode to escape characters, or Decode to turn references back into characters.',
      'When encoding, pick how much to escape and whether references are named, decimal or hex.',
      'Copy the result, or press “Use result as input” to check the round trip.',
    ],
    sections: [
      {
        heading: 'Only five characters must be escaped',
        body: 'Inside HTML text and quoted attribute values, five characters carry meaning: & starts an entity, < and > open and close tags, and " and \' end an attribute value. Every other character, including é, 한 and emoji, can be written as it is as long as the document is UTF-8 — which is the default on the web today. That is why the minimal level is the right default for blog posts, templates and email drafts, and why the non-ASCII level exists only for systems that still cannot read UTF-8.\n\nEscaping is context-bound. These five characters are enough for text nodes and for attribute values quoted with the matching quote, but not inside a <script> block, an unquoted attribute, a URL in href or a CSS value. For those, use the escaping function of your framework or template engine instead of writing entities by hand.',
      },
      {
        heading: 'Named, decimal and hexadecimal references are the same character',
        body: '&copy;, &#169; and &#xA9; all render ©. HTML 5 defines 2,125 named references, of which 93 stand for a sequence of two or more code points (for example &NotEqualTilde;). HTML 4 defined just 252 names, so old mail clients and legacy CMS editors may not recognise newer ones. This tool decodes the whole HTML 5 table and writes named output from the HTML 4 names first, falling back to digits for characters that have no old name.\n\nNumeric references work for every character, including Korean and emoji. When a reference is written per UTF-16 unit instead of per code point, an emoji becomes two broken half-references; this tool reads text by code point, so 😀 becomes one reference: &#128512; or &#x1F600;.',
      },
      {
        heading: 'Double encoding, legacy names and unknown names',
        body: 'Encoding text that is already encoded turns &lt; into &amp;lt;, and a browser then shows the characters &lt; instead of < . The decoder reports how many references are left in its output, so two passes are visibly two passes rather than a guess. Browsers also accept 106 legacy names without a semicolon (&copy, &nbsp, &amp) and match the longest one they know, which is why &notit; reads as ¬it; in body text; unknown names that are not legacy stay exactly as written and are listed under the result so you can see that nothing was silently dropped.',
      },
    ],
    faq: [
      {
        q: 'What is the difference between named, decimal and hex entities?',
        a: 'They mean the same character. Named references such as &copy; are readable, decimal ones such as &#169; work for any character, and hexadecimal ones such as &#xA9; are the usual form in code. This tool writes HTML 4 names first when you choose Named, then falls back to decimal below U+0100 and hex above it.',
      },
      {
        q: 'Does encoding HTML entities prevent XSS?',
        a: 'In HTML text and in quoted attribute values, escaping & < > " and the matching quote stops markup from being created. It is not enough inside script blocks, unquoted attributes, javascript: URLs, inline CSS or SQL. Use your framework\'s context-aware escaping for those, and treat this tool as a way to inspect what that escaping produces.',
      },
      {
        q: 'Why did my text become &amp;lt; instead of < ?',
        a: 'The text was escaped twice: first to &lt;, then the ampersand was escaped again to &amp;. Decode once to get &lt; and a second time to get <. The result panel counts the references that remain, so you can see that a second pass is needed before you paste it anywhere.',
      },
      {
        q: 'Do I need to encode Korean or accented letters?',
        a: 'No for any page that declares UTF-8, which covers virtually all current sites and email clients. Choose “Non-ASCII too” only when the text goes into a system that cannot hold UTF-8, such as an old mail template, a legacy database field or an SMS gateway. Korean has no HTML 4 name, so it is written as a numeric reference: 가 becomes &#44032;.',
      },
      {
        q: 'Which entity names does the decoder understand?',
        a: 'All 2,125 named references in the HTML 5 table, including the 93 that expand to several code points, plus the 106 legacy names that browsers accept without a semicolon. A name outside that set is left unchanged and listed under the result instead of disappearing.',
      },
      {
        q: 'Is the text sent anywhere?',
        a: 'No. Encoding and decoding run in JavaScript in this tab, and the text is only stored in this browser so a refresh keeps your work. There is no upload, no account and no server call, which matters when the input is a template with internal hostnames or customer data.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'HTML 엔티티 변환기 — 이름·10진수·16진수 인코딩',
    description:
      'HTML 특수문자를 엔티티로 바꾸고 되돌립니다. 이름·10진수·16진수 표기, HTML5 엔티티 전체 지원, 엔티티가 아닌 이름은 따로 알려 줍니다. 입력한 글은 서버로 전송되지 않습니다.',
    h1: 'HTML 엔티티 변환기',
    tagline: 'HTML에서 뜻이 있는 문자와 HTML5 이름 엔티티 전체를 입력하는 즉시 양방향으로 변환합니다.',
    name: 'HTML 엔티티',
    keywords: [
      'html 특수문자 변환',
      'html 엔티티',
      '엔티티 변환',
      'html 이스케이프',
      '특수문자 코드',
      'html 인코딩 디코딩',
    ],
    howTo: [
      '‘텍스트’ 칸에 변환할 글을 붙여넣으면 결과가 바로 표시됩니다.',
      '문자를 엔티티로 바꾸려면 ‘인코딩’, 엔티티를 문자로 되돌리려면 ‘디코딩’을 고릅니다.',
      '인코딩할 때는 바꿀 문자 범위와 표기 방식(이름·10진수·16진수)을 고릅니다.',
      '결과를 복사하거나 ‘결과를 입력으로’를 눌러 왕복 변환이 맞는지 확인합니다.',
    ],
    sections: [
      {
        heading: '꼭 바꿔야 하는 문자는 다섯 개',
        body: 'HTML 본문과 따옴표로 감싼 속성 값에서 뜻이 있는 문자는 &, <, >, ", \' 다섯 개입니다. &는 엔티티의 시작, <와 >는 태그의 경계, 따옴표는 속성 값의 끝을 뜻합니다. é, 한글, 이모지 같은 나머지 문자는 문서가 UTF-8이면 그대로 써도 됩니다. 요즘 웹과 메일은 거의 모두 UTF-8이므로 블로그 글이나 템플릿에는 ‘다섯 문자’만 바꾸는 기본 설정이면 충분하고, ‘ASCII 밖 포함’은 UTF-8을 제대로 처리하지 못하는 옛 시스템에 넣을 때만 필요합니다.\n\n이 다섯 문자만 바꾸는 것으로는 <script> 안, 따옴표 없는 속성, href의 javascript: 주소, CSS 값은 안전해지지 않습니다. 그런 자리는 프레임워크나 템플릿 엔진의 문맥별 이스케이프를 쓰고, 이 도구는 그 결과가 어떻게 보이는지 확인하는 용도로 쓰세요.',
      },
      {
        heading: '이름·10진수·16진수 표기는 같은 문자입니다',
        body: '&copy;, &#169;, &#xA9;는 모두 ©를 뜻합니다. HTML5에는 이름 엔티티가 2,125개 있고 그중 93개는 두 개 이상의 코드 포인트를 뜻합니다(&NotEqualTilde; 처럼). HTML4에는 252개만 있었기 때문에 오래된 메일 클라이언트나 예전 CMS 편집기는 새 이름을 모를 수 있습니다. 이 도구는 HTML5 표를 모두 읽고, 이름으로 쓸 때는 HTML4 이름을 먼저 쓰고 이름이 없는 문자는 숫자로 씁니다.\n\n숫자 참조는 한글과 이모지를 포함한 모든 문자에 쓸 수 있습니다. 이모지를 UTF-16 단위로 쪼개 인코딩하면 잘못된 참조 두 개가 되지만, 이 도구는 코드 포인트 단위로 읽으므로 😀는 &#128512; 하나로 바뀝니다.',
      },
      {
        heading: '이중 인코딩과 모르는 이름',
        body: '이미 인코딩된 글을 다시 인코딩하면 &lt;가 &amp;lt;가 되고, 브라우저는 < 기호 대신 &lt;라는 글자를 보여 줍니다. 이 도구는 결과에 남은 참조 개수를 알려 주므로 두 번 풀어야 하는지 결과만 보고 판단할 수 있습니다. 브라우저처럼 세미콜론 없이도 읽는 옛 이름 106개(&copy, &nbsp, &amp)도 처리하며, 아는 이름 중 가장 긴 것을 먼저 맞추기 때문에 &notit;은 본문에서 ¬it;로 읽힙니다. HTML5 표에 없는 이름은 그대로 두고 결과 아래에 목록으로 알려 주므로 글이 조용히 사라지는 일은 없습니다.',
      },
    ],
    faq: [
      {
        q: '이름 엔티티와 숫자 엔티티는 무엇이 다른가요?',
        a: '같은 문자를 가리킵니다. &copy;처럼 이름으로 쓰면 읽기 쉽고, &#169;나 &#xA9;처럼 숫자로 쓰면 이름이 없는 문자에도 쓸 수 있습니다. 이 도구에서 ‘이름’을 고르면 HTML4 이름을 먼저 쓰고, 이름이 없는 문자는 U+0100 미만이면 10진수, 그 이상이면 16진수로 씁니다.',
      },
      {
        q: '엔티티로 바꾸면 XSS가 막히나요?',
        a: 'HTML 본문과 따옴표로 감싼 속성 값에서는 &, <, >, " 를 바꾸는 것으로 태그가 만들어지지 않습니다. 다만 script 블록, 따옴표 없는 속성, javascript: 주소, 인라인 CSS, SQL 안에서는 그것만으로 부족합니다. 실제 서비스에서는 프레임워크의 문맥별 이스케이프를 쓰고, 이 도구는 그 결과를 확인하는 용도로 쓰세요.',
      },
      {
        q: '왜 < 가 &amp;lt; 로 바뀌었나요?',
        a: '이미 &lt;로 인코딩된 글을 한 번 더 인코딩해서 앰퍼샌드까지 바뀐 것입니다. 한 번 디코딩하면 &lt;, 두 번 디코딩하면 < 가 됩니다. 결과 칸 아래에 남은 참조 개수가 표시되므로 몇 번 더 풀어야 하는지 바로 알 수 있습니다.',
      },
      {
        q: '한글이나 영문 악센트 문자도 엔티티로 바꿔야 하나요?',
        a: 'UTF-8을 쓰는 페이지와 메일에서는 바꿀 필요가 없습니다. 예전 메일 템플릿, 레거시 데이터베이스, SMS 게이트웨이처럼 UTF-8을 처리하지 못하는 곳에 넣을 때만 ‘ASCII 밖 포함’을 고르세요. 한글은 HTML4 이름이 없어서 가 → &#44032; 처럼 숫자 참조로 바뀝니다.',
      },
      {
        q: '어떤 이름까지 디코딩되나요?',
        a: 'HTML5 표에 있는 이름 2,125개를 모두 읽습니다. 두 개 이상의 문자로 풀리는 이름 93개와, 세미콜론 없이도 브라우저가 읽는 옛 이름 106개도 포함됩니다. 표에 없는 이름은 그대로 두고 결과 아래에 목록으로 보여 줍니다.',
      },
      {
        q: '입력한 글이 서버로 전송되나요?',
        a: '아니요. 변환은 이 탭의 자바스크립트에서 실행되고, 입력한 글은 새로고침해도 남도록 이 브라우저에만 저장됩니다. 업로드도, 계정도, 서버 호출도 없으므로 내부 호스트 이름이나 고객 정보가 든 템플릿도 그대로 붙여넣을 수 있습니다.',
      },
    ],
    ui: uiKo,
  },
};
