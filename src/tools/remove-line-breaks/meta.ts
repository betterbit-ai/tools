import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'remove-line-breaks',
  category: 'text',
  icon: 'text',
  added: '2026-10-12',
  updated: '2026-10-12',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'TextCleanly',
      url: 'https://textcleanly.com/',
      weakness:
        'Its controls expose only remove-all, keep-paragraphs and extra-space cleanup, and its documented flow requires pressing “Remove Line Breaks”; it has no custom separator, list protection or end-of-line hyphen repair. (Strength: it clearly states no sign-up and no text upload.)',
    },
    {
      name: 'ConvertForever',
      url: 'https://convertforever.com/remove-line-breaks/',
      weakness:
        'The page describes a one-click choice between stripping every break and preserving paragraphs, but does not offer an explicit PDF-copy preset that also protects list-item lines and rejoins a split English word. (Strength: it states that processing happens in the browser.)',
    },
    {
      name: 'ListContrast',
      url: 'https://listcontrast.com/remove-line-breaks',
      weakness:
        'It supports custom separators, trimming and repeated-space cleanup, but its visible options do not include a PDF-oriented preset, list-item protection or automatic end-of-line hyphen repair. (Strength: it also offers local processing and text download.)',
    },
    {
      name: 'smith lab 줄바꿈 제거기',
      url: 'https://smithlab.co.kr/text/remove-line-breaks/',
      weakness:
        'Its PDF-friendly capabilities are separate checkboxes for paragraph retention, hyphen repair and list protection; Betterbit starts with those safeguards together in one visible PDF-copy cleanup preset. (Strength: it also exposes all three controls and result counts.)',
    },
    {
      name: 'i2TEXT 줄바꿈 제거',
      url: 'https://www.i2text.com/ko/remove-line-breaks',
      weakness:
        'Its Korean page documents deleting every line break or replacing each with custom text, and warns that paragraph boundaries can disappear; it does not show a paragraph-preserving PDF cleanup mode, list protection or hyphen repair. (Strength: it supports arbitrary replacement text.)',
    },
    {
      name: 'win-j 텍스트 정리 도구',
      url: 'https://win-j.com/utility/line-break-remover/',
      weakness:
        'Its multi-purpose workspace requires selecting a cleanup task and pressing “텍스트 정리”; Betterbit keeps just this task live as text is pasted, with a single PDF-copy preset. (Strength: it provides broader delimiter, duplicate and character-filter workflows.)',
    },
  ],
  related: ['word-counter', 'case-converter', 'remove-duplicate-lines', 'text-diff'],
};
