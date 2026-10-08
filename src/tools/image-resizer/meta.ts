import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'image-resizer',
  category: 'image',
  icon: 'resize',
  added: '2026-10-07',
  updated: '2026-10-08',
  edges: ['privacy', 'no-ads', 'performance', 'features', 'no-signup'],
  competitors: [
    {
      name: 'iLoveIMG Resize',
      url: 'https://www.iloveimg.com/resize-image',
      weakness: 'Uploads files to a server and makes you wait; batch size and file limits push a paid plan.',
    },
    {
      name: 'TinyWow / similar ad-supported hubs',
      url: 'https://tinywow.com/',
      weakness: 'Server upload, ads and wait screens before download.',
    },
    {
      name: 'Squoosh',
      url: 'https://squoosh.app/',
      weakness: 'Private and high quality, but one image at a time and no social-media presets or crop-to-fill.',
    },
  ],
  related: ['image-cropper', 'image-compressor', 'image-converter', 'heic-to-jpg', 'image-to-pdf'],
};
