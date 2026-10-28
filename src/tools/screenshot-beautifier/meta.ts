import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'screenshot-beautifier',
  category: 'image',
  icon: 'sparkle',
  added: '2026-10-28',
  updated: '2026-10-28',
  edges: ['privacy', 'performance', 'usability', 'no-signup'],
  competitors: [
    {
      name: 'Screenshot Studio',
      url: 'https://www.screenshot-studio.com/mockup-generator',
      weakness:
        'Its page says editing runs in the browser, but its export compression sends the finished image to a server for recompression. Betterbit renders and writes the entire PNG in the browser. (Strength: it has 17 device mockups, multi-device scenes, 5× exports, and video formats.)',
    },
    {
      name: 'MockFrame',
      url: 'https://mockframe.app/',
      weakness:
        'Its page says free image exports carry a “Made with MockFrame” badge, while 4K/6K, video/GIF, premium backgrounds, and photoreal scenes are Pro features. Betterbit is a smaller, direct screenshot-to-PNG flow without an account or export badge. (Strength: it has 104 device frames, 194 backgrounds, and extensive social presets.)',
    },
    {
      name: 'NaviStack App Store Screenshot Generator',
      url: 'https://navistack.app/tools/app-store-screenshot-generator',
      weakness:
        'Its workflow is centred on choosing an iPhone, iPad, Android phone, or tablet device preset before fitting the image. Betterbit opens with one browser-frame composition and live controls for common presentation ratios. (Strength: it offers device-specific screen fitting and App Store-oriented output sizes.)',
    },
    {
      name: 'Pixwit Screenshot Mockup Generator',
      url: 'https://pixwit.ai/ko/tools/screenshot-mockup-generator',
      weakness:
        'Its Korean editor exposes 14 device choices, text options, frame finishes, and several export formats before download. Betterbit is intentionally a shorter browser-frame, gradient, shadow, and PNG path for a web screenshot. (Strength: it supports many current device frames, custom colours, JPG export, and clipboard copy.)',
    },
    {
      name: 'AI Tools Hub Screenshot Beautify',
      url: 'https://www.zhankeng.com/ko/tools/screenshot-beautify',
      weakness:
        'Its Korean result says each free execution costs one credit and that usage history is saved when users log in. Betterbit does not use credits, accounts, or a saved usage history for a local screenshot composition. (Strength: it includes account-linked usage records.)',
    },
    {
      name: 'ScreenHello',
      url: 'https://screenhello.com/?lang=ko',
      weakness:
        'Its Korean editor presents projects, batches, library management, image backgrounds, HDR, and many device frames alongside the quick controls. Betterbit keeps the one-image browser-frame task in a compact panel. (Strength: it offers more advanced frame, background, batch, and project capabilities.)',
    },
  ],
  related: ['image-resizer', 'image-cropper', 'image-compressor'],
};
