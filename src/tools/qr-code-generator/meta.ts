import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'qr-code-generator',
  category: 'generator',
  icon: 'qrcode',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['privacy', 'no-ads'],
  competitors: [
    {
      name: 'QRAiCode',
      url: 'https://www.qraicode.com/',
      weakness:
        'The opened result bundles a large template/customization flow (gradients, eye styles, many content types and a future Pro analytics product) around a simple static code. Betterbit keeps URL, text and Wi-Fi generation in one compact live screen and makes its local-logo/H-correction behavior explicit. (Strength: it offers many more content types, gradients and visual styles.)',
    },
    {
      name: 'QRCode Monkey',
      url: 'https://www.qrcode-monkey.com/en/?lang=en',
      weakness:
        'The opened generator places repeated “Ad” blocks and sign-up/trial promotions beside the Create/Download flow, says its generated image files are cached on its server for 24 hours, and requires a separate Create QR Code step. Betterbit has no ads, generates the live preview locally, and never sends the selected logo to a server. (Strength: it has far more templates, shapes, and PDF/EPS export.)',
    },
    {
      name: 'QRGen',
      url: 'https://qrgenapp.com/',
      weakness:
        'Its opened landing page combines the generator with history, templates, scan tools, API documentation, an SDK, MCP integration, and many QR types. Betterbit is intentionally a focused static-code screen with URL, text, and Wi-Fi inputs, clear correction guidance, and direct SVG/PNG downloads. (Strength: it supports considerably more QR types and developer integrations.)',
    },
    {
      name: '모아몽 QR코드 생성기',
      url: 'https://www.moamoang.co.kr/qr-code-generator/',
      weakness:
        'The opened Korean tool provides URL/text/Wi-Fi, size, correction, color, PNG and SVG controls, but its visible generator has no local logo upload or automatic high-correction safeguard. Betterbit adds a logo plate limited to 22% of the code width and switches to H correction when a logo is selected. (장점: 색상과 출력 크기를 직접 조절한다.)',
    },
    {
      name: 'QR Studio',
      url: 'https://freeqrstudio.online/?lang=ko',
      weakness:
        'Its Korean search result advertises dynamic QR codes, tracking, PDF upload, media galleries, AI menus, landing pages, and a 14-day free trial alongside basic generation. Betterbit makes only static, permanent codes and keeps the whole URL/text/Wi-Fi and logo workflow local, with no account or trial state. (Strength: it has dynamic destinations, analytics, and many hosted-content types.)',
    },
    {
      name: 'URL.KR QR코드 생성기',
      url: 'https://url.kr/p/qr/',
      weakness:
        'The opened Korean page presents a multi-step result flow and its visible download action is PNG; its accompanying guide focuses on URL/text settings. Betterbit exposes SVG and PNG together, supports Wi-Fi payloads, and explains the chosen correction level beside the live preview. (Strength: it provides a longer Korean safety guide and additional SMS/email examples.)',
    },
  ],
  related: ['image-resizer', 'image-converter', 'word-counter', 'password-generator'],
};
