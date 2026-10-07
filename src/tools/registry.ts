import { TOOL_DATA } from './data';
import type { ToolModule } from './types';
import type { CategoryId } from './categories';

/**
 * Full tool modules for page rendering: data + the hydrating Island.astro.
 * A tool exists once its folder has meta.ts, content.ts, Island.astro and Tool.tsx —
 * no manual registration.
 */
const islands = import.meta.glob<{ default: ToolModule['Island'] }>('./*/Island.astro', {
  eager: true,
});

export const TOOLS: ToolModule[] = TOOL_DATA.map((data) => {
  const Island = islands[`./${data.meta.slug}/Island.astro`]?.default;
  if (!Island) throw new Error(`Tool "${data.meta.slug}" is missing Island.astro.`);
  return { ...data, Island };
});

export function getTool(slug: string): ToolModule | undefined {
  return TOOLS.find((t) => t.meta.slug === slug);
}

export function toolsInCategory(category: CategoryId): ToolModule[] {
  return TOOLS.filter((t) => t.meta.category === category);
}
