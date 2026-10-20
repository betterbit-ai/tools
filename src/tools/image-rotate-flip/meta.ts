import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'image-rotate-flip',
  category: 'image',
  icon: 'rotate',
  added: '2026-10-11',
  updated: '2026-10-20',
  edges: ['privacy', 'performance', 'features', 'no-signup'],
  competitors: [
    {
      name: 'FreeTinyPNG Rotate & Flip',
      url: 'https://freetinypng.org/tools/rotate-flip/',
      weakness:
        'It requires a separate Apply transform click after changing settings, fixes JPG and WebP output at quality 92, and sends users to other tools to change output format. (Strength: it is also browser-only, supports batches, and clearly explains the JPEG re-encode tradeoff.)',
    },
    {
      name: 'imgmod Image Rotator',
      url: 'https://www.imgmod.co/image-rotator/',
      weakness:
        'It accepts only JPG, PNG, and WebP and documents a 30 MB-per-file limit; JPG output uses a fixed 0.95 quality rather than a user-controlled value. (Strength: it is also browser-only, processes batches automatically, and supports the same quarter turns and flips.)',
    },
    {
      name: 'iLoveIMG Rotate Image',
      url: 'https://www.iloveimg.com/rotate-image',
      weakness:
        'Its documented flow uploads from device or cloud storage and keeps processed files on its servers for 1–2 hours. (Strength: it can batch-rotate only landscape or portrait images and supports cloud-storage workflows.)',
    },
  ],
  related: ['image-cropper', 'image-resizer', 'image-converter', 'exif-viewer-remover'],
};
