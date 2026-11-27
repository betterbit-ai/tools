import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  openFile: 'Open an audio file',
  openFileHint:
    'MP3, WAV, M4A, AAC, OGG, Opus, FLAC or AIFF — or a video: MP4, WebM, MOV. Drop it, click to browse, or paste with Ctrl/Cmd+V.',
  dropHeading: 'Drop an audio file to convert',
  dropNote: 'Nothing is uploaded. The file is decoded and re-encoded on this device.',
  changeFile: 'Choose another file',
  formatLabel: 'Output format',
  formatMp3: 'MP3',
  formatWav: 'WAV',
  bitrateLabel: 'MP3 bitrate',
  bitrateHint: 'Higher is closer to the original; 320 kbps is the best MP3 offers.',
  sourceTitle: 'Your file',
  sourceSize: 'File size',
  duration: 'Length',
  sound: 'Channels and rate',
  outputTitle: 'Converted file',
  outputSize: 'Output size',
  savings: 'Size change',
  converting: 'Converting…',
  progressLabel: 'Conversion progress',
  cancel: 'Cancel',
  cancelled: 'Conversion stopped. Your file is still loaded.',
  convertAgain: 'Convert again',
  download: 'Download',
  playerLabel: 'Preview of the original file',
  errorEmpty: 'That file is empty. Choose a file that contains audio.',
  errorTooLarge: 'Files up to 300 MB are supported. Split a longer recording first.',
  errorTooLong: 'Files up to 20 minutes are supported in this browser. Split a longer recording first.',
  errorDecodeFailed:
    'This browser could not decode that file. Try MP3, WAV, M4A, OGG or FLAC — or export it again at a standard bitrate.',
  errorNoAudio: 'The file has no audio track, or its audio is silent and zero-length.',
  errorEncodeFailed: 'The MP3 encoder stopped unexpectedly. Try WAV output, or a shorter file.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'MP3 Converter — WAV, M4A, OGG to MP3 in Your Browser',
    description:
      'Convert WAV, M4A, OGG, FLAC, AIFF or a video soundtrack to MP3 (128–320 kbps) or 16-bit WAV. The file is decoded and encoded on your device, so nothing is uploaded.',
    h1: 'Audio Converter',
    tagline:
      'Turn any audio your browser can play into an MP3 or WAV file — with the bitrate you choose and no upload.',
    name: 'Audio Converter',
    keywords: [
      'mp3 converter',
      'wav to mp3',
      'm4a to mp3',
      'ogg to mp3',
      'audio converter',
      'convert to wav',
      '온라인 mp3 변환',
    ],
    howTo: [
      'Drop an audio file — MP3, WAV, M4A, OGG, FLAC, AIFF — or a video whose soundtrack you want.',
      'The file is decoded on this device and converted to MP3 at 192 kbps straight away.',
      'Pick MP3 or WAV and, for MP3, the bitrate you need; the file is converted again as you choose.',
      'Check the output size and the size change, then press Download.',
    ],
    sections: [
      {
        heading: 'What actually happens on this page',
        body: "Your browser's own audio decoder (Web Audio `decodeAudioData`) reads the file and resamples it to 44.1 kHz, then an MPEG-1 Layer III encoder — lamejs, running in a background worker — writes the MP3. Nothing is uploaded, so there is no queue, no file-size plan and no eight-hour deletion promise to trust. The only cost of a big file is your own memory and CPU.\n\nThe flip side of running locally is the browser's format list. If this browser cannot play a file, it cannot decode it either: WMA and some DRM-protected M4A files fail here where a server-side converter with ffmpeg would succeed.",
      },
      {
        heading: 'Choosing a bitrate',
        body: 'MPEG-1 Layer III stores 128, 192, 256 or 320 kbps in the ordinary stereo case, and the file size follows almost exactly: 192 kbps means 192,000 bits per second, or about 1.4 MB per minute. A CD-quality WAV is about 10 MB per minute, so 192 kbps is roughly a seventh of the size.\n\n128 kbps is fine for speech — interviews, lectures, voice memos. 192 kbps is the usual compromise for music you listen to casually. 256 or 320 kbps is for material you keep or send to a distributor, where the difference from the original is hard to hear but the file is still much smaller than WAV. Converting an MP3 to a higher bitrate never restores what the first encode removed, so 320 kbps only helps when the source was lossless.',
      },
      {
        heading: 'When to pick WAV instead',
        body: 'WAV output here is uncompressed 16-bit PCM at 44.1 kHz — the format editors and DAWs expect. Use it to hand a recording to someone whose software will not open M4A or OGG, or to keep an unprocessed copy before editing. Because it is uncompressed, a WAV is always larger than the MP3 of the same audio; the tool says so instead of calling a bigger file "compressed".',
      },
      {
        heading: 'Limits, and why they exist',
        body: 'Files up to 300 MB and about 20 minutes are accepted. The decoded audio has to live in memory while it is converted — a stereo minute at 44.1 kHz is about 21 MB of samples before encoding — so a longer recording is refused with a message rather than crashing the tab. MP3 encoding runs off the main thread, so the page keeps scrolling and the Cancel button keeps working; cancelling stops the encoder instead of leaving it running in the background.',
      },
    ],
    faq: [
      {
        q: 'Is my file uploaded to a server?',
        a: 'No. The page decodes the file with the browser’s own audio decoder and encodes the MP3 with lamejs inside a background worker on your device. Nothing is sent anywhere, which is also why there is no account, no daily limit and no waiting queue.',
      },
      {
        q: 'Does converting to MP3 lose quality?',
        a: 'Yes — MP3 is lossy, so some of the signal is discarded to make the file smaller. At 192 kbps the loss is hard to notice on most recordings, and at 320 kbps it is very hard to hear. Keep the original WAV or FLAC as your master and treat the MP3 as the copy you share.',
      },
      {
        q: 'Which formats can I convert from?',
        a: 'Anything this browser can decode: typically MP3, WAV, M4A/AAC, OGG/Opus, FLAC and AIFF, plus the audio track of MP4, WebM and MOV videos. WMA and DRM-protected files usually fail, because browsers do not ship decoders for them.',
      },
      {
        q: 'How big will the MP3 be?',
        a: 'Bitrate × length ÷ 8. A three-minute song is about 4.3 MB at 192 kbps, 2.9 MB at 128 kbps and 7.2 MB at 320 kbps. The tool shows the estimate before converting and the real size afterwards.',
      },
      {
        q: 'What sample rate is the output?',
        a: '44.1 kHz, the standard MP3 rate and the rate of a CD. Stereo stays stereo; mono stays mono and produces a smaller file. The decoded audio is resampled to 44.1 kHz if the source used a different rate, such as 48 kHz from a phone video.',
      },
      {
        q: 'Why is my 20-minute podcast rejected?',
        a: 'Decoded audio is held in memory while it is converted: about 21 MB per stereo minute at 44.1 kHz. To keep the tab alive on phones, files over 20 minutes (or 300 MB) are refused with a message. Split the recording in two and convert each half.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'MP3 변환기 — WAV·M4A·OGG를 브라우저에서 MP3로',
    description:
      'WAV, M4A, OGG, FLAC, AIFF는 물론 동영상의 소리까지 MP3(128~320kbps)나 16비트 WAV로 변환합니다. 파일을 업로드하지 않고 내 기기에서 디코딩·인코딩합니다.',
    h1: '오디오 변환기',
    tagline:
      '브라우저가 재생할 수 있는 오디오라면 MP3나 WAV로 바로 바꿉니다. 비트레이트는 직접 고르고, 업로드는 없습니다.',
    name: '오디오 변환기',
    keywords: [
      'mp3 변환',
      'wav mp3 변환',
      'm4a mp3 변환',
      'ogg mp3 변환',
      '오디오 변환기',
      'wav 변환',
      'mp3 converter',
    ],
    howTo: [
      'MP3·WAV·M4A·OGG·FLAC·AIFF 파일이나, 소리만 뽑고 싶은 동영상을 끌어다 놓으세요.',
      '기기 안에서 파일을 읽어 곧바로 192kbps MP3로 변환합니다.',
      'MP3 또는 WAV를 고르고, MP3라면 비트레이트를 정하세요. 고르는 대로 다시 변환됩니다.',
      '결과 용량과 원본 대비 변화를 확인한 뒤 다운로드하세요.',
    ],
    sections: [
      {
        heading: '이 페이지 안에서 실제로 일어나는 일',
        body: '브라우저 자체 오디오 디코더(Web Audio `decodeAudioData`)가 파일을 읽어 44.1kHz로 맞추고, MPEG-1 Layer III 인코더(lamejs)가 백그라운드 워커에서 MP3를 만듭니다. 어디에도 업로드하지 않으므로 대기열도, 용량 요금제도, "8시간 뒤 삭제" 같은 약속을 믿을 일도 없습니다. 큰 파일의 비용은 내 기기의 메모리와 CPU뿐입니다.\n\n대신 브라우저가 재생할 수 없는 형식은 변환할 수도 없습니다. WMA나 DRM이 걸린 M4A는 ffmpeg를 쓰는 서버형 변환기에서는 되지만 여기서는 실패합니다.',
      },
      {
        heading: '비트레이트 선택 기준',
        body: '일반적인 스테레오에서 MPEG-1 Layer III는 128·192·256·320kbps를 쓰고, 용량은 거의 그대로 따라갑니다. 192kbps는 초당 192,000비트이므로 1분에 약 1.4MB입니다. CD 음질 WAV가 1분에 약 10MB이니 192kbps면 대략 7분의 1로 줄어듭니다.\n\n128kbps는 말소리(인터뷰·강의·음성 메모)에 충분합니다. 음악을 가볍게 들을 때는 192kbps가 무난하고, 보관하거나 유통할 파일은 256~320kbps를 쓰세요. 이미 MP3인 파일을 더 높은 비트레이트로 다시 인코딩해도 처음에 잃은 정보는 돌아오지 않으므로, 320kbps가 의미 있는 경우는 원본이 무손실일 때입니다.',
      },
      {
        heading: 'WAV를 골라야 할 때',
        body: '여기서 만드는 WAV는 44.1kHz 16비트 PCM, 즉 편집 프로그램과 DAW가 기대하는 형식입니다. M4A나 OGG를 열지 못하는 프로그램에 녹음을 넘길 때, 또는 편집 전 원본을 그대로 보관할 때 쓰세요. 압축하지 않으므로 같은 오디오의 MP3보다 항상 큽니다. 이 도구는 그 경우 "압축됐다"고 말하지 않고 용량이 늘었다고 그대로 보여 줍니다.',
      },
      {
        heading: '제한과 그 이유',
        body: '300MB, 약 20분까지 변환합니다. 변환하는 동안 디코딩된 오디오가 메모리에 있어야 하기 때문입니다. 44.1kHz 스테레오 1분이 약 21MB의 샘플이고, 인코딩 전에 그만큼이 필요합니다. 더 긴 파일은 탭이 죽는 대신 안내 문구와 함께 거절합니다. MP3 인코딩은 메인 스레드 밖에서 돌기 때문에 페이지는 계속 움직이고 취소 버튼도 동작합니다. 취소하면 인코더가 실제로 멈춥니다.',
      },
    ],
    faq: [
      {
        q: '파일이 서버로 업로드되나요?',
        a: '아니요. 브라우저의 오디오 디코더로 파일을 읽고, lamejs가 기기 안 백그라운드 워커에서 MP3를 만듭니다. 어디에도 전송하지 않기 때문에 회원가입도, 일일 제한도, 대기열도 없습니다.',
      },
      {
        q: 'MP3로 바꾸면 음질이 떨어지나요?',
        a: '네. MP3는 손실 압축이라 파일을 줄이려고 일부 신호를 버립니다. 192kbps면 대부분의 녹음에서 차이를 느끼기 어렵고, 320kbps면 거의 구분되지 않습니다. 원본 WAV나 FLAC은 마스터로 남겨 두고 MP3는 공유용 사본으로 쓰세요.',
      },
      {
        q: '어떤 형식에서 변환할 수 있나요?',
        a: '이 브라우저가 디코딩할 수 있는 형식이면 됩니다. 보통 MP3, WAV, M4A/AAC, OGG/Opus, FLAC, AIFF와 MP4·WebM·MOV 동영상의 소리 트랙입니다. WMA나 DRM이 걸린 파일은 브라우저에 디코더가 없어 대개 실패합니다.',
      },
      {
        q: 'MP3 용량은 얼마나 되나요?',
        a: '비트레이트 × 길이 ÷ 8입니다. 3분 곡이면 128kbps에서 약 2.9MB, 192kbps에서 약 4.3MB, 320kbps에서 약 7.2MB입니다. 변환 전에 예상 용량을, 변환 후에는 실제 용량을 보여 줍니다.',
      },
      {
        q: '출력 샘플레이트는 얼마인가요?',
        a: '44.1kHz입니다. MP3의 표준이자 CD의 샘플레이트입니다. 스테레오는 스테레오로, 모노는 모노로 유지되어 모노 파일이 더 작습니다. 휴대폰 동영상처럼 48kHz인 원본은 44.1kHz로 다시 샘플링됩니다.',
      },
      {
        q: '20분짜리 팟캐스트가 거절되는 이유는요?',
        a: '변환하는 동안 디코딩된 오디오가 메모리에 있어야 합니다. 44.1kHz 스테레오 기준 1분에 약 21MB입니다. 휴대폰에서도 탭이 살아 있도록 20분(또는 300MB)을 넘는 파일은 안내와 함께 거절합니다. 녹음을 반으로 나눠 각각 변환하세요.',
      },
    ],
    ui: {
      openFile: '오디오 파일 열기',
      openFileHint:
        'MP3, WAV, M4A, AAC, OGG, Opus, FLAC, AIFF 또는 동영상(MP4·WebM·MOV). 끌어다 놓거나 클릭해서 선택하고, Ctrl/Cmd+V로 붙여넣을 수 있습니다.',
      dropHeading: '변환할 오디오 파일을 끌어다 놓으세요',
      dropNote: '업로드하지 않습니다. 파일은 이 기기에서 디코딩하고 다시 인코딩합니다.',
      changeFile: '다른 파일 선택',
      formatLabel: '출력 형식',
      formatMp3: 'MP3',
      formatWav: 'WAV',
      bitrateLabel: 'MP3 비트레이트',
      bitrateHint: '높을수록 원본에 가깝습니다. 320kbps가 MP3의 최고 품질입니다.',
      sourceTitle: '원본 파일',
      sourceSize: '파일 크기',
      duration: '길이',
      sound: '채널·샘플레이트',
      outputTitle: '변환 결과',
      outputSize: '결과 용량',
      savings: '용량 변화',
      converting: '변환 중…',
      progressLabel: '변환 진행률',
      cancel: '취소',
      cancelled: '변환을 멈췄습니다. 파일은 그대로 열려 있습니다.',
      convertAgain: '다시 변환',
      download: '다운로드',
      playerLabel: '원본 파일 미리 듣기',
      errorEmpty: '빈 파일입니다. 소리가 들어 있는 파일을 선택하세요.',
      errorTooLarge: '300MB까지 지원합니다. 더 긴 녹음은 먼저 나눠 주세요.',
      errorTooLong: '이 브라우저에서는 20분까지 지원합니다. 더 긴 녹음은 먼저 나눠 주세요.',
      errorDecodeFailed:
        '이 브라우저가 파일을 읽지 못했습니다. MP3·WAV·M4A·OGG·FLAC로 다시 시도하거나, 다른 앱에서 표준 형식으로 내보낸 뒤 시도하세요.',
      errorNoAudio: '오디오 트랙이 없거나 길이가 0인 파일입니다.',
      errorEncodeFailed: 'MP3 인코더가 예기치 않게 멈췄습니다. WAV로 시도하거나 더 짧은 파일로 시도하세요.',
    },
  },
};
