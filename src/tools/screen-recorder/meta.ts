import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'screen-recorder',
  category: 'media',
  icon: 'display',
  added: '2026-10-25',
  updated: '2026-10-25',
  edges: ['privacy', 'performance', 'usability'],
  competitors: [
    {
      name: 'Smooth Clip Screen Recorder',
      url: 'https://www.smoothclip.com/screen-recorder',
      weakness:
        'Its opened page keeps capture local but says a WebM-to-MP4 conversion uploads the recording, retains that upload for up to 24 hours, and limits conversion to 2 GB or 60 minutes. Betterbit offers only the browser-made WebM or MP4 directly, so there is no post-recording upload or conversion wait. (Strength: it offers an MP4 conversion path and linked editing tools.)',
    },
    {
      name: 'Rescreen Free Screen Recorder',
      url: 'https://www.rescreen.so/free-screen-recorder/',
      weakness:
        'Its opened free-plan page says the recording can be shared by link but downloading the video file requires Pro at $20 per month or $10 per month billed yearly. Betterbit keeps the result on-device and exposes a direct file download after recording. (Strength: it supplies automatic cuts, zooms, noise cleanup and a full editor.)',
    },
    {
      name: 'Apowersoft Free Online Screen Recorder',
      url: 'https://www.apowersoft.com/free-online-screen-recorder',
      weakness:
        'Its opened recorder presents a “Please download the application” prompt and promotes cloud video management and uploads alongside recording. Betterbit starts with the browser’s native screen picker and holds the capture locally until its direct download. (Strength: it advertises region recording, scheduler and window-exclusion controls.)',
    },
    {
      name: 'VEED 화면 녹화기',
      url: 'https://www.veed.io/ko-KR/tools/screen-recorder',
      weakness:
        'Its opened Korean page routes a finished recording toward sharing, an editor and export, includes a Chrome-extension recommendation, and presents a broad AI/video product navigation before the recording path. Betterbit keeps screen selection, pause, preview and local file download in one compact panel. (Strength: it offers webcam layouts, captions, editing, collaboration and share links.)',
    },
    {
      name: 'ScreenRecorder 무료 온라인 화면 녹화기',
      url: 'https://thefreescreenrecorder.com/',
      weakness:
        'Its opened local recorder includes camera layouts, filters, noise reduction, an editor, annotations and a 9:16 export flow around the initial task. Betterbit deliberately starts with one screen picker, an optional microphone switch, pause controls and a direct local download. (Strength: it has substantially deeper editing and social-video tools.)',
    },
    {
      name: 'Bytley Free Online Screen Recorder',
      url: 'https://www.bytley.co/screen-recorder/',
      weakness:
        'Its opened local recorder asks users to set quality and frame rate, and offers a webcam overlay before its Start recording action. Betterbit makes the immediate screen-to-download path the first action while showing only the optional microphone setting. (Strength: it exposes quality, frame-rate and webcam-overlay controls.)',
    },
  ],
  related: ['video-compressor', 'video-to-gif', 'voice-recorder', 'mic-test'],
};
