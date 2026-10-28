import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'video-to-gif',
  category: 'media',
  icon: 'video',
  added: '2026-10-24',
  updated: '2026-10-24',
  edges: ['privacy', 'usability', 'performance', 'no-signup'],
  competitors: [
    {
      name: 'W3Schools Video to GIF Converter',
      url: 'https://www.w3schools.com/tools/tool_video_to_gif.php',
      weakness:
        'It processes locally and exposes start, end, FPS and width (Strength: its core local controls match this tool), but its converter page surrounds the compact form with an ad-removal offer and does not show the selected clip’s exact frame or pixel workload before conversion.',
    },
    {
      name: 'Upsampler Video to GIF',
      url: 'https://upsampler.com/free-video-to-gif-no-signup',
      weakness:
        'It also keeps files in the browser and offers a drag range, width and frame rate (Strength: it says it builds a fresh palette per frame). Its page sends users to separate trimmer and compressor tools for follow-up work and does not expose a numeric frame-work limit next to the conversion settings.',
    },
    {
      name: 'Ezgif Video to GIF',
      url: 'https://ezgif.com/video-to-gif',
      weakness:
        'Its default flow accepts a server upload, retains uploaded files for up to 1 hour, and caps files at 200MB; local processing is an optional checkbox and some follow-up tools explicitly use the server. (Strength: it supports many more input formats and post-conversion editing tools.)',
    },
    {
      name: 'Adobe Express GIF Converter',
      url: 'https://www.adobe.com/kr/express/feature/video/convert/video-to-gif',
      weakness:
        'Its Korean flow asks users to upload a video and then choose file size and layout before download, rather than explaining that the file stays local. (Strength: it offers layout choices and a broader editor for social-media design.)',
    },
    {
      name: 'Kapwing Video to GIF',
      url: 'https://www.kapwing.com/tools/convert/video-to-gif',
      weakness:
        'It begins with an online video upload/editor workflow and promotes templates, stock assets, subtitles and collaboration around the conversion. (Strength: it provides a full shared editor and link-based media workflow beyond this focused local converter.)',
    },
  ],
  related: [
    'image-resizer',
    'image-compressor',
    'image-converter',
    'gif-maker',
    'video-compressor',
    'video-to-mp3',
    'audio-cutter',
    'screen-recorder',
  ],
};
