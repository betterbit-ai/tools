import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'word-counter',
  category: 'text',
  icon: 'count',
  added: '2026-10-07',
  updated: '2026-10-07',
  edges: ['no-ads', 'accuracy', 'privacy', 'features'],
  competitors: [
    {
      name: 'WordCounter.net',
      url: 'https://wordcounter.net/',
      weakness:
        'Sign-in prompts for autosave/goals and Grammarly upsell banners; splits on spaces so CJK text is miscounted.',
    },
    {
      name: 'Saramin 글자수세기',
      url: 'https://www.saramin.co.kr/zf_user/tools/character-counter',
      weakness:
        'Only with/without-space chars and bytes; no line-break-excluded count, word count, reading time or limit tracker; buried in a heavy job-portal page. (Strength: built-in spell check — consider later.)',
    },
  ],
  related: ['case-converter', 'timer', 'image-resizer', 'image-compressor', 'image-converter'],
};
