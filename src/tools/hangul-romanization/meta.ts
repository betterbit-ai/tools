import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'hangul-romanization',
  category: 'text',
  icon: 'convert',
  added: '2026-10-12',
  updated: '2026-10-12',
  edges: ['usability'],
  competitors: [
    {
      name: 'Hangeul Tool Romanizer',
      url: 'https://hangeul-tool.com/en/tools/romanize',
      weakness:
        'Its live, browser-only converter is strong, but says typed text is not stored; Betterbit restores the last local input and keeps the official-text and passport-name paths in one compact panel. (Strength: it offers several selectable surname spellings and a letter-by-letter academic mode.)',
    },
    {
      name: 'Pusan National University / NARA Romanization Converter',
      url: 'https://roman.nara-speller.co.kr/input_eng.aspx',
      weakness:
        'The opened interface requires selecting a conversion type and submitting the text before a result is shown, and presents three systems in a dense legacy form rather than a focused live RR result. (Strength: it supports Revised Romanization, McCune–Reischauer and Yale.)',
    },
    {
      name: 'UtilPak Korean Romanization Converter',
      url: 'https://utilpak.com/korean-romanization-converter.php',
      weakness:
        'Its documented standard and name flows each require a separate conversion button; its address flow calls an external English-address API. Betterbit makes its two local-only modes update as text is entered. (Strength: it also offers address and academic-research workflows.)',
    },
    {
      name: 'RECATOOLS Korean Romanization Converter',
      url: 'https://recatools.com/korean-romanization-converter/',
      weakness:
        'It exposes several specialist controls and a newsletter sign-up below the converter; Betterbit keeps the common RR and passport-name choices visible without a separate pronunciation or scheme row. (Strength: it provides McCune–Reischauer, reversible transliteration and a pronounced-form row.)',
    },
  ],
  related: ['word-counter', 'case-converter', 'text-diff'],
};
