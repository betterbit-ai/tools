import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  recorder: 'Voice recorder',
  start: 'Start recording',
  pause: 'Pause',
  resume: 'Resume',
  stop: 'Stop and make MP3',
  newRecording: 'New recording',
  download: 'Download MP3',
  playback: 'Playback',
  microphone: 'Microphone',
  deviceHint: 'Choose an input before recording. Names appear after you allow access.',
  defaultDevice: 'System default',
  unnamedMicrophone: 'Microphone',
  elapsed: 'Recorded',
  format: 'Download format',
  formatValue: 'MP3 · 128 kbps',
  localOnly: 'Your microphone audio stays in this browser until you download the MP3.',
  ready: 'Ready to record. Your browser will ask for microphone permission.',
  requesting: 'Waiting for microphone permission…',
  recording: 'Recording locally. Pause whenever you need to.',
  paused: 'Paused. Resume to continue in the same MP3.',
  processing: 'Making your MP3 on this device…',
  readyToDownload: 'Your MP3 is ready. Listen, then download it.',
  unsupported:
    'This browser cannot make a local microphone recording. Use a current Chrome, Safari or Firefox over HTTPS.',
  permissionDenied: 'Microphone access was blocked. Allow it in your browser’s site settings, then try again.',
  noMicrophone: 'No microphone was found. Connect one and try again.',
  microphoneBusy: 'The microphone is unavailable. Close another app using it, then try again.',
  startError: 'The microphone could not be started. Reload the page and try again.',
  recordingFailed: 'The browser could not complete this recording. Start a new recording and try again.',
  encodeFailed:
    'The recording was captured, but this browser could not make an MP3. Try a shorter recording or another current browser.',
  shortcutRecord: 'start recording',
  shortcutPause: 'pause or resume',
  shortcutStop: 'stop',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Online Voice Recorder — Save a Private MP3',
    description:
      'Record your voice from a microphone, pause and resume, then listen and download an MP3. Audio is captured and encoded locally in your browser.',
    h1: 'Online Voice Recorder',
    tagline: 'Record, pause, listen and save an MP3 without sending your voice recording to a server.',
    name: 'Voice Recorder',
    keywords: [
      'online voice recorder',
      'record voice online',
      'record audio from microphone',
      'browser voice recorder',
      'mp3 voice recorder',
    ],
    howTo: [
      'Choose a microphone if you have more than one input connected.',
      'Select Start recording and allow microphone access in the browser prompt.',
      'Speak, then Pause or Resume whenever you need a break.',
      'Select Stop and make MP3, listen to the result, then select Download MP3.',
    ],
    sections: [
      {
        heading: 'How this browser voice recorder makes an MP3',
        body: 'The browser captures your microphone with MediaRecorder, then decodes that temporary local audio and encodes a 128 kbps MP3 in a Web Worker on your device. MP3 is widely supported by phones, computers and messaging apps. Encoding starts only after you stop, so a longer recording can take a moment and uses device memory while it is being processed. Betterbit does not upload the captured audio or create a share link; download a recording you want to keep before closing or refreshing the page.',
      },
      {
        heading: 'Permission, microphone choice and clean speech',
        body: 'A browser can access a microphone only on a secure HTTPS page after you allow permission. Device names may be hidden until you grant it once; then choose a built-in mic, USB mic, webcam or headset input before starting the next recording. For clearer speech, keep the microphone roughly a hand’s width away, point it slightly beside your mouth to reduce breath pops, and use headphones if another device is playing audio nearby. Pause time is not included in the saved MP3.',
      },
      {
        heading: 'A recording is not a consent check',
        body: 'This tool records only the microphone stream the browser gives it. It does not capture system audio, phone calls or another person’s device. Laws and workplace, school or meeting rules about recording people differ by location and context. Get consent from everyone required before recording or sharing a conversation, and keep the downloaded file somewhere you control.',
      },
    ],
    faq: [
      {
        q: 'Is my voice recording uploaded to a server?',
        a: 'No. Microphone capture, temporary browser audio, MP3 encoding, playback and download happen on this device. Betterbit does not receive the recording or create a hosted share link; closing or refreshing the page can discard an undownloaded result.',
      },
      {
        q: 'What format does this online voice recorder save?',
        a: 'The completed download is an MP3 encoded at 128 kbps. The browser may temporarily capture a different internal format such as WebM, Ogg or M4A, depending on its MediaRecorder support, but the download is made locally as an MP3 after you stop.',
      },
      {
        q: 'Can I pause and continue the same voice recording?',
        a: 'Yes. Select Pause to stop the recording clock, then Resume to continue the same recording. The period while it is paused is not added to the final MP3.',
      },
      {
        q: 'Why can’t I see my microphone in the list?',
        a: 'Browsers commonly hide microphone names until you allow microphone permission. Start a recording once and allow access, then choose the input before your next recording. If it remains unavailable, reconnect the device, check operating-system microphone privacy settings and close apps that may be using it.',
      },
      {
        q: 'Does the voice recorder work on a phone?',
        a: 'Current mobile browsers that support secure microphone capture and MediaRecorder can record and make the MP3 locally. Keep the browser tab in the foreground and the screen awake while recording, because phones may suspend microphone access after the screen locks or an app takes focus.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '온라인 녹음기 — 업로드 없이 MP3 저장',
    description:
      '마이크로 음성을 녹음하고 일시 정지·재개한 뒤 MP3로 저장하세요. 녹음과 MP3 변환은 브라우저 안에서 처리되어 음성이 서버로 전송되지 않습니다.',
    h1: '온라인 녹음기',
    tagline: '마이크로 바로 녹음하고, 멈추고, 들어본 뒤 업로드 없이 MP3로 저장합니다.',
    name: '음성 녹음',
    keywords: ['온라인 녹음기', '음성 녹음', '마이크 녹음', '녹음기', 'MP3 녹음', '보이스 레코더'],
    howTo: [
      '여러 입력 장치가 있으면 사용할 마이크를 고릅니다.',
      '녹음 시작을 누르고 브라우저 권한 창에서 마이크 사용을 허용합니다.',
      '말한 뒤 잠시 멈출 때는 일시 정지를 누르고, 계속할 때는 다시 시작을 누릅니다.',
      '녹음 중지 및 MP3 만들기를 누르고 결과를 들은 뒤 MP3 다운로드를 누릅니다.',
    ],
    sections: [
      {
        heading: '브라우저에서 MP3를 만드는 과정',
        body: '브라우저가 MediaRecorder로 마이크를 녹음한 뒤, 임시 로컬 오디오를 해독하고 이 기기에서 Web Worker로 128kbps MP3를 만듭니다. MP3는 휴대폰·컴퓨터·메신저 앱에서 널리 재생되는 형식입니다. 녹음 중지가 끝난 뒤에 변환하므로 긴 녹음은 잠시 시간이 걸리고 기기 메모리를 사용합니다. Betterbit은 녹음 파일을 업로드하거나 공유 링크를 만들지 않으므로, 보관할 녹음은 페이지를 닫거나 새로고침하기 전에 내려받으세요.',
      },
      {
        heading: '마이크 권한과 또렷하게 녹음하는 방법',
        body: '브라우저에서 마이크를 쓰려면 HTTPS 페이지에서 권한을 허용해야 합니다. 장치 이름은 처음 권한을 허용하기 전까지 숨겨질 수 있으며, 그 뒤 내장 마이크·USB 마이크·웹캠·헤드셋 중 다음 녹음에 쓸 입력을 고를 수 있습니다. 말소리를 또렷하게 하려면 입에서 손 한 뼘 정도 거리를 두고 숨소리가 직접 닿지 않게 약간 옆을 향합니다. 다른 소리가 재생 중이면 헤드폰을 사용하세요. 일시 정지한 시간은 저장하는 MP3에 들어가지 않습니다.',
      },
      {
        heading: '녹음 동의는 직접 확인해야 합니다',
        body: '이 도구는 브라우저가 제공한 마이크 입력만 녹음합니다. 시스템 소리, 통화 소리, 다른 사람의 기기는 녹음하지 않습니다. 사람의 대화를 녹음하거나 공유하는 규정과 법률은 장소와 상황에 따라 다릅니다. 대화나 회의를 녹음·공유하기 전에는 필요한 모든 사람에게 동의를 받고, 내려받은 파일도 직접 관리할 수 있는 곳에 보관하세요.',
      },
    ],
    faq: [
      {
        q: '온라인 녹음기로 녹음한 음성이 서버에 업로드되나요?',
        a: '아니요. 마이크 입력, 브라우저 임시 녹음, MP3 변환, 재생과 다운로드는 모두 이 기기에서 처리됩니다. Betterbit은 녹음 파일을 받거나 공유 링크를 만들지 않으므로, 내려받지 않은 결과는 페이지를 닫거나 새로고침하면 사라질 수 있습니다.',
      },
      {
        q: '온라인 녹음기는 어떤 파일 형식으로 저장되나요?',
        a: '완성된 다운로드는 128kbps MP3입니다. 브라우저는 MediaRecorder 지원에 따라 WebM·Ogg·M4A 같은 임시 형식으로 녹음할 수 있지만, 중지한 뒤 이 기기에서 MP3로 변환해 저장합니다.',
      },
      {
        q: '녹음 중간에 멈췄다가 같은 파일로 계속 녹음할 수 있나요?',
        a: '네. 일시 정지를 누르면 녹음 시간도 멈추고, 다시 시작을 누르면 같은 녹음을 이어갑니다. 일시 정지한 구간은 최종 MP3에 포함되지 않습니다.',
      },
      {
        q: '마이크 목록에 사용할 장치가 보이지 않는 이유는 무엇인가요?',
        a: '브라우저는 마이크 권한을 허용하기 전까지 장치 이름을 숨기는 경우가 많습니다. 한 번 녹음 시작으로 권한을 허용한 뒤 다음 녹음 전에 입력을 고르세요. 계속 보이지 않으면 장치를 다시 연결하고 운영체제의 마이크 권한, 다른 앱의 마이크 사용 여부를 확인합니다.',
      },
      {
        q: '휴대폰에서도 온라인 녹음기를 쓸 수 있나요?',
        a: 'HTTPS 마이크 입력과 MediaRecorder를 지원하는 최신 모바일 브라우저에서는 이 기기에서 녹음하고 MP3를 만들 수 있습니다. 녹음 중에는 브라우저 탭을 앞에 두고 화면을 켜 두세요. 화면을 잠그거나 다른 앱으로 이동하면 휴대폰이 마이크 접근을 멈출 수 있습니다.',
      },
    ],
    ui: {
      recorder: '음성 녹음기',
      start: '녹음 시작',
      pause: '일시 정지',
      resume: '다시 시작',
      stop: '녹음 중지 및 MP3 만들기',
      newRecording: '새 녹음',
      download: 'MP3 다운로드',
      playback: '녹음 재생',
      microphone: '마이크',
      deviceHint: '녹음 전에 입력 장치를 고릅니다. 권한 허용 뒤 장치 이름이 표시됩니다.',
      defaultDevice: '시스템 기본값',
      unnamedMicrophone: '마이크',
      elapsed: '녹음 시간',
      format: '저장 형식',
      formatValue: 'MP3 · 128kbps',
      localOnly: '마이크 음성은 MP3를 내려받을 때까지 이 브라우저 안에만 있습니다.',
      ready: '녹음 준비가 되었습니다. 시작하면 브라우저가 마이크 권한을 요청합니다.',
      requesting: '마이크 권한을 기다리는 중…',
      recording: '이 기기에서 녹음 중입니다. 필요할 때 일시 정지할 수 있습니다.',
      paused: '일시 정지되었습니다. 다시 시작하면 같은 MP3에 이어서 녹음합니다.',
      processing: '이 기기에서 MP3를 만드는 중…',
      readyToDownload: 'MP3가 준비되었습니다. 들어본 뒤 내려받으세요.',
      unsupported:
        '이 브라우저에서는 로컬 마이크 녹음을 할 수 없습니다. HTTPS에서 최신 Chrome, Safari 또는 Firefox를 사용하세요.',
      permissionDenied: '마이크 권한이 차단되었습니다. 브라우저의 사이트 설정에서 허용한 뒤 다시 시도하세요.',
      noMicrophone: '마이크를 찾지 못했습니다. 장치를 연결한 뒤 다시 시도하세요.',
      microphoneBusy: '마이크를 사용할 수 없습니다. 마이크를 쓰는 다른 앱을 닫고 다시 시도하세요.',
      startError: '마이크를 시작하지 못했습니다. 페이지를 새로고침한 뒤 다시 시도하세요.',
      recordingFailed: '브라우저에서 녹음을 완료하지 못했습니다. 새 녹음으로 다시 시도하세요.',
      encodeFailed:
        '녹음은 되었지만 이 브라우저에서 MP3를 만들지 못했습니다. 더 짧게 녹음하거나 최신 브라우저에서 다시 시도하세요.',
      shortcutRecord: '녹음 시작',
      shortcutPause: '일시 정지 또는 다시 시작',
      shortcutStop: '녹음 중지',
    },
  },
};
