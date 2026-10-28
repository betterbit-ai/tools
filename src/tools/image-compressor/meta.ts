import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'image-compressor',
  category: 'image',
  icon: 'compress',
  added: '2026-10-08',
  updated: '2026-10-19',
  edges: ['privacy', 'performance', 'features'],
  competitors: [
    {
      name: 'TinyPNG',
      url: 'https://tinypng.com/',
      weakness:
        'Its free online compressor accepts up to 20 images at 5MB each and does not offer a target-file-size control. (Strength: it supports AVIF, JPEG XL and animated PNG, and its specialised PNG compression can beat Canvas re-encoding.)',
    },
    {
      name: 'iLoveIMG Compress Image',
      url: 'https://www.iloveimg.com/compress-image',
      weakness:
        'Uploads files to its servers, serves ads to free users, limits free compression to 30 files and 200MB per task, and has no compression-level or target-size control. (Strength: it accepts SVG and preserves animated GIF files.)',
    },
    {
      name: 'TargetKB',
      url: 'https://targetkb.com/',
      weakness:
        'It matches local, automatic target-size compression but limits a batch to 10 images and offers optional analytics. (Strength: it can resize or centre-crop before compression and accepts HEIC.)',
    },
  ],
  related: [
    'image-resizer',
    'image-converter',
    'image-upscaler',
    'exif-viewer-remover',
    'image-watermark',
    'video-to-gif',
    'gif-maker',
    'video-compressor',
    'image-to-base64',
    'screenshot-beautifier',
  ],
};
