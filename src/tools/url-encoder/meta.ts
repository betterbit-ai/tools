import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'url-encoder',
  category: 'developer',
  icon: 'convert',
  added: '2026-10-15',
  updated: '2026-10-15',
  edges: ['privacy', 'usability'],
  competitors: [
    {
      name: 'URLDecode.org',
      url: 'https://www.urldecoder.org/',
      weakness:
        'Its text decoder requires a button click, while its file workflow uploads a selected file (up to 100 MB) for server processing and deletes it after download or 15 minutes. It has no editable query-parameter table. (Strength: supports legacy character sets and up to 16 recursive decode rounds.)',
    },
    {
      name: 'decodeurl.com',
      url: 'https://decodeurl.com/',
      weakness:
        'The page offers only Encode and Decode buttons for one shared text field: it does not expose component versus whole-URL rules, HTML form + handling, or a query-string inspection table. (Strength: its simple text conversion is client-side and has no account or upload.)',
    },
    {
      name: 'Relic URL Encode and Decode',
      url: 'https://relic.space/tools/url-encode-decode',
      weakness:
        'Its converter is limited to a single percent-encoded result and its page promotes signing in to retain copied items; it has no whole-URL mode, form-style + option, or editable query-parameter rebuild. (Strength: it updates text live and gives a clear malformed-input note.)',
    },
    {
      name: 'Calculator.net URL Encode / Decode',
      url: 'https://www.calculator.net/url-encode-decode.html',
      weakness:
        'It has one undifferentiated text converter, so users cannot choose component, whole-URL, or form rules and cannot inspect a URL’s query values in separate editable rows. (Strength: its guide clearly lists RFC 3986 reserved and unreserved characters.)',
    },
  ],
  related: ['base64', 'json-formatter'],
};
