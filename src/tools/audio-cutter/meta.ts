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
      },
      ko: {
        title: '벨소리 만들기 — 30초 MP3 자르기, 업로드 없음',
        description:
          'MP3 파일로 30초 벨소리를 만드세요. 파형에서 구간을 조정하고, 원본 비트레이트를 다시 인코딩하지 않고 MP3로 저장합니다.',
        h1: '벨소리 만들기',
        intro:
          'MP3를 열면 30초 구간이 먼저 선택됩니다. 파형에서 양 끝을 조정하고 미리 들은 뒤 잘라낸 MP3를 저장하세요.',
      },
    },
  },
];

export const meta: ToolMeta = {
  slug: 'audio-cutter',
  category: 'media',
  icon: 'speaker',
  added: '2026-10-24',
  updated: '2026-10-24',
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
  related: ['video-to-gif', 'video-compressor', 'metronome', 'speaker-test'],
  variants,
};
