import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'video-to-mp3',
  category: 'media',
  icon: 'video',
  added: '2026-10-27',
  updated: '2026-10-27',
  edges: ['privacy', 'performance'],
  competitors: [
    {
      name: 'FreeConvert MP4 to MP3',
      url: 'https://www.freeconvert.com/mp4-to-mp3',
      weakness:
        'Its opened MP4-to-MP3 page asks users to choose a file for online conversion, offers Dropbox, Google Drive, OneDrive and URL sources, and displays a 1 GB maximum with an upgrade/sign-up prompt. (Strength: it provides server-side advanced controls for codec, volume, fades, reverse audio and trim.) Betterbit does not transfer the selected video and starts its local audio decode immediately.',
    },
    {
      name: 'Convertio MP4 to MP3',
      url: 'https://convertio.co/mp4-mp3/',
      weakness:
        'Its opened page explicitly describes “Cloud-Based Extraction” that runs entirely on its servers and its flow accepts computer, Google Drive, Dropbox or URL inputs before conversion. (Strength: it supports more than 200 output formats plus sample-rate and channel settings.) Betterbit keeps the source and MP3 on the device, avoiding an upload and server queue for browser-playable files.',
    },
    {
      name: 'CloudConvert MP4 to MP3',
      url: 'https://cloudconvert.com/mp4-to-mp3',
      weakness:
        'Its MP4-to-MP3 converter is an online CloudConvert job flow, so the selected file is sent to its service before the result is available. (Strength: it supports broad input/output formats and API-driven conversions.) Betterbit is deliberately limited to browser-readable local video but does not need a remote conversion job.',
    },
    {
      name: 'JPGtoMP4 동영상에서 소리만 추출',
      url: 'https://jpgtomp4.com/ko/mp4-to-mp3/',
      weakness:
        'Its Korean search-visible page also says processing is local and lists MP3, M4A, OGG and WAV outputs with no file-size limit. (Strength: it offers three extra audio formats.) Its presented file-picker workflow does not expose a typed start/end selection before export; Betterbit makes the exact MP3 interval and expected size visible in the conversion panel.',
    },
    {
      name: '꿀툴 MP4 MP3 변환',
      url: 'https://kkultools.com/convert/mp4-to-mp3',
      weakness:
        'Its Korean search-visible tool processes locally and provides MP3, M4A and WAV choices (Strength: it offers an AAC copy mode and three output types), but limits a selection to five files and 100 MB. Betterbit has no service-imposed file count or size quota; it attempts a browser-playable file within the device’s available memory.',
    },
    {
      name: 'soobase 영상 MP3·GIF 변환',
      url: 'https://soobase.com/video-convert/',
      weakness:
        'Its Korean search-visible page says it uploads files for server-side FFmpeg conversion, caps inputs at 200 MB, and retains the source until conversion plus the result for 30 minutes. (Strength: it combines video-to-MP3 and video-to-GIF conversion.) Betterbit never sends the selected local video to a service and provides a dedicated range-and-bitrate flow.',
    },
  ],
  related: ['video-to-gif', 'video-compressor', 'audio-cutter', 'voice-recorder'],
};
