import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  recorder: 'Screen recorder',
  start: 'Start recording',
  pause: 'Pause',
  resume: 'Resume',
  stop: 'Stop recording',
  newRecording: 'New recording',
  download: 'Download recording',
  playback: 'Preview recording',
  microphone: 'Microphone',
  microphoneHint: 'Optional. Your browser asks separately if this is on.',
  includeMicrophone: 'Include my microphone',
  elapsed: 'Recorded',
  format: 'Download format',
  formatValue: 'Browser video',
  webm: 'WebM',
  mp4: 'MP4',
  localOnly: 'The recording stays in this browser until you download it.',
  systemAudioHint:
    'To include tab or system sound, enable Share audio in the browser sharing picker when it is available.',
  ready: 'Choose what to share in the browser picker, then recording starts.',
  requesting: 'Waiting for the browser sharing picker…',
  recording: 'Recording on this device. You can pause whenever you need to.',
  paused: 'Paused. Resume to continue the same recording.',
  readyToDownload: 'Your recording is ready. Preview it, then download the file.',
  unsupported:
    'This browser cannot record a screen here. Use a current desktop Chrome, Edge, Firefox or Safari over HTTPS.',
  permissionDenied:
    'Screen sharing or microphone permission was blocked. Allow it in the browser prompt or site settings, then try again.',
  noDisplay: 'No screen, window or tab is available to share. Open the content you want to record and try again.',
  captureBusy: 'The selected screen could not be captured. Close another app using screen capture and try again.',
  cancelled: 'Screen selection was cancelled. Select a screen, window or tab to start recording.',
  startError: 'The screen recording could not start. Reload the page and try again.',
  recordingFailed: 'The browser could not complete this recording. Start a new recording and try again.',
  shortcutRecord: 'start recording',
  shortcutPause: 'pause or resume',
  shortcutStop: 'stop',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Screen Recorder Online — Download Locally',
    description:
      'Record a screen, window or browser tab online, with optional microphone audio. Preview and download the browser-made video locally, with no upload or conversion step.',
    h1: 'Online Screen Recorder',
    tagline: 'Record a screen, window or tab, then download the browser-made video directly from this device.',
    name: 'Screen Recorder',
    keywords: [
      'screen recorder online',
      'record screen online',
      'browser screen recorder',
      'record browser tab',
      'screen recording',
    ],
    howTo: [
      'Turn on Include my microphone if you want to narrate the recording.',
      'Select Start recording, then choose a screen, window or browser tab in the browser picker.',
      'Enable Share audio in that picker when it is offered and you want tab or system sound.',
      'Pause or resume as needed, then select Stop recording or stop sharing from the browser bar.',
      'Preview the finished video and select Download recording to save it locally.',
    ],
    sections: [
      {
        heading: 'What this online screen recorder captures',
        body: 'Screen capture uses the browser’s getDisplayMedia API. Each time you start, the browser—not this page—shows the picker for a full display, an application window or an individual tab. The picker’s audio option is browser- and operating-system-dependent: sharing a tab often offers tab audio, while sharing a full display may or may not offer system audio. Turning on Include my microphone asks separately for microphone access and adds that input to the recording. The browser records its chosen stream locally and this tool creates a video Blob only after you stop.',
      },
      {
        heading: 'Local download and video format',
        body: 'The recording remains in this browser’s memory until you preview or download it; Betterbit does not upload it, make a share link or convert it on a server. Chrome, Edge and Firefox commonly produce WebM because their MediaRecorder implementations support WebM codecs; some browsers can produce MP4 instead. The download button shows the actual browser-made format and gives it a timestamped filename. Long recordings use more available memory and disk space while open, so download an important recording before refreshing or closing the tab.',
      },
      {
        heading: 'Permission and sensitive information',
        body: 'Browsers require a direct click before showing the sharing picker and ask again for every new screen-capture session. Choose a single tab or window when that is enough: it limits what can appear in the video, including notifications or other apps. Check the picker’s preview before confirming, and stop sharing from either this page or the browser’s sharing control. Recording people, meetings or copyrighted material can be restricted by law, workplace policy or platform terms; obtain the required permission before recording or sharing a file.',
      },
    ],
    faq: [
      {
        q: 'Is my screen recording uploaded to a server?',
        a: 'No. The browser captures the selected screen stream, builds the video and previews it on this device. Betterbit does not receive the video or make a hosted share link; an undownloaded recording can be lost when the page is refreshed or closed.',
      },
      {
        q: 'Can I record computer or browser-tab audio?',
        a: 'It depends on the browser, operating system and source selected in the sharing picker. When the picker shows Share audio, turn it on before starting; browser tabs commonly offer tab audio, while full-display system audio availability varies. The optional microphone switch records your own microphone separately.',
      },
      {
        q: 'What file format will my screen recording download in?',
        a: 'The file uses the format produced by the browser’s MediaRecorder, normally WebM in Chrome, Edge and Firefox and sometimes MP4 in browsers that support it. The result panel identifies the actual WebM or MP4 download instead of uploading the video for conversion.',
      },
      {
        q: 'Why did the screen-sharing picker not appear?',
        a: 'Screen sharing must begin from a direct page action in a secure HTTPS context, and browsers do not keep permission for future sessions. Select Start recording again, use a current desktop browser, and check whether a privacy setting, another capture app or an embedded browser is blocking the picker.',
      },
      {
        q: 'Can I record my phone screen with this web recorder?',
        a: 'Most phone and tablet browsers do not expose full screen capture to web pages, so use the screen recorder built into iOS or Android for a phone display. This tool is intended for a current desktop browser that offers a screen, window or tab picker.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '온라인 화면 녹화 — 업로드 없이 바로 저장',
    description:
      'PC 화면·창·브라우저 탭을 온라인에서 녹화하고, 필요하면 마이크도 함께 담으세요. 서버 업로드나 변환 대기 없이 브라우저가 만든 영상 파일을 바로 저장합니다.',
    h1: '온라인 화면 녹화',
    tagline: '설치 없이 화면·창·탭을 녹화하고, 이 기기에서 미리 본 뒤 바로 파일로 저장합니다.',
    name: '화면 녹화',
    keywords: [
      '화면 녹화',
      '온라인 화면 녹화',
      '컴퓨터 화면 녹화',
      '화면 녹화 프로그램',
      '브라우저 탭 녹화',
      '스크린 녹화',
    ],
    howTo: [
      '내 목소리도 담으려면 내 마이크 포함을 켭니다.',
      '녹음 시작을 누른 뒤 브라우저 선택 창에서 전체 화면, 창 또는 탭을 고릅니다.',
      '탭 소리나 시스템 소리를 넣으려면 선택 창에 표시될 때 오디오 공유를 켭니다.',
      '필요할 때 일시 정지·다시 시작하고, 녹음 중지 또는 브라우저 공유 막대의 중지를 누릅니다.',
      '완성된 영상을 미리 본 뒤 녹화 다운로드를 눌러 이 기기에 저장합니다.',
    ],
    sections: [
      {
        heading: '온라인 화면 녹화에 담기는 범위',
        body: '이 도구는 브라우저의 getDisplayMedia 기능을 사용합니다. 녹음 시작을 누를 때마다 이 페이지가 아니라 브라우저가 전체 화면·앱 창·개별 탭을 고르는 선택 창을 표시합니다. 선택 창의 오디오 공유 항목은 브라우저와 운영체제, 고른 대상에 따라 달라집니다. 탭을 고르면 탭 오디오가 제공되는 경우가 많지만 전체 화면의 시스템 소리는 제공되지 않을 수 있습니다. 내 마이크 포함을 켜면 마이크 권한을 별도로 요청하고 그 입력을 함께 녹음합니다. 선택한 스트림은 브라우저에서 녹화되고, 중지한 뒤에만 영상 Blob이 만들어집니다.',
      },
      {
        heading: '업로드 없는 저장 형식',
        body: '녹화본은 미리 보거나 내려받을 때까지 이 브라우저의 메모리에만 남습니다. Betterbit은 영상을 업로드하거나 공유 링크를 만들지 않고, 서버에서 형식을 바꾸지도 않습니다. Chrome·Edge·Firefox는 MediaRecorder가 지원하는 WebM 형식으로 만드는 경우가 많고, 일부 브라우저에서는 MP4로 만들어질 수 있습니다. 다운로드 버튼에는 실제로 브라우저가 만든 형식이 표시되고 날짜·시간이 들어간 파일명으로 저장됩니다. 긴 녹화는 탭을 열어 둔 동안 기기의 메모리와 여유 공간을 더 쓰므로 중요한 영상은 새로고침하거나 탭을 닫기 전에 저장하세요.',
      },
      {
        heading: '권한과 민감한 화면 확인',
        body: '브라우저는 화면 선택 창을 띄우려면 사용자가 직접 버튼을 눌러야 하며, 화면 녹화 권한을 다음 녹화에 자동으로 이어서 허용하지 않습니다. 충분하다면 전체 화면 대신 한 탭이나 한 창만 고르세요. 알림이나 다른 앱처럼 영상에 원치 않는 내용이 들어갈 범위를 줄일 수 있습니다. 공유 전에 선택 창의 미리보기를 확인하고, 이 페이지 또는 브라우저의 공유 막대에서 언제든 중지합니다. 사람·회의·저작물을 녹화하거나 공유하는 일은 법률·회사 규정·서비스 약관의 제한을 받을 수 있으므로 필요한 동의를 먼저 받으세요.',
      },
    ],
    faq: [
      {
        q: '화면 녹화 파일이 서버에 업로드되나요?',
        a: '아니요. 브라우저가 선택한 화면 스트림을 이 기기에서 녹화하고 영상 파일을 만든 뒤 미리 보여 줍니다. Betterbit은 영상을 받거나 공유 링크를 만들지 않으므로, 저장하지 않은 녹화본은 페이지를 새로고침하거나 닫으면 사라질 수 있습니다.',
      },
      {
        q: '컴퓨터 소리나 브라우저 탭 소리도 화면 녹화에 넣을 수 있나요?',
        a: '가능 여부는 브라우저·운영체제·선택한 대상에 따라 달라집니다. 화면 선택 창에 오디오 공유가 나타나면 녹음 전에 켜세요. 탭을 공유할 때는 탭 소리가 제공되는 경우가 많고, 전체 화면의 시스템 소리는 환경에 따라 제공되지 않을 수 있습니다. 내 마이크 포함은 별도로 내 목소리를 녹음합니다.',
      },
      {
        q: '화면 녹화는 어떤 파일 형식으로 저장되나요?',
        a: '다운로드 파일은 브라우저 MediaRecorder가 만든 형식입니다. Chrome·Edge·Firefox에서는 대체로 WebM이고, MP4를 지원하는 브라우저에서는 MP4가 될 수 있습니다. 결과 영역에 실제 WebM 또는 MP4 형식을 표시하며 서버에 올려 변환하지 않습니다.',
      },
      {
        q: '화면 선택 창이 열리지 않는 이유는 무엇인가요?',
        a: '화면 공유는 HTTPS 환경에서 사용자가 직접 시작해야 하고, 브라우저는 이전 녹화의 권한을 계속 보관하지 않습니다. 녹음 시작을 다시 누르고 최신 데스크톱 브라우저를 사용하세요. 개인정보 보호 설정, 다른 화면 캡처 앱 또는 앱 안의 내장 브라우저가 선택 창을 막는지도 확인합니다.',
      },
      {
        q: '휴대폰에서도 웹으로 화면 녹화를 할 수 있나요?',
        a: '대부분의 휴대폰·태블릿 브라우저는 웹페이지에 전체 화면 캡처 기능을 제공하지 않습니다. 휴대폰 화면은 iOS 제어 센터나 Android 빠른 설정의 기본 화면 녹화 기능을 사용하세요. 이 도구는 화면·창·탭 선택 창을 제공하는 최신 데스크톱 브라우저용입니다.',
      },
    ],
    ui: {
      recorder: '화면 녹화기',
      start: '녹음 시작',
      pause: '일시 정지',
      resume: '다시 시작',
      stop: '녹음 중지',
      newRecording: '새 녹음',
      download: '녹화 다운로드',
      playback: '녹화 미리 보기',
      microphone: '마이크',
      microphoneHint: '선택 사항입니다. 켜면 브라우저가 마이크 권한을 따로 요청합니다.',
      includeMicrophone: '내 마이크 포함',
      elapsed: '녹화 시간',
      format: '저장 형식',
      formatValue: '브라우저 영상',
      webm: 'WebM',
      mp4: 'MP4',
      localOnly: '녹화본은 내려받기 전까지 이 브라우저 안에만 있습니다.',
      systemAudioHint: '탭 소리나 시스템 소리는 화면 선택 창에 오디오 공유가 표시될 때 켤 수 있습니다.',
      ready: '브라우저 선택 창에서 녹화할 대상을 고르면 바로 시작합니다.',
      requesting: '브라우저의 화면 선택 창을 기다리는 중…',
      recording: '이 기기에서 녹화 중입니다. 필요할 때 일시 정지할 수 있습니다.',
      paused: '일시 정지되었습니다. 다시 시작하면 같은 녹화를 이어갑니다.',
      readyToDownload: '녹화가 준비되었습니다. 미리 본 뒤 파일로 저장하세요.',
      unsupported:
        '이 브라우저에서는 화면을 녹화할 수 없습니다. HTTPS에서 최신 데스크톱 Chrome, Edge, Firefox 또는 Safari를 사용하세요.',
      permissionDenied:
        '화면 공유 또는 마이크 권한이 차단되었습니다. 브라우저 권한 창이나 사이트 설정에서 허용한 뒤 다시 시도하세요.',
      noDisplay: '공유할 화면·창·탭을 찾지 못했습니다. 녹화할 내용을 연 뒤 다시 시도하세요.',
      captureBusy: '선택한 화면을 캡처할 수 없습니다. 화면 캡처를 쓰는 다른 앱을 닫고 다시 시도하세요.',
      cancelled: '화면 선택이 취소되었습니다. 화면·창·탭을 골라 녹음을 시작하세요.',
      startError: '화면 녹화를 시작하지 못했습니다. 페이지를 새로고침한 뒤 다시 시도하세요.',
      recordingFailed: '브라우저에서 녹화를 완료하지 못했습니다. 새 녹음으로 다시 시도하세요.',
      shortcutRecord: '녹음 시작',
      shortcutPause: '일시 정지 또는 다시 시작',
      shortcutStop: '녹음 중지',
    },
  },
};
