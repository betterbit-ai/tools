import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'shoe-size-converter',
  category: 'converter',
  icon: 'convert',
  added: '2026-10-14',
  updated: '2026-10-15',
  edges: ['usability'],
  competitors: [
    {
      name: 'ShoeSizeConverter.org — Shoe Size Converter',
      url: 'https://shoesizeconverter.org/',
      weakness:
        'The page’s brand-fit cards include Amazon shopping links and explicitly disclose Amazon affiliate links. Its main converter starts with a gender/category tab and a system-size pair; Betterbit shows Korea mm, Japan cm, US men’s, US women’s, UK, and EU together as soon as one adult value is entered, with no affiliate links. (Strength: it covers children, width, and more regional systems.)',
    },
    {
      name: 'ShoeSizeConversion.org — Shoe Size Converter',
      url: 'https://www.shoesizeconversion.org/',
      weakness:
        'The instructions require choosing an age category, filling a field, then pressing “Convert” or Enter before results appear. Betterbit updates all six adult labels immediately on input and puts the measured Korea mm and Japan cm values first. (Strength: it has separate children and infant charts, which Betterbit’s focused adult reference does not cover.)',
    },
    {
      name: 'Calcipedia — Shoe Size Converter',
      url: 'https://www.calcipedia.org/calculators/shoe-size-converter/',
      weakness:
        'Its published converter covers US, UK, EU, and JP / Mondopoint, but not a Korean millimetre label in the visible result set, and it has no selectable brand-specific reminder beside the answer. Betterbit adds Korea mm and an on-page Nike, adidas, or New Balance check. (Strength: it supports a separate kids chart and clearly preserves C/Y suffixes.)',
    },
    {
      name: 'KoCalculators — 신발 사이즈 변환기',
      url: 'https://kocalculators.com/unit/shoe-size/',
      weakness:
        'The page presents three separate conversion directions and a “계산하기” action, and repeats Coupang Partners affiliate disclosures and shopping links through the page. Betterbit accepts any of six systems as the input and updates every result live in one focused comparison. (Strength: it includes several brand-specific editorial fit suggestions.)',
    },
  ],
  related: ['length-converter', 'weight-converter', 'temperature-converter'],
};
