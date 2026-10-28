import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'fancy-text',
  category: 'text',
  icon: 'sparkle',
  added: '2026-10-12',
  updated: '2026-10-12',
  edges: ['usability', 'privacy'],
  competitors: [
    {
      name: 'iFontGenerator Fancy Text Generator',
      url: 'https://ifontgenerator.com/',
      weakness:
        'Shows 160+ results behind broad category filters, but its result list does not identify styles that leave a non-Latin input unchanged. Betterbit shows only transformations that actually change the current text and keeps Korean/CJK-capable decorations visible.',
    },
    {
      name: 'FancyTextStyle Fancy Text Generator',
      url: 'https://fancytextstyle.com/',
      weakness:
        'Its 142-style page emphasizes symbol randomization and a dense mix of alphabet, frame and decoration combinations. Betterbit separates compact text styles from decorations and filters out no-op results for the entered script. (Strength: it offers far more randomized symbol combinations.)',
    },
    {
      name: 'TextsGenerators Fancy Text Generator',
      url: 'https://textsgenerators.com/',
      weakness:
        'The page places 160+ styles, a custom builder, history, export and platform-limit controls around the first result; it does not make the Latin-only nature of individual styles clear before copying. Betterbit has a smaller compatibility-first result list. (Strength: it includes a broader custom-style builder and history.)',
    },
    {
      name: '짱툴 인스타 글씨체 변환기',
      url: 'https://jjangtool.com/fonts/',
      weakness:
        'Its visible list presents 30 English-and-number font rows even though its guide says Korean remains unchanged except for decorations. Betterbit hides unchanged rows for the entered text and groups decorations separately.',
    },
    {
      name: '툴즈 인스타 폰트·글씨체 변환기',
      url: 'https://tools25.com/tools/font-style',
      weakness:
        'It divides results into English/number fonts and Korean decorations but keeps the selection in separate sections. Betterbit uses one compact filter and removes any style that does not change the current text. (Strength: it offers favorites.)',
    },
    {
      name: 'Toolog 폰트 변환기',
      url: 'https://toolog.sooyadev.com/tools/font-change/',
      weakness:
        'Its interface documents a 500-character input limit and 32 displayed styles. Betterbit has no imposed input cap and provides a compact result list filtered to actual transformations. (Strength: it also has Korean/English style search and favorites.)',
    },
  ],
  related: ['word-counter', 'case-converter', 'lorem-ipsum', 'invisible-character', 'character-map', 'reverse-text'],
};
