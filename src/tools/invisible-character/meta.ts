import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'invisible-character',
  category: 'text',
  icon: 'sparkle',
  added: '2026-10-12',
  updated: '2026-10-12',
  edges: ['usability', 'features', 'privacy'],
  competitors: [
    {
      name: 'AlphaFonts Invisible Character',
      url: 'https://alphafonts.com/tools/invisible-character',
      weakness:
        'Its guidance tells users to start with Hangul Filler and then try Braille Blank if rejected, but the tool does not provide a local pasted-text inspector that lists the exact code points copied. Betterbit shows every detected code point and count. (Strength: it offers seven character choices.)',
    },
    {
      name: 'ShawGames Invisible Character',
      url: 'https://shawgames.com/tools/invisible-character',
      weakness:
        'Its six character copy buttons are immediately followed by a large “stay for a game” section and game links. Betterbit keeps the copy result, selection guidance and paste check together without unrelated game promotion.',
    },
    {
      name: 'InvisibleCharacter.io',
      url: 'https://invisiblecharacter.io/',
      weakness:
        'Its tester reports only total characters and recognized-invisible totals; it does not show a per-code-point inspection of pasted text. Betterbit identifies each detected character, including unsupported visible characters. (Strength: it has app presets and a broader Unicode table.)',
    },
    {
      name: 'Text Machine 투명 문자 생성기',
      url: 'https://textmachine.org/ko/text-tools/invisible-text',
      weakness:
        'It offers four character types and quantity generation, but its Korean page does not provide a pasted-text code-point checker. Betterbit lets users confirm exactly what a destination field preserved locally.',
    },
    {
      name: 'Character Calculator 투명 글씨',
      url: 'https://charactercalculator.com/ko/invisible-character/',
      weakness:
        'Its interface labels four results only as “투명글씨 1” through “투명글씨 4” and its test area shows a character total, not each Unicode value. Betterbit names every choice and displays its U+ code.',
    },
    {
      name: 'Texto Invisible Blank Character',
      url: 'https://texto-invisible.org/ko/blank-character/',
      weakness:
        'Its Korean page presents small, medium and large copy options plus a separate generator, without identifying the Unicode code point in those first choices. Betterbit exposes the character name, exact U+ value and its line-break behavior before copying.',
    },
  ],
  related: ['word-counter', 'fancy-text', 'remove-line-breaks', 'character-map'],
};
