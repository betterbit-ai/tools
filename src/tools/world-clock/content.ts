import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  addCity: 'Add city',
  cityLabel: 'City or IANA time zone',
  cityHint: 'Search in English or Korean, then add up to 8 cities.',
  cityPlaceholder: 'Search city or enter Asia/Seoul',
  invalidCity: 'Choose a suggested city or enter a valid IANA time-zone name.',
  cityLimit: 'You can compare up to 8 cities at once.',
  alreadyAdded: 'That city is already in your clock.',
  removeCity: 'Remove city',
  clockFormat: 'Clock format',
  hours24: '24-hour',
  hours12: '12-hour',
  now: 'Today',
  private: 'Live times and saved cities stay in this browser.',
  working: 'Within 09:00–17:00',
  outsideWorking: 'Outside 09:00–17:00',
  meetingPlanner: 'Working-hours overlap',
  meetingHint: 'Shows whole hours when every selected city is within its local 09:00–17:00 workday.',
  plannerDate: 'Reference date',
  referenceCity: 'Times shown in',
  fullOverlap: 'Everyone is within working hours',
  noOverlap: 'No whole-hour overlap on this date. Use the time-zone converter to compare a specific time.',
  availableCount: 'cities within working hours',
  utcOffset: 'UTC offset',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'World Clock — City Times and Meeting Overlap',
    description:
      'See live world time for your cities and find their 09:00–17:00 meeting overlap with local, DST-aware browser calculations.',
    h1: 'World Clock',
    tagline: 'Keep selected cities in view and see the whole-hour window when everyone is within local working hours.',
    name: 'World Clock',
    keywords: [
      'world clock',
      'world time',
      'international time',
      'meeting time planner',
      'multiple time zones',
      'city time',
    ],
    howTo: [
      'Review the default city clocks or search for a city to add.',
      'Use the 12-hour or 24-hour option to match how your team writes times.',
      'Set the reference date in the working-hours overlap section.',
      'Read the highlighted source-city hours when every selected city is between 09:00 and 17:00.',
      'Remove cities you no longer need; the remaining cities are saved in this browser.',
    ],
    sections: [
      {
        heading: 'A world clock is for “now”; an overlap is for planning',
        body: 'A world clock shows the same instant in several places. This page also checks each selected city against a local 09:00–17:00 workday and highlights reference-city hours that work for everyone. The result is a planning aid, not an availability promise: confirm holidays, individual schedules, and the meeting duration with attendees.\n\nFor one exact date and time between two places, use the linked time zone converter. It resolves a source clock time into an instant, which is important around daylight-saving changes and when the local date differs.',
      },
      {
        heading: 'Why city time zones beat abbreviations',
        body: 'Names such as America/New_York and Europe/London carry regional daylight-saving rules. Abbreviations can be ambiguous: CST can refer to North American Central Time or China Standard Time, and IST is used for more than one region. The clocks here use the IANA time-zone data supplied by your browser for the current instant and the selected planning date.\n\nUTC offsets can include minutes rather than whole hours. India is UTC+05:30 and Nepal is UTC+05:45, so a city clock is safer than rounding a remembered difference. A displayed date and weekday also matter because two cities can be on different calendar days at the same instant.',
      },
    ],
    faq: [
      {
        q: 'Does the world clock adjust for daylight saving time?',
        a: 'Yes. Each clock uses its named IANA time zone and the browser’s internationalization data, so its UTC offset changes for the displayed instant or planning date when that city observes daylight saving time.',
      },
      {
        q: 'How does the meeting overlap work?',
        a: 'The overlap highlights whole hours on the selected reference-city date when every selected city has a local time from 09:00 inclusive to 17:00 exclusive. It uses the exact local time-zone rules for that date rather than a fixed hour difference.',
      },
      {
        q: 'Why is there no overlap for my cities?',
        a: 'There is no full overlap when no whole hour falls inside all selected 09:00–17:00 local workdays. Try a different date because daylight saving can shift the result by one hour, or agree which participant will take an early or late meeting.',
      },
      {
        q: 'Are my cities or work-planning choices sent anywhere?',
        a: 'No. Live time formatting and overlap calculations run in the browser. The selected city list is stored only in this browser so it can be restored after a refresh.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '세계 시계 — 도시별 현재 시간과 회의 시간대',
    description:
      '주요 도시의 세계 시간을 실시간으로 보고, 현지 09:00~17:00 업무시간이 겹치는 회의 시간대를 브라우저에서 바로 확인하세요.',
    h1: '세계 시계',
    tagline: '선택한 도시의 현재 시간을 한눈에 보고, 모두의 현지 업무시간이 겹치는 시간을 찾습니다.',
    name: '세계 시계',
    keywords: ['세계 시계', '세계 시간', '세계시간', '해외 현재 시간', '회의 시간대', '시차 비교'],
    howTo: [
      '기본 도시의 현재 시간을 확인하거나 도시를 검색해 추가합니다.',
      '팀에서 사용하는 표기에 맞춰 12시간제 또는 24시간제를 고릅니다.',
      '업무시간 겹침 영역에서 기준 날짜를 설정합니다.',
      '선택한 모든 도시가 현지 09:00~17:00인 기준 도시 시간을 확인합니다.',
      '더 이상 필요 없는 도시는 삭제합니다. 남은 도시는 이 브라우저에만 저장됩니다.',
    ],
    sections: [
      {
        heading: '현재 시각 확인과 회의 시간 찾기는 다릅니다',
        body: '세계 시계는 같은 순간의 여러 도시 시각을 보여 줍니다. 이 페이지는 한 걸음 더 나아가 각 도시의 현지 09:00~17:00 업무시간을 비교하고, 모두에게 맞는 기준 도시 시간대를 표시합니다. 이 결과는 회의 후보를 찾기 위한 것이므로 공휴일, 개인 일정, 회의 길이는 참석자와 별도로 확인해야 합니다.\n\n두 도시 사이의 특정 날짜·시각을 정확히 바꾸려면 연결된 시차 계산기를 사용하세요. 특히 서머타임 전환일이나 날짜가 달라지는 일정은 현지 시각을 하나의 순간으로 해석하는 과정이 중요합니다.',
      },
      {
        heading: '약어 대신 도시 시간대를 쓰는 이유',
        body: 'America/New_York, Europe/London 같은 이름에는 지역별 서머타임 규칙이 들어 있습니다. 반면 CST는 북미 중부 표준시 또는 중국 표준시를 뜻할 수 있고, IST도 여러 지역에서 쓰여 약어만으로는 모호합니다. 이 도구는 현재 시각과 선택한 날짜에 대해 브라우저가 제공하는 IANA 시간대 데이터를 사용합니다.\n\n시차가 꼭 정수 시간인 것도 아닙니다. 인도는 UTC+05:30, 네팔은 UTC+05:45입니다. 외운 시차를 한 시간 단위로 반올림하는 것보다 도시 시계의 날짜·요일·UTC 오프셋을 함께 보는 편이 안전합니다.',
      },
    ],
    faq: [
      {
        q: '세계 시계에 서머타임이 자동으로 반영되나요?',
        a: '네. 각 시계는 도시의 IANA 시간대와 브라우저 국제화 데이터를 사용하므로, 해당 도시가 서머타임을 적용하는 시각 또는 계획 날짜에는 UTC 오프셋이 자동으로 바뀝니다.',
      },
      {
        q: '회의 시간대 겹침은 어떻게 계산하나요?',
        a: '선택한 기준 도시 날짜의 매 정시에 모든 도시가 현지 09:00 이상 17:00 미만인지 확인합니다. 고정 시차가 아니라 해당 날짜의 시간대 규칙을 사용하므로 서머타임이 적용된 결과를 보여 줍니다.',
      },
      {
        q: '겹치는 시간이 없다고 나오면 무엇을 뜻하나요?',
        a: '선택한 도시 모두의 현지 09:00~17:00에 들어가는 정시가 없다는 뜻입니다. 서머타임에 따라 결과가 한 시간 달라질 수 있으므로 날짜를 바꿔 보고, 이른 아침이나 늦은 저녁을 누가 맡을지 합의하는 방법도 있습니다.',
      },
      {
        q: '선택한 도시나 회의 계획 정보가 전송되나요?',
        a: '아니요. 현재 시각 표시와 업무시간 겹침 계산은 브라우저에서 처리됩니다. 선택한 도시 목록은 새로고침 뒤에도 복원할 수 있도록 현재 브라우저의 로컬 저장소에만 보관됩니다.',
      },
    ],
    ui: {
      addCity: '도시 추가',
      cityLabel: '도시 또는 IANA 시간대',
      cityHint: '한국어·영문으로 검색한 뒤 최대 8개 도시를 추가할 수 있습니다.',
      cityPlaceholder: '도시 검색 또는 Asia/Seoul 입력',
      invalidCity: '추천 도시를 선택하거나 올바른 IANA 시간대 이름을 입력하세요.',
      cityLimit: '한 번에 최대 8개 도시를 비교할 수 있습니다.',
      alreadyAdded: '이미 세계 시계에 추가된 도시입니다.',
      removeCity: '도시 삭제',
      clockFormat: '시계 형식',
      hours24: '24시간제',
      hours12: '12시간제',
      now: '오늘',
      private: '현재 시각과 저장한 도시는 이 브라우저 안에만 보관됩니다.',
      working: '현지 09:00~17:00 업무시간',
      outsideWorking: '현지 업무시간 밖',
      meetingPlanner: '업무시간 겹침',
      meetingHint: '선택한 모든 도시가 현지 09:00 이상 17:00 미만인 정시를 표시합니다.',
      plannerDate: '기준 날짜',
      referenceCity: '표시 기준 도시',
      fullOverlap: '모든 도시가 업무시간입니다',
      noOverlap: '이 날짜에는 정시 기준 업무시간 겹침이 없습니다. 특정 시각 비교는 시차 계산기를 사용하세요.',
      availableCount: '도시가 업무시간입니다',
      utcOffset: 'UTC 오프셋',
    },
  },
};
