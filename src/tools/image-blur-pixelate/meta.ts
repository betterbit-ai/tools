import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'image-blur-pixelate',
  category: 'image',
  icon: 'shield',
  added: '2026-10-12',
  updated: '2026-10-12',
  edges: ['privacy', 'performance', 'usability'],
  competitors: [
    {
      name: 'Kapwing Blur Image',
      url: 'https://www.kapwing.com/tools/blur/image',
      weakness:
        'Starts with an upload into Kapwing’s broader studio and describes isolating a region by duplicating a layer, so a one-off face, text, or plate redaction takes a heavier editor workflow than drawing a box directly. (Strength: it also offers video editing, AI tools, and social publishing.)',
    },
    {
      name: 'Upsampler Free Image Blur',
      url: 'https://upsampler.com/free-image-blur-no-signup',
      weakness:
        'Its primary tool is a whole-image Gaussian blur; its own guide sends region-specific censoring to a separate pixelator. (Strength: it is browser-only, has no sign-up, and documents support up to 64 MP on desktop.)',
    },
    {
      name: 'AllUtil Blur & Pixelate Image',
      url: 'https://allutil.com/blur-image',
      weakness:
        'Matches the local-processing and multi-box workflow, but its page warns that a blur area over 40 megapixels cannot be processed in a browser tab and does not expose coordinate fields for keyboard placement. (Strength: it also has a solid-box option and accepts more input formats.)',
    },
    {
      name: 'blurimageai.com 이미지 블러 및 모자이크',
      url: 'https://blurimageai.com/ko/',
      weakness:
        'The Korean landing page opens a 40-plus-tool studio and foregrounds AI detection and batch modes, adding a broader editing workflow before a simple manually selected redaction. (Strength: it offers on-device AI face and background detection.)',
    },
    {
      name: 'Imagy 온라인 이미지 픽셀화',
      url: 'https://imagy.app/ko/pixelate-image/',
      weakness:
        'Supports rectangle and brush selections but exposes a pixelation-only workflow; blur requires another tool. Its visible editor guidance does not offer keyboard coordinate fields for exact rectangular placement. (Strength: it supports brushes and multi-image processing.)',
    },
    {
      name: 'CodeKitHub 사진 모자이크 / 블러 도구',
      url: 'https://codekithub.com/ko/photo-censor/',
      weakness:
        'Already processes locally and supports blur, mosaic, and black boxes, but its shown editor uses only drag-created regions with undo/reset rather than editable X, Y, width, and height controls. (Strength: it includes a black-box redaction mode and explains the trade-offs well.)',
    },
  ],
  related: ['image-cropper', 'image-resizer', 'image-compressor', 'image-converter'],
};
