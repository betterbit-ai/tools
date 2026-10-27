import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'image-to-base64',
  category: 'image',
  icon: 'code',
  added: '2026-10-28',
  updated: '2026-10-28',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'Screendesk Image to Base64 Converter',
      url: 'https://screendesk.io/tools/image-to-base64',
      weakness:
        'The opened page offers Data URL, raw Base64, CSS and HTML outputs, but exposes no editable alt text or CSS selector before copying its generated snippets. (Strength: it also decodes pasted Base64 and recognises several file signatures.)',
    },
    {
      name: 'Base64.is Image to Base64',
      url: 'https://base64.is/image-to-base64/',
      weakness:
        'The opened page can batch, resize and re-encode images before copying several output forms, but its output flow does not expose editable HTML alt text or a CSS selector. (Strength: it supports batch conversion, Markdown, and optional PNG/JPEG/WebP re-encoding.)',
    },
    {
      name: 'imgtobase64.com',
      url: 'https://www.imgtobase64.com/',
      weakness:
        'Its search result advertises up to 20 images at 1 MB each and presents generated code in a modal, rather than editable snippet fields alongside a live preview and exact character count. (Strength: it offers optional JPEG/PNG optimisation.)',
    },
    {
      name: 'KBG Tools Base64 인코딩·디코딩',
      url: 'https://kbgtools.com/base64',
      weakness:
        'The opened Korean result combines text, file and image conversion with URL-safe and legacy text encodings, so image embedding controls are not its focused first step. (Strength: it can decode non-image files and supports EUC-KR text.)',
    },
    {
      name: 'imageconv 이미지 Base64 변환기',
      url: 'https://imageconv.com/tools/base64-converter',
      weakness:
        'The opened Korean page lists PNG, JPG, SVG and WebP only and does not show a raw-Base64 output or editable snippet fields. (Strength: it includes the reverse Base64-to-image download flow.)',
    },
    {
      name: '칼큐 이미지 ↔ Base64',
      url: 'https://calqu.kr/image/base64/',
      weakness:
        'Its Korean search result offers a prefix toggle and snippet selector, but does not describe editable alt text, CSS selector naming, or an encoded-character count next to the output. (Strength: it supports reverse conversion and download.)',
    },
  ],
  related: ['image-resizer', 'image-compressor', 'image-converter', 'favicon-generator', 'svg-to-png'],
};
