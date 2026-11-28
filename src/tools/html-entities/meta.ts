import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'html-entities',
  category: 'developer',
  icon: 'code',
  added: '2026-11-28',
  updated: '2026-11-28',
  edges: ['privacy', 'features'],
  competitors: [
    {
      name: 'CodeUtility HTML Encode/Decode',
      url: 'https://htmlencode.codeutility.io/',
      weakness:
        'Nothing is converted until you click Encode or Decode, and keeping the result means signing in with Google or GitHub or creating a share link, which puts the text on their server. Betterbit converts as you type and keeps the text in the tab. (Strength: it can save results to an account and download the output.)',
    },
    {
      name: 'PageLive HTML encoder and decoder',
      url: 'https://pagelive.io/tools/html-encoder',
      weakness:
        'Its save and share route publishes the converted text as a public page (free for 7 days, kept after signing up), so encoded customer data or internal templates become a URL. Betterbit has no publish step and stores the input only in this browser. (Strength: cookies-free live conversion with named, decimal and hex output and a swap button.)',
    },
    {
      name: 'ToolOdyssey HTML Entity Encoder / Decoder',
      url: 'https://toolodyssey.com/tools/developer-web-seo/html-entity-encoder-decoder/',
      weakness:
        'Its own limits section says only about 55 of the most common named entities are decoded, so a name such as &NotEqualTilde; or &lessgtr; comes back unchanged. Betterbit decodes all 2,125 HTML 5 names, including the 93 that expand to several code points. (Strength: it states its assumptions and reports names it does not know.)',
    },
    {
      name: 'utilbox HTML 특수문자 변환기',
      url: 'https://utilbox.io.kr/tools/html-entity-converter',
      weakness:
        'Encoding is limited to two choices (the five HTML characters or everything non-ASCII) and its reference table lists 18 entities, with no way to ask for hexadecimal output. Betterbit offers three levels, named/decimal/hex output and decodes the full HTML 5 table. (Strength: a Korean copy table you can click to copy, and an explanation of when each level is needed.)',
    },
  ],
  related: ['url-encoder', 'base64', 'character-map', 'text-diff'],
};
