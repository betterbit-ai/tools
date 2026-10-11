import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'text-diff',
  category: 'text',
  icon: 'compare',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['privacy', 'features', 'accuracy'],
  competitors: [
    {
      name: 'Diffchecker',
      url: 'https://www.diffchecker.com/',
      weakness:
        'Character-level diff precision is capped at 10 uses per month on the free plan, and saving or sharing a comparison requires creating an account. (Strength: polished UI, an offline desktop app, and live re-comparison as you edit.)',
    },
    {
      name: 'Text Compare!',
      url: 'https://text-compare.com/',
      weakness:
        "States that pasted text is sent over an encrypted connection to its server for comparison, so it isn't fully client-side; only line-level comparison is offered, with no word or character mode. (Strength: built-in lowercase, line-sort and whitespace-normalize preprocessing options.)",
    },
    {
      name: '텍스트 비교기 (hanariago)',
      url: 'https://hanariago.github.io/tool-diff-checker/',
      weakness:
        '줄/단어/글자 단위 비교를 제공하지만, 유니코드 정규화(NFC/NFD)나 결합 문자 처리에 대한 설명이 전혀 없어 macOS에서 자모가 분리된 한글을 붙여넣었을 때도 정확히 비교되는지 확인할 수 없음. (Strength: 완전한 한국어 UI, 가입 없는 무료 다단계 diff.)',
    },
  ],
  related: ['word-counter', 'case-converter', 'json-formatter', 'timer', 'base64'],
};
