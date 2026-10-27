import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'svg-to-png',
  category: 'image',
  icon: 'image',
  added: '2026-10-28',
  updated: '2026-10-28',
  edges: ['privacy', 'performance', 'usability', 'features'],
  competitors: [
    {
      name: 'W3Schools SVG to PNG Converter',
      url: 'https://www.w3schools.com/tools/tool_svg_to_png.php',
      weakness:
        'Its opened page exposes a separate “Convert to PNG” step before download and surrounding account/progress and “Remove ads” prompts. Betterbit renders the preview automatically after a drop or paste and keeps linked external resources out of the render. (Strength: it also accepts SVG code, exact width, scale and transparent-background controls.)',
    },
    {
      name: 'MiniTools SVG to PNG',
      url: 'https://webtools.rustfisher.com/svgtopng/',
      weakness:
        'Its opened search result presents a separate “Convert PNG” action before previews and ZIP download. Betterbit produces a single-file PNG preview as settings change and shows the final dimensions without a conversion click. (Strength: it supports multi-file ZIP export, background colours and several fixed-size presets.)',
    },
    {
      name: 'SwiftKit SVG to PNG & ICO Converter',
      url: 'https://swiftkit.tools/svg-to-png/',
      weakness:
        'Its opened page is already local and offers PNG, WebP, JPEG and ICO with 1×–8× controls (Strength: it supports more formats, ICO sizes and clipboard copy). Betterbit keeps the narrower SVG-to-PNG task on one responsive screen, automatically renders after paste/drop, and removes external SVG resources before rendering rather than asking users to diagnose them.',
    },
    {
      name: 'Canva 무료 SVG→PNG 변환기',
      url: 'https://www.canva.com/ko_kr/features/svg-to-png-converter/',
      weakness:
        'Its opened Korean page directs users through upload, an editor, then Share → Download → PNG, with sign-in and a large design-workspace surface. Betterbit is a direct paste/drop-to-preview converter with exact dimensions and transparent/white output on the first screen. (장점: 자르기·필터·문구·미디어 등 광범위한 디자인 편집 기능을 제공한다.)',
    },
    {
      name: 'imageonline.io SVG PNG 변환',
      url: 'https://imageonline.io/ko/svg-to-png/',
      weakness:
        'Its opened Korean search result presents an explicit “PNG으로 다운로드” action after file/code input and lists width, height, scale and background controls. Betterbit renders the PNG preview automatically as the SVG or output settings change and explicitly removes external SVG URLs before canvas rendering. (장점: 파일명 입력과 가로·세로 직접 입력을 함께 제공한다.)',
    },
    {
      name: 'svg2png.net SVG에서 PNG로 변환',
      url: 'https://svg2png.net/ko',
      weakness:
        'Its opened Korean page is a simple file-select → “PNG로 변환” → download-link flow, without visible SVG-source paste, scale, transparency or output-size controls. Betterbit accepts pasted SVG markup, shows an immediate preview, provides 1×–4× and exact-width output, and preserves transparency by default.',
    },
  ],
  related: ['image-resizer', 'image-converter', 'favicon-generator', 'image-to-base64'],
};
