import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'audio-converter',
  category: 'media',
  icon: 'speaker',
  added: '2026-11-27',
  updated: '2026-11-27',
  edges: ['privacy', 'performance', 'features', 'no-signup'],
  competitors: [
    {
      name: 'FreeConvert — WAV to MP3',
      url: 'https://www.freeconvert.com/wav-to-mp3',
      weakness:
        'Its opened page asks you to choose files, upload them, wait while the server converts, and then download — and it promises files are "automatically deleted after 8 hours", which means the audio sat on someone else\'s disk. Betterbit starts converting the moment the file is dropped, keeps it on your device, and shows the bitrate and the resulting size on the same screen. (Strength: it offers volume, fade and trim options in the same flow.)',
    },
    {
      name: 'CloudConvert — Audio Converter',
      url: 'https://cloudconvert.com/audio-converter',
      weakness:
        'Its opened page is an upload-first converter with free conversion minutes per day, so repeat use runs into a metered plan. Betterbit has no upload step, no minute allowance and no account. (Strength: it covers a very long list of audio formats through ffmpeg.)',
    },
    {
      name: 'Cacao Docs — 오디오를 MP3로 변환',
      url: 'https://www.cacaodocs.com/ko/media/audio-to-mp3',
      weakness:
        'Its opened Korean page accepts uploads up to 1 GB, yet its own FAQ says a subscription plan is needed to download the finished file. Betterbit writes the file in your browser and the download button is never paywalled. (Strength: it also transcribes the audio and extracts sound from video.)',
    },
    {
      name: 'Movavi 온라인 오디오 변환기',
      url: 'https://www.movavi.com/kr/audio-converter/',
      weakness:
        'Its opened Korean page is a three-step upload, choose format, convert flow that repeatedly points to the paid desktop program. Betterbit converts locally in one step and never nudges you toward an install. (Strength: it lists many video and image targets in one place.)',
    },
    {
      name: 'AudioKit 오디오 변환기',
      url: 'https://audio-kit.me/ko',
      weakness:
        'Its opened Korean page is also local, but it downloads a ~31 MB ffmpeg engine on the first conversion and caps a batch at five files. Betterbit ships a ~100 KB MP3 encoder inside the page and converts a file the moment it is dropped. (Strength: ffmpeg gives it FLAC, M4A and OGG *output* as well as input.)',
    },
    {
      name: 'AmoyShare 오디오 MP3 변환기',
      url: 'https://ko.amoyshare.com/audio-converter/audio-to-mp3/',
      weakness:
        'Its opened Korean page is an upload-based converter that advertises a 60× batch speed on its servers and pushes its paid desktop suite. Betterbit keeps the file on the device and states the 20-minute / 300 MB ceiling instead of hiding it behind a plan. (Strength: it also pulls audio from video sites.)',
    },
  ],
  related: ['audio-cutter', 'video-to-mp3', 'voice-recorder', 'compress-pdf'],
};
