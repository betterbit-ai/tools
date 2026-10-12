import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'favicon-generator',
  category: 'image',
  icon: 'image',
  added: '2026-10-12',
  updated: '2026-10-12',
  edges: ['features', 'usability'],
  competitors: [
    {
      name: 'Copyicon Favicon Generator',
      url: 'https://copyicon.com/generator/favicon-generator',
      weakness:
        'The opened tool offers strong per-size replacement and SVG support (Strength: more precise per-size editing), but its first download action is only “Download favicon.ico”; the Apple/Android/PWA files are presented as a separate follow-up, rather than one install-ready ZIP with manifest and copyable installation code.',
    },
    {
      name: 'RabbitTools Favicon Generator',
      url: 'https://rabbittools.net/favicon-generator/',
      weakness:
        'The opened page says its “favicon.ico” is a 32×32 PNG renamed to .ico and explicitly notes that legacy IE needs a dedicated converter. Betterbit writes a real ICO container with 16×16, 32×32, and 48×48 frames. (Strength: its default image-to-package flow is very short.)',
    },
    {
      name: 'Faviconator',
      url: 'https://www.faviconator.com/',
      weakness:
        'The opened generator provides text/image modes, shape controls, all-size previews, ZIP output, and HTML (Strength: it exposes circle and rounded shapes), but its displayed HTML includes many optional 48/64/128 tags rather than a compact modern root-file installation set and it does not show a generated PWA manifest in the tool flow.',
    },
    {
      name: 'Invistools 파비콘 생성기',
      url: 'https://invistools.com/ko/favicon-generator/',
      weakness:
        'Its Korean search result advertises a one-click image package with PNG 16/32/48/180/192/512 and ICO, but the visible flow has a separate 실행 action and does not advertise text/emoji generation or a real multi-frame ICO check. Betterbit starts with an editable text/emoji favicon and regenerates the full package live.',
    },
    {
      name: 'Pengsu 파비콘 생성기',
      url: 'https://pengsu.co.kr/toy/web_cont/faviconGenerator',
      weakness:
        'The opened Korean result exposes only “파비콘 생성” and “다른 이미지 선택” as its tool flow. Betterbit also supplies a text/emoji fallback, image fit and padding controls, a PWA manifest, and copy-ready head markup. (Strength: its Korean interface is already highly focused.)',
    },
    {
      name: 'Newtil 파비콘 생성기',
      url: 'https://newtil.com/favicon-generator',
      weakness:
        'Its Korean search result promises image or text favicons from 16×16 to 256×256 (Strength: it covers a 256px web icon), but it does not advertise the Apple 180×180 plus Android/PWA 192×192 and 512×512 package, manifest, and install snippet that Betterbit provides together.',
    },
  ],
  related: ['image-resizer', 'image-converter', 'qr-code-generator'],
};
