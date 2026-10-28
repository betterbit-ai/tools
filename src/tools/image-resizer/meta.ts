import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'image-resizer',
  category: 'image',
  icon: 'resize',
  added: '2026-10-07',
  updated: '2026-10-20',
  edges: ['privacy', 'performance', 'features', 'no-signup'],
  competitors: [
    {
      name: 'iLoveIMG Resize',
      url: 'https://www.iloveimg.com/resize-image',
      weakness:
        'Its resize page shows an upload-and-process flow (including Drive/Dropbox upload status) and requires a separate “Resize images” action before download. (Strength: it accepts SVG and animated GIF files, plus cloud-storage imports.)',
    },
    {
      name: 'Squish Image Resizer',
      url: 'https://squish.tools/en/resize-image',
      weakness:
        'Processes locally, but its resize page accepts one image at a time and includes an ad placement. (Strength: it offers a target-file-size option and HEIC support, which are outside this focused batch resizer.)',
    },
    {
      name: 'Squoosh',
      url: 'https://squoosh.app/',
      weakness:
        'Processes privately in the browser, but its landing flow is for one image at a time rather than a batch ZIP workflow. (Strength: it provides advanced codecs and a side-by-side quality comparison.)',
    },
  ],
  related: [
    'image-rotate-flip',
    'image-compressor',
    'image-converter',
    'image-upscaler',
    'image-watermark',
    'video-to-gif',
    'gif-maker',
    'image-to-text',
    'image-to-base64',
    'svg-to-png',
    'screenshot-beautifier',
  ],
};
