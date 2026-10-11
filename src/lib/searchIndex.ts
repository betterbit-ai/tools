import { DEFAULT_LOCALE, type Locale } from '../i18n/locales';
import type { ToolData } from '../tools/data';
import { localePath } from './urls';

/**
 * Small, inlineable search index for the home page's instant client-side
 * search. Built at build time from every tool — not just the ones rendered
 * in the "Popular"/category previews — so search still finds a tool even
 * when the registry is far bigger than what fits on the page.
 */
export interface SearchIndexEntry {
  url: string;
  icon: string;
  name: string;
  /** Lowercased name + h1 + keywords for this locale, plus English keywords, for substring matching. */
  haystack: string;
}

export function buildSearchIndex(tools: ToolData[], locale: Locale): SearchIndexEntry[] {
  return tools.map(({ meta, content }) => {
    const c = content[locale];
    const terms = [c.name, c.h1, ...c.keywords];
    if (locale !== DEFAULT_LOCALE) terms.push(...content[DEFAULT_LOCALE].keywords);
    return {
      url: localePath(locale, meta.slug),
      icon: meta.icon,
      name: c.name,
      haystack: terms.join(' ').toLowerCase(),
    };
  });
}
