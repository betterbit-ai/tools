import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop a video here, click to choose, or paste',
  dropHint: 'MP4, MOV, M4V, or WebM · browser-playable files with an audio track',
  loading: 'Reading the audio track on this device…',
  privacy: 'Your video is decoded and encoded in this browser. It is never uploaded.',
  decodeFailed: 'This browser could not read audio from that video. Try a browser-playable file with an audio track.',
  sourceDuration: 'Video length',
  selectedDuration: 'Selected audio',
  start: 'Start (seconds)',
  end: 'End (seconds)',
  rangeHint: 'Choose only the part of the video you need.',
  bitrate: 'MP3 quality',
  bitrateOption: '{value} kbps',
  bitrateHint: '128 kbps suits speech; 192 kbps is a balanced default; 320 kbps makes a larger file.',
  estimatedSize: 'Estimated MP3 size',
  estimatedSizeValue: '~{value} KB',
  extract: 'Extract MP3',
  encoding: 'Making MP3 on this device…',
  rangeError: 'Choose an end time later than the start time before extracting audio.',
  encodeFailed: 'The audio could not be encoded as MP3. Try a shorter range or another browser-playable video.',
  ready: 'Your MP3 is ready',
  preview: 'MP3 preview',
  download: 'Download MP3',
  shortcut: 'Extract selected audio:',
  chooseAnother: 'Choose another video',
  cancel: 'Cancel extraction',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'MP4 to MP3 — Extract Video Audio Locally',
    description:
      'Convert MP4, MOV, M4V, or WebM video to MP3 in your browser. Pick an exact time range and bitrate, then download without uploading your video.',
    h1: 'MP4 to MP3 Converter',
    tagline: 'Extract the audio you need from a local video, choose its time range, and save an MP3 without an upload.',
    name: 'MP4 to MP3',
    keywords: [
      'mp4 to mp3',
      'video to mp3 converter',
      'extract audio from video',
      'video audio extractor',
      'mov to mp3',
      'webm to mp3',
    ],
    howTo: [
      'Drop a video file, click to choose it, or paste a copied video file.',
      'Wait for the browser to read its audio track and show the actual video length.',
      'Enter the Start and End times for the part you want, then choose 128, 192, or 320 kbps.',
      'Select Extract MP3 or press E, preview the result, and download it to your device.',
    ],
    sections: [
      {
        heading: 'What “MP4 to MP3” changes',
        body: 'MP4 is a container that commonly holds video plus an AAC audio track; MP3 is a separate, lossy audio format. This tool decodes the selected audio in the browser and encodes a new MP3, so the video image is not in the download and the source video is not modified. Choose 128 kbps for speech-led lectures and meetings, 192 kbps as a practical music and general-video default, or 320 kbps when file size matters less. The approximate CBR payload is bitrate × seconds ÷ 8, which is why a 60-second 128 kbps MP3 is about 960 KB before small encoder overhead.',
      },
      {
        heading: 'Extract only the useful part',
        body: 'Set Start and End in seconds before extracting to make a short MP3 from a longer class, interview, screen recording, or personal video. The selected PCM samples are copied to an encoder worker, so the page can keep responding while it creates the file. Start at 0 and leave End at the displayed duration to extract the whole audio track. Keep the original video until you have played the MP3 and confirmed that the intended track and time range are correct.',
      },
      {
        heading: 'Which videos work in a browser',
        body: 'The input must be a local file that the current browser can decode and that contains an audio track. MP4, M4V, MOV and WebM are offered as common file choices, but the codecs inside a container determine whether the browser can read it. Encrypted streaming downloads and videos without sound cannot be converted. This focused tool does not fetch YouTube or other video URLs: use only files you own or are allowed to convert.',
      },
    ],
    faq: [
      {
        q: 'Does this MP4 to MP3 converter upload my video?',
        a: 'No. The selected video is decoded, sliced and MP3-encoded in the current browser on your device. Betterbit does not receive the video or the resulting MP3, and the completed file is downloaded directly by the browser.',
      },
      {
        q: 'Which MP3 bitrate should I choose for a video?',
        a: 'Choose 128 kbps for spoken lectures, meetings and podcasts, 192 kbps for a balanced music or general-video file, and 320 kbps when you prefer a larger MP3. At constant bitrate, 60 seconds at 128 kbps is about 960 KB and 60 seconds at 320 kbps is about 2.4 MB before small encoder overhead.',
      },
      {
        q: 'Can I extract only part of a video as MP3?',
        a: 'Yes. Set the Start and End time in seconds before selecting Extract MP3. For example, Start 30 and End 90 creates an MP3 from the 60-second interval between those times instead of the full video.',
      },
      {
        q: 'Why can a video fail even though its file extension is MP4?',
        a: 'MP4 is a container, not a guarantee of its video or audio codec. A browser must be able to decode the audio inside the file, and the file must contain an audio track. Protected streaming downloads and silent clips cannot be read as MP3 audio by this tool.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'MP4 MP3 변환 — 동영상 소리 추출, 업로드 없음',
    description:
      'MP4·MOV·M4V·WebM 동영상에서 소리만 MP3로 저장하세요. 원하는 구간과 128·192·320kbps를 고른 뒤 파일을 올리지 않고 브라우저에서 변환합니다.',
    h1: 'MP4 MP3 변환',
    tagline: '내 기기에 있는 영상에서 필요한 소리 구간만 골라 MP3로 저장합니다. 영상 파일은 업로드하지 않습니다.',
    name: 'MP4 MP3 변환',
    keywords: [
      'MP4 MP3 변환',
      '동영상 MP3 변환',
      '영상 소리 추출',
      '동영상 음원 추출',
      '영상 음성 추출',
      'MOV MP3 변환',
    ],
    howTo: [
      '동영상 파일을 상자에 끌어 놓거나 파일을 선택하거나 복사한 파일을 붙여 넣습니다.',
      '브라우저가 오디오 트랙을 읽고 영상의 실제 길이를 표시할 때까지 기다립니다.',
      '필요한 시작·끝 시간을 초 단위로 입력하고 128·192·320kbps 중 음질을 고릅니다.',
      'MP3 추출 또는 E 키를 누르고 결과를 미리 들은 뒤 기기에 저장합니다.',
    ],
    sections: [
      {
        heading: 'MP4를 MP3로 바꾸면 무엇이 달라지나요?',
        body: 'MP4는 보통 영상과 AAC 오디오를 함께 담는 컨테이너이고, MP3는 별도의 손실 압축 오디오 형식입니다. 이 도구는 선택한 구간의 소리를 브라우저에서 디코딩한 뒤 새 MP3로 인코딩하므로 결과 파일에는 영상 화면이 들어가지 않고 원본 동영상도 바뀌지 않습니다. 강의·회의처럼 말소리가 중심이면 128kbps, 음악과 일반 영상은 192kbps, 용량보다 음질을 우선하면 320kbps가 실용적입니다. CBR MP3의 예상 데이터 크기는 비트레이트 × 초 ÷ 8이며, 128kbps로 60초를 저장하면 인코더의 작은 부가 데이터를 빼고 약 960KB입니다.',
      },
      {
        heading: '필요한 구간만 영상 소리로 저장하기',
        body: '긴 강의·인터뷰·화면 녹화·직접 촬영한 영상에서 필요한 부분만 MP3로 만들려면 추출 전에 시작과 끝 시간을 초 단위로 입력하세요. 선택한 PCM 샘플은 별도 인코더 워커로 보내므로 파일을 만드는 동안에도 페이지가 응답할 수 있습니다. 영상 전체 소리가 필요하면 시작은 0으로 두고 끝은 표시된 영상 길이로 둡니다. MP3를 재생해 원하는 언어 트랙과 구간인지 확인하기 전에는 원본 영상을 지우지 마세요.',
      },
      {
        heading: '브라우저에서 열 수 있는 동영상',
        body: '현재 브라우저가 소리까지 디코딩할 수 있는 로컬 파일이어야 합니다. MP4·M4V·MOV·WebM은 자주 쓰는 확장자라 선택할 수 있지만, 실제로 읽을 수 있는지는 컨테이너 안의 코덱에 따라 달라집니다. 소리가 없는 영상과 암호화된 스트리밍 다운로드 파일은 변환할 수 없습니다. 이 도구는 유튜브 등 영상 주소를 받아 내려받지 않으며, 본인이 소유하거나 변환 권한이 있는 파일만 사용해야 합니다.',
      },
    ],
    faq: [
      {
        q: '동영상 MP3 변환할 때 파일이 서버에 업로드되나요?',
        a: '아니요. 선택한 동영상은 현재 기기의 브라우저에서 디코딩하고 구간을 자르고 MP3로 인코딩합니다. Betterbit은 원본 동영상과 완성된 MP3를 받지 않으며, 결과 파일은 브라우저가 바로 내려받습니다.',
      },
      {
        q: '동영상에서 소리 추출할 때 몇 kbps를 고르면 되나요?',
        a: '강의·회의·팟캐스트처럼 말소리가 중심이면 128kbps, 음악이나 일반 영상은 192kbps, 더 큰 MP3를 감수하고 음질을 우선하면 320kbps를 고르세요. 고정 비트레이트 기준으로 128kbps 60초는 약 960KB, 320kbps 60초는 인코더 부가 데이터를 빼고 약 2.4MB입니다.',
      },
      {
        q: '영상의 일부 구간만 MP3로 저장할 수 있나요?',
        a: '네. MP3 추출 전에 시작과 끝 시간을 초 단위로 입력하면 해당 구간만 저장합니다. 예를 들어 시작 30초와 끝 90초를 입력하면 전체 영상 대신 그 사이의 60초만 MP3로 만듭니다.',
      },
      {
        q: 'MP4 파일인데 왜 동영상 음원 추출에 실패하나요?',
        a: 'MP4는 영상·오디오 코덱을 담는 컨테이너라서 확장자만으로 재생 가능 여부가 정해지지 않습니다. 브라우저가 파일 안의 오디오 코덱을 읽을 수 있어야 하고 실제 오디오 트랙도 있어야 합니다. 보호된 스트리밍 다운로드 파일과 무음 영상은 이 도구로 MP3 소리를 만들 수 없습니다.',
      },
    ],
    ui: {
      dropTitle: '동영상을 여기에 놓거나 파일을 선택하거나 붙여 넣으세요',
      dropHint: 'MP4, MOV, M4V, WebM · 브라우저에서 재생 가능하고 소리가 있는 파일',
      loading: '이 기기에서 오디오 트랙을 읽는 중…',
      privacy: '동영상은 이 브라우저에서 디코딩하고 MP3로 인코딩합니다. 업로드하지 않습니다.',
      decodeFailed: '이 브라우저에서 해당 동영상의 소리를 읽지 못했습니다. 소리가 있는 재생 가능한 파일로 시도하세요.',
      sourceDuration: '영상 길이',
      selectedDuration: '선택한 오디오',
      start: '시작 시간(초)',
      end: '끝 시간(초)',
      rangeHint: '영상에서 필요한 부분만 선택합니다.',
      bitrate: 'MP3 음질',
      bitrateOption: '{value}kbps',
      bitrateHint: '말소리는 128kbps, 균형 잡힌 기본값은 192kbps, 더 큰 파일은 320kbps가 적합합니다.',
      estimatedSize: '예상 MP3 크기',
      estimatedSizeValue: '~{value}KB',
      extract: 'MP3 추출',
      encoding: '이 기기에서 MP3를 만드는 중…',
      rangeError: '소리를 추출하려면 끝 시간을 시작 시간보다 뒤로 지정하세요.',
      encodeFailed: '오디오를 MP3로 인코딩하지 못했습니다. 더 짧은 구간이나 다른 재생 가능한 동영상으로 시도하세요.',
      ready: 'MP3가 준비되었습니다',
      preview: 'MP3 미리 듣기',
      download: 'MP3 다운로드',
      shortcut: '선택 구간 추출:',
      chooseAnother: '다른 동영상 선택',
      cancel: '추출 취소',
    },
  },
};
