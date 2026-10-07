import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/urls';

/** AI crawlers are explicitly welcome — being cited by LLMs is a growth channel (GEO). */
export const GET: APIRoute = () =>
  new Response(
    `User-agent: *
Allow: /

Sitemap: ${absoluteUrl('/sitemap.xml')}
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
