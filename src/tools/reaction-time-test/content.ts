import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  testArea: 'Reaction time test',
  testAreaHint: 'Start a round, wait for the signal, then press the panel as soon as it changes.',
  reset: 'Reset',
  ready: 'Ready for round 1. Start when you are ready.',
  start: 'Click, tap, or press Space to start',
  waiting: 'Wait for the signal',
  go: 'Press now!',
  falseStart: 'Too soon — that round was not counted. Start it again when ready.',
  tryAgain: 'Click to try again',
  roundDone: 'Round recorded. Start round {round} when you are ready.',
  nextRound: 'Start round {round}',
  complete: 'Five rounds complete. Review your average and reference context, or start a new test.',
  testAgain: 'Click to test again',
  average: 'Average',
  referencePercentile: 'Lab-reference percentile',
  median: 'Median',
  spread: 'Spread',
  fasterThan: 'Faster than {n}%',
  ms: 'ms',
  rounds: 'Five rounds',
  roundLabel: 'Round {n}',
  personalBest: 'Best 5-round average',
  personalBestHint: 'Saved only in this browser. Lower is faster.',
  keyboardControls: 'Keyboard controls',
  tabKey: 'Tab',
  spaceKey: 'Space',
  enterKey: 'Enter',
  focusPad: 'Focus the test panel',
  pressPad: 'Start or respond',
  referenceNote:
    'The percentile is a laboratory-reference estimate, not a diagnosis or a browser ranking. Results under {min} ms are treated as early responses and are not counted.',
  localOnly: 'Your rounds and best average stay in this browser; nothing is sent to a server.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Reaction Time Test — average and percentile',
    description:
      'Test visual reaction time in five rounds with mouse, touch or keyboard. Get an average, median, spread and a clearly qualified lab-reference percentile in your browser.',
    h1: 'Reaction Time Test',
    tagline:
      'React to five random visual signals, then see an average, median, spread and laboratory-reference percentile without an account.',
    name: 'Reaction Time Test',
    keywords: [
      'reaction time test',
      'reaction test',
      'reflex test',
      'reaction speed test',
      'visual reaction time test',
      'online reaction test',
    ],
    howTo: [
      'Click, tap, or focus the large panel with Tab and press Space or Enter to start round 1.',
      'Wait through the randomly timed warning state; pressing before the signal does not count.',
      'Press the panel as soon as it says “Press now!” to record a result in milliseconds.',
      'Repeat until all five rounds are recorded, using the same device and input method for comparable results.',
      'Read the average, median, spread and lab-reference percentile; a lower millisecond value is faster.',
    ],
    sections: [
      {
        heading: 'What the five-round result means',
        body: 'This is a simple visual reaction-time task: wait for a visual signal, then make one response. Each round waits a random 1.5–4.0 seconds so a fixed rhythm cannot predict the cue. The average is the sum of accepted rounds divided by their count. The median is the middle result after sorting, so one unusually slow or fast round affects it less. Spread is slowest minus fastest; a smaller spread means the five attempts were more consistent. Responses below 100 ms are not counted because they are likely anticipatory presses, not responses to a displayed signal.',
      },
      {
        heading: 'How the reference percentile is calculated',
        body: 'The displayed percentile is context, not a ranking of site visitors. It estimates the share of a laboratory reference distribution that was slower than your five-round average, using a normal-distribution approximation based on Woods et al. (2015), Experiment 1: 1,469 adults aged 18–65 had a measured simple visual reaction-time mean of 231 ms and standard deviation of 27 ms. That study used calibrated equipment and 120 measured trials per person, while this browser test uses five rounds and includes your screen, browser and input-device latency. Do not use the percentage as a medical, fitness, driving or cognitive assessment.',
      },
      {
        heading: 'Make comparisons fair',
        body: 'A browser result includes more than a person’s response: display refresh and response time, operating-system scheduling, browser timing, mouse or touch latency, and the chosen input all contribute. Woods et al. measured and corrected hardware delay in their laboratory setup; that correction cannot be transferred to an unknown browser and device. For a useful personal trend, use the same display, browser, power mode and mouse, keyboard or touchscreen input. Compare complete five-round averages rather than selecting a single fastest attempt.',
      },
    ],
    faq: [
      {
        q: 'What is a reaction time test?',
        a: 'A simple visual reaction time test measures the delay between a visual cue and one intentional response. This test randomizes a 1.5–4.0-second wait, records five accepted responses in milliseconds, and reports lower values as faster.',
      },
      {
        q: 'What is a good reaction time in milliseconds?',
        a: 'A 2015 laboratory study of 1,469 adults aged 18–65 measured a 231 ms mean simple visual reaction time before its study-specific hardware correction. A browser result is not directly comparable because your display, browser and input device add their own delay, so use the number mainly to compare your own five-round sessions on the same setup.',
      },
      {
        q: 'How is the reaction-time percentile calculated?',
        a: 'The lab-reference percentile estimates how much of the Woods et al. 2015 laboratory distribution was slower than your five-round average, using its 231 ms mean and 27 ms standard deviation. It is a statistical reference, not a percentile of website users and not a clinical norm.',
      },
      {
        q: 'Why did my reaction-time round not count?',
        a: 'A press before the signal is a false start and is not recorded. A measured response under 100 ms is also excluded because it is likely an anticipated press rather than a response to the visible cue.',
      },
      {
        q: 'Can I take the reaction time test on a phone or keyboard?',
        a: 'Yes. Tap the large panel on a touchscreen, or focus it with Tab and use Space or Enter. Keep the same input method when comparing results because touch, mouse and keyboard latency can differ.',
      },
      {
        q: 'Are reaction-time results private?',
        a: 'Yes. The current five-round session and the best completed average are processed and stored in the browser you use. The tool does not require an account or send results to a server.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '반응속도 테스트 — 평균과 백분위 참고값',
    description:
      '클릭·터치·키보드로 5회 반응속도를 측정하세요. 평균, 중앙값, 기록 차이와 연구 참고 백분위를 브라우저에서 바로 확인합니다.',
    h1: '반응속도 테스트',
    tagline: '무작위 화면 신호에 5번 반응하고, 평균·중앙값·일관성 차이와 연구 참고 백분위를 계정 없이 확인합니다.',
    name: '반응속도 테스트',
    keywords: [
      '반응속도 테스트',
      '반응 시간 테스트',
      '반사신경 테스트',
      '순발력 테스트',
      '리액션 테스트',
      '반응속도 평균',
    ],
    howTo: [
      '큰 패드를 클릭하거나 터치합니다. 키보드는 Tab으로 패드에 초점을 맞춘 뒤 Space 또는 Enter를 누릅니다.',
      '대기 화면이 끝날 때까지 기다립니다. 신호 전에 누르면 해당 회차는 기록하지 않습니다.',
      '“지금 누르기”가 보이는 즉시 패드를 눌러 밀리초(ms) 기록을 만듭니다.',
      '같은 기기와 입력 방식으로 5회를 모두 진행해 비교 가능한 결과를 만듭니다.',
      '평균, 중앙값, 기록 차이, 연구 참고 백분위를 확인합니다. ms 값이 낮을수록 빠릅니다.',
    ],
    sections: [
      {
        heading: '5회 결과를 읽는 방법',
        body: '이 도구는 화면 신호를 보고 한 번 입력하는 단순 시각 반응시간을 잽니다. 회차마다 1.5~4.0초 사이를 무작위로 기다리므로 일정한 리듬으로 예상하기 어렵습니다. 평균은 인정된 기록의 합을 횟수로 나눈 값입니다. 중앙값은 기록을 정렬했을 때 가운데 값이라 유난히 빠르거나 느린 한 번의 영향이 더 작습니다. 기록 차이는 가장 느린 값에서 가장 빠른 값을 뺀 것으로, 작을수록 5회가 더 일정했습니다. 100ms 미만의 입력은 화면 신호를 본 뒤의 반응이라기보다 예상 입력일 가능성이 있어 기록하지 않습니다.',
      },
      {
        heading: '연구 참고 백분위의 계산 기준',
        body: '화면의 백분위는 사이트 이용자 순위가 아니라 결과를 이해하기 위한 참고값입니다. Woods 등(2015) 실험 1의 단순 시각 반응시간 자료를 정규분포로 근사하여, 내 5회 평균보다 느린 연구 참가자의 비율을 추정합니다. 이 연구는 18~65세 성인 1,469명을 측정했고, 장비 지연 보정 전 평균은 231ms, 표준편차는 27ms였습니다. 연구는 보정된 장비에서 1인당 120회 기록을 썼지만, 이 도구는 5회이고 내 화면·브라우저·입력 장치의 지연도 포함합니다. 따라서 이 비율은 의학적·운전 능력·인지 능력 판정에 사용할 수 없습니다.',
      },
      {
        heading: '내 기록을 공정하게 비교하려면',
        body: '브라우저에서 보이는 수치에는 사람의 반응뿐 아니라 디스플레이 주사율과 응답 속도, 운영체제와 브라우저의 처리 지연, 마우스·키보드·터치 입력 지연이 함께 들어갑니다. Woods 등의 연구에서 적용한 장비 지연 보정값을 서로 다른 내 기기에 그대로 뺄 수는 없습니다. 내 변화를 보려면 같은 화면, 브라우저, 전원 상태, 입력 장치를 유지하고 가장 빠른 한 번이 아니라 5회 평균끼리 비교합니다.',
      },
    ],
    faq: [
      {
        q: '반응속도 테스트는 무엇을 재나요?',
        a: '반응속도 테스트는 시각 신호가 나타난 뒤 의도적으로 한 번 입력할 때까지의 시간을 재는 도구입니다. 이 도구는 1.5~4.0초 무작위 대기 뒤의 인정된 반응 5회를 ms 단위로 기록하며, 수치가 낮을수록 빠릅니다.',
      },
      {
        q: '반응속도 평균은 몇 ms인가요?',
        a: 'Woods 등(2015)은 18~65세 성인 1,469명의 단순 시각 반응시간 평균을 장비 지연 보정 전 231ms로 보고했습니다. 브라우저 결과에는 내 화면과 입력 장치 지연이 더해지므로, 절대 비교보다 같은 환경에서 한 내 5회 평균을 비교하는 편이 적절합니다.',
      },
      {
        q: '반응속도 백분위는 어떻게 계산하나요?',
        a: '연구 참고 백분위는 Woods 등(2015)의 평균 231ms와 표준편차 27ms를 쓴 정규분포 근사에서 내 5회 평균보다 느린 비율을 추정합니다. 사이트 이용자 순위나 의학적 표준이 아니라 결과를 읽기 위한 통계 참고값입니다.',
      },
      {
        q: '반응속도 기록이 안 되는 경우는 왜 있나요?',
        a: '신호가 나오기 전에 누르면 너무 이른 입력으로 처리해 기록하지 않습니다. 측정된 값이 100ms 미만일 때도 화면 신호에 대한 반응보다 예상 입력일 가능성이 있어 제외합니다.',
      },
      {
        q: '휴대폰이나 키보드로 반응속도를 측정할 수 있나요?',
        a: '네. 휴대폰에서는 큰 패드를 터치하고, 키보드에서는 Tab으로 패드에 초점을 맞춘 뒤 Space 또는 Enter를 누릅니다. 터치·마우스·키보드의 입력 지연이 다를 수 있으므로 기록은 같은 입력 방식끼리 비교합니다.',
      },
      {
        q: '반응속도 기록이 서버에 저장되나요?',
        a: '아니요. 현재 5회 기록과 완료한 세션 중 가장 빠른 평균은 사용하는 브라우저 안에서만 처리하고 저장합니다. 계정이나 서버 전송이 필요하지 않습니다.',
      },
    ],
    ui: {
      testArea: '반응속도 테스트',
      testAreaHint: '회차를 시작하고 신호를 기다린 뒤, 화면이 바뀌는 즉시 패드를 누릅니다.',
      reset: '초기화',
      ready: '1회차 준비됨. 준비되면 시작합니다.',
      start: '클릭·터치 또는 Space로 시작',
      waiting: '신호가 나올 때까지 기다리기',
      go: '지금 누르기!',
      falseStart: '너무 일찍 눌렀습니다. 이 회차는 기록하지 않았습니다. 준비되면 다시 시작합니다.',
      tryAgain: '클릭해 다시 시도',
      roundDone: '기록했습니다. 준비되면 {round}회차를 시작합니다.',
      nextRound: '{round}회차 시작',
      complete: '5회 측정이 끝났습니다. 평균과 연구 참고값을 확인하거나 새 테스트를 시작합니다.',
      testAgain: '클릭해 새 테스트 시작',
      average: '평균',
      referencePercentile: '연구 참고 백분위',
      median: '중앙값',
      spread: '기록 차이',
      fasterThan: '상위 {n}%',
      ms: 'ms',
      rounds: '5회 기록',
      roundLabel: '{n}회차',
      personalBest: '5회 평균 최고 기록',
      personalBestHint: '이 브라우저에만 저장합니다. 낮을수록 빠릅니다.',
      keyboardControls: '키보드 조작',
      tabKey: 'Tab',
      spaceKey: 'Space',
      enterKey: 'Enter',
      focusPad: '테스트 패드에 초점 맞추기',
      pressPad: '시작 또는 반응 입력',
      referenceNote:
        '백분위는 의학적 진단이나 브라우저 순위가 아닌 연구 참고 추정값입니다. {min}ms 미만은 너무 이른 입력으로 보고 기록하지 않습니다.',
      localOnly: '현재 기록과 최고 평균은 이 브라우저에만 남으며 서버로 전송하지 않습니다.',
    },
  },
};
