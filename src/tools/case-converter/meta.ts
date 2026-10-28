import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'case-converter',
  category: 'text',
  icon: 'convert',
  added: '2026-10-11',
  updated: '2026-10-13',
  edges: ['privacy', 'usability'],
  competitors: [
    {
      name: 'AllRight Tools Case Converter',
      url: 'https://allrighttools.com/case-converter/',
      weakness:
        'Its current page uses Google Analytics for tool events and offers browser-local processing, but Betterbit has no third-party tracking and keeps the same input-and-result workflow focused on one selected format. (Strength: it supports text-file import and download, Turkish/Azerbaijani casing, more developer formats, and options to preserve acronyms and mixed-case terms.)',
    },
    {
      name: 'Keywords Everywhere Title Case Converter',
      url: 'https://keywordseverywhere.com/tools/title-case-converter/',
      weakness:
        'It provides AP, Chicago and sentence title casing but no developer identifier formats, so users cannot convert the same text to camelCase, snake_case, kebab-case or CONSTANT_CASE there. (Strength: it preserves all-caps acronyms and states its colon and hyphen title rules.)',
    },
    {
      name: 'smith lab 대소문자 변환기',
      url: 'https://smithlab.co.kr/text/case-converter/',
      weakness:
        'Its Title Case setting has a generic minor-word toggle rather than a selectable AP or Chicago rule, so writers cannot choose the publication rule directly. (Strength: it displays nine formats at once, preserves acronyms on request, and clearly explains Korean identifier splitting.)',
    },
  ],
  related: ['word-counter', 'remove-line-breaks', 'remove-duplicate-lines', 'sort-lines', 'text-diff'],
};
