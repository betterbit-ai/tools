import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  fromLabel: 'From city or IANA time zone',
  toLabel: 'To city or IANA time zone',
  cityHint: 'Search a city in English or Korean, or enter an IANA name such as Europe/London.',
  cityPlaceholder: 'Search city or enter IANA time zone',
  dateLabel: 'Date in the source city',
  timeLabel: 'Time in the source city',
  now: 'Use current time',
  swap: 'Swap cities',
  clockFormat: 'Clock format',
  hours24: '24-hour',
  hours12: '12-hour',
  unknownZone: 'Choose a suggested city or enter a valid IANA time-zone name.',
  invalidTime: 'Enter a valid date and time.',
  nonexistentTime: 'This local clock time does not exist because clocks move forward for daylight saving time.',
  ambiguousTime: 'This clock time occurs twice when daylight saving time ends. The earlier occurrence is shown.',
  fromResult: 'Source time',
  toResult: 'Converted time',
  difference: 'Offset difference',
  dateChange: 'Date change',
  sameDay: 'Same day',
  nextDay: 'Next day',
  previousDay: 'Previous day',
  copy: 'Copy result',
  copied: 'Copied',
  dstTransition: 'A daylight-saving transition is within 36 hours of this time. Check the date before scheduling.',
  private: 'Calculated in this browser. Your dates and cities are not sent anywhere.',
};

