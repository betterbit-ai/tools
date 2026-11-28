import type { ToolMeta, ToolVariant } from '../types';

const variants: ToolVariant[] = [
  {
    slug: 'ringtone-maker',
    preset: { ringtone: true },
    content: {
      en: {
        title: 'Ringtone Maker — Cut a 30-Second MP3 Locally',
        description:
          'Make a ringtone from an MP3 in your browser. The 30-second preset opens on a waveform, and frame-copy export keeps the original MP3 bitrate.',
        h1: 'Ringtone Maker',
        intro:
          'Open an MP3 to begin with a 30-second selection. Click the waveform to move either edge, preview it, then download the clipped MP3.',
        sections: [
          {
            heading: 'Ringtone length limits and how the cut is saved',
            body: 'A ringtone is short by design: an iPhone ringtone is limited to 40 seconds with 30 seconds as the practical length, Android accepts most common audio files without a hard rule but built-in ringtone pickers expect a short clip, and notification sounds are shorter still. The 30-second preset matches the iPhone limit and leaves margin everywhere else.\n\nThe export copies complete MP3 frames from the source instead of re-encoding, so the clip keeps the original bitrate and there is no second lossy pass. The cut lands on the nearest frame boundary — about 26 ms at 128 kbps — which is inaudible in a ringtone but is not sample-accurate.',
            table: {
              caption: 'Typical ringtone and alert lengths',
              head: ['Use', 'Maximum', 'Common length'],
              rows: [
                ['iPhone ringtone', '40 s', '30 s'],
                ['Android ringtone', 'No fixed limit', '30–40 s'],
                ['Notification sound', 'A few seconds', '1–5 s'],
                ['Alarm', 'No fixed limit', '30 s'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How long can an iPhone ringtone be?',
            a: '40 seconds, with 30 seconds as the usual working length. iPhones store ringtones as .m4r; this tool exports MP3, which Android and desktop players accept directly.',
          },
          {
            q: 'Does cutting an MP3 reduce its quality?',
            a: 'Not here. The export copies complete MP3 frames instead of decoding and re-encoding, so the clip keeps the original bitrate and is not degraded by a second compression pass.',
          },
          {
            q: 'Why is the cut not exactly at the time I typed?',
            a: 'MP3 frames are fixed-size blocks, so the cut snaps to the nearest frame boundary — about 26 ms at 128 kbps, below the threshold of hearing for a ringtone.',
          },
        ],
      },
      ko: {
        title: '벨소리 만들기 — 30초 MP3 자르기, 업로드 없음',
        description:
          'MP3 파일로 30초 벨소리를 만드세요. 파형에서 구간을 조정하고, 원본 비트레이트를 다시 인코딩하지 않고 MP3로 저장합니다.',
        h1: '벨소리 만들기',
        intro:
          'MP3를 열면 30초 구간이 먼저 선택됩니다. 파형에서 양 끝을 조정하고 미리 들은 뒤 잘라낸 MP3를 저장하세요.',
        sections: [
          {
            heading: '벨소리 길이 제한과 잘라내는 방식',
            body: '벨소리는 짧게 설계되어 있습니다. 아이폰 벨소리는 40초가 상한이고 실용적인 길이는 30초, 안드로이드는 대부분의 오디오 형식을 받지만 기본 벨소리 선택기는 짧은 클립을 기대하며, 알림음은 더 짧습니다. 30초 프리셋은 아이폰 한도에 맞고 다른 기기에서는 여유가 남습니다.\n\n내보내기는 원본 MP3의 프레임을 그대로 복사하며 다시 인코딩하지 않습니다. 그래서 클립이 원본 비트레이트를 유지하고 두 번째 손실 압축이 생기지 않습니다. 절단점은 가장 가까운 프레임 경계에 맞춰지며 128kbps에서 약 26ms여서 벨소리로는 들리지 않지만 샘플 단위로 정확하지는 않습니다.',
            table: {
              caption: '벨소리·알림음의 일반적인 길이',
              head: ['용도', '최대 길이', '흔한 길이'],
              rows: [
                ['아이폰 벨소리', '40초', '30초'],
                ['안드로이드 벨소리', '정해진 제한 없음', '30~40초'],
                ['알림음', '수 초', '1~5초'],
                ['알람', '정해진 제한 없음', '30초'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '아이폰 벨소리는 몇 초까지 가능한가요?',
            a: '40초이고 실용적인 길이는 30초입니다. 아이폰은 .m4r 형식을 쓰며, 이 도구는 MP3로 내보내므로 안드로이드와 데스크톱 플레이어에서 바로 재생됩니다.',
          },
          {
            q: 'MP3를 자르면 음질이 떨어지나요?',
            a: '여기서는 아닙니다. 프레임을 그대로 복사하고 재인코딩하지 않으므로 원본 비트레이트가 유지되고 두 번째 압축이 생기지 않습니다.',
          },
          {
            q: '입력한 시간과 정확히 맞지 않는 이유는?',
            a: 'MP3 프레임이 고정 크기 블록이라 절단점이 가장 가까운 프레임 경계에 맞춰지기 때문입니다. 128kbps에서 약 26ms로 벨소리에서는 차이를 느끼기 어렵습니다.',
          },
        ],
      },
    },
  },
];

export const meta: ToolMeta = {
  slug: 'audio-cutter',
  category: 'media',
  icon: 'speaker',
  added: '2026-10-24',
  updated: '2026-11-28',
  edges: ['privacy', 'performance'],
  competitors: [
    {
      name: 'TrackMix Audio Cutter',
      url: 'https://trackmix.app/audio-cutter/',
      weakness:
        'It keeps files local and includes waveform handles, typed times, fades and MP3/WAV export (Strength: it accepts more audio and video formats), but its published tool caps clips at 60 minutes and does not say that an MP3 export is a frame copy. Betterbit makes its MP3-only, no-re-encode scope explicit beside the download control.',
    },
    {
      name: 'AudioKit MP3 Cutter',
      url: 'https://audiokit.app/mp3-cutter',
      weakness:
        'It processes locally and offers sample-accurate cuts, fades and a separate ringtone maker (Strength: it can remove a middle selection and share on supported phones). Its page says every cut MP3 is re-encoded and defaults to 192 kbps; Betterbit copies complete source MP3 frames instead.',
    },
    {
      name: 'Audio Splitter MP3 Cutter',
      url: 'https://audiosplitter.io/mp3-cutter',
      weakness:
        'It also offers local, lossless frame-boundary MP3 cutting and multiple clips (Strength: it can remove a middle section and its paid plan adds batch ZIP, chapters and re-encoding). Its page distinguishes cutter, trimmer and splitter flows; Betterbit opens directly to one keep-selection waveform with a ringtone preset.',
    },
    {
      name: 'cut.audio MP3 자르기',
      url: 'https://cut.audio/ko/mp3-jareugi/',
      weakness:
        'Its Korean page offers multi-point waveform cuts and several export formats (Strength: it can split many clips and bundle downloads as ZIP), but its published free tier limits exports to 10 per day and files to 1 hour; its page also describes MP3 as re-encoded. Betterbit has no service quota and copies MP3 frames without a new encode pass.',
    },
    {
      name: 'Sunasty MP3 자르기',
      url: 'https://sunasty.com/ko/odio-jareugi/',
      weakness:
        'Its Korean page keeps processing in the browser and starts a ringtone preset at the first 30 seconds with a two-second fade (Strength: it includes fade controls). Betterbit instead starts with the complete MP3, lets the waveform choose any 30-second section, and preserves the source MP3 frames without re-encoding.',
    },
    {
      name: '123apps Audio Cutter (mp3cut.net)',
      url: 'https://mp3cut.net/ko/pricing',
      weakness:
        'Its Korean pricing page says free use is limited to 35 files per day and shows ads, while a Korean search result describes the service upload flow and up to 12-hour retention. (Strength: it supports many input formats, fades and an M4R ringtone preset.) Betterbit reads only a local MP3 and produces the download without a service quota or transfer.',
    },
  ],
  related: [
    'audio-converter',
    'video-to-gif',
    'video-compressor',
    'video-to-mp3',
    'metronome',
    'speaker-test',
    'voice-recorder',
  ],
  variants,
};
