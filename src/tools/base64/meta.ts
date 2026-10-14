import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'base64',
  category: 'developer',
  icon: 'convert',
  added: '2026-10-11',
  updated: '2026-10-13',
  edges: ['privacy', 'no-ads', 'features', 'accuracy'],
  competitors: [
    {
      name: 'CodeBeautify Base64 Decode',
      url: 'https://codebeautify.org/base64-decode',
      weakness:
        'Shows an "Ad blocking? It\'s okay, please share on social media" nag and puts encoding on a separate page. (Strength: it can load Base64 input from an external URL.)',
    },
    {
      name: 'Base64.guru Decoder',
      url: 'https://base64.guru/converter/decode',
      weakness:
        'Splits binary-file and image handling into separate tools and guides users to a separate Base64-to-File page rather than keeping file download in the decoder. (Strength: supports several specialized Base64 standards, including MIME, PEM and Base64URL.)',
    },
    {
      name: 'Polyatic Base64 Encoder / Decoder',
      url: 'https://polyatic.com/base64/',
      weakness:
        'Caps files at about 10 MB and requires its own page to be revisited once online before offline use. (Strength: can wrap an encoded file as a data: URI with its MIME type.)',
    },
  ],
  related: [
    'json-formatter',
    'case-converter',
    'text-diff',
    'data-size-converter',
    'number-base-converter',
    'url-encoder',
  ],
};
