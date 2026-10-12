/** Pure, conservative Korean spelling checks. No DOM or network access. */

export type RuleId =
  | 'doe-yo'
  | 'myeochil'
  | 'waenji'
  | 'eoui'
  | 'geumsae'
  | 'mweyoyo'
  | 'eotteokhae'
  | 'seollem'
  | 'yeokhal'
  | 'message'
  | 'contents'
  | 'accessory'
  | 'spacing-halsu'
  | 'spacing-geotgat'
  | 'punctuation-space';

export interface SpellIssue {
  rule: RuleId;
  start: number;
  end: number;
  original: string;
  replacement: string;
}

export interface CheckResult {
  issues: SpellIssue[];
  correctedText: string;
}

interface Rule {
  id: RuleId;
  pattern: RegExp;
  replacement: string | ((match: RegExpExecArray) => string);
}

// These are intentionally high-confidence forms. Korean grammar and many spacing
// choices depend on context, so ambiguous forms are not changed automatically.
const RULES: Rule[] = [
  { id: 'doe-yo', pattern: /되요/g, replacement: '돼요' },
  { id: 'myeochil', pattern: /몇일/g, replacement: '며칠' },
  { id: 'waenji', pattern: /웬지/g, replacement: '왠지' },
  { id: 'eoui', pattern: /어의없/g, replacement: '어이없' },
  { id: 'geumsae', pattern: /금새/g, replacement: '금세' },
  { id: 'mweyoyo', pattern: /뵈요/g, replacement: '봬요' },
  { id: 'eotteokhae', pattern: /어떻해/g, replacement: '어떡해' },
  { id: 'seollem', pattern: /설레임/g, replacement: '설렘' },
  { id: 'yeokhal', pattern: /역활/g, replacement: '역할' },
  { id: 'message', pattern: /메세지/g, replacement: '메시지' },
  { id: 'contents', pattern: /컨텐츠/g, replacement: '콘텐츠' },
  { id: 'accessory', pattern: /악세사리/g, replacement: '액세서리' },
  {
    id: 'spacing-halsu',
    pattern: /([가-힣])수(있|없)/g,
    replacement: (match) => `${match[1]} 수 ${match[2]}`,
  },
  { id: 'spacing-geotgat', pattern: /것같/g, replacement: '것 같' },
  { id: 'punctuation-space', pattern: /\s+([,.!?…])/g, replacement: '$1' },
];

/** Finds non-overlapping, high-confidence corrections in original-text order. */
export function findIssues(text: string): SpellIssue[] {
  const candidates: SpellIssue[] = [];

  for (const rule of RULES) {
    rule.pattern.lastIndex = 0;
    for (let match = rule.pattern.exec(text); match; match = rule.pattern.exec(text)) {
      const original = match[0];
      const replacement =
        typeof rule.replacement === 'function'
          ? rule.replacement(match)
          : rule.replacement === '$1'
            ? match[1]
            : rule.replacement;
      candidates.push({
        rule: rule.id,
        start: match.index,
        end: match.index + original.length,
        original,
        replacement,
      });
    }
  }

  candidates.sort((a, b) => a.start - b.start || b.end - a.end || a.rule.localeCompare(b.rule));
  const issues: SpellIssue[] = [];
  let end = -1;
  for (const candidate of candidates) {
    if (candidate.start >= end) {
      issues.push(candidate);
      end = candidate.end;
    }
  }
  return issues;
}

/** Applies issues that still match the original text. This makes stale UI actions safe. */
export function applyIssues(text: string, issues: readonly SpellIssue[]): string {
  const sorted = [...issues].sort((a, b) => a.start - b.start);
  let cursor = 0;
  let output = '';
  for (const issue of sorted) {
    if (issue.start < cursor || text.slice(issue.start, issue.end) !== issue.original) continue;
    output += text.slice(cursor, issue.start) + issue.replacement;
    cursor = issue.end;
  }
  return output + text.slice(cursor);
}

export function checkText(text: string): CheckResult {
  const issues = findIssues(text);
  return { issues, correctedText: applyIssues(text, issues) };
}
