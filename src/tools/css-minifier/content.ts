import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  inputLabel: 'Code',
  inputPlaceholder: 'Paste CSS or JavaScript here…',
  outputLabel: 'Minified',
  outputPlaceholder: 'The minified code appears here.',
  languageLabel: 'Language',
  css: 'CSS',
  js: 'JavaScript',
  keepLicense: 'Keep /*! licence */ comments',
  clear: 'Clear',
  copy: 'Copy result',
  copied: 'Copied',
  download: 'Download',
  swap: 'Use result as input',
  original: 'Original',
  minified: 'Minified',
  saved: 'Saved',
  gzip: 'Gzipped',
  gzipUnavailable: 'gzip not available in this browser',
  comments: 'Comments removed',
  autosaved: 'Saved in this browser only',
  problemUnterminated: 'A string is never closed, so nothing was changed. Check the quotes near the end of the code.',
  problemUnbalanced: 'Braces do not balance, so nothing was changed.',
  problemVerification: 'The result would have altered a string, so the original code was kept.',
};

export type UI = typeof uiEn;

const uiKo = {
  inputLabel: '코드',
  inputPlaceholder: 'CSS 또는 JavaScript를 붙여넣으세요…',
  outputLabel: '압축 결과',
  outputPlaceholder: '압축된 코드가 여기에 표시됩니다.',
  languageLabel: '언어',
  css: 'CSS',
  js: 'JavaScript',
  keepLicense: '/*! 라이선스 */ 주석 유지',
  clear: '지우기',
  copy: '결과 복사',
  copied: '복사됨',
  download: '내려받기',
  swap: '결과를 입력으로',
  original: '원본',
  minified: '압축',
  saved: '줄어든 비율',
  gzip: 'gzip 크기',
  gzipUnavailable: '이 브라우저에서는 gzip을 측정할 수 없습니다',
  comments: '지운 주석',
  autosaved: '이 브라우저에만 저장됩니다',
  problemUnterminated: '닫히지 않은 문자열이 있어 아무것도 바꾸지 않았습니다. 코드 끝부분의 따옴표를 확인하세요.',
  problemUnbalanced: '중괄호 짝이 맞지 않아 아무것도 바꾸지 않았습니다.',
  problemVerification: '압축하면 문자열이 달라져서 원본 코드를 그대로 두었습니다.',
};

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'CSS & JS Minifier — Safe, Line-Preserving JavaScript',
    description:
      'Minify CSS and JavaScript as you type. Comments and spare whitespace go, literals stay byte for byte, JavaScript keeps its line breaks, and the gzip size is measured.',
    h1: 'CSS & JS Minifier',
    tagline: 'Shrink a stylesheet or a script without changing what it means, and see the gzip size as well.',
    name: 'CSS & JS Minifier',
    keywords: ['minify css', 'css minifier', 'minify js', 'javascript minifier', 'css 압축', 'js 압축'],
    howTo: [
      'Paste CSS or JavaScript into the code box; the language is detected from the text.',
      'The minified result appears as you type, with the size before and after.',
      'Choose whether /*! licence */ comments should survive.',
      'Copy the result or download it as .min.css or .min.js.',
    ],
    sections: [
      {
        heading: 'Whitespace is not always spare',
        body: 'In CSS a space is a descendant combinator, so `.a :hover` and `.a:hover` are different selectors. This minifier therefore removes space around braces, semicolons, commas, brackets and the > + ~ combinators, but keeps the space when two selector tokens are separated by one. It also copies strings, url() contents and custom property values byte for byte: `--gap:  4px  8px` keeps its spacing, because the value of a custom property is the text after the colon, and collapsing it can change what var() substitutes.\n\nThat makes the output larger than a rules-merging minifier such as csso or Lightning CSS, and it is deliberate: the result here is safe to paste into production without checking it selector by selector.',
      },
      {
        heading: 'Why the JavaScript minifier keeps line breaks',
        body: 'JavaScript inserts semicolons automatically at line breaks, so a minifier that joins every line can change meaning: `return` on its own line returns no value, and a line starting with ( becomes a call on the previous expression. This tool removes comments and indentation, collapses runs of spaces inside a line, and never joins two lines. The saving is real but modest — typically 15–35% on hand-written script — and it cannot break statement boundaries.\n\nIt does not rename variables or fold constants either. For the smallest possible bundle, run terser, esbuild or SWC in your build; this page is for checking a snippet, stripping a small file, or seeing what a build output really contains.',
      },
      {
        heading: 'The number that matters is the gzip size',
        body: 'Minified text and compressed text overlap a lot. A stylesheet that drops 30% of its bytes after minifying may be only a few percent smaller after gzip, because compression already removes the repetition a minifier saved. For that reason the size panel measures both files with the browser’s own gzip (CompressionStream), so you can compare the number your users actually download instead of the raw byte count.\n\nServing CSS and JS with Brotli or gzip is worth more than any whitespace minification; minify to cut parsing work and request size, and compress to cut transfer size.',
      },
    ],
    faq: [
      {
        q: 'Is it safe to ship the minified CSS and JavaScript?',
        a: 'Yes. CSS keeps every string, url() and custom property value exactly, and a space between two selector tokens is never removed because that space is the descendant combinator. JavaScript keeps its line breaks, so automatic semicolon insertion behaves as it did in the original. The tool also verifies that every string literal survives in order, and refuses the result when one would not.',
      },
      {
        q: 'How much smaller does it make a file?',
        a: 'On hand-written code with comments and indentation, typically 15–40% for CSS and 15–35% for JavaScript. A full minifier with a parser can do better by renaming variables and removing dead code; use terser, esbuild or SWC when you need the last few percent. After gzip the difference is often a few percent, which is why the size panel shows both.',
      },
      {
        q: 'Will my /*! licence comment survive?',
        a: 'Yes by default. Comments that start with /*! are treated as licences and kept in both CSS and JavaScript, which matters for files that must keep an attribution. Turn the option off when you want them removed too.',
      },
      {
        q: 'What happens to invalid code?',
        a: 'A string that is never closed, or braces that do not balance, stops the minification and the original code is returned unchanged with a note. The same happens when the check finds that a string literal would differ in the output. Nothing is silently repaired, because guessing at broken code is how a minifier breaks a site.',
      },
      {
        q: 'Can I minify several files at once?',
        a: 'One file at a time. Paste each file separately, or use a build tool with a proper minifier when you have many: concatenating unrelated files here could merge two @charset rules or two "use strict" directives, and the result would not match what your build produces.',
      },
      {
        q: 'Is my code uploaded?',
        a: 'No. The minifier runs in this tab and the code is only stored in this browser so a refresh keeps your work. No request carries it, which matters for CSS that contains internal URLs or JavaScript with API keys.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'CSS·JS 압축기 — 줄바꿈을 지키는 안전한 압축',
    description:
      'CSS와 JavaScript를 입력하는 즉시 압축합니다. 주석과 불필요한 공백만 지우고 문자열은 그대로 두며, 자바스크립트는 줄바꿈을 유지합니다. gzip 크기도 함께 측정합니다.',
    h1: 'CSS·JS 압축기',
    tagline: '스타일시트와 스크립트를 뜻이 바뀌지 않게 줄이고, gzip 크기까지 함께 확인합니다.',
    name: 'CSS·JS 압축기',
    keywords: ['css 압축', 'css minify', 'js 압축', '자바스크립트 압축', 'minify css', 'minify js'],
    howTo: [
      '코드 칸에 CSS나 JavaScript를 붙여넣으면 언어를 자동으로 판별합니다.',
      '압축 결과가 바로 표시되고, 원본과 압축 후 크기를 함께 보여 줍니다.',
      '/*! 라이선스 */ 주석을 남길지 선택합니다.',
      '결과를 복사하거나 .min.css·.min.js 파일로 내려받습니다.',
    ],
    sections: [
      {
        heading: '공백이 항상 군더더기는 아닙니다',
        body: 'CSS에서 공백은 하위 요소 선택자입니다. `.a :hover`와 `.a:hover`는 다른 선택자입니다. 그래서 이 압축기는 중괄호·세미콜론·쉼표·대괄호·> + ~ 주변의 공백은 지우지만, 선택자 두 토큰 사이의 공백은 남깁니다. 문자열과 url() 내용, 사용자 지정 속성 값도 그대로 복사합니다. `--gap:  4px  8px`의 띄어쓰기는 유지되는데, 사용자 지정 속성의 값은 콜론 뒤 텍스트 전체이고 이를 합치면 var()가 대체하는 값이 달라질 수 있기 때문입니다.\n\n그래서 규칙을 병합하는 csso나 Lightning CSS보다 결과가 조금 큽니다. 대신 선택자를 하나하나 확인하지 않아도 운영에 그대로 붙여넣을 수 있는 결과를 만듭니다.',
      },
      {
        heading: '자바스크립트 압축기가 줄바꿈을 남기는 이유',
        body: '자바스크립트는 줄바꿈에서 세미콜론을 자동으로 넣습니다. 그래서 모든 줄을 합치는 압축기는 뜻을 바꿀 수 있습니다. return만 있는 줄은 아무 값도 반환하지 않고, (로 시작하는 다음 줄은 앞 식에 대한 호출이 됩니다. 이 도구는 주석과 들여쓰기를 지우고 줄 안의 연속 공백을 하나로 줄이지만, 두 줄을 절대 합치지 않습니다. 절감률은 손으로 쓴 스크립트에서 보통 15~35%로 크지 않지만, 문장 경계를 깨뜨릴 수 없습니다.\n\n변수 이름을 바꾸거나 상수를 접는 일도 하지 않습니다. 가장 작은 번들이 필요하면 빌드에서 terser·esbuild·SWC를 쓰세요. 이 페이지는 조각을 확인하거나 작은 파일을 정리하고, 빌드 산출물에 무엇이 남았는지 보는 데 적합합니다.',
      },
      {
        heading: '실제로 중요한 숫자는 gzip 크기입니다',
        body: '압축된 텍스트와 gzip 압축은 겹치는 부분이 큽니다. 압축으로 30%를 줄인 스타일시트도 gzip 후에는 몇 %밖에 줄지 않을 수 있습니다. 그래서 크기 패널은 브라우저 자체의 gzip(CompressionStream)으로 두 파일을 모두 측정해, 사용자가 실제로 내려받는 크기를 비교할 수 있게 합니다.\n\nCSS와 JS는 Brotli나 gzip으로 전송하는 것이 공백 제거보다 효과가 큽니다. 압축은 파싱 비용과 요청 크기를 줄이고, 전송 압축은 실제 다운로드 크기를 줄입니다.',
      },
    ],
    faq: [
      {
        q: '압축한 CSS와 JavaScript를 그대로 배포해도 되나요?',
        a: '네. CSS는 문자열·url()·사용자 지정 속성 값을 그대로 두고, 선택자 두 토큰 사이의 공백은 하위 요소 선택자라서 지우지 않습니다. JavaScript는 줄바꿈을 유지하므로 자동 세미콜론 삽입이 원본과 같게 동작합니다. 문자열 리터럴이 순서대로 남았는지도 확인하고, 달라지면 결과를 거부합니다.',
      },
      {
        q: '얼마나 작아지나요?',
        a: '주석과 들여쓰기가 있는 손으로 쓴 코드에서 CSS는 보통 15~40%, JavaScript는 15~35% 줄어듭니다. 파서를 쓰는 정식 압축기는 변수 이름 변경과 죽은 코드 제거로 더 줄일 수 있으니 마지막 몇 %가 필요하면 terser·esbuild·SWC를 쓰세요. gzip 후에는 차이가 몇 %로 줄어드는 경우가 많아 크기 패널에 두 숫자를 함께 표시합니다.',
      },
      {
        q: '/*! 라이선스 주석은 남나요?',
        a: '기본으로 남습니다. /*! 로 시작하는 주석은 라이선스로 보고 CSS와 JavaScript 모두에서 유지합니다. 저작자 표시를 반드시 남겨야 하는 파일에 필요합니다. 옵션을 끄면 함께 지웁니다.',
      },
      {
        q: '잘못된 코드는 어떻게 되나요?',
        a: '닫히지 않은 문자열이나 짝이 맞지 않는 중괄호를 만나면 압축을 중단하고 원본을 그대로 돌려주며 이유를 알립니다. 문자열 리터럴이 달라지는 경우에도 같습니다. 깨진 코드를 추측해서 고치지 않습니다. 압축기가 사이트를 망가뜨리는 방식이 바로 그 추측이기 때문입니다.',
      },
      {
        q: '여러 파일을 한 번에 압축할 수 있나요?',
        a: '한 번에 한 파일입니다. 파일마다 따로 붙여넣거나, 여러 파일이라면 정식 압축기가 있는 빌드 도구를 쓰세요. 여기서 서로 다른 파일을 이어 붙이면 @charset 두 개나 "use strict" 두 개가 합쳐져 빌드 결과와 달라질 수 있습니다.',
      },
      {
        q: '코드가 서버로 전송되나요?',
        a: '아니요. 압축은 이 탭에서 실행되고, 코드는 새로고침해도 남도록 이 브라우저에만 저장됩니다. 내부 주소가 든 CSS나 API 키가 들어간 JavaScript를 다룰 때 중요한 부분입니다.',
      },
    ],
    ui: uiKo,
  },
};
