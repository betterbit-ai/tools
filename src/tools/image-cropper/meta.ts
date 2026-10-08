import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'image-cropper',
  category: 'image',
  icon: 'crop',
  added: '2026-10-08',
  updated: '2026-10-08',
  edges: ['privacy', 'no-ads', 'features', 'usability', 'no-signup'],
  competitors: [
    {
      name: 'Img2Go Crop Image',
      url: 'https://www.img2go.com/crop-image',
      weakness:
        'Files are uploaded for server-side processing — the site says images are "processed on secure servers" and temporary copies are "automatically deleted after 24 hours" — and the page carries multiple ad blocks around the tool. (Strength: 15+ aspect-ratio presets including print sizes like A4.) There is no circular/profile-picture crop mode.',
    },
    {
      name: 'ResizePixel 이미지 자르기',
      url: 'https://www.resizepixel.com/ko/crop-image/',
      weakness:
        '페이지에 광고 영역이 여러 곳에 노출되고, 비율은 "미리 정의된 템플릿"만 선택할 수 있다. 자르기는 "직사각형 영역"만 지원한다고 직접 안내하므로 원형(프로필) 자르기가 없다.',
    },
    {
      name: 'Adobe Express Crop & Shape',
      url: 'https://www.adobe.com/express/feature/image/crop',
      weakness:
        'Opens the full Adobe Express design suite (templates, panels, brand-kit upsells) rather than a single-purpose cropper, so a simple crop takes far more clicks and page weight than a dedicated tool. (Strength: its "Crop & Shape" feature does offer circle, heart and star crops, matching our circular-crop edge.)',
    },
    {
      name: 'ImageResizer.com Crop Image',
      url: 'https://imageresizer.com/crop-image',
      weakness:
        'Matches us on privacy (it also states images "never get uploaded to our servers") and has aspect-ratio presets, but the flow requires an explicit "Crop Image" button and a separate download step rather than a live preview you drag and immediately download, and it has no circular/profile crop mode.',
    },
    {
      name: 'Pixlr Crop Tool',
      url: 'https://pixlr.com/tools/crop-tool/',
      weakness:
        'Is a full online photo-editor suite (layers, effects, AI tools) with a prominent "Log in" prompt on the crop page, so a one-off crop pulls in a much heavier editor than needed. Only offers 1:1/4:3/16:9-style presets and freeform — no circular crop.',
    },
  ],
  related: ['image-resizer', 'image-compressor', 'image-converter', 'heic-to-jpg'],
};
