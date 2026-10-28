import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'gif-maker',
  category: 'image',
  icon: 'image',
  added: '2026-10-28',
  updated: '2026-10-28',
  edges: ['privacy', 'performance', 'usability'],
  competitors: [
    {
      name: 'Ezgif GIF Maker',
      url: 'https://ezgif.com/maker',
      weakness:
        'Its default upload flow sends files to a server, stores them for up to 1 hour, and presents local processing only as an optional checkbox with limited features. (Strength: it accepts many formats, ZIP archives, and offers detailed post-processing.)',
    },
    {
      name: 'Switch Labs GIF Maker',
      url: 'https://www.switchlabs.dev/gif-maker',
      weakness:
        'Its page combines image and video modes and places a CRM contact form and newsletter signup below the tool, rather than keeping the experience focused on a quick photo sequence. (Strength: it supports HEIC photos, video clips, colour counts, and per-frame palette choices.)',
    },
    {
      name: 'ZOOOP GIF Maker',
      url: 'https://zooop.ai/free-tools/gif-maker',
      weakness:
        'It keeps files local but downloads a 30 MB WebAssembly encoder on first use, and all frames adopt the first image shape with smaller frames centered on white. (Strength: it accepts HEIC, AVIF, BMP, SVG, and more input formats.)',
    },
    {
      name: 'Altto GIF Maker',
      url: 'https://altto.co.uk/gif-maker',
      weakness:
        'It defaults to a 640 px output and crops every image to the first image shape, so a mixed-aspect sequence cannot choose between preserving the whole photo and filling the canvas. (Strength: it accepts iPhone HEIC and supports looping once or forever.)',
    },
    {
      name: '다고침 GIF 만들기',
      url: 'https://dagotools.com/guides/gif-maker/',
      weakness:
        'Its Korean tool combines photo and video workflows and exposes per-frame timing, FPS, width, and looping controls before export. (Strength: it supports video clips and more detailed timing controls than this focused photo-to-GIF maker.)',
    },
    {
      name: 'Canva GIF 만들기',
      url: 'https://www.canva.com/ko_kr/create/gif-maker/',
      weakness:
        'Its Korean flow begins in a general design editor where users choose a design or template, upload media, edit, then use Share → Download to select GIF. (Strength: it provides templates, stock assets, AI features, and a broader design editor.)',
    },
    {
      name: '라미선생님 움짤 만들기',
      url: 'https://ramiteacher.github.io/gif-maker/',
      weakness:
        'Its Korean page combines photo and video selection, and asks users to set long-side size, photo display time, and aspect-ratio behaviour before saving. (Strength: it supports MP4 and MOV clips up to 250 MB alongside photo sequences.)',
    },
  ],
  related: ['image-resizer', 'image-compressor', 'image-converter', 'video-to-gif'],
};
