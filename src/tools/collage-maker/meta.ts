import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'collage-maker',
  category: 'image',
  icon: 'image',
  added: '2026-10-12',
  updated: '2026-10-19',
  edges: ['privacy', 'performance', 'usability', 'features', 'no-signup'],
  competitors: [
    {
      name: 'Photo To Collage',
      url: 'https://www.phototocollage.com/',
      weakness:
        'Its public editor limits each source file to 25 MB and its print export to a 3,600 px longest edge. This tool has no service-side file-size gate and offers a 4,096 px preset. (Strength: it accepts up to 20 photos, compared with our intentionally focused 12-photo maximum, and also processes locally.)',
    },
    {
      name: 'FreeCollageImage',
      url: 'https://www.freecollageimage.com/',
      weakness:
        'The public tool is limited to 12 photos and combines the basic collage flow with captions, coloured borders and Instagram-carousel export. (Strength: it matches our local processing, no-account and no-watermark approach, and has captions/carousel export that this focused collage tool does not include.)',
    },
    {
      name: 'ImageCollage.net',
      url: 'https://www.imagecollage.net/en/',
      weakness:
        'Its indexed editor centres on an all-in-one annotation canvas with text, arrows, rectangles and circles, rather than a direct photo-to-layout download flow. (Strength: those annotation tools are broader than this focused layout maker.)',
    },
    {
      name: 'Canva Photo Collages',
      url: 'https://www.canva.com/ko_kr/photo-collages/',
      weakness:
        'The Korean landing page sends users into Canva’s full template, stock-asset, sharing, scheduling and print suite, with visible 가입/로그인 entry points; background removal is labelled Pro. A quick private photo merge therefore starts in a much broader editor. (Strength: Canva offers far more templates, stock assets, collaboration and print ordering.)',
    },
    {
      name: 'Adobe Express Collage Maker',
      url: 'https://helpx.adobe.com/kr/express/web/image-creation-and-editing/edit-images/create-collages.html',
      weakness:
        'Adobe’s Korean instructions first open Adobe Express, then direct users through Home → Photos → Photo Quick Actions → Collage Maker before adding images. This page opens directly to the photo drop area and shows the result live. (Strength: Adobe Express can continue into a broader design editor.)',
    },
    {
      name: 'Adobe Photoshop Collage',
      url: 'https://www.adobe.com/kr/products/photoshop/collage.html',
      weakness:
        'The Korean guide describes creating a document, importing files as layers and using transform and layer-style steps, and prominently links to plans and pricing. It is a powerful desktop workflow rather than a one-screen layout-and-download task. (Strength: Photoshop provides unrestricted layer-level editing.)',
    },
  ],
  related: ['image-resizer', 'image-cropper', 'image-compressor'],
};
