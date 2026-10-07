import type { APIRoute } from 'astro';
import { SITE_NAME } from '../config/site';
import { DEFAULT_LOCALE } from '../i18n/locales';
import { t } from '../i18n/ui';
import { absoluteUrl, localePath } from '../lib/urls';
import { CATEGORIES, CATEGORY_IDS } from '../tools/categories';
import { TOOL_DATA } from '../tools/data';

/**
 * llms.txt (https://llmstxt.org) — a plain index that helps LLM assistants
 * understand and cite the site. Generated from the registry, never hand-edited.
 */
export const GET: APIRoute = () => {
  const L = DEFAULT_LOCALE;
  const lines: string[] = [`# ${SITE_NAME}`, '', `> ${t(L, 'site.description')}`, ''];
  for (const id of CATEGORY_IDS) {
    const tools = TOOL_DATA.filter((d) => d.meta.category === id);
    if (!tools.length) continue;
    lines.push(`## ${CATEGORIES[id].name[L]}`, '');
    for (const { meta, content } of tools) {
      lines.push(`- [${content[L].name}](${absoluteUrl(localePath(L, meta.slug))}): ${content[L].description}`);
    }
    lines.push('');
  }
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
