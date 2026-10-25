import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'video-compressor',
  category: 'media',
  icon: 'video',
  added: '2026-10-24',
  updated: '2026-10-24',
  edges: ['privacy', 'performance'],
  competitors: [
    {
      name: 'SquishyFile',
      url: 'https://squishyfile.com/',
      weakness:
        'It also runs locally and offers both a quality level and an exact target size. Its output is always H.264 MP4 and its interface asks the user to choose between “By feel” and “Exact size” before export, while Betterbit shows the chosen output resolution, estimated size, and final before/after sizes together. (Strength: it supports target-size exports and more input containers.)',
    },
    {
      name: 'The Video Change',
      url: 'https://www.thevideochange.com/',
      weakness:
        'It processes MP4, MOV, and WebM locally, but its page limits input to 500MB. Betterbit has no service-imposed file-size limit: it can attempt any browser-playable file that the device has enough memory to handle. (Strength: it offers quick 10MB, 25MB, and 50MB target-size presets.)',
    },
    {
      name: 'smaller.video',
      url: 'https://smaller.video/',
      weakness:
        'It runs FFmpeg WebAssembly locally and supports target sizes, trim, audio, and output containers, but says its first compression downloads roughly 30MB of encoder code. Betterbit uses the browser’s built-in recorder with no codec-engine download and immediately exposes the actual result size. (Strength: it has more advanced controls and a corrective second pass for strict target sizes.)',
    },
    {
      name: 'PlainCode 영상 용량 줄이기',
      url: 'https://plaincode.kr/video-size-reducer',
      weakness:
        'Its Korean page says output files are retained for 3 hours, free users are limited to 3 compressions per day, and the free tier is capped at 600MB and 6 minutes. Betterbit keeps the source and result in the browser instead of placing a copy on a service. (Strength: it accepts more listed containers and offers an audio-removal option.)',
    },
    {
      name: 'Happy Scribe 동영상 압축',
      url: 'https://www.happyscribe.com/ko/tools/video-compressor',
      weakness:
        'Its Korean FAQ says processing uses encrypted transfer and deletes files one hour later, which means the video is uploaded and retained by the service during that period. Betterbit starts local re-encoding without a network transfer. (Strength: it advertises support for files up to 4GB.)',
    },
    {
      name: '비디오프레소',
      url: 'https://videopresso.co.kr/',
      weakness:
        'Its web flow accepts one file at a time up to 100MB, then promotes a paid purchase for files over 100MB and multiple files; its fuller tool is a Windows program requiring installation and licence activation. Betterbit needs no installer and does not send the selected browser-playable video away. (Strength: its desktop product supports H.264 input up to 4K and larger paid workloads.)',
    },
  ],
  related: ['video-to-gif', 'image-compressor', 'audio-cutter', 'voice-recorder', 'screen-recorder'],
};
