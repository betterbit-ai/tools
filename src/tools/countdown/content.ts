import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  event: 'Event name',
  eventHint: 'Optional — saved only in this browser and in a link you choose to share.',
  eventPlaceholder: 'Wedding, exam, launch…',
  date: 'Target date',
  time: 'Target time',
  timeHint: 'Leave blank to count down to the start of that local date.',
  presets: 'Quick events',
  newYear: 'New Year',
  valentine: "Valentine's Day",
  christmas: 'Christmas',
  days: 'Days',
  hours: 'Hours',
  minutes: 'Minutes',
  seconds: 'Seconds',
  dday: 'Calendar D-day',
  until: 'until',
  elapsed: 'Elapsed since',
  targetReached: 'The target time has arrived.',
  invalidDate: 'Choose a valid calendar date and time.',
  share: 'Copy share link',
  copied: 'Link copied',
  reset: 'Reset',
  shareHint: 'The link contains this event’s name, date and time. Nothing is saved on a server.',
  refresh: 'Refresh countdown',
  keyboard: 'Refresh',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Countdown to Date — Shareable Event Timer',
    description:
      'Count down to any date and time with a live D-day display. Copy a shareable link with your event details—no ads, sign-up, or server-stored event.',
    h1: 'Countdown to Date',
    tagline: 'Set a moment, watch it update every second, and share the exact event in one privacy-friendly link.',
    name: 'Countdown',
    keywords: [
      'countdown to date',
      'date countdown',
      'days until',
      'event countdown',
      'D-day calculator',
      'countdown clock',
    ],
    howTo: [
      'Name the event if you want the label shown in the countdown and its link.',
      'Choose the target date and optionally add a local time.',
      'Read the live days, hours, minutes and seconds remaining, plus the calendar D-day.',
      'Choose New Year, Valentine’s Day or Christmas to set the next occurrence immediately.',
      'Copy the share link to open the same name, date and time on another device.',
    ],
    sections: [
      {
        heading: 'A live countdown and a calendar D-day answer different questions',
        body: 'The large display counts down to one exact local moment: 2026-12-25 at 09:00 is different from midnight on the same date. The D-day label separately compares calendar dates, so a target tomorrow is D-1 even if it is only a few hours away. On the target date it reads D-Day, and after it passes it becomes D+1, D+2 and so on. The two readings are useful together because a deadline can be on the next calendar day while its exact time is much closer.',
      },
      {
        heading: 'Why the number stays correct after a background tab pauses',
        body: 'Browsers are allowed to slow down background tabs. A timer that subtracts one second for each screen update can drift when that happens. This countdown instead stores the selected target time and compares it with your device clock every time it redraws, so returning to a sleeping tab does not add extra time. The displayed value is only as accurate as the clock on the device running it; it is not an official source for legal, financial or safety-critical deadlines.',
      },
      {
        heading: 'What a share link includes',
        body: 'Copying a link puts the event name, date and optional time in the URL itself. Opening that URL fills the same values without an account, database entry or server-side event. Anyone with the link can read those values, so do not put confidential information in the event name. The date and time are interpreted in the viewer’s local time; use a time-zone-specific calendar invitation for an event that must happen at one identical instant worldwide.',
      },
    ],
    faq: [
      {
        q: 'How is D-day calculated?',
        a: 'Calendar D-day is target date minus today’s local calendar date. Today is D-Day, tomorrow is D-1, and the day after a target date is D+1. It does not count the current partial day as a full 24-hour interval.',
      },
      {
        q: 'Does the countdown keep running when I switch tabs?',
        a: 'Yes. The screen may redraw less often in a background tab, but every update compares the target with the current device time. When you return, the remaining days, hours, minutes and seconds are recalculated rather than ticked down slowly.',
      },
      {
        q: 'What does the share link save?',
        a: 'The share link contains only the event name, date and optional time as URL parameters. This tool does not create an account, send those values to a server, or keep a remotely stored countdown that you need to manage.',
      },
      {
        q: 'Which time zone does this countdown use?',
        a: 'The selected date and time use the local time zone of the device viewing the page. A link opened in another time zone counts down to that viewer’s same wall-clock date and time, which suits birthdays and local holidays.',
      },
      {
        q: 'Do leap years and daylight-saving changes affect D-day?',
        a: 'The calendar D-day compares calendar dates, so February 29 and daylight-saving changes do not create an extra or missing D-day. The live clock uses the actual local target moment, so a daylight-saving change can change the elapsed hours before that moment.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '디데이 계산기 — 공유 링크 되는 카운트다운',
    description:
      '목표 날짜와 시간까지 남은 시간을 초 단위로 보여 주는 디데이 계산기입니다. 일정 이름·날짜·시간을 담은 공유 링크를 만들며, 광고·가입·서버 저장이 없습니다.',
    h1: '디데이 카운트다운',
    tagline: '날짜와 시간을 정하면 D-day와 남은 시간을 바로 계산하고, 같은 일정을 링크 하나로 공유합니다.',
    name: '디데이 카운트다운',
    keywords: ['디데이 계산기', '디데이', 'D-day', '날짜 카운트다운', '며칠 남았지', 'countdown to date'],
    howTo: [
      '일정 이름을 입력하면 결과와 공유 링크에 함께 표시됩니다.',
      '목표 날짜를 고르고, 시각까지 중요하면 시간을 입력합니다.',
      'D-day와 남은 일·시·분·초를 바로 확인합니다.',
      '새해, 발렌타인데이, 크리스마스 버튼을 누르면 다음 날짜가 자동으로 들어갑니다.',
      '공유 링크 복사를 누르면 같은 일정이 열리는 주소를 복사합니다.',
    ],
    sections: [
      {
        heading: 'D-day와 남은 시간은 기준이 다릅니다',
        body: '큰 숫자는 선택한 시각까지 남은 실제 시간을 일·시·분·초로 보여 줍니다. 반면 D-day는 달력 날짜만 비교합니다. 내일이 목표일이면 남은 시간이 몇 시간뿐이어도 D-1이고, 목표일 당일에는 D-Day입니다. 목표일이 지나면 다음 날부터 D+1로 표시합니다. 마감처럼 시각이 중요한 일정과 시험·여행처럼 날짜가 중요한 일정을 함께 확인할 수 있도록 두 값을 나란히 보여 줍니다.',
      },
      {
        heading: '다른 탭을 보고 있어도 남은 시간이 밀리지 않습니다',
        body: '브라우저는 배터리를 아끼기 위해 백그라운드 탭의 화면 갱신을 늦출 수 있습니다. 화면이 바뀔 때마다 1초씩 빼는 방식은 이때 시간이 늦어질 수 있습니다. 이 도구는 목표 시각과 현재 기기 시각을 매번 비교해서 남은 시간을 다시 계산합니다. 따라서 탭을 오래 열어 두거나 다른 탭을 본 뒤 돌아와도 시간은 누적해서 밀리지 않습니다. 표시의 정확도는 사용 중인 기기 시계에 따릅니다.',
      },
      {
        heading: '공유 링크에는 무엇이 들어가나요?',
        body: '공유 링크 복사를 누르면 일정 이름, 날짜, 선택한 시간이 주소에 들어갑니다. 링크를 연 사람은 계정이나 별도 저장 없이 같은 입력값을 바로 볼 수 있습니다. 주소를 아는 사람은 일정 이름도 읽을 수 있으므로 민감한 정보는 이름에 쓰지 않는 것이 좋습니다. 이 도구는 서버에 일정을 저장하지 않으며, 나라가 다른 사람이 같은 순간을 맞춰야 하는 행사라면 시간대가 지정된 캘린더 초대를 사용하세요.',
      },
    ],
    faq: [
      {
        q: '디데이는 어떻게 계산하나요?',
        a: '디데이는 목표 날짜에서 오늘의 현지 날짜를 뺀 값입니다. 오늘은 D-Day, 내일은 D-1, 목표일 다음 날은 D+1입니다. 현재 시각부터 24시간이 지났는지를 기준으로 세지 않습니다.',
      },
      {
        q: '다른 탭으로 이동해도 카운트다운이 정확한가요?',
        a: '네. 백그라운드에서 화면 갱신이 늦어질 수는 있지만, 갱신할 때마다 목표 시각과 현재 기기 시각의 차이를 다시 계산합니다. 돌아왔을 때 남은 시간이 천천히 줄어든 것처럼 누적되지 않습니다.',
      },
      {
        q: '공유 링크를 만들면 일정이 서버에 저장되나요?',
        a: '아니요. 공유 링크에는 일정 이름, 날짜, 선택한 시간만 URL 파라미터로 들어갑니다. 계정을 만들거나 서버에 일정을 저장하지 않으므로 주소를 가진 사람만 그 입력값을 열 수 있습니다.',
      },
      {
        q: '공유 링크를 다른 나라에서 열면 어떻게 되나요?',
        a: '입력한 날짜와 시간은 링크를 보는 기기의 현지 시각으로 해석됩니다. 생일·크리스마스처럼 각 지역의 같은 시각에 맞는 일정에는 알맞지만, 전 세계가 한 순간에 시작하는 온라인 행사는 시간대가 있는 캘린더 초대를 사용해야 합니다.',
      },
      {
        q: '윤년이나 서머타임이 있으면 디데이가 달라지나요?',
        a: 'D-day는 달력 날짜를 비교하므로 2월 29일과 서머타임이 D-day 숫자를 하루 바꾸지 않습니다. 다만 실제 시각까지의 남은 시간은 서머타임 전환에 따라 1시간 차이 날 수 있습니다.',
      },
    ],
    ui: {
      event: '일정 이름',
      eventHint: '선택 사항입니다. 이 브라우저와 직접 공유하는 링크에만 사용됩니다.',
      eventPlaceholder: '수능, 여행, 마감일…',
      date: '목표 날짜',
      time: '목표 시간',
      timeHint: '비워 두면 해당 날짜가 시작되는 0시까지 계산합니다.',
      presets: '빠른 일정',
      newYear: '새해',
      valentine: '발렌타인데이',
      christmas: '크리스마스',
      days: '일',
      hours: '시간',
      minutes: '분',
      seconds: '초',
      dday: '달력 기준 디데이',
      until: '까지',
      elapsed: '경과 시간',
      targetReached: '목표 시각이 되었습니다.',
      invalidDate: '올바른 날짜와 시간을 선택하세요.',
      share: '공유 링크 복사',
      copied: '링크 복사됨',
      reset: '초기화',
      shareHint: '링크에는 일정 이름, 날짜, 시간이 들어갑니다. 서버에는 저장하지 않습니다.',
      refresh: '카운트다운 새로고침',
      keyboard: '새로고침',
    },
  },
};
