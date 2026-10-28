import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'sort-lines',
  category: 'text',
  icon: 'reorder',
  added: '2026-10-28',
  updated: '2026-10-28',
  edges: ['usability', 'features', 'accuracy'],
  competitors: [
    {
      name: 'Tolz Sort Lines Online',
      url: 'https://tolz.me/text/sort-lines',
      weakness:
        'Its opened result offers natural, length, cleanup, and shuffle modes, but its visible workflow ends at copying the sorted list. Betterbit adds a direct “Use as input” action, browser-only draft restoration, and a Cmd/Ctrl+Enter copy shortcut beside the live result. (Strength: it also offers line-length ordering.)',
    },
    {
      name: 'Toolaki Sort Lines',
      url: 'https://toolaki.com/sort-lines/',
      weakness:
        'Its opened page offers only A→Z/Z→A plus case-sensitive and empty-line controls; it directs users to a separate Text Cleaner for duplicates. It has no visible natural-number order, reverse-current-order, shuffle, whitespace trim, or in-place result workflow. (Strength: its result updates as text is pasted.)',
    },
    {
      name: 'ToolBark Sort Lines Alphabetically',
      url: 'https://toolbark.com/tools/sort-lines',
      weakness:
        'Its opened controls are A–Z/Z–A, case-insensitive sort, and blank-line removal. It does not visibly offer natural number ordering, reverse-current-order, shuffle, duplicate removal, or whitespace trimming; Betterbit exposes all of those next to the live result. (Strength: it shows a compact sample immediately.)',
    },
    {
      name: 'listenany 가나다순 정렬',
      url: 'https://listenany.app/ko/sort-lines',
      weakness:
        'Its opened Korean page supports eight language rules, last-word sorting, download, and audio output, but its instructions route users through a separate language-rule choice. Betterbit makes the page locale the comparison rule by default, retains equivalent Unicode spellings as one duplicate, and keeps a restored working draft in the browser. (Strength: it supports more explicit language choices and last-word sorting.)',
    },
    {
      name: 'i2TEXT 텍스트 줄 정렬',
      url: 'https://www.i2text.com/ko/sort-text-lines',
      weakness:
        'Its opened Korean workflow offers A→Z, Z→A, and reverse order behind a Start action. It does not visibly provide natural number ordering, random shuffle, duplicate cleanup, live option-aware counts, or a result-to-input action. (Strength: it also accepts a file upload.)',
    },
    {
      name: 'smith lab 텍스트 줄 정렬기',
      url: 'https://smithlab.co.kr/text/text-sorter/',
      weakness:
        'Its opened Korean tool supports many modes and delimiters, but the guide describes choosing a delimiter before working with comma- or tab-separated input. Betterbit stays focused on a pasted line list, applies the page’s Korean collation automatically, and persists that list and its cleanup choices after refresh. (Strength: it offers delimiter, field, and numbering options beyond line sorting.)',
    },
  ],
  related: ['remove-duplicate-lines', 'remove-line-breaks', 'case-converter', 'word-counter'],
};
