import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'word-counter',
  category: 'text',
  icon: 'count',
  added: '2026-10-07',
  updated: '2026-10-13',
  edges: ['no-ads', 'accuracy', 'privacy', 'features'],
  competitors: [
    {
      name: 'WordCounter.net',
      url: 'https://wordcounter.net/',
      weakness:
        'The live page opens with sign-in prompts for autosave/goals and Grammarly upsell banners, then places a large editor toolbar ahead of the basic counts. (Strength: it offers document import/export, editing tools, custom goals and readability details that Betterbit does not.)',
    },
    {
      name: 'Saramin 글자수세기',
      url: 'https://www.saramin.co.kr/zf_user/tools/character-counter',
      weakness:
        'Its counter exposes only with/without-space character and byte totals, so it has no line-break-excluded count, word count or reading/speaking estimate; the desktop page is surrounded by the full job-portal navigation. (Strength: its mobile tool provides a character/byte limit, 10-minute autosave and result copying.)',
    },
    {
      name: 'WordCount.Online',
      url: 'https://wordcount.online/',
      weakness:
        'The current page combines its basic counter with readability, streak, writing-sprint and document panels; Betterbit keeps the core counts, byte modes and one character-limit control visible together. (Strength: it lets users choose hyphen, number, quote and bracket counting rules, and includes readability scoring.)',
    },
  ],
  related: ['remove-line-breaks', 'case-converter', 'lorem-ipsum', 'korean-spell-check'],
};
