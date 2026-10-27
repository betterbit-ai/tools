import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  liveTest: 'Live webcam test',
  localOnly: 'Video stays in this browser tab; no video or audio is uploaded.',
  startTest: 'Start camera',
  cancelStart: 'Cancel',
  stopTest: 'Stop camera',
  preview: 'Live camera preview',
  previewPlaceholder: 'Start the camera to see a local live preview.',
  takeSnapshot: 'Download PNG snapshot',
  snapshotHint: 'The snapshot matches the mirror setting and downloads only when you choose it.',
  camera: 'Camera',
  deviceHint: 'Choose a connected camera. Names usually appear after permission is allowed.',
  defaultDevice: 'System default',
  unnamedCamera: 'Camera',
  mirror: 'Mirror preview and snapshot',
  framingGrid: 'Show framing grid',
  resolution: 'Resolution',
  frameRate: 'Frame rate',
  aspectRatio: 'Aspect ratio',
  activeCamera: 'Active camera',
  fps: 'FPS',
  unavailable: '—',
  ready: 'Ready — start the test when you are ready to allow camera access.',
  startingNotice: 'Starting the camera and waiting for the first video frame…',
  activeNotice: 'Camera is active. Stop the test to release it for a call or another app.',
  unsupported: 'This browser cannot access a camera for this test. Use a current Chrome, Safari or Firefox over HTTPS.',
  permissionDenied: 'Camera access was blocked. Allow it in your browser’s site settings, then try again.',
  noCamera: 'No camera was found. Connect one and try again.',
  cameraBusy: 'The camera is being used by another app. Close that app, then try again.',
  deviceUnavailable: 'The selected camera is no longer available. Choose System default or reconnect it.',
  cameraDisconnected: 'The camera disconnected. Reconnect it, then start the test again.',
  deviceListUnavailable: 'The browser could not load the camera list. You can still test the system default camera.',
  previewTimeout:
    'The camera opened but did not supply a video frame. Check its privacy shutter, reconnect it, then try again.',
  startError: 'The camera could not be started. Check browser and operating-system camera permissions, then try again.',
  snapshotError: 'A snapshot could not be made because this browser has not supplied a video frame yet.',
  shortcutStartStop: 'start or stop',
  shortcutSnapshot: 'download snapshot',
  shortcutMirror: 'toggle mirror',
  shortcutGrid: 'toggle grid',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Webcam Test — live FPS, grid and PNG snapshot',
    description:
      'Test your webcam locally with live resolution and FPS, a mirrorable framing grid and a downloadable PNG snapshot. No video or audio is uploaded.',
    h1: 'Webcam Test',
    tagline:
      'Check the camera your browser will use, frame yourself with a grid, and save a local PNG snapshot before a call.',
    name: 'Webcam Test',
    keywords: [
      'webcam test',
      'camera test',
      'test my webcam',
      'online camera test',
      'webcam FPS test',
      'camera resolution test',
    ],
    howTo: [
      'Select a camera if more than one is connected.',
      'Choose Start camera and allow the browser permission prompt.',
      'Check the live resolution, frame rate and aspect ratio beside the preview.',
      'Turn on the framing grid or mirror view to check your call setup.',
      'Choose Download PNG snapshot if you need a local still image, then Stop camera when finished.',
    ],
    sections: [
      {
        heading: 'What resolution and FPS mean here',
        body: 'Resolution is the width × height of the video track the browser is currently receiving, not necessarily the maximum printed on the camera box. Frame rate is shown in frames per second (FPS). When the browser supports video-frame callbacks, this page measures delivered compositor frames; otherwise it shows the active track’s reported rate. A 1920 × 1080 stream reduces to a 16:9 aspect ratio. Low light, USB bandwidth, browser settings and another app can all cause a camera to negotiate a lower mode than its hardware maximum.',
      },
      {
        heading: 'Permission and privacy',
        body: 'Browsers require a user permission prompt before a website can open a camera through getUserMedia, and the API requires a secure context such as HTTPS. This test requests video only: it does not request microphone access. The MediaStream is attached directly to the preview in this tab, and the snapshot is drawn to an in-memory canvas only after you select the download button. No video endpoint, cloud recording or account is involved. Stop camera releases the track so a meeting app can use the camera.',
      },
      {
        heading: 'Use the grid to check call framing',
        body: 'The optional 3 × 3 grid is a simple framing guide: placing your eyes near the upper horizontal line usually leaves comfortable headroom, while keeping your face near the center avoids accidental edge cropping in meeting layouts. Mirror mode flips both the preview and the downloaded PNG so the still image matches what you inspected. It changes neither the camera hardware nor another app’s outgoing video; check the preview in Zoom, Meet or Teams as well when the call platform crops or applies effects.',
      },
    ],
    faq: [
      {
        q: 'Does this webcam test upload or record my video?',
        a: 'No. The test requests only a local browser video stream and renders it in the current tab. A PNG is created only when you select Download PNG snapshot, then it downloads directly to your device; no video, audio or snapshot is sent to a server.',
      },
      {
        q: 'Why is my webcam test showing a lower resolution or FPS than the camera specification?',
        a: 'The displayed values describe the active browser video track, not a laboratory maximum. Camera drivers, low light, USB bandwidth, browser constraints and concurrent apps can make a 4K or 60 FPS camera deliver a lower resolution or frame rate to a browser.',
      },
      {
        q: 'Why does the camera say it is busy or show a black preview?',
        a: 'A busy-camera error commonly means Zoom, Teams, OBS, a camera utility or another browser tab already holds the device. Close the other app, check any physical privacy shutter, confirm the selected camera, and allow this site in browser and operating-system camera settings before retrying.',
      },
      {
        q: 'Does mirror mode change what other people see on a video call?',
        a: 'No. Mirror mode changes only this page’s preview and its locally downloaded PNG. Video-call apps control their own mirror setting, cropping and effects, so check their preview separately before an interview, class or meeting.',
      },
      {
        q: 'Which browsers can run this webcam test?',
        a: 'Current Chrome, Safari and Firefox support the secure browser APIs used for camera capture and device selection. Open the HTTPS page directly, not inside a restricted embedded frame. These browsers also support video-frame callbacks; if a browser does not expose that optional API, the test shows the active track’s reported FPS instead.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '웹캠 테스트 — 해상도·FPS·스냅샷 확인',
    description:
      '웹캠 해상도와 FPS를 실시간으로 확인하고, 구도 그리드·좌우 반전·PNG 스냅샷을 사용하세요. 영상과 음성은 업로드하지 않습니다.',
    h1: '웹캠 테스트',
    tagline: '화상회의에 쓸 카메라를 확인하고 구도를 맞춘 뒤, 기기에만 저장되는 PNG 스냅샷으로 점검합니다.',
    name: '웹캠 테스트',
    keywords: [
      '웹캠 테스트',
      '카메라 테스트',
      '노트북 카메라 확인',
      '웹캠 화질 테스트',
      '웹캠 FPS 확인',
      '화상회의 카메라 테스트',
    ],
    howTo: [
      '카메라가 여러 대이면 사용할 장치를 고릅니다.',
      '카메라 시작을 누르고 브라우저 권한 요청에서 허용합니다.',
      '미리보기 옆에서 실제 해상도, 프레임 레이트, 화면 비율을 확인합니다.',
      '구도 그리드나 좌우 반전을 켜서 화상회의 화면을 점검합니다.',
      '필요하면 PNG 스냅샷 다운로드를 누르고, 끝나면 카메라 중지로 장치를 해제합니다.',
    ],
    sections: [
      {
        heading: '해상도와 FPS는 무엇을 뜻하나요?',
        body: '해상도는 브라우저가 현재 받고 있는 영상 트랙의 가로 × 세로 픽셀 수입니다. 카메라 상자에 적힌 최대 사양과 같다는 뜻은 아닙니다. FPS는 초당 프레임 수입니다. 브라우저가 비디오 프레임 콜백을 지원하면 이 도구는 실제로 화면에 전달된 프레임을 측정하고, 지원하지 않으면 현재 트랙이 보고한 값을 표시합니다. 1920 × 1080은 16:9 화면비입니다. 조명이 어둡거나 USB 대역폭이 부족하거나 다른 앱이 카메라를 쓰면 더 낮은 모드로 동작할 수 있습니다.',
      },
      {
        heading: '카메라 권한과 개인정보',
        body: '브라우저는 getUserMedia로 카메라를 열기 전에 반드시 사용자의 권한을 요청하며, 이 API는 HTTPS 같은 보안 연결에서만 사용할 수 있습니다. 이 도구는 영상만 요청하고 마이크 권한은 요청하지 않습니다. 카메라 영상은 현재 탭의 미리보기에 바로 표시되며, PNG 스냅샷도 사용자가 다운로드를 누를 때 이 탭의 임시 캔버스에서만 만듭니다. 서버 업로드, 클라우드 녹화, 계정 저장은 없습니다. 카메라 중지를 누르면 회의 앱이 쓸 수 있도록 트랙을 해제합니다.',
      },
      {
        heading: '구도 그리드로 화상회의 화면 점검하기',
        body: '선택한 3 × 3 구도 그리드는 화면을 맞추는 간단한 기준입니다. 눈을 위쪽 가로선 가까이에 두면 머리 위 여백을 남기기 쉽고, 얼굴을 중앙에 두면 회의 화면에서 가장자리가 잘리는 일을 줄일 수 있습니다. 좌우 반전은 이 페이지의 미리보기와 다운로드 PNG에만 적용됩니다. Zoom, Google Meet, Teams는 각자 반전·자르기·효과를 적용하므로 중요한 면접이나 수업 전에는 해당 앱의 미리보기도 확인해야 합니다.',
      },
    ],
    faq: [
      {
        q: '웹캠 테스트 영상이 서버에 업로드되거나 녹화되나요?',
        a: '아니요. 이 도구는 현재 브라우저 탭에서만 카메라 영상을 표시합니다. PNG 스냅샷 다운로드를 직접 누를 때만 정지 화면을 만들어 기기에 저장하며, 영상·음성·스냅샷을 서버로 전송하거나 계정에 보관하지 않습니다.',
      },
      {
        q: '카메라 사양보다 해상도나 FPS가 낮게 나오는 이유는 무엇인가요?',
        a: '표시값은 카메라의 이론상 최대 사양이 아니라 현재 브라우저 영상 트랙의 값입니다. 조명, USB 대역폭, 드라이버, 브라우저 설정, 다른 앱의 카메라 사용 때문에 4K 또는 60 FPS 카메라도 더 낮은 해상도나 프레임 레이트로 동작할 수 있습니다.',
      },
      {
        q: '카메라가 사용 중이라는 오류나 검은 화면이 나오는 이유는 무엇인가요?',
        a: 'Zoom, Teams, OBS, 카메라 유틸리티, 다른 브라우저 탭이 이미 카메라를 사용 중인 경우가 많습니다. 다른 앱을 닫고, 물리적 프라이버시 셔터와 선택한 카메라를 확인한 뒤 브라우저·운영체제의 카메라 권한을 허용하고 다시 시도합니다.',
      },
      {
        q: '좌우 반전을 켜면 상대방에게도 반전된 화면이 보이나요?',
        a: '아니요. 좌우 반전은 이 페이지의 미리보기와 이 페이지에서 내려받는 PNG에만 적용됩니다. 화상회의 앱은 자체 반전·자르기·효과 설정을 사용하므로, 통화 전에 사용할 앱에서도 미리보기를 확인해야 합니다.',
      },
      {
        q: '어떤 브라우저에서 웹캠 테스트를 사용할 수 있나요?',
        a: '최신 Chrome, Safari, Firefox는 카메라 영상과 장치 목록을 가져오는 보안 브라우저 API를 지원합니다. 제한된 임베디드 화면이 아닌 HTTPS 페이지를 직접 여세요. 이 브라우저들은 비디오 프레임 콜백도 지원하며, 이 선택 API가 없는 브라우저에서는 영상 트랙이 보고한 FPS를 대신 표시합니다.',
      },
    ],
    ui: {
      liveTest: '실시간 웹캠 테스트',
      localOnly: '영상은 이 브라우저 탭 안에만 표시하며 영상과 음성을 업로드하지 않습니다.',
      startTest: '카메라 시작',
      cancelStart: '취소',
      stopTest: '카메라 중지',
      preview: '실시간 카메라 미리보기',
      previewPlaceholder: '카메라를 시작하면 이곳에 로컬 미리보기가 표시됩니다.',
      takeSnapshot: 'PNG 스냅샷 다운로드',
      snapshotHint: '스냅샷은 좌우 반전 설정을 그대로 적용하며, 직접 눌렀을 때만 다운로드합니다.',
      camera: '카메라',
      deviceHint: '연결된 카메라를 고릅니다. 권한을 허용한 뒤 장치 이름이 표시되는 경우가 많습니다.',
      defaultDevice: '시스템 기본값',
      unnamedCamera: '카메라',
      mirror: '미리보기와 스냅샷 좌우 반전',
      framingGrid: '구도 그리드 표시',
      resolution: '해상도',
      frameRate: '프레임 레이트',
      aspectRatio: '화면 비율',
      activeCamera: '사용 중인 카메라',
      fps: 'FPS',
      unavailable: '—',
      ready: '준비됨 — 카메라 권한을 허용할 준비가 되면 테스트를 시작합니다.',
      startingNotice: '카메라를 시작하고 첫 번째 영상 프레임을 기다리는 중입니다…',
      activeNotice: '카메라 사용 중입니다. 회의나 다른 앱에서 쓰려면 카메라 중지를 눌러 해제합니다.',
      unsupported:
        '이 브라우저에서는 카메라를 사용할 수 없습니다. HTTPS에서 최신 Chrome, Safari 또는 Firefox를 사용하세요.',
      permissionDenied: '카메라 권한이 차단되었습니다. 브라우저의 사이트 설정에서 허용한 뒤 다시 시도합니다.',
      noCamera: '카메라를 찾지 못했습니다. 장치를 연결한 뒤 다시 시도합니다.',
      cameraBusy: '다른 앱이 카메라를 사용 중입니다. 해당 앱을 닫은 뒤 다시 시도합니다.',
      deviceUnavailable: '선택한 카메라를 더 이상 사용할 수 없습니다. 시스템 기본값을 고르거나 다시 연결하세요.',
      cameraDisconnected: '카메라 연결이 끊겼습니다. 다시 연결한 뒤 테스트를 시작하세요.',
      deviceListUnavailable:
        '브라우저에서 카메라 목록을 불러오지 못했습니다. 시스템 기본 카메라는 계속 테스트할 수 있습니다.',
      previewTimeout:
        '카메라는 열렸지만 영상 프레임을 받지 못했습니다. 프라이버시 셔터를 확인하거나 다시 연결한 뒤 시도하세요.',
      startError: '카메라를 시작하지 못했습니다. 브라우저와 운영체제의 카메라 권한을 확인한 뒤 다시 시도합니다.',
      snapshotError: '아직 브라우저에서 영상 프레임을 받지 못해 스냅샷을 만들지 못했습니다.',
      shortcutStartStop: '카메라 시작 또는 중지',
      shortcutSnapshot: '스냅샷 다운로드',
      shortcutMirror: '좌우 반전 전환',
      shortcutGrid: '그리드 전환',
    },
  },
};
