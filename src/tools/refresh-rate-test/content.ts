import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  resultsTitle: 'Measured refresh rate',
  measuring: 'Measuring… keep this tab in front and do not scroll',
  restart: 'Measure again',
  fullscreen: 'Full screen',
  exitFullscreen: 'Leave full screen',
  motionLabel: 'Moving bar — it should glide, not jump',
  standardRate: 'Nearest standard rate',
  frameTime: 'Frame time (median)',
  frameBudget: 'Frame budget',
  averageFrameTime: 'Average frame time',
  jitter: 'Jitter (mean deviation)',
  droppedFrames: 'Dropped frames',
  frames: 'frames',
  stability: 'Intervals within ±10%',
  rateRange: 'Fastest–slowest frame',
  measuringHint:
    'A {seconds}-second sample starts on its own. Leave the tab in front and avoid scrolling while it runs.',
  doneHint:
    'Compare this with the display rate set in your operating system. Press Measure again after changing a setting.',
  copy: 'Copy report',
  copied: 'Copied',
  interrupted:
    'The page stopped drawing during this sample (a hidden tab, sleep, or a long freeze). Press Measure again and keep the tab visible.',
  manyDropped: 'More than 5% of frames arrived late. Close other heavy apps and repeat before blaming the display.',
  fullscreenFailed: 'This browser refused full screen. The measurement still works in the window.',
  accuracyNotice:
    'This reads the frames your browser actually draws, not the panel specification. Power saving, a lower operating-system setting, variable refresh rate, another monitor, and browser limits can all produce a lower number than the display supports.',
  tableTitle: 'Standard refresh rates and their frame budget',
  hertz: 'Hz',
  milliseconds: 'ms',
  seconds: 's',
  typicalUse: 'Typical use',
  useOffice: 'Office, browsing, video',
  useGaming: 'Phones, gaming monitors, ProMotion',
  useCompetitive: 'Competitive gaming',
  tableNote:
    'The table lists {count} rates this tool recognises. A reading within 2% of one of them is reported as that standard rate, because real panel timing is rarely exact: a 60 Hz signal commonly runs at 59.94 Hz.',
  none: 'No standard rate',
  closestRate: 'closest {rate} Hz · {percent}% away',
  dash: '—',
  reportRate: 'Refresh rate',
  reportStandard: 'Nearest standard rate',
  sample: 'Sample',
  duration: 'Duration',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Refresh Rate Test — Check Your Screen Hz in the Browser',
    description:
      'Measure the refresh rate your browser actually draws in five seconds: median Hz, frame time, jitter, dropped frames and the nearest standard rate. Nothing is uploaded.',
    h1: 'Refresh Rate Test',
    tagline:
      'Read the frames this tab really receives, see whether they match 60, 120 or 144 Hz, and check the number against your display setting.',
    name: 'Refresh Rate Test',
    keywords: [
      'refresh rate test',
      'hz test',
      'check my refresh rate',
      'monitor hz test',
      'screen refresh rate',
      'frame rate test',
      'is my monitor 144hz',
      'promotion 120hz test',
    ],
    howTo: [
      'Open the page and let the five-second sample finish; the test starts on its own.',
      'Keep the tab in front and do not scroll, drag the window, or switch apps while it runs.',
      'Compare the measured Hz with the rate selected in your operating system display settings.',
      'If the number is lower than expected, close heavy apps, switch off power saving, and press Measure again.',
      'Use Full screen for a steadier reading and Copy report to keep the numbers.',
    ],
    sections: [
      {
        heading: 'How the browser can measure a refresh rate',
        body: 'Browsers draw through requestAnimationFrame, which is tied to the display refresh: on a 60 Hz screen the callback runs about 60 times a second, and on a 144 Hz screen about 144 times. Each callback receives a timestamp in milliseconds, so the gaps between consecutive timestamps describe how fast frames are being produced. This tool discards the first ten intervals, because the first frames after a page loads are often irregular, and then takes the median gap instead of the mean so that one slow frame cannot drag the answer. The median gap of 16.67 ms is 60 Hz, 8.33 ms is 120 Hz, and 6.94 ms is 144 Hz. A frame whose gap is at least 1.5 times the median is counted as a dropped frame, which is why the panel can report both a rate and a jitter figure at once.',
      },
      {
        heading: 'Why a 144 Hz display often reads 60 Hz',
        body: 'The number here is what this browser tab receives, not what the panel could do. Windows keeps many high-refresh monitors at 60 Hz until you choose a higher value in Settings → System → Display → Advanced display; macOS exposes the same choice under System Settings → Displays, where ProMotion-capable MacBook Pro models offer a variable rate up to 120 Hz. A laptop on battery saver, a window sitting on a second 60 Hz monitor, a remote-desktop session, a browser with hardware acceleration disabled, and a variable-refresh display that follows the content can all produce a lower reading. Cable and port bandwidth matter too: HDMI 1.4 carries 4K at 30 Hz and 1080p at up to 120 Hz, while 4K at 60 Hz needs HDMI 2.0 or DisplayPort, so a high-refresh monitor can be limited by the cable rather than the panel.',
      },
      {
        heading: 'What the extra figures tell you',
        body: 'A median rate alone hides stutter, so the report also keeps the spread. Jitter is the average distance between each gap and the median: a steady display stays well under a millisecond, while a busy machine spreads out. The dropped-frame count catches gaps of 1.5 times the median or more, which is one refresh cycle missed; a few at the start of a run are normal, but more than 5% usually means another application is competing for the main thread rather than a faulty display. The fastest and slowest frames show the range behind the median, and the stability share counts intervals within ±10% of it. If the tab was hidden, the browser stops drawing, so a gap longer than half a second marks the run as interrupted instead of presenting an unusable sample as a rate.',
      },
    ],
    faq: [
      {
        q: 'Why does my 144 Hz monitor show 60 Hz in this test?',
        a: 'Check the rate selected in your operating-system display settings first: many monitors stay at 60 Hz until a higher value is chosen. Then check power saving, the cable and port (HDMI 1.4 limits 4K to 30 Hz and 1080p to 120 Hz), whether another 60 Hz monitor is driving the window, and whether the browser has hardware acceleration enabled. The test measures what the browser draws, so any of these can hold it at 60 Hz.',
      },
      {
        q: 'Is the measured refresh rate the same as my monitor specification?',
        a: 'No. The test times the frames this tab receives, which the browser schedules from the display refresh. The panel specification is the maximum the hardware supports, while the operating-system setting, the cable, battery mode, variable refresh rate, and the browser can all deliver less. Use the monitor menu or system display settings to confirm the hardware value, and this test to confirm what the browser actually gets.',
      },
      {
        q: 'Why is the number slightly below 60 or 144, such as 59.94 or 143.9?',
        a: 'Real display timing is rarely a whole number. Broadcast-derived modes commonly run at 59.94 Hz, and a 144 Hz panel may report 143.9 Hz because its timing is not exactly 1000 ÷ 144 ms. The tool therefore names the nearest standard rate when the reading is within 2% of it instead of pretending the measurement is exact.',
      },
      {
        q: 'Why did the test stop or restart by itself?',
        a: 'Browsers pause animation frames in a hidden or minimised tab, and can also freeze a background page for power saving. A gap longer than half a second makes the sample invalid, so the tool marks it as interrupted or starts a fresh run when the tab is visible again. Keep the tab in front for the full five seconds.',
      },
      {
        q: 'Does a higher refresh rate always look smoother in the browser?',
        a: 'Only when the page can produce frames at that rate. A 144 Hz display cannot make a page that redraws 30 times a second look like 144 frames; it shortens the gap in which a new frame can appear, which makes scrolling and animation smoother when the content keeps up. That is why the report includes jitter and dropped frames next to the rate.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '주사율 테스트 — 내 모니터 Hz 브라우저에서 확인',
    description:
      '브라우저가 실제로 그리는 주사율을 5초 만에 측정합니다. 중앙값 Hz, 프레임 간격, 지터, 끊긴 프레임, 가까운 표준 주사율까지 한 번에 확인하세요.',
    h1: '주사율 테스트',
    tagline:
      '이 탭이 실제로 받는 프레임을 세어 60·120·144Hz 중 어디에 가까운지 보여 주고, 운영체제에 설정된 주사율과 비교합니다.',
    name: '주사율 테스트',
    keywords: [
      '주사율 테스트',
      '모니터 Hz 확인',
      '내 모니터 주사율',
      '화면 주사율 확인',
      '144Hz 확인',
      '120Hz 테스트',
      '프레임 레이트 테스트',
      '프로모션 주사율',
    ],
    howTo: [
      '페이지를 열면 5초 측정이 저절로 시작됩니다.',
      '측정하는 동안 탭을 앞에 두고 스크롤·창 이동·앱 전환을 하지 마세요.',
      '측정된 Hz를 운영체제 디스플레이 설정에 선택된 주사율과 비교합니다.',
      '예상보다 낮게 나오면 다른 프로그램을 닫고 절전 모드를 끈 뒤 다시 측정하세요.',
      '안정적인 값이 필요하면 전체 화면을 쓰고, 남겨 둘 때는 보고서 복사를 누르세요.',
    ],
    sections: [
      {
        heading: '브라우저로 주사율을 재는 원리',
        body: '브라우저는 requestAnimationFrame으로 화면을 그리며, 이 콜백은 디스플레이 갱신에 맞춰 호출됩니다. 60Hz 화면에서는 1초에 약 60번, 144Hz 화면에서는 약 144번 실행되고, 매 호출마다 밀리초 단위 타임스탬프가 전달됩니다. 따라서 연속된 타임스탬프 사이의 간격을 재면 프레임이 얼마나 자주 만들어지는지 알 수 있습니다. 이 도구는 페이지가 막 뜬 직후의 불규칙한 구간을 피하려고 처음 10개 간격을 버리고, 평균 대신 중앙값을 씁니다. 그래야 한 번 느리게 그려진 프레임이 결과 전체를 끌어내리지 않습니다. 간격 16.67ms는 60Hz, 8.33ms는 120Hz, 6.94ms는 144Hz이며, 중앙값의 1.5배 이상 벌어진 프레임은 끊긴 프레임으로 따로 셉니다.',
      },
      {
        heading: '144Hz 모니터인데 60Hz로 나오는 이유',
        body: '여기서 재는 값은 브라우저 탭이 실제로 받는 프레임이지 패널이 낼 수 있는 최대값이 아닙니다. 윈도우는 제어판이 아니라 설정 → 시스템 → 디스플레이 → 고급 디스플레이에서 주사율을 직접 골라야 144Hz로 동작하는 경우가 많고, 맥은 시스템 설정 → 디스플레이의 재생률에서 고릅니다. 맥북 프로 14·16형은 ProMotion을 켜면 최대 120Hz까지 콘텐츠에 맞춰 바뀝니다. 노트북 배터리 절약 모드, 다른 60Hz 모니터에 놓인 창, 원격 데스크톱, 하드웨어 가속이 꺼진 브라우저, 콘텐츠에 맞춰 주사율을 바꾸는 가변 주사율은 모두 측정값을 낮출 수 있습니다. 케이블과 포트도 변수입니다. HDMI 1.4는 4K에서 30Hz, 1080p에서 최대 120Hz까지만 보내므로 4K 60Hz에는 HDMI 2.0 이상이나 디스플레이포트가 필요합니다.',
      },
      {
        heading: '함께 보여 주는 수치를 읽는 법',
        body: '중앙값 하나만 보면 끊김이 가려지므로 이 도구는 흩어진 정도도 함께 보여 줍니다. 지터는 각 프레임 간격이 중앙값에서 얼마나 떨어졌는지의 평균으로, 안정적인 화면은 1ms보다 훨씬 작고 컴퓨터가 바쁘면 커집니다. 끊긴 프레임은 중앙값의 1.5배 이상 벌어진 간격, 즉 한 번의 화면 갱신을 놓친 경우이며 시작 직후 몇 개는 정상이지만 5%를 넘으면 다른 프로그램이 몫을 나눠 쓰는 상황일 가능성이 큽니다. 가장 빠른 프레임과 가장 느린 프레임은 중앙값 뒤의 범위를, 안정 구간 비율은 중앙값 ±10% 안에 든 간격의 비중을 보여 줍니다. 탭이 가려지면 브라우저가 그리기를 멈추므로 0.5초가 넘는 공백이 있으면 측정을 중단으로 표시하고 잘못된 값을 주사율로 보여 주지 않습니다.',
      },
    ],
    faq: [
      {
        q: '144Hz 모니터인데 왜 60Hz로 나오나요?',
        a: '먼저 운영체제 디스플레이 설정에서 주사율이 60Hz로 되어 있지 않은지 확인하세요. 다음으로 절전 모드, 케이블과 포트(HDMI 1.4는 4K에서 30Hz, 1080p에서 120Hz까지), 창이 놓인 모니터, 브라우저 하드웨어 가속을 확인합니다. 이 도구는 브라우저가 실제로 그리는 속도를 재기 때문에 이 중 하나만 걸려도 60Hz로 나올 수 있습니다.',
      },
      {
        q: '측정값이 모니터 사양과 같은 뜻인가요?',
        a: '아닙니다. 이 값은 탭이 받는 프레임 간격으로 계산한 결과이고, 모니터 사양은 하드웨어가 지원하는 최대값입니다. 운영체제 설정, 케이블, 배터리 모드, 가변 주사율, 브라우저 제한 때문에 실제 전달값은 더 낮을 수 있습니다. 사양은 모니터 설명서나 운영체제 설정에서, 브라우저가 실제로 받는 값은 이 테스트로 확인하세요.',
      },
      {
        q: '59.94Hz나 143.9Hz처럼 딱 떨어지지 않는 이유는 무엇인가요?',
        a: '실제 디스플레이 타이밍은 정수로 떨어지는 경우가 드뭅니다. 방송 규격에서 온 59.94Hz 모드가 흔하고, 144Hz 패널도 타이밍이 정확히 1000 ÷ 144ms가 아니어서 143.9Hz로 보일 수 있습니다. 그래서 이 도구는 측정값이 표준 주사율의 2% 안에 들면 그 표준값으로 알려 주고, 그 밖이면 반올림한 숫자를 그대로 보여 줍니다.',
      },
      {
        q: '측정 도중에 값이 멈추거나 다시 시작되는 이유는 무엇인가요?',
        a: '브라우저는 탭이 가려지거나 최소화되면 애니메이션 프레임을 멈추고, 절전을 위해 백그라운드 페이지를 얼릴 수도 있습니다. 0.5초가 넘는 공백이 생기면 그 표본은 주사율로 쓸 수 없으므로 도구가 중단으로 표시하거나 탭이 다시 보일 때 새로 측정합니다. 5초 동안 탭을 앞에 두고 기다려 주세요.',
      },
      {
        q: '주사율이 높으면 브라우저 화면이 무조건 부드러운가요?',
        a: '페이지가 그 주사율만큼 프레임을 만들어 낼 때만 그렇습니다. 144Hz 화면이라도 1초에 30번만 다시 그리는 페이지가 144프레임처럼 보이지는 않습니다. 주사율이 높으면 새 프레임이 나타날 수 있는 간격이 짧아져 스크롤과 애니메이션이 부드러워지므로, 이 도구는 주사율과 함께 지터와 끊긴 프레임을 같이 보여 줍니다.',
      },
    ],
    ui: {
      resultsTitle: '측정된 주사율',
      measuring: '측정 중… 탭을 앞에 두고 스크롤하지 마세요',
      restart: '다시 측정',
      fullscreen: '전체 화면',
      exitFullscreen: '전체 화면 종료',
      motionLabel: '움직이는 막대 — 끊기지 않고 미끄러지듯 움직여야 합니다',
      standardRate: '가까운 표준 주사율',
      frameTime: '프레임 간격(중앙값)',
      frameBudget: '프레임 예산',
      averageFrameTime: '평균 프레임 간격',
      jitter: '지터(평균 편차)',
      droppedFrames: '끊긴 프레임',
      frames: '프레임',
      stability: '±10% 안에 든 간격',
      rateRange: '가장 빠른–느린 프레임',
      measuringHint: '{seconds}초 표본이 저절로 시작됩니다. 측정하는 동안 탭을 앞에 두고 스크롤을 피하세요.',
      doneHint: '운영체제 디스플레이 설정에 선택된 주사율과 비교해 보세요. 설정을 바꾼 뒤에는 다시 측정을 누릅니다.',
      copy: '보고서 복사',
      copied: '복사됨',
      interrupted:
        '이 표본을 재는 중에 화면 그리기가 멈췄습니다(탭 숨김, 절전, 긴 멈춤). 다시 측정을 누르고 탭을 계속 보이게 두세요.',
      manyDropped: '프레임 5% 이상이 늦게 도착했습니다. 무거운 프로그램을 닫고 다시 측정한 뒤 모니터를 의심하세요.',
      fullscreenFailed: '이 브라우저가 전체 화면을 허용하지 않았습니다. 창 상태에서도 측정은 그대로 동작합니다.',
      accuracyNotice:
        '이 값은 브라우저가 실제로 그리는 프레임을 읽은 것이며 패널 사양이 아닙니다. 절전 모드, 낮은 운영체제 설정, 가변 주사율, 다른 모니터, 브라우저 제한 때문에 화면이 지원하는 값보다 낮게 나올 수 있습니다.',
      tableTitle: '표준 주사율과 프레임 예산',
      hertz: 'Hz',
      milliseconds: 'ms',
      seconds: '초',
      typicalUse: '주 용도',
      useOffice: '사무·웹 서핑·영상',
      useGaming: '스마트폰·게이밍 모니터·ProMotion',
      useCompetitive: '경쟁 게임',
      tableNote:
        '이 도구가 인식하는 {count}개 주사율입니다. 실제 패널 타이밍은 딱 떨어지지 않아 60Hz 신호도 59.94Hz로 동작하는 경우가 흔하므로, 표준값의 2% 안에 들면 그 표준 주사율로 표시합니다.',
      none: '표준 주사율 없음',
      closestRate: '가장 가까운 {rate} Hz · {percent}% 차이',
      dash: '—',
      reportRate: '주사율',
      reportStandard: '가까운 표준 주사율',
      sample: '표본',
      duration: '측정 시간',
    },
  },
};
