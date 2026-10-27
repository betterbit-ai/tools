/** Local-only identifiers for the home page's recently used tools row. */
export const RECENT_TOOLS_STORAGE_KEY = 'betterbit.recent-tools';
export const RECENT_TOOLS_MAX = 8;

/**
 * Parses stored tool slugs defensively. Invalid values, duplicates, and stale
 * entries are discarded by the caller when it matches them to the tool index.
 */
export function parseRecentToolSlugs(value: string | null): string[] {
  try {
    const parsed: unknown = JSON.parse(value ?? '[]');
    if (!Array.isArray(parsed)) return [];

    const slugs: string[] = [];
    for (const item of parsed) {
      if (typeof item !== 'string' || slugs.includes(item)) continue;
      slugs.push(item);
      if (slugs.length === RECENT_TOOLS_MAX) break;
    }
    return slugs;
  } catch {
    return [];
  }
}

/** Put the opened tool first, retain unique prior tools, and enforce the cap. */
export function recordRecentTool(slugs: readonly string[], slug: string): string[] {
  return [slug, ...slugs.filter((item) => item !== slug)].slice(0, RECENT_TOOLS_MAX);
}
