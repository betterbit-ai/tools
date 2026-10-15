import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  currentTime: 'Current local time',
  nextAlarm: 'Next alarm: {time}',
  setAlarm: 'Set an alarm',
  time: 'Alarm time',
  label: 'Label',
  labelHint: 'Optional; saved only in this browser.',
  labelPlaceholder: 'Wake up, meeting, laundry…',
  addAlarm: 'Add alarm',
  testSound: 'Test sound',
  quickSet: 'Quick set',
  quickMinutes: 'In {n} min',
  alarms: 'Your alarms',
  noAlarms: 'No alarms yet. Add one for a meeting, break or reminder.',
  enabled: 'Enabled',
  remove: 'Remove',
  defaultLabel: 'Alarm',
  alarmRinging: '{label} is ringing.',
  dismiss: 'Dismiss alarms',
  invalidTime: 'Choose a valid alarm time.',
  limitReached: 'You can keep up to {count} alarms in this browser.',
  keyboardAdd: 'Focus alarm time',
  keyboardDismiss: 'Dismiss alarms',
  browserNotice:
    'Keep this tab open and test the sound before relying on an alarm. A browser cannot ring while the device is asleep or shut down.',
  titleNext: 'Next alarm: {time}',
  titleRinging: 'Alarm: {label}',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Online Alarm Clock — Multiple Labeled Alarms',
    description:
      'Set up to 12 online alarms in one browser tab. Save labeled alarms locally, see the next alert, and use a precise system-clock check—without signing up.',
    h1: 'Online Alarm Clock',
    tagline: 'Set several labeled alarms in one clean tab and keep them saved on this device.',
    name: 'Alarm Clock',
    keywords: ['online alarm clock', 'browser alarm', 'multiple alarms', 'set alarm online', 'alarm clock with sound'],
    howTo: [
      'Choose an alarm time and optionally write a label.',
      'Press Test sound, then select Add alarm.',
      'Leave this tab open while you work in other tabs.',
      'Use the Enabled switch to pause an alarm, or Remove to delete it.',
      'When an alarm rings, press Dismiss alarms or Esc to stop the sound.',
    ],
    sections: [
      {
        heading: 'Why the alarm checks the real clock',
        body: 'Browsers intentionally slow background tabs to save battery. Counting one-second timer ticks can therefore make an alert late after the tab has been in the background. This alarm stores a local clock time and, whenever the browser gets a chance to run, checks the interval against your device clock. If the selected time passed while the tab was backgrounded, the alarm rings on that next check instead of drifting by the number of delayed ticks.',
      },
      {
        heading: 'Use a browser alarm safely',
        body: 'A web page cannot wake a computer that is sleeping, shut down or closed, and browsers may require an interaction before they allow sound. Use Test sound after opening the page, keep the tab open, and make sure the device volume is on. For an appointment or flight that cannot be missed, use the operating system or phone alarm as a backup. This tool is most useful for desktop reminders, breaks, meetings and short naps while the device stays awake.',
      },
      {
        heading: 'Multiple alarms stay local',
        body: 'You can keep up to 12 enabled or paused alarms here, each with an optional label such as “Stand-up” or “Take laundry out.” They repeat at the selected local time on later days until you disable or remove them. The list is stored only in this browser using local storage; it is not sent to a server, does not sync to another device, and can disappear if you clear this browser’s site data.',
      },
    ],
    faq: [
      {
        q: 'Will an online alarm ring in a background tab?',
        a: 'Yes. This alarm compares the scheduled local time with the device clock when the browser runs again, so it can alert after a background-tab delay. The tab must stay open and the device must remain awake.',
      },
      {
        q: 'Can I set more than one alarm?',
        a: 'Yes. You can add up to 12 labeled alarms, enable or disable each one separately, and see the next enabled alarm above the controls.',
      },
      {
        q: 'Are my alarms saved after a refresh?',
        a: 'Yes. Alarm time, label and enabled state are saved only in this browser, so they are restored after a refresh. Clearing this site’s browser data removes them.',
      },
      {
        q: 'Will this alarm wake a sleeping laptop?',
        a: 'No. A browser tab cannot run while a laptop or computer is asleep, shut down or closed. Keep the device awake and use a built-in alarm as backup for important wake-ups.',
      },
      {
        q: 'Does the online alarm need an internet connection?',
        a: 'After this page has loaded, alarm scheduling and sound generation run in the browser. The alarm list and labels stay on the device and are not sent anywhere.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '온라인 알람 — 여러 개 설정하는 무료 알람시계',
    description:
      '브라우저 한 탭에서 최대 12개의 온라인 알람을 설정하세요. 이름을 붙여 기기에만 저장하고, 다음 알람을 바로 확인합니다. 가입이 없습니다.',
    h1: '온라인 알람',
    tagline: '여러 개의 알람에 이름을 붙여 한 탭에서 관리하고, 이 기기에만 저장합니다.',
    name: '알람',
    keywords: ['온라인 알람', '알람시계', '브라우저 알람', '여러 개 알람', '알람 맞추기', '컴퓨터 알람'],
    howTo: [
      '알람 시각을 고르고 필요하면 이름을 입력합니다.',
      '소리 테스트를 누른 뒤 알람 추가를 선택합니다.',
      '다른 탭에서 작업해도 되지만 이 탭은 열어 둡니다.',
      '사용 스위치로 알람을 잠시 끄거나 삭제 버튼으로 지웁니다.',
      '알람이 울리면 알람 끄기 버튼이나 Esc 키를 눌러 소리를 멈춥니다.',
    ],
    sections: [
      {
        heading: '백그라운드 탭에서도 시각을 확인하는 방식',
        body: '브라우저는 배터리를 아끼기 위해 백그라운드 탭의 실행 횟수를 줄입니다. 1초마다 횟수를 세는 방식은 탭을 오래 두면 알람이 늦어질 수 있습니다. 이 도구는 매번 기기의 실제 시계와 설정 시각을 비교합니다. 그래서 다른 탭을 보고 있던 동안 설정 시각이 지났다면, 브라우저가 다시 실행되는 즉시 지연된 횟수만큼 더 늦어지는 대신 알람을 확인합니다.',
      },
      {
        heading: '브라우저 알람을 안전하게 쓰는 방법',
        body: '웹페이지는 절전·종료·닫힌 상태의 컴퓨터를 깨울 수 없고, 브라우저는 사용자 동작 전에는 소리 재생을 막을 수 있습니다. 페이지를 열었다면 먼저 소리 테스트를 누르고, 탭을 열어 둔 채 기기 음량을 확인하세요. 비행기 탑승이나 중요한 약속처럼 놓치면 안 되는 알람은 휴대폰이나 운영체제 기본 알람을 함께 설정하는 편이 안전합니다.',
      },
      {
        heading: '여러 알람은 이 브라우저에만 저장',
        body: '최대 12개의 알람을 켜거나 끌 수 있고, 각각에 “회의”, “빨래 꺼내기”처럼 이름을 붙일 수 있습니다. 켜 둔 알람은 삭제하거나 끌 때까지 다음 날에도 같은 현지 시각에 반복됩니다. 목록은 브라우저의 로컬 저장소에만 보관되며 서버나 다른 기기로 전송·동기화되지 않습니다. 이 사이트의 브라우저 데이터를 지우면 알람 목록도 함께 사라집니다.',
      },
    ],
    faq: [
      {
        q: '다른 탭을 보고 있어도 온라인 알람이 울리나요?',
        a: '네. 브라우저가 다시 실행될 때 기기의 실제 시계와 설정 시각을 비교하므로 백그라운드 탭 지연 뒤에도 알람을 확인합니다. 단, 탭은 열려 있어야 하고 기기는 깨어 있어야 합니다.',
      },
      {
        q: '알람을 여러 개 맞출 수 있나요?',
        a: '네. 이름을 붙인 알람을 최대 12개까지 추가하고, 각 알람을 따로 켜거나 끌 수 있습니다. 화면 상단에는 켜져 있는 알람 중 가장 가까운 시각이 표시됩니다.',
      },
      {
        q: '새로고침해도 알람이 남아 있나요?',
        a: '네. 알람 시각, 이름, 사용 여부는 이 브라우저에만 저장되어 새로고침 후에도 복원됩니다. 사이트 데이터를 삭제하면 목록도 지워집니다.',
      },
      {
        q: '노트북이 절전 모드여도 알람이 울리나요?',
        a: '아니요. 브라우저 탭은 노트북이나 컴퓨터가 절전·종료·닫힌 상태에서는 실행되지 않습니다. 기기를 깨어 있게 두고 중요한 기상 알람은 기본 알람을 함께 사용하세요.',
      },
      {
        q: '온라인 알람은 인터넷 연결이 계속 필요한가요?',
        a: '페이지를 한 번 열고 나면 알람 시각 확인과 소리 생성은 브라우저 안에서 이루어집니다. 알람 목록과 이름도 기기에만 남고 외부로 전송되지 않습니다.',
      },
    ],
    ui: {
      currentTime: '현재 시각',
      nextAlarm: '다음 알람: {time}',
      setAlarm: '알람 설정',
      time: '알람 시각',
      label: '알람 이름',
      labelHint: '선택 사항이며 이 브라우저에만 저장됩니다.',
      labelPlaceholder: '기상, 회의, 빨래…',
      addAlarm: '알람 추가',
      testSound: '소리 테스트',
      quickSet: '빠른 설정',
      quickMinutes: '{n}분 후',
      alarms: '내 알람',
      noAlarms: '등록된 알람이 없습니다. 회의, 휴식, 알림용 알람을 추가하세요.',
      enabled: '사용',
      remove: '삭제',
      defaultLabel: '알람',
      alarmRinging: '{label} 알람이 울리는 중입니다.',
      dismiss: '알람 끄기',
      invalidTime: '올바른 알람 시각을 선택하세요.',
      limitReached: '이 브라우저에는 알람을 최대 {count}개까지 저장할 수 있습니다.',
      keyboardAdd: '알람 시각으로 이동',
      keyboardDismiss: '알람 끄기',
      browserNotice:
        '알람을 믿고 맡기기 전 소리 테스트를 누르고 탭을 열어 두세요. 기기가 절전·종료 상태이면 브라우저 알람은 울리지 않습니다.',
      titleNext: '다음 알람: {time}',
      titleRinging: '알람: {label}',
    },
  },
};
