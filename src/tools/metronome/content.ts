import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  ready: 'Ready to play',
  playing: 'Playing',
  bpm: 'BPM',
  start: 'Start',
  stop: 'Stop',
  tap: 'Tap tempo',
  reset: 'Reset settings',
  tapHint: 'Tap count: {n}. Tap twice or more at a steady pace to set BPM.',
  beatOf: 'Beat {current} of {total}',
  audioUnavailable: 'This browser could not start Web Audio. Check sound permissions, then try again.',
  tempo: 'Tempo (BPM)',
  tempoHint: 'Set a whole number from 20 to 300 beats per minute.',
  decreaseTempo: 'Decrease tempo by 1 BPM',
  increaseTempo: 'Increase tempo by 1 BPM',
  volume: 'Volume (%)',
  volumeHint: 'Set the click volume from 0 to 100 percent.',
  timeSignature: 'Time signature',
  timeSignatureHint: 'The first click is accented; 6/8 plays six eighth-note pulses per bar.',
  twoFour: '2/4',
  threeFour: '3/4',
  fourFour: '4/4',
  sixEight: '6/8',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Metronome — Accurate Web Audio Click and Tap Tempo',
    description:
      'Start a free online metronome with pre-scheduled Web Audio clicks, tap tempo, 20–300 BPM, keyboard controls and saved settings. No account needed.',
    h1: 'Online Metronome',
    tagline: 'Set a steady click in seconds with tap tempo, a clear first-beat accent and browser-saved settings.',
    name: 'Metronome',
    keywords: ['metronome', 'online metronome', 'tap tempo', 'BPM metronome', 'music practice click', 'tempo tool'],
    howTo: [
      'Set the tempo between 20 and 300 BPM, or press Tap tempo in time with the music.',
      'Choose 2/4, 3/4, 4/4 or 6/8 so the first click marks each bar.',
      'Press Start or Space to begin the click; press the same control again to stop it.',
      'Use T to tap a tempo while the page is open, then keep practicing at the detected BPM.',
    ],
    sections: [
      {
        heading: 'How this Web Audio metronome keeps a steadier click',
        body: 'The metronome schedules short click sounds on the browser’s Web Audio timeline instead of asking a JavaScript timer to make a sound at the exact instant of every beat. Every 25 milliseconds, it places upcoming clicks roughly 100 milliseconds ahead on that audio timeline. That look-ahead gives the audio engine a planned playback time even when a screen update arrives late. It does not remove latency added by Bluetooth headphones or a device’s speakers: for close timing practice, use wired headphones or speakers. The screen beat indicator is visual feedback only; the scheduled audio click is the timing reference.',
      },
      {
        heading: 'Tap tempo uses the average interval between your taps',
        body: 'BPM means beats per minute, so 60 BPM is one beat per second and 120 BPM is two beats per second. Tap tempo measures the gap between taps and calculates BPM as 60,000 divided by the average gap in milliseconds. This tool uses up to the latest seven intervals, so it begins setting a tempo after two taps and becomes less sensitive to one slightly early or late tap as you continue. A pause longer than 2 seconds starts a new tap sequence, preventing an old tempo from affecting the next song.',
      },
      {
        heading: 'Set the beat unit before practicing compound metre',
        body: 'The top number in a time signature tells you how many beat units occur in a bar. In 4/4, this metronome plays four clicks and accents click 1. In the 6/8 setting, it plays six eighth-note pulses and accents the first; many pieces are felt as two groups of three, so set the BPM for the pulse written in your score before starting. The accent is a higher-pitched click, which makes the start of the bar audible without adding a second control. The available settings cover common practice patterns while keeping the start controls visible.',
      },
    ],
    faq: [
      {
        q: 'How accurate is this online metronome?',
        a: 'Clicks are scheduled ahead on the Web Audio timeline rather than played directly from a repeating JavaScript timer. That keeps audio timing steadier during ordinary browser work, but Bluetooth and speaker processing can still add audible output delay.',
      },
      {
        q: 'How many taps do I need for tap tempo?',
        a: 'Two taps are enough to calculate an initial BPM because they create one interval. The metronome averages up to the latest seven intervals, so six to eight even taps usually give a more stable result than a single interval.',
      },
      {
        q: 'What BPM range does the metronome support?',
        a: 'This metronome accepts whole-number tempos from 20 to 300 BPM. At 60 BPM each pulse is 1 second apart, and at 120 BPM each pulse is 0.5 seconds apart.',
      },
      {
        q: 'Are my metronome settings saved?',
        a: 'Yes. Tempo, volume and time-signature choice are stored only in this browser’s local storage and are restored when you return. Starting audio still requires a button press or Space because browsers block automatic sound playback.',
      },
      {
        q: 'Which keyboard shortcuts work?',
        a: 'Space starts or stops the metronome, and T adds a tap-tempo beat. The shortcuts are ignored while a number input is focused, so they do not interfere with editing a BPM or volume value.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '메트로놈 — 정확한 Web Audio 박자·탭 템포',
    description:
      'Web Audio로 미리 예약한 박자와 탭 템포를 지원하는 무료 온라인 메트로놈입니다. 20~300 BPM, 단축키, 설정 저장을 가입 없이 제공합니다.',
    h1: '온라인 메트로놈',
    tagline: '탭 템포로 바로 BPM을 맞추고, 첫 박 강세와 저장되는 설정으로 연습을 이어갑니다.',
    name: '메트로놈',
    keywords: ['메트로놈', '온라인 메트로놈', '탭 템포', 'BPM 찾기', '박자기', '연습용 메트로놈'],
    howTo: [
      '20~300 BPM 범위에서 템포를 입력하거나 음악 박자에 맞춰 탭 템포를 누릅니다.',
      '2/4, 3/4, 4/4, 6/8 중 박자표를 골라 첫 박 강세 주기를 맞춥니다.',
      '시작 버튼이나 스페이스바를 눌러 소리를 내고, 같은 조작으로 멈춥니다.',
      '페이지를 보고 있는 동안 T 키로 탭 템포를 계속 입력해 감지한 BPM을 다듬습니다.',
    ],
    sections: [
      {
        heading: 'Web Audio로 다음 박을 미리 예약하는 방식',
        body: '이 메트로놈은 매 박이 올 때마다 자바스크립트 타이머로 소리를 즉시 내는 대신, 브라우저의 Web Audio 시간축에 짧은 클릭음을 예약합니다. 25밀리초마다 약 100밀리초 앞의 클릭을 예약하므로 화면 갱신이 조금 늦어져도 오디오 엔진에는 재생 시점이 미리 전달됩니다. 블루투스 이어폰이나 기기 스피커가 더하는 출력 지연까지 없애는 것은 아닙니다. 박자 연습을 정밀하게 하려면 유선 이어폰이나 스피커를 권합니다. 화면의 동그라미는 현재 박을 보여 주는 시각 피드백이고, 실제 기준은 예약된 소리입니다.',
      },
      {
        heading: '탭 템포는 여러 번 누른 간격의 평균으로 계산합니다',
        body: 'BPM은 분당 박 수이므로 60 BPM은 1초에 한 박, 120 BPM은 1초에 두 박입니다. 탭 템포는 탭 사이의 밀리초 간격 평균을 구한 뒤 60,000을 그 값으로 나누어 BPM을 계산합니다. 이 도구는 최근 최대 7개 간격을 사용하므로 두 번 누르면 첫 BPM을 보여 주고, 계속 일정하게 누를수록 한 번의 빠르거나 느린 탭에 덜 흔들립니다. 2초보다 길게 쉬면 새 탭 시퀀스로 시작해서 앞 곡의 템포가 다음 BPM에 섞이지 않습니다.',
      },
      {
        heading: '복합 박자는 악보의 기준 음표를 먼저 확인합니다',
        body: '박자표의 위 숫자는 한 마디 안에 있는 박 단위의 개수입니다. 4/4를 고르면 네 번의 클릭 중 첫 번째가 높은 소리로 울립니다. 6/8을 고르면 8분음표 기준으로 여섯 번 울리고 첫 번째를 강조합니다. 6/8은 흔히 3개씩 두 묶음으로 느끼므로, 악보에 적힌 기준 음표에 맞춰 BPM을 정한 뒤 시작하세요. 첫 박만 높은 음으로 들리게 해 마디가 시작되는 곳을 알 수 있게 했고, 자주 쓰는 박자표는 시작 버튼 가까이에서 바로 고를 수 있습니다.',
      },
    ],
    faq: [
      {
        q: '온라인 메트로놈의 박자는 얼마나 정확한가요?',
        a: '클릭음은 반복 자바스크립트 타이머가 아니라 Web Audio 시간축에 미리 예약됩니다. 일반적인 브라우저 작업 중에도 박자 간격을 더 안정적으로 유지하지만, 블루투스와 스피커의 출력 지연은 따로 발생할 수 있습니다.',
      },
      {
        q: '탭 템포는 몇 번 눌러야 하나요?',
        a: '두 번 누르면 한 번의 간격이 생겨 첫 BPM을 계산할 수 있습니다. 최근 최대 7개 간격의 평균을 쓰므로 6~8박 정도 일정하게 누르면 한 번의 오차보다 안정적인 BPM을 얻을 수 있습니다.',
      },
      {
        q: '메트로놈은 몇 BPM까지 지원하나요?',
        a: '이 메트로놈은 20~300 BPM의 정수 템포를 지원합니다. 60 BPM은 박 사이가 1초이고, 120 BPM은 박 사이가 0.5초입니다.',
      },
      {
        q: '설정은 새로고침해도 남나요?',
        a: '네. 템포, 음량, 박자표 선택은 이 브라우저의 로컬 저장소에만 보관되어 다시 방문해도 복원됩니다. 다만 브라우저의 자동 재생 제한 때문에 소리는 시작 버튼이나 스페이스바를 눌러야 납니다.',
      },
      {
        q: '키보드 단축키는 무엇인가요?',
        a: '스페이스바는 메트로놈 시작·정지, T는 탭 템포 입력입니다. BPM이나 음량 숫자 입력칸에 포커스가 있을 때는 단축키가 동작하지 않아 값을 안전하게 수정할 수 있습니다.',
      },
    ],
    ui: {
      ready: '재생 준비',
      playing: '재생 중',
      bpm: 'BPM',
      start: '시작',
      stop: '정지',
      tap: '탭 템포',
      reset: '설정 초기화',
      tapHint: '탭 횟수: {n}. 일정한 박자에 맞춰 2번 이상 누르면 BPM을 맞춥니다.',
      beatOf: '{total}박 중 {current}박',
      audioUnavailable: '이 브라우저에서 Web Audio를 시작할 수 없습니다. 소리 권한을 확인한 뒤 다시 시도하세요.',
      tempo: '템포 (BPM)',
      tempoHint: '분당 20~300박의 정수를 입력합니다.',
      decreaseTempo: '템포 1 BPM 낮추기',
      increaseTempo: '템포 1 BPM 높이기',
      volume: '음량 (%)',
      volumeHint: '클릭 음량을 0~100%로 설정합니다.',
      timeSignature: '박자표',
      timeSignatureHint: '첫 박은 강세로 들리며, 6/8은 한 마디에 8분음표 기준 6번 울립니다.',
      twoFour: '2/4',
      threeFour: '3/4',
      fourFour: '4/4',
      sixEight: '6/8',
    },
  },
};
