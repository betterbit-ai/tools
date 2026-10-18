import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'image-watermark',
  category: 'image',
  icon: 'sparkle',
  added: '2026-10-11',
  updated: '2026-10-15',
  edges: ['privacy', 'performance', 'features', 'no-signup'],
  competitors: [
    {
      name: 'TinyImagePro Add Watermark',
      url: 'https://tinyimagepro.com/add-watermark',
      weakness:
        'Its opened page advertises local unlimited batch ZIP output, text/logo/QR marks, and 15 templates (Strength: QR marks, EXIF date stamps, templates, and freely dragged placement are beyond this focused tool). Its workflow requires an explicit “Process All & Download ZIP” action, while this tool updates each accepted still image after a short debounce.',
    },
    {
      name: 'Wokeey Watermark Image',
      url: 'https://www.wokeey.com/tools/watermark-image/',
      weakness:
        'Its opened page uploads files to an ImageMagick server and says they are deleted after three minutes; it limits batches to 10 files, PNG inputs to 2 MB, JPG/WebP inputs to 7 MB, and each output to 3.5 MB. (Strength: it offers five text fonts and a separate margin control.) This tool keeps files on-device and accepts up to 20 images per batch.',
    },
    {
      name: 'Watermarkly',
      url: 'https://watermarkly.com/',
      weakness:
        'Its current page is also local and supports batch text/logo marks (Strength: it offers saved templates, multiple combined marks, 900+ fonts, visual effects, free placement, resizing, renaming, and metadata preservation). It is a much broader editor; this tool keeps its direct text/logo, nine-position or repeat-pattern workflow and automatic per-file rendering on one screen.',
    },
  ],
  related: ['image-resizer', 'image-compressor', 'exif-viewer-remover', 'meme-generator', 'signature-generator'],
};
