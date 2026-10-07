import type { ToolContent, ToolMeta } from './types';
import type { CategoryId } from './categories';
import type { Locale } from '../i18n/locales';

/**
 * Data-only view of every tool (meta + content), auto-discovered from
 * src/tools/<slug>/{meta.ts,content.ts}. No .astro/.tsx imports, so tests can use it.
 */
export interface ToolData {
  meta: ToolMeta;
  content: Record<Locale, ToolContent>;
}

const metas = import.meta.glob<{ meta: ToolMeta }>('./*/meta.ts', { eager: true });
const contents = import.meta.glob<{ content: Record<Locale, ToolContent> }>('./*/content.ts', {
  eager: true,
});

export const TOOL_DATA: ToolData[] = Object.entries(metas)
  .map(([path, mod]) => {
    const folder = path.split('/')[1];
    const content = contents[`./${folder}/content.ts`]?.content;
    if (!content) throw new Error(`Tool "${folder}" is missing content.ts.`);
    if (mod.meta.slug !== folder) {
      throw new Error(`Tool folder "${folder}" does not match meta.slug "${mod.meta.slug}".`);
    }
    return { meta: mod.meta, content };
  })
  .sort((a, b) => a.meta.slug.localeCompare(b.meta.slug));

export function getToolData(slug: string): ToolData | undefined {
  return TOOL_DATA.find((t) => t.meta.slug === slug);
}

export function toolDataInCategory(category: CategoryId): ToolData[] {
  return TOOL_DATA.filter((t) => t.meta.category === category);
}
