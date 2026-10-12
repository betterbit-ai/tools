import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  timestampLabel: 'Unix timestamp',
  timestampHint: 'Paste an integer timestamp. Results update as you type.',
  timestampPlaceholder: '1704067200',
  unitLabel: 'Input unit',
  unitHint: 'Auto treats up to 10 significant digits as seconds; choose a unit when the source is known.',
  auto: 'Auto',
  secondsShort: 'Seconds',
  millisecondsShort: 'Milliseconds',
  dateTimeLabel: 'Date and time',
  dateTimeHint: 'Edit a date to create a Unix timestamp; the selected zone controls how this field is read.',
  interpretationLabel: 'Interpret date as',
  utc: 'UTC',
  local: 'Device time',
  now: 'Use current time',
  focusHintStart: 'Focus the timestamp field with',
  focusHintEnd: 'when you are not typing in a field.',
  results: 'Converted values',
  detectedUnit: 'Read as',
  seconds: 'Unix seconds',
  milliseconds: 'Unix milliseconds',
  iso: 'ISO 8601 (UTC)',
  displayTime: 'Displayed time',
  utcTime: 'UTC time',
  localTime: 'Device time',
  copy: 'Copy',
  copyAll: 'Copy all values',
  copied: 'Copied',
  empty: 'Enter a Unix timestamp or a valid date and time.',
  invalidTimestamp:
    'Use an integer only: optional + or − sign followed by ASCII digits, with no commas or decimal point.',
  outOfRange: 'This timestamp is outside the JavaScript Date range (about ±275,760 years from 1970).',
  invalidDateTime: 'Choose a valid calendar date and time in the selected interpretation.',
  private: 'Saved only in this browser. Conversion runs locally; nothing is sent to a server.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Unix Timestamp Converter — Seconds, Milliseconds & UTC',
    description:
      'Convert Unix timestamps and dates instantly. Auto-detect seconds or milliseconds, compare UTC with device time, copy every format, and keep inputs only in your browser.',
    h1: 'Unix Timestamp Converter',
    tagline:
      'Paste a Unix timestamp or choose a date; convert both ways with automatic seconds/milliseconds checks and explicit UTC or device time.',
    name: 'Unix Timestamp Converter',
    keywords: [
      'unix timestamp converter',
      'epoch converter',
      'timestamp to date',
      'date to unix timestamp',
      'milliseconds to date',
      'epoch time converter',
    ],
    howTo: [
      'Paste an integer into “Unix timestamp”; the converted seconds, milliseconds, ISO 8601, and readable time appear immediately.',
      'Leave Input unit on “Auto” for ordinary 10-digit seconds and 13-digit milliseconds, or select the known unit to override that convention.',
      'To convert in the other direction, edit “Date and time” and choose whether that clock time means UTC or your device’s local time.',
      'Use “Use current time” to start from the current instant, then copy an individual value or all values together.',
      'Your last inputs stay only in this browser; press / outside a field to focus the timestamp input again.',
    ],
    sections: [
      {
        heading: 'Unix time is an instant, not a time zone',
        body: 'A Unix timestamp is a count from 1970-01-01 00:00:00 UTC, commonly called the Unix epoch. The same integer names the same instant everywhere; a time zone only changes the human-readable clock used to display it. This tool therefore keeps ISO 8601 in UTC and lets you explicitly read a date/time entry as either UTC or this device’s local zone. That distinction matters for strings without an offset: “2024-01-01 09:00” means a different instant in Seoul and New York, while “2024-01-01T00:00:00Z” always means UTC.',
      },
      {
        heading: 'Seconds, milliseconds, and the safe way to detect them',
        body: 'Unix and POSIX tools usually use whole seconds, so current values are 10 digits; JavaScript Date.now() returns milliseconds, which are currently 13 digits. Auto mode follows that common convention: up to 10 significant digits are read as seconds and longer integers as milliseconds. Digit count is a useful hint rather than a permanent specification—Unix seconds become 11 digits in 2286—so this converter always shows the detected unit and provides a manual override. It also preserves the millisecond remainder exactly: 1704067200123 milliseconds is shown as 1704067200.123 seconds, not a rounded floating-point value.',
      },
      {
        heading: 'Range and leap-second limits',
        body: 'The browser Date object used here can represent instants from roughly 275,760 years before to 275,760 years after 1970, and the converter rejects values outside that range instead of silently rounding them. Unix time does not count leap seconds: its scale proceeds as though each UTC day has 86,400 seconds. That is why it is excellent for ordering logs, API events, expiry times, and database values, but it is not a record of every atomic-clock second. For timestamps with microseconds or nanoseconds, retain the original value in the source system because JavaScript Date displays millisecond precision.',
      },
    ],
    faq: [
      {
        q: 'What is a Unix timestamp?',
        a: 'A Unix timestamp is the elapsed count from 1970-01-01 00:00:00 UTC. The common Unix/POSIX form is whole seconds, while JavaScript commonly uses milliseconds; neither form contains a time-zone label.',
      },
      {
        q: 'How can I tell seconds from milliseconds?',
        a: 'Around the present day, a 10-digit integer is usually Unix seconds and a 13-digit integer is usually Unix milliseconds. This converter detects that convention automatically, shows its choice, and lets you force either unit when you know the source format.',
      },
      {
        q: 'Why does the same timestamp show different local and UTC times?',
        a: 'A timestamp identifies one instant, but local time renders that instant with the device’s time-zone offset and daylight-saving rules. UTC is the same worldwide, while the device-time display changes with the browser or operating-system time zone.',
      },
      {
        q: 'Can this converter handle dates before 1970?',
        a: 'Yes. Negative Unix timestamps represent instants before the 1970 epoch; for example, -86400 seconds is 1969-12-31T00:00:00.000Z. Values must still fit the JavaScript Date range of approximately ±275,760 years.',
      },
      {
        q: 'Are my timestamps uploaded or stored on a server?',
        a: 'No. Parsing and conversion run in the browser. The most recent inputs are saved only in this browser’s local storage so they can be restored after a refresh; no account or server request is used.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '유닉스 타임스탬프 변환 — 초·밀리초·UTC',
    description:
      '유닉스 타임스탬프와 날짜를 바로 변환합니다. 초·밀리초를 자동 인식하고 UTC와 기기 시간을 비교하며 모든 형식을 복사할 수 있습니다. 입력값은 브라우저에만 저장됩니다.',
    h1: '유닉스 타임스탬프 변환',
    tagline:
      '타임스탬프를 붙여넣거나 날짜를 골라 양방향으로 변환하고, 초·밀리초 자동 인식과 UTC·기기 시간 기준을 분명하게 확인합니다.',
    name: '유닉스 타임스탬프 변환',
    keywords: [
      '유닉스 타임스탬프 변환',
      '타임스탬프 변환기',
      'epoch 변환',
      'timestamp 날짜 변환',
      '밀리초 날짜 변환',
      '유닉스 시간',
    ],
    howTo: [
      '“유닉스 타임스탬프”에 정수를 붙여넣으면 초·밀리초·ISO 8601·읽기 쉬운 시간이 바로 나옵니다.',
      '일반적인 10자리 초와 13자리 밀리초 값은 “자동”으로 두거나, 출처의 단위를 알면 직접 선택합니다.',
      '반대로 변환하려면 “날짜와 시간”을 고치고 그 시각을 UTC로 읽을지 현재 기기 시간대로 읽을지 선택합니다.',
      '“현재 시각 사용”으로 지금 시각을 채운 뒤, 필요한 값 하나 또는 전체 값을 복사합니다.',
      '마지막 입력값은 이 브라우저에만 남고, 입력 칸 밖에서는 / 키로 타임스탬프 칸에 다시 초점을 맞춥니다.',
    ],
    sections: [
      {
        heading: '유닉스 시간은 시간대가 아니라 한 순간을 나타냅니다',
        body: '유닉스 타임스탬프는 1970-01-01 00:00:00 UTC부터 센 값으로, 유닉스 에포크라고도 합니다. 정수 하나는 전 세계에서 같은 순간을 뜻하고 시간대는 그 순간을 몇 시로 표시할지만 바꿉니다. 그래서 이 도구는 ISO 8601 값을 항상 UTC로 보여 주고, 날짜·시간을 입력할 때는 그 시각을 UTC로 해석할지 현재 기기 시간대로 해석할지 직접 고르게 합니다. 예를 들어 시간대가 없는 “2024-01-01 09:00”은 서울과 뉴욕에서 서로 다른 순간이지만, 끝에 Z가 붙은 “2024-01-01T00:00:00Z”는 언제나 UTC입니다.',
      },
      {
        heading: '초와 밀리초는 자릿수로 추정하되 확인해야 합니다',
        body: 'Unix·POSIX 명령은 보통 초 단위 정수를 쓰므로 현재 값은 10자리이고, JavaScript의 Date.now()는 밀리초를 반환하므로 현재 값은 13자리입니다. 자동 모드는 이 관례에 따라 유효 자릿수가 10자리 이하이면 초, 그보다 길면 밀리초로 읽습니다. 다만 자릿수는 영구적인 규격이 아닙니다. 유닉스 초는 2286년에 11자리가 되므로 출처를 아는 경우에는 단위를 직접 선택하는 편이 안전합니다. 이 도구는 읽은 단위를 결과에 표시하고, 1704067200123밀리초처럼 소수점 아래가 필요한 값도 1704067200.123초로 반올림 없이 보여 줍니다.',
      },
      {
        heading: '표현 범위와 윤초는 이렇게 처리합니다',
        body: '이 도구가 사용하는 브라우저 Date 객체는 1970년을 기준으로 약 전후 275,760년 범위의 시간을 표현할 수 있으며, 그 범위를 벗어난 값은 조용히 반올림하지 않고 오류로 알립니다. 유닉스 시간은 윤초를 세지 않고 하루를 86,400초로 계산합니다. 따라서 로그, API 이벤트, 만료 시각, 데이터베이스 값의 순서를 비교하기에는 알맞지만 원자시계의 모든 초를 기록하는 값은 아닙니다. 마이크로초나 나노초 타임스탬프는 JavaScript Date가 밀리초까지만 표시하므로 원본 값도 함께 보관해야 합니다.',
      },
    ],
    faq: [
      {
        q: '유닉스 타임스탬프란 무엇인가요?',
        a: '유닉스 타임스탬프는 1970-01-01 00:00:00 UTC부터 지난 시간을 센 값입니다. Unix·POSIX에서는 보통 초 단위를 쓰고 JavaScript에서는 밀리초를 많이 쓰며, 숫자 자체에는 시간대 정보가 들어 있지 않습니다.',
      },
      {
        q: '초 단위와 밀리초 단위는 어떻게 구분하나요?',
        a: '현재 시점에서는 10자리 정수가 대체로 초, 13자리 정수가 대체로 밀리초입니다. 이 도구는 그 관례를 자동으로 인식해 결과에 표시하고, 출처의 형식을 알고 있으면 단위를 직접 고를 수 있습니다.',
      },
      {
        q: '같은 타임스탬프가 UTC와 기기 시간에서 왜 다르게 보이나요?',
        a: '타임스탬프는 한 순간을 가리키지만 기기 시간은 브라우저나 운영체제의 시간대 오프셋과 서머타임 규칙을 적용해 표시합니다. UTC 표시는 전 세계에서 같고 기기 시간 표시는 설정된 시간대에 따라 달라집니다.',
      },
      {
        q: '1970년 이전 날짜도 변환할 수 있나요?',
        a: '네. 1970년 이전 시점은 음수 유닉스 타임스탬프로 표현합니다. 예를 들어 -86400초는 1969-12-31T00:00:00.000Z이며, 약 전후 275,760년인 JavaScript Date 범위 안에서는 변환할 수 있습니다.',
      },
      {
        q: '입력한 타임스탬프가 서버로 전송되나요?',
        a: '아니요. 파싱과 변환은 모두 브라우저 안에서 처리합니다. 마지막 입력값은 새로고침 뒤에도 쓸 수 있도록 이 브라우저의 로컬 저장소에만 남고, 계정이나 서버 요청에는 사용하지 않습니다.',
      },
    ],
    ui: {
      timestampLabel: '유닉스 타임스탬프',
      timestampHint: '정수 타임스탬프를 붙여넣으면 입력하는 즉시 결과가 바뀝니다.',
      timestampPlaceholder: '1704067200',
      unitLabel: '입력 단위',
      unitHint: '자동은 유효 자릿수 10자리 이하를 초로 읽습니다. 출처를 알면 단위를 직접 선택하세요.',
      auto: '자동',
      secondsShort: '초',
      millisecondsShort: '밀리초',
      dateTimeLabel: '날짜와 시간',
      dateTimeHint: '날짜를 고치면 유닉스 타임스탬프로 바뀝니다. 아래 기준이 이 값을 해석하는 방식입니다.',
      interpretationLabel: '날짜·시간 기준',
      utc: 'UTC',
      local: '기기 시간',
      now: '현재 시각 사용',
      focusHintStart: '입력 칸 밖에서는',
      focusHintEnd: '키로 타임스탬프 칸에 초점을 맞춥니다.',
      results: '변환 결과',
      detectedUnit: '읽은 단위',
      seconds: '유닉스 초',
      milliseconds: '유닉스 밀리초',
      iso: 'ISO 8601 (UTC)',
      displayTime: '표시 시간',
      utcTime: 'UTC 시간',
      localTime: '기기 시간',
      copy: '복사',
      copyAll: '전체 값 복사',
      copied: '복사됨',
      empty: '유닉스 타임스탬프 또는 올바른 날짜와 시간을 입력하세요.',
      invalidTimestamp: '쉼표나 소수점 없이 선택적인 + 또는 − 기호와 ASCII 숫자로만 입력하세요.',
      outOfRange: '이 값은 JavaScript Date 범위(1970년 기준 약 전후 275,760년)를 벗어납니다.',
      invalidDateTime: '선택한 기준에서 올바른 달력 날짜와 시간을 고르세요.',
      private: '입력값은 이 브라우저에만 저장됩니다. 변환은 기기에서 처리되며 서버로 전송되지 않습니다.',
    },
  },
};
