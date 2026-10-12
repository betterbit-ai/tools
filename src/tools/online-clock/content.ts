import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  currentTime: 'Current time',
  format: 'Time format',
  format24: '24-hour',
  format12: '12-hour',
  showSeconds: 'Show seconds',
  showDate: 'Show date',
  fullScreen: 'Full screen',
  exitFullScreen: 'Exit full screen',
  copyTime: 'Copy time',
  copied: 'Copied',
  settings: 'Display settings',
  timeZone: 'Time zone',
  utcOffset: 'UTC offset',
  deviceClock: 'Device clock',
  deviceClockNotice:
    'This display reads your device clock only. It does not contact or synchronize with a time server.',
  fullscreenUnavailable: 'Full screen is unavailable in this browser.',
  keyFullscreen: 'F',
  keyFullscreenHint: 'Full screen',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Online Clock — Large Full-Screen Digital Clock',
    description:
      'Online clock showing your device time in large, readable seconds. Choose 12/24-hour time, copy it, or press F for full screen—no tracking or server sync.',
    h1: 'Online Clock',
    tagline: 'A large local-time display with clear settings, a copy button and one-key full screen.',
    name: 'Online Clock',
    keywords: ['digital clock', 'current time', 'clock with seconds', 'full screen clock', 'what time is it'],
    howTo: [
      'Open the page to see your device’s current local time immediately.',
      'Choose 24-hour or 12-hour time, then decide whether to show seconds and the date.',
      'Press F or select Full screen to turn the display into a wall clock.',
      'Select Copy time to put the displayed time on your clipboard.',
    ],
    sections: [
      {
        heading: 'What time does this clock show?',
        body: 'This clock uses the time already set on your phone, tablet or computer. It does not make a network request, adjust the time from a server or claim to be an official reference clock. The time-zone name and UTC offset below the display identify the local setting the browser is using. If the digits look wrong, correct the date, time or time-zone setting in your device’s operating system; the clock updates on its next second.',
      },
      {
        heading: '12-hour and 24-hour time',
        body: 'In 24-hour time, midnight is 00:00 and the last second of a day is 23:59:59. In 12-hour time, midnight is 12:00 AM and noon is 12:00 PM. Seconds are useful for a visible reference during a presentation, class or recording, while hiding them makes a calmer desk clock. These display choices are saved only in this browser, so reopening the page keeps the format you selected.',
      },
      {
        heading: 'Use a spare screen as a clock',
        body: 'Select Full screen or press F to make the digits scale with the available screen. Press Esc, or select the control again, to return to the normal page. This is useful for a classroom projector, a reception desk, a kitchen tablet or a second monitor. A browser page can pause while a device sleeps, so keep the screen awake if people need to read it continuously; use your device clock app rather than a browser tab for a critical alarm.',
      },
    ],
    faq: [
      {
        q: 'Is this online clock synchronized with a time server?',
        a: 'No. This online clock reads the date and time from your device and does not query, compare with or synchronize to a server. Its accuracy is therefore the accuracy of the device clock and time-zone setting.',
      },
      {
        q: 'Can I show this clock full screen?',
        a: 'Yes. Select Full screen or press F to enlarge the clock to the available display. Press Esc or select the control again to leave full-screen mode.',
      },
      {
        q: 'Does the clock show seconds?',
        a: 'Yes. Seconds are visible by default and the display refreshes each second. You can turn them off in Display settings when you only need hours and minutes.',
      },
      {
        q: 'Are my clock settings sent anywhere?',
        a: 'No. The 12/24-hour, seconds and date preferences are stored only in this browser. The tool has no account, analytics or time-sync request.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '온라인 시계 — 초까지 보이는 전체화면 현재 시간',
    description:
      '지금 현재 시간을 큰 숫자로 보여주는 온라인 시계입니다. 12·24시간제, 초·날짜 표시, 복사와 F 키 전체화면을 지원하며 서버 시간인 척하지 않습니다.',
    h1: '온라인 시계',
    tagline: '내 기기의 현재 시간을 크게 표시하고, 시간 기준과 UTC 오프셋을 숨기지 않습니다.',
    name: '온라인 시계',
    keywords: ['현재 시간', '현재 시각', '디지털 시계', '초 시계', '전체화면 시계', '지금 몇 시'],
    howTo: [
      '페이지를 열면 기기에 설정된 현재 시각이 바로 표시됩니다.',
      '24시간제 또는 12시간제를 고르고 초·날짜 표시 여부를 정합니다.',
      '전체화면 버튼이나 F 키를 눌러 화면을 큰 벽시계처럼 사용합니다.',
      '시간 복사를 누르면 현재 표시된 시각을 클립보드에 담습니다.',
    ],
    sections: [
      {
        heading: '이 시계가 보여주는 시간',
        body: '이 시계는 휴대폰·태블릿·컴퓨터에 이미 설정된 날짜와 시각을 그대로 읽습니다. 서버에 시간을 요청하거나 서버 기준으로 보정하지 않으며, 공식 표준시라고 주장하지도 않습니다. 화면 아래의 시간대 이름과 UTC 오프셋은 브라우저가 현재 적용하고 있는 지역 설정입니다. 시각이 맞지 않으면 운영체제의 날짜·시간·시간대 설정을 고치면 다음 초부터 표시도 함께 바뀝니다.',
      },
      {
        heading: '12시간제와 24시간제',
        body: '24시간제에서 자정은 00:00이고 하루의 마지막 초는 23:59:59입니다. 12시간제에서는 자정이 12:00 AM, 정오가 12:00 PM으로 표시됩니다. 발표·수업·녹화 중에 기준 시각을 보여줘야 한다면 초 표시가 편하고, 책상 시계처럼 볼 때는 초를 끄면 더 차분합니다. 선택한 형식은 이 브라우저에만 저장되어 다음에 열어도 유지됩니다.',
      },
      {
        heading: '남는 화면을 벽시계로 쓰기',
        body: '전체화면 버튼이나 F 키를 누르면 숫자가 화면 크기에 맞춰 커집니다. Esc 키를 누르거나 같은 버튼을 다시 누르면 일반 화면으로 돌아옵니다. 교실 프로젝터, 안내 데스크, 주방 태블릿, 보조 모니터에 띄워 두기 좋습니다. 다만 기기가 절전 상태가 되면 브라우저도 멈출 수 있으므로 계속 보여야 할 때는 화면이 꺼지지 않게 설정하고, 중요한 알람은 브라우저 탭 대신 기기 시계 앱을 사용하세요.',
      },
    ],
    faq: [
      {
        q: '이 온라인 시계는 서버 시간과 동기화하나요?',
        a: '아니요. 이 온라인 시계는 기기에 설정된 날짜와 시각만 읽으며, 서버에 조회·비교·동기화하지 않습니다. 따라서 정확도는 기기 시계와 시간대 설정의 정확도에 달려 있습니다.',
      },
      {
        q: '전체화면으로 크게 볼 수 있나요?',
        a: '네. 전체화면 버튼이나 F 키를 누르면 시계가 가능한 화면 영역을 크게 채웁니다. Esc 키를 누르거나 같은 버튼을 다시 누르면 전체화면을 종료합니다.',
      },
      {
        q: '초 단위 현재 시간도 표시되나요?',
        a: '네. 기본으로 초까지 표시되며 매초 갱신됩니다. 시·분만 필요하면 표시 설정에서 초 보기를 끌 수 있습니다.',
      },
      {
        q: '시계 설정이나 현재 시간이 외부로 전송되나요?',
        a: '아니요. 12·24시간제, 초, 날짜 표시 설정은 이 브라우저에만 저장됩니다. 계정, 분석 스크립트, 서버 시간 요청을 사용하지 않습니다.',
      },
    ],
    ui: {
      currentTime: '현재 시각',
      format: '시간 형식',
      format24: '24시간제',
      format12: '12시간제',
      showSeconds: '초 표시',
      showDate: '날짜 표시',
      fullScreen: '전체화면',
      exitFullScreen: '전체화면 종료',
      copyTime: '시간 복사',
      copied: '복사됨',
      settings: '표시 설정',
      timeZone: '시간대',
      utcOffset: 'UTC 오프셋',
      deviceClock: '기기 시계',
      deviceClockNotice: '이 화면은 기기 시계만 읽습니다. 서버에 시간을 요청하거나 동기화하지 않습니다.',
      fullscreenUnavailable: '이 브라우저에서는 전체화면을 사용할 수 없습니다.',
      keyFullscreen: 'F',
      keyFullscreenHint: '전체화면',
    },
  },
};
