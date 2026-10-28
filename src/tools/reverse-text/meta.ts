import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'reverse-text',
  category: 'text',
  icon: 'convert',
  added: '2026-10-29',
  updated: '2026-10-29',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'openWorkstand Reverse Text',
      url: 'https://www.openworkstand.com/reverse-text',
      weakness:
        'Its documented modes cover whole text, word order, each word, lines, and sentences, but do not include Unicode upside-down text in the same tool. Betterbit provides live character, word, each-word, line, and upside-down transformations from one compact picker. (Strength: it also supports TXT input/output and a palindrome check.)',
    },
    {
      name: 'TextReverse',
      url: 'https://www.textreverse.io/',
      weakness:
        'It presents six transformations as separate output cards and links each one to its own tool, which makes comparing one chosen operation less focused. Betterbit keeps one selected result beside the source, and lets a user reuse that result as the next input. (Strength: it also offers share-sheet and URL-fragment sharing.)',
    },
    {
      name: 'ReverseThisText',
      url: 'https://www.reversethistext.com/',
      weakness:
        'Its visible interface groups seven transformations with unrelated small-caps styling and asks users to choose a transformation before copying; it does not document draft restoration. Betterbit saves the current text and selected reversal locally, then updates one focused result while typing. (Strength: it also provides TXT download.)',
    },
    {
      name: 'i2TEXT 텍스트 뒤집기',
      url: 'https://www.i2text.com/ko/flip-text-generator',
      weakness:
        'Its Korean page describes a button-driven Unicode upside-down conversion and warns that not every character has a flipped counterpart; it does not offer ordinary character, word-order, each-word, or line-order reversal in that tool. Betterbit labels the approximation and provides those four reversible operations beside it.',
    },
    {
      name: 'Tooly Text Reverser',
      url: 'https://tooly.co.kr/tool/text-reverser',
      weakness:
        'Its instructions require pressing an execution button, and its documented behavior reverses every character including line breaks rather than offering word or line order as separate choices. Betterbit updates live and separates character, word, each-word, and line reversal. (Strength: it clearly states browser-local processing.)',
    },
    {
      name: '글자놀이 뒤집기 텍스트',
      url: 'https://nakani824.monster/',
      weakness:
        'Its indexed Korean landing page groups reverse and upside-down text with decorative-text tools, but does not disclose separate word or line reversal or grapheme handling. Betterbit makes each transformation explicit and keeps joined emoji, flags, and combining accents intact when reversing.',
    },
  ],
  related: ['case-converter', 'remove-line-breaks', 'fancy-text', 'find-and-replace'],
};
