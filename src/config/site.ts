/**
 * Site-wide constants. Change SITE_URL once the production domain is decided;
 * canonical URLs, hreflang, sitemap and JSON-LD all derive from it.
 */
// Temporary: the workers.dev URL until a custom domain is attached in Cloudflare.
export const SITE_URL = process.env.SITE_URL ?? 'https://tools.joel610.workers.dev';

export const SITE_NAME = 'Betterbit Tools';

/** Shown in JSON-LD `publisher` / `author`. */
export const ORG_NAME = 'Betterbit';
