/**
 * Home/category scaling (issue #2): the home page must stay fast and bounded
 * no matter how many tools the registry holds. These tests exercise the pure
 * helpers behind the page with both the real registry and a simulated
 * 500-tool registry, so a regression here fails before 500 tools ever ship.
 */
import { describe, expect, it } from 'vitest';
import { LOCALES, type Locale } from '../src/i18n/locales';
import { buildSearchIndex } from '../src/lib/searchIndex';
import { CATEGORY_IDS, type CategoryId } from '../src/tools/categories';
import type { ToolData } from '../src/tools/data';
import { TOOL_DATA } from '../src/tools/data';
import { HOME_CATEGORY_PREVIEW, homeCategorySections, popularTools, sortByLocalizedName } from '../src/tools/home';
import { POPULAR_SLUGS } from '../src/tools/popular';
import type { ToolContent } from '../src/tools/types';

describe('popular row', () => {
  it('has at most 12 curated, unique slugs that exist in the registry', () => {
    expect(POPULAR_SLUGS.length).toBeLessThanOrEqual(12);
    expect(new Set(POPULAR_SLUGS).size).toBe(POPULAR_SLUGS.length);
    const slugs = new Set(TOOL_DATA.map((t) => t.meta.slug));
    for (const slug of POPULAR_SLUGS) expect(slugs.has(slug), `popular slug "${slug}" does not exist`).toBe(true);
  });
});

describe('home category sections (real registry)', () => {
  it('shows every non-empty category, capped at the preview limit', () => {
    const sections = homeCategorySections(TOOL_DATA);
    for (const id of CATEGORY_IDS) {
      const total = TOOL_DATA.filter((t) => t.meta.category === id).length;
      const section = sections.find((s) => s.id === id);
      if (total === 0) {
        expect(section).toBeUndefined();
      } else {
        expect(section, `category "${id}" missing from home`).toBeDefined();
        expect(section!.total).toBe(total);
        expect(section!.preview.length).toBe(Math.min(total, HOME_CATEGORY_PREVIEW));
      }
    }
  });
});

describe('category hub sorting', () => {
  it('sorts tools alphabetically by localized name', () => {
    for (const locale of LOCALES) {
      const sorted = sortByLocalizedName(TOOL_DATA, locale);
      const names = sorted.map((t) => t.content[locale].name);
      const expected = [...names].sort((a, b) => a.localeCompare(b, locale));
      expect(names).toEqual(expected);
    }
  });
});

/** Builds a synthetic tool so the scale tests don't need 500 real tool folders. */
function fakeTool(index: number, category: CategoryId): ToolData {
  const content = Object.fromEntries(
    LOCALES.map((locale) => {
      const c: ToolContent = {
        title: `Fake Tool ${index} — simulated for scale testing`,
        description: `Simulated tool #${index} used only to test that the home page stays bounded at scale.`,
        h1: `Fake Tool ${index}`,
        tagline: `Simulated tool number ${index} for scale testing.`,
        name: `Fake Tool ${index}`,
        keywords: [`fake tool ${index}`, `simulated ${index}`, category],
        howTo: ['Open the tool.', 'Do the simulated thing.', 'See the simulated result.'],
        sections: [{ heading: 'About', body: 'x'.repeat(220) }],
        faq: [{ q: `What is fake tool ${index}?`, a: 'A synthetic tool used only to test home page scaling.' }],
        ui: {},
      };
      return [locale, c];
    }),
  ) as Record<Locale, ToolContent>;

  return {
    meta: {
      slug: `fake-tool-${index}`,
      category,
      icon: 'zap',
      added: '2026-01-01',
      updated: '2026-01-01',
      edges: ['performance'],
      competitors: [{ name: 'Fake Competitor', url: 'https://example.com', weakness: 'x'.repeat(30) }],
      related: [],
    },
    content,
  };
}

describe('scale: simulated 500-tool registry', () => {
  const simulated: ToolData[] = Array.from({ length: 500 }, (_, i) =>
    fakeTool(i, CATEGORY_IDS[i % CATEGORY_IDS.length]),
  );

  it('has one section per category, each capped at the preview limit', () => {
    const sections = homeCategorySections(simulated);
    expect(sections.length).toBe(CATEGORY_IDS.length);
    for (const section of sections) {
      expect(section.preview.length).toBeLessThanOrEqual(HOME_CATEGORY_PREVIEW);
      expect(section.total).toBeGreaterThan(HOME_CATEGORY_PREVIEW);
    }
  });

  it('popular row stays capped even if every slug matched', () => {
    expect(popularTools(simulated).length).toBeLessThanOrEqual(12);
  });

  it('search index covers all 500 tools but stays small enough to inline per page', () => {
    for (const locale of LOCALES) {
      const index = buildSearchIndex(simulated, locale);
      expect(index.length).toBe(500);
      const bytes = Buffer.byteLength(JSON.stringify(index));
      expect(bytes, `search index for "${locale}" too large to inline`).toBeLessThan(150 * 1024);
    }
  });
});
