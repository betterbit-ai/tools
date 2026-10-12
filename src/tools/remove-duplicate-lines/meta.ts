import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'remove-duplicate-lines',
  category: 'text',
  icon: 'reorder',
  added: '2026-10-12',
  updated: '2026-10-12',
  edges: ['privacy', 'no-ads', 'usability', 'features', 'accuracy'],
  competitors: [
    {
      name: 'BelayTab Remove Duplicate Lines',
      url: 'https://belaytab.com/tools/remove-duplicate-lines/',
      weakness:
        'Its page says short lists update live but asks users to press “Remove duplicates” for very large input. Betterbit keeps the text result and option-aware counters live, including NFC comparison and a direct Keep Last control. (Strength: file import, URL normalization, duplicate-group export, and a Web Worker for very large lists.)',
    },
    {
      name: 'DesignRevision Duplicate Line Remover',
      url: 'https://designrevision.com/tools/duplicate-line-remover',
      weakness:
        'The opened page includes a Forge.new promotion and exposes only case matching, first/last selection, and whitespace comparison. It has no visible blank-line removal, natural A–Z/Z–A sort, Unicode-normalization option, or live option-aware counts. (Strength: it also states that processing is in-browser and needs no sign-up.)',
    },
    {
      name: 'DedupeLines',
      url: 'https://dedupelines.com/',
      weakness:
        'Its FAQ directs people who need the last occurrence to run a Reverse Lines tool before and after de-duplication, rather than offering a direct Keep Last choice. Betterbit exposes first/last retention next to the live result. (Strength: DedupeLines documents an 80 MB cap and Web Worker handling for large files.)',
    },
    {
      name: '툴마스터 줄 정렬·중복제거',
      url: 'https://tool.webi.co.kr/tools/text-sorter',
      weakness:
        'Its guide says the displayed counts are based on raw input and do not change when whitespace trimming changes the actual result, so users must inspect the output after sorting. Betterbit updates its retained-line and removed-line counts for the active matching rules. (Strength: it offers additional length, shuffle, reverse, and numbering operations.)',
    },
    {
      name: 'i2TEXT 텍스트 중복 줄 삭제',
      url: 'https://www.i2text.com/ko/remove-duplicate-text-lines',
      weakness:
        'The opened Korean workflow requires a Start action, while the visible controls are file upload, whitespace trimming, and case matching. It does not visibly offer original/last occurrence selection, blank-line removal, natural sorting, or Unicode-normalization matching. (Strength: it accepts a file as well as pasted text.)',
    },
    {
      name: 'Hi,Online Tools 텍스트 중복 제거',
      url: 'https://www.hionlinetools.com/ko/tool/deduplicate-text',
      weakness:
        'Its visible Korean page is a one-click converter with custom delimiters, case matching, blank-line removal, and trimming, but does not show first/last occurrence retention, natural sorting, Unicode-normalization matching, or live result counters. (Strength: custom input and output delimiters support non-line-separated lists.)',
    },
  ],
  related: ['word-counter', 'case-converter', 'remove-line-breaks', 'text-diff', 'lorem-ipsum'],
};
