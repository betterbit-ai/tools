import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'json-formatter',
  category: 'developer',
  icon: 'code',
  added: '2026-10-11',
  updated: '2026-10-15',
  edges: ['privacy', 'performance'],
  competitors: [
    {
      name: 'MiniWebtool JSON Formatter & Validator',
      url: 'https://miniwebtool.com/json-formatter-validator/',
      weakness:
        'Its current FAQ says JSON is processed server-side during the request, and the opened page interrupts the tool with an ad-blocker prompt and an upgrade for ad-free browsing and higher daily limits. Betterbit keeps pasted and dropped JSON in the browser. (Strength: it can repair trailing commas, single quotes, comments and unquoted keys.)',
    },
    {
      name: 'JSON Support JSON Formatter',
      url: 'https://www.jsonsupport.com/json-formatter.html',
      weakness:
        'Its visible formatter controls offer formatted, minified and tree views but no indentation choice or recursive key-sort option, so a user cannot make a stable, diff-friendly copy from that page. (Strength: it searches keys and values, copies a selected value path, and supports JSON Lines.)',
    },
    {
      name: '툴즈 JSON 포맷터·검증기',
      url: 'https://tools25.com/tools/json-format',
      weakness:
        'It limits dropped files to 8 MB, while Betterbit does not impose an application file-size cap and batches its tree view by 50 children. (Strength: it shows the percentage reduction after minifying and its Korean guide explains when a browser is not suitable for a very large document.)',
    },
  ],
  related: ['case-converter', 'text-diff', 'word-counter', 'base64', 'url-encoder', 'uuid-generator', 'hash-generator'],
};
