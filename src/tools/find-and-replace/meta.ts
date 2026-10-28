import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'find-and-replace',
  category: 'text',
  icon: 'reorder',
  added: '2026-10-28',
  updated: '2026-10-28',
  edges: ['usability', 'features', 'privacy'],
  competitors: [
    {
      name: 'PapaTools Find and Replace Text',
      url: 'https://www.papatools.io/find-and-replace',
      weakness:
        'Its search result describes live counts, regex and case options, but lists no whole-word control or reversible applied-result history. Betterbit makes Unicode-aware Whole words only and a 10-step preview-to-input undo history visible in the tool. (Strength: it documents regex errors and a newline-dot option.)',
    },
    {
      name: 'Letvr Find and Replace Text',
      url: 'https://www.letvr.com/find-replace/',
      weakness:
        'Its opened page offers rich regex, escape and undo controls, but says undo lasts only until the text is edited by hand. Betterbit keeps the source and live preview separate, restores the local draft after refresh, and records 10 deliberate preview-to-input applications. (Strength: it has a worker timeout for runaway regexes and documents its Unicode whole-word behavior.)',
    },
    {
      name: 'AnyFile Find and Replace Text',
      url: 'https://anyfile.online/find-replace/',
      weakness:
        'Its opened controls show regex, case-sensitive and replace-all options, but no visible whole-word choice or separate apply-and-undo workflow. Betterbit adds a Unicode-aware Whole words only switch and leaves the original untouched until the user applies the preview. (Strength: it supports loading a file and downloading output.)',
    },
    {
      name: 'i2TEXT 텍스트 찾기·바꾸기',
      url: 'https://www.i2text.com/ko/find-replace-text',
      weakness:
        'Its opened Korean interface exposes file upload, Whole word and Match case, but no regular-expression control, live match count, output copy action or undo. Betterbit provides regex capture-group replacement, visible counts, a separate preview and reversible application. (Strength: it accepts a text file as well as typed content.)',
    },
    {
      name: 'RaonIT 찾기·바꾸기',
      url: 'https://tools.raonit.com/find-replace',
      weakness:
        'Its opened Korean guide states that replacement has no undo, so users must copy the original before a broad change. Betterbit keeps a non-destructive preview and up to 10 applied versions for Undo. (Strength: it offers regex, case-insensitive, whole-word, copy and download controls.)',
    },
    {
      name: 'Handytool 찾기 및 바꾸기',
      url: 'https://www.handytool.io/ko/tool/find-and-replace',
      weakness:
        'Its opened Korean page advertises multi-rule replacement and a comparison view, but does not show draft restoration or an apply-and-undo history in its visible controls. Betterbit saves the draft locally and makes each source-changing step reversible. (Strength: it supports several replacement rules in one run.)',
    },
  ],
  related: ['word-counter', 'case-converter', 'remove-line-breaks', 'text-diff'],
};
