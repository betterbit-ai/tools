import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'cron-parser',
  category: 'developer',
  icon: 'clock',
  added: '2026-11-28',
  updated: '2026-11-28',
  edges: ['accuracy', 'features'],
  competitors: [
    {
      name: '칼큐 크론 표현식 해석기',
      url: 'https://calqu.kr/dev/cron/',
      weakness:
        'Its own note says the tool always ANDs day-of-month and weekday, so 0 0 1 * 1 is read as "the 1st that is also a Monday" — the opposite of crontab, which runs on the 1st and on every Monday. Betterbit follows the Vixie rule and ORs them. (Strength: it explains the trap and the local-time calculation honestly.)',
    },
    {
      name: '국밥툴즈 cron 표현식 해석기',
      url: 'https://gukbap-tools.com/cron',
      weakness:
        'Its FAQ states that only five-field crontab is supported, so a Spring or Quartz expression with a seconds field has to be converted by hand. Betterbit reads six fields and shows the seconds in the run list. (Strength: a clear Korean sentence and five upcoming runs in KST.)',
    },
    {
      name: 'Cron Expression Generator & Explainer (TripleP Tools)',
      url: 'https://triplepdude.github.io/cron-expression-generator/',
      weakness:
        'It covers many formats and flags DST behaviour, but its page reads as a generator first: the format switcher and builder come before the expression you paste. Betterbit is one field, one sentence and one list. (Strength: it converts between crontab, Quartz, Spring and AWS and explains how each differs.)',
    },
    {
      name: 'Cronparse',
      url: 'https://cronparse.com/',
      weakness:
        'Its upcoming list numbers runs but does not say which zone they are in, and there is no per-field explanation of what was understood. Betterbit names the zone and shows the values each field resolved to. (Strength: a field-by-field builder for people who do not write cron by hand.)',
    },
  ],
  related: ['unix-timestamp', 'time-zone-converter', 'world-clock'],
};
