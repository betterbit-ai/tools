import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'lorem-ipsum',
  category: 'text',
  icon: 'sparkle',
  added: '2026-10-12',
  updated: '2026-10-12',
  edges: ['no-ads', 'usability'],
  competitors: [
    {
      name: 'Lorem Ipsum Generator (loremmaker.com)',
      url: 'https://loremmaker.com/',
      weakness:
        'Its opened generator asks people to choose an amount and press Generate before text appears; Betterbit keeps its Latin and Korean result visible as soon as the settings change. (Strength: it offers six themed word banks plus Markdown, case and custom-vocabulary options that Betterbit does not.)',
    },
    {
      name: 'W3Schools Lorem Ipsum Generator',
      url: 'https://www.w3schools.com/tools/tool_lorem_ipsum.php',
      weakness:
        'The opened page requires Generate before Copy and includes a visible “REMOVE ADS” promotion alongside the tool; Betterbit shows a live result and has no advertising. (Strength: W3Schools also states that its generator runs entirely in the browser.)',
    },
    {
      name: 'Lipsum.in',
      url: 'https://lipsum.in/',
      weakness:
        'Its documented workflow is choose a unit, enter a count and click Generate Text, and it supports a maximum of 100 at a time; Betterbit shows output while each setting changes and makes Korean text an equal first-level choice. (Strength: it supports 10 languages, downloadable TXT files and min/max sentence-length controls.)',
    },
    {
      name: '한글 Lorem Ipsum (Unidago)',
      url: 'https://lorem.unidago.com/',
      weakness:
        'Its Korean page tells users to press 생성하기 before the result appears; Betterbit updates its Korean or Latin output as the amount, unit and copy format are selected. (Strength: it offers a style selector and a dedicated “동해물과” opening option.)',
    },
    {
      name: 'CalcLab Lorem Ipsum 생성기',
      url: 'https://koilab.co.kr/tools/lorem-ipsum',
      weakness:
        'Its visible Korean configuration combines Latin paragraphs and Korean sentences under one 1–50 amount and requires 생성하기; Betterbit lets both styles use paragraphs, sentences, words or exact characters live. (Strength: it provides a concise Korean-only guide.)',
    },
    {
      name: '유틸몬스터 로렘 입숨 생성기',
      url: 'https://util.monster/office/lorem-ipsum-generator?lang=ko',
      weakness:
        'Its search result documents a separate 생성하기 action and notes that Japanese and Chinese word mode becomes character-based, while the visible Korean workflow does not describe a live preview. Betterbit keeps a dedicated Korean mode and visible plain-text counts beside the result. (Strength: it additionally offers Japanese and Chinese placeholder styles.)',
    },
  ],
  related: ['word-counter', 'case-converter', 'remove-line-breaks', 'remove-duplicate-lines', 'speech-to-text'],
};
