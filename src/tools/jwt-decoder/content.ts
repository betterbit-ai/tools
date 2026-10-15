import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  inputLabel: 'JWT or Bearer token',
  inputHint: 'Paste a three-part compact JWS token. Decoding happens as you type.',
  inputPlaceholder: 'eyJhbGciOiJ…',
  loadExample: 'Load example',
  clear: 'Clear',
  notSaved: 'Token is not saved',
  focusHintStart: 'Press',
  focusHintEnd: 'to focus the token field.',
  overview: 'Token overview',
  empty: 'Paste a JWT to inspect its header, claims, and time values.',
  errorSegments: 'This is not a compact JWS JWT. It needs exactly three dot-separated parts: header.payload.signature.',
  errorEncrypted:
    'This looks like a five-part encrypted JWE. Its claims need the recipient key and cannot be decoded here.',
  errorTooLong: 'This token is longer than 100,000 characters, so it was not processed in this tab.',
  errorBase64: 'A header or payload part is not valid unpadded Base64URL.',
  errorUtf8: 'A header or payload part is not valid UTF-8 text.',
  errorJson: 'A header or payload part does not contain valid JSON.',
  errorObject: 'JWT headers and payloads must be JSON objects, not arrays or primitive values.',
  statusExpired: 'Expired according to exp. Signature and issuer have not been verified.',
  statusNotActive: 'Not active yet according to nbf. Signature and issuer have not been verified.',
  statusActive: 'Within the exp and nbf time window on this device. Signature and issuer have not been verified.',
  statusNoExpiration: 'No valid exp claim was found. Signature and issuer have not been verified.',
  algorithm: 'Algorithm (alg)',
  type: 'Type (typ)',
  signature: 'Signature',
  signaturePresent: 'Present — not verified',
  signatureEmpty: 'Empty — not verified',
  notAvailable: 'Not provided',
  timeClaims: 'Time claims',
  noTimeClaims: 'No exp, iat, or nbf claims were found.',
  invalidTimeClaim: 'Not a valid NumericDate number',
  utc: 'UTC',
  unverified: 'This reads token data only; it does not verify a signature, issuer, audience, or permissions.',
  header: 'Header',
  payload: 'Payload',
  copy: 'Copy',
  copyAll: 'Copy decoded data',
  copied: 'Copied',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'JWT Decode — Readable Expiry Times',
    description:
      'Decode a JWT in your browser and inspect header, payload, and exp, iat, nbf timestamps as exact local and UTC times. Tokens are not saved.',
    h1: 'JWT Decoder',
    tagline:
      'Paste a JWT or Bearer token to read its claims and live expiry timing without sending or saving the token.',
    name: 'JWT Decoder',
    keywords: [
      'jwt decode',
      'jwt decoder',
      'decode bearer token',
      'jwt expiration checker',
      'jwt exp time',
      'jwt payload decoder',
    ],
    howTo: [
      'Paste a compact JWT or an Authorization value beginning with Bearer into the token field.',
      'Read the decoded header and payload immediately; Copy copies either JSON object without changing the token.',
      'Check exp, iat, and nbf in the Time claims panel for the Unix seconds value, your device time, UTC, and a live relative time.',
      'Treat the result as inspection only: verify the signature, issuer, audience, and permissions in your application or identity provider.',
    ],
    sections: [
      {
        heading: 'What this decoder reads',
        body: 'A common signed JWT uses JWS Compact Serialization: three Base64URL parts joined with two dots (`header.payload.signature`). The header and payload are encoded JSON, so this tool can show them without a secret. The third part is the signature; it is intentionally not decoded as JSON and is never treated as proof that a token is genuine. A five-part value is a JWE (encrypted JWT), whose claims need a recipient key and cannot be read by this decoder.\n\nThis parser accepts the unpadded Base64URL alphabet used by JWS and rejects ordinary padding (`=`), invalid bytes, non-JSON values, and arrays where a JWT object is required. It also accepts a pasted `Bearer ` prefix from an HTTP Authorization header.',
      },
      {
        heading: 'How JWT time claims work',
        body: 'RFC 7519 defines `exp` (expiration), `nbf` (not before), and `iat` (issued at) as NumericDate values: seconds since 1970-01-01T00:00:00Z, ignoring leap seconds. `exp` is an exclusive boundary: at the exact `exp` second, this tool marks the token expired. `nbf` becomes usable at its exact second.\n\nThe Time claims panel keeps the relative display current and also shows an exact device-local time plus UTC, so a timezone or clock mismatch is visible instead of being hidden behind a vague date. A string such as `"exp": "1704067200"` is not a valid NumericDate and is called out rather than silently converted.',
      },
      {
        heading: 'Decoding is not authentication',
        body: 'Base64URL encoding is reversible; it is not encryption. Anyone holding a normal signed JWT can read its header and claims. Conversely, a readable token can be forged or have the wrong issuer, audience, algorithm, or signature. Use this page to troubleshoot token shape and timestamps, then have the service that accepts the token verify it with its trusted key and validation rules.\n\nThe token stays in this page while you inspect it. It is not stored in browser storage, so refreshing or closing the page removes it from this tool.',
      },
    ],
    faq: [
      {
        q: 'Can I decode a JWT without the secret?',
        a: 'Yes. A three-part signed JWT exposes its header and payload as Base64URL-encoded JSON, so decoding does not need a secret. The secret or public key is required to verify the third signature part and decide whether claims can be trusted.',
      },
      {
        q: 'What does exp mean in a JWT?',
        a: '`exp` is the expiration NumericDate in seconds since the Unix epoch (1970-01-01T00:00:00Z). RFC 7519 says a current time equal to or later than `exp` must be rejected, so the exact exp second is already expired.',
      },
      {
        q: 'What are iat and nbf in a JWT?',
        a: '`iat` records when a JWT was issued, while `nbf` is the earliest Unix-second time at which it may be accepted. Both use the same NumericDate seconds format as `exp`; neither one by itself proves the JWT is authentic.',
      },
      {
        q: 'Why can’t this decoder read a five-part token?',
        a: 'A compact JWE has five dot-separated parts and encrypts its claims. Reading it requires the recipient’s decryption key, whereas this decoder only reads the two visible JSON parts of a three-part JWS.',
      },
      {
        q: 'Does decoding prove that a JWT is valid?',
        a: 'No. Decoding only proves that the first two parts can be read as JSON. A valid authentication decision also verifies the signature, expected issuer and audience, time claims, and any application-specific permissions.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'JWT 디코더 — 만료 시간을 읽기 쉽게',
    description:
      'JWT를 브라우저에서 디코딩하고 헤더·페이로드와 exp·iat·nbf를 로컬 시간, UTC, 상대 시간으로 확인합니다. 토큰은 저장하지 않습니다.',
    h1: 'JWT 디코더',
    tagline:
      'JWT 또는 Bearer 토큰을 붙여 넣어 클레임과 만료 시간을 바로 확인합니다. 토큰을 전송하거나 저장하지 않습니다.',
    name: 'JWT 디코더',
    keywords: [
      'jwt 디코더',
      'jwt decode',
      'jwt 디코딩',
      'bearer 토큰 디코딩',
      'jwt 만료 시간 확인',
      'jwt payload 확인',
    ],
    howTo: [
      '토큰 입력란에 점(.)으로 세 부분으로 나뉜 JWT 또는 `Bearer `로 시작하는 Authorization 값을 붙여 넣습니다.',
      '헤더와 페이로드가 즉시 풀립니다. 복사 버튼으로 토큰을 바꾸지 않고 각각의 JSON을 복사할 수 있습니다.',
      '시간 클레임에서 exp·iat·nbf의 Unix 초 값, 기기 시간, UTC, 실시간 상대 시간을 함께 확인합니다.',
      '이 화면은 내용을 읽기만 합니다. 실제 서비스나 ID 공급자에서 서명·발급자·대상·권한을 반드시 검증합니다.',
    ],
    sections: [
      {
        heading: '이 디코더가 읽는 JWT 형식',
        body: '일반적인 서명 JWT는 JWS Compact Serialization 형식으로, `header.payload.signature`처럼 Base64URL 세 부분을 점 두 개로 연결합니다. 헤더와 페이로드는 인코딩된 JSON이어서 비밀키 없이 읽을 수 있습니다. 세 번째 부분은 서명이며 JSON으로 풀지 않고, 화면에 표시됐다는 이유만으로 진짜 토큰이라고 판단하지 않습니다. 점으로 다섯 부분인 값은 암호화 JWT(JWE)라서 수신자 키 없이는 클레임을 읽을 수 없습니다.\n\n이 도구는 JWS에서 쓰는 패딩 없는 Base64URL만 받고, `=` 패딩, 잘못된 바이트, JSON이 아닌 값, 객체가 아닌 배열을 명확히 거절합니다. HTTP Authorization 헤더에서 복사한 `Bearer ` 접두사도 함께 붙여 넣을 수 있습니다.',
      },
      {
        heading: 'JWT 시간 클레임 읽는 법',
        body: 'RFC 7519의 `exp`(만료), `nbf`(유효 시작), `iat`(발급)는 윤초를 제외한 1970-01-01T00:00:00Z부터의 초인 NumericDate입니다. `exp`는 배타적 경계이므로 exp와 정확히 같은 초부터 이 도구는 만료로 표시합니다. `nbf`는 정확히 그 초부터 사용할 수 있습니다.\n\n시간 클레임은 상대 시간만 보여 주지 않고 기기 기준 시각과 UTC를 함께 표시합니다. 시간대나 기기 시계가 맞지 않아 생기는 문제를 바로 비교할 수 있습니다. `"exp": "1704067200"`처럼 문자열로 넣은 값은 NumericDate가 아니므로 숫자로 조용히 바꾸지 않고 오류로 표시합니다.',
      },
      {
        heading: '디코딩은 인증이 아닙니다',
        body: 'Base64URL은 되돌릴 수 있는 인코딩이지 암호화가 아닙니다. 일반적인 서명 JWT를 가진 사람은 누구나 헤더와 클레임을 읽을 수 있습니다. 반대로 읽힌 토큰이라도 위조됐거나 발급자·대상·알고리즘·서명이 맞지 않을 수 있습니다. 이 페이지에서는 형식과 시간을 확인하고, 토큰을 실제로 받는 서비스에서 신뢰하는 키와 검증 규칙으로 판단해야 합니다.\n\n입력한 토큰은 이 페이지 안에서만 처리하고 브라우저 저장소에 남기지 않습니다. 새로고침하거나 페이지를 닫으면 이 도구의 입력도 사라집니다.',
      },
    ],
    faq: [
      {
        q: '비밀키 없이 JWT를 디코딩할 수 있나요?',
        a: '네. 세 부분으로 된 서명 JWT의 헤더와 페이로드는 Base64URL JSON이므로 읽는 데 비밀키가 필요하지 않습니다. 다만 세 번째 서명을 검증하고 클레임을 신뢰하려면 비밀키 또는 공개키가 필요합니다.',
      },
      {
        q: 'JWT의 exp는 무엇인가요?',
        a: '`exp`는 1970-01-01T00:00:00Z부터 센 초 단위 만료 시각(NumericDate)입니다. RFC 7519에 따라 현재 시각이 exp와 같거나 뒤면 거절해야 하므로, exp와 같은 초부터 이미 만료입니다.',
      },
      {
        q: 'JWT의 iat와 nbf는 무엇인가요?',
        a: '`iat`는 JWT 발급 시각이고, `nbf`는 허용되는 가장 이른 시각입니다. 둘 다 exp와 같은 초 단위 NumericDate이며, 이 값만으로 JWT가 진짜라는 뜻은 아닙니다.',
      },
      {
        q: '점으로 다섯 부분인 토큰은 왜 읽을 수 없나요?',
        a: 'Compact JWE는 점으로 다섯 부분을 가지며 클레임을 암호화합니다. 이 도구는 세 부분 JWS의 눈에 보이는 JSON만 읽으므로, JWE는 수신자의 복호화 키가 있어야 내용을 확인할 수 있습니다.',
      },
      {
        q: '디코딩되면 JWT가 유효한 것인가요?',
        a: '아니요. 디코딩은 앞 두 부분을 JSON으로 읽었다는 뜻뿐입니다. 인증에는 서명, 기대하는 발급자와 대상, 시간 클레임, 서비스별 권한을 함께 검증해야 합니다.',
      },
    ],
    ui: {
      inputLabel: 'JWT 또는 Bearer 토큰',
      inputHint: '점(.)으로 세 부분인 JWS 토큰을 붙여 넣으세요. 입력하는 즉시 디코딩합니다.',
      inputPlaceholder: 'eyJhbGciOiJ…',
      loadExample: '예시 불러오기',
      clear: '지우기',
      notSaved: '토큰을 저장하지 않음',
      focusHintStart: '키보드에서',
      focusHintEnd: '를 누르면 토큰 입력란으로 이동합니다.',
      overview: '토큰 요약',
      empty: 'JWT를 붙여 넣으면 헤더, 클레임, 시간 정보를 확인할 수 있습니다.',
      errorSegments:
        'Compact JWS JWT 형식이 아닙니다. header.payload.signature처럼 점으로 구분된 세 부분이 필요합니다.',
      errorEncrypted:
        '점으로 다섯 부분인 암호화 JWE로 보입니다. 클레임을 읽으려면 수신자 키가 필요하므로 여기서는 디코딩할 수 없습니다.',
      errorTooLong: '토큰이 100,000자를 넘어 이 탭의 응답성을 위해 처리하지 않았습니다.',
      errorBase64: '헤더 또는 페이로드에 패딩 없는 Base64URL 형식이 아닌 부분이 있습니다.',
      errorUtf8: '헤더 또는 페이로드에 올바른 UTF-8 텍스트가 아닙니다.',
      errorJson: '헤더 또는 페이로드에 올바른 JSON이 없습니다.',
      errorObject: 'JWT 헤더와 페이로드는 배열이나 단일 값이 아닌 JSON 객체여야 합니다.',
      statusExpired: 'exp 기준으로 만료됐습니다. 서명과 발급자는 검증하지 않았습니다.',
      statusNotActive: 'nbf 기준으로 아직 사용할 수 없습니다. 서명과 발급자는 검증하지 않았습니다.',
      statusActive: '이 기기 시계에서 exp와 nbf 사이에 있습니다. 서명과 발급자는 검증하지 않았습니다.',
      statusNoExpiration: '유효한 exp 클레임이 없습니다. 서명과 발급자는 검증하지 않았습니다.',
      algorithm: '알고리즘 (alg)',
      type: '유형 (typ)',
      signature: '서명',
      signaturePresent: '있음 — 검증하지 않음',
      signatureEmpty: '비어 있음 — 검증하지 않음',
      notAvailable: '없음',
      timeClaims: '시간 클레임',
      noTimeClaims: 'exp, iat, nbf 클레임이 없습니다.',
      invalidTimeClaim: '유효한 NumericDate 숫자가 아닙니다',
      utc: 'UTC',
      unverified: '이 도구는 토큰 내용을 읽을 뿐 서명·발급자·대상·권한을 검증하지 않습니다.',
      header: '헤더',
      payload: '페이로드',
      copy: '복사',
      copyAll: '디코딩 데이터 복사',
      copied: '복사됨',
    },
  },
};
