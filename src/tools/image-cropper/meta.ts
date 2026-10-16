import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'image-cropper',
  category: 'image',
  icon: 'crop',
  added: '2026-10-08',
  updated: '2026-10-13',
  edges: ['privacy', 'usability'],
  competitors: [
    {
      name: 'Img2Go Crop Image',
      url: 'https://www.img2go.com/crop-image',
      weakness:
        'The service transfers files to its servers and says it stores them for up to 24 hours; the crop page also exposes Log In/Sign Up, cloud-import, pricing, and a large product-suite navigation before the cropper. (Strength: includes 15+ social-media and print presets, rotation, output-format and DPI choices that Betterbit does not offer.)',
    },
    {
      name: 'ResizePixel 이미지 자르기',
      url: 'https://www.resizepixel.com/ko/crop-image/',
      weakness:
        '자르기 화면의 각 편집 도구 사이에 광고가 반복해서 표시되고, 자르기는 더 큰 이미지 편집 화면의 한 섹션이다. 원형 자르기나 투명한 원형 PNG 내보내기는 제공하지 않는다. (Strength: 같은 화면에서 회전·압축·변환·픽셀화도 할 수 있다.)',
    },
    {
      name: 'ImgNeo Image Cropper',
      url: 'https://imgneo.com/crop.html',
      weakness:
        'Matches us on local processing, no sign-up, circle crops and a live overlay, but offers only five ratios and visual dragging. It has no X/Y/width/height fields or keyboard nudging for exact placement. (Strength: its 4:5 Instagram portrait preset is not currently included here.)',
    },
  ],
  related: ['image-resizer', 'image-rotate-flip', 'image-converter', 'meme-generator', 'qr-code-scanner'],
};
