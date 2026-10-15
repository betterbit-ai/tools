import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  directionLabel: 'Direction',
  encode: 'Encode',
  decode: 'Decode',
  scopeLabel: 'Encoding scope',
  scopeComponent: 'Component',
  scopeUrl: 'Whole URL',
  scopeForm: 'Form value',
  inputLabel: 'Input',
  inputHint: 'Updates as you type. Your text stays in this browser.',
  inputPlaceholder: 'Paste text, a URL, or a query string…',
  outputLabel: 'Result',
  outputHint: 'Copy the converted result or swap it back into the input.',
  copy: 'Copy result',
  copied: 'Copied',
  swap: 'Use result as input',
  clear: 'Clear',
  autosaved: 'Saved only in this browser',
  inputCharacters: 'Input characters',
  outputCharacters: 'Result characters',
  errorInvalidPercent: 'The percent sign at character {index} must be followed by two hexadecimal digits.',
  errorInvalidUtf8: 'This is not valid UTF-8 percent-encoded text.',
  queryTableLabel: 'Query parameters',
  queryTableHint: 'Edit decoded names and values; the URL is rebuilt with form-style encoding.',
  addParameter: 'Add parameter',
  queryEmpty: 'This URL has an empty query string. Add a parameter to build it here.',
  parameterName: 'Name',
  parameterValue: 'Value',
  removeParameter: 'Remove',
  sampleInput: 'https://example.com/search?q=hello world&lang=한국어',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'URL Encode & Decode — Editable Query Table',
    description:
      'Encode or decode URL values, complete links, and HTML form data instantly. Inspect each query parameter in an editable table and rebuild the URL locally.',
    h1: 'URL Encoder & Decoder',
    tagline:
      'Percent-encode a value or full link, then inspect and edit its query parameters without sending the URL anywhere.',
    name: 'URL Encoder',
    keywords: [
      'url encode decode',
      'url encoder',
      'url decoder',
      'percent encoding',
      'query string parser',
      'encodeURIComponent',
    ],
    howTo: [
      'Choose Encode to make text safe for a URL, or Decode to read percent-encoded text.',
      'Choose Component for one value, Whole URL to preserve link separators, or Form value when spaces must become `+`.',
      'Paste or type the input. The result changes immediately and remains only in this browser.',
      'When the input has a query string, edit its decoded names and values in the Query parameters table; the rebuilt URL replaces the input.',
      'Copy the result, or choose Use result as input to check the reverse conversion.',
    ],
    sections: [
      {
        heading: 'Choose the scope before encoding',
        body: 'A URL component is one piece of data: a search term, redirect target, path segment, or query value. In that situation `&`, `=`, `?`, `/`, and `#` must be encoded so they cannot become URL separators. Component mode follows RFC 3986 and encodes those reserved characters; for example, `a&b=c` becomes `a%26b%3Dc`.\n\nWhole URL mode is for a complete address that already has structure. It keeps delimiters such as `:`, `/`, `?`, `&`, `=`, and `#` readable while encoding spaces and Unicode text. It should not be used for one query value, because an unencoded `&` or `=` inside that value would change the meaning of the link.',
      },
      {
        heading: 'Percent encoding and form encoding are not identical',
        body: 'RFC 3986 defines a percent-encoded byte as `%` followed by two hexadecimal digits, so a space is `%20`. It reserves characters such as `?`, `&`, and `=` because they delimit parts of a URI; the unreserved set is letters, digits, `-`, `.`, `_`, and `~`. Unicode text is first represented as UTF-8 bytes, which is why Korean and emoji use several `%XX` sequences.\n\nHTML forms use the related `application/x-www-form-urlencoded` convention. In a form value, a space becomes `+`, and a literal plus sign must be `%2B`. Query tables use that convention because it matches ordinary form-generated query strings. Decode errors are shown instead of guessed: a percent sign must have exactly two hexadecimal digits, and those bytes must form valid UTF-8.',
      },
      {
        heading: 'Inspect query values without breaking delimiters',
        body: 'A query string begins after `?`; `&` separates parameters and the first `=` separates each name from its value. The editable table decodes those names and values individually, so a value such as `redirect=https%3A%2F%2Fexample.com%2Fnext%3Fa%3D1%26b%3D2` is readable without turning its embedded `&` into a new outer parameter.\n\nEditing a row rebuilds the query with form-style escaping and preserves the base URL and fragment after `#`. A parameter written without `=` is retained as a name-only parameter until you enter a value. This is useful for checking UTM links, OAuth redirect URLs, and API requests before copying the corrected address.',
      },
    ],
    faq: [
      {
        q: 'What is URL encoding?',
        a: 'URL encoding, also called percent encoding, represents bytes that are unsafe or ambiguous in a URI as `%` plus two hexadecimal digits. A space is `%20`, an ampersand inside a value is `%26`, and UTF-8 text such as Korean or emoji becomes a sequence of encoded bytes.',
      },
      {
        q: 'Should I use Component or Whole URL mode?',
        a: 'Use Component mode for one query value, redirect value, or path segment because it escapes separators such as `&`, `=`, `?`, and `/`. Use Whole URL mode only for a complete address whose `https:`, `/`, `?`, `&`, and `=` separators must stay readable.',
      },
      {
        q: 'Why does a space sometimes decode from + instead of %20?',
        a: 'A plus sign means a space only in the `application/x-www-form-urlencoded` convention used by HTML forms and common query strings. In ordinary URI percent encoding, `%20` is a space and `+` is a literal plus unless a form decoder is selected.',
      },
      {
        q: 'Why does URL decoding report an error?',
        a: 'Every percent escape needs exactly two hexadecimal digits, such as `%2F`; a lone `%` or `%2` cannot be decoded. The encoded byte sequence must also be valid UTF-8, so incomplete multibyte text is rejected instead of being silently corrupted.',
      },
      {
        q: 'Does this URL encoder upload my link or token?',
        a: 'No. Encoding, decoding, query parsing, and browser-only saved input all run in this tab. The tool makes no server request for what you paste, so a URL containing a token or redirect parameter remains on your device.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'URL 인코딩·디코딩 — 쿼리 파라미터 편집',
    description:
      'URL과 쿼리 문자열을 즉시 인코딩·디코딩하세요. 파라미터를 표에서 읽고 고치면 URL을 다시 만들며, 입력값은 브라우저 밖으로 전송되지 않습니다.',
    h1: 'URL 인코딩·디코딩',
    tagline: 'URL 값, 전체 주소, 폼 데이터를 퍼센트 인코딩하고 쿼리 파라미터를 표에서 바로 확인·수정하세요.',
    name: 'URL 인코더',
    keywords: ['url 인코딩', 'url 디코딩', 'url encode decode', '퍼센트 인코딩', '쿼리 스트링 파싱', '쿼리 파라미터'],
    howTo: [
      '값을 URL에 넣으려면 인코딩, `%20` 같은 문자열을 읽으려면 디코딩을 고르세요.',
      '값 하나는 구성 요소, 전체 링크는 전체 URL, 공백을 `+`로 써야 하면 폼 값을 고르세요.',
      '텍스트, URL 또는 쿼리 문자열을 붙여넣으세요. 결과는 입력할 때마다 바로 바뀌고 이 브라우저에만 저장됩니다.',
      '쿼리 문자열이 있으면 쿼리 파라미터 표에서 디코딩된 이름과 값을 수정하세요. URL이 즉시 다시 만들어집니다.',
      '결과를 복사하거나 결과를 입력으로 사용을 눌러 반대 방향 변환도 확인하세요.',
    ],
    sections: [
      {
        heading: '값 하나와 전체 URL은 다르게 인코딩해야 합니다',
        body: 'URL 구성 요소는 검색어, 리디렉션 주소, 경로 한 조각, 쿼리 값처럼 URL 안에 들어갈 데이터 한 부분입니다. 이때 `&`, `=`, `?`, `/`, `#`는 URL 구조를 만드는 문자이므로 값 안에서는 반드시 인코딩해야 합니다. 구성 요소 모드는 RFC 3986 기준으로 이 예약 문자를 인코딩합니다. 예를 들어 `a&b=c`는 `a%26b%3Dc`가 됩니다.\n\n전체 URL 모드는 이미 구조를 가진 주소를 위한 것입니다. `:`, `/`, `?`, `&`, `=`, `#`는 남겨 두고 공백과 유니코드만 인코딩합니다. 쿼리 값 하나에 전체 URL 모드를 쓰면 값 안의 `&`나 `=`가 구분자로 해석되어 링크 뜻이 바뀔 수 있습니다.',
      },
      {
        heading: '퍼센트 인코딩과 폼 인코딩의 공백 표기',
        body: 'RFC 3986에서 퍼센트 인코딩은 `%` 뒤에 16진수 두 자리를 붙이는 방식입니다. 공백은 `%20`이고, `?`, `&`, `=`는 URI 부분을 나누는 예약 문자입니다. 어디서나 그대로 쓸 수 있는 비예약 문자는 영문 대·소문자, 숫자, `-`, `.`, `_`, `~`입니다. 한글이나 이모지는 먼저 UTF-8 바이트열이 되기 때문에 여러 개의 `%XX`로 바뀝니다.\n\nHTML 폼의 `application/x-www-form-urlencoded` 방식은 관련 있지만 다릅니다. 폼 값에서 공백은 `+`이고, 실제 더하기 기호는 `%2B`로 써야 합니다. 쿼리 파라미터 표는 일반적인 폼 쿼리 문자열과 맞추기 위해 이 방식을 사용합니다. `%` 뒤에 두 자리 16진수가 없거나 UTF-8 바이트열이 잘리면 추측하지 않고 오류를 알려줍니다.',
      },
      {
        heading: '중첩된 URL도 파라미터별로 안전하게 확인',
        body: '쿼리 문자열은 `?` 뒤에 오며, `&`는 파라미터를 나누고 첫 `=`는 이름과 값을 나눕니다. 표는 이름과 값을 각각 디코딩해서 보여 주므로 `redirect=https%3A%2F%2Fexample.com%2Fnext%3Fa%3D1%26b%3D2` 같은 리디렉션 값도 바깥쪽 `&`와 섞이지 않고 읽을 수 있습니다.\n\n행을 수정하면 폼 방식으로 다시 인코딩해 URL을 만들고, 기본 주소와 `#` 뒤 프래그먼트는 유지합니다. 처음에 `=` 없이 쓰인 파라미터는 값을 입력하기 전까지 이름만 있는 형태로 유지됩니다. UTM 링크, OAuth 리디렉션 주소, API 요청 주소를 복사하기 전에 점검할 때 유용합니다.',
      },
    ],
    faq: [
      {
        q: 'URL 인코딩(퍼센트 인코딩)이란 무엇인가요?',
        a: 'URL 인코딩은 URI에서 안전하지 않거나 뜻이 겹칠 수 있는 바이트를 `%`와 16진수 두 자리로 바꾸는 방식입니다. 공백은 `%20`, 값 안의 앰퍼샌드는 `%26`이며 한글·이모지는 UTF-8 바이트열로 여러 번 인코딩됩니다.',
      },
      {
        q: '구성 요소와 전체 URL 중 무엇을 골라야 하나요?',
        a: '검색어·쿼리 값·리디렉션 값처럼 한 값만 넣을 때는 `&`, `=`, `?`, `/`를 모두 이스케이프하는 구성 요소를 쓰세요. `https:`와 `/`, `?`, `&`, `=` 구조를 유지해야 하는 완전한 주소에만 전체 URL을 쓰세요.',
      },
      {
        q: '공백이 %20이 아니라 +로 디코딩되는 이유는 무엇인가요?',
        a: 'HTML 폼과 일반적인 쿼리 문자열의 `application/x-www-form-urlencoded` 방식에서는 `+`가 공백을 뜻합니다. 일반 URI 퍼센트 인코딩에서는 `%20`이 공백이고, 폼 디코딩을 선택하지 않으면 `+`는 실제 더하기 기호로 취급됩니다.',
      },
      {
        q: 'URL 디코딩에서 오류가 나는 이유는 무엇인가요?',
        a: '퍼센트 이스케이프는 `%2F`처럼 `%` 뒤에 16진수 두 자리가 꼭 있어야 하므로 `%`나 `%2`만 있으면 해석할 수 없습니다. 또 인코딩된 바이트열은 유효한 UTF-8이어야 해서 잘린 한글·이모지 바이트열도 오류로 표시됩니다.',
      },
      {
        q: 'URL이나 토큰이 서버로 전송되나요?',
        a: '아니요. 인코딩, 디코딩, 쿼리 분석, 브라우저 내 저장은 모두 현재 탭에서 실행되며 붙여넣은 값으로 서버 요청을 만들지 않습니다. 토큰이나 리디렉션 값이 들어간 URL도 기기 밖으로 전송되지 않습니다.',
      },
    ],
    ui: {
      directionLabel: '방향',
      encode: '인코딩',
      decode: '디코딩',
      scopeLabel: '인코딩 범위',
      scopeComponent: '구성 요소',
      scopeUrl: '전체 URL',
      scopeForm: '폼 값',
      inputLabel: '입력',
      inputHint: '입력할 때마다 바뀌며, 텍스트는 이 브라우저에만 남습니다.',
      inputPlaceholder: '텍스트, URL 또는 쿼리 문자열을 붙여넣으세요…',
      outputLabel: '결과',
      outputHint: '변환된 결과를 복사하거나 다시 입력으로 바꿔 보세요.',
      copy: '결과 복사',
      copied: '복사됨',
      swap: '결과를 입력으로 사용',
      clear: '지우기',
      autosaved: '이 브라우저에만 저장됨',
      inputCharacters: '입력 글자 수',
      outputCharacters: '결과 글자 수',
      errorInvalidPercent: '{index}번째 글자의 `%` 뒤에는 16진수 두 자리가 필요합니다.',
      errorInvalidUtf8: '유효한 UTF-8 퍼센트 인코딩 문자열이 아닙니다.',
      queryTableLabel: '쿼리 파라미터',
      queryTableHint: '디코딩된 이름과 값을 고치면 폼 방식으로 다시 인코딩해 URL을 만듭니다.',
      addParameter: '파라미터 추가',
      queryEmpty: '이 URL의 쿼리 문자열이 비어 있습니다. 여기에서 파라미터를 추가해 만드세요.',
      parameterName: '이름',
      parameterValue: '값',
      removeParameter: '삭제',
      sampleInput: 'https://example.com/search?q=hello world&lang=한국어',
    },
  },
};
