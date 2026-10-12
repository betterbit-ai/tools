import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'character-map',
  category: 'text',
  icon: 'sparkle',
  added: '2026-10-12',
  updated: '2026-10-12',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'Copy Symbol',
      url: 'https://copy-symbol.com/',
      weakness:
        'Its 2,723-character catalog is organized by broad Unicode categories (currency, math, arrows, and more), but it does not provide the Korean consonant + Hanja-key grouping that Korean users search for. (Strength: its catalog is substantially larger and includes full emoji categories.)',
    },
    {
      name: 'Weird Fonts Special Character',
      url: 'https://www.weirdfonts.com/special-characters/',
      weakness:
        'Its search result leads with a “Most used 24” list and English kind-based sections; it does not expose Korean keyboard-consonant navigation or Unicode code-point search before copying. (Strength: its first screen makes common symbols quick to browse.)',
    },
    {
      name: 'CopyChars',
      url: 'https://www.copychars.com/',
      weakness:
        'Its 3,000+ symbol, emoji and kaomoji catalog is organized around platform and aesthetic collections, not the Korean ㅁ+한자-style keyboard map; the catalog page does not show a character’s U+ value beside the copy target. (Strength: it covers more emoji, kaomoji and platform-specific collections.)',
    },
    {
      name: 'Keepdesk 특수문자 모음',
      url: 'https://keepdesk.app/special-chars/',
      weakness:
        'It has keyboard-consonant groups, a collection field and 24 recent symbols, but its visible tool does not show Unicode U+ code points or let users search by code point. Betterbit exposes both next to every copy target. (Strength: its editable multi-symbol collection is useful for assembling a string.)',
    },
    {
      name: '양재완 특수문자표',
      url: 'https://yjwrcyss.tistory.com/408',
      weakness:
        'The result is a 2010 static reference table that explains consonant + Hanja input, without a searchable or one-click copyable character grid.',
    },
    {
      name: '인포데이터 엑셀 특수문자표',
      url: 'https://info.infonbox.com/%EC%97%91%EC%85%80-%ED%8A%B9%EC%88%98%EB%AC%B8%EC%9E%90%ED%91%9C-%ED%95%9C%EC%9E%90%ED%82%A4-%EC%9E%85%EB%A0%A5-%EB%B0%A9%EB%B2%95%EA%B3%BC-%ED%82%A4%EB%B3%B4%EB%93%9C-%EC%97%86%EB%8A%94-%EA%B8%B0/',
      weakness:
        'This is an Excel-focused article that describes ㅁ/ㅇ/ㄷ shortcuts and font caveats, rather than a copyable character map with text, symbol and U+ code-point search.',
    },
  ],
  related: ['word-counter', 'fancy-text', 'invisible-character'],
};
