import type { Locale } from '../i18n/locales';
import { CATEGORY_IDS, type CategoryId } from './categories';
import type { ToolData } from './data';
import { POPULAR_SLUGS } from './popular';

/**
 * Pure helpers behind the home page so it scales to hundreds of tools without
 * rendering hundreds of cards. Kept free of Astro/DOM so tests/home.test.ts can
 * simulate a large registry cheaply.
 */

/** Tools shown per category section on the home page before "View all N →". */
export const HOME_CATEGORY_PREVIEW = 8;

/** Curated row, in `POPULAR_SLUGS` order. Slugs that don't exist (yet) are skipped. */
export function popularTools(tools: ToolData[]): ToolData[] {
  const bySlug = new Map(tools.map((t) => [t.meta.slug, t]));
  return POPULAR_SLUGS.map((slug) => bySlug.get(slug)).filter((t): t is ToolData => t !== undefined);
}

export interface HomeCategorySection {
  id: CategoryId;
  preview: ToolData[];
  total: number;
}

/** One section per non-empty category, each capped at `HOME_CATEGORY_PREVIEW`. */
export function homeCategorySections(tools: ToolData[]): HomeCategorySection[] {
  return CATEGORY_IDS.map((id) => {
    const inCategory = tools.filter((t) => t.meta.category === id);
    return { id, preview: inCategory.slice(0, HOME_CATEGORY_PREVIEW), total: inCategory.length };
  }).filter((section) => section.total > 0);
}

/** Alphabetical by localized display name — used on the category hub. */
export function sortByLocalizedName(tools: ToolData[], locale: Locale): ToolData[] {
  return [...tools].sort((a, b) => a.content[locale].name.localeCompare(b.content[locale].name, locale));
}
