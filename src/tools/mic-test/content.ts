import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  liveTest: 'Live microphone test',
  localOnly: 'Audio is analysed and recorded only in this browser tab.',
  startTest: 'Start test',
  stopTest: 'Stop test',
  inputLevel: 'Input level',
  startRecording: 'Record 10 seconds',
  stopRecording: 'Stop recording',
  recordingReady: 'Recording ready to play',
  recordingHint: 'The recording stops automatically after 10 seconds and disappears when this page closes.',
  recordingLimit: ' / 0:10',
  playback: 'Recording playback',
  microphone: 'Microphone',
  deviceHint: 'Choose a connected input. Names appear after you allow access.',
  defaultDevice: 'System default',
  unnamedMicrophone: 'Microphone',
  peakLevel: 'Peak level',
  sampleRate: 'Sample rate',
  unavailable: '—',
  hertz: 'Hz',
  ready: 'Ready — start the test when you are ready to grant microphone access.',
  listening: 'Listening now. Speak normally and watch the meter.',
  quiet: 'Very little signal. Check the selected microphone and its input volume.',
  signalGood: 'Signal detected. Keep normal speech below the top of the meter.',
  clipping: 'Input is clipping. Lower microphone gain or move farther away.',
  permissionDenied: 'Microphone access was blocked. Allow it in your browser’s site settings, then try again.',
  noMicrophone: 'No microphone was found. Connect one and try again.',
  startError: 'The microphone could not be started. Close other apps using it and try again.',
  recordingUnsupported: 'This browser can test the microphone but cannot make a local recording.',
  shortcutStartStop: 'start or stop',
  shortcutRecord: 'record a 10-second sample',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Mic Test — level meter and local playback',
    description:
      'Test your microphone with a live level meter, input picker and 10-second local recording. Audio stays in your browser and is never uploaded.',
    h1: 'Mic Test',
    tagline:
      'Check the right microphone, see its input level, then record a short sample and hear it back — entirely in your browser.',
    name: 'Mic Test',
    keywords: [
      'microphone test',
      'test my mic',
      'mic check',
      'microphone checker',
      'online mic test',
      'record and playback',
    ],
    howTo: [
      'Choose a microphone if more than one is connected.',
      'Select Start test and allow microphone access in the browser prompt.',
      'Speak at your normal call volume and watch the input meter.',
      'Select Record 10 seconds, say a few words, then play the sample back.',
    ],
    sections: [
      {
        heading: 'What the level meter measures',
        body: 'The meter shows peak level in dBFS: decibels relative to the largest digital signal the browser can represent. 0 dBFS is the ceiling, not a real-world sound-pressure measurement. For ordinary speech, peaks roughly between −12 and −6 dBFS leave useful headroom; repeated peaks at 0 dBFS mean the input is clipping and may sound distorted. Browser processing, microphone gain, distance and room noise all affect the reading.',
      },
      {
        heading: 'Why a short recording helps',
        body: 'A moving meter confirms that the browser receives a signal, but it cannot tell you whether your voice sounds clear through your speakers or headphones. The 10-second sample is recorded as a temporary in-memory browser Blob and played on this device. It is not uploaded, saved to an account or retained after the page closes.',
      },
      {
        heading: 'Choose the same input as your call app',
        body: 'After you grant permission, browsers can reveal connected input names such as a built-in microphone, USB interface, webcam or headset. Select the same device in the meeting or recording app you will use. This page can confirm browser capture, but Zoom, Teams, Discord and other apps may apply their own input processing and device selection.',
      },
    ],
    faq: [
      {
        q: 'Does this mic test upload or store my voice?',
        a: 'No. The live analysis and optional 10-second recording run in the current browser tab. The recording is held only as a temporary local Blob for playback and is discarded when the page closes or you make a new recording.',
      },
      {
        q: 'What does 0 dBFS mean on a microphone test?',
        a: '0 dBFS is the maximum digital level, so audio that repeatedly reaches it is clipping and can distort. Normal speaking peaks around −12 to −6 dBFS usually leave headroom, although the right level depends on the microphone, distance and the app that will use it.',
      },
      {
        q: 'Why is my microphone not listed?',
        a: 'Many browsers hide microphone names until you allow microphone permission. Start the test once, then open the Microphone menu. If it is still absent, reconnect the device, check operating-system microphone privacy settings and close another app that may be using it.',
      },
      {
        q: 'Why does the meter move but the recording sound different in my meeting?',
        a: 'This test checks the browser stream, while meeting apps can use a different selected device and apply echo cancellation, noise suppression or automatic gain control. Select the same microphone in the app and use that app’s own test before an important call.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '마이크 테스트 — 레벨 확인·10초 녹음 재생',
    description:
      '마이크 입력 레벨과 연결된 장치를 확인하고 10초 녹음으로 직접 들어보세요. 음성은 브라우저 안에서만 처리되며 업로드되지 않습니다.',
    h1: '마이크 테스트',
    tagline: '쓸 마이크를 고르고 입력 레벨을 확인한 다음, 10초 시험 녹음으로 실제 들리는 소리까지 점검합니다.',
    name: '마이크 테스트',
    keywords: [
      '마이크 테스트',
      '마이크 소리 테스트',
      '마이크 확인',
      '마이크 녹음 테스트',
      '노트북 마이크 테스트',
      '헤드셋 마이크 테스트',
    ],
    howTo: [
      '여러 마이크가 연결되어 있으면 사용할 장치를 고릅니다.',
      '테스트 시작을 누르고 브라우저 권한 창에서 마이크 사용을 허용합니다.',
      '평소 통화하듯 말하면서 입력 레벨 막대가 움직이는지 확인합니다.',
      '10초 녹음을 눌러 짧게 말한 뒤 재생으로 소리를 확인합니다.',
    ],
    sections: [
      {
        heading: '입력 레벨의 dBFS는 무엇인가요?',
        body: '레벨은 브라우저가 표현할 수 있는 최대 디지털 신호를 기준으로 한 dBFS로 표시합니다. 0 dBFS는 실제 소리 크기(dB SPL)가 아니라 디지털 입력의 상한입니다. 보통 말할 때 최고점이 약 −12~−6 dBFS이면 여유가 있고, 0 dBFS에 계속 닿으면 클리핑으로 소리가 찌그러질 수 있습니다. 마이크 게인, 입과의 거리, 방 소음, 브라우저 처리에 따라 값은 달라집니다.',
      },
      {
        heading: '파형보다 녹음 재생이 중요한 이유',
        body: '레벨 막대가 움직이면 브라우저가 입력을 받고 있다는 뜻이지만, 상대에게 어떻게 들리는지는 알 수 없습니다. 이 도구는 최대 10초를 이 브라우저의 임시 메모리에만 녹음해 재생합니다. 녹음은 서버나 계정에 저장되지 않으며 페이지를 닫거나 새 녹음을 만들면 사라집니다.',
      },
      {
        heading: '회의 앱에서도 같은 장치를 선택하세요',
        body: '권한을 허용한 뒤에는 노트북 내장 마이크, USB 마이크, 웹캠, 헤드셋처럼 연결된 입력 장치 이름을 선택할 수 있습니다. Zoom, Teams, 디스코드 같은 앱에서도 같은 장치를 골라야 합니다. 이 테스트는 브라우저의 입력을 확인하며, 각 앱은 별도 장치 선택과 잡음 억제·에코 제거 같은 처리를 적용할 수 있습니다.',
      },
    ],
    faq: [
      {
        q: '마이크 테스트에서 녹음한 소리가 서버에 저장되나요?',
        a: '아니요. 실시간 분석과 선택한 10초 녹음은 현재 브라우저 탭 안에서만 처리됩니다. 녹음은 재생을 위한 임시 로컬 Blob으로만 남고, 페이지를 닫거나 새 녹음을 만들면 사라집니다.',
      },
      {
        q: '0 dBFS는 어떤 뜻인가요?',
        a: '0 dBFS는 디지털 입력이 표현할 수 있는 최대치입니다. 이 값에 반복해서 닿으면 클리핑으로 왜곡될 수 있습니다. 보통 말할 때 최고점이 약 −12~−6 dBFS이면 여유가 있지만, 적정값은 마이크·거리·사용할 앱에 따라 달라집니다.',
      },
      {
        q: '마이크 목록에 장치가 보이지 않는 이유는 무엇인가요?',
        a: '많은 브라우저는 마이크 권한을 허용하기 전까지 장치 이름을 숨깁니다. 테스트 시작으로 한 번 권한을 허용한 뒤 마이크 메뉴를 확인하세요. 계속 보이지 않으면 장치를 다시 연결하고 운영체제의 마이크 권한과 다른 앱의 마이크 사용 여부를 확인합니다.',
      },
      {
        q: '레벨은 움직이는데 Zoom이나 디스코드에서는 왜 다르게 들리나요?',
        a: '이 도구는 브라우저의 입력 스트림을 확인하지만, 회의 앱은 다른 장치를 선택하거나 에코 제거·잡음 억제·자동 게인 조절을 적용할 수 있습니다. 중요한 통화 전에는 앱에서도 같은 마이크를 선택하고 자체 테스트를 한 번 더 실행합니다.',
      },
    ],
    ui: {
      liveTest: '실시간 마이크 테스트',
      localOnly: '음성은 이 브라우저 탭 안에서만 분석하고 녹음합니다.',
      startTest: '테스트 시작',
      stopTest: '테스트 중지',
      inputLevel: '입력 레벨',
      startRecording: '10초 녹음',
      stopRecording: '녹음 중지',
      recordingReady: '녹음 재생 준비 완료',
      recordingHint: '녹음은 10초 뒤 자동으로 멈추며, 페이지를 닫으면 사라집니다.',
      recordingLimit: ' / 0:10',
      playback: '녹음 재생',
      microphone: '마이크',
      deviceHint: '연결된 입력 장치를 고릅니다. 권한 허용 뒤 이름이 표시됩니다.',
      defaultDevice: '시스템 기본값',
      unnamedMicrophone: '마이크',
      peakLevel: '최대 레벨',
      sampleRate: '샘플 레이트',
      unavailable: '—',
      hertz: 'Hz',
      ready: '준비됨 — 마이크 권한을 허용할 준비가 되면 테스트를 시작합니다.',
      listening: '입력 확인 중입니다. 평소처럼 말하면서 레벨을 확인합니다.',
      quiet: '입력 신호가 매우 작습니다. 선택한 마이크와 입력 음량을 확인합니다.',
      signalGood: '입력이 감지되었습니다. 레벨 막대의 끝에 계속 닿지 않게 말합니다.',
      clipping: '입력이 클리핑됩니다. 마이크 게인을 낮추거나 마이크에서 조금 떨어집니다.',
      permissionDenied: '마이크 권한이 차단되었습니다. 브라우저의 사이트 설정에서 허용한 뒤 다시 시도합니다.',
      noMicrophone: '마이크를 찾지 못했습니다. 장치를 연결한 뒤 다시 시도합니다.',
      startError: '마이크를 시작하지 못했습니다. 마이크를 쓰는 다른 앱을 닫고 다시 시도합니다.',
      recordingUnsupported: '이 브라우저에서는 마이크 입력은 확인할 수 있지만 로컬 녹음은 지원하지 않습니다.',
      shortcutStartStop: '테스트 시작 또는 중지',
      shortcutRecord: '10초 녹음',
    },
  },
};
