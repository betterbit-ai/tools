import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'background-remover',
  category: 'image',
  icon: 'sparkle',
  added: '2026-10-12',
  updated: '2026-10-12',
  edges: ['privacy', 'no-ads', 'no-signup', 'performance'],
  competitors: [
    {
      name: 'remove.bg',
      url: 'https://www.remove.bg/',
      weakness:
        'Its primary action is an image upload and its page directs uploaders to terms and a privacy policy, so a source photo leaves the browser for processing. (Strength: mature API, desktop app and Photoshop/Figma-style workflow integrations.)',
    },
    {
      name: 'Remove Background Online',
      url: 'https://removebackgroundonline.com/',
      weakness:
        'Runs locally and exports full resolution, but its results page includes an advertisement and says its first-use AI download is 45–90 MB; this tool has no ads and lazily loads a 4.36 MiB model. (Strength: it also offers edge-softness, edge-shift and background-colour controls.)',
    },
    {
      name: 'Remove.Live',
      url: 'https://www.remove.live/',
      weakness:
        'Runs locally without an account, but documents a 45–70 MB first-run model download and includes brightness, contrast, saturation and sharpening controls outside its basic removal flow. This tool has a much smaller 4.36 MiB on-demand model, but does not claim those editing controls. (Strength: it supports files up to 50 MB and offline use after loading.)',
    },
    {
      name: 'AI Image Tools 배경 제거와 누끼 따기',
      url: 'https://www.aimagetools.com/ko/background-remover',
      weakness:
        'Its Korean result describes clicking and dragging to choose the background before removal, rather than automatically finding a foreground subject. (Strength: manual selection and edge controls can be more precise for an ambiguous boundary.)',
    },
    {
      name: 'Erase.bg',
      url: 'https://www.erase.bg/ko',
      weakness:
        'Its Korean tool begins by uploading an image or URL and says processing starts while the image is uploaded, so photos are sent to its service. (Strength: it accepts up to 10,000×10,000-pixel images and also offers video background removal.)',
    },
    {
      name: 'Dreamina AI 배경 제거기',
      url: 'https://dreamina.capcut.com/ko-kr/tools/ai-background-remover',
      weakness:
        'Its Korean page describes free daily credits for high-resolution removal rather than unrestricted use. (Strength: it positions specialised edge detection for hair, fur, clothing and translucent objects.)',
    },
  ],
  related: ['image-cropper', 'image-resizer', 'image-compressor', 'image-converter', 'passport-photo'],
};
