import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop a video here, click to choose, or paste',
  dropHint: 'MP4, WebM or MOV that your browser can play',
  privacy: 'Your video stays in this browser. It is never uploaded.',
  preview: 'Video preview',
  source: 'Source',
  duration: 'Duration',
  dimensions: 'Dimensions',
  start: 'Start (seconds)',
  end: 'End (seconds)',
  rangeHint: 'GIF clips are limited to 10 seconds to keep processing and file size practical.',
  size: 'GIF width',
  fps: 'Smoothness',
  pixels: 'Frame work',
  pixelsValue: '{frames} frames · {pixels} MP',
  make: 'Make GIF',
  making: 'Making GIF…',
  cancel: 'Cancel',
  clear: 'Choose another video',
  download: 'Download GIF',
  ready: 'GIF ready',
  progress: 'Encoding frame {current} of {total}',
  unsupported: 'This video cannot be decoded by your browser. Try an MP4 or WebM file that plays locally.',
  failed: 'The GIF could not be made. Try a shorter selection or a smaller width.',
  cancelled: 'GIF creation was cancelled. Your video is still here.',
  noVideo: 'Choose a video before making a GIF.',
  sizeSmall: 'Small · 240 px',
  sizeMedium: 'Medium · 320 px',
  sizeLarge: 'Large · 480 px',
  fpsLow: 'Small · 5 fps',
  fpsMedium: 'Balanced · 10 fps',
  fpsHigh: 'Smooth · 15 fps',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Video to GIF — Short Clips, No Upload',
    description:
      'Turn a playable MP4, WebM or MOV into a GIF in your browser. Set a short clip, size and frame rate with a live frame-work estimate. No upload.',
    h1: 'Video to GIF',
    tagline: 'Make a compact GIF from a short video clip — privately, in your browser.',
    name: 'Video to GIF',
    keywords: ['video to gif', 'mp4 to gif', 'mov to gif', 'webm to gif', 'make gif from video', 'animated gif maker'],
    howTo: [
      'Drop a video onto the box, click to choose it, or paste a copied video file.',
      'Use the preview and Start and End fields to select up to 10 seconds.',
      'Choose a GIF width and frame rate; the exact number of frames and pixels is shown before work begins.',
      'Select Make GIF, then download the looping GIF directly to your device.',
    ],
    sections: [
      {
        heading: 'Why a short clip and modest width work best',
        body: 'GIF stores a sequence of palette-indexed images rather than modern video compression. Its processing and download size therefore grow with width × height × frames. At 10 fps, a 3-second clip contains 30 frames; a 10-second clip contains 100. Reducing a 480 px-wide GIF to 240 px cuts the pixels in each frame to one quarter when the aspect ratio stays the same. Start with 320 px and 10 fps for a reaction or product loop; use 5 fps for a mostly static screen recording.',
      },
      {
        heading: 'What formats can convert here?',
        body: 'This tool uses the video decoder built into your browser, so a file works when the browser can play it locally. MP4 with H.264 video and WebM are widely supported; MOV is a container, so support depends on the video codec inside it. Some iPhone HEVC videos play in Safari but not every browser. If the preview cannot load, export or share the clip as an H.264 MP4, then try again. GIF has no audio track, so sound is intentionally not included.',
      },
      {
        heading: 'Private local conversion',
        body: 'The selected video is opened with a temporary local browser URL, sampled into an in-memory canvas, and encoded into a GIF in this tab. It is not sent to a server and no account is involved. The 10-second and 150-frame limits are deliberate: they keep memory use predictable on phones and make it clear before conversion how much frame work the selected settings require. Reloading or choosing another video releases the temporary preview and output.',
      },
    ],
    faq: [
      {
        q: 'Are my videos uploaded when I convert video to GIF?',
        a: 'No. The video remains in the current browser tab: the browser decodes frames locally, creates the GIF in memory, and downloads it directly to your device. You can disconnect after this page has loaded and conversion still works for formats your browser can decode.',
      },
      {
        q: 'How long can a video-to-GIF clip be?',
        a: 'This converter accepts a selected clip up to 10 seconds and at most 150 GIF frames. At 15 fps, the 150-frame limit is reached at 10 seconds; shorter clips are faster and usually make smaller downloads.',
      },
      {
        q: 'What frame rate should I use for a GIF?',
        a: 'Use 5 fps for a mostly static recording, 10 fps for a balanced reaction or demo loop, and 15 fps when motion needs to look smoother. Doubling frame rate roughly doubles the number of stored frames and can substantially increase GIF size.',
      },
      {
        q: 'Why does my GIF not have sound?',
        a: 'The GIF image format does not include an audio stream, so video audio is not copied into the GIF. Share a short MP4 or WebM instead when sound is important.',
      },
      {
        q: 'Why will my MOV or iPhone video not open?',
        a: 'MOV is a container, and its playback depends on the codec used inside it. An HEVC/H.265 iPhone video may work in Safari but not in another browser. Exporting the clip as H.264 MP4 is the most compatible fallback.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '동영상 GIF 변환 — 짧은 움짤 만들기, 업로드 없음',
    description:
      'MP4·WebM·MOV 동영상을 브라우저에서 바로 GIF 움짤로 만드세요. 구간·크기·프레임 수를 정하고 작업량을 확인합니다. 업로드하지 않습니다.',
    h1: '동영상 GIF 변환',
    tagline: '짧은 영상 구간을 GIF 움짤로 만듭니다. 파일은 브라우저 밖으로 나가지 않습니다.',
    name: '동영상 GIF 변환',
    keywords: ['동영상 GIF 변환', '움짤 만들기', 'MP4 GIF 변환', 'MOV GIF 변환', '영상 움짤 변환', '동영상 움짤'],
    howTo: [
      '영상을 상자에 끌어 놓거나 파일을 선택하거나 복사한 동영상 파일을 붙여 넣습니다.',
      '미리보기와 시작·끝 시간 입력란으로 최대 10초 구간을 고릅니다.',
      'GIF 가로 크기와 프레임 수를 고릅니다. 만들기 전에 정확한 프레임 수와 픽셀 작업량이 표시됩니다.',
      'GIF 만들기를 누른 뒤 완성된 반복 움짤을 기기에 바로 저장합니다.',
    ],
    sections: [
      {
        heading: '짧게, 작게 만들수록 GIF가 가벼워집니다',
        body: 'GIF는 최신 동영상처럼 압축하는 방식이 아니라 색상 팔레트를 쓴 여러 장의 이미지를 차례로 저장합니다. 따라서 처리량과 파일 크기는 가로 × 세로 × 프레임 수에 따라 커집니다. 10fps에서 3초 영상은 30프레임, 10초 영상은 100프레임입니다. 비율을 유지한 채 가로 480px을 240px로 줄이면 프레임당 픽셀 수는 4분의 1이 됩니다. 반응 움짤이나 제품 화면 반복은 320px·10fps부터, 변화가 적은 화면 녹화는 5fps부터 시작하는 것이 좋습니다.',
      },
      {
        heading: '어떤 동영상 파일을 바꿀 수 있나요?',
        body: '이 도구는 브라우저에 내장된 동영상 디코더를 사용하므로, 내 기기에서 브라우저가 재생할 수 있는 파일만 변환합니다. H.264 코덱의 MP4와 WebM은 대체로 잘 열립니다. MOV는 파일 형식 상자이므로 안에 든 코덱에 따라 다릅니다. 아이폰 HEVC 영상은 Safari에서는 재생되지만 모든 브라우저에서 재생되지는 않을 수 있습니다. 미리보기가 열리지 않으면 H.264 MP4로 내보낸 뒤 다시 시도하세요. GIF 형식에는 오디오 트랙이 없으므로 소리는 포함되지 않습니다.',
      },
      {
        heading: '영상은 기기 안에서만 처리합니다',
        body: '선택한 동영상은 브라우저의 임시 로컬 주소로 열리고, 이 탭의 메모리 캔버스에서 프레임을 읽어 GIF로 만듭니다. 서버로 전송하거나 계정을 만들지 않습니다. 10초·150프레임 제한은 휴대폰에서도 메모리 사용량을 예측 가능하게 하고, 변환 전에 설정에 따른 작업량을 보여 주기 위한 기준입니다. 새 영상을 선택하거나 페이지를 새로 고치면 임시 미리보기와 결과가 해제됩니다.',
      },
    ],
    faq: [
      {
        q: '동영상을 GIF로 바꾸면 파일이 서버에 올라가나요?',
        a: '아니요. 동영상은 현재 브라우저 탭 안에만 머무르고, 브라우저가 프레임을 로컬에서 읽어 메모리에서 GIF를 만든 뒤 기기에 바로 내려받습니다. 이 페이지를 연 뒤에는 인터넷 연결을 끊어도 브라우저가 재생할 수 있는 형식이라면 변환할 수 있습니다.',
      },
      {
        q: '동영상 GIF 변환은 몇 초까지 가능한가요?',
        a: '이 도구에서는 최대 10초 구간과 최대 150프레임까지 GIF로 만들 수 있습니다. 15fps에서는 10초가 150프레임이며, 더 짧은 구간은 처리도 빠르고 파일도 대체로 작아집니다.',
      },
      {
        q: '움짤은 몇 fps로 만들면 되나요?',
        a: '변화가 적은 화면 녹화는 5fps, 반응 움짤이나 일반적인 데모는 10fps, 움직임을 더 부드럽게 보여야 하면 15fps를 사용하세요. fps를 두 배로 올리면 저장하는 프레임 수도 거의 두 배가 되어 GIF 용량이 크게 늘 수 있습니다.',
      },
      {
        q: 'GIF에는 왜 소리가 없나요?',
        a: 'GIF 이미지 형식은 오디오 스트림을 담을 수 없으므로 영상의 소리는 GIF에 복사되지 않습니다. 소리가 중요하면 짧은 MP4나 WebM으로 공유해야 합니다.',
      },
      {
        q: '아이폰 MOV 영상이 열리지 않는 이유는 무엇인가요?',
        a: 'MOV는 컨테이너 형식이라 안에 든 코덱에 따라 재생 가능 여부가 달라집니다. 아이폰 HEVC/H.265 영상은 Safari에서는 열려도 다른 브라우저에서는 열리지 않을 수 있습니다. H.264 MP4로 내보내면 가장 호환성이 높습니다.',
      },
    ],
    ui: {
      dropTitle: '동영상을 여기에 놓거나 파일을 선택하거나 붙여 넣으세요',
      dropHint: '브라우저에서 재생 가능한 MP4, WebM, MOV',
      privacy: '동영상은 이 브라우저 안에만 머뭅니다. 업로드하지 않습니다.',
      preview: '동영상 미리보기',
      source: '원본',
      duration: '재생 시간',
      dimensions: '해상도',
      start: '시작 시간(초)',
      end: '끝 시간(초)',
      rangeHint: '처리와 파일 용량을 적절하게 유지하기 위해 GIF 구간은 최대 10초입니다.',
      size: 'GIF 가로 크기',
      fps: '부드러움',
      pixels: '프레임 작업량',
      pixelsValue: '{frames}프레임 · {pixels} MP',
      make: 'GIF 만들기',
      making: 'GIF 만드는 중…',
      cancel: '취소',
      clear: '다른 동영상 선택',
      download: 'GIF 다운로드',
      ready: 'GIF 완성',
      progress: '{total}프레임 중 {current}프레임 인코딩',
      unsupported: '이 브라우저에서 이 동영상을 읽을 수 없습니다. 로컬에서 재생되는 MP4 또는 WebM 파일을 사용하세요.',
      failed: 'GIF를 만들지 못했습니다. 더 짧은 구간이나 더 작은 가로 크기로 시도하세요.',
      cancelled: 'GIF 만들기를 취소했습니다. 동영상은 그대로 남아 있습니다.',
      noVideo: 'GIF를 만들기 전에 동영상을 선택하세요.',
      sizeSmall: '작게 · 240 px',
      sizeMedium: '보통 · 320 px',
      sizeLarge: '크게 · 480 px',
      fpsLow: '작게 · 5 fps',
      fpsMedium: '균형 · 10 fps',
      fpsHigh: '부드럽게 · 15 fps',
    },
  },
};
