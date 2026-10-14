import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  intro: 'Create RFC 9562 UUIDs with your browser’s cryptographic random source. Start with one ready-to-copy ID.',
  versionLabel: 'UUID version',
  v4: 'v4 random',
  v7: 'v7 time-ordered',
  v4Description: 'Use for general opaque IDs. It has 122 random bits and does not include a creation time.',
  v7Description: 'Use for database keys and events. Its first 48 bits are the Unix time in milliseconds.',
  countLabel: 'How many',
  countHint: '1–{max} per batch',
  formatLabel: 'Text format',
  formatStandard: 'Standard',
  formatCompact: 'No hyphens',
  formatBraces: '{ Braces }',
  formatUrn: 'URN',
  uppercase: 'Uppercase A–F',
  preset: '{count} UUIDs',
  generate: 'Generate UUIDs',
  shortcut: 'Shortcut',
  shortcutKey: 'G',
  outputLabel: 'Generated UUIDs',
  outputFormatLabel: 'Copy format',
  outputLines: 'Lines',
  outputJson: 'JSON array',
  copy: 'Copy all',
  copied: 'Copied',
  generatedLabel: 'Generated',
  charactersLabel: 'Characters',
  invalidCount: 'Enter a whole number from 1 to 10,000.',
  cryptoError: 'Web Crypto is unavailable in this browser, so secure UUIDs cannot be generated.',
  privacyNote: 'Generated UUIDs and saved options stay in this browser. Nothing is uploaded or sent to a server.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'UUID Generator — v4, v7, Bulk & JSON Output',
    description:
      'Generate RFC 9562 UUID v4 or time-ordered v7 values, up to 10,000 at once. Copy standard, compact, brace, URN, or JSON output — all in your browser.',
    h1: 'UUID Generator',
    tagline: 'Generate secure UUID v4 or sortable v7 IDs in batches, then copy them in the format your code expects.',
    name: 'UUID Generator',
    keywords: [
      'uuid generator',
      'guid generator',
      'uuid v4 generator',
      'uuid v7 generator',
      'bulk uuid generator',
      'generate guid',
    ],
    howTo: [
      'Choose v4 for a random identifier, or v7 when millisecond time ordering is useful for database keys or events.',
      'Enter a quantity from 1 to 10,000 and choose the UUID text format your target system accepts.',
      'Optionally use uppercase letters, then select one UUID per line or a JSON array for copying.',
      'Select “Generate UUIDs” or press G outside an input field to create a fresh batch.',
      'Use “Copy all” to put the entire generated batch on your clipboard.',
    ],
    sections: [
      {
        heading: 'UUID v4 vs. v7: random IDs or time-ordered IDs',
        body: 'RFC 9562 defines a UUID as 128 bits. UUID v4 fills 122 of those bits with random data; the remaining 6 bits identify version 4 and the RFC variant. Use v4 when an identifier should not reveal when it was created. This tool fills those random bits with the browser Web Crypto API, not Math.random().\n\nUUID v7 stores a 48-bit Unix timestamp in milliseconds at the start, followed by 74 random bits and the required version and variant bits. That timestamp prefix means IDs from different milliseconds compare in time order as ordinary UUID strings, which is useful for database and event keys. UUIDs made in the same millisecond can have a random relative order; RFC 9562 allows, but does not require, a counter for stricter within-millisecond monotonicity.',
      },
      {
        heading: 'Four UUID text formats, one underlying 16-byte value',
        body: 'The usual UUID string is 32 hexadecimal characters divided as 8-4-4-4-12, for 36 characters including four hyphens: `550e8400-e29b-41d4-a716-446655440000`. The compact form removes the hyphens for systems that require exactly 32 hexadecimal characters. Brace-wrapped values are commonly accepted by Microsoft-oriented APIs, and `urn:uuid:` is the UUID URN representation defined by RFC 9562.\n\nChanging capitalization, hyphens, braces, or a URN prefix changes only the text representation, not the 128-bit UUID value. Choose the format required by the destination rather than converting it later. For code fixtures and seed data, the JSON array option escapes and wraps the generated values as valid JSON.',
      },
      {
        heading: 'Why this batch generator uses Web Crypto',
        body: 'The browser `crypto.getRandomValues()` API supplies cryptographically strong random values, unlike `Math.random()`. This generator draws a fresh 16-byte random value for every UUID, then explicitly writes the RFC 9562 version and variant bits before formatting it. All generation, formatting, and copying happen in this browser; saved settings are stored only in this browser’s local storage.\n\nUUIDs are identifiers, not access-control secrets. Use v4 or v7 to label records, requests, files, and test data, but use an authorization system and dedicated security tokens for password resets, login sessions, or other credentials.',
      },
    ],
    faq: [
      {
        q: 'What is the difference between UUID v4 and UUID v7?',
        a: 'UUID v4 contains 122 random bits and does not expose a creation time, while UUID v7 stores a 48-bit Unix timestamp in milliseconds followed by 74 random bits. UUID v7 strings therefore sort by time across different milliseconds; v4 is the common choice when ordering is not needed.',
      },
      {
        q: 'Is UUID v7 sortable?',
        a: 'UUID v7 places the Unix time in milliseconds in its first 48 bits, so ordinary string or byte sorting puts values generated in later milliseconds after earlier ones. UUIDs created during the same millisecond use random remaining bits in this tool, so their internal order is not guaranteed.',
      },
      {
        q: 'How many UUIDs can I generate at once?',
        a: 'This UUID generator creates 1 to 10,000 v4 or v7 values in one batch. Copy them as one UUID per line for a spreadsheet or text file, or as a valid JSON array for test fixtures and seed data.',
      },
      {
        q: 'Is a GUID the same as a UUID?',
        a: 'GUID is Microsoft’s name for the same 128-bit identifier format commonly called a UUID. The normal hyphenated representation has 32 hexadecimal characters arranged as 8-4-4-4-12, and this generator can also add braces for systems that expect that notation.',
      },
      {
        q: 'Are UUIDs generated here sent to a server?',
        a: 'No. This generator calls the browser’s Web Crypto API locally, formats the values in the same browser tab, and stores only your selected options in local storage. Generated UUIDs are not uploaded, logged, or sent to a server by this tool.',
      },
      {
        q: 'Can I use a UUID as a password or session token?',
        a: 'A UUID is an identifier rather than an authorization mechanism. UUID v4 and v7 are useful for record IDs, request IDs, and test data, but password resets, login sessions, and similar credentials should use a dedicated token design with appropriate server-side expiry and access controls.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'UUID 생성기 — v4·v7 대량 생성과 JSON 출력',
    description:
      'RFC 9562 UUID v4와 시간순 v7을 한 번에 최대 10,000개 생성합니다. 표준·하이픈 없음·중괄호·URN·JSON 형식으로 브라우저에서 바로 복사합니다.',
    h1: 'UUID 생성기',
    tagline: '보안 난수 기반 UUID v4 또는 시간순 UUID v7을 대량으로 만들고, 필요한 코드 형식으로 바로 복사합니다.',
    name: 'UUID 생성기',
    keywords: ['UUID 생성기', 'GUID 생성기', 'UUID v4 생성', 'UUID v7 생성', 'UUID 대량 생성', 'GUID 만들기'],
    howTo: [
      '일반적인 무작위 식별자는 v4를, DB 기본키나 이벤트처럼 시간순 정렬이 필요한 값은 v7을 선택하세요.',
      '1개부터 10,000개까지의 생성 개수를 입력하고 대상 시스템에 맞는 UUID 문자열 형식을 고르세요.',
      '필요하면 A–F 대문자 표시를 켜고, 줄바꿈 목록 또는 JSON 배열 중 복사 형식을 선택하세요.',
      '“UUID 생성”을 누르거나 입력 칸 밖에서 G 키를 눌러 새 목록을 만드세요.',
      '“전체 복사”를 누르면 생성한 UUID 목록 전체가 클립보드에 들어갑니다.',
    ],
    sections: [
      {
        heading: 'UUID v4와 v7: 무작위 ID와 시간순 ID의 차이',
        body: 'RFC 9562에서 UUID는 128비트 식별자입니다. UUID v4는 이 중 122비트를 난수로 채우고, 나머지 6비트에는 버전 4와 RFC 변형 정보가 들어갑니다. 생성 시각을 드러내지 않아야 하는 일반 식별자에는 v4가 적합합니다. 이 도구는 Math.random()이 아니라 브라우저 Web Crypto API로 난수 비트를 만듭니다.\n\nUUID v7은 앞 48비트에 Unix 시간을 밀리초 단위로 넣고, 74비트의 난수와 필수 버전·변형 비트를 뒤에 채웁니다. 서로 다른 밀리초에 생성된 값은 UUID 문자열 그대로 정렬해도 시간순이므로 DB 키나 이벤트 ID에 유용합니다. 같은 밀리초에 만든 값의 순서는 이 도구에서 난수로 정하므로 보장되지 않습니다. RFC 9562는 더 엄격한 밀리초 내 순서를 위해 카운터를 쓸 수 있지만 필수로 정하지는 않았습니다.',
      },
      {
        heading: '하나의 16바이트 UUID를 네 가지 문자열 형식으로',
        body: '가장 흔한 UUID 표기는 32개의 16진수를 8-4-4-4-12로 나눈 36자 문자열입니다. 예를 들어 `550e8400-e29b-41d4-a716-446655440000`처럼 하이픈 4개가 들어갑니다. 하이픈 없음은 정확히 32자 16진수가 필요한 시스템용이고, 중괄호 표기는 Microsoft 계열 API에서 흔하며, `urn:uuid:`는 RFC 9562의 UUID URN 표기입니다.\n\n대소문자, 하이픈, 중괄호, URN 접두사는 128비트 UUID 값이 아니라 문자열 모양만 바꿉니다. 나중에 손으로 바꾸지 않도록 대상 시스템이 요구하는 형식을 처음부터 선택하세요. JSON 배열은 테스트 픽스처나 시드 데이터에 바로 붙여넣을 수 있는 유효한 JSON으로 출력합니다.',
      },
      {
        heading: '대량 생성에도 Web Crypto를 쓰는 이유',
        body: '브라우저 `crypto.getRandomValues()` API는 Math.random()과 달리 암호학적으로 강한 난수 값을 제공합니다. 이 도구는 UUID 하나마다 새 16바이트 난수를 받고, RFC 9562의 버전과 변형 비트를 명시적으로 설정한 뒤 문자열로 만듭니다. 생성, 형식 변환, 복사는 모두 이 브라우저 안에서 이뤄지며, 선택한 옵션만 이 브라우저의 로컬 저장소에 보관합니다.\n\nUUID는 식별자이지 접근 권한을 부여하는 비밀값이 아닙니다. 레코드, 요청, 파일, 테스트 데이터를 구분할 때 v4 또는 v7을 쓰고, 비밀번호 재설정·로그인 세션·인증 정보에는 만료와 접근 제어를 갖춘 전용 토큰 방식을 사용하세요.',
      },
    ],
    faq: [
      {
        q: 'UUID v4와 UUID v7은 무엇이 다른가요?',
        a: 'UUID v4는 122비트 난수로 만들며 생성 시각을 담지 않습니다. UUID v7은 앞 48비트에 Unix 시간을 밀리초로 넣고 뒤에 74비트 난수를 넣으므로, 서로 다른 밀리초에 생성된 값은 시간순으로 정렬됩니다.',
      },
      {
        q: 'UUID v7은 시간순 정렬이 되나요?',
        a: 'UUID v7은 앞 48비트가 Unix 밀리초 시간이어서 일반 문자열 또는 바이트 정렬로 다른 밀리초에 생성된 값을 시간순으로 정렬할 수 있습니다. 이 도구는 같은 밀리초 안에서는 남은 비트를 난수로 채우므로 그 안의 세부 순서는 보장하지 않습니다.',
      },
      {
        q: 'UUID는 한 번에 몇 개까지 만들 수 있나요?',
        a: '이 UUID 생성기는 v4와 v7을 한 번에 1개부터 10,000개까지 만듭니다. 줄바꿈 목록은 엑셀이나 텍스트 파일에 붙여넣기 좋고, JSON 배열은 테스트 픽스처와 시드 데이터에 바로 쓸 수 있습니다.',
      },
      {
        q: 'GUID와 UUID는 같은 것인가요?',
        a: 'GUID는 Microsoft에서 쓰는 이름이고 UUID는 같은 128비트 식별자의 일반적인 이름입니다. 기본 표기는 32개의 16진수를 8-4-4-4-12로 나눈 형태이며, 이 도구에서는 중괄호로 감싼 GUID 스타일도 만들 수 있습니다.',
      },
      {
        q: '여기서 만든 UUID가 서버로 전송되나요?',
        a: '아니요. 이 도구는 브라우저의 Web Crypto API로 UUID를 기기 안에서 생성하고 같은 탭에서 형식을 바꿉니다. 선택한 옵션만 로컬 저장소에 보관하며, 생성한 UUID는 업로드·기록·서버 전송하지 않습니다.',
      },
      {
        q: 'UUID를 비밀번호나 세션 토큰으로 써도 되나요?',
        a: 'UUID는 레코드 ID, 요청 ID, 테스트 데이터용 식별자이지 권한을 확인하는 장치가 아닙니다. 비밀번호 재설정이나 로그인 세션처럼 보안이 필요한 값에는 서버 측 만료와 접근 제어를 포함한 전용 토큰 설계를 사용해야 합니다.',
      },
    ],
    ui: {
      intro: '브라우저의 암호학적 난수로 RFC 9562 UUID를 만듭니다. 페이지를 열면 바로 복사할 수 있는 ID가 준비됩니다.',
      versionLabel: 'UUID 버전',
      v4: 'v4 무작위',
      v7: 'v7 시간순',
      v4Description: '일반적인 불투명 ID에 사용합니다. 난수 122비트로 만들며 생성 시각을 담지 않습니다.',
      v7Description: 'DB 키와 이벤트에 사용합니다. 앞 48비트가 Unix 시간(밀리초)입니다.',
      countLabel: '생성 개수',
      countHint: '한 번에 1~{max}개',
      formatLabel: '문자열 형식',
      formatStandard: '표준',
      formatCompact: '하이픈 없음',
      formatBraces: '{ 중괄호 }',
      formatUrn: 'URN',
      uppercase: 'A–F 대문자',
      preset: '{count}개',
      generate: 'UUID 생성',
      shortcut: '단축키',
      shortcutKey: 'G',
      outputLabel: '생성된 UUID',
      outputFormatLabel: '복사 형식',
      outputLines: '줄바꿈 목록',
      outputJson: 'JSON 배열',
      copy: '전체 복사',
      copied: '복사됨',
      generatedLabel: '생성됨',
      charactersLabel: '문자 수',
      invalidCount: '1부터 10,000까지의 정수를 입력하세요.',
      cryptoError: '이 브라우저에서는 Web Crypto를 사용할 수 없어 안전한 UUID를 생성할 수 없습니다.',
      privacyNote: '생성한 UUID와 선택한 옵션은 이 브라우저 안에만 있습니다. 서버로 업로드하거나 전송하지 않습니다.',
    },
  },
};
