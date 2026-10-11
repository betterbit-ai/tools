import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'image-rotate-flip',
  category: 'image',
  icon: 'rotate',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['privacy', 'no-ads', 'performance', 'features', 'no-signup'],
  competitors: [
    {
      name: 'PiliApp Rotate Image',
      url: 'https://www.piliapp.com/image/rotate/',
      weakness:
        'Its rotate page accepts and downloads one image at a time, exports the result as PNG, and sends flipping to a separate Flip tab. (Strength: it is also a quick, browser-only no-upload tool.)',
    },
    {
      name: 'MiniPx Rotate Image',
      url: 'https://minipx.com/rotate-image/',
      weakness:
        'The free tier caps a batch at 5 files, with Pro required to remove that cap, and mirroring is split into a separate Flip tool rather than combined with rotation. (Strength: it supports custom-angle rotation and a wide list of input formats.)',
    },
    {
      name: 'NowToolkit Rotate Image',
      url: 'https://nowtoolkit.com/image/rotate-image/',
      weakness:
        'Its rotation flow is designed around one preview image and adds custom-angle, canvas-corner, and fill-color controls that are unnecessary for the common 90° phone-photo correction. It does not present a batch ZIP workflow for fixed quarter turns.',
    },
    {
      name: 'iLoveIMG 이미지 회전',
      url: 'https://www.iloveimg.com/rotate-image',
      weakness:
        'The service advertises cloud upload and storage integrations; its free plan lists a 30-image rotate limit while Premium raises it to 120 and removes ads. (Strength: it can rotate selected portrait or landscape images in a batch.)',
    },
    {
      name: 'iLoveIMG.app 이미지 회전',
      url: 'https://iloveimg.app/ko',
      weakness:
        'The Korean tool listing describes rotating JPG, PNG, and GIF batches but does not offer a combined flip control or say that phone EXIF orientation is normalized into the exported pixels. The homepage also bundles many unrelated editing and AI tools around the simple action.',
    },
    {
      name: 'Adobe Express',
      url: 'https://www.adobe.com/kr/express/',
      weakness:
        'A basic turn or mirror opens Adobe’s all-in-one creation product with templates, brand-kit features, and Premium-plan promotion rather than a dedicated batch rotation screen. (Strength: the broader editor provides many design and collaboration tools beyond this focused task.)',
    },
  ],
  related: ['image-cropper', 'image-resizer', 'image-converter', 'exif-viewer-remover'],
};
