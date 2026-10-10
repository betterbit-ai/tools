import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'case-converter',
  category: 'text',
  icon: 'convert',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'Letvr Tools Case Converter',
      url: 'https://letvr.com/case-converter/',
      weakness:
        'Uses one fixed Chicago-style Title Case rule; its own guide tells AP-style writers to check the differing long-preposition cases manually. Betterbit lets people switch AP and Chicago rules in the result panel. (Strength: it clearly documents identifier splitting and supports multiline conversion.)',
    },
    {
      name: 'Starlight Tools Case Converter',
      url: 'https://starlighttools.org/text/case-converter',
      weakness:
        'The page adds plain-text file import, download naming, custom-term preservation and 13 formatting choices around the main conversion; Betterbit instead keeps an explicit AP/Chicago rule selector next to the live result. (Strength: its import, download and custom-term options are broader than this tool.)',
    },
    {
      name: 'AllRight Tools Case Converter',
      url: 'https://allrighttools.com/case-converter/',
      weakness:
        'Its title-style selector lists AP, APA, Chicago and MLA, but the page states that AP and APA produce identical results; Betterbit deliberately exposes only the two verified styles it implements, rather than presenting unverified style labels. (Strength: it offers Turkish/Azerbaijani casing and more identifier separators.)',
    },
    {
      name: '다모아킷 대소문자 변환기',
      url: 'https://www.damoakit.com/tool/case-converter',
      weakness:
        'Its visible controls cover uppercase, lowercase, word-initial capitalization, sentence-initial capitalization and inverse case only; it does not offer AP/Chicago title rules or camelCase, snake_case and kebab-case developer formats.',
    },
    {
      name: 'vixutil 대소문자 변환',
      url: 'https://vixutil.com/text/case',
      weakness:
        'It offers basic writing and developer formats, but its public description does not provide a selectable AP or Chicago title-case rule; Betterbit makes the title style explicit so long prepositions such as “about” and “with” are predictable.',
    },
    {
      name: 'SmallWebTools 케이스 변환기',
      url: 'https://smallwebtools.net/ko/case-converter',
      weakness:
        'The Korean tool exposes only Sentence case, lower case, UPPER CASE and Capitalized Case, and shows login/register links plus a cookie-consent banner; it lacks both title-style choices and programming identifier formats.',
    },
  ],
  related: ['word-counter', 'text-diff', 'timer'],
};
