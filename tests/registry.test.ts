/**
 * Registry quality gate. Every rule here encodes a standard from CLAUDE.md /
 * docs/TOOL_PLAYBOOK.md so that a new tool cannot ship below the bar.
 * If a rule is wrong, change the rule and the doc together — don't special-case a tool.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOCALES, type Locale } from '../src/i18n/locales';
import { CATEGORY_IDS } from '../src/tools/categories';
import { TOOL_DATA } from '../src/tools/data';
import type { EdgeKind } from '../src/tools/types';

const EDGE_KINDS: EdgeKind[] = [
  'privacy',
  'no-ads',
  'performance',
  'usability',
  'design',
  'features',
  'accuracy',
  'offline',
  'no-signup',
];
const RESERVED_SLUGS = new Set<string>([
  'c',
  'api',
  'about',
  'privacy',
  'terms',
  'contact',
  'sitemap',
  'robots',
  'llms',
  '_astro',
  ...LOCALES,
]);
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const PLACEHOLDER = /\b(TODO|TBD|FIXME|lorem ipsum)\b/i;
/** CJK text carries more meaning per character, so minimum lengths are lower. */
const DENSE: Partial<Record<Locale, boolean>> = { ko: true };
const len = (s: string) => [...s].length;
const min = (locale: Locale, latin: number) => (DENSE[locale] ? Math.round(latin * 0.45) : latin);

describe('tool registry', () => {
  it('has at least one tool', () => {
    expect(TOOL_DATA.length).toBeGreaterThan(0);
  });

  it('has unique titles and descriptions across tools (no duplicate SERP snippets)', () => {
    for (const locale of LOCALES) {
      const titles = TOOL_DATA.map((t) => t.content[locale].title);
      const descs = TOOL_DATA.map((t) => t.content[locale].description);
      expect(new Set(titles).size, `duplicate ${locale} title`).toBe(titles.length);
      expect(new Set(descs).size, `duplicate ${locale} description`).toBe(descs.length);
    }
  });
});

for (const { meta, content } of TOOL_DATA) {
  describe(`tool: ${meta.slug}`, () => {
    const dir = resolve(__dirname, '../src/tools', meta.slug);

    it('has a valid, non-reserved kebab-case slug', () => {
      expect(meta.slug).toMatch(KEBAB);
      expect(RESERVED_SLUGS.has(meta.slug)).toBe(false);
    });

    it('has all required files', () => {
      for (const f of ['meta.ts', 'content.ts', 'Tool.tsx', 'Island.astro']) {
        expect(existsSync(resolve(dir, f)), `${meta.slug}/${f}`).toBe(true);
      }
      if (existsSync(resolve(dir, 'logic.ts'))) {
        expect(existsSync(resolve(dir, 'logic.test.ts')), 'logic.ts needs logic.test.ts').toBe(true);
      }
    });

    it('belongs to a known category', () => {
      expect(CATEGORY_IDS).toContain(meta.category);
    });

    it('declares at least one edge over competitors', () => {
      expect(meta.edges.length).toBeGreaterThan(0);
      for (const e of meta.edges) expect(EDGE_KINDS).toContain(e);
      expect(new Set(meta.edges).size).toBe(meta.edges.length);
    });

    it('documents researched competitors with concrete weaknesses', () => {
      expect(meta.competitors.length).toBeGreaterThan(0);
      for (const c of meta.competitors) {
        expect(c.url).toMatch(/^https:\/\//);
        expect(len(c.weakness), `${c.name} weakness too vague`).toBeGreaterThanOrEqual(30);
      }
    });

    it('links to related tools that exist', () => {
      const slugs = new Set(TOOL_DATA.map((t) => t.meta.slug));
      if (TOOL_DATA.length > 1) expect(meta.related.length).toBeGreaterThan(0);
      for (const r of meta.related) {
        expect(r).not.toBe(meta.slug);
        expect(slugs.has(r), `related "${r}" does not exist`).toBe(true);
      }
    });

    it('has valid dates', () => {
      expect(meta.added).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(meta.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(meta.updated >= meta.added).toBe(true);
    });

    for (const locale of LOCALES) {
      describe(`content [${locale}]`, () => {
        const c = content[locale];

        it('exists', () => expect(c).toBeDefined());

        it('has SEO title/description within limits', () => {
          expect(len(c.title)).toBeGreaterThanOrEqual(min(locale, 20));
          expect(len(c.title)).toBeLessThanOrEqual(70);
          expect(len(c.description)).toBeGreaterThanOrEqual(min(locale, 90));
          expect(len(c.description)).toBeLessThanOrEqual(170);
          expect(len(c.h1)).toBeLessThanOrEqual(60);
          expect(len(c.tagline)).toBeLessThanOrEqual(140);
        });

        it('has substantive how-to, sections and FAQ', () => {
          expect(c.howTo.length).toBeGreaterThanOrEqual(3);
          expect(c.howTo.length).toBeLessThanOrEqual(6);
          expect(c.sections.length).toBeGreaterThanOrEqual(2);
          for (const s of c.sections)
            expect(len(s.body), `section "${s.heading}"`).toBeGreaterThanOrEqual(min(locale, 200));
          expect(c.faq.length).toBeGreaterThanOrEqual(3);
          expect(c.faq.length).toBeLessThanOrEqual(8);
          for (const f of c.faq) {
            expect(f.q, 'FAQ q should be a real question').toContain('?');
            expect(len(f.a), `FAQ answer too short: ${f.q}`).toBeGreaterThanOrEqual(min(locale, 40));
          }
          expect(c.keywords.length).toBeGreaterThanOrEqual(3);
        });

        it('has the same UI keys as the default locale, all filled', () => {
          expect(Object.keys(c.ui).sort()).toEqual(Object.keys(content[LOCALES[0]].ui).sort());
          for (const [k, v] of Object.entries(c.ui)) expect(v.trim(), `ui.${k}`).not.toBe('');
        });

        it('contains no placeholders', () => {
          expect(JSON.stringify(c)).not.toMatch(PLACEHOLDER);
        });
      });
    }

    if (meta.variants?.length) {
      it('has valid, unique variants with distinct content', () => {
        const slugs = meta.variants!.map((v) => v.slug);
        expect(new Set(slugs).size).toBe(slugs.length);
        for (const v of meta.variants!) {
          expect(v.slug).toMatch(KEBAB);
          expect(Object.keys(v.preset).length, `${v.slug} preset must change the tool`).toBeGreaterThan(0);
          for (const locale of LOCALES) {
            const vc = v.content[locale];
            expect(vc, `${v.slug} [${locale}]`).toBeDefined();
            expect(vc.title).not.toBe(content[locale].title);
            expect(len(vc.description)).toBeLessThanOrEqual(170);
            expect(JSON.stringify(vc)).not.toMatch(PLACEHOLDER);
          }
        }
      });
    }
  });
}
