import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'css-minifier',
  category: 'developer',
  icon: 'compress',
  added: '2026-11-28',
  updated: '2026-11-28',
  edges: ['privacy', 'features'],
  competitors: [
    {
      name: 'Project Wallace CSS Minifier',
      url: 'https://www.projectwallace.com/minify-css',
      weakness:
        'Its own description calls it a very naive minifier that only removes whitespace, newlines and comments, and it points users to CSSO, LightningCSS or cssnano for anything more. Betterbit also handles JavaScript and measures the gzip size of the result. (Strength: it says plainly what it does and mentions when another tool is the better choice.)',
    },
    {
      name: 'cssminify.org',
      url: 'https://cssminify.org/',
      weakness:
        'When JavaScript is disabled the form falls back to their server to minify the CSS, and their API accepts about 200 KB per request and 30 requests a minute. Betterbit has no server path at all and no size limit written into the tool. (Strength: rule merging, a Beautify button and before/after gzip sizes.)',
    },
    {
      name: 'GoToolz CSS 압축',
      url: 'https://www.gotoolz.com/ko/css-minifier/',
      weakness:
        'It handles CSS only, so a script has to go to a second tool, and every result waits for a click on CSS 압축. Betterbit minifies CSS and JavaScript in one page as you type, without joining JavaScript lines. (Strength: a Korean explanation of 0px and #ffffff shortening, which it applies.)',
    },
    {
      name: 'Clean CSS (cleancss.com)',
      url: 'https://www.cleancss.com/',
      weakness:
        'CSS and JavaScript live on separate pages, so the same pasted file often needs two visits, and the JavaScript page also offers obfuscation, which changes names. Betterbit keeps one page for both languages and never renames anything. (Strength: a long list of formatters for other languages in the same family.)',
    },
  ],
  related: ['json-formatter', 'sql-formatter', 'text-diff'],
};
