import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  ready: 'Ready',
  running: 'Running',
  paused: 'Paused',
  elapsedTime: 'Elapsed time',
  start: 'Start',
  pause: 'Pause',
  resume: 'Resume',
  lap: 'Lap',
  reset: 'Reset',
  fullscreen: 'Full screen',
  laps: 'Lap records',
  lapHint: 'Record a split without stopping. The newest lap is shown first.',
  noLaps: 'Start timing, then press Lap to add your first split.',
  downloadCsv: 'Download CSV',
  lapNumber: 'Lap',
  lapTime: 'Lap time',
  totalTime: 'Total time',
  startPause: 'Start / pause',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Stopwatch — Millisecond Laps and CSV Export',
    description:
      'A free, ad-free online stopwatch with millisecond laps, CSV download and keyboard controls. Your running time and lap records survive a refresh in this browser.',
    h1: 'Online Stopwatch',
    tagline: 'Measure elapsed time to milliseconds, keep every lap after refresh, and download the record as CSV.',
    name: 'Stopwatch',
    keywords: [
      'stopwatch',
      'online stopwatch',
      'lap timer',
      'split timer',
      'millisecond stopwatch',
      'stopwatch with laps',
    ],
    howTo: [
      'Press Start or the Space bar to begin measuring elapsed time.',
      'Press Lap or L whenever you need a split; the stopwatch keeps running.',
      'Press Pause to stop and Resume to continue from the same reading.',
      'Download CSV to save lap number, split time and total time for a spreadsheet.',
    ],
    sections: [
      {
        heading: 'Milliseconds are display resolution, not certified race timing',
        body: 'This stopwatch shows three digits after the decimal point: 1 millisecond is 0.001 second, so 1 second contains 1,000 milliseconds. The displayed value is useful for comparing repeated personal attempts, software tasks and classroom experiments. It is not a substitute for a certified sporting timing system: a browser, device scheduling and the person pressing Start or Lap all affect the recorded result. For ordinary training, use the same device and method when comparing laps.',
      },
      {
        heading: 'Why the stopwatch survives background tabs and refreshes',
        body: 'The clock stores the actual start timestamp and calculates elapsed time from the current clock instead of adding one tick for every screen update. That means a browser slowing a background tab does not make the elapsed value fall behind when you return. The current start time, paused reading and lap list are kept only in this browser’s local storage, so refreshing the page restores an active or paused session. Reset is the only action that clears that saved session.',
      },
      {
        heading: 'Use a CSV lap log in a spreadsheet',
        body: 'Each downloaded CSV has three columns: lap number, lap time and total time. Lap time is the interval since the preceding lap; total time is the elapsed reading from Start. CSV is plain text, so it opens in spreadsheet applications such as Excel, Google Sheets and LibreOffice Calc without an account. The download uses UTF-8 text and includes a byte-order mark, which helps spreadsheet software recognize Korean headers correctly.',
      },
    ],
    faq: [
      {
        q: 'Does the stopwatch keep running if I refresh the page?',
        a: 'Yes. A running stopwatch restores from its saved start timestamp, so elapsed time continues through a page refresh. A paused reading and every recorded lap also stay in this browser until Reset is pressed.',
      },
      {
        q: 'What is the difference between lap time and total time?',
        a: 'Lap time is the time since the preceding Lap press, while total time is the time from the first Start press. The first lap has matching lap and total times because it begins at 00:00:00.000.',
      },
      {
        q: 'Can I export the lap times?',
        a: 'Yes. Download CSV creates a file with lap number, lap time and total time. CSV can be opened in common spreadsheet software for sorting, charting or comparing sessions.',
      },
      {
        q: 'How precise is this online stopwatch?',
        a: 'The display has 1-millisecond resolution and reads from your device clock rather than screen-update ticks. It is appropriate for personal tracking, but it is not certified equipment for official race or scientific measurements.',
      },
      {
        q: 'Which keyboard shortcuts can I use?',
        a: 'Space starts or pauses, L records a lap, R resets the saved session, and F toggles full screen. The shortcuts are ignored while typing in a form field elsewhere on the page.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '스톱워치 — 밀리초 랩 기록·CSV 다운로드',
    description:
      '밀리초 단위 랩 기록과 CSV 다운로드를 지원하는 무료 온라인 스톱워치입니다. 광고 없이 키보드로 조작하고, 새로고침해도 이 브라우저의 시간과 랩 기록이 유지됩니다.',
    h1: '온라인 스톱워치',
    tagline: '밀리초까지 재고, 새로고침 뒤에도 랩 기록을 유지한 뒤 CSV로 내려받습니다.',
    name: '스톱워치',
    keywords: ['스톱워치', '온라인 스톱워치', '랩타임', '구간 기록', '밀리초 스톱워치', '초시계'],
    howTo: [
      '시작 버튼이나 스페이스바를 눌러 경과 시간을 잽니다.',
      '측정 중에 랩 버튼 또는 L 키를 눌러 구간 기록을 남깁니다.',
      '일시정지로 멈춘 뒤 계속으로 같은 시간부터 다시 잽니다.',
      'CSV 다운로드를 눌러 랩 번호, 구간 시간, 누적 시간을 스프레드시트에 저장합니다.',
    ],
    sections: [
      {
        heading: '밀리초 표시는 공식 경기 계측값이 아닙니다',
        body: '이 스톱워치는 소수점 아래 세 자리, 즉 1밀리초(0.001초)까지 표시합니다. 1초는 1,000밀리초이므로 같은 동작을 여러 번 비교하거나 개인 운동 기록, 프로그램 작업 시간, 수업 실험의 경과 시간을 볼 때 편리합니다. 다만 브라우저와 기기의 처리 시점, 시작·랩 버튼을 누르는 사람의 반응 시간은 기록에 영향을 줍니다. 따라서 공식 경기 기록이나 인증이 필요한 과학 측정에는 전용 계측 장비를 사용해야 합니다. 개인 기록을 비교할 때는 같은 기기와 같은 방법으로 재는 것이 좋습니다.',
      },
      {
        heading: '다른 탭이나 새로고침 뒤에도 시간이 맞는 방식',
        body: '이 스톱워치는 화면이 갱신될 때마다 시간을 더하지 않고, 실제 시작 시각과 현재 시각의 차이로 경과 시간을 계산합니다. 그래서 브라우저가 백그라운드 탭의 화면 갱신을 늦춰도 다시 돌아왔을 때 시간이 뒤처지지 않습니다. 시작 시각, 일시정지한 시간, 랩 목록은 이 브라우저의 로컬 저장소에만 보관하므로 페이지를 새로고침해도 실행 중이거나 멈춘 세션을 이어서 볼 수 있습니다. 초기화를 누를 때만 저장된 세션이 지워집니다.',
      },
      {
        heading: 'CSV로 랩 기록을 분석하는 법',
        body: '내려받는 CSV에는 랩 번호, 구간 시간, 누적 시간의 세 열이 있습니다. 구간 시간은 직전 랩부터 이번 랩까지 걸린 시간이고, 누적 시간은 처음 시작한 뒤부터의 전체 경과 시간입니다. CSV는 일반 텍스트 형식이라 Excel, Google Sheets, LibreOffice Calc 같은 스프레드시트에서 바로 열어 정렬하거나 그래프로 비교할 수 있습니다. 파일은 UTF-8과 바이트 순서 표시를 사용해 한국어 열 이름도 제대로 인식하도록 만들었습니다.',
      },
    ],
    faq: [
      {
        q: '새로고침해도 스톱워치가 계속 가나요?',
        a: '네. 실행 중인 스톱워치는 저장된 시작 시각을 기준으로 복원하므로 페이지를 새로고침해도 경과 시간이 이어집니다. 일시정지한 시간과 랩 기록도 초기화를 누르기 전까지 이 브라우저에 남습니다.',
      },
      {
        q: '구간 시간과 누적 시간은 무엇이 다른가요?',
        a: '구간 시간은 직전 랩 버튼을 누른 뒤부터 이번 랩까지 걸린 시간이고, 누적 시간은 처음 시작한 시점부터의 전체 시간입니다. 첫 번째 랩은 00:00:00.000부터 시작하므로 두 값이 같습니다.',
      },
      {
        q: '랩 기록을 파일로 저장할 수 있나요?',
        a: '네. CSV 다운로드를 누르면 랩 번호, 구간 시간, 누적 시간이 들어 있는 파일을 내려받습니다. CSV 파일은 일반적인 스프레드시트에서 열어 정렬, 그래프, 세션 비교에 사용할 수 있습니다.',
      },
      {
        q: '온라인 스톱워치는 얼마나 정확한가요?',
        a: '화면은 1밀리초 단위로 표시하고 화면 갱신 횟수가 아닌 기기 시각을 기준으로 계산합니다. 개인 기록에는 적합하지만 공식 경기나 인증이 필요한 과학 측정용 장비는 아닙니다.',
      },
      {
        q: '어떤 키보드 단축키를 지원하나요?',
        a: '스페이스바는 시작·일시정지, L은 랩 기록, R은 저장된 세션 초기화, F는 전체화면 전환입니다. 페이지의 다른 입력칸에 글자를 쓰는 동안에는 단축키가 동작하지 않습니다.',
      },
    ],
    ui: {
      ready: '준비',
      running: '측정 중',
      paused: '일시정지',
      elapsedTime: '경과 시간',
      start: '시작',
      pause: '일시정지',
      resume: '계속',
      lap: '랩',
      reset: '초기화',
      fullscreen: '전체화면',
      laps: '랩 기록',
      lapHint: '측정을 멈추지 않고 구간을 기록합니다. 최신 랩이 위에 표시됩니다.',
      noLaps: '측정을 시작한 뒤 랩 버튼을 눌러 첫 구간 기록을 남깁니다.',
      downloadCsv: 'CSV 다운로드',
      lapNumber: '랩',
      lapTime: '구간 시간',
      totalTime: '누적 시간',
      startPause: '시작 / 일시정지',
    },
  },
};
