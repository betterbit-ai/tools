#!/usr/bin/env node
/**
 * Scaffold a new tool:  npm run new-tool -- <slug> <category>
 *   e.g.  npm run new-tool -- qr-code-generator generator
 *
 * Creates src/tools/<slug>/ with every required file. Generated files contain
 * TODO markers on purpose — tests/registry.test.ts fails until all are replaced.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [slug, category] = process.argv.slice(2);
const categoriesSrc = readFileSync(resolve('src/tools/categories.ts'), 'utf8');
const categoryIds = [...categoriesSrc.matchAll(/^  ([a-z]+): \{$/gm)].map((m) => m[1]);

if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || !categoryIds.includes(category)) {
  console.error(`Usage: npm run new-tool -- <kebab-slug> <category>\nCategories: ${categoryIds.join(', ')}`);
  process.exit(1);
}

const dir = resolve('src/tools', slug);
if (existsSync(dir)) {
  console.error(`src/tools/${slug} already exists.`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const pascal = slug.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());

const files = {
  'meta.ts': `import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: '${slug}',
  category: '${category}',
  icon: 'sparkle', // TODO: pick or add an icon in src/components/site/Icon.astro
  added: '${today}',
  updated: '${today}',
  // TODO: which axes do we beat competitors on? (see docs/TOOL_PLAYBOOK.md → "Edge")
  edges: [],
  // TODO: research the top 3 results for the primary keyword in each locale.
  competitors: [],
  related: [],
};
`,
  'content.ts': `import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  // Every string rendered inside Tool.tsx goes here. TODO
  example: 'TODO',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'TODO — primary keyword first, 30–60 chars',
    description: 'TODO — answer the query and state the edge, 90–160 chars.',
    h1: 'TODO',
    tagline: 'TODO',
    name: 'TODO',
    keywords: ['TODO'],
    howTo: ['TODO'],
    sections: [{ heading: 'TODO', body: 'TODO' }],
    faq: [{ q: 'TODO?', a: 'TODO' }],
    ui: uiEn,
  },
  ko: {
    title: 'TODO',
    description: 'TODO',
    h1: 'TODO',
    tagline: 'TODO',
    name: 'TODO',
    keywords: ['TODO'],
    howTo: ['TODO'],
    sections: [{ heading: 'TODO', body: 'TODO' }],
    faq: [{ q: 'TODO?', a: 'TODO' }],
    ui: { example: 'TODO' },
  },
};
`,
  'logic.ts': `/**
 * Pure logic for ${slug} — no DOM, no Preact. Everything testable lives here.
 */

// TODO: implement
export function example(input: string): string {
  return input;
}
`,
  'logic.test.ts': `import { describe, expect, it } from 'vitest';
import { example } from './logic';

describe('${slug}', () => {
  // TODO: cover normal cases, edge cases (empty, huge, unicode) and every bug you fix.
  it('works', () => {
    expect(example('a')).toBe('a');
  });
});
`,
  'Tool.tsx': `import { useState } from 'preact/hooks';
import { Panel } from '../../components/ui';
import type { ToolProps } from '../types';
import type { UI } from './content';

export default function ${pascal}({ ui }: ToolProps<UI>) {
  const [value] = useState('');
  // TODO: build the UI only from src/components/ui primitives and design tokens.
  return <Panel>{ui.example}{value}</Panel>;
}
`,
  'Island.astro': `---
import Tool from './Tool';
import type { ToolProps } from '../types';
import type { UI } from './content';

const props = Astro.props as ToolProps<UI>;
---

<Tool client:load {...props} />
`,
};

mkdirSync(dir, { recursive: true });
for (const [name, body] of Object.entries(files)) writeFileSync(resolve(dir, name), body);

console.log(`Created src/tools/${slug}/ (${Object.keys(files).join(', ')})
Next: follow .claude/skills/new-tool/SKILL.md — research → logic+tests → UI → content → npm run verify.`);