export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Time Zone Converter — DST-Aware City Time',
    description:
      'Convert a date and time between cities with current IANA time-zone rules, DST warnings, day-change labels and no sign-up or ads.',
    h1: 'Time Zone Converter',
    tagline: 'Search cities, choose the date, and see the exact local time—including DST and the date change.',
    name: 'Time Zone Converter',
    keywords: [
      'time zone converter',
      'time zone calculator',
      'world time converter',
      'convert time between cities',
      'DST time converter',
      'UTC converter',
    ],
    howTo: [
      'Search for the source city, or enter its IANA time-zone name.',
      'Set the date and clock time that applies in the source city.',
      'Search for the destination city to see its matching local date and time immediately.',
      'Check the UTC offsets and date-change label before sending an invitation.',
      'Use “Swap cities” to start from the converted time in the other city.',
    ],
    sections: [
      {
        heading: 'Why the date is part of a correct conversion',
        body: 'A city does not keep one fixed UTC offset all year. The converter first resolves the date and clock time in the source IANA time zone, then formats that same instant in the destination zone. That is why it can show a previous or next calendar day instead of asking you to do the date-line arithmetic yourself.\n\nUse named zones such as America/New_York or Europe/London for meetings. A bare offset such as UTC−05:00 has no daylight-saving rule, so it is useful only when a fixed offset is actually intended.',
      },
      {
        heading: 'Daylight saving, repeated hours, and unusual offsets',
        body: 'When clocks move forward, a short range of local times never occurs. When they move back, one hour occurs twice. This converter stops on a skipped time and labels a repeated time; for the repeated case it uses the earlier occurrence. It also checks for an offset transition within 36 hours of the selected moment.\n\nOffsets are not always whole hours. India uses UTC+05:30 and Nepal uses UTC+05:45, so rounding a time difference to an hour can be wrong. The offsets shown here come from the time-zone data exposed by your browser’s Intl implementation for the selected instant.',
      },
    ],
    faq: [
      {
        q: 'Does this time zone converter handle daylight saving time?',
        a: 'Yes. The result uses the selected date and the source and destination IANA time zones, so the UTC offset can change when either location observes daylight saving time. A warning appears when an offset transition is within 36 hours of the selected moment.',
      },
      {
        q: 'Why does a local time sometimes not exist?',
        a: 'A local time can be skipped when clocks move forward for daylight saving time. For example, a zone that jumps from 01:59 to 03:00 has no local 02:30 on that date, so the converter asks for a different time instead of silently changing it.',
      },
      {
        q: 'Which occurrence is used when a clock time happens twice?',
        a: 'When clocks move back, the converter uses the earlier of the two matching instants and labels the result as ambiguous. A repeated 01:30 is therefore not treated as a fixed one-hour offset without telling you.',
      },
      {
        q: 'Can I enter an IANA time-zone name instead of a city?',
        a: 'Yes. Enter names such as Asia/Seoul, America/Los_Angeles, or Europe/London. Named IANA zones include regional rules, unlike a fixed value such as UTC+09:00.',
      },
      {
        q: 'Are my meeting times or cities sent to a server?',
        a: 'No. The conversion runs in the browser using its built-in internationalization data. The most recent choices are saved only in this browser so they can be restored after a refresh.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '시차 계산기 — 서머타임 반영 세계 시간 변환',
    description:
      '도시와 날짜를 골라 시차를 바로 계산하세요. 서머타임, 날짜 변경, UTC 오프셋을 브라우저에서 정확히 확인하며 광고와 가입이 없습니다.',
    h1: '시차 계산기',
    tagline: '도시를 검색하고 기준 날짜를 입력하면 서머타임과 날짜 차이까지 바로 확인합니다.',
    name: '시차 계산기',
    keywords: ['시차 계산기', '세계 시간 변환', '시간대 변환기', '미국 한국 시차', '서머타임 계산', 'UTC 시간 변환'],
    howTo: [
      '기준 도시를 검색하거나 IANA 시간대 이름을 입력합니다.',
      '기준 도시에서의 날짜와 시각을 설정합니다.',
      '알고 싶은 도시를 검색하면 그곳의 현지 날짜와 시각이 바로 표시됩니다.',
      'UTC 오프셋과 날짜 변경 표시를 확인한 뒤 약속 시간을 정합니다.',
      '“도시 바꾸기”를 누르면 변환된 시각을 기준으로 다시 계산합니다.',
    ],
    sections: [
      {
        heading: '시차는 날짜마다 달라질 수 있습니다',
        body: '시차는 단순히 도시별 고정 숫자를 빼는 계산이 아닙니다. 이 도구는 기준 도시의 날짜와 시각을 해당 IANA 시간대에서 먼저 해석한 뒤, 같은 순간을 상대 도시 시간으로 표시합니다. 그래서 한국 월요일 오전이 미국 일요일 저녁처럼 날짜가 달라지는 경우도 함께 보여 줍니다.\n\n회의나 항공 일정에는 UTC−05:00처럼 고정 오프셋보다 America/New_York, Europe/London처럼 지역 이름이 붙은 시간대를 사용하세요. 지역 시간대에는 서머타임 규칙이 포함되지만 고정 오프셋에는 포함되지 않습니다.',
      },
      {
        heading: '서머타임 전환일과 30·45분 시차',
        body: '서머타임이 시작되면 일부 현지 시각은 존재하지 않고, 종료되면 한 시간이 두 번 나타납니다. 이 도구는 존재하지 않는 시각을 오류로 알리고, 두 번 나타나는 시각은 더 이른 첫 번째 시각을 사용했다고 표시합니다. 선택한 시각 전후 36시간 안에 전환이 있으면 다시 확인하라는 안내도 보여 줍니다.\n\n시차가 항상 정수 시간인 것도 아닙니다. 인도는 UTC+05:30, 네팔은 UTC+05:45를 사용합니다. 따라서 시간을 한 시간 단위로 반올림하면 약속 시간이 틀릴 수 있습니다. 표시되는 오프셋은 선택한 순간에 브라우저의 Intl 시간대 데이터가 적용한 값입니다.',
      },
    ],
    faq: [
      {
        q: '서머타임이 자동으로 반영되나요?',
        a: '네. 선택한 날짜와 출발·도착 IANA 시간대를 기준으로 계산하므로 서머타임 적용 여부에 따라 UTC 오프셋이 자동으로 바뀝니다. 선택 시각 전후 36시간 안에 전환일이 있으면 안내가 표시됩니다.',
      },
      {
        q: '입력한 현지 시각이 존재하지 않는다는 뜻은 무엇인가요?',
        a: '서머타임 시작 때 시계를 한 시간 앞당기면 그 사이의 현지 시각은 건너뜁니다. 예를 들어 01:59 다음이 03:00인 날에는 02:30이 존재하지 않으므로, 도구가 임의로 보정하지 않고 다른 시각을 입력하도록 안내합니다.',
      },
      {
        q: '시계가 한 시간을 되돌린 날에는 어느 시각으로 계산하나요?',
        a: '서머타임 종료로 같은 시각이 두 번 생기면 이 도구는 더 이른 첫 번째 시각을 사용하고, 결과에 중복 시각임을 표시합니다. 따라서 01:30을 고정된 한 가지 UTC 오프셋으로 조용히 처리하지 않습니다.',
      },
      {
        q: '도시 대신 IANA 시간대 이름을 입력할 수 있나요?',
        a: '네. Asia/Seoul, America/Los_Angeles, Europe/London처럼 입력할 수 있습니다. 지역 규칙이 포함된 IANA 시간대는 UTC+09:00 같은 고정 오프셋보다 일정 조율에 적합합니다.',
      },
      {
        q: '입력한 시간과 도시는 서버로 전송되나요?',
        a: '아니요. 변환은 브라우저에 내장된 국제화 데이터로 처리됩니다. 최근 선택값은 새로고침 후 복원할 수 있도록 현재 브라우저의 로컬 저장소에만 보관됩니다.',
      },
    ],
    ui: {
      fromLabel: '기준 도시 또는 IANA 시간대',
      toLabel: '변환할 도시 또는 IANA 시간대',
      cityHint: '한국어·영문 도시를 검색하거나 Europe/London 같은 IANA 이름을 입력하세요.',
      cityPlaceholder: '도시 검색 또는 IANA 시간대 입력',
      dateLabel: '기준 도시의 날짜',
      timeLabel: '기준 도시의 시각',
      now: '현재 시각 사용',
      swap: '도시 바꾸기',
      clockFormat: '시계 형식',
      hours24: '24시간제',
      hours12: '12시간제',
      unknownZone: '추천 도시를 선택하거나 올바른 IANA 시간대 이름을 입력하세요.',
      invalidTime: '올바른 날짜와 시각을 입력하세요.',
      nonexistentTime: '서머타임 시작으로 시계가 앞으로 이동해 이 현지 시각은 존재하지 않습니다.',
      ambiguousTime: '서머타임 종료로 이 시각이 두 번 나타납니다. 더 이른 첫 번째 시각을 표시합니다.',
      fromResult: '기준 시각',
      toResult: '변환된 시각',
      difference: 'UTC 오프셋 차이',
      dateChange: '날짜 차이',
      sameDay: '같은 날',
      nextDay: '다음 날',
      previousDay: '전날',
      copy: '결과 복사',
      copied: '복사됨',
      dstTransition:
        '선택한 시각 전후 36시간 안에 서머타임 전환이 있습니다. 일정을 정하기 전에 날짜를 다시 확인하세요.',
      private: '브라우저에서만 계산합니다. 날짜와 도시는 어디에도 전송되지 않습니다.',
    },
  },
};
