import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop an MP3 here, click to choose, or paste',
  dropHint: 'MP3 only · its waveform and clip stay on this device',
  loading: 'Reading your MP3…',
  privacy: 'Your MP3 is decoded and cut in this browser. It is never uploaded.',
  unsupported: 'Choose a readable MP3 file. Other audio formats are not converted by this focused cutter.',
  decodeFailed: 'This MP3 could not be decoded by this browser. Try a different MP3 file.',
  waveform: 'Audio waveform; click nearer to the start or end marker to move that edge',
  waveformHint: 'Click the waveform to move the nearer edge. Use the time fields for hundredths of a second.',
  preview: 'Preview selection',
  stopPreview: 'Stop preview',
  ringtone: 'Select 30-second ringtone',
  clear: 'Choose another MP3',
  shortcutHint: 'Preview or stop:',
  sourceDuration: 'Original length',
  clipDuration: 'Selected length',
  start: 'Start (seconds)',
  end: 'End (seconds)',
  timeHint: 'Enter a time from the original recording.',
  frameHint: 'The file is copied at MP3 frame boundaries, usually about 0.026 seconds.',
  download: 'Cut and download MP3',
  losslessNote: 'No MP3 re-encode: this copies complete source frames, so a boundary may extend slightly.',
  rangeError: 'Choose an end time later than the start time before downloading.',
  playbackFailed: 'This browser could not play the selected MP3 preview.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'MP3 Cutter — Lossless Frame Copy, No Upload',
    description:
      'Cut an MP3 on a clickable waveform in your browser. Preview exact times, use a 30-second ringtone preset, and download a frame-copy MP3 without re-encoding.',
    h1: 'MP3 Cutter',
    tagline: 'Choose a clip on the waveform, preview it, and save an MP3 without uploading or re-encoding it.',
    name: 'MP3 Cutter',
    keywords: ['mp3 cutter', 'mp3 trimmer', 'cut mp3 online', 'trim audio', 'ringtone maker', 'make ringtone from mp3'],
    howTo: [
      'Drop an MP3 into the box, click to choose it, or paste a copied MP3 file.',
      'Click near a waveform edge to move it, or enter exact Start and End times in seconds.',
      'Select Preview selection or press Space to check the chosen part.',
      'Select Cut and download MP3 to save a frame-copy clip directly to your device.',
    ],
    sections: [
      {
        heading: 'Why this MP3 cutter keeps the source bitrate',
        body: 'MP3 audio is stored as a sequence of compressed frames. This cutter copies the complete frames that overlap your chosen start and end rather than decoding and encoding a new MP3. The output therefore keeps the source MP3 bitrate and avoids a second generation of lossy compression. A frame boundary is commonly about 0.026 seconds for MPEG-1 Layer III at 44.1 kHz, so the saved clip can begin slightly before or end slightly after the time field. The waveform and preview use your browser’s local audio decoder; the final download is a frame copy.',
      },
      {
        heading: 'Make a ringtone from the part you actually want',
        body: 'Select “30-second ringtone” to mark the first 30 seconds, then click the waveform closer to the start or end marker to move that edge. Android phones can usually choose an MP3 in Settings after it is saved. iPhone ringtone setup needs an Apple-supported import workflow and file format; this tool downloads an MP3 clip rather than claiming to install a ringtone for you. Keep the original file if you expect to adjust the selection again.',
      },
      {
        heading: 'What this focused cutter accepts',
        body: 'This tool accepts MP3 files only, because its no-re-encode promise depends on copying valid MPEG Layer III frames. It does not convert M4A, WAV, FLAC, video or protected streaming files to MP3. Browser playback support still matters for the waveform preview: if the current browser cannot decode a particular MP3, try another browser or export a standard MP3 from the source application. The file is opened in this tab’s memory and is not uploaded to Betterbit or another service.',
      },
    ],
    faq: [
      {
        q: 'Does this MP3 cutter upload my audio file?',
        a: 'No. The selected MP3 is read, decoded for its waveform, previewed and clipped in the current browser tab. The resulting MP3 is created as a direct download, so neither the source nor the clip is sent to a server.',
      },
      {
        q: 'Does cutting an MP3 reduce its quality?',
        a: 'This cutter does not decode and re-encode the saved MP3. It copies complete MPEG audio frames at the source bitrate, so there is no additional lossy encoding generation. The trade-off is frame-boundary timing: the saved start or end can differ by roughly one MP3 frame, commonly about 0.026 seconds.',
      },
      {
        q: 'How do I make a 30-second ringtone from an MP3?',
        a: 'Open the MP3, select the 30-second ringtone button, move either waveform edge to the desired section, preview it, and download the clip. The button initially selects the first 30 seconds or the whole recording when it is shorter than 30 seconds.',
      },
      {
        q: 'Why does this tool accept only MP3 files?',
        a: 'The download keeps quality by copying valid MP3 frames rather than converting audio. WAV, M4A, FLAC and video need a different encoding or container process, so accepting them here would make the no-re-encode result misleading.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'MP3 자르기 — 재인코딩 없이 벨소리 만들기',
    description:
      'MP3를 파형에서 자르고 브라우저에서 바로 저장하세요. 30초 벨소리 프리셋, 미리 듣기, 원본 MP3 프레임 복사를 업로드 없이 제공합니다.',
    h1: 'MP3 자르기',
    tagline: '파형에서 원하는 구간을 고르고 미리 들은 뒤, 업로드·재인코딩 없이 MP3로 저장합니다.',
    name: 'MP3 자르기',
    keywords: ['MP3 자르기', '음원 자르기', '음성 파일 자르기', '음악 자르기', '벨소리 만들기', 'MP3 커터'],
    howTo: [
      'MP3 파일을 상자에 끌어 놓거나 파일을 선택하거나 복사한 파일을 붙여 넣습니다.',
      '파형의 시작·끝 표시선 가까이를 눌러 옮기거나, 시작·끝 시간에 초 단위로 정확한 값을 입력합니다.',
      '선택 구간 미리 듣기 또는 스페이스바로 구간을 확인합니다.',
      'MP3 자르고 다운로드를 누르면 재인코딩하지 않은 클립이 기기에 저장됩니다.',
    ],
    sections: [
      {
        heading: '원본 비트레이트를 다시 인코딩하지 않는 방식',
        body: 'MP3는 압축된 오디오 프레임이 연속된 형식입니다. 이 도구는 선택 구간과 겹치는 프레임을 통째로 복사하므로 새 MP3를 디코딩하고 다시 인코딩하지 않습니다. 따라서 원본 MP3 비트레이트를 유지하고, 손실 압축을 한 번 더 거치지 않습니다. MPEG-1 Layer III 44.1kHz에서는 프레임 하나가 보통 약 0.026초라서, 저장한 파일의 시작과 끝이 입력한 시간보다 조금 앞이나 뒤로 늘어날 수 있습니다. 파형과 미리 듣기는 브라우저의 로컬 디코더를 쓰고, 다운로드 파일은 프레임을 복사해 만듭니다.',
      },
      {
        heading: '원하는 구간으로 벨소리 만들기',
        body: '‘30초 벨소리 선택’을 누르면 먼저 30초 구간을 잡습니다. 원하는 후렴이나 문장이 앞부분이 아니면 파형에서 시작 또는 끝 표시선 가까이를 눌러 그쪽 끝을 옮기세요. 저장한 MP3는 안드로이드에서 보통 설정의 벨소리 선택 화면에서 고를 수 있습니다. 아이폰 벨소리는 Apple이 지원하는 가져오기 방식과 파일 형식이 필요하므로, 이 도구는 벨소리를 휴대폰에 자동 설정한다고 주장하지 않고 MP3 클립만 내려받게 합니다. 다시 조정할 수 있도록 원본 파일도 보관하세요.',
      },
      {
        heading: '이 도구에서 열 수 있는 파일',
        body: '재인코딩 없이 MP3 프레임을 복사한다는 약속을 지키기 위해 MP3만 받습니다. M4A·WAV·FLAC·동영상·스트리밍 보호 파일을 MP3로 변환하지는 않습니다. 파형 미리 듣기는 현재 브라우저의 오디오 디코더를 사용하므로 특정 MP3를 읽지 못하면 다른 브라우저에서 열거나 원본 앱에서 표준 MP3로 다시 내보내 보세요. 파일은 이 탭의 메모리에서만 열리고 Betterbit이나 다른 서비스로 업로드되지 않습니다.',
      },
    ],
    faq: [
      {
        q: 'MP3를 자르면 파일이 서버에 업로드되나요?',
        a: '아니요. 선택한 MP3는 현재 브라우저 탭에서 파형용으로 읽고 미리 듣고 자릅니다. 완성된 MP3도 바로 내려받을 뿐 원본과 클립 어느 쪽도 서버로 전송하지 않습니다.',
      },
      {
        q: 'MP3를 자르면 음질이 떨어지나요?',
        a: '이 도구는 저장할 MP3를 디코딩하고 다시 인코딩하지 않습니다. 원본 비트레이트의 MPEG 오디오 프레임을 통째로 복사하므로 추가 손실 압축 세대가 생기지 않습니다. 대신 프레임 경계로 자르므로 시작·끝 시간은 보통 약 0.026초인 프레임 하나 정도 차이 날 수 있습니다.',
      },
      {
        q: 'MP3로 30초 벨소리는 어떻게 만드나요?',
        a: 'MP3를 열고 ‘30초 벨소리 선택’을 누른 뒤, 파형에서 원하는 부분으로 양 끝을 조정하고 미리 듣습니다. 처음에는 30초를 선택하며 원본이 30초보다 짧으면 전체를 선택합니다. 확인한 뒤 MP3 자르고 다운로드를 누르면 됩니다.',
      },
      {
        q: '왜 MP3 파일만 자를 수 있나요?',
        a: '이 도구는 MP3 프레임을 복사해 음질 손실 없는 결과를 만듭니다. WAV·M4A·FLAC·동영상은 다른 인코딩 또는 컨테이너 처리 과정이 필요하므로, 여기서 받으면 재인코딩하지 않는다는 결과를 보장할 수 없습니다.',
      },
    ],
    ui: {
      dropTitle: 'MP3를 여기에 놓거나 파일을 선택하거나 붙여 넣으세요',
      dropHint: 'MP3만 지원 · 파형과 자르기는 이 기기에서 처리합니다',
      loading: 'MP3를 읽는 중…',
      privacy: 'MP3는 이 브라우저에서 읽고 자릅니다. 업로드하지 않습니다.',
      unsupported: '읽을 수 있는 MP3 파일을 선택하세요. 이 도구는 다른 오디오 형식을 변환하지 않습니다.',
      decodeFailed: '이 브라우저에서 이 MP3를 읽지 못했습니다. 다른 MP3 파일로 시도하세요.',
      waveform: '오디오 파형. 시작 또는 끝 표시선 가까이를 누르면 해당 끝을 옮깁니다',
      waveformHint: '파형을 누르면 가까운 쪽 끝이 움직입니다. 0.01초 단위로 맞추려면 시간 입력란을 사용하세요.',
      preview: '선택 구간 미리 듣기',
      stopPreview: '미리 듣기 중지',
      ringtone: '30초 벨소리 선택',
      clear: '다른 MP3 선택',
      shortcutHint: '미리 듣기·중지:',
      sourceDuration: '원본 길이',
      clipDuration: '선택 길이',
      start: '시작 시간(초)',
      end: '끝 시간(초)',
      timeHint: '원본 녹음 기준 시간을 입력합니다.',
      frameHint: 'MP3 프레임 경계에서 복사하므로 보통 약 0.026초 단위입니다.',
      download: 'MP3 자르고 다운로드',
      losslessNote: 'MP3를 다시 인코딩하지 않습니다. 프레임 전체를 복사하므로 끝이 조금 늘어날 수 있습니다.',
      rangeError: '다운로드하기 전에 끝 시간을 시작 시간보다 뒤로 지정하세요.',
      playbackFailed: '이 브라우저에서 선택한 MP3 미리 듣기를 재생하지 못했습니다.',
    },
  },
};
