import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'image-watermark',
  category: 'image',
  icon: 'sparkle',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['privacy', 'performance', 'features', 'no-signup'],
  competitors: [
    {
      name: 'ToolPile Add Watermark',
      url: 'https://www.toolpile.dev/image-watermark/',
      weakness:
        'It runs locally and supports text/logo/tile controls (Strength: privacy is comparable), but its opened flow has one image chooser and an explicit “Apply Watermark” action; it does not offer a multi-image queue or one ZIP download.',
    },
    {
      name: 'MiniToolForge Add Watermark Image',
      url: 'https://minitoolforge.com/tools/images/add-watermark-image',
      weakness:
        'Its detailed FAQ says it handles one photo at a time and recommends picking the next file after download. (Strength: it documents full-resolution browser rendering and sensible JPEG/WebP defaults.) This tool applies one setting set to a batch and downloads every result as one ZIP.',
    },
    {
      name: 'NanoImage Add Watermark',
      url: 'https://nanoimage.net/add-watermark',
      weakness:
        'The page states that bulk watermarking is planned and its current version processes one image at a time; it points recurring batch users to a CLI. (Strength: it supports multiple editable layers and text effects, which this focused one-layer tool does not.)',
    },
    {
      name: 'imageonline.io 이미지 워터마크 넣기',
      url: 'https://imageonline.io/ko/watermark/',
      weakness:
        'The Korean result exposes a text-only watermark field and a PNG download path, with a single-image editor. It does not expose a logo-image mode or a batch ZIP workflow.',
    },
    {
      name: 'i2IMG 워터마크 이미지',
      url: 'https://www.i2img.com/ko/watermark-image',
      weakness:
        'Its opened Korean page says uploaded files are automatically deleted after 30 minutes, so image data reaches its service. This tool renders photos and logos only in the browser and never uploads either one.',
    },
    {
      name: 'small.im 이미지 워터마크 대량 추가',
      url: 'https://small.im/ko/add-watermark',
      weakness:
        'Its Korean search result says batch processing is local (Strength: it matches the privacy and batch approach). It does not make a text/logo repeat-pattern editor or a ZIP workflow apparent in the result, whereas both are direct controls here.',
    },
  ],
  related: ['image-resizer', 'image-compressor', 'image-converter', 'exif-viewer-remover'],
};
