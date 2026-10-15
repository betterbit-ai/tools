import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'regex-tester',
  category: 'developer',
  icon: 'code',
  added: '2026-10-15',
  updated: '2026-10-15',
  edges: ['usability'],
  competitors: [
    {
      name: 'Regex Tester (Dan’s Tools / RegExr)',
      url: 'https://www.regextester.com/',
      weakness:
        'The opened page displays a modal saying it is not optimized for mobile devices, and its premium discussion features ask visitors to register. Betterbit keeps the pattern, flags, text and replacement in local browser storage and lays match output out responsively. (Strength: it has a community library and shareable expressions.)',
    },
    {
      name: 'regex101',
      url: 'https://regex101.com/',
      weakness:
        'Its opened editor defaults to the PCRE2 (PHP) flavor and places Benchmark Regex and Format Regex behind visible Pro labels, so browser-JavaScript users must first choose the engine and navigate a much larger workspace. Betterbit deliberately tests the exact JavaScript RegExp flavor in one compact live view. (Strength: it supports several engine flavors, unit tests and code generation.)',
    },
    {
      name: 'RegExr',
      url: 'https://regexr.com/',
      weakness:
        'The opened page says sign-in is needed to persist favorites and patterns, and warns that saving creates a shareable public copy. Betterbit automatically restores the unfinished pattern, flags, sample text and replacement locally without an account or public link. (Strength: it supports PCRE and JavaScript, a reference, and shareable community patterns.)',
    },
    {
      name: 'ToolMole 정규식 테스트',
      url: 'https://toolmole.com/ko/regex-tester/',
      weakness:
        'Its indexed Korean result focuses on a pattern field, flags, live highlighting and capture groups but does not show a replacement preview or local restoration of an unfinished test. Betterbit keeps replacement output and the editable test state in the same responsive panel. (Strength: it clearly states that it uses the browser JavaScript engine.)',
    },
    {
      name: '간편도구 정규식 테스터',
      url: 'https://www.konly.co.kr/ko/tools/regex-tester',
      weakness:
        'Its opened page caps highlighted matches at 1,000 and offers multi-case testing, but its visible controls do not restore an unfinished pattern, flags, text and replacement after a refresh. Betterbit restores that full working state locally. (Strength: it uses a Worker limit for slow patterns and supports multiple test cases.)',
    },
    {
      name: '툴마스터 정규식 테스터',
      url: 'https://tool.webi.co.kr/tools/regex-tester',
      weakness:
        'Its indexed Korean result exposes g, i, m, s and u flags only, while a JavaScript RegExp can also use sticky y matching. Betterbit exposes y alongside the common flags and shows the match index and capture data without a separate run action. (Strength: it includes Korean-oriented preset patterns such as mobile numbers and business registration numbers.)',
    },
  ],
  related: ['json-formatter', 'url-encoder', 'base64', 'color-converter'],
};
