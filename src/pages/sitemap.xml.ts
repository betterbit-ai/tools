import type { APIRoute } from 'astro';
import { LOCALES, LOCALE_META, DEFAULT_LOCALE } from '../i18n/locales';
import { absoluteUrl, localePath } from '../lib/urls';
import { CATEGORY_IDS } from '../tools/categories';
import { TOOL_DATA } from '../tools/data';

/** Sitemap with hreflang alternates for every page in every locale. */
export const GET: APIRoute = () => {
  const pages: { segments: string[]; lastmod?: string }[] = [{ segments: [] }];
  for (const id of CATEGORY_IDS) {
    if (TOOL_DATA.some((d) => d.meta.category === id)) pages.push({ segments: ['c', id] });
  }
  for (const { meta } of TOOL_DATA) {
    pages.push({ segments: [meta.slug], lastmod: meta.updated });
    for (const v of meta.variants ?? []) pages.push({ segments: [meta.slug, v.slug], lastmod: meta.updated });
  }

  const urls = pages.flatMap(({ segments, lastmod }) =>
    LOCALES.map((locale) => {
      const alts = LOCALES.map(
        (l) =>
          `<xhtml:link rel="alternate" hreflang="${LOCALE_META[l].htmlLang}" href="${absoluteUrl(localePath(l, ...segments))}"/>`,
      ).join('');
      const xDefault = `<xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(localePath(DEFAULT_LOCALE, ...segments))}"/>`;
      return `<url><loc>${absoluteUrl(localePath(locale, ...segments))}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}${alts}${xDefault}</url>`;
    }),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
